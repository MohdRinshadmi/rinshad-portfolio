import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { getProject, projects } from "@/lib/data";
import type { Project } from "@/lib/types";
import { buildMetadata, projectJsonLd, jsonLdScript } from "@/lib/seo";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { CaseStudyHero } from "@/components/work/CaseStudyHero";
import { MetaRail } from "@/components/work/MetaRail";
import { ArchitectureDiagram } from "@/components/work/ArchitectureDiagram";
import { StatCard } from "@/components/work/StatCard";
import { ContactCTA } from "@/components/sections/ContactCTA";

/* --------------------------------------------------------------------------
   Static generation + per-project metadata
   -------------------------------------------------------------------------- */
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    return buildMetadata({ title: "Work", path: "/work" });
  }

  return buildMetadata({
    title: project.title,
    description: project.tagline,
    path: `/work/${slug}`,
  });
}

/* --------------------------------------------------------------------------
   Small presentational helpers (server-only, token-styled)
   -------------------------------------------------------------------------- */

/** A long-form prose block: editorial measure, secondary ink. */
function Prose({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-6 max-w-[68ch] text-pretty text-body-lg text-text-secondary">
      {children}
    </p>
  );
}

/** A quiet, numbered/bulleted list of statements (challenges, results, lessons). */
function PointList({
  items,
  ordered = false,
}: {
  items: string[];
  ordered?: boolean;
}) {
  const ListTag = ordered ? "ol" : "ul";
  return (
    <ListTag className="mt-8 flex max-w-[68ch] flex-col gap-px overflow-hidden rounded-xl border border-border bg-surface/40 ring-hairline">
      {items.map((item, i) => (
        <li
          key={item}
          className="flex items-start gap-4 bg-bg/40 px-5 py-4 sm:px-6"
        >
          <span
            aria-hidden="true"
            className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-surface font-mono text-[0.6875rem] text-text-tertiary"
          >
            {ordered ? i + 1 : "•"}
          </span>
          <span className="text-pretty text-text-secondary">{item}</span>
        </li>
      ))}
    </ListTag>
  );
}

/* --------------------------------------------------------------------------
   The nine case-study blocks
   -------------------------------------------------------------------------- */
function CaseStudyBody({ project }: { project: Project }) {
  // Results stat row: prefer real metrics; fall back to result statements as cards.
  const hasMetrics = project.metrics.length > 0;

  return (
    <article className="flex flex-col gap-20 sm:gap-24">
      {/* 1 — Overview */}
      <Reveal as="section">
        <SectionHeading eyebrow="01 — Overview" title="The short version" />
        <Prose>{project.overview}</Prose>
      </Reveal>

      {/* 2 — Problem */}
      <Reveal as="section">
        <SectionHeading eyebrow="02 — Problem" title="What needed solving" />
        <Prose>{project.problem}</Prose>
      </Reveal>

      {/* 3 — Approach */}
      <Reveal as="section">
        <SectionHeading eyebrow="03 — Approach" title="How I framed it" />
        <Prose>{project.approach}</Prose>
      </Reveal>

      {/* 4 — Architecture */}
      <Reveal as="section">
        <SectionHeading
          eyebrow="04 — Architecture"
          title={
            <>
              The system,{" "}
              <span className="font-serif italic text-text-secondary">end to end</span>
            </>
          }
        />
        <div className="mt-10">
          <ArchitectureDiagram
            nodes={project.architecture.nodes}
            summary={project.architecture.summary}
          />
        </div>
      </Reveal>

      {/* 5 — Implementation (solution) */}
      <Reveal as="section">
        <SectionHeading eyebrow="05 — Implementation" title="What I built" />
        <Prose>{project.solution}</Prose>
      </Reveal>

      {/* 6 — Challenges */}
      {project.challenges.length > 0 && (
        <Reveal as="section">
          <SectionHeading eyebrow="06 — Challenges" title="The hard parts" />
          <PointList items={project.challenges} />
        </Reveal>
      )}

      {/* 7 — Performance (before → after) */}
      {project.performance.length > 0 && (
        <Reveal as="section">
          <SectionHeading
            eyebrow="07 — Performance"
            title={
              <>
                Before{" "}
                <span className="font-serif italic text-text-tertiary">→</span> after
              </>
            }
          />
          <dl className="mt-10 flex max-w-[72ch] flex-col gap-px overflow-hidden rounded-xl border border-border bg-surface/40 ring-hairline">
            {project.performance.map((row) => (
              <div
                key={row.label}
                className="grid gap-x-6 gap-y-3 bg-bg/40 px-5 py-5 sm:grid-cols-[14rem_1fr] sm:px-6"
              >
                <dt className="font-mono text-eyebrow uppercase tracking-[0.14em] text-text-tertiary">
                  {row.label}
                </dt>
                <dd className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                  <span className="text-sm text-text-tertiary line-through decoration-text-muted/60">
                    {row.before}
                  </span>
                  <ArrowRight
                    aria-hidden="true"
                    className="hidden size-4 shrink-0 text-text-muted sm:block"
                  />
                  <span className="text-pretty text-sm font-medium text-text">
                    {row.after}
                  </span>
                </dd>
                {row.note ? (
                  <p className="text-sm text-text-tertiary sm:col-start-2">
                    {row.note}
                  </p>
                ) : null}
              </div>
            ))}
          </dl>
        </Reveal>
      )}

      {/* 8 — Results */}
      <Reveal as="section">
        <SectionHeading
          eyebrow="08 — Results"
          title={
            <>
              What{" "}
              <span className="font-serif italic text-text-secondary">shipped</span>
            </>
          }
        />
        {hasMetrics ? (
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {project.metrics.map((metric) => (
              <StatCard
                key={metric.label}
                value={metric.value}
                label={metric.label}
              />
            ))}
          </div>
        ) : null}
        {project.results.length > 0 && (
          <PointList items={project.results} />
        )}
      </Reveal>

      {/* 9 — Lessons */}
      {project.lessons.length > 0 && (
        <Reveal as="section">
          <SectionHeading eyebrow="09 — Lessons" title="What I took away" />
          <PointList items={project.lessons} />
        </Reveal>
      )}
    </article>
  );
}

/* --------------------------------------------------------------------------
   Prev / Next pager
   -------------------------------------------------------------------------- */
function ProjectPager({ index }: { index: number }) {
  const total = projects.length;
  const prev = projects[(index - 1 + total) % total];
  const next = projects[(index + 1) % total];

  // With a single project, a pager would point to itself — skip it.
  if (total < 2) return null;

  return (
    <nav
      aria-label="More case studies"
      className="border-t border-border"
    >
      <div className="container-page grid gap-px overflow-hidden sm:grid-cols-2">
        <Link
          href={`/work/${prev.slug}`}
          className="group flex min-h-28 flex-col justify-center gap-2 py-10 transition-colors sm:pr-8"
        >
          <span className="inline-flex items-center gap-2 font-mono text-eyebrow uppercase tracking-[0.14em] text-text-tertiary transition-colors group-hover:text-accent">
            <ArrowLeft className="size-3.5 transition-transform duration-200 ease-out group-hover:-translate-x-1" />
            Previous
          </span>
          <span className="font-display text-h3 text-text-secondary transition-colors group-hover:text-text">
            {prev.title}
          </span>
        </Link>

        <Link
          href={`/work/${next.slug}`}
          className="group flex min-h-28 flex-col items-start justify-center gap-2 border-t border-border py-10 transition-colors sm:items-end sm:border-l sm:border-t-0 sm:pl-8 sm:text-right"
        >
          <span className="inline-flex items-center gap-2 font-mono text-eyebrow uppercase tracking-[0.14em] text-text-tertiary transition-colors group-hover:text-accent">
            Next
            <ArrowRight className="size-3.5 transition-transform duration-200 ease-out group-hover:translate-x-1" />
          </span>
          <span className="font-display text-h3 text-text-secondary transition-colors group-hover:text-text">
            {next.title}
          </span>
        </Link>
      </div>
    </nav>
  );
}

/* --------------------------------------------------------------------------
   Page
   -------------------------------------------------------------------------- */
export default async function CaseStudyPage({
  params,
}: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    notFound();
  }

  const index = projects.findIndex((p) => p.slug === slug);

  return (
    <div>
      {/* JSON-LD structured data for this case study */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(projectJsonLd(project)) }}
      />

      <CaseStudyHero project={project} />

      <div className="container-page section-py">
        <div className="grid gap-12 lg:grid-cols-[18rem_1fr] lg:gap-16">
          <MetaRail project={project} />
          <CaseStudyBody project={project} />
        </div>
      </div>

      <ProjectPager index={index} />

      <ContactCTA />
    </div>
  );
}
