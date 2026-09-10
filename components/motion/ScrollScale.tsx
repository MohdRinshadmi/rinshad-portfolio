"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useTransform } from "framer-motion";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useScrubProgress } from "@/lib/hooks/use-scrub-progress";

interface ScrollScaleProps {
  children: React.ReactNode;
  className?: string;
  /** starting scale while still low in the viewport (default 0.96) */
  from?: number;
  /** starting y offset in px (default 36) */
  y?: number;
}

/**
 * Apple-style "settle": the block rises, scales and sharpens from a slightly
 * receded state to rest as it approaches the reading zone — scrubbed by the
 * scrollbar (reversible), not played once. Transform/opacity only; reduced
 * motion and SSR render the block at rest.
 *
 * Progress is spring-smoothed and each channel is eased rather than linear,
 * so the block decelerates into rest instead of arriving at a constant rate.
 */
export function ScrollScale({ children, className, from = 0.96, y = 36 }: ScrollScaleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const hydrated = useHydrated();

  const progress = useScrubProgress(ref, ["start end", "start 0.45"]);

  // Extra midpoints shape the arrival: most of the distance is covered early,
  // and the last few percent of scale and lift arrive slowly.
  //
  // Transform only — no opacity channel. The blocks this wraps are project
  // cards and the contact form, i.e. text people read; fading them to 55% put
  // every label below AA contrast until the reader had scrolled past.
  const scale = useTransform(progress, [0, 0.55, 1], [from, from + (1 - from) * 0.82, 1]);
  const translateY = useTransform(progress, [0, 0.55, 1], [y, y * 0.16, 0]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={
        hydrated && !reduceMotion
          ? { scale, y: translateY, willChange: "transform" }
          : undefined
      }
    >
      {children}
    </motion.div>
  );
}
