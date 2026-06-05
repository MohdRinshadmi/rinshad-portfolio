"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { DURATION, EASE } from "@/lib/animation";
import { cn } from "@/lib/utils";

interface CountUpProps {
  to: number;
  from?: number;
  /** seconds */
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * Counts from `from` → `to` once, the first time it scrolls into view, using
 * framer's `animate()` driven by `useInView`. Supports decimals (e.g. 2.5),
 * a prefix and a suffix. Reduced motion renders the final value immediately
 * (derived at render time — no effect, no cascading renders).
 */
export function CountUp({
  to,
  from = 0,
  duration = DURATION.hero,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: CountUpProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  // enter once — match the reveal viewport margin used across the site
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const format = (n: number) => `${prefix}${n.toFixed(decimals)}${suffix}`;
  const [animated, setAnimated] = useState(() => format(from));

  useEffect(() => {
    if (reduceMotion || !inView) return;
    const controls = animate(from, to, {
      duration,
      ease: EASE.out,
      onUpdate: (value) => setAnimated(format(value)),
    });
    return () => controls.stop();
    // `format` is derived purely from the prop primitives listed below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduceMotion, from, to, duration, decimals, prefix, suffix]);

  // Reduced motion shows the final value with no animation.
  const display = reduceMotion ? format(to) : animated;

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {display}
    </span>
  );
}
