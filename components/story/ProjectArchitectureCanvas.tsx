"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { DeviceFrame } from "@/components/work/DeviceFrame";
import type { ArchNode, Project } from "@/lib/types";
import { chapterWork } from "@/lib/content/story";
import { cn } from "@/lib/utils";

/**
 * ProjectArchitectureCanvas — Chapter 04's signature. Each featured project's
 * real architecture is drawn as a hairline schematic that *draws itself* as the
 * reader scrolls: connectors stroke in (SVG pathLength), node boxes ignite in a
 * cascade, and a terracotta "current" flows along the critical path.
 *
 * It rides inside a dark "ink" card that stacks/settles on scroll (see
 * WorkStories), so the chapter reads as a deck of glossy product cards — each
 * one a live system blueprint. Motion is transform/opacity/pathLength only
 * (60fps); reduced motion and SSR render the finished diagram (every motion
 * style is gated behind `animate`, so the server ships a fully-drawn schematic).
 */

/* Per-slug presentation: the layer caption above each node, plus the short
   annotation on each critical-path edge (keyed by connector index). */
type ViewConfig = { captions: string[]; edgeLabels: Record<number, string> };

const VIEW: Record<string, ViewConfig> = {
  "ai-life-assistant": {
    captions: ["INTERFACE", "API", "MODEL", "RETRIEVAL", "OUTPUT"],
    edgeLabels: { 1: "streaming", 2: "tool + RAG" },
  },
  "realtime-collab-platform": {
    captions: ["EDITORS", "GATEWAY", "FAN-OUT", "MERGE", "ASSIST"],
    edgeLabels: { 1: "fan-out", 2: "conflict-free" },
  },
  "iot-analytics-dashboard": {
    captions: ["CLIENT", "API", "DOMAIN", "DATA ACCESS", "STORAGE"],
    edgeLabels: { 0: "REST", 1: "DI" },
  },
};

/* ── Geometry ────────────────────────────────────────────────────────────────
   Two orientations share one node/connector model. Both are rendered (the off
   one is display:none via Tailwind) so the layout is SSR-correct with no
   matchMedia and no reflow on hydration. */
type Orient = "h" | "v";

interface Geometry {
  viewBox: string;
  className: string;
  box: { w: number; h: number };
  size: { label: number; sub: number; caption: number; edge: number };
  center: (i: number) => { cx: number; cy: number };
  connector: (i: number) => string;
  caption: (i: number) => { x: number; y: number };
  edge: (i: number) => { x: number; y: number; anchor: "middle" | "start" };
}

function geometry(orient: Orient, n: number): Geometry {
  if (orient === "h") {
    const CY = 168;
    const STEP = 208;
    const X0 = 96;
    const W = 168;
    const cx = (i: number) => X0 + i * STEP;
    return {
      viewBox: `0 0 ${X0 * 2 + (n - 1) * STEP} 252`,
      className: "hidden lg:block",
      box: { w: W, h: 64 },
      size: { label: 16, sub: 10.5, caption: 10.5, edge: 11 },
      center: (i) => ({ cx: cx(i), cy: CY }),
      connector: (i) => {
        const x1 = cx(i) + W / 2;
        const x2 = cx(i + 1) - W / 2;
        return `M ${x1} ${CY} C ${x1 + 14} ${CY}, ${x2 - 14} ${CY}, ${x2} ${CY}`;
      },
      caption: (i) => ({ x: cx(i), y: 54 }),
      edge: (i) => ({ x: (cx(i) + W / 2 + cx(i + 1) - W / 2) / 2, y: 224, anchor: "middle" }),
    };
  }

  // vertical (mobile)
  const CX = 150;
  const STEP = 250;
  const Y0 = 100;
  const H = 76;
  const cy = (i: number) => Y0 + i * STEP;
  return {
    viewBox: `0 0 360 ${Y0 * 2 + (n - 1) * STEP - 20}`,
    className: "lg:hidden",
    box: { w: 220, h: H },
    size: { label: 18, sub: 12, caption: 13, edge: 13 },
    center: (i) => ({ cx: CX, cy: cy(i) }),
    connector: (i) => {
      const y1 = cy(i) + H / 2;
      const y2 = cy(i + 1) - H / 2;
      return `M ${CX} ${y1} C ${CX} ${y1 + 50}, ${CX} ${y2 - 50}, ${CX} ${y2}`;
    },
    caption: (i) => ({ x: CX, y: cy(i) - 50 }),
    edge: (i) => ({ x: CX + 26, y: (cy(i) + cy(i + 1)) / 2 + 4, anchor: "start" }),
  };
}

/* ── Component ─────────────────────────────────────────────────────────────── */
export function ProjectArchitectureCanvas({ project }: { project: Project; index?: number }) {
  const reduceMotion = useReducedMotion();
  const hydrated = useHydrated();
  const figureRef = useRef<HTMLElement>(null);

  // One scroll signal for both orientations; the off one is display:none.
  // The window completes EARLY (while the card is still rising) so the diagram
  // is fully drawn by the time the card settles + pins in the stacking deck.
  const { scrollYProgress } = useScroll({
    target: figureRef,
    offset: ["start 0.9", "start 0.45"],
  });

  const animate = hydrated && !reduceMotion;
  const view = VIEW[project.slug] ?? { captions: [], edgeLabels: {} };
  const feature = chapterWork.features[project.slug];

  const kicker = feature?.kicker ?? project.platform;
  const hook = feature?.hook ?? project.tagline;

  return (
    <article className="relative overflow-hidden rounded-3xl border border-ink-border bg-ink p-6 ring-hairline-ink shadow-card sm:p-8">
      {/* ── Header: narrative + project shot ─────────────────────────────── */}
      <header className="grid gap-y-7 lg:grid-cols-12 lg:gap-x-10">
        <div className="lg:col-span-7">
          <p className="font-grotesk text-eyebrow font-medium uppercase tracking-[0.14em] text-ink-text-tertiary">
            {kicker}
          </p>
          <h3 className="mt-3 font-serif text-display-lg text-ink-text">{project.title}</h3>
          <p className="mt-4 max-w-[44ch] text-body-lg text-ink-text-secondary">{hook}</p>

          <Link
            href={`/work/${project.slug}`}
            aria-label={`${project.title} — read the case study`}
            className="group/cta mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg shadow-glow transition-colors duration-200 hover:bg-accent-hover focus-visible:bg-accent-hover"
          >
            Read the story
            <ArrowUpRight
              aria-hidden="true"
              className="size-4 transition-transform duration-200 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5"
            />
          </Link>
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          {/* Project shot — framed in dark browser chrome. */}
          <DeviceFrame variant="browser" label={project.title}>
            {project.image ? (
              <Image
                src={project.image}
                alt=""
                fill
                quality={90}
                // 16:12 screen cover-crops wide screenshots — request ~1.7×
                // the displayed width so the crop stays sharp.
                sizes="(min-width: 1024px) 45rem, 155vw"
                className="object-cover"
              />
            ) : undefined}
          </DeviceFrame>
        </div>
      </header>

      {/* ── Architecture diagram (draws itself on scroll) ────────────────── */}
      <figure
        ref={figureRef}
        className="relative mt-7 overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02] p-4 sm:mt-8 sm:p-6"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-grid-ink opacity-60 [mask-image:radial-gradient(80%_75%_at_50%_45%,#000,transparent)]"
        />

        <div className="relative">
          <DiagramSvg orient="h" project={project} view={view} progress={scrollYProgress} animate={animate} />
          <DiagramSvg orient="v" project={project} view={view} progress={scrollYProgress} animate={animate} />
        </div>
      </figure>

      {/* ── Compact meta: difficulty / outcome ───────────────────────────── */}
      {(feature?.difficulty || feature?.outcome) && (
        <dl className="mt-6 grid gap-x-10 gap-y-4 sm:grid-cols-2">
          {feature?.difficulty && (
            <div>
              <dt className="font-mono text-eyebrow uppercase tracking-[0.14em] text-ink-text-tertiary">
                Difficulty
              </dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-ink-text-secondary">
                {feature.difficulty}
              </dd>
            </div>
          )}
          {feature?.outcome && (
            <div>
              <dt className="font-mono text-eyebrow uppercase tracking-[0.14em] text-accent">
                Outcome
              </dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-ink-text">{feature.outcome}</dd>
            </div>
          )}
        </dl>
      )}
    </article>
  );
}

/* ── One oriented schematic ──────────────────────────────────────────────── */
function DiagramSvg({
  orient,
  project,
  view,
  progress,
  animate,
}: {
  orient: Orient;
  project: Project;
  view: ViewConfig;
  progress: MotionValue<number>;
  animate: boolean;
}) {
  const nodes = project.architecture.nodes;
  const n = nodes.length;
  const g = geometry(orient, n);
  const connectorCount = n - 1;

  // A connector is on the critical path when the node it FEEDS INTO is critical
  // (matches the static ArchitectureDiagram's contract).
  const isCritical = (i: number) => Boolean(nodes[i + 1]?.critical);

  return (
    <svg
      viewBox={g.viewBox}
      className={cn("mx-auto w-full max-w-[62rem]", g.className)}
      role="img"
      aria-label={archLabel(project)}
    >
      {/* base connectors — neutral hairline, drawn in flow order */}
      {Array.from({ length: connectorCount }, (_, i) => (
        <Connector
          key={`c-${i}`}
          d={g.connector(i)}
          range={[i / connectorCount, (i + 1) / connectorCount]}
          progress={progress}
          animate={animate}
        />
      ))}

      {/* critical-path current — terracotta overlay over the hot edges only */}
      {Array.from({ length: connectorCount }, (_, i) =>
        isCritical(i) ? (
          <CurrentPath key={`cur-${i}`} d={g.connector(i)} progress={progress} animate={animate} />
        ) : null,
      )}

      {/* short annotations on the critical edges */}
      {Object.entries(view.edgeLabels).map(([k, text]) => {
        const i = Number(k);
        const pos = g.edge(i);
        return (
          <EdgeLabel
            key={`e-${k}`}
            x={pos.x}
            y={pos.y}
            anchor={pos.anchor}
            size={g.size.edge}
            text={text}
            progress={progress}
            animate={animate}
          />
        );
      })}

      {/* nodes (painted last so the boxes stay crisp over the connectors) */}
      {nodes.map((node, i) => {
        const { cx, cy } = g.center(i);
        return (
          <DiagramNode
            key={node.id}
            node={node}
            caption={view.captions[i]}
            cx={cx}
            cy={cy}
            box={g.box}
            size={g.size}
            captionY={g.caption(i).y}
            at={n > 1 ? i / (n - 1) : 0}
            progress={progress}
            animate={animate}
          />
        );
      })}
    </svg>
  );
}

/* ── Pieces (one hook-owner each — keeps rules-of-hooks happy) ────────────── */

function Connector({
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
    <motion.path
      d={d}
      fill="none"
      strokeWidth={1.25}
      strokeLinecap="round"
      className="stroke-white/20"
      style={animate ? { pathLength } : undefined}
    />
  );
}

function CurrentPath({
  d,
  progress,
  animate,
}: {
  d: string;
  progress: MotionValue<number>;
  animate: boolean;
}) {
  // Flows slightly behind the base draw, through the middle of the scroll.
  const pathLength = useTransform(progress, [0.15, 0.85], [0, 1]);
  return (
    <motion.path
      d={d}
      fill="none"
      strokeWidth={1.75}
      strokeLinecap="round"
      className="stroke-accent"
      style={animate ? { pathLength } : undefined}
    />
  );
}

function EdgeLabel({
  x,
  y,
  anchor,
  size,
  text,
  progress,
  animate,
}: {
  x: number;
  y: number;
  anchor: "middle" | "start";
  size: number;
  text: string;
  progress: MotionValue<number>;
  animate: boolean;
}) {
  const opacity = useTransform(progress, [0.2, 0.7], [0, 1]);
  return (
    <motion.text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={size}
      className="fill-accent-hover font-mono"
      style={animate ? { opacity } : undefined}
    >
      {text}
    </motion.text>
  );
}

function DiagramNode({
  node,
  caption,
  cx,
  cy,
  box,
  size,
  captionY,
  at,
  progress,
  animate,
}: {
  node: ArchNode;
  caption?: string;
  cx: number;
  cy: number;
  box: { w: number; h: number };
  size: { label: number; sub: number; caption: number };
  captionY: number;
  at: number;
  progress: MotionValue<number>;
  animate: boolean;
}) {
  // Cascade-overlap ignition: each node's window overlaps the previous one, so
  // the row lights up as a wave rather than ticking on one box at a time.
  const opacity = useTransform(
    progress,
    [Math.max(0, at - 0.1), Math.min(1, at + 0.04)],
    [0.25, 1],
  );

  const x = cx - box.w / 2;
  const y = cy - box.h / 2;
  const critical = Boolean(node.critical);

  return (
    <motion.g style={animate ? { opacity } : undefined}>
      {caption ? (
        <text
          x={cx}
          y={captionY}
          textAnchor="middle"
          fontSize={size.caption}
          className="fill-ink-text-tertiary font-mono uppercase tracking-[0.16em]"
        >
          {caption}
        </text>
      ) : null}

      <rect
        x={x}
        y={y}
        width={box.w}
        height={box.h}
        rx={10}
        strokeWidth={critical ? 1.25 : 1}
        className={critical ? "fill-white/5 stroke-accent/50" : "fill-white/5 stroke-white/10"}
      />

      {/* critical path co-signalled without colour: a hairline strip on top */}
      {critical ? (
        <line
          x1={x + 14}
          y1={y}
          x2={x + box.w - 14}
          y2={y}
          strokeWidth={1.5}
          strokeLinecap="round"
          className="stroke-accent/70"
        />
      ) : null}

      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fontSize={size.label}
        className="fill-ink-text font-display font-medium"
      >
        {node.label}
      </text>
      {node.sub ? (
        <text
          x={cx}
          y={cy + size.sub + 4}
          textAnchor="middle"
          fontSize={size.sub}
          className="fill-ink-text-secondary font-mono"
        >
          {node.sub}
        </text>
      ) : null}
    </motion.g>
  );
}

/* Concise flow summary for assistive tech — names the critical path without
   re-reading every node (the node <text> already covers that). */
function archLabel(project: Project): string {
  const nodes = project.architecture.nodes;
  const flow = nodes.map((node) => node.label).join(" to ");
  const critical = nodes
    .filter((node) => node.critical)
    .map((node) => node.label)
    .join(" and ");
  return `${project.title} architecture: ${flow}.${
    critical ? ` Critical path: ${critical}.` : ""
  }`;
}
