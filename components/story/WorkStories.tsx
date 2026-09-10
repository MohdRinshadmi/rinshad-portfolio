import { ChapterMark } from "@/components/story/ChapterMark";
import { ScrubText } from "@/components/motion/ScrubText";
import { ScrollScale } from "@/components/motion/ScrollScale";
import { ProjectFeature } from "@/components/work/ProjectFeature";
import { projects } from "@/lib/content/projects";
import { chapterWork } from "@/lib/content/story";

const featured = projects.filter((project) => project.featured);

/**
 * Chapter 03 — Selected Work, as a stacking deck of dark "ink" cards. Each card
 * settles in as it rises (ScrollScale) and pins at a stepped offset, so the
 * next one lands on top of it.
 *
 * Pinned only where a card actually fits the screen: lg AND at least 820px
 * tall. A pinned card taller than the viewport hides its own bottom — the
 * Result, the part that matters most — under the card that follows. Shorter
 * laptop screens and phones get the same cards in normal flow.
 */
export function WorkStories() {
  return (
    <section id="work" className="section-py">
      <div className="container-page">
        <ChapterMark number={chapterWork.number} title={chapterWork.title} />
        <ScrubText text={chapterWork.intro} className="mt-6 max-w-[60ch] text-body-lg" />
      </div>

      <div className="container-page mt-14 sm:mt-20">
        <div className="flex flex-col gap-8 lg:gap-12">
          {featured.map((project, i) => (
            <div
              key={project.slug}
              className="[@media(min-width:1024px)_and_(min-height:820px)]:sticky"
              style={{ top: `calc(5.5rem + ${i * 1.25}rem)` }}
            >
              <ScrollScale from={0.97} y={48}>
                <ProjectFeature project={project} index={i} />
              </ScrollScale>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
