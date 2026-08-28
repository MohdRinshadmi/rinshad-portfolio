"use client";

import { motion, useReducedMotion } from "framer-motion";
import { DURATION, EASE, VIEWPORT } from "@/lib/animation";
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
 *
 * Reduced motion renders the content at rest with no animation at all. The
 * global `prefers-reduced-motion` rule in globals.css can't cover this — it
 * clamps CSS `animation-duration` and `transition-duration`, and Framer drives
 * these from JS, so the opt-out has to be explicit here.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 18,
  as = "div",
  once = true,
}: RevealProps) {
  const MotionTag = motion[as];
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <MotionTag className={cn(className)}>{children}</MotionTag>;
  }

  return (
    <MotionTag
      className={cn(className)}
      initial={{ opacity: 0, y }}
      whileInView={{
        opacity: 1,
        y: 0,
        transition: { duration: DURATION.reveal, ease: EASE.out, delay },
      }}
      viewport={{ ...VIEWPORT, once }}
    >
      {children}
    </MotionTag>
  );
}
