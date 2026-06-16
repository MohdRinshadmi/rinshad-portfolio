"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

interface ScrubTextProps {
  text: string;
  className?: string;
  as?: "p" | "h2" | "h3" | "span";
}

/**
 * Apple-style scroll scrub: each word "ignites" from pale to full ink as the
 * paragraph passes through the reading zone — scrubbing forward AND backward
 * with the scroll, not an enter-once reveal. Opacity-only (a muted base layer
 * with a full-ink overlay per word), so it never re-layouts or repaints text.
 * Reduced motion (and SSR) renders the plain paragraph at full color.
 */
export function ScrubText({ text, className, as: Tag = "p" }: ScrubTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduceMotion = useReducedMotion();
  const hydrated = useHydrated();

  // Scrub window: starts when the block enters the lower third, completes
  // just above center — the words finish lighting while you're reading them.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "start 0.4"],
  });

  const words = text.split(" ");

  if (!hydrated || reduceMotion) {
    return (
      <Tag ref={ref} className={className}>
        {text}
      </Tag>
    );
  }

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {words.map((word, i) => (
        <Word
          key={`${word}-${i}`}
          progress={scrollYProgress}
          // Each word owns a slice of the scrub, slightly overlapped so the
          // sweep reads as a wave instead of a typewriter.
          range={[i / words.length, Math.min(1, (i + 1.6) / words.length)]}
        >
          {word}
        </Word>
      ))}
    </Tag>
  );
}

function Word({
  progress,
  range,
  children,
}: {
  progress: MotionValue<number>;
  range: [number, number];
  children: string;
}) {
  const opacity = useTransform(progress, range, [0, 1]);
  return (
    <span aria-hidden="true" className="relative mr-[0.32em] inline-block">
      <span className={cn("text-text-muted")}>{children}</span>
      <motion.span style={{ opacity }} className="absolute inset-0 text-text">
        {children}
      </motion.span>
    </span>
  );
}
