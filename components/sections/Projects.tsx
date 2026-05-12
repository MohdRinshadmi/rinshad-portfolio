"use client";

import { motion } from "framer-motion";
import { ExternalLink, ArrowUpRight } from "lucide-react";
import { GithubIcon } from "@/components/ui/SocialIcons";
import { SectionWrapper, SectionHeading } from "@/components/animations/SectionWrapper";
import { StaggerChildren } from "@/components/animations/FadeUp";
import { fadeUp, cardHover } from "@/lib/animation";
import { projects } from "@/lib/data";
import { cn } from "@/lib/utils";

function ProjectCard({ project, index }: { project: (typeof projects)[0]; index: number }) {
  const isEven = index % 2 === 0;

  return (
    <motion.div variants={fadeUp} initial="rest" whileHover="hover" animate="rest">
      <motion.article
        variants={cardHover}
        className={cn(
          "group relative grid items-center gap-8 rounded-2xl border border-white/6 bg-white/2 p-6 backdrop-blur-sm transition-all lg:grid-cols-2 lg:p-8",
          "hover:border-violet-500/20 hover:bg-white/4"
        )}
      >
        <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-linear-to-br from-violet-600/5 to-transparent" />

        <div className={cn("order-1", !isEven && "lg:order-2")}>
          <div className="relative aspect-video overflow-hidden rounded-xl border border-white/6 bg-zinc-900">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-full w-full bg-linear-to-br from-violet-900/30 via-zinc-900 to-indigo-900/20 flex items-center justify-center">
                <span className="text-4xl font-bold text-white/10">{project.title[0]}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={cn("order-2 flex flex-col", !isEven && "lg:order-1")}>
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-0.5 text-xs font-medium text-violet-300"
              >
                {tag}
              </span>
            ))}
          </div>

          <h3 className="text-2xl font-bold text-white">{project.title}</h3>
          <p className="mt-1 text-sm font-medium text-violet-400">{project.tagline}</p>

          <div className="mt-4 space-y-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Problem</span>
              <p className="mt-1 text-sm text-zinc-400 leading-relaxed">{project.problem}</p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Solution</span>
              <p className="mt-1 text-sm text-zinc-400 leading-relaxed">{project.solution}</p>
            </div>
          </div>

          <div className="mt-5 flex gap-6">
            {project.metrics.map((m) => (
              <div key={m.label}>
                <div className="text-lg font-bold text-white">{m.value}</div>
                <div className="text-xs text-zinc-500">{m.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-500 transition-colors"
              >
                <ExternalLink size={12} />
                Live Demo
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
              >
                <GithubIcon className="h-3 w-3" />
                Source
              </a>
            )}
          </div>
        </div>
      </motion.article>
    </motion.div>
  );
}

export function Projects() {
  return (
    <SectionWrapper id="projects" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          label="Selected Work"
          title="Projects that shipped."
          description="Real products. Real problems. Measurable outcomes."
        />
        <StaggerChildren className="flex flex-col gap-8">
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </StaggerChildren>
      </div>
    </SectionWrapper>
  );
}
