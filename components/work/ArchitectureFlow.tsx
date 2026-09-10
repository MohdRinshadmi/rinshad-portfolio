"use client";

import { useRef, type CSSProperties } from "react";
import { motion, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useScrubProgress } from "@/lib/hooks/use-scrub-progress";
import type { ArchNode } from "@/lib/types";
import { cn } from "@/lib/utils";

type Tone = "ink" | "paper";

/* Small text on the ink card uses `ink-text-secondary`, not `-tertiary`
   (4.2:1 — under AA at 10–11px), and `accent-hover` rather than `accent`. */
const TONES = {
  ink: {
    figure: "border-white/8 bg-white/[0.02]",
    grid: "bg-grid-ink opacity-50",
    node: "border-white/10 bg-ink-raised",
    critical: "border-accent/45 bg-ink-raised",
    layer: "text-ink-text-secondary",
    layerCritical: "text-accent-hover",
    label: "text-ink-text",
    sub: "text-ink-text-secondary",
    line: "bg-white/30",
  },
  paper: {
    figure: "border-border bg-bg shadow-card ring-hairline",
    grid: "bg-grid opacity-60",
    node: "border-border bg-surface",
    critical: "border-accent/40 bg-surface",
    layer: "text-text-tertiary",
    layerCritical: "text-accent-text",
    label: "text-text",
    sub: "text-text-secondary",
    line: "bg-border-strong",
  },
} as const;

/**
 * ArchitectureFlow — a project's request path as a row of nodes (a column on
 * phones). As it scrolls into place the connectors draw in, one hop at a time,
 * and the critical-path nodes light their accent edge.
 *
 * HTML, not SVG. An SVG can't reflow, so the previous canvas shipped two whole
 * diagrams — horizontal and vertical — with every label in the DOM twice. Here
 * each label exists exactly once and CSS picks the axis; only the connectors
 * carry both orientations, and they hold no text.
 *
 * Motion is transform + opacity on decorative spans only. Text is never faded,
 * so it is always at full contrast — for readers and for audits alike.
 */
export function ArchitectureFlow({
  nodes,
  label,
  tone = "ink",
  className,
}: {
  nodes: ArchNode[];
  /** Accessible caption for the figure, e.g. "Request path". */
  label: string;
  tone?: Tone;
  className?: string;
}) {
  const listRef = useRef<HTMLOListElement>(null);
  const reduceMotion = useReducedMotion();
  const hydrated = useHydrated();

  // Completes while a stacked card is still rising, so the path is fully drawn
  // by the time the card settles and pins.
  const progress = useScrubProgress(listRef, ["start 0.95", "start 0.5"]);
  const animate = hydrated && !reduceMotion;
  const t = TONES[tone];
  const steps = Math.max(1, nodes.length - 1);

  return (
    <figure className={cn("relative overflow-hidden rounded-2xl border p-4 sm:p-5", t.figure, className)}>
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 [mask-image:radial-gradient(80%_75%_at_50%_45%,#000,transparent)]",
          t.grid,
        )}
      />
      <figcaption className="sr-only">{label}</figcaption>
      <ol
        ref={listRef}
        className="relative grid gap-5 lg:grid-cols-(--flow-cols) lg:gap-7"
        style={{ "--flow-cols": `repeat(${nodes.length}, minmax(0, 1fr))` } as CSSProperties}
      >
        {nodes.map((node, index) => (
          <FlowNode
            key={node.id}
            node={node}
            index={index}
            steps={steps}
            tone={tone}
            progress={progress}
            animate={animate}
          />
        ))}
      </ol>
    </figure>
  );
}

function FlowNode({
  node,
  index,
  steps,
  tone,
  progress,
  animate,
}: {
  node: ArchNode;
  index: number;
  steps: number;
  tone: Tone;
  progress: MotionValue<number>;
  animate: boolean;
}) {
  const t = TONES[tone];
  const at = index / steps;
  const critical = Boolean(node.critical);

  // The wire into this node draws across the previous step; the node lights
  // its edge as the wire arrives.
  const draw = useTransform(progress, [Math.max(0, (index - 1) / steps), at], [0, 1]);
  const glow = useTransform(progress, [Math.max(0, at - 0.08), Math.min(1, at + 0.04)], [0, 1]);
  const lineTone = critical ? "bg-accent" : t.line;

  return (
    <li className={cn("relative min-w-0 rounded-xl border px-4 py-3", critical ? t.critical : t.node)}>
      {index > 0 ? (
        <span
          aria-hidden="true"
          className="absolute bottom-full left-7 h-5 w-px lg:bottom-auto lg:left-auto lg:right-full lg:top-1/2 lg:h-px lg:w-7"
        >
          <motion.span
            className={cn("absolute inset-0 origin-top lg:hidden", lineTone)}
            style={animate ? { scaleY: draw } : undefined}
          />
          <motion.span
            className={cn("absolute inset-0 hidden origin-left lg:block", lineTone)}
            style={animate ? { scaleX: draw } : undefined}
          />
        </span>
      ) : null}

      {critical ? (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-3 -top-px h-px bg-accent"
          style={animate ? { opacity: glow } : undefined}
        />
      ) : null}

      {node.layer ? (
        <p
          className={cn(
            "font-mono text-[10px] uppercase leading-none tracking-[0.16em]",
            critical ? t.layerCritical : t.layer,
          )}
        >
          {node.layer}
        </p>
      ) : null}
      <p className={cn("mt-2 font-display text-[15px] font-medium leading-snug", t.label)}>{node.label}</p>
      {node.sub ? (
        <p className={cn("mt-0.5 font-mono text-[11px] leading-snug", t.sub)}>{node.sub}</p>
      ) : null}
    </li>
  );
}
