"use client";

import { motion } from "framer-motion";
import { SectionWrapper, SectionHeading } from "@/components/animations/SectionWrapper";
import { StaggerChildren } from "@/components/animations/FadeUp";
import { fadeUp } from "@/lib/animation";
import { skills } from "@/lib/data";
import { cn } from "@/lib/utils";

const categoryLabels: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  devops: "DevOps & Cloud",
  tools: "Tools",
};

const categoryColors: Record<string, string> = {
  frontend: "from-violet-600/20 to-violet-600/5 border-violet-500/20",
  backend: "from-blue-600/20 to-blue-600/5 border-blue-500/20",
  devops: "from-emerald-600/20 to-emerald-600/5 border-emerald-500/20",
  tools: "from-amber-600/20 to-amber-600/5 border-amber-500/20",
};

const categoryText: Record<string, string> = {
  frontend: "text-violet-300",
  backend: "text-blue-300",
  devops: "text-emerald-300",
  tools: "text-amber-300",
};

function SkillCard({ skill }: { skill: (typeof skills)[0] }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "group relative flex flex-col gap-3 rounded-xl border bg-gradient-to-br p-4 backdrop-blur-sm transition-all",
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
            "h-full rounded-full bg-gradient-to-r",
            skill.category === "frontend" && "from-violet-500 to-purple-400",
            skill.category === "backend" && "from-blue-500 to-cyan-400",
            skill.category === "devops" && "from-emerald-500 to-teal-400",
            skill.category === "tools" && "from-amber-500 to-yellow-400"
          )}
        />
      </div>
    </motion.div>
  );
}

export function Skills() {
  const categories = ["frontend", "backend", "devops", "tools"] as const;

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
