"use client";

import { motion } from "framer-motion";
import { lineMask, VIEWPORT } from "@/lib/animation";
import { cn } from "@/lib/utils";

interface LineMaskProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

/**
 * Wraps a single line in an overflow-hidden clip; the inner block slides up
 * from below (transform only) on scroll-in, once.
 */
export function LineMask({ children, className, delay = 0 }: LineMaskProps) {
  return (
    <span className={cn("block overflow-hidden", className)}>
      <motion.span
        className="block"
        variants={lineMask}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
        transition={{ delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}
