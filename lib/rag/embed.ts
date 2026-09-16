import { ApiError, type GoogleGenAI } from "@google/genai";

/* ============================================================================
   EMBEDDINGS — Gemini text embeddings at 768 dimensions.

   Retrieval is asymmetric on purpose: chunks are embedded as
   RETRIEVAL_DOCUMENT and questions as RETRIEVAL_QUERY. The model places a
   question near the documents that answer it, not near other questions.

   Vectors are stored exactly as returned — no normalisation. The HNSW index
   uses vector_cosine_ops, and cosine distance ignores magnitude anyway.
   ========================================================================== */

export const EMBEDDING_MODEL = "gemini-embedding-001";
export const EMBEDDING_DIMENSIONS = 768;
/** Chunks per embedContent call during ingestion. */
export const EMBEDDING_BATCH_SIZE = 50;

export type EmbeddingTask = "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY";

interface RequestOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}

export interface RetryOptions {
  /** Total tries, including the first. Bounded — never an infinite loop. */
  attempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  sleep?: (ms: number) => Promise<void>;
  onRetry?: (attempt: number, delayMs: number, status: number) => void;
}

/** Rate limited or transiently unavailable — worth waiting for. */
const RETRYABLE_STATUS = new Set([429, 500, 503]);

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function embed(
  ai: GoogleGenAI,
  texts: string[],
  taskType: EmbeddingTask,
  { signal, timeoutMs }: RequestOptions,
): Promise<number[][]> {
  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: texts,
    config: {
      taskType,
      outputDimensionality: EMBEDDING_DIMENSIONS,
      abortSignal: signal,
      ...(timeoutMs ? { httpOptions: { timeout: timeoutMs } } : {}),
    },
  });

  const vectors = response.embeddings?.map((embedding) => embedding.values) ?? [];
  if (vectors.length !== texts.length) {
    throw new Error(`Expected ${texts.length} embeddings, received ${vectors.length}`);
  }
  return vectors.map((values, index) => {
    if (!values || values.length !== EMBEDDING_DIMENSIONS || !values.every(Number.isFinite)) {
      throw new Error(`Embedding ${index} is not a ${EMBEDDING_DIMENSIONS}-dimension vector`);
    }
    return values;
  });
}

/** One question, embedded for search. No retries: a user is waiting. */
export async function embedQuery(ai: GoogleGenAI, text: string, options: RequestOptions = {}): Promise<number[]> {
  const [vector] = await embed(ai, [text], "RETRIEVAL_QUERY", options);
  return vector;
}

/**
 * One ingestion batch of up to 50 chunks, retried with exponential backoff
 * when the API is rate limiting (429) or briefly unavailable (500/503).
 */
export async function embedDocuments(
  ai: GoogleGenAI,
  texts: string[],
  options: RequestOptions & RetryOptions = {},
): Promise<number[][]> {
  if (texts.length > EMBEDDING_BATCH_SIZE) {
    throw new Error(`At most ${EMBEDDING_BATCH_SIZE} texts per embedding batch, got ${texts.length}`);
  }
  const { attempts = 6, baseDelayMs = 2_000, maxDelayMs = 60_000, sleep = wait, onRetry } = options;

  for (let attempt = 1; ; attempt++) {
    try {
      return await embed(ai, texts, "RETRIEVAL_DOCUMENT", options);
    } catch (err) {
      const status = err instanceof ApiError ? err.status : 0;
      // A daily cap won't lift within a backoff, so retrying only wastes attempts.
      if (!RETRYABLE_STATUS.has(status) || isDailyQuotaError(err) || attempt >= attempts) throw err;
      const delay = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1));
      onRetry?.(attempt, delay, status);
      await sleep(delay);
    }
  }
}

/** The free tier's per-day cap (quota id "…PerDay…"), as opposed to a
    per-minute rate limit that a short backoff can wait out. */
export function isDailyQuotaError(err: unknown): boolean {
  return err instanceof ApiError && err.status === 429 && /PerDay/i.test(err.message);
}

/** pgvector's text input form, e.g. `[0.1,0.2,…]`. */
export const toVectorLiteral = (values: readonly number[]) => `[${values.join(",")}]`;
