"use client";

import { useScroll, useSpring, type MotionValue } from "framer-motion";
import type { RefObject } from "react";
import { SCRUB_SPRING } from "@/lib/animation";

/**
 * A scroll-linked 0→1 progress value for `target`, spring-smoothed.
 *
 * Wraps `useScroll` so every scrubbed element on the site shares one feel and
 * one place to tune it. The spring absorbs the jumps a raw scroll offset can't
 * hide — anchor navigation, spacebar paging, a notched mouse wheel — while
 * still tracking a trackpad closely enough to read as direct manipulation.
 *
 * `offset` uses framer's scroll-offset grammar, e.g. ["start end", "start 0.4"]
 * — "this element's start meets the viewport's end" → "…meets 40% down".
 */
export function useScrubProgress(
  ref: RefObject<HTMLElement | null>,
  offset: readonly [string, string],
): MotionValue<number> {
  const { scrollYProgress } = useScroll({
    target: ref,
    // framer's ScrollOffset type is a tuple of Edge unions; the readable
    // string form we pass is valid at runtime but wider than that union.
    offset: offset as never,
  });

  return useSpring(scrollYProgress, SCRUB_SPRING);
}
