"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { signature } from "@/lib/data";
import { DURATION, EASE, VIEWPORT } from "@/lib/animation";
import { cn } from "@/lib/utils";

/* Tokens the motif streams out, including their trailing whitespace so the
   re-assembled line reads naturally. */
const STREAM_TOKENS = signature.streamLine.match(/\S+\s*/g) ?? [signature.streamLine];

/* Cadence for the typed-out loop (ms). */
const TYPE_MS = 95;
const HOLD_MS = 1600;
const ERASE_MS = 28;
const RESET_MS = 600;

/* Split the manifesto title into lead + final sentence so the closing
   statement can carry the lone serif accent — without hardcoding copy. */
const TITLE_PARTS = (() => {
  const sentences = signature.title.match(/[^.!?]+[.!?]*/g)?.map((s) => s.trim()).filter(Boolean) ?? [];
  if (sentences.length < 2) return { lead: "", accent: signature.title };
  const accent = sentences[sentences.length - 1];
  const lead = sentences.slice(0, -1).join(" ");
  return { lead, accent };
})();

/* A small CSS waveform — bar heights (px) + per-bar delays for an organic row.
   Uses the `waveform` @keyframes from globals.css (transform: scaleY only). */
const WAVEFORM_BARS = [
  { h: 10, delay: 0 },
  { h: 22, delay: 0.18 },
  { h: 16, delay: 0.36 },
  { h: 28, delay: 0.12 },
  { h: 13, delay: 0.5 },
  { h: 24, delay: 0.28 },
  { h: 18, delay: 0.44 },
  { h: 30, delay: 0.06 },
  { h: 14, delay: 0.34 },
  { h: 20, delay: 0.22 },
  { h: 11, delay: 0.48 },
  { h: 26, delay: 0.16 },
] as const;

export function AINativeSignature() {
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, { margin: "-80px" });
  const reduceMotion = useReducedMotion();

  // Number of fully-revealed tokens of the stream line (loop only).
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Reduced motion or offscreen: no loop. (Reduced motion shows the full
    // line, derived at render time below — never set state from the effect body.)
    if (reduceMotion || !inView) return;

    let timer: ReturnType<typeof setTimeout>;
    let mode: "typing" | "holding" | "erasing" = "typing";
    let i = 0;

    const tick = () => {
      if (mode === "typing") {
        i += 1;
        setCount(i);
        if (i >= STREAM_TOKENS.length) {
          mode = "holding";
          timer = setTimeout(tick, HOLD_MS);
        } else {
          timer = setTimeout(tick, TYPE_MS);
        }
        return;
      }
      if (mode === "holding") {
        mode = "erasing";
        timer = setTimeout(tick, ERASE_MS);
        return;
      }
      // erasing
      i -= 1;
      setCount(Math.max(i, 0));
      if (i <= 0) {
        mode = "typing";
        timer = setTimeout(tick, RESET_MS);
      } else {
        timer = setTimeout(tick, ERASE_MS);
      }
    };

    // (Re)start from empty whenever we (re)enter the viewport. Deferred into a
    // timer callback so no setState runs synchronously in the effect body.
    timer = setTimeout(() => {
      setCount(0);
      i = 0;
      mode = "typing";
      timer = setTimeout(tick, TYPE_MS);
    }, 0);

    return () => clearTimeout(timer);
  }, [inView, reduceMotion]);

  // Reduced motion renders the full line at rest; otherwise the live loop count.
  const visibleCount = reduceMotion ? STREAM_TOKENS.length : count;
  const streamed = STREAM_TOKENS.slice(0, visibleCount).join("");
  const isComplete = visibleCount >= STREAM_TOKENS.length;

  return (
    <section id="signature" className="section-py">
      <div className="container-page">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[3fr_2fr] lg:gap-16">
          {/* — Left: editorial manifesto — */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: DURATION.reveal, ease: EASE.out }}
          >
            <Eyebrow pill>THE EDGE</Eyebrow>

            <h2 className="mt-6 font-display text-display-lg text-text text-balance">
              {TITLE_PARTS.lead ? `${TITLE_PARTS.lead} ` : null}
              <span className="font-serif italic text-text-secondary">
                {TITLE_PARTS.accent}
              </span>
            </h2>

            <p className="mt-6 max-w-[52ch] text-body-lg text-text-secondary">
              {signature.body}
            </p>
          </motion.div>

          {/* — Right: cheap motif card — */}
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: DURATION.reveal, ease: EASE.out, delay: 0.08 }}
            className={cn(
              "relative overflow-hidden rounded-2xl border border-ink-border bg-ink p-6 shadow-card ring-hairline-ink sm:p-8",
            )}
          >
            {/* quiet product wash behind the motif */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 bg-product opacity-70"
            />

            {/* header chrome — faux assistant surface */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 font-mono text-eyebrow uppercase text-ink-text-tertiary">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-positive animate-pulse-dot"
                />
                assistant · streaming
              </span>
              <span className="font-mono text-eyebrow uppercase text-ink-text-tertiary">
                ai.tsx
              </span>
            </div>

            {/* faux chat bubble: types out the stream line token-by-token */}
            <div className="mt-6 rounded-xl border border-ink-border bg-black/40 p-4">
              <p
                className="min-h-[3lh] font-mono text-sm leading-relaxed text-ink-text-secondary"
                aria-label={signature.streamLine}
              >
                <span aria-hidden="true">
                  {streamed}
                  <span
                    className={cn(
                      "ml-0.5 inline-block h-[1.05em] w-0.5 -translate-y-px align-middle bg-accent",
                      // blink only while idle (complete or paused); steady while typing
                      reduceMotion || !inView || isComplete
                        ? "animate-caret"
                        : "",
                    )}
                  />
                </span>
              </p>
            </div>

            {/* small CSS waveform — scaleY bars, staggered, origin-bottom */}
            <div
              aria-hidden="true"
              className="mt-6 flex h-8 items-end gap-1"
            >
              {WAVEFORM_BARS.map((bar, idx) => (
                <span
                  key={idx}
                  className="w-1 rounded-full bg-white/25"
                  style={{
                    height: `${bar.h}px`,
                    transformOrigin: "bottom",
                    animation:
                      reduceMotion || !inView
                        ? "none"
                        : `waveform 1.3s cubic-bezier(${EASE.inOut.join(",")}) ${bar.delay}s infinite`,
                  }}
                />
              ))}
            </div>

            {/* agent trace — mono lines, the single accent the card earns */}
            <ul className="mt-6 space-y-1.5 font-mono text-xs text-ink-text-tertiary">
              {signature.agentTrace.map((line, idx) => {
                const isDone = line.startsWith("✓");
                return (
                  <li
                    key={line}
                    className={cn(
                      "tabular-nums",
                      isDone && "text-accent",
                    )}
                  >
                    <span className="text-ink-text-tertiary">{`${String(idx).padStart(2, "0")}  `}</span>
                    {line}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
