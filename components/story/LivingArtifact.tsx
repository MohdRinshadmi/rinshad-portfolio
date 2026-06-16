"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useHydrated } from "@/lib/use-hydrated";
import { artifactLayers } from "@/lib/story";
import { cn } from "@/lib/utils";

/* Desk positions for the three stacked sheets: front, middle, back.
   transformOrigin is "top" so scaled-back sheets keep clean, predictable
   top edges peeking above the front card. */
const SLOTS = [
  { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 },
  { x: 10, y: -26, rotate: 1.6, scale: 0.96, opacity: 0.9 },
  { x: -10, y: -50, rotate: -2, scale: 0.92, opacity: 0.75 },
] as const;

const CYCLE_MS = 4600;

/**
 * LivingArtifact — the prologue's right-hand storytelling panel. Three "desk
 * papers" show one product evolving: a margin-note idea, the architecture
 * sketch, the shipped interface. The front sheet cycles to the back every few
 * seconds (paused off-screen, disabled for reduced motion); sheets behind the
 * front fade to blank paper so the stack reads as clean edges, not clipped
 * text. The rail beneath lets the reader flip layers by hand.
 */
export function LivingArtifact() {
  const reduceMotion = useReducedMotion();
  const hydrated = useHydrated();
  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stageRef, { amount: 0.4 });
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!hydrated || reduceMotion || !inView) return;
    const id = setInterval(() => setActive((a) => (a + 1) % artifactLayers.length), CYCLE_MS);
    return () => clearInterval(id);
  }, [hydrated, reduceMotion, inView]);

  return (
    <div className="w-full max-w-[26rem] lg:ml-auto">
      {/* Desk stage — pt reserves room for the back sheets' edges */}
      <div ref={stageRef} className="relative aspect-[4/4.4] pt-14">
        {artifactLayers.map((layer, i) => {
          const depth = (i - active + SLOTS.length) % SLOTS.length;
          const slot = SLOTS[depth];
          return (
            <motion.div
              key={layer.key}
              initial={false}
              animate={reduceMotion ? undefined : { ...slot }}
              transition={{ type: "spring", stiffness: 150, damping: 26 }}
              style={{ zIndex: SLOTS.length - depth, transformOrigin: "top center" }}
              className="absolute inset-x-0 top-14 bottom-0 will-change-transform"
            >
              <ArtifactCard
                index={i}
                layerKey={layer.key}
                note={layer.note}
                caption={layer.caption}
                active={depth === 0 || reduceMotion === true}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Evolution rail — also manual controls */}
      <div className="mt-8 grid grid-cols-3 gap-3" role="tablist" aria-label="Product evolution">
        {artifactLayers.map((layer, i) => (
          <button
            key={layer.key}
            type="button"
            role="tab"
            aria-selected={active === i}
            onClick={() => setActive(i)}
            className="group text-left"
          >
            <span
              className={cn(
                "block h-px w-full transition-colors duration-300",
                active === i ? "bg-accent" : "bg-border-strong group-hover:bg-text/30",
              )}
            />
            <span
              className={cn(
                "mt-3 block font-mono text-[11px] uppercase tracking-[0.14em] transition-colors duration-300",
                active === i ? "text-text" : "text-text-muted group-hover:text-text-tertiary",
              )}
            >
              0{i + 1} · {layer.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── The three sheets ───────────────────────────────────────────────────── */

interface SheetProps {
  index: number;
  layerKey: string;
  note: string;
  caption: string;
  /** Front sheet shows its content; sheets behind fade to blank paper. */
  active: boolean;
}

function ArtifactCard({ index, layerKey, note, caption, active }: SheetProps) {
  const content = cn(
    "flex h-full flex-col transition-opacity duration-500",
    active ? "opacity-100" : "opacity-0",
  );

  if (layerKey === "product") {
    return (
      <article className="h-full overflow-hidden rounded-xl border border-ink-border bg-ink shadow-raised ring-hairline-ink">
        <div className={content}>
          <SheetHeading dark index={index} caption={caption} />
          <div className="relative flex-1 bg-product p-6">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-grid-ink opacity-60 [mask-image:radial-gradient(85%_85%_at_50%_40%,#000,transparent)]"
            />
            {/* Streaming conversation, mid-flight */}
            <div className="relative space-y-3" aria-hidden="true">
              <div className="ml-auto w-3/5 rounded-lg bg-white/10 px-3 py-2">
                <div className="h-1.5 w-4/5 rounded-full bg-white/25" />
              </div>
              <div className="w-4/5 rounded-lg border border-ink-border bg-ink-raised px-3 py-2.5">
                <div className="font-mono text-[10px] text-accent">→ tool: retrieve()</div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-white/15" />
                <div className="mt-1.5 h-1.5 w-2/3 rounded-full bg-white/15" />
                <span className="mt-2 inline-block h-3 w-1.5 animate-caret bg-accent/80 align-middle" />
              </div>
            </div>
            <p className="absolute inset-x-6 bottom-5 font-mono text-[11px] leading-relaxed text-ink-text-secondary">
              {note}
            </p>
          </div>
        </div>
      </article>
    );
  }

  if (layerKey === "architecture") {
    return (
      <article className="h-full overflow-hidden rounded-xl border border-border-strong bg-surface shadow-card ring-hairline">
        <div className={content}>
          <SheetHeading index={index} caption={caption} />
          <div className="relative flex-1 p-6">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(90%_90%_at_50%_40%,#000,transparent)]"
            />
            {/* The deciding sketch — client ⇄ gateway ⇄ models */}
            <svg viewBox="0 0 280 170" className="relative w-full" aria-hidden="true">
              <g className="font-mono" fontSize="10">
                <rect x="16" y="18" width="84" height="34" rx="7" className="fill-surface-raised stroke-border-strong" />
                <text x="58" y="39" textAnchor="middle" className="fill-text">client</text>
                <rect x="98" y="98" width="84" height="34" rx="7" className="fill-surface-raised stroke-accent/60" />
                <text x="140" y="119" textAnchor="middle" className="fill-text">gateway</text>
                <rect x="180" y="18" width="84" height="34" rx="7" className="fill-surface-raised stroke-border-strong" />
                <text x="222" y="39" textAnchor="middle" className="fill-text">models</text>
              </g>
              <path
                d="M 62 52 C 70 80 92 96 110 100"
                className="stroke-text/45"
                strokeWidth="1.2"
                strokeDasharray="3 4"
                fill="none"
              />
              <path
                d="M 218 52 C 210 80 188 96 170 100"
                className="stroke-text/45"
                strokeWidth="1.2"
                strokeDasharray="3 4"
                fill="none"
              />
              <circle cx="140" cy="115" r="2.5" className="fill-accent" />
              <text x="140" y="156" textAnchor="middle" fontSize="9" className="fill-text-tertiary font-mono">
                streaming · cancellation · traces
              </text>
            </svg>
            <p className="absolute inset-x-6 bottom-5 font-mono text-[11px] leading-relaxed text-text-secondary">
              {note}
            </p>
          </div>
        </div>
      </article>
    );
  }

  /* idea — the handwritten margin note */
  return (
    <article className="h-full overflow-hidden rounded-xl border border-border-strong bg-surface-raised shadow-card ring-hairline">
      <div className={content}>
        <SheetHeading index={index} caption={caption} />
        <div className="relative flex flex-1 flex-col justify-center p-7">
          <p className="font-serif text-[1.55rem] italic leading-snug text-text">{note}</p>
          {/* hand-drawn underline */}
          <svg viewBox="0 0 220 12" className="mt-5 w-44" aria-hidden="true">
            <path
              d="M 4 8 C 50 2 90 10 130 5 C 160 2 195 7 216 4"
              className="stroke-accent"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>
      </div>
    </article>
  );
}

function SheetHeading({ index, caption, dark = false }: { index: number; caption: string; dark?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-4 border-b px-6 py-4",
        dark ? "border-ink-border" : "border-border",
      )}
    >
      <span className={cn("font-mono text-[11px] uppercase tracking-[0.14em]", dark ? "text-ink-text-secondary" : "text-text-tertiary")}>
        0{index + 1} · {artifactLayers[index].label}
      </span>
      <span className={cn("truncate font-mono text-[10px]", dark ? "text-ink-text-tertiary" : "text-text-muted")}>
        {caption}
      </span>
    </div>
  );
}
