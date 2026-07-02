import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ChapterMark } from "@/components/story/ChapterMark";
import { ScrubText } from "@/components/motion/ScrubText";
import { ScrollScale } from "@/components/motion/ScrollScale";
import { ProjectArchitectureCanvas } from "@/components/story/ProjectArchitectureCanvas";
import { projects } from "@/lib/content/projects";
import { chapterWork } from "@/lib/content/story";

/**
 * Chapter 04 — Selected Work, as a stacking deck of dark "ink" cards. Each card
 * is sized to fit one screen — narrative + project shot, then the architecture
 * blueprint that strokes itself in — and is pinned with `lg:sticky` at a stepped
 * offset, so the next card rises (ScrollScale "settle") and lands on top: the
 * chapter appends layer over layer as you scroll. Keeping the card within a
 * viewport is what lets the whole diagram stay visible while it's pinned.
 */
const featured = projects.filter((project) => project.featured);

export function WorkStories() {
  return (
    <section
      id="work"
      className="section-py"
      style={{ "--color-accent": "#C75C38" } as CSSProperties}
    >
      <div className="container-page">
        <ChapterMark number={chapterWork.number} title={chapterWork.title} />

        {/* Intro ignites word-by-word as it passes the reading zone. */}
        <ScrubText text={chapterWork.intro} className="mt-6 max-w-[56ch] text-body-lg" />
      </div>

      {/* ── Stacking deck ──────────────────────────────────────────────────
          Each card is sized to one screen and pinned with `lg:sticky` at a
          stepped offset, so the next card rises (ScrollScale "settle") and
          lands on top of the previous one — the chapter appends layer over
          layer as you scroll. On mobile the sticky is dropped and cards flow. */}
      <div className="container-page mt-14 sm:mt-20">
        <div className="flex flex-col gap-8 lg:gap-12">
          {featured.map((project, i) => (
            <div
              key={project.slug}
              className="lg:sticky"
              style={{ top: `calc(5.5rem + ${i * 1.25}rem)` }}
            >
              <ScrollScale from={0.97} y={48}>
                <ProjectArchitectureCanvas project={project} index={i} />
              </ScrollScale>
            </div>
          ))}
        </div>
      </div>

      <div className="container-page mt-16 flex justify-center sm:mt-24">
        <Link
          href="/work"
          className="group inline-flex items-center gap-2 border-b border-text/30 pb-1 text-sm font-medium text-text transition-colors duration-200 hover:border-accent hover:text-accent"
        >
          View all work
          <ArrowUpRight
            aria-hidden="true"
            className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </section>
  );
}
