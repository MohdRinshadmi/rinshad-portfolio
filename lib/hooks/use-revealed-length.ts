"use client";

import { useEffect, useRef, useState } from "react";
import { revealBoundary, revealRate } from "@/lib/chat/reveal";

/**
 * How many characters of a streaming `text` to show right now — a typewriter
 * that trails the network at a steady pace (see lib/chat/reveal.ts).
 *
 * `instant` shows everything at once: reduced motion, and answers that were
 * stopped or failed, where what arrived should simply be there.
 */
export function useRevealedLength(text: string, { complete, instant }: { complete: boolean; instant: boolean }) {
  const [shown, setShown] = useState(0);
  const positionRef = useRef(0);

  useEffect(() => {
    if (instant || shown >= text.length) return;

    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const elapsed = Math.min(now - last, 100); // a background tab shouldn't dump the backlog in one frame
      last = now;
      const position = positionRef.current;
      positionRef.current = Math.min(
        text.length,
        position + (revealRate(text.length - position, complete) * elapsed) / 1000,
      );
      const next = revealBoundary(text, positionRef.current);
      if (next !== shown) {
        setShown(next);
        return; // the re-render restarts the loop
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [text, complete, instant, shown]);

  return instant ? text.length : Math.min(shown, text.length);
}
