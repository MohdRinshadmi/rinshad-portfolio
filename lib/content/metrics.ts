/* ============================================================================
   METRIC HIGHLIGHTING — the pure half.

   Résumé achievement lines carry the proof ("cut average API response time by
   35%", "40+ endpoints"). The timeline renders those tokens as accent chips so
   the numbers read at a glance. Splitting the sentence is string work with real
   edge cases, so it lives here and is tested; the component only maps the
   result to JSX.
   ========================================================================== */

/** Matches percentages (35%, 2.5 %, 60%+), counts (40+, 2,000+), latency
    phrases (sub-second, sub-16ms), and the literal word "zero".
    Capturing group → `split` keeps the matches. No `g` flag, so a per-part
    `test()` stays stateless and deterministic.

    `[\d,]*` is what admits a thousands separator. Without it the digit run
    stopped at the comma, so the résumé's "2,000+ monthly transactions"
    highlighted as "000+" and left the "2," stranded outside the chip. The
    optional trailing `\+` on the percentage branch does the same job for
    "60%+", which previously chipped as "60%" with a loose "+" after it. */
export const METRIC_PATTERN =
  /(\d[\d,]*(?:\.\d+)?\s?%\+?|\d[\d,]*\+|sub-second|sub-\d+ms|\bzero\b)/i;

export interface MetricSegment {
  text: string;
  isMetric: boolean;
}

/**
 * Split `text` into ordered segments, flagging the ones that are proof tokens.
 *
 * Empty strings produced by `String.prototype.split` around adjacent matches
 * are dropped, so concatenating every `text` back together reproduces the
 * input exactly.
 */
export function splitMetrics(text: string): MetricSegment[] {
  return text
    .split(METRIC_PATTERN)
    .filter((part) => Boolean(part))
    .map((part) => ({ text: part, isMetric: METRIC_PATTERN.test(part) }));
}
