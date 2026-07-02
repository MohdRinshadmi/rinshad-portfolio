"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/types";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { StatTick } from "@/components/ui/StatTick";
import { Button } from "@/components/ui/Button";
import { GithubIcon } from "@/components/ui/SocialIcons";
import { DeviceFrame } from "@/components/work/DeviceFrame";
import { useHydrated } from "@/lib/hooks/use-hydrated";

/**
 * CaseStudyHero — the <h1> of a `/work/[slug]` page.
 *
 * Eyebrow ({platform} · {year} · {role}) → display-xl title → body-lg tagline →
 * a row of StatTicks + optional Live / GitHub buttons → a full-bleed browser
 * DeviceFrame that rises on a subtle, clamped scroll-linked parallax (translate
 * only; honors reduced motion).
 */
export function CaseStudyHero({ project }: { project: Project }) {
  const prefersReducedMotion = useReducedMotion();
  const mediaRef = useRef<HTMLDivElement>(null);

  // Apply the scroll-linked motion value only after hydration, so the server HTML
  // and the first client render match (motion values in `style` otherwise mismatch).
  const hydrated = useHydrated();

  // Track the media element entering the viewport from the bottom and leaving
  // off the top, then map progress to a small, clamped vertical translate.
  const { scrollYProgress } = useScroll({
    target: mediaRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [48, -48]);

  return (
    <header className="relative overflow-hidden section-pt pb-16 sm:pb-20">
      {/* Ambient backdrop — quiet, pointer-safe, behind everything */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-aurora opacity-70"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-grain opacity-40"
      />

      <div className="container-page">
        <div className="max-w-3xl">
          <Eyebrow dot className="mb-6">
            {project.platform} · {project.year} · {project.role}
          </Eyebrow>

          <h1 className="text-balance font-display text-display-xl text-text">
            {project.title}
          </h1>

          <p className="mt-6 max-w-2xl text-pretty text-body-lg text-text-secondary">
            {project.tagline}
          </p>

          {/* Metrics + primary actions */}
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            {project.metrics.length > 0 && (
              <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
                {project.metrics.map((metric) => (
                  <li key={metric.label}>
                    <StatTick>
                      <span className="text-text">{metric.value}</span>
                      <span className="text-text-tertiary">{metric.label}</span>
                    </StatTick>
                  </li>
                ))}
              </ul>
            )}

            {(project.liveUrl || project.githubUrl) && (
              <div className="flex flex-wrap items-center gap-3">
                {project.liveUrl && (
                  <Button
                    href={project.liveUrl}
                    variant="primary"
                    size="sm"
                    iconRight={<ArrowUpRight className="size-4" />}
                    ariaLabel={`Open the live ${project.title} site`}
                  >
                    Live site
                  </Button>
                )}
                {project.githubUrl && (
                  <Button
                    href={project.githubUrl}
                    variant="ghost"
                    size="sm"
                    iconRight={<GithubIcon className="size-4" />}
                    ariaLabel={`View ${project.title} source on GitHub`}
                  >
                    Source
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full-bleed media — clamped scroll parallax (translate only) */}
      <div ref={mediaRef} className="container-wide mt-14 sm:mt-20">
        <motion.div
          style={hydrated && !prefersReducedMotion ? { y } : undefined}
          className="will-change-transform"
        >
          <DeviceFrame variant="browser" label={project.title} className="shadow-raised">
            {project.image ? (
              <Image
                src={project.image}
                alt={`${project.title} interface preview`}
                fill
                sizes="(min-width: 1024px) 80rem, 100vw"
                className="object-cover"
                priority
              />
            ) : undefined}
          </DeviceFrame>
        </motion.div>
      </div>
    </header>
  );
}
