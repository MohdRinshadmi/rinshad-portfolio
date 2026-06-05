"use client";

import { motion } from "framer-motion";
import { DURATION, EASE } from "@/lib/animation";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "section" | "li";
  once?: boolean;
}

/**
 * Scroll-reveal primitive: opacity/y fade-up that enters once when scrolled
 * into view. Animates transform + opacity only.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  as = "div",
  once = true,
}: RevealProps) {
  const MotionTag = motion[as];

  return (
    <MotionTag
      className={cn(className)}
      initial={{ opacity: 0, y }}
      whileInView={{
        opacity: 1,
        y: 0,
        transition: { duration: DURATION.reveal, ease: EASE.out, delay },
      }}
      viewport={{ once, margin: "-80px" }}
    >
      {children}
    </MotionTag>
  );
}
