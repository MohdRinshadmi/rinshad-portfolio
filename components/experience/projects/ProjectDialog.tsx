"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import { getFlagship } from "@/lib/experience/data";
import { useExperience } from "@/lib/experience/store";
import { EASE } from "@/lib/animation";

/* ============================================================================
   ProjectDialog — a module expanded to fullscreen. Radix supplies focus
   trapping, Escape-to-close, and aria wiring; framer animates the holographic
   expansion. Content: summary, challenges solved, achievements, metrics,
   stack, and outbound links.
   ========================================================================== */

export function ProjectDialog() {
  const activeProject = useExperience((s) => s.activeProject);
  const closeProject = useExperience((s) => s.closeProject);
  const reducedMotion = useExperience((s) => s.reducedMotion);
  const project = activeProject ? getFlagship(activeProject) : undefined;

  return (
    <Dialog.Root open={!!project} onOpenChange={(open) => !open && closeProject()}>
      <AnimatePresence>
        {project && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-0 z-[70] bg-ink/80 backdrop-blur-md"
              />
            </Dialog.Overlay>
            <Dialog.Content
              asChild
              forceMount
              aria-describedby={undefined}
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <motion.div
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 26 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 12 }}
                transition={{ duration: 0.4, ease: EASE.out }}
                className="fixed inset-x-3 top-[5svh] z-[71] mx-auto flex max-h-[90svh] max-w-3xl flex-col overflow-hidden rounded-2xl border border-ink-border bg-ink text-ink-text shadow-raised ring-hairline-ink"
              >
                {/* Terminal-style title bar. */}
                <header className="flex items-center justify-between border-b border-ink-border px-6 py-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-text-tertiary">
                    <span className="text-accent">module://</span>
                    {project.slug} — {project.platform}
                  </p>
                  <Dialog.Close
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-text-secondary transition-colors hover:bg-ink-raised hover:text-ink-text"
                    aria-label="Close project module"
                  >
                    <X size={17} aria-hidden="true" />
                  </Dialog.Close>
                </header>

                <div className="overflow-y-auto overscroll-contain px-6 py-6 sm:px-8 sm:py-8">
                  <Dialog.Title className="font-display text-display-lg font-semibold tracking-tight">
                    {project.title}
                  </Dialog.Title>
                  <p className="mt-3 max-w-xl text-body-lg text-ink-text-secondary">
                    {project.summary}
                  </p>

                  <div className="mt-7 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-ink-border bg-ink-border">
                    {project.metrics.map((metric) => (
                      <div key={metric.label} className="bg-ink-raised px-3 py-4 text-center">
                        <p className="font-mono text-base font-medium text-accent">{metric.value}</p>
                        <p className="mt-1 text-[11px] uppercase tracking-wider text-ink-text-tertiary">
                          {metric.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 grid gap-8 sm:grid-cols-2">
                    <section aria-label="Challenges solved">
                      <h3 className="font-grotesk text-eyebrow font-medium uppercase tracking-[0.14em] text-accent">
                        Challenges solved
                      </h3>
                      <ul className="mt-4 space-y-3">
                        {project.challenges.map((challenge) => (
                          <li
                            key={challenge}
                            className="flex gap-2.5 text-sm leading-relaxed text-ink-text-secondary"
                          >
                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                            {challenge}
                          </li>
                        ))}
                      </ul>
                    </section>
                    <section aria-label="Key achievements">
                      <h3 className="font-grotesk text-eyebrow font-medium uppercase tracking-[0.14em] text-accent">
                        Key achievements
                      </h3>
                      <ul className="mt-4 space-y-3">
                        {project.achievements.map((achievement) => (
                          <li
                            key={achievement}
                            className="flex gap-2.5 text-sm leading-relaxed text-ink-text-secondary"
                          >
                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-positive" aria-hidden="true" />
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </section>
                  </div>

                  <section aria-label="Tech stack" className="mt-8">
                    <h3 className="font-grotesk text-eyebrow font-medium uppercase tracking-[0.14em] text-accent">
                      Stack
                    </h3>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {project.stack.map((tech) => (
                        <li
                          key={tech}
                          className="rounded-full border border-ink-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-text-secondary"
                        >
                          {tech}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <div className="mt-8 flex flex-wrap gap-3 border-t border-ink-border pt-6">
                    {project.links.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-1.5 rounded-full border border-ink-border px-5 py-2.5 text-sm font-medium text-ink-text transition-colors hover:border-accent/50 hover:text-accent"
                      >
                        {link.label}
                        <ArrowUpRight
                          size={14}
                          aria-hidden="true"
                          className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                      </a>
                    ))}
                    <a
                      href="#architecture-sim"
                      onClick={closeProject}
                      className="inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover"
                    >
                      See the architecture live
                    </a>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
