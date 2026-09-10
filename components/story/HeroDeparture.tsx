"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useTransform } from "framer-motion";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useScrubProgress } from "@/lib/hooks/use-scrub-progress";

/**
 * The cover receding as chapter one takes the screen. It holds for the first
 * beat, then accelerates out, the way a title card gives up the screen.
 *
 * A wrapper rather than the whole hero: everything inside is server-rendered,
 * so the only JavaScript the introduction costs is this one scroll binding.
 */
export function HeroDeparture({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const hydrated = useHydrated();

  const progress = useScrubProgress(ref, ["start start", "end start"]);
  const y = useTransform(progress, [0, 0.5, 1], [0, 22, 80]);
  const opacity = useTransform(progress, [0, 0.45, 0.85], [1, 0.86, 0.3]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={
        hydrated && !reduceMotion
          ? { y, opacity, willChange: "transform, opacity" }
          : undefined
      }
    >
      {children}
    </motion.div>
  );
}
