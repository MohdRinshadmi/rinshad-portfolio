"use client";

import { motion } from "framer-motion";
import { SectionWrapper, SectionHeading } from "@/components/animations/SectionWrapper";
import { StaggerChildren } from "@/components/animations/FadeUp";
import { fadeUp } from "@/lib/animation";
import { skills } from "@/lib/data";
import { cn } from "@/lib/utils";

const categoryLabels: Record<string, string> = {
  languages: "Languages",
  frameworks: "Frameworks & Libraries",
  ai: "AI UI & SDKs",
  realtime: "Styling, State & Realtime",
  tooling: "Testing, Build & Tooling",
  workflow: "AI Workflow & Deploy",
};

const categoryColors: Record<string, string> = {
  languages: "from-violet-600/20 to-violet-600/5 border-violet-500/20",
  frameworks: "from-blue-600/20 to-blue-600/5 border-blue-500/20",
  ai: "from-fuchsia-600/20 to-fuchsia-600/5 border-fuchsia-500/20",
  realtime: "from-emerald-600/20 to-emerald-600/5 border-emerald-500/20",
  tooling: "from-amber-600/20 to-amber-600/5 border-amber-500/20",
  workflow: "from-sky-600/20 to-sky-600/5 border-sky-500/20",
};

const categoryText: Record<string, string> = {
  languages: "text-violet-300",
  frameworks: "text-blue-300",
  ai: "text-fuchsia-300",
  realtime: "text-emerald-300",
  tooling: "text-amber-300",
  workflow: "text-sky-300",
};

const categoryBar: Record<string, string> = {
  languages: "from-violet-500 to-purple-400",
  frameworks: "from-blue-500 to-cyan-400",
  ai: "from-fuchsia-500 to-pink-400",
  realtime: "from-emerald-500 to-teal-400",
  tooling: "from-amber-500 to-yellow-400",
  workflow: "from-sky-500 to-cyan-400",
};

function SkillCard({ skill }: { skill: (typeof skills)[0] }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "group relative flex flex-col gap-3 rounded-xl border bg-linear-to-br p-4 backdrop-blur-sm transition-all",
        categoryColors[skill.category]
      )}
    >
      <div className="flex items-center justify-between">
        <span className={cn("text-sm font-semibold", categoryText[skill.category])}>
          {skill.name}
        </span>
        <span className="text-xs text-zinc-500">{skill.level}%</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${skill.level}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0, 0, 0.2, 1] }}
          className={cn(
            "h-full rounded-full bg-linear-to-r",
            categoryBar[skill.category]
          )}
        />
      </div>
    </motion.div>
  );
}

export function Skills() {
  const categories = [
    "languages",
    "frameworks",
    "ai",
    "realtime",
    "tooling",
    "workflow",
  ] as const;

  return (
    <SectionWrapper id="skills" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          label="Technical Stack"
          title="What I build with."
          description="Tools I've worked with in production across the full stack."
        />

        <div className="space-y-10">
          {categories.map((cat) => {
            const catSkills = skills.filter((s) => s.category === cat);
            return (
              <div key={cat}>
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  {categoryLabels[cat]}
                </h3>
                <StaggerChildren fast className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {catSkills.map((skill) => (
                    <SkillCard key={skill.name} skill={skill} />
                  ))}
                </StaggerChildren>
              </div>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}
