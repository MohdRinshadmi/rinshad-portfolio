import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ChapterMark } from "@/components/story/ChapterMark";
import { ScrubText } from "@/components/motion/ScrubText";
import { ScrollScale } from "@/components/motion/ScrollScale";
import { ProjectCard } from "@/components/work/ProjectCard";
import { projects } from "@/lib/data";
import { chapterWork } from "@/lib/story";

/**
 * Chapter 04 — Selected Work, as a stacking deck. Each featured project is an
 * opaque ink card pinned with `lg:sticky` at a stepped top offset, so the next
 * card rises (ScrollScale "settle") and lands on top of the previous one — the
 * chapter reads as appended layers while you scroll. On mobile the sticky is
 * dropped (a card can exceed the viewport) and cards flow with normal gaps.
 */
export function WorkStories() {
  const featured = projects.filter((project) => project.featured);

  return (
    <section id="work" className="section-py">
      <div className="container-page">
        <ChapterMark number={chapterWork.number} title={chapterWork.title} />

        {/* Intro ignites word-by-word as it passes the reading zone. */}
        <ScrubText text={chapterWork.intro} className="mt-6 max-w-[56ch] text-body-lg" />
      </div>

      {/* ── Stacking deck ──────────────────────────────────────────────── */}
      <div className="container-page mt-14 sm:mt-20">
        <div className="flex flex-col gap-8 lg:gap-12">
          {featured.map((project, i) => (
            <div
              key={project.slug}
              className="lg:sticky"
              style={{ top: `calc(5.5rem + ${i * 1.25}rem)` }}
            >
              {/* Apple "settle": each card rises and scales to rest before it
                  pins — the deck reads as physical layers, not a scroll list. */}
              <ScrollScale from={0.965} y={48}>
                <ProjectCard project={project} variant="featured" index={i} />
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
