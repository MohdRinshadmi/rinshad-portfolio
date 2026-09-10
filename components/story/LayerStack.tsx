"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useScrubProgress } from "@/lib/hooks/use-scrub-progress";
import { Chip } from "@/components/ui/Chip";
import type { chapterSystems } from "@/lib/content/story";
import { cn } from "@/lib/utils";

type Layer = (typeof chapterSystems.layers)[number];

/**
 * LayerStack — a production system, client to AI, as a vertical rail. Scrolling
 * past it draws the rail from layer to layer and lights each numbered node as
 * the line reaches it; scrolling back undoes it.
 *
 * Only decorative spans move (scaleY and opacity). The layer names, their
 * responsibilities and the technology chips are never faded, so they read at
 * full contrast whatever the scroll position.
 */
export function LayerStack({ layers }: { layers: readonly Layer[] }) {
  const listRef = useRef<HTMLOListElement>(null);
  const reduceMotion = useReducedMotion();
  const hydrated = useHydrated();

  const progress = useScrubProgress(listRef, ["start 0.75", "end 0.6"]);
  const animate = hydrated && !reduceMotion;
  const steps = Math.max(1, layers.length - 1);

  return (
    <ol ref={listRef} aria-label="Layers of a production system, from client to AI">
      {layers.map((layer, index) => (
        <LayerRow
          key={layer.id}
          layer={layer}
          index={index}
          steps={steps}
          last={index === layers.length - 1}
          progress={progress}
          animate={animate}
        />
      ))}
    </ol>
  );
}

function LayerRow({
  layer,
  index,
  steps,
  last,
  progress,
  animate,
}: {
  layer: Layer;
  index: number;
  steps: number;
  last: boolean;
  progress: MotionValue<number>;
  animate: boolean;
}) {
  const at = index / steps;
  const lit = useTransform(progress, [Math.max(0, at - 0.06), at], [0, 1]);
  const draw = useTransform(progress, [at, Math.min(1, (index + 1) / steps)], [0, 1]);

  return (
    <li className={cn("relative grid grid-cols-[2.5rem_1fr] gap-x-5 sm:gap-x-7", !last && "pb-10 sm:pb-12")}>
      {/* Rail segment to the next layer: neutral track, accent draw on top. */}
      {!last ? (
        <span aria-hidden="true" className="absolute bottom-0 left-5 top-10 w-px -translate-x-1/2 bg-border-strong">
          <motion.span
            className="absolute inset-0 origin-top bg-accent"
            style={animate ? { scaleY: draw } : { scaleY: 0 }}
          />
        </span>
      ) : null}

      <span
        aria-hidden="true"
        className="relative flex size-10 items-center justify-center rounded-full border border-border-strong bg-bg font-mono text-xs text-text-tertiary"
      >
        <motion.span
          className="absolute -inset-px rounded-full border border-accent bg-accent/10"
          style={animate ? { opacity: lit } : { opacity: 0 }}
        />
        <span className="relative">{String(index + 1).padStart(2, "0")}</span>
      </span>

      <div className="min-w-0 pt-1.5">
        <h3 className="font-display text-h3 text-text">{layer.label}</h3>
        <p className="mt-1.5 max-w-[48ch] text-text-secondary">{layer.role}</p>
        <ul aria-label={`${layer.label} technologies`} className="mt-4 flex flex-wrap gap-1.5">
          {layer.tech.map((tech) => (
            <li key={tech}>
              <Chip>{tech}</Chip>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}
