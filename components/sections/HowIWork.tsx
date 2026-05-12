"use client";

import { motion } from "framer-motion";
import { type LucideProps, Search, Layout, Code2, Sparkles, Rocket } from "lucide-react";
import { SectionWrapper, SectionHeading } from "@/components/animations/SectionWrapper";
import { StaggerChildren } from "@/components/animations/FadeUp";
import { fadeUp } from "@/lib/animation";
import { workProcess } from "@/lib/data";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.FC<LucideProps>> = {
  Search,
  Layout,
  Code2,
  Sparkles,
  Rocket,
};

export function HowIWork() {
  return (
    <SectionWrapper id="process" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          label="My Process"
          title="How I work."
          description="A repeatable system for turning ambiguous problems into shipped products."
          centered
        />

        <StaggerChildren className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {workProcess.map((step, i) => {
            const Icon = iconMap[step.icon];
            return (
              <motion.div
                key={step.step}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="group relative flex flex-col rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm hover:border-violet-500/20"
              >
                {/* Step connector line (desktop) */}
                {i < workProcess.length - 1 && (
                  <div className="absolute right-0 top-8 hidden h-px w-6 -translate-y-1/2 translate-x-6 bg-gradient-to-r from-zinc-700 to-transparent lg:block" />
                )}

                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10">
                  {Icon && (
                    <motion.div
                      initial={{ rotate: 0 }}
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Icon size={18} className="text-violet-400" />
                    </motion.div>
                  )}
                </div>

                <span className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-600">
                  Step {step.step}
                </span>
                <h3 className="text-base font-bold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{step.description}</p>
              </motion.div>
            );
          })}
        </StaggerChildren>
      </div>
    </SectionWrapper>
  );
}
