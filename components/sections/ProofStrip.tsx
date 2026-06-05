"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CountUp } from "@/components/motion/CountUp";
import { proofStats } from "@/lib/data";
import { staggerContainerFast, fadeUp } from "@/lib/animation";
import { VIEWPORT } from "@/lib/animation";
import { cn } from "@/lib/utils";

/**
 * ProofStrip — a thin, quiet band of résumé-backed proof points.
 * Numeric stats (with `to`) count up once on scroll-in; static stats (with
 * `value`) render their string in the display face. Each carries a mono label.
 * 2-up grid on mobile, single row on lg.
 */
export function ProofStrip() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      aria-label="Proof points"
      className="border-y border-border bg-bg-subtle"
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
            const decimals =
              isNumeric && !Number.isInteger(stat.to) ? 1 : 0;

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
    </section>
  );
}
