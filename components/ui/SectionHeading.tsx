"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  DURATION,
  EASE,
  fadeUp,
  lineMask,
  VIEWPORT,
} from "@/lib/animation";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  /** render the eyebrow as a Formix-style rounded pill (no leading dot) */
  eyebrowPill?: boolean;
  /** string or JSX (may contain a muted/serif accent span) */
  title: React.ReactNode;
  description?: string;
  align?: "left" | "center";
  size?: "h2" | "display-lg" | "display-xl";
  className?: string;
}

const sizeClass = {
  h2: "text-h2",
  "display-lg": "text-display-lg",
  "display-xl": "text-display-xl",
} as const;

export function SectionHeading({
  eyebrow,
  eyebrowPill = false,
  title,
  description,
  align = "left",
  size = "h2",
  className,
}: SectionHeadingProps) {
  const reduceMotion = useReducedMotion();
  const isCentered = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        isCentered ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow ? (
        <motion.span
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: DURATION.base, ease: EASE.out }}
          className={cn(
            "inline-flex items-center gap-2 font-mono text-eyebrow uppercase text-text-tertiary",
            eyebrowPill && "rounded-full border border-border bg-surface/70 px-3.5 py-2 ring-hairline",
            isCentered && "justify-center",
          )}
        >
          {!eyebrowPill && <span aria-hidden className="size-1.5 rounded-full bg-accent" />}
          {eyebrow}
        </motion.span>
      ) : null}

      <h2
        className={cn(
          "font-display text-balance text-text",
          sizeClass[size],
          isCentered ? "max-w-3xl" : "max-w-[20ch]",
        )}
      >
        <span className="block overflow-hidden pb-[0.08em]">
          <motion.span
            className="block"
            variants={reduceMotion ? undefined : lineMask}
            initial={reduceMotion ? false : "hidden"}
            whileInView="visible"
            viewport={VIEWPORT}
          >
            {title}
          </motion.span>
        </span>
      </h2>

      {description ? (
        <motion.p
          variants={reduceMotion ? undefined : fadeUp}
          initial={reduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={VIEWPORT}
          transition={{
            duration: DURATION.reveal,
            ease: EASE.out,
            delay: 0.12,
          }}
          className={cn(
            "text-body-lg text-text-secondary",
            isCentered ? "max-w-2xl" : "max-w-[60ch]",
          )}
        >
          {description}
        </motion.p>
      ) : null}
    </div>
  );
}
