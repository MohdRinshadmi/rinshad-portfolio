import { ArrowRight } from "lucide-react";
import type { Project } from "@/lib/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { ArchitectureFlow } from "@/components/work/ArchitectureFlow";
import { StatCard } from "@/components/work/StatCard";

/** A long-form prose block: editorial measure, secondary ink. */
function Prose({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-6 max-w-[68ch] text-pretty text-body-lg text-text-secondary">{children}</p>
  );
}

/** A quiet, numbered or bulleted list of statements. */
function PointList({ items, ordered = false }: { items: string[]; ordered?: boolean }) {
  const ListTag = ordered ? "ol" : "ul";
  return (
    <ListTag className="mt-8 flex max-w-[68ch] flex-col gap-px overflow-hidden rounded-xl border border-border bg-surface/40 ring-hairline">
      {items.map((item, i) => (
        <li key={item} className="flex items-start gap-4 bg-bg/40 px-5 py-4 sm:px-6">
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

/** A résumé paragraph is a run of separate things that were built — one per sentence. */
function sentences(text: string): string[] {
  return text.split(/(?<=\.)\s+(?=[A-Z])/);
}

/**
 * CaseStudyBody — Challenge → Architecture → Engineering decisions →
 * Implementation → Performance → Result → What I learned.
 *
 * Seven short, scannable blocks. The old nine-part version opened with an
 * "Overview" that repeated the hero and closed on prose that repeated the
 * overview; the reader now meets each fact once.
 */
export function CaseStudyBody({ project }: { project: Project }) {
  let step = 0;
  const eyebrow = (name: string) => `${String(++step).padStart(2, "0")} — ${name}`;

  return (
    <article className="flex flex-col gap-20 sm:gap-24">
      <Reveal as="section">
        <SectionHeading eyebrow={eyebrow("Challenge")} title="What needed solving" />
        <Prose>{project.problem}</Prose>
        {project.challenges.length > 0 && <PointList items={project.challenges} />}
      </Reveal>

      <Reveal as="section">
        <SectionHeading
          eyebrow={eyebrow("Architecture")}
          title={
            <>
              The system, <span className="font-serif italic text-text-secondary">end to end</span>
            </>
          }
        />
        <ArchitectureFlow
          nodes={project.architecture.nodes}
          tone="paper"
          label={`${project.title}: request path`}
          className="mt-10"
        />
        <Prose>{project.architecture.summary}</Prose>
      </Reveal>

      <Reveal as="section">
        <SectionHeading eyebrow={eyebrow("Engineering decisions")} title="How I framed it" />
        <Prose>{project.approach}</Prose>
        <p className="mt-6 max-w-[68ch] border-l-2 border-accent pl-5 text-body-lg text-text">
          {project.card.decision}
        </p>
      </Reveal>

      <Reveal as="section">
        <SectionHeading eyebrow={eyebrow("Implementation")} title="What I built" />
        <PointList items={sentences(project.solution)} ordered />
      </Reveal>

      {project.performance.length > 0 && (
        <Reveal as="section">
          <SectionHeading
            eyebrow={eyebrow("Performance")}
            title={
              <>
                Before <span className="font-serif italic text-text-tertiary">→</span> after
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
                    <span className="sr-only">Before: </span>
                    {row.before}
                  </span>
                  <ArrowRight aria-hidden="true" className="hidden size-4 shrink-0 text-text-muted sm:block" />
                  <span className="text-pretty text-sm font-medium text-text">
                    <span className="sr-only">After: </span>
                    {row.after}
                  </span>
                </dd>
                {row.note ? <p className="text-sm text-text-tertiary sm:col-start-2">{row.note}</p> : null}
              </div>
            ))}
          </dl>
        </Reveal>
      )}

      <Reveal as="section">
        <SectionHeading
          eyebrow={eyebrow("Result")}
          title={
            <>
              What <span className="font-serif italic text-text-secondary">shipped</span>
            </>
          }
        />
        <p className="mt-6 max-w-[68ch] text-body-lg text-text">{project.card.result}</p>
        {project.metrics.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {project.metrics.map((metric) => (
              <StatCard key={metric.label} value={metric.value} label={metric.label} />
            ))}
          </div>
        ) : null}
        {project.results.length > 0 && <PointList items={project.results} />}
      </Reveal>

      {project.lessons.length > 0 && (
        <Reveal as="section">
          <SectionHeading eyebrow={eyebrow("What I learned")} title="What I took away" />
          <PointList items={project.lessons} />
        </Reveal>
      )}
    </article>
  );
}
