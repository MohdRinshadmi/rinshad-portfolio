import { ApiError, type GoogleGenAI } from "@google/genai";
import { describe, expect, it, vi } from "vitest";
import { EMBEDDING_BATCH_SIZE, embedDocuments, embedQuery, toVectorLiteral } from "./embed";

/* The Gemini client is replaced with a stub: these tests pin what is asked of
   the API and how failures are handled, never the network. */

const vector = (length = 768, value = 0.1) => Array.from({ length }, () => value);

function fakeAi(implementation: (params: { contents: string[] }) => unknown) {
  const embedContent = vi.fn(async (params: { contents: string[] }) => implementation(params));
  return { ai: { models: { embedContent } } as unknown as GoogleGenAI, embedContent };
}

const ok = ({ contents }: { contents: string[] }) => ({ embeddings: contents.map(() => ({ values: vector() })) });
const quota = () => new ApiError({ message: "quota exceeded", status: 429 });

describe("embedding requests", () => {
  it("embeds chunks as RETRIEVAL_DOCUMENT at 768 dimensions", async () => {
    const { ai, embedContent } = fakeAi(ok);
    const vectors = await embedDocuments(ai, ["a", "b"]);

    expect(vectors).toHaveLength(2);
    expect(embedContent).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gemini-embedding-001",
        contents: ["a", "b"],
        config: expect.objectContaining({ taskType: "RETRIEVAL_DOCUMENT", outputDimensionality: 768 }),
      }),
    );
  });

  it("embeds a question as RETRIEVAL_QUERY — not the document task type", async () => {
    const { ai, embedContent } = fakeAi(ok);
    const signal = new AbortController().signal;
    await embedQuery(ai, "how are refresh tokens rotated?", { signal, timeoutMs: 8_000 });

    const [{ config }] = embedContent.mock.calls[0] as unknown as [{ config: Record<string, unknown> }];
    expect(config).toMatchObject({ taskType: "RETRIEVAL_QUERY", outputDimensionality: 768, abortSignal: signal });
    expect(config.httpOptions).toEqual({ timeout: 8_000 });
  });

  it("rejects a response with the wrong count or dimension", async () => {
    await expect(embedDocuments(fakeAi(() => ({ embeddings: [{ values: vector() }] })).ai, ["a", "b"])).rejects.toThrow(
      /Expected 2 embeddings/,
    );
    await expect(embedQuery(fakeAi(() => ({ embeddings: [{ values: vector(3072) }] })).ai, "q")).rejects.toThrow(
      /768-dimension/,
    );
  });

  it("refuses a batch larger than 50", async () => {
    const texts = Array.from({ length: EMBEDDING_BATCH_SIZE + 1 }, () => "x");
    await expect(embedDocuments(fakeAi(ok).ai, texts)).rejects.toThrow(/At most 50/);
  });
});

describe("backoff", () => {
  it("retries a 429 with exponential backoff, then succeeds", async () => {
    let calls = 0;
    const { ai } = fakeAi((params) => {
      calls++;
      if (calls <= 2) throw quota();
      return ok(params);
    });
    const sleep = vi.fn<(ms: number) => Promise<void>>(async () => {});
    const onRetry = vi.fn();

    await expect(embedDocuments(ai, ["a"], { sleep, onRetry })).resolves.toHaveLength(1);
    expect(sleep.mock.calls.map(([ms]) => ms)).toEqual([2_000, 4_000]);
    expect(onRetry).toHaveBeenNthCalledWith(1, 1, 2_000, 429);
  });

  it("gives up after a bounded number of attempts", async () => {
    const { ai, embedContent } = fakeAi(() => {
      throw quota();
    });
    const sleep = vi.fn<(ms: number) => Promise<void>>(async () => {});

    await expect(embedDocuments(ai, ["a"], { attempts: 3, sleep })).rejects.toBeInstanceOf(ApiError);
    expect(embedContent).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenCalledTimes(2);
  });

  it("caps the delay", async () => {
    const { ai } = fakeAi(() => {
      throw quota();
    });
    const sleep = vi.fn<(ms: number) => Promise<void>>(async () => {});
    await embedDocuments(ai, ["a"], { attempts: 5, baseDelayMs: 10_000, maxDelayMs: 25_000, sleep }).catch(() => {});
    expect(sleep.mock.calls.map(([ms]) => ms)).toEqual([10_000, 20_000, 25_000, 25_000]);
  });

  it("does not retry a request that can never succeed", async () => {
    const { ai, embedContent } = fakeAi(() => {
      throw new ApiError({ message: "bad request", status: 400 });
    });
    const sleep = vi.fn<(ms: number) => Promise<void>>(async () => {});
    await expect(embedDocuments(ai, ["a"], { sleep })).rejects.toThrow(/bad request/);
    expect(embedContent).toHaveBeenCalledTimes(1);
    expect(sleep).not.toHaveBeenCalled();
  });
});

describe("toVectorLiteral", () => {
  it("renders pgvector's text form", () => {
    expect(toVectorLiteral([0.5, -1, 2e-7])).toBe("[0.5,-1,2e-7]");
  });
});
