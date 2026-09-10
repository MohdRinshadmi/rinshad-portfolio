"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useTransform } from "framer-motion";
import { useScrubProgress } from "@/lib/hooks/use-scrub-progress";
import { ChapterMark } from "@/components/story/ChapterMark";
import { Reveal } from "@/components/motion/Reveal";
import { chapterInterfaces } from "@/lib/content/story";

/* The query the `motion-safe:lg:` classes below express in CSS. JS only needs
   it to know whether there is any sideways distance to travel. */
const PINNED = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";

/* Inner edge of the GuideRails frame: the 90rem well plus its 3rem gutter. */
const RAIL_PX = "motion-safe:lg:px-[max(3rem,calc((100vw-90rem)/2+3rem))]";

/**
 * Chapter 02 — Behind the Interfaces. One production system (the offline-first
 * sync backend) told as Challenge → Decision → Architecture → Implementation →
 * Result.
 *
 * ONE DOM, TWO LAYOUTS. On a wide screen with motion allowed the chapter pins
 * and the stages travel sideways, scrubbed by the scrollbar; everywhere else
 * the same elements stack as a vertical case study. This used to render the
 * whole chapter twice — a pinned copy and a vertical copy, one hidden by CSS —
 * which put every sentence in the HTML two times for crawlers and doubled the
 * DOM. Now the layout switch is purely class-based on a single tree.
 */
export function BehindTheInterfaces() {
  const railRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [shift, setShift] = useState(0);

  // Spring-smoothed: a wide track translating on a raw scroll offset shows
  // every notch of a mouse wheel.
  const progress = useScrubProgress(railRef, ["start start", "end end"]);

  // Travel exactly (track width − viewport), and nothing when stacked.
  useEffect(() => {
    const query = window.matchMedia(PINNED);
    const measure = () =>
      setShift(
        query.matches
          ? Math.max(0, (trackRef.current?.scrollWidth ?? 0) - window.innerWidth)
          : 0,
      );
    measure();
    window.addEventListener("resize", measure);
    query.addEventListener("change", measure);
    return () => {
      window.removeEventListener("resize", measure);
      query.removeEventListener("change", measure);
    };
  }, []);

  const x = useTransform(progress, [0, 1], [0, -shift]);
  const stages = chapterInterfaces.stages;

  return (
    <section id="chapter-02" className="bg-bg-subtle/60">
      <div ref={railRef} className="relative motion-safe:lg:h-[420vh]">
        <div className="relative py-[clamp(4rem,7vw,6.5rem)] motion-safe:lg:sticky motion-safe:lg:top-0 motion-safe:lg:flex motion-safe:lg:h-screen motion-safe:lg:flex-col motion-safe:lg:justify-center motion-safe:lg:overflow-hidden motion-safe:lg:py-0">
          <motion.div
            ref={trackRef}
            style={shift > 0 ? { x, willChange: "transform" } : undefined}
            className={`mx-auto flex w-full max-w-300 flex-col gap-16 max-lg:px-6 motion-reduce:lg:px-12 motion-safe:lg:mx-0 motion-safe:lg:w-max motion-safe:lg:max-w-none motion-safe:lg:flex-row motion-safe:lg:items-center motion-safe:lg:gap-[5vw] ${RAIL_PX}`}
          >
            <div className="motion-safe:lg:w-[34vw] motion-safe:lg:shrink-0">
              <ChapterMark
                number={chapterInterfaces.number}
                title={chapterInterfaces.title}
                intro={chapterInterfaces.intro}
              />
            </div>

            {stages.map((stage, i) => (
              <Reveal key={stage.step} className="motion-safe:lg:w-[40vw] motion-safe:lg:shrink-0">
                <StageCard stage={stage} index={i} />
              </Reveal>
            ))}
          </motion.div>

          {/* Progress rail — only meaningful while the chapter is pinned. */}
          <div
            aria-hidden="true"
            className="absolute inset-x-[max(3rem,calc((100vw-90rem)/2+3rem))] bottom-10 hidden motion-safe:lg:block"
          >
            <div className="flex items-baseline justify-between pb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-text-tertiary">
              <span>{stages[0].step}</span>
              <span>{stages[stages.length - 1].step}</span>
            </div>
            <div className="h-px bg-border-strong">
              <motion.div style={{ scaleX: progress }} className="h-px origin-left bg-accent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StageCard({
  stage,
  index,
}: {
  stage: (typeof chapterInterfaces.stages)[number];
  index: number;
}) {
  const number = String(index + 1).padStart(2, "0");
  return (
    <article className="relative border-t border-text/20 pt-8">
      {/* Ghost index — oversized, behind the text */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-7 right-0 select-none font-serif text-[6.5rem] italic leading-none text-text/6"
      >
        {number}
      </span>

      <p className="font-grotesk text-eyebrow font-medium uppercase text-accent-text">
        {number} — {stage.step}
      </p>
      <h3 className="mt-5 max-w-[18ch] font-serif text-display-lg text-text">{stage.title}</h3>
      <p className="mt-6 max-w-[52ch] text-body-lg text-text-secondary">{stage.body}</p>
      <p className="mt-7 max-w-[46ch] border-l border-accent/50 pl-4 font-mono text-xs leading-relaxed text-text-tertiary">
        {stage.detail}
      </p>
    </article>
  );
}
