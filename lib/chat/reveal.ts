/* ============================================================================
   TYPEWRITER PACING — how fast an answer appears on screen.

   The model streams in bursts: nothing for a moment, then a whole sentence or
   paragraph in one network read. Painted as it lands, the answer lurches. The
   widget instead reveals what has arrived at a steady pace that speeds up as
   the unrevealed backlog grows, so it never falls far behind the stream, and
   only ever cuts at a word boundary, so no half-word (or half citation marker)
   flashes on screen.

   Pure, so the pacing is unit-tested without a browser.
   ========================================================================== */

/** Slowest reveal, in characters per second — a comfortable reading pace. */
export const MIN_CHARS_PER_SECOND = 45;
/** Fastest reveal, so a long answer that arrived at once still finishes quickly. */
export const MAX_CHARS_PER_SECOND = 900;
/** While streaming, aim to drain the backlog within this long. */
const STREAMING_CATCH_UP_S = 1.2;
/** Once the answer is complete there is nothing more to wait for: finish sooner. */
const SETTLED_CATCH_UP_S = 0.6;

/** Characters per second for a backlog of `backlog` unrevealed characters. */
export function revealRate(backlog: number, complete: boolean): number {
  const rate = backlog / (complete ? SETTLED_CATCH_UP_S : STREAMING_CATCH_UP_S);
  return Math.min(MAX_CHARS_PER_SECOND, Math.max(MIN_CHARS_PER_SECOND, rate));
}

/**
 * How much of `text` to show once the reveal has reached `position`: the whole
 * text if the reveal is past its end, otherwise everything before the last
 * whitespace at or before `position`.
 */
export function revealBoundary(text: string, position: number): number {
  if (position >= text.length) return text.length;
  for (let index = Math.floor(position); index > 0; index--) {
    if (/\s/.test(text[index])) return index;
  }
  return 0;
}
