"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChapterMark } from "@/components/story/ChapterMark";
import { Reveal } from "@/components/motion/Reveal";
import { chapterInterfaces } from "@/lib/story";
import { cn } from "@/lib/utils";

/**
 * Chapter 02 — Behind the Interfaces. One real product (the streaming copilot)
 * told as a horizontal sequence: Problem → Thinking → Architecture → Execution
 * → Impact. On large screens the chapter pins and the columns travel sideways,
 * scrubbed by the scrollbar; on small screens and under reduced motion it
 * reads as a vertical case study. The layout fork is pure CSS (`motion-safe`),
 * so server and client render identically.
 */
export function BehindTheInterfaces() {
  const railRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ["start start", "end end"],
  });
  // Track is 297vw (8 lead + 34 intro + 5×44 stages + 5×5 gaps + 10 tail); shift
  // so the last card's right edge ends 8vw from the right, mirroring the lead-in:
  // (287vw last-card-right − 92vw) / 297vw track. Headless-measured, vw-invariant.
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-65.7%"]);

  const stages = chapterInterfaces.stages;

  return (
    <section id="chapter-02" className="bg-bg-subtle/60">
      {/* ── Pinned horizontal travel (lg + motion ok) ─────────────────── */}
      <div ref={railRef} className="relative hidden h-[420vh] motion-safe:lg:block">
        <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
          <motion.div style={{ x }} className="flex w-max items-stretch gap-[5vw] pl-[8vw] pr-[10vw]">
            <div className="flex w-[34vw] flex-col justify-center">
              <ChapterMark
                number={chapterInterfaces.number}
                title={chapterInterfaces.title}
                intro={chapterInterfaces.intro}
              />
            </div>
            {stages.map((stage, i) => (
              <StageCard key={stage.step} stage={stage} index={i} className="w-[44vw] self-center" />
            ))}
          </motion.div>

          {/* Progress rail */}
          <div className="absolute inset-x-[8vw] bottom-10">
            <div className="flex items-baseline justify-between pb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-text-tertiary">
              <span>{stages[0].step}</span>
              <span>{stages[stages.length - 1].step}</span>
            </div>
            <div className="h-px bg-border-strong">
              <motion.div style={{ scaleX: scrollYProgress }} className="h-px origin-left bg-accent" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Vertical fallback (mobile + reduced motion) ───────────────── */}
      <div className="section-py motion-safe:lg:hidden">
        <div className="container-page">
          <ChapterMark
            number={chapterInterfaces.number}
            title={chapterInterfaces.title}
            intro={chapterInterfaces.intro}
          />
          <div className="mt-16 space-y-16">
            {stages.map((stage, i) => (
              <Reveal key={stage.step}>
                <StageCard stage={stage} index={i} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StageCard({
  stage,
  index,
  className,
}: {
  stage: (typeof chapterInterfaces.stages)[number];
  index: number;
  className?: string;
}) {
  return (
    <article className={cn("relative border-t border-text/20 pt-8", className)}>
      {/* Ghost index — oversized, behind the text */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-7 right-0 select-none font-serif text-[6.5rem] italic leading-none text-text/[0.06]"
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      <p className="font-grotesk text-eyebrow font-medium uppercase text-accent">
        {String(index + 1).padStart(2, "0")} — {stage.step}
      </p>
      <h3 className="mt-5 max-w-[18ch] font-serif text-display-lg text-text">{stage.title}</h3>
      <p className="mt-6 max-w-[52ch] text-body-lg text-text-secondary">{stage.body}</p>
      <p className="mt-7 max-w-[46ch] border-l border-accent/50 pl-4 font-mono text-xs leading-relaxed text-text-tertiary">
        {stage.detail}
      </p>
    </article>
  );
}
