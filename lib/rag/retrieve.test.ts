import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/* The Neon driver is mocked: no database. The fake `sql.transaction` records
   exactly which statements travel together, which is the property that
   matters — `SET LOCAL` only works inside the same transaction as the query. */
const transaction = vi.hoisted(() => vi.fn());
vi.mock("@neondatabase/serverless", () => ({ neon: vi.fn(() => ({ transaction })) }));

const { RETRIEVAL, retrieve, searchCandidates } = await import("./retrieve");

interface Recorded {
  text: string;
  values: unknown[];
}

const tx = (strings: TemplateStringsArray, ...values: unknown[]): Recorded => ({
  text: strings.join("$?").replace(/\s+/g, " ").trim(),
  values,
});

const SHA = "7ece27995302d3d64ac34f06f13854c3a5e1e208";
const row = (repo: string, path: string, start = 1, end = 60, overrides: Record<string, unknown> = {}) => ({
  id: `${repo}/${path}#L${start}-L${end}`,
  repo,
  path,
  start_line: start,
  end_line: end,
  commit_sha: SHA,
  content: `${repo}/${path} (lines ${start}–${end})\n\ncode`,
  ...overrides,
});

function respondWith(vectorRows: unknown[], keywordRows: unknown[]) {
  const calls: { queries: Recorded[]; options: Record<string, unknown> }[] = [];
  transaction.mockImplementation(async (build: (t: typeof tx) => Recorded[], options: Record<string, unknown>) => {
    const queries = build(tx);
    calls.push({ queries, options });
    return queries.map((q) => (q.text.startsWith("SET") ? [] : q.text.includes("<=>") ? vectorRows : keywordRows));
  });
  return calls;
}

const embedding = Array.from({ length: 768 }, (_, i) => i / 768);
const embed = vi.fn(async () => embedding);
const selects = (queries: Recorded[]) => queries.filter((q) => q.text.startsWith("SELECT"));

beforeEach(() => {
  vi.stubEnv("DATABASE_URL", "postgresql://neon.example/portfolio");
  transaction.mockReset();
  embed.mockClear();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("retrieve", () => {
  it("sends SET LOCAL, the vector search and the keyword search in one transaction — one HTTP round trip", async () => {
    const calls = respondWith([row("ai-life-assistant", "a.ts")], [row("ai-life-assistant", "b.ts")]);
    await retrieve("jwt refresh rotation", { embed });

    expect(transaction).toHaveBeenCalledTimes(1);
    const [{ queries, options }] = calls;
    expect(queries[0].text).toBe("SET LOCAL hnsw.ef_search = 40");
    expect(queries).toHaveLength(3);
    expect(options).toMatchObject({ readOnly: true, fetchOptions: { signal: expect.any(AbortSignal) } });
    expect(RETRIEVAL).toMatchObject({ candidates: 20, results: 8, efSearch: 40 });
  });

  it("orders the vector search by cosine distance with no threshold in WHERE", async () => {
    const calls = respondWith([], []);
    await retrieve("jwt refresh rotation", { embed });

    const [vector] = selects(calls[0].queries);
    expect(vector.text).toContain("ORDER BY embedding <=> $?::vector LIMIT 20");
    expect(vector.text.split("ORDER BY")[0]).not.toContain("<=>");
    expect(vector.text).not.toContain("WHERE");

    const literal = vector.values[0] as string;
    expect(literal).toMatch(/^\[.+\]$/);
    expect(literal.slice(1, -1).split(",")).toHaveLength(768);
    expect(embed).toHaveBeenCalledWith("jwt refresh rotation", expect.any(AbortSignal));
  });

  it("runs a 'simple' full-text search ranked by ts_rank_cd, with the question as a parameter", async () => {
    const calls = respondWith([], []);
    await retrieve("refreshAccessToken", { embed });

    const [, keyword] = selects(calls[0].queries);
    expect(keyword.text).toContain("websearch_to_tsquery('simple', $?)");
    expect(keyword.text).toContain("ORDER BY ts_rank_cd(tsv, q) DESC, id LIMIT 20");
    expect(keyword.values).toEqual(["refreshAccessToken"]);
    expect(keyword.text).not.toContain("refreshAccessToken");
  });

  it("fuses the top 20 of each list into a top 8 with pinned citations", async () => {
    const vectorRows = Array.from({ length: 20 }, (_, i) => row("ai-real-time-collaboration", `v${i}.ts`));
    const keywordRows = [vectorRows[5], ...Array.from({ length: 19 }, (_, i) => row("ai-life-assistant", `k${i}.ts`))];
    respondWith(vectorRows, keywordRows);

    const results = await retrieve("socket fan-out", { embed });

    expect(results).toHaveLength(8);
    expect(results[0]).toMatchObject({ path: "v5.ts", vectorRank: 6, keywordRank: 1 });
    for (const result of results) {
      expect(result.url).toBe(`https://github.com/MohdRinshadmi/${result.repo}/blob/${SHA}/${result.path}#L1-L60`);
      expect(result.citationId).toMatch(/^code\/[0-9a-f]{12}$/);
      expect(result).toMatchObject({ sha: SHA, startLine: 1, endLine: 60 });
    }
  });

  it("filters by repository with an iterative HNSW scan, inside the same transaction", async () => {
    const calls = respondWith([], []);
    await retrieve("pub/sub", { embed, repo: "ai-real-time-collaboration" });

    const { queries } = calls[0];
    expect(queries.map((q) => q.text).slice(0, 2)).toEqual([
      "SET LOCAL hnsw.ef_search = 40",
      "SET LOCAL hnsw.iterative_scan = strict_order",
    ]);
    const [vector, keyword] = selects(queries);
    expect(vector.text).toContain("WHERE repo = $? ORDER BY embedding <=> $?::vector LIMIT 20");
    expect(vector.values[0]).toBe("ai-real-time-collaboration");
    expect(keyword.text).toContain("WHERE tsv @@ q AND repo = $?");
  });

  it("refuses an unknown repository before touching the database", async () => {
    respondWith([], []);
    await expect(retrieve("x", { embed, repo: "private-repo" as never })).rejects.toThrow(/Unknown code repository/);
    expect(transaction).not.toHaveBeenCalled();
    expect(embed).not.toHaveBeenCalled();
  });

  it("disables index scans for an exact-scan comparison, in the same transaction", async () => {
    const calls = respondWith([], []);
    await searchCandidates("x", { embed, exactScan: true });
    expect(calls[0].queries.map((q) => q.text)).toContain("SET LOCAL enable_indexscan = off");
  });

  it("drops malformed rows instead of passing them to the model", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    respondWith(
      [
        row("ai-life-assistant", "good.ts"),
        row("ai-life-assistant", "bad-sha.ts", 1, 60, { commit_sha: "main" }),
        row("private-repo", "x.ts"),
        row("ai-life-assistant", "bad-lines.ts", 1, 60, { start_line: "1" }),
      ],
      [],
    );
    const results = await retrieve("x", { embed });

    expect(results.map((r) => r.path)).toEqual(["good.ts"]);
    expect(warn).toHaveBeenCalledWith("[retrieve] dropped 3 malformed row(s)");
  });

  it("fails fast when DATABASE_URL is missing", async () => {
    vi.stubEnv("DATABASE_URL", "");
    await expect(retrieve("x", { embed })).rejects.toThrow(/DATABASE_URL/);
    expect(transaction).not.toHaveBeenCalled();
  });
});
