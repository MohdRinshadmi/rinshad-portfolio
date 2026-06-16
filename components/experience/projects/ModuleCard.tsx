"use client";

import { useRef, type PointerEvent } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { FlagshipProject } from "@/lib/experience/data";
import { useExperience } from "@/lib/experience/store";
import { useHydrated } from "@/lib/use-hydrated";

/* ============================================================================
   ModuleCard — one interactive module on the command deck. A real <button>
   (full keyboard support: Tab + Enter expands it) wearing a CSS-3D shell:
   the card tilts toward the pointer in perspective, content floats at
   translateZ, and a holographic sweep tracks the cursor.
   ========================================================================== */

export function ModuleCard({ project, index }: { project: FlagshipProject; index: number }) {
  const openProject = useExperience((s) => s.openProject);
  const reducedMotion = useExperience((s) => s.reducedMotion);
  const hydrated = useHydrated();
  const ref = useRef<HTMLButtonElement>(null);

  const rotateX = useSpring(useMotionValue(0), { stiffness: 220, damping: 24 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 220, damping: 24 });

  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (reducedMotion || e.pointerType !== "mouse") return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * 10);
    rotateX.set(-py * 8);
  };

  const resetTilt = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={() => openProject(project.slug)}
      onPointerMove={onPointerMove}
      onPointerLeave={resetTilt}
      onBlur={resetTilt}
      initial={reducedMotion ? false : { opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      style={hydrated && !reducedMotion ? { rotateX, rotateY, transformPerspective: 1100 } : undefined}
      className="group relative flex h-full flex-col rounded-xl border border-ink-border bg-ink-raised/70 p-6 text-left ring-hairline-ink backdrop-blur-md transition-colors duration-300 [transform-style:preserve-3d] hover:border-accent/40 sm:p-7"
      aria-haspopup="dialog"
    >
      {/* Holographic sweep on hover. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-accent/12 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />

      <span className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-ink-text-tertiary [transform:translateZ(28px)]">
        {project.platform}
        <span className="text-accent">{String(index + 1).padStart(2, "0")}</span>
      </span>

      <span className="mt-5 block font-display text-h3 font-semibold text-ink-text [transform:translateZ(36px)]">
        {project.title}
      </span>
      <span className="mt-2 block text-sm leading-relaxed text-ink-text-secondary [transform:translateZ(30px)]">
        {project.tagline}
      </span>

      <span className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-ink-border bg-ink-border [transform:translateZ(22px)]">
        {project.metrics.map((metric) => (
          <span key={metric.label} className="block bg-ink px-2 py-2.5 text-center">
            <span className="block font-mono text-xs font-medium text-accent">{metric.value}</span>
            <span className="mt-1 block text-[10px] uppercase tracking-wider text-ink-text-tertiary">
              {metric.label}
            </span>
          </span>
        ))}
      </span>

      <span className="mt-auto flex items-center justify-between pt-6 [transform:translateZ(26px)]">
        <span className="flex flex-wrap gap-1.5">
          {project.stack.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-ink-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-text-tertiary"
            >
              {tech}
            </span>
          ))}
        </span>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-accent">
          Expand
          <ArrowUpRight
            size={14}
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </span>
      </span>
    </motion.button>
  );
}
