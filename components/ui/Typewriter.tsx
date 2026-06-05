"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TypewriterProps {
  text: string;
  className?: string;
  /** ms per character */
  speed?: number;
  /** ms before typing starts (once in view) */
  startDelay?: number;
}

/**
 * Typewriter — types `text` out character-by-character once it scrolls into view,
 * with a blinking caret, like the line is being written. The untyped remainder is
 * rendered invisibly so the paragraph reserves its full height (no layout shift),
 * and the full text lives in `aria-label` + the DOM for a11y/SEO. Reduced motion
 * and the first (hydration) render show the text without animating.
 */
export function Typewriter({ text, className, speed = 24, startDelay = 500 }: TypewriterProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduceMotion = useReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (reduceMotion || !inView) return;
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      i += 1;
      setCount(i);
      if (i < text.length) timer = setTimeout(tick, speed);
    };
    timer = setTimeout(tick, startDelay);
    return () => clearTimeout(timer);
  }, [inView, reduceMotion, text, speed, startDelay]);

  const n = reduceMotion ? text.length : count;
  const done = n >= text.length;

  return (
    <p ref={ref} className={className} aria-label={text}>
      <span aria-hidden="true">{text.slice(0, n)}</span>
      {!done ? (
        <span
          aria-hidden="true"
          className={cn(
            "ml-px inline-block h-[1.05em] w-[2px] -translate-y-[0.06em] align-middle bg-accent",
            "animate-caret",
          )}
        />
      ) : null}
      {/* reserve the remaining space so the line never reflows as it types */}
      <span aria-hidden="true" className="opacity-0">
        {text.slice(n)}
      </span>
    </p>
  );
}
