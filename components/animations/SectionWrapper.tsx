"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { fadeUp } from "@/lib/animation";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function SectionWrapper({ children, className, id }: SectionWrapperProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      id={id}
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={cn("relative", className)}
    >
      {children}
    </motion.section>
  );
}

interface SectionHeadingProps {
  label?: string;
  title: string;
  description?: string;
  centered?: boolean;
  className?: string;
}

export function SectionHeading({ label, title, description, centered = false, className }: SectionHeadingProps) {
  return (
    <div className={cn("mb-16", centered && "text-center", className)}>
      {label && (
        <p className="mb-3 text-xs font-semibold tracking-[0.2em] uppercase text-violet-400">
          {label}
        </p>
      )}
      <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 max-w-2xl text-base text-zinc-400 sm:text-lg leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
