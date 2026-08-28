"use client";

import { motion, useReducedMotion } from "framer-motion";
import { DURATION, EASE, lineMask, VIEWPORT } from "@/lib/animation";
import { cn } from "@/lib/utils";

interface LineMaskProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

/**
 * Wraps a single line in an overflow-hidden clip; the inner block slides up
 * from below (transform only) on scroll-in, once.
 *
 * The viewport trigger lives on the OUTER span (which stays unclipped) and
 * propagates the variant to the inner one — observing the inner span directly
 * never fires, because at y:110% it is fully clipped out of the observer's
 * intersection rect.
 *
 * Reduced motion drops the clip as well as the motion: an `overflow-hidden`
 * wrapper around a line of type will crop descenders on some fonts, and there
 * is nothing left for it to mask.
 */
export function LineMask({ children, className, delay = 0 }: LineMaskProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <span className={cn("block", className)}>{children}</span>;
  }

  return (
    <motion.span
      className={cn("block overflow-hidden", className)}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
    >
      <motion.span
        className="block"
        variants={lineMask}
        transition={{ duration: DURATION.reveal, ease: EASE.emphasis, delay }}
      >
        {children}
      </motion.span>
    </motion.span>
  );
}
