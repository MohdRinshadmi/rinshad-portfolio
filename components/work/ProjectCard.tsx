"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import type { Project } from "@/lib/types";
import { EASE } from "@/lib/animation";
import { cn } from "@/lib/utils";

import { DeviceFrame } from "@/components/work/DeviceFrame";

interface ProjectCardProps {
  project: Project;
  variant?: "featured" | "grid";
  index?: number;
  className?: string;
}

/* Hover orchestration — transform/opacity only; spring from lib/animation. */
const cardVariants: Variants = {
  rest: { y: 0 },
  hover: { y: -6, transition: EASE.spring },
};
const mediaVariants: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.03, transition: EASE.spring },
};
const arrowVariants: Variants = {
  rest: { x: 0, y: 0 },
  hover: { x: 3, y: -3, transition: EASE.springSnappy },
};

const MAX_CHIPS = 4;
const MAX_TICKS = 3;

/* — light-on-dark meta, scoped to the ink card — */
function InkChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/12 bg-white/5 px-2.5 py-1 font-mono text-xs text-ink-text-secondary">
      {children}
    </span>
  );
}

/**
 * ProjectCard — a dark glossy "product" card (Formix register) that links to its
 * case study. `featured` = a large full-width card with alternating media/text
 * columns (flipped by index parity), opaque so it stacks cleanly in the sticky
 * scroll. `grid` = a compact card (media over text). Hover lifts the card, warms
 * the border to ember, scales the framed media, and kicks the arrow chip.
 */
export function ProjectCard({ project, variant = "grid", index = 0, className }: ProjectCardProps) {
  const reduceMotion = useReducedMotion();
  const isFeatured = variant === "featured";
  const flip = isFeatured && index % 2 === 1;

  const visibleTags = project.tags.slice(0, MAX_CHIPS);
  const overflowCount = project.tags.length - visibleTags.length;
  const ticks = project.metrics.slice(0, MAX_TICKS);

  const hover = reduceMotion ? undefined : "hover";
  const initial = reduceMotion ? undefined : "rest";

  const eyebrow = (
    <span className="font-mono text-eyebrow uppercase tracking-[0.14em] text-ink-text-tertiary">
      {project.platform} · {project.year}
    </span>
  );

  const arrow = (
    <motion.span
      variants={arrowVariants}
      className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-fg shadow-glow will-change-transform"
    >
      <ArrowUpRight className="size-5" aria-hidden="true" />
    </motion.span>
  );

  const media = (
    <div className="overflow-hidden rounded-xl sm:rounded-2xl">
      <motion.div variants={mediaVariants} className="will-change-transform">
        <DeviceFrame variant="browser" label={project.title}>
          {project.image ? (
            // decorative inside the card link — its aria-label already names the project
            <Image
              src={project.image}
              alt=""
              fill
              quality={90}
              // The 16:12 screen cover-crops wide app screenshots (~2.3:1), so
              // the source must be ~1.7× the displayed width to stay sharp.
              sizes="(min-width: 1024px) 62rem, 155vw"
              className="object-cover"
            />
          ) : undefined}
        </DeviceFrame>
      </motion.div>
    </div>
  );

  /* ── featured: full-width, two columns ─────────────────────────────────── */
  if (isFeatured) {
    return (
      <motion.article
        variants={cardVariants}
        initial={initial}
        whileHover={hover}
        whileFocus={hover}
        className={cn("group h-full will-change-transform", className)}
      >
        <Link
          href={`/work/${project.slug}`}
          aria-label={`${project.title} — read case study`}
          className={cn(
            "grid items-center gap-8 overflow-hidden rounded-3xl border border-ink-border bg-ink p-6 ring-hairline-ink shadow-card",
            "transition-colors duration-300 group-hover:border-accent/40 focus-visible:outline-none focus-visible:border-accent/60",
            "sm:p-8 lg:grid-cols-2 lg:gap-12 lg:p-10",
            flip && "lg:[&>*:first-child]:order-2",
          )}
        >
          {media}

          <div className="flex flex-col gap-5">
            {eyebrow}
            <h3 className="font-display text-display-lg text-ink-text">{project.title}</h3>
            <p className="max-w-[46ch] text-body-lg text-ink-text-secondary">{project.tagline}</p>

            {visibleTags.length > 0 && (
              <ul className="flex flex-wrap gap-2" aria-label="Tech stack">
                {visibleTags.map((tag) => (
                  <li key={tag}>
                    <InkChip>{tag}</InkChip>
                  </li>
                ))}
                {overflowCount > 0 && (
                  <li>
                    <InkChip>＋{overflowCount}</InkChip>
                  </li>
                )}
              </ul>
            )}

            {ticks.length > 0 && (
              <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/8 pt-5">
                {ticks.map((metric) => (
                  <li key={metric.label} className="font-mono text-xs">
                    <span className="text-accent">▸ </span>
                    <span className="text-ink-text">{metric.value}</span>{" "}
                    <span className="text-ink-text-tertiary">{metric.label}</span>
                  </li>
                ))}
              </ul>
            )}

            <span className="mt-1 inline-flex items-center gap-3 text-sm font-medium text-ink-text">
              Read case study
              {arrow}
            </span>
          </div>
        </Link>
      </motion.article>
    );
  }

  /* ── grid: compact card ────────────────────────────────────────────────── */
  return (
    <motion.article
      variants={cardVariants}
      initial={initial}
      whileHover={hover}
      whileFocus={hover}
      className={cn("group h-full will-change-transform", className)}
    >
      <Link
        href={`/work/${project.slug}`}
        aria-label={`${project.title} — read case study`}
        className={cn(
          "flex h-full flex-col gap-5 overflow-hidden rounded-2xl border border-ink-border bg-ink p-5 ring-hairline-ink shadow-card sm:p-6",
          "transition-colors duration-300 group-hover:border-accent/40 focus-visible:outline-none focus-visible:border-accent/60",
        )}
      >
        {media}

        <div className="flex flex-1 flex-col gap-3.5">
          {eyebrow}
          <h3 className="font-display text-h3 text-ink-text">{project.title}</h3>
          <p className="max-w-[42ch] text-sm text-ink-text-secondary">{project.tagline}</p>

          {visibleTags.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Tech stack">
              {visibleTags.map((tag) => (
                <li key={tag}>
                  <InkChip>{tag}</InkChip>
                </li>
              ))}
              {overflowCount > 0 && (
                <li>
                  <InkChip>＋{overflowCount}</InkChip>
                </li>
              )}
            </ul>
          )}

          <span className="mt-auto flex items-center justify-between gap-3 border-t border-white/8 pt-4 text-sm font-medium text-ink-text">
            Read case study
            {arrow}
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
