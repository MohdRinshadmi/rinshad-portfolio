"use client";

import { motion, useReducedMotion } from "framer-motion";
import { tokenStream, tokenWord, VIEWPORT } from "@/lib/animation";
import { cn } from "@/lib/utils";

interface TokenStreamProps {
  text: string;
  /** applied to the container — set the type size/family here */
  className?: string;
  as?: "h1" | "p" | "span";
  /** optional verbatim substring rendered with `accentClassName` */
  accent?: string;
  /** how the accent substring is styled (default: serif italic) */
  accentClassName?: string;
  startDelay?: number;
}

/**
 * Reveals `text` word-by-word, left→right, once on scroll-into-view — mimicking
 * an LLM streaming its completion. Words are inline-block so they wrap naturally.
 * If `accent` is a substring of `text`, those words render in font-serif italic.
 */
export function TokenStream({
  text,
  className,
  as = "span",
  accent,
  accentClassName = "font-serif italic text-text",
  startDelay = 0,
}: TokenStreamProps) {
  const reduceMotion = useReducedMotion();
  const words = text.split(" ").filter(Boolean);

  // Resolve which word indices belong to the accent substring.
  const accentSet = new Set<number>();
  if (accent) {
    const accentWords = accent.split(" ").filter(Boolean);
    const start = words.findIndex(
      (_, i) => accentWords.every((w, j) => words[i + j] === w),
    );
    if (start !== -1) {
      for (let j = 0; j < accentWords.length; j++) accentSet.add(start + j);
    }
  }

  const MotionTag = motion[as];

  return (
    <MotionTag
      className={cn("font-display text-balance", className)}
      variants={reduceMotion ? undefined : tokenStream}
      initial={reduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={VIEWPORT}
      transition={reduceMotion ? undefined : { delayChildren: startDelay }}
    >
      {words.map((word, i) => {
        const isAccent = accentSet.has(i);
        return (
          <motion.span
            key={`${word}-${i}`}
            variants={reduceMotion ? undefined : tokenWord}
            className={cn("inline-block whitespace-pre", isAccent && accentClassName)}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        );
      })}
    </MotionTag>
  );
}
