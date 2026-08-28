"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  fadeUp,
  staggerContainer,
  staggerContainerFast,
  VIEWPORT,
} from "@/lib/animation";
import { cn } from "@/lib/utils";

interface StaggerProps {
  children: React.ReactNode;
  className?: string;
  gap?: "fast" | "base";
  once?: boolean;
  as?: "div" | "ul";
}

/**
 * Stagger container: orchestrates child reveals once on scroll-in. Use with
 * <StaggerItem> children. `gap="fast"` uses the tighter cadence.
 *
 * Under reduced motion the container drops its variants entirely, which also
 * disarms every StaggerItem beneath it — there is no orchestration left to
 * inherit, so the children render at rest.
 */
export function Stagger({
  children,
  className,
  gap = "base",
  once = true,
  as = "div",
}: StaggerProps) {
  const MotionTag = motion[as];
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <MotionTag className={cn(className)}>{children}</MotionTag>;
  }

  return (
    <MotionTag
      className={cn(className)}
      variants={gap === "fast" ? staggerContainerFast : staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ ...VIEWPORT, once }}
    >
      {children}
    </MotionTag>
  );
}

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li";
}

/** One staggered child; fades up via the shared fadeUp variant. */
export function StaggerItem({ children, className, as = "div" }: StaggerItemProps) {
  const MotionTag = motion[as];
  const reduceMotion = useReducedMotion();

  return (
    <MotionTag className={cn(className)} variants={reduceMotion ? undefined : fadeUp}>
      {children}
    </MotionTag>
  );
}
