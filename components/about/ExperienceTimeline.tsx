"use client";

import { Fragment, useRef } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { Chip } from "@/components/ui/Chip";
import { education, experience } from "@/lib/content/profile";
import { DURATION, EASE, fadeUp, VIEWPORT } from "@/lib/animation";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { cn } from "@/lib/utils";
import type { Experience } from "@/lib/types";

/* ----------------------------------------------------------------------------
   Metric highlighting — wrap résumé "proof" tokens in an accent inline chip so
   the numbers read at a glance. Matches percentages (30%), counts (20+),
   latency phrases (sub-second / sub-16ms), and the literal word "zero".
   -------------------------------------------------------------------------- */
// Capturing group → split keeps the matches. `i` only; no global flag so a
// per-part `test()` stays stateless and deterministic.
const METRIC_PATTERN =
  /(\d+(?:\.\d+)?\s?%|\d+\+|sub-second|sub-\d+ms|\bzero\b)/i;

function MetricToken({ children }: { children: React.ReactNode }) {
  return (
    <span className="mx-0.5 inline-flex items-center rounded-md border border-accent/20 bg-accent/10 px-1.5 py-px font-mono text-[0.8em] leading-none whitespace-nowrap text-accent align-baseline">
      {children}
    </span>
  );
}

function highlightMetrics(text: string): React.ReactNode {
  // Split on the same pattern; the capturing group preserves the metric tokens.
  const parts = text.split(METRIC_PATTERN);
  return parts.map((part, i) =>
    part && METRIC_PATTERN.test(part) ? (
      <MetricToken key={i}>{part}</MetricToken>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

/* ----------------------------------------------------------------------------
   One experience row
   -------------------------------------------------------------------------- */
function ExperienceRow({ item }: { item: Experience }) {
  const reduceMotion = useReducedMotion();
  const rowRef = useRef<HTMLLIElement>(null);
  const inView = useInView(rowRef, { once: true, margin: "-120px" });

  return (
    <motion.li
      ref={rowRef}
      variants={reduceMotion ? undefined : fadeUp}
      initial={reduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={VIEWPORT}
      className="relative pl-12 sm:pl-16"
    >
      {/* node dot — pulses once the row is in view */}
      <span
        aria-hidden
        className="absolute left-4.5 top-1.5 flex size-3 -translate-x-1/2 items-center justify-center sm:left-6.5"
      >
        <span className="absolute size-3 rounded-full bg-accent/15" />
        <span
          className={cn(
            "size-2 rounded-full bg-accent ring-4 ring-bg",
            inView && "animate-pulse-dot",
          )}
        />
      </span>

      {/* header: role / company + period */}
      <div className="flex flex-col gap-1.5 lg:flex-row lg:items-baseline lg:justify-between lg:gap-6">
        <div className="min-w-0">
          <h3 className="font-display text-h3 text-text">{item.role}</h3>
          <p className="mt-0.5 text-text-secondary">
            {item.company}
            {item.current ? (
              <span className="ml-2 inline-flex items-center gap-1.5 align-middle font-mono text-[0.6875rem] uppercase tracking-wider text-text-tertiary">
                <span className="size-1.5 rounded-full bg-positive animate-pulse-dot" />
                Current
              </span>
            ) : null}
          </p>
        </div>
        <p className="shrink-0 font-mono text-xs uppercase tracking-wider text-text-tertiary lg:text-right">
          {item.period}
        </p>
      </div>

      {/* location + technologies */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[0.6875rem] uppercase tracking-wider text-text-muted">
          {item.location}
        </span>
        <span aria-hidden className="text-text-muted">
          ·
        </span>
        {item.technologies.map((tech) => (
          <Chip key={tech} size="sm">
            {tech}
          </Chip>
        ))}
      </div>

      {/* achievements */}
      <ul className="mt-5 flex flex-col gap-2.5">
        {item.achievements.map((achievement, i) => (
          <li
            key={i}
            className="relative pl-5 text-body-lg leading-relaxed text-text-secondary"
          >
            <span
              aria-hidden
              className="absolute left-0 top-[0.7em] size-1.5 -translate-y-1/2 rounded-full bg-border-strong"
            />
            {highlightMetrics(achievement)}
          </li>
        ))}
      </ul>
    </motion.li>
  );
}

/* ----------------------------------------------------------------------------
   ExperienceTimeline
   -------------------------------------------------------------------------- */
export function ExperienceTimeline() {
  const reduceMotion = useReducedMotion();
  const hydrated = useHydrated();
  const listRef = useRef<HTMLOListElement>(null);

  // Draw the connector as the list scrolls through the viewport.
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 80%", "end 60%"],
  });
  const lineScaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="experience" className="section-py">
      <div className="container-page">
        <SectionHeading
          eyebrow="EXPERIENCE"
          eyebrowPill
          title={
            <>
              Shipping in{" "}
              <span className="font-serif italic text-text">production</span>.
            </>
          }
          description="Where the streaming AI products, real-time systems, and store releases actually got built."
        />

        <ol ref={listRef} className="relative mt-14 sm:mt-16">
          {/* static rail (track) */}
          <span
            aria-hidden
            className="absolute left-4.5 top-1.5 bottom-1.5 w-px -translate-x-1/2 bg-border sm:left-6.5"
          />
          {/* animated draw line on top of the rail */}
          <motion.span
            aria-hidden
            style={
              hydrated && !reduceMotion
                ? { scaleY: lineScaleY }
                : { scaleY: hydrated ? 1 : 0 }
            }
            className="absolute left-4.5 top-1.5 bottom-1.5 w-px -translate-x-1/2 origin-top bg-linear-to-b from-accent via-accent/60 to-transparent sm:left-6.5"
          />

          <div className="flex flex-col gap-14 sm:gap-16">
            {experience.map((item) => (
              <ExperienceRow key={item.id} item={item} />
            ))}
          </div>
        </ol>

        {/* Education — compact coda row */}
        <motion.div
          variants={reduceMotion ? undefined : fadeUp}
          initial={reduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={VIEWPORT}
          transition={{ duration: DURATION.reveal, ease: EASE.out, delay: 0.05 }}
          className="mt-12 border-t border-border pt-8"
        >
          <p className="font-mono text-eyebrow uppercase tracking-wider text-text-tertiary">
            Education
          </p>
          <ul className="mt-4 flex flex-col gap-3">
            {education.map((edu) => (
              <li
                key={edu.id}
                className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
              >
                <div className="min-w-0">
                  <span className="font-display text-text">
                    {edu.degree}
                  </span>
                  <span className="text-text-secondary">
                    {" — "}
                    {edu.institution}
                  </span>
                  <span className="block text-sm text-text-tertiary sm:inline sm:before:mx-2 sm:before:text-text-muted sm:before:content-['·']">
                    {edu.affiliation} · {edu.location}
                  </span>
                </div>
                <span className="shrink-0 font-mono text-xs uppercase tracking-wider text-text-tertiary sm:text-right">
                  {edu.period}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
