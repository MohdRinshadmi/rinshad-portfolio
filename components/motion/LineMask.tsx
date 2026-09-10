"use client";

import { motion } from "framer-motion";
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
 * One tree for everybody. Under reduced motion the global `MotionConfig`
 * makes the rise instant, so the line simply appears as it enters the
 * viewport. The old reduced-motion branch returned a single span instead of
 * two — a structural difference between the server HTML and a reduced-motion
 * client's first render, which is what threw React #418 on the homepage.
 */
export function LineMask({ children, className, delay = 0 }: LineMaskProps) {
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
