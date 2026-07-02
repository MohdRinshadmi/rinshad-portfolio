"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useHydrated } from "@/lib/hooks/use-hydrated";

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
 */
export function ScrollScale({ children, className, from = 0.96, y = 36 }: ScrollScaleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const hydrated = useHydrated();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 0.45"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [from, 1]);
  const translateY = useTransform(scrollYProgress, [0, 1], [y, 0]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.55, 1]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={
        hydrated && !reduceMotion ? { scale, y: translateY, opacity } : undefined
      }
    >
      {children}
    </motion.div>
  );
}
