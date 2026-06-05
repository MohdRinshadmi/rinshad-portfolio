"use client";

import { motion } from "framer-motion";
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
 */
export function Stagger({
  children,
  className,
  gap = "base",
  once = true,
  as = "div",
}: StaggerProps) {
  const MotionTag = motion[as];

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

  return (
    <MotionTag className={cn(className)} variants={fadeUp}>
      {children}
    </MotionTag>
  );
}
