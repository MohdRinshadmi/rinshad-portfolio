import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { GithubIcon } from "@/components/ui/SocialIcons";
import { DeviceFrame } from "@/components/work/DeviceFrame";
import { ArchitectureFlow } from "@/components/work/ArchitectureFlow";
import type { Project } from "@/lib/types";

/**
 * ProjectFeature — one project as a reviewer reads a design doc: what it is
 * for, the stack, the real screenshot, the request path, then Challenge →
 * Engineering decision → Result. Source and case-study links sit with the
 * title, where the eye already is.
 *
 * Used by the homepage's stacking deck and by /work. A dark "ink" card on the
 * light page. Server component; only the architecture flow hydrates.
 */
export function ProjectFeature({
  project,
  index,
  as: Heading = "h3",
}: {
  project: Project;
  index: number;
  /** h3 inside a homepage chapter, h2 on /work. */
  as?: "h2" | "h3";
}) {
  const headingId = `project-${project.slug}`;
  const number = String(index + 1).padStart(2, "0");

  return (
    <article
      aria-labelledby={headingId}
      className="relative overflow-hidden rounded-3xl border border-ink-border bg-ink p-5 shadow-card ring-hairline-ink sm:p-8"
    >
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="flex flex-col lg:col-span-7">
          <p className="font-mono text-eyebrow uppercase tracking-[0.14em] text-ink-text-secondary">
            <span className="text-accent-hover">{number}</span> · {project.platform}
          </p>
          <Heading
            id={headingId}
            className="mt-3 font-serif text-[clamp(2rem,3.4vw,2.875rem)] leading-[1.04] tracking-[-0.02em] text-ink-text"
          >
            {project.title}
          </Heading>
          <p className="mt-4 max-w-[48ch] text-body-lg text-ink-text-secondary">{project.card.purpose}</p>

          <ul aria-label="Stack" className="mt-5 flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-white/12 bg-white/5 px-2.5 py-1 font-mono text-xs text-ink-text-secondary"
              >
                {tag}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap items-center gap-3 lg:mt-auto lg:pt-6">
            <Link
              href={`/work/${project.slug}`}
              // `accent-press`, not `accent`: white on #c75c37 is 4.18:1 and fails
              // AA for 14px text; #b04e2c is 5.3:1 and reads as the same terracotta.
              className="group/cta inline-flex h-11 items-center gap-2 rounded-full bg-accent-press pl-5 pr-4 text-sm font-medium text-accent-fg shadow-glow transition-colors duration-200 hover:bg-accent-text"
            >
              Read case study
              <span className="sr-only">: {project.title}</span>
              <ArrowUpRight
                aria-hidden="true"
                className="size-4 transition-transform duration-200 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5"
              />
            </Link>
            {project.githubUrl ? (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-4 text-sm font-medium text-ink-text transition-colors duration-200 hover:border-white/35 hover:bg-white/5"
              >
                <GithubIcon className="size-4" />
                Source
                <span className="sr-only"> for {project.title} on GitHub (opens in a new tab)</span>
              </a>
            ) : null}
            {project.liveUrl ? (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-4 text-sm font-medium text-ink-text transition-colors duration-200 hover:border-white/35 hover:bg-white/5"
              >
                Live demo
                <ArrowUpRight aria-hidden="true" className="size-4" />
                <span className="sr-only"> of {project.title} (opens in a new tab)</span>
              </a>
            ) : null}
          </div>
        </div>

        <div className="group/media lg:col-span-5">
          <DeviceFrame variant="browser" label={project.title}>
            {project.image ? (
              <Image
                src={project.image}
                alt={`${project.title} — screenshot of the running application`}
                fill
                quality={90}
                // Sources are pre-cropped to the frame's 4:3, so the browser
                // needs exactly the displayed width — no crop, no over-fetch.
                sizes="(min-width: 1280px) 27rem, (min-width: 1024px) 36vw, 92vw"
                className="object-cover transition-transform duration-700 ease-out group-hover/media:scale-[1.03]"
              />
            ) : undefined}
          </DeviceFrame>
        </div>
      </div>

      <ArchitectureFlow
        nodes={project.architecture.nodes}
        label={`${project.title}: request path`}
        className="mt-7 sm:mt-8"
      />

      <dl className="mt-7 grid gap-x-8 gap-y-5 border-t border-white/10 pt-6 md:grid-cols-3">
        <div>
          <dt className="font-mono text-eyebrow uppercase tracking-[0.14em] text-ink-text-secondary">
            Challenge
          </dt>
          <dd className="mt-2 text-sm leading-relaxed text-ink-text-secondary">{project.card.challenge}</dd>
        </div>
        <div>
          <dt className="font-mono text-eyebrow uppercase tracking-[0.14em] text-ink-text-secondary">
            Engineering decision
          </dt>
          <dd className="mt-2 text-sm leading-relaxed text-ink-text-secondary">{project.card.decision}</dd>
        </div>
        <div>
          <dt className="font-mono text-eyebrow uppercase tracking-[0.14em] text-accent-hover">Result</dt>
          <dd className="mt-2 text-sm leading-relaxed text-ink-text">{project.card.result}</dd>
        </div>
      </dl>
    </article>
  );
}
