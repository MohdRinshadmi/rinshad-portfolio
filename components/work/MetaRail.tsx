import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/types";
import { Chip } from "@/components/ui/Chip";
import { GithubIcon } from "@/components/ui/SocialIcons";

/** One label/value meta row. Mono uppercase label, quiet value. */
function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="font-mono text-eyebrow uppercase tracking-[0.14em] text-text-tertiary">
        {label}
      </dt>
      <dd className="text-sm text-text">{value}</dd>
    </div>
  );
}

/**
 * MetaRail — the sticky meta column beside a case-study body (server component).
 *
 * Role · Timeline · Year · Platform, the grouped tech `stack` (label + Chips),
 * and Live / GitHub links. Quiet, mono-labelled, sticky from `lg:` up.
 */
export function MetaRail({ project }: { project: Project }) {
  return (
    <aside
      aria-label="Project details"
      className="lg:sticky lg:top-28 lg:self-start"
    >
      <div className="rounded-xl border border-border bg-surface/60 ring-hairline p-6 sm:p-7">
        {/* Top-line facts */}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-5">
          <MetaRow label="Role" value={project.role} />
          <MetaRow label="Timeline" value={project.timeline} />
          <MetaRow label="Year" value={project.year} />
          <MetaRow label="Platform" value={project.platform} />
        </dl>

        {/* Grouped tech stack */}
        {project.stack.length > 0 && (
          <div className="mt-7 space-y-5 border-t border-border pt-7">
            {project.stack.map((group) => (
              <div key={group.label} className="flex flex-col gap-2.5">
                <p className="font-mono text-eyebrow uppercase tracking-[0.14em] text-text-tertiary">
                  {group.label}
                </p>
                <ul className="flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <li key={item}>
                      <Chip size="sm">{item}</Chip>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Live / GitHub links */}
        {(project.liveUrl || project.githubUrl) && (
          <div className="mt-7 flex flex-col gap-3 border-t border-border pt-7">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex min-h-11 items-center justify-between gap-3 text-sm text-text-secondary transition-colors hover:text-text"
              >
                <span className="font-mono text-eyebrow uppercase tracking-[0.14em] text-text-tertiary transition-colors group-hover:text-accent">
                  Live
                </span>
                <span className="inline-flex items-center gap-1.5 text-text">
                  Visit site
                  <ArrowUpRight className="size-4 text-text-tertiary transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
                </span>
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex min-h-11 items-center justify-between gap-3 text-sm text-text-secondary transition-colors hover:text-text"
              >
                <span className="font-mono text-eyebrow uppercase tracking-[0.14em] text-text-tertiary transition-colors group-hover:text-accent">
                  Source
                </span>
                <span className="inline-flex items-center gap-1.5 text-text">
                  <GithubIcon className="size-4 text-text-tertiary transition-colors group-hover:text-text" />
                  GitHub
                </span>
              </a>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
