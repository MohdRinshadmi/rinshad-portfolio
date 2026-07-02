"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { ChapterMark } from "@/components/story/ChapterMark";
import { ScrubText } from "@/components/motion/ScrubText";
import { chapterSystems } from "@/lib/content/story";

/* Canvas geometry — nodes alternate left/right down a 380×1240 sheet. */
const NODE_X = [120, 260] as const;
const NODE_GAP = 228;
const NODE_TOP = 50;
const NODE_R = 30;

const nodePos = (i: number) => ({ x: NODE_X[i % 2], y: NODE_TOP + i * NODE_GAP });

const connectorPath = (i: number) => {
  const a = nodePos(i);
  const b = nodePos(i + 1);
  return `M ${a.x} ${a.y + NODE_R + 12} C ${a.x} ${a.y + 140}, ${b.x} ${b.y - 140}, ${b.x} ${b.y - NODE_R - 12}`;
};

/**
 * Chapter 03 — Systems Thinking. A sticky narrative column beside a tall
 * architecture canvas: as the reader scrolls, hairline connectors draw
 * themselves from People down to AI and each node ignites in turn. The drawing
 * is scrubbed (reversible), not played; reduced motion and SSR render the
 * finished diagram.
 */
export function SystemsCanvas() {
  const reduceMotion = useReducedMotion();
  const hydrated = useHydrated();
  const canvasRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: canvasRef,
    offset: ["start 0.8", "end 0.6"],
  });

  const nodes = chapterSystems.nodes;
  const animate = hydrated && !reduceMotion;

  return (
    <section id="chapter-03" className="section-py">
      <div className="container-page">
        <div className="grid gap-16 lg:grid-cols-[5fr_6fr] lg:gap-24">
          {/* ── Narrative (sticky beside the canvas) ─────────────────── */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <ChapterMark number={chapterSystems.number} title={chapterSystems.title} />
            <div className="mt-12 space-y-10">
              {chapterSystems.paragraphs.map((paragraph) => (
                <ScrubText
                  key={paragraph.slice(0, 24)}
                  text={paragraph}
                  className="text-h3 font-display font-medium"
                />
              ))}
            </div>
            <p className="mt-12 font-serif text-h2 italic text-accent">{chapterSystems.closing}</p>
          </div>

          {/* ── The canvas ───────────────────────────────────────────── */}
          <div ref={canvasRef} className="relative">
            <svg
              viewBox="0 0 380 1240"
              className="w-full max-w-[26rem] lg:ml-auto"
              role="img"
              aria-label="System map: people, interfaces, APIs, real-time, cloud, and AI — connected as one ecosystem"
            >
              {nodes.slice(0, -1).map((node, i) => (
                <Connector
                  key={`${node.id}-out`}
                  d={connectorPath(i)}
                  progress={scrollYProgress}
                  range={[i / (nodes.length - 1), (i + 1) / (nodes.length - 1)]}
                  animate={animate}
                />
              ))}
              {nodes.map((node, i) => (
                <CanvasNode
                  key={node.id}
                  index={i}
                  label={node.label}
                  sub={node.sub}
                  progress={scrollYProgress}
                  at={i / (nodes.length - 1)}
                  animate={animate}
                />
              ))}
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Pieces (one component per hook-owner; keeps rules-of-hooks happy) ──── */

function Connector({
  d,
  progress,
  range,
  animate,
}: {
  d: string;
  progress: MotionValue<number>;
  range: [number, number];
  animate: boolean;
}) {
  const pathLength = useTransform(progress, range, [0, 1]);
  return (
    <motion.path
      d={d}
      fill="none"
      strokeWidth="1.25"
      className="stroke-text/30"
      style={animate ? { pathLength } : undefined}
    />
  );
}

function CanvasNode({
  index,
  label,
  sub,
  progress,
  at,
  animate,
}: {
  index: number;
  label: string;
  sub: string;
  progress: MotionValue<number>;
  at: number;
  animate: boolean;
}) {
  const { x, y } = nodePos(index);
  const onLeft = index % 2 === 0;
  const textX = onLeft ? x + NODE_R + 22 : x - NODE_R - 22;
  const opacity = useTransform(progress, [Math.max(0, at - 0.06), Math.min(1, at + 0.02)], [0.3, 1]);

  return (
    <motion.g style={animate ? { opacity } : undefined}>
      <circle cx={x} cy={y} r={NODE_R} fill="none" strokeWidth="1" className="stroke-text/25" />
      <circle cx={x} cy={y} r="4.5" className="fill-accent" />
      <text
        x={textX}
        y={y - 2}
        textAnchor={onLeft ? "start" : "end"}
        fontSize="21"
        className="fill-text font-display font-medium"
      >
        {label}
      </text>
      <text
        x={textX}
        y={y + 20}
        textAnchor={onLeft ? "start" : "end"}
        fontSize="11"
        className="fill-text-tertiary font-mono"
      >
        {sub}
      </text>
    </motion.g>
  );
}
