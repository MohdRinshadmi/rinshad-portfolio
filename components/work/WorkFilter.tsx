"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Project } from "@/lib/types";
import { Chip } from "@/components/ui/Chip";
import { ProjectCard } from "@/components/work/ProjectCard";
import { DURATION, EASE, staggerContainerFast, fadeUp } from "@/lib/animation";
import { cn } from "@/lib/utils";

const ALL = "All";

/**
 * WorkFilter — client island for /work. Chip filter (All + the unique set of
 * project categories) that narrows a passed-in projects list and renders the
 * matches as `ProjectCard variant="grid"` in a responsive 2-col grid.
 */
export function WorkFilter({
  projects,
  className,
}: {
  projects: Project[];
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState<string>(ALL);

  // Stable, de-duplicated category list, in first-seen order.
  const categories = useMemo(() => {
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const project of projects) {
      for (const category of project.categories) {
        if (!seen.has(category)) {
          seen.add(category);
          ordered.push(category);
        }
      }
    }
    return [ALL, ...ordered];
  }, [projects]);

  const filtered = useMemo(
    () =>
      active === ALL
        ? projects
        : projects.filter((project) => project.categories.includes(active)),
    [projects, active],
  );

  return (
    <div className={cn(className)}>
      {/* Filter chips */}
      <div
        role="tablist"
        aria-label="Filter projects by category"
        className="flex flex-wrap items-center gap-2"
      >
        {categories.map((category) => {
          const isActive = category === active;
          return (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(category)}
              className="inline-flex min-h-[44px] items-center rounded-full focus-visible:outline-none"
            >
              <Chip
                accent={isActive}
                className={cn(
                  "px-3.5 py-2 text-sm transition-colors",
                  isActive
                    ? ""
                    : "hover:border-border-strong hover:text-text",
                )}
              >
                {category}
              </Chip>
            </button>
          );
        })}
      </div>

      {/* Project grid */}
      <motion.div
        layout={!reduceMotion}
        className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2"
        variants={reduceMotion ? undefined : staggerContainerFast}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {filtered.map((project, index) => (
            <motion.div
              key={project.slug}
              layout={!reduceMotion}
              variants={reduceMotion ? undefined : fadeUp}
              initial={reduceMotion ? false : "hidden"}
              animate="visible"
              exit={
                reduceMotion
                  ? undefined
                  : {
                      opacity: 0,
                      y: 8,
                      transition: { duration: DURATION.micro, ease: EASE.out },
                    }
              }
            >
              <ProjectCard project={project} variant="grid" index={index} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 ? (
        <p className="mt-10 font-mono text-sm text-text-tertiary">
          No projects in this category yet.
        </p>
      ) : null}
    </div>
  );
}
