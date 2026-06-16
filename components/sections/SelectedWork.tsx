import { ArrowRight } from "lucide-react";

import { projects } from "@/lib/data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { ProjectCard } from "@/components/work/ProjectCard";
import { ScrollScale } from "@/components/motion/ScrollScale";

/**
 * SelectedWork — featured case studies on the homepage.
 *
 * Desktop: the cards STACK as you scroll — each opaque ink card is `lg:sticky`
 * with a stepped top offset, so the next card rises and settles on top of the
 * previous one (Formix "stacking deck"). On mobile the sticky is dropped (a card
 * can exceed the viewport) and the cards flow normally with generous gaps.
 * Server component: SectionHeading + ProjectCard own their client motion.
 */
export function SelectedWork() {
  const featured = projects.filter((project) => project.featured);

  return (
    <section id="work" className="section-py">
      <div className="container-page">
        <SectionHeading
          eyebrow="SELECTED WORK"
          eyebrowPill
          title={
            <>
              Production systems,{" "}
              <span className="text-text-secondary">shipped and felt.</span>
            </>
          }
          description="Streaming AI copilots, conflict-free real-time editing, and live telemetry at scale — each owned end-to-end, from architecture to Core Web Vitals."
        />
      </div>

      {/* Stacking deck */}
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
        <Button
          href="/work"
          variant="ghost"
          iconRight={<ArrowRight className="size-4" aria-hidden="true" />}
        >
          View all work
        </Button>
      </div>
    </section>
  );
}
