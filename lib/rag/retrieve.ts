import { GoogleGenAI } from "@google/genai";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { codeCitationId, githubBlobUrl } from "./code/citation.ts";
import { isCodeRepo, type CodeRepo } from "./code/repos.ts";
import { embedQuery, toVectorLiteral } from "./embed.ts";
import { reciprocalRankFusion } from "./rrf.ts";

/* ============================================================================
   CODE RETRIEVAL — hybrid search over the ingested public repositories.

   A question becomes one query embedding (RETRIEVAL_QUERY), then ONE HTTP
   round trip to Neon carrying a read-only transaction:

     SET LOCAL hnsw.ef_search = 40    scoped to this transaction
     vector top 20                    ORDER BY embedding <=> $1 LIMIT 20
     keyword top 20                   websearch_to_tsquery('simple', $1), ts_rank_cd

   The settings have to travel inside the transaction: the HTTP driver keeps no
   session between requests, so a bare `SET` would be forgotten before the
   query ran. The vector query carries no distance threshold in WHERE —
   `ORDER BY distance LIMIT n` is the shape the HNSW index can serve. The two
   lists are fused with RRF (./rrf.ts) into the top 8.

   With a repo filter, HNSW filters after the index scan and could come back
   short of 20. `hnsw.iterative_scan = strict_order` (pgvector ≥ 0.8.0, which
   scripts/migrate.mts checks) keeps scanning until the list is full.

   Server-only: it reads DATABASE_URL, and the browser never talks to Neon.
   ========================================================================== */

export const RETRIEVAL = {
  /** Candidates from each of the vector and keyword searches. */
  candidates: 20,
  /** Fused results handed to the model. */
  results: 8,
  efSearch: 40,
  /** Query embedding plus Neon, including a cold compute waking up. */
  timeoutMs: 10_000,
} as const;

export interface CodeSearchResult {
  /** `<repo>/<path>#L<start>-L<end>` */
  id: string;
  /** The opaque id the model cites as `[cite:code/…]`. */
  citationId: string;
  repo: CodeRepo;
  path: string;
  startLine: number;
  endLine: number;
  sha: string;
  content: string;
  /** Pinned GitHub URL, built here — never by the model or the browser. */
  url: string;
}

export interface RankedCodeResult extends CodeSearchResult {
  score: number;
  vectorRank: number | null;
  keywordRank: number | null;
}

type Sql = NeonQueryFunction<false, false>;

export interface SearchOptions {
  repo?: CodeRepo;
  signal?: AbortSignal;
  /** Evaluation only: bypass the HNSW index with an exact scan. */
  exactScan?: boolean;
  /** Injectable for tests and scripts; the defaults read DATABASE_URL and GEMINI_API_KEY. */
  sql?: Sql;
  embed?: (query: string, signal: AbortSignal) => Promise<number[]>;
}

/** Code search needs both the database and the embedding model. */
export const isCodeSearchConfigured = (env: Record<string, string | undefined> = process.env) =>
  Boolean(env.DATABASE_URL?.trim() && env.GEMINI_API_KEY?.trim());

let sharedSql: Sql | null = null;

function defaultSql(): Sql {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) throw new Error("DATABASE_URL is not set");
  return (sharedSql ??= neon(url));
}

let sharedAi: { apiKey: string; ai: GoogleGenAI } | null = null;

function defaultEmbed(query: string, signal: AbortSignal): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  if (sharedAi?.apiKey !== apiKey) sharedAi = { apiKey, ai: new GoogleGenAI({ apiKey }) };
  return embedQuery(sharedAi.ai, query, { signal, timeoutMs: RETRIEVAL.timeoutMs });
}

/** Both candidate lists, before fusion — what the evaluation compares. */
export async function searchCandidates(
  query: string,
  options: SearchOptions = {},
): Promise<{ vector: CodeSearchResult[]; keyword: CodeSearchResult[] }> {
  const { repo, exactScan = false } = options;
  if (repo !== undefined && !isCodeRepo(repo)) throw new Error(`Unknown code repository: ${String(repo)}`);

  const signal = options.signal
    ? AbortSignal.any([options.signal, AbortSignal.timeout(RETRIEVAL.timeoutMs)])
    : AbortSignal.timeout(RETRIEVAL.timeoutMs);
  const sql = options.sql ?? defaultSql();
  const vector = toVectorLiteral(await (options.embed ?? defaultEmbed)(query, signal));

  const results = await sql.transaction(
    (tx) => [
      tx`SET LOCAL hnsw.ef_search = 40`,
      ...(repo ? [tx`SET LOCAL hnsw.iterative_scan = strict_order`] : []),
      ...(exactScan ? [tx`SET LOCAL enable_indexscan = off`] : []),
      repo
        ? tx`SELECT id, repo, path, start_line, end_line, commit_sha, content
             FROM code_chunks
             WHERE repo = ${repo}
             ORDER BY embedding <=> ${vector}::vector
             LIMIT 20`
        : tx`SELECT id, repo, path, start_line, end_line, commit_sha, content
             FROM code_chunks
             ORDER BY embedding <=> ${vector}::vector
             LIMIT 20`,
      repo
        ? tx`SELECT id, repo, path, start_line, end_line, commit_sha, content
             FROM code_chunks, websearch_to_tsquery('simple', ${query}) AS q
             WHERE tsv @@ q AND repo = ${repo}
             ORDER BY ts_rank_cd(tsv, q) DESC, id
             LIMIT 20`
        : tx`SELECT id, repo, path, start_line, end_line, commit_sha, content
             FROM code_chunks, websearch_to_tsquery('simple', ${query}) AS q
             WHERE tsv @@ q
             ORDER BY ts_rank_cd(tsv, q) DESC, id
             LIMIT 20`,
    ],
    { readOnly: true, fetchOptions: { signal } },
  );

  const [vectorRows, keywordRows] = results.slice(-2);
  return { vector: toResults(vectorRows), keyword: toResults(keywordRows) };
}

/** The top 8 code chunks for `query`: vector and keyword search, fused with RRF. */
export async function retrieve(query: string, options: SearchOptions = {}): Promise<RankedCodeResult[]> {
  const { vector, keyword } = await searchCandidates(query, options);
  return fuse(vector, keyword);
}

export function fuse(
  vector: readonly CodeSearchResult[],
  keyword: readonly CodeSearchResult[],
  limit: number = RETRIEVAL.results,
): RankedCodeResult[] {
  return reciprocalRankFusion([vector, keyword], (result) => result.id, { limit }).map(({ item, score, ranks }) => ({
    ...item,
    score,
    vectorRank: ranks[0],
    keywordRank: ranks[1],
  }));
}

/** Validates rows before they can reach the model or become a link. */
function toResults(rows: readonly Record<string, unknown>[] | undefined): CodeSearchResult[] {
  const results: CodeSearchResult[] = [];
  let dropped = 0;

  for (const row of rows ?? []) {
    const { id, repo, path, start_line, end_line, commit_sha, content } = row;
    if (
      typeof id !== "string" ||
      !isCodeRepo(repo) ||
      typeof path !== "string" ||
      typeof commit_sha !== "string" ||
      typeof content !== "string" ||
      !Number.isInteger(start_line) ||
      !Number.isInteger(end_line)
    ) {
      dropped++;
      continue;
    }
    try {
      const location = { repo, path, sha: commit_sha, startLine: start_line as number, endLine: end_line as number };
      results.push({ id, citationId: codeCitationId(id), ...location, content, url: githubBlobUrl(location) });
    } catch {
      dropped++;
    }
  }

  if (dropped > 0) console.warn(`[retrieve] dropped ${dropped} malformed row(s)`);
  return results;
}
