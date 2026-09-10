"use client";

import { motion } from "framer-motion";
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
 * Reduced motion is handled once, globally, by `<MotionConfig
 * reducedMotion="user">` in SmoothScroll: the fade stays and the rise is
 * dropped — simplified, not removed. This component renders ONE tree for
 * everybody. It used to return a bare element when `useReducedMotion()` was
 * true, but that hook is false on the server and true on a reduced-motion
 * client's first render, so the two trees disagreed during hydration and React
 * threw #418.
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
