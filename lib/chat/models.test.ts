import { ApiError, type GoogleGenAI } from "@google/genai";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  benchFor,
  CHAT_MODELS,
  createModelPool,
  msUntilPacificMidnight,
  QuotaExhaustedError,
  retryDelayMs,
  type ChatModel,
} from "./models";

const MINUTE = 60_000;

const MODELS: readonly ChatModel[] = [
  { id: "lite-a", thinkingConfig: { thinkingBudget: 0 } },
  { id: "lite-b", thinkingConfig: { thinkingBudget: 0 } },
];

const apiError = (status: number, message = "error") => new ApiError({ message, status });
const perDay = () => apiError(429, '"quotaId":"GenerateRequestsPerDayPerProjectPerModel-FreeTier"');
const perMinute = (delay = "41s") =>
  apiError(429, `"quotaId":"GenerateRequestsPerMinutePerProjectPerModel-FreeTier" ... "retryDelay":"${delay}"`);

/** A stand-in SDK whose models answer or fail as scripted, by model id. */
function fakeAi(behaviour: Record<string, () => Error | string[]>) {
  const generateContentStream = vi.fn(async ({ model }: { model: string }) => {
    const outcome = behaviour[model]();
    if (outcome instanceof Error) throw outcome;
    return (async function* () {
      for (const text of outcome) yield { text };
    })();
  });
  return { ai: { models: { generateContentStream } } as unknown as GoogleGenAI, generateContentStream };
}

const request = { contents: [{ role: "user", parts: [{ text: "hi" }] }], config: {} };

async function textOf(stream: AsyncGenerator<{ text?: string }>) {
  let text = "";
  for await (const chunk of stream) text += chunk.text ?? "";
  return text;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("CHAT_MODELS", () => {
  it("spends the Flash-Lite quotas before the scarce Flash one", () => {
    expect(CHAT_MODELS.map((model) => model.id)).toEqual([
      "gemini-3.5-flash-lite",
      "gemini-3.1-flash-lite",
      "gemini-3.6-flash",
    ]);
  });
});

describe("benchFor", () => {
  const noon = Date.parse("2026-09-17T12:00:00-07:00");

  it("benches a per-day 429 until midnight Pacific", () => {
    expect(benchFor(perDay(), noon)).toEqual({ ms: 12 * 60 * MINUTE, quota: true });
  });

  it("benches a per-minute 429 for Google's retry delay", () => {
    expect(benchFor(perMinute("41s"), noon)).toEqual({ ms: 41_000, quota: true });
  });

  it("benches a missing model for an hour, as unavailable rather than out of quota", () => {
    expect(benchFor(apiError(404), noon)).toEqual({ ms: 60 * MINUTE, quota: false });
  });

  it("moves past a transient 500 or 503 without benching", () => {
    expect(benchFor(apiError(503), noon)).toEqual({ ms: 0, quota: false });
    expect(benchFor(apiError(500), noon)).toEqual({ ms: 0, quota: false });
  });

  it("lets anything else surface as it is", () => {
    expect(benchFor(apiError(400), noon)).toBeNull();
    expect(benchFor(new Error("timeout"), noon)).toBeNull();
  });
});

describe("retryDelayMs", () => {
  it("clamps the delay between five seconds and five minutes", () => {
    expect(retryDelayMs('"retryDelay":"0.5s"')).toBe(5_000);
    expect(retryDelayMs('"retryDelay":"900s"')).toBe(5 * MINUTE);
  });

  it("falls back to a minute when Google sends no delay", () => {
    expect(retryDelayMs("quota exceeded")).toBe(MINUTE);
  });
});

describe("msUntilPacificMidnight", () => {
  it("counts to midnight in Los Angeles, not in UTC or the server's zone", () => {
    expect(msUntilPacificMidnight(Date.parse("2026-09-17T23:30:00-07:00"))).toBe(30 * MINUTE);
    expect(msUntilPacificMidnight(Date.parse("2026-12-01T00:00:00-08:00"))).toBe(24 * 60 * MINUTE);
  });
});

describe("createModelPool", () => {
  it("answers from the first model and passes that model's thinking config", async () => {
    const { ai, generateContentStream } = fakeAi({ "lite-a": () => ["a"], "lite-b": () => ["b"] });
    const pool = createModelPool(MODELS);

    await expect(textOf(await pool.stream(ai, request))).resolves.toBe("a");
    expect(generateContentStream).toHaveBeenCalledWith(
      expect.objectContaining({ model: "lite-a", config: { thinkingConfig: { thinkingBudget: 0 } } }),
    );
  });

  it("falls through on a quota error and keeps the spent model benched until its quota returns", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    let now = Date.parse("2026-09-17T12:00:00-07:00");
    let aSpent = true;
    const { ai, generateContentStream } = fakeAi({
      "lite-a": () => (aSpent ? perMinute("30s") : ["a"]),
      "lite-b": () => ["b"],
    });
    const pool = createModelPool(MODELS, { clock: () => now });

    await expect(textOf(await pool.stream(ai, request))).resolves.toBe("b");
    await expect(textOf(await pool.stream(ai, request))).resolves.toBe("b");
    expect(generateContentStream.mock.calls.map(([params]) => params.model)).toEqual(["lite-a", "lite-b", "lite-b"]);

    now += 31_000;
    aSpent = false;
    await expect(textOf(await pool.stream(ai, request))).resolves.toBe("a");
  });

  it("falls through on a quota error that arrives with the first chunk", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const generateContentStream = vi.fn(async ({ model }: { model: string }) =>
      (async function* () {
        if (model === "lite-a") throw perDay();
        yield { text: "b" };
      })(),
    );
    const ai = { models: { generateContentStream } } as unknown as GoogleGenAI;

    await expect(textOf(await createModelPool(MODELS).stream(ai, request))).resolves.toBe("b");
  });

  it("throws the last quota error when every model is spent, then QuotaExhaustedError without calling out", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const { ai, generateContentStream } = fakeAi({ "lite-a": perDay, "lite-b": perDay });
    const pool = createModelPool(MODELS);

    await expect(pool.stream(ai, request)).rejects.toMatchObject({ status: 429 });
    generateContentStream.mockClear();

    await expect(pool.stream(ai, request)).rejects.toBeInstanceOf(QuotaExhaustedError);
    expect(generateContentStream).not.toHaveBeenCalled();
  });

  it("does not call a bench of missing models a quota problem", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { ai } = fakeAi({ "lite-a": () => apiError(404), "lite-b": () => apiError(404) });
    const pool = createModelPool(MODELS);
    await pool.stream(ai, request).catch(() => {});

    const err = await pool.stream(ai, request).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(Error);
    expect(err).not.toBeInstanceOf(QuotaExhaustedError);
  });

  it("surfaces a bad request at once, without trying the next model", async () => {
    const { ai, generateContentStream } = fakeAi({ "lite-a": () => apiError(400), "lite-b": () => ["b"] });

    await expect(createModelPool(MODELS).stream(ai, request)).rejects.toMatchObject({ status: 400 });
    expect(generateContentStream).toHaveBeenCalledTimes(1);
  });

  it("stops at once when the visitor has already stopped", async () => {
    const controller = new AbortController();
    controller.abort();
    const { ai, generateContentStream } = fakeAi({ "lite-a": perDay, "lite-b": () => ["b"] });

    await expect(
      createModelPool(MODELS).stream(ai, { ...request, config: { abortSignal: controller.signal } }),
    ).rejects.toMatchObject({ status: 429 });
    expect(generateContentStream).toHaveBeenCalledTimes(1);
  });
});
