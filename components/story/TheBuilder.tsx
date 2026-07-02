"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ChapterMark } from "@/components/story/ChapterMark";
import { ScrubText } from "@/components/motion/ScrubText";
import { Reveal } from "@/components/motion/Reveal";
import { CountUp } from "@/components/motion/CountUp";
import { chapterBuilder } from "@/lib/content/story";
import { proofStats } from "@/lib/content/profile";
import { staggerContainerFast, fadeUp, VIEWPORT } from "@/lib/animation";
import { cn } from "@/lib/utils";

/**
 * Chapter 01 — The Builder. Long-form editorial: the narrative paragraphs
 * ignite word-by-word as they pass the reading zone (ScrubText), a serif pull
 * quote breaks the column, and the chapter closes on a full-bleed band of
 * résumé-backed proof points that count up on scroll-in.
 */
export function TheBuilder() {
  return (
    <section id="chapter-01" className="section-py">
      <div className="container-page">
        <ChapterMark number={chapterBuilder.number} title={chapterBuilder.title} />

        {/* Narrative column — indented off the left edge like a book page */}
        <div className="mt-16 sm:mt-24 lg:ml-[8.33%] lg:max-w-[62ch]">
          <div className="space-y-12">
            {chapterBuilder.paragraphs.map((paragraph) => (
              <ScrubText
                key={paragraph.slice(0, 24)}
                text={paragraph}
                className="text-h2 font-display font-medium"
              />
            ))}
          </div>

          {/* Pull quote — breaks the measure, hangs into the margin */}
          <Reveal className="mt-20 sm:mt-28 lg:-ml-[13%]">
            <figure className="border-l-2 border-accent pl-7 sm:pl-10">
              <blockquote className="max-w-[26ch] font-serif text-display-lg italic text-text">
                “{chapterBuilder.quote}”
              </blockquote>
            </figure>
          </Reveal>
        </div>
      </div>

      {/* Proof band — full-bleed, the chapter's receipts in counted numbers */}
      <ProofBand />
    </section>
  );
}

/**
 * ProofBand — a thin, quiet band of résumé-backed proof points.
 * Numeric stats (with `to`) count up once on scroll-in; static stats (with
 * `value`) render their string in the display face. Each carries a mono label.
 * 2-up grid on mobile, single row on lg.
 */
function ProofBand() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      aria-label="Proof points"
      className="mt-24 border-y border-border bg-bg-subtle sm:mt-32"
    >
      <div className="container-page">
        <motion.ul
          variants={reduceMotion ? undefined : staggerContainerFast}
          initial={reduceMotion ? undefined : "hidden"}
          whileInView={reduceMotion ? undefined : "visible"}
          viewport={VIEWPORT}
          className={cn(
            "grid grid-cols-2 gap-x-8 gap-y-10 py-10",
            "lg:grid-cols-5 lg:gap-x-6 lg:py-12",
          )}
        >
          {proofStats.map((stat, i) => {
            const isNumeric = typeof stat.to === "number";
            // fractional targets (e.g. 2.5) need one decimal place
            const decimals = isNumeric && !Number.isInteger(stat.to) ? 1 : 0;

            return (
              <motion.li
                key={stat.label}
                variants={reduceMotion ? undefined : fadeUp}
                className={cn(
                  "flex flex-col gap-2",
                  // center the lone odd item across the full row on mobile
                  i === proofStats.length - 1 &&
                    proofStats.length % 2 === 1 &&
                    "col-span-2 lg:col-span-1",
                )}
              >
                <span className="font-display text-display-lg leading-none text-text">
                  {isNumeric ? (
                    <CountUp
                      to={stat.to as number}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                      decimals={decimals}
                    />
                  ) : (
                    stat.value
                  )}
                </span>
                <span className="font-mono text-xs leading-snug tracking-wide text-text-tertiary">
                  {stat.label}
                </span>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </div>
  );
}
