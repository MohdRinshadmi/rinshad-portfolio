import { describe, expect, it } from "vitest";
import { clientKey, createRateLimiter } from "./rate-limit";

const HOUR = 60 * 60 * 1000;

describe("createRateLimiter", () => {
  it("allows exactly `max` requests, then refuses", () => {
    const limiter = createRateLimiter({ windowMs: HOUR, max: 5 });
    const t0 = 1_000_000;

    for (let i = 1; i <= 5; i++) {
      expect(limiter.check("ip", t0).ok, `request ${i}`).toBe(true);
    }
    expect(limiter.check("ip", t0).ok).toBe(false);
  });

  it("counts down `remaining` as the window fills", () => {
    const limiter = createRateLimiter({ windowMs: HOUR, max: 3 });
    const t0 = 0;
    expect(limiter.check("ip", t0).remaining).toBe(2);
    expect(limiter.check("ip", t0).remaining).toBe(1);
    expect(limiter.check("ip", t0).remaining).toBe(0);
    expect(limiter.check("ip", t0).remaining).toBe(0);
  });

  it("keeps separate budgets per key", () => {
    const limiter = createRateLimiter({ windowMs: HOUR, max: 1 });
    expect(limiter.check("a", 0).ok).toBe(true);
    expect(limiter.check("a", 0).ok).toBe(false);
    // A different sender is untouched by the first one's flood.
    expect(limiter.check("b", 0).ok).toBe(true);
  });

  it("reports the seconds remaining in the window", () => {
    const limiter = createRateLimiter({ windowMs: HOUR, max: 1 });
    limiter.check("ip", 0);
    // 10 minutes in: 50 minutes left.
    expect(limiter.check("ip", 10 * 60 * 1000).retryAfter).toBe(50 * 60);
  });

  it("rounds retryAfter up, so it never reports 0 while still blocking", () => {
    const limiter = createRateLimiter({ windowMs: 1500, max: 1 });
    limiter.check("ip", 0);
    const result = limiter.check("ip", 1400); // 100ms left
    expect(result.ok).toBe(false);
    expect(result.retryAfter).toBe(1);
  });

  it("opens a fresh window once the old one expires", () => {
    const limiter = createRateLimiter({ windowMs: HOUR, max: 2 });
    limiter.check("ip", 0);
    limiter.check("ip", 0);
    expect(limiter.check("ip", 0).ok).toBe(false);

    // Exactly at the boundary the window has expired (resetAt <= now).
    expect(limiter.check("ip", HOUR).ok).toBe(true);
    expect(limiter.check("ip", HOUR).ok).toBe(true);
    expect(limiter.check("ip", HOUR).ok).toBe(false);
  });

  it("does not leak keys forever — the sweep drops expired entries", () => {
    const limiter = createRateLimiter({ windowMs: HOUR, max: 5, sweepThreshold: 10 });

    for (let i = 0; i < 11; i++) limiter.check(`ip-${i}`, 0);
    expect(limiter.size()).toBe(11);

    // One request an hour later trips the sweep; every stale key goes.
    limiter.check("late", HOUR + 1);
    expect(limiter.size()).toBe(1);
  });

  it("keeps live entries when it sweeps", () => {
    const limiter = createRateLimiter({ windowMs: HOUR, max: 5, sweepThreshold: 2 });
    limiter.check("old", 0);
    limiter.check("fresh", HOUR - 1000); // still live at HOUR + 1
    limiter.check("trigger", HOUR + 1);

    // "old" expired and was swept; "fresh" survived and keeps its count.
    expect(limiter.check("fresh", HOUR + 1).remaining).toBe(3);
  });

  it("reset() clears every counter", () => {
    const limiter = createRateLimiter({ windowMs: HOUR, max: 1 });
    limiter.check("ip", 0);
    limiter.reset();
    expect(limiter.size()).toBe(0);
    expect(limiter.check("ip", 0).ok).toBe(true);
  });
});

describe("clientKey", () => {
  const h = (init: Record<string, string>) => new Headers(init);

  it("takes the first x-forwarded-for entry — the client, not the proxy", () => {
    expect(clientKey(h({ "x-forwarded-for": "203.0.113.7, 70.41.3.18, 150.172.238.178" })))
      .toBe("203.0.113.7");
  });

  it("trims surrounding whitespace", () => {
    expect(clientKey(h({ "x-forwarded-for": "  203.0.113.7 , 70.41.3.18" }))).toBe("203.0.113.7");
  });

  it("handles a single-value header", () => {
    expect(clientKey(h({ "x-forwarded-for": "203.0.113.7" }))).toBe("203.0.113.7");
  });

  it("falls back to x-real-ip", () => {
    expect(clientKey(h({ "x-real-ip": "198.51.100.4" }))).toBe("198.51.100.4");
  });

  it("prefers x-forwarded-for over x-real-ip when both are present", () => {
    expect(clientKey(h({ "x-forwarded-for": "203.0.113.7", "x-real-ip": "198.51.100.4" })))
      .toBe("203.0.113.7");
  });

  it("falls back to x-real-ip when x-forwarded-for is empty or blank", () => {
    expect(clientKey(h({ "x-forwarded-for": "", "x-real-ip": "198.51.100.4" }))).toBe("198.51.100.4");
    expect(clientKey(h({ "x-forwarded-for": "   ", "x-real-ip": "198.51.100.4" }))).toBe("198.51.100.4");
  });

  it("returns a stable bucket when no proxy header is present", () => {
    // Everyone unattributable shares one budget rather than bypassing the limit.
    expect(clientKey(h({}))).toBe("unknown");
  });
});
