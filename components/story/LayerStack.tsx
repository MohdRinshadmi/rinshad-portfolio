"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useScrubProgress } from "@/lib/hooks/use-scrub-progress";
import { Chip } from "@/components/ui/Chip";
import type { chapterSystems } from "@/lib/content/story";
import { cn } from "@/lib/utils";

type Layer = (typeof chapterSystems.layers)[number];

/** A node's centre and radius, in px, relative to the list. */
interface Point {
  x: number;
  y: number;
  r: number;
}

/* Gap between a node's edge and where the curve leaves or meets it. */
const NODE_GAP = 6;

/** The S-curve from one node down to the next: leave straight down, swing
    across the gutter, arrive straight down. Same shape as the old Systems
    canvas connectors, but fitted to real, measured node positions. */
function snakePath(a: Point, b: Point): string {
  const y1 = a.y + a.r + NODE_GAP;
  const y2 = b.y - b.r - NODE_GAP;
  const k = (y2 - y1) * 0.55;
  const f = (n: number) => n.toFixed(1);
  return `M ${f(a.x)} ${f(y1)} C ${f(a.x)} ${f(y1 + k)}, ${f(b.x)} ${f(y2 - k)}, ${f(b.x)} ${f(y2)}`;
}

/**
 * LayerStack — a production system, client to AI, threaded on a snaking line.
 * The numbered nodes zigzag down a gutter beside the content, and as the
 * reader scrolls each curve draws itself into the next node, which lights as
 * the line arrives. Scrolling back un-draws it.
 *
 * The curves are an SVG laid over the list and fitted to the nodes' measured
 * positions (re-measured on resize and reflow), so the layer text and chips
 * stay ordinary HTML — one copy, fully responsive, never faded. Only the
 * decorative path and node rings move.
 */
export function LayerStack({ layers }: { layers: readonly Layer[] }) {
  const listRef = useRef<HTMLOListElement>(null);
  const nodeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [points, setPoints] = useState<Point[] | null>(null);
  const reduceMotion = useReducedMotion();
  const hydrated = useHydrated();

  const progress = useScrubProgress(listRef, ["start 0.75", "end 0.6"]);
  const animate = hydrated && !reduceMotion;
  const steps = Math.max(1, layers.length - 1);

  // Fit the curves to where the nodes actually are. A ResizeObserver on the
  // list catches breakpoint changes, late web fonts and chip rows re-wrapping.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const measure = () => {
      const box = list.getBoundingClientRect();
      const next: Point[] = [];
      for (const node of nodeRefs.current) {
        if (!node) return;
        const r = node.getBoundingClientRect();
        next.push({
          x: r.left - box.left + r.width / 2,
          y: r.top - box.top + r.height / 2,
          r: r.width / 2,
        });
      }
      setPoints(next);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  return (
    <ol
      ref={listRef}
      aria-label="Layers of a production system, from client to AI"
      className="relative"
    >
      {points ? (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        >
          {points.slice(0, -1).map((point, i) => (
            <SnakeSegment
              key={i}
              d={snakePath(point, points[i + 1])}
              range={[i / steps, (i + 1) / steps]}
              progress={progress}
              animate={animate}
            />
          ))}
        </svg>
      ) : null}

      {layers.map((layer, index) => (
        <LayerRow
          key={layer.id}
          layer={layer}
          index={index}
          steps={steps}
          last={index === layers.length - 1}
          progress={progress}
          animate={animate}
          settled={hydrated && Boolean(reduceMotion)}
          nodeRef={(el) => {
            nodeRefs.current[index] = el;
          }}
        />
      ))}
    </ol>
  );
}

function SnakeSegment({
  d,
  range,
  progress,
  animate,
}: {
  d: string;
  range: [number, number];
  progress: MotionValue<number>;
  animate: boolean;
}) {
  const pathLength = useTransform(progress, range, [0, 1]);
  return (
    <>
      {/* Neutral track: the whole route is visible before it is travelled. */}
      <path d={d} fill="none" strokeWidth={1.25} className="stroke-text/15" />
      {/* The accent line that draws along it. Reduced motion: fully drawn. */}
      <motion.path
        d={d}
        fill="none"
        strokeWidth={1.5}
        strokeLinecap="round"
        className="stroke-accent"
        style={animate ? { pathLength } : undefined}
      />
    </>
  );
}

function LayerRow({
  layer,
  index,
  steps,
  last,
  progress,
  animate,
  settled,
  nodeRef,
}: {
  layer: Layer;
  index: number;
  steps: number;
  last: boolean;
  progress: MotionValue<number>;
  animate: boolean;
  /** Hydrated with reduced motion: show the finished diagram. */
  settled: boolean;
  nodeRef: (el: HTMLSpanElement | null) => void;
}) {
  const at = index / steps;
  const lit = useTransform(progress, [Math.max(0, at - 0.06), at], [0, 1]);
  // Nodes alternate between the two edges of the gutter; that alternation is
  // what turns the connecting curves into a snake.
  const swung = index % 2 === 1;

  return (
    <li className={cn("relative pl-16 sm:pl-24 lg:pl-28", !last && "pb-12 sm:pb-14")}>
      <span
        ref={nodeRef}
        aria-hidden="true"
        className={cn(
          "absolute top-0.5 flex size-8 items-center justify-center rounded-full border border-border-strong bg-bg font-mono text-[11px] text-text-tertiary sm:size-10 sm:text-xs",
          swung ? "left-6 sm:left-12 lg:left-16" : "left-0",
        )}
      >
        <motion.span
          className="absolute -inset-px rounded-full border border-accent bg-accent/10"
          style={animate ? { opacity: lit } : { opacity: settled ? 1 : 0 }}
        />
        <span className="relative">{String(index + 1).padStart(2, "0")}</span>
      </span>

      <div className="min-w-0 pt-1 sm:pt-1.5">
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
