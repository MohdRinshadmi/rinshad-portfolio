"use client";

import { motion } from "framer-motion";
import { LockOpen } from "lucide-react";
import { InkStage, StageHeading } from "../core/InkStage";
import { CountUp } from "@/components/motion/CountUp";
import { achievements, type Achievement } from "@/lib/experience/data";
import { useExperience } from "@/lib/experience/store";
import { EASE } from "@/lib/animation";
import { cn } from "@/lib/utils";

/* ============================================================================
   ACHIEVEMENT VAULT — sealed holographic cells that unlock as the visitor
   reaches them. Every number is résumé-backed; the vault only dramatizes
   the reveal (shimmer sweep + count-up), never the facts.
   ========================================================================== */

function VaultCell({ achievement, index }: { achievement: Achievement; index: number }) {
  const unlocked = useExperience((s) => !!s.unlocked[achievement.id]);
  const unlock = useExperience((s) => s.unlock);
  const reducedMotion = useExperience((s) => s.reducedMotion);

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      onViewportEnter={() => unlock(achievement.id)}
      transition={{ duration: 0.6, delay: (index % 3) * 0.12, ease: EASE.out }}
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-ink-raised/70 p-6 ring-hairline-ink transition-colors duration-700",
        unlocked ? "border-accent/25" : "border-ink-border",
      )}
    >
      {/* Holographic sweep fires once on unlock. */}
      <motion.span
        aria-hidden="true"
        initial={false}
        animate={unlocked && !reducedMotion ? { x: ["-110%", "130%"] } : {}}
        transition={{ duration: 1.1, ease: "easeInOut", delay: 0.2 + (index % 3) * 0.12 }}
        className="pointer-events-none absolute inset-y-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-accent/15 to-transparent"
      />

      <div className="flex items-start justify-between">
        <p className="font-display text-display-lg font-semibold tabular-nums text-ink-text">
          {unlocked ? (
            <CountUp
              to={achievement.value}
              suffix={achievement.suffix}
              decimals={achievement.decimals ?? 0}
            />
          ) : (
            <span aria-hidden="true" className="text-ink-text-tertiary/40">
              ···
            </span>
          )}
        </p>
        <span
          className={cn(
            "mt-2 inline-flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-700",
            unlocked
              ? "border-accent/40 text-accent"
              : "border-ink-border text-ink-text-tertiary/50",
          )}
          aria-hidden="true"
        >
          <LockOpen size={13} />
        </span>
      </div>
      <h3 className="mt-2 text-sm font-semibold uppercase tracking-wider text-ink-text-secondary">
        {achievement.label}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-text-tertiary">{achievement.detail}</p>
    </motion.div>
  );
}

export function VaultSection() {
  return (
    <InkStage id="achievement-vault" label="Achievements">
      <div className="relative">
        <div className="absolute inset-0 bg-aurora opacity-30" aria-hidden="true" />
        <div className="container-wide relative z-10 py-24 sm:py-28">
          <StageHeading
            eyebrow="07 — THE VAULT"
            title="Unlocked by exploring"
            blurb="The numbers behind the journey — every one of them from production, none of them rounded up."
            align="center"
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {achievements.map((achievement, i) => (
              <VaultCell key={achievement.id} achievement={achievement} index={i} />
            ))}
          </div>
        </div>
      </div>
    </InkStage>
  );
}
