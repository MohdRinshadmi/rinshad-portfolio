/* ============================================================================
   NUMBER FORMATTING — shared by the server-rendered value and the client-side
   count-up, so the two can never disagree on a digit or a separator.
   ========================================================================== */

const formatters = new Map<number, Intl.NumberFormat>();

/**
 * `formatCount(2000, 0, "", "+")` → `"2,000+"`.
 *
 * The locale is pinned rather than left to the runtime: the server renders the
 * final value and the browser rewrites it frame by frame during the count, and
 * a visitor whose locale groups digits differently would otherwise see the
 * number change shape the moment the animation starts.
 */
export function formatCount(value: number, decimals = 0, prefix = "", suffix = ""): string {
  let formatter = formatters.get(decimals);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    formatters.set(decimals, formatter);
  }
  return `${prefix}${formatter.format(value)}${suffix}`;
}
