"use client";

import { useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { InkStage, StageHeading } from "../core/InkStage";
import { useSceneGate } from "../core/useSceneGate";
import { milestones } from "@/lib/experience/data";
import { useExperience } from "@/lib/experience/store";
import { EASE } from "@/lib/animation";
import { cn } from "@/lib/utils";

const TimelineScene = dynamic(() => import("./TimelineScene"), { ssr: false });

/* ============================================================================
   CAREER CORRIDOR — section shell.
   A 400vh scroll runway with a sticky viewport. The SAME scroll progress
   drives the 3D flight and the DOM milestone card, so the section works
   identically without WebGL — the corridor is atmosphere, never the source
   of truth. Gate dots double as keyboard navigation between milestones.
   ========================================================================== */

export function TimelineSection() {
  const runwayRef = useRef<HTMLDivElement>(null);
  const [gateRef, mountScene] = useSceneGate();
  const active = useExperience((s) => s.activeMilestone);
  const setActive = useExperience((s) => s.setActiveMilestone);
  const reducedMotion = useExperience((s) => s.reducedMotion);

  const { scrollYProgress } = useScroll({
    target: runwayRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const index = Math.min(
      milestones.length - 1,
      Math.max(0, Math.round(v * (milestones.length - 1))),
    );
    if (index !== useExperience.getState().activeMilestone) setActive(index);
  });

  /** Scroll the runway so milestone `i` is in focus — used by the dot nav. */
  const goTo = useCallback((i: number) => {
    const runway = runwayRef.current;
    if (!runway) return;
    const ratio = i / (milestones.length - 1);
    const top =
      runway.offsetTop + ratio * (runway.offsetHeight - window.innerHeight);
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  const m = milestones[active];

  return (
    <InkStage id="career-corridor" label="Career timeline">
      <div ref={runwayRef} className="relative h-[400vh]">
        <div className="sticky top-0 flex h-svh flex-col overflow-hidden">
          {/* Corridor scene behind everything. */}
          <div ref={gateRef} className="absolute inset-0" aria-hidden="true">
            <div className="absolute inset-0 bg-product opacity-80" />
            {mountScene && <TimelineScene progress={scrollYProgress} />}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/90 to-transparent" />
          </div>

          <div className="container-wide relative z-10 flex flex-1 flex-col justify-between pb-12 pt-24 sm:pt-28">
            <StageHeading
              eyebrow="02 — TRAJECTORY"
              title="The corridor"
              blurb="Two and a half years, traveled milestone by milestone."
            />

            {/* Active milestone card — the real content of this stage. */}
            <div className="max-w-xl" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.article
                  key={m.id}
                  initial={reducedMotion ? false : { opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? undefined : { opacity: 0, y: -14 }}
                  transition={{ duration: 0.4, ease: EASE.out }}
                  className="rounded-xl border border-ink-border bg-ink-raised/80 p-6 ring-hairline-ink backdrop-blur-md sm:p-8"
                >
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                    {m.year}
                  </p>
                  <h3 className="mt-2 font-display text-h3 font-semibold text-ink-text">
                    {m.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-text-secondary">
                    {m.body}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {m.achievements.map((a) => (
                      <li
                        key={a}
                        className="flex gap-2.5 text-sm leading-relaxed text-ink-text-secondary"
                      >
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                        {a}
                      </li>
                    ))}
                  </ul>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {m.tech.map((t) => (
                      <li
                        key={t}
                        className="rounded-full border border-ink-border px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-ink-text-tertiary"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </motion.article>
              </AnimatePresence>

              {/* Gate navigation — fully keyboard-operable. */}
              <nav aria-label="Career milestones" className="mt-6 flex items-center gap-3">
                {milestones.map((ms, i) => (
                  <button
                    key={ms.id}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`${ms.year} — ${ms.title}`}
                    aria-current={i === active ? "step" : undefined}
                    className={cn(
                      "h-3 rounded-full transition-all duration-300 ease-out",
                      i === active
                        ? "w-10 bg-accent"
                        : "w-3 bg-ink-text-tertiary/40 hover:bg-ink-text-tertiary",
                    )}
                  />
                ))}
                <span className="ml-2 font-mono text-xs tabular-nums text-ink-text-tertiary">
                  {String(active + 1).padStart(2, "0")} / {String(milestones.length).padStart(2, "0")}
                </span>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </InkStage>
  );
}
