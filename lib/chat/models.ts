import {
  ApiError,
  ThinkingLevel,
  type Content,
  type GenerateContentConfig,
  type GenerateContentResponse,
  type GoogleGenAI,
  type ThinkingConfig,
} from "@google/genai";
import { isDailyQuotaError } from "@/lib/rag/embed";

/* ============================================================================
   CHAT MODELS — one answer, several free-tier quotas.

   The Gemini free tier meters each model separately (per project, per model:
   requests a minute, input tokens a minute, requests a day). The Flash models
   allow about 20 requests a day; the Flash-Lite models about 500 each. One
   question is one to five requests, so a single Flash model runs dry after a
   handful of visitors. The assistant therefore walks a chain, cheapest quota
   first, and moves to the next model when one is out:

     gemini-3.5-flash-lite → gemini-3.1-flash-lite → gemini-3.6-flash

   A model that answered 429 is benched until its quota comes back — the
   retry delay Google sends for a per-minute limit, the next midnight Pacific
   for a per-day one — so later questions skip it without a wasted round trip.
   The bench is per warm instance, like the rate limiter: a cold instance pays
   one 429 per spent model to relearn it, which costs latency, not quota.

   Probed against the live API (Sept 2026), not assumed:
   - Flash-Lite 3.5 rejects `thinkingBudget: 0` (400) and accepts
     `thinkingLevel: MINIMAL`; Flash 3.6 accepts the budget. Hence per model.
   - A turn can switch models mid-answer: 3.1 accepts a function call carrying
     3.5's thought signature.
   - Gemma 4 is left out: its free tier allows 16,000 input tokens a minute,
     and the site corpus alone is ~15k per request.
   ========================================================================== */

export interface ChatModel {
  id: string;
  thinkingConfig: ThinkingConfig;
}

export const CHAT_MODELS: readonly ChatModel[] = [
  { id: "gemini-3.5-flash-lite", thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL } },
  { id: "gemini-3.1-flash-lite", thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL } },
  { id: "gemini-3.6-flash", thinkingConfig: { thinkingBudget: 0 } },
];

export interface TurnRequest {
  contents: Content[];
  config: GenerateContentConfig;
}

export type TurnStream = AsyncGenerator<GenerateContentResponse>;

/** Every model in the chain is benched on a quota: nothing to call until one comes back. */
export class QuotaExhaustedError extends Error {
  name = "QuotaExhaustedError";
}

export interface ModelPool {
  /** Opens one streamed model turn on the first model not benched, falling through on quota and availability errors. */
  stream(ai: GoogleGenAI, request: TurnRequest): Promise<TurnStream>;
  /** Test seam — clears the bench. */
  reset(): void;
}

const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * MINUTE_MS;
/** A model the API no longer serves (404) is retried hourly, not on every question. */
const MISSING_MODEL_BENCH_MS = 60 * MINUTE_MS;

type Bench = { until: number; quota: boolean };

/**
 * How long to bench a model after `err`: a duration, 0 to try the next model
 * without benching (a transient 500/503), or null when the error is not about
 * the model's availability at all (a bad request, a timeout, an abort) and
 * must surface as it is.
 */
export function benchFor(err: unknown, now: number): { ms: number; quota: boolean } | null {
  if (!(err instanceof ApiError)) return null;
  switch (err.status) {
    case 429:
      return { ms: isDailyQuotaError(err) ? msUntilPacificMidnight(now) : retryDelayMs(err.message), quota: true };
    case 404:
      return { ms: MISSING_MODEL_BENCH_MS, quota: false };
    case 500:
    case 503:
      return { ms: 0, quota: false };
    default:
      return null;
  }
}

/** The RetryInfo delay Google attaches to a per-minute 429 (`"retryDelay": "41s"`), clamped; a minute when absent. */
export function retryDelayMs(message: string): number {
  const seconds = Number(/"retryDelay":\s*"(\d+(?:\.\d+)?)s"/.exec(message)?.[1]);
  return Number.isFinite(seconds) ? Math.min(5 * MINUTE_MS, Math.max(5_000, seconds * 1000)) : MINUTE_MS;
}

const pacificClock = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Los_Angeles",
  hourCycle: "h23",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
});

/** Daily quotas reset at midnight Pacific. Off by an hour on the two DST
    changeover days, which costs one extra 429 or an hour on the bench. */
export function msUntilPacificMidnight(now: number): number {
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    Number(pacificClock.formatToParts(now).find((p) => p.type === type)?.value ?? 0);
  const elapsed = ((part("hour") * 60 + part("minute")) * 60 + part("second")) * 1000;
  return DAY_MS - elapsed;
}

export function createModelPool(
  models: readonly ChatModel[],
  { clock = Date.now }: { clock?: () => number } = {},
): ModelPool {
  const bench = new Map<string, Bench>();

  return {
    async stream(ai, { contents, config }) {
      let lastError: unknown = null;
      let allQuota = true;

      for (const model of models) {
        const benched = bench.get(model.id);
        if (benched && benched.until > clock()) {
          allQuota &&= benched.quota;
          continue;
        }

        try {
          const stream = await ai.models.generateContentStream({
            model: model.id,
            contents,
            config: { ...config, thinkingConfig: model.thinkingConfig },
          });
          // A quota error can also arrive with the first chunk rather than the
          // response status. Pulling it here keeps that case inside the chain.
          const first = await stream.next();
          return (async function* () {
            try {
              if (first.done) return;
              yield first.value;
              yield* stream;
            } finally {
              await stream.return(undefined);
            }
          })();
        } catch (err) {
          if (config.abortSignal?.aborted) throw err;
          const verdict = benchFor(err, clock());
          if (!verdict) throw err;
          if (verdict.ms > 0) bench.set(model.id, { until: clock() + verdict.ms, quota: verdict.quota });
          if (verdict.quota) {
            console.warn(`[chat] ${model.id} quota spent — benched ${Math.round(verdict.ms / MINUTE_MS)} min`);
          } else {
            console.error(`[chat] ${model.id} unavailable (${(err as ApiError).status}) — trying the next model`);
          }
          allQuota &&= verdict.quota;
          lastError = err;
        }
      }

      if (lastError) throw lastError;
      throw allQuota ? new QuotaExhaustedError("Every chat model is out of quota") : new Error("No chat model is available");
    },

    reset() {
      bench.clear();
    },
  };
}
