/* ============================================================================
   FIXED-WINDOW RATE LIMIT — in-process, per-key.

   Deliberately not Redis. The site is a single small deployment and the threat
   is a bored script, not a distributed attacker. The trade-off is stated
   honestly: the counter lives in module memory, so it resets on cold start and
   is per-instance. It throttles floods; it does not guarantee a global ceiling.
   If this ever runs multi-instance, swap the Map for a Redis INCR + EXPIRE and
   keep this signature.

   `now` is injected rather than read from Date.now() inside, so window
   expiry is testable without sleeping through a real hour.
   ========================================================================== */

export interface RateLimitResult {
  ok: boolean;
  /** Seconds until the window resets. 0 when the request was allowed. */
  retryAfter: number;
  /** Requests still available in the current window. */
  remaining: number;
}

export interface RateLimiterOptions {
  /** Window length in milliseconds. */
  windowMs: number;
  /** Requests permitted per key per window. */
  max: number;
  /** Sweep the backing map once it exceeds this many keys. */
  sweepThreshold?: number;
}

export interface RateLimiter {
  check(key: string, now?: number): RateLimitResult;
  /** Test seam — drops all counters. */
  reset(): void;
  /** Test seam — number of tracked keys. */
  size(): number;
}

export function createRateLimiter({
  windowMs,
  max,
  sweepThreshold = 500,
}: RateLimiterOptions): RateLimiter {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return {
    check(key: string, now: number = Date.now()): RateLimitResult {
      // Opportunistic sweep — the map only ever holds recent senders, so it
      // cannot grow without bound on a long-lived server.
      if (hits.size > sweepThreshold) {
        for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
      }

      const entry = hits.get(key);

      if (!entry || entry.resetAt <= now) {
        hits.set(key, { count: 1, resetAt: now + windowMs });
        return { ok: true, retryAfter: 0, remaining: max - 1 };
      }

      entry.count += 1;

      if (entry.count > max) {
        return {
          ok: false,
          retryAfter: Math.ceil((entry.resetAt - now) / 1000),
          remaining: 0,
        };
      }

      return { ok: true, retryAfter: 0, remaining: max - entry.count };
    },

    reset() {
      hits.clear();
    },

    size() {
      return hits.size;
    },
  };
}

/** `NextRequest.ip` was removed in Next 15, so identity comes from the proxy
    headers. Take the FIRST entry of x-forwarded-for — the client — not the
    last, which is the nearest proxy. */
export function clientKey(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}
