"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeUp, staggerContainer } from "@/lib/animation";
import { cn } from "@/lib/utils";

interface FadeUpProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
}

export function FadeUp({ children, className, delay = 0, once = true }: FadeUpProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ delay }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

interface StaggerProps {
  children: React.ReactNode;
  className?: string;
  once?: boolean;
  fast?: boolean;
}

export function StaggerChildren({ children, className, once = true, fast = false }: StaggerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      variants={fast ? { hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } } : staggerContainer}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
