import { ChapterMark } from "@/components/story/ChapterMark";
import { LayerStack } from "@/components/story/LayerStack";
import { ScrubText } from "@/components/motion/ScrubText";
import { chapterSystems } from "@/lib/content/story";

/**
 * Chapter 04 — How I build production systems. The architecture the work
 * lives in, client to AI, with the technologies used at each layer. This is
 * the homepage's skills section too: organised by engineering responsibility
 * rather than as one long inventory, so a recruiter (or an ATS) can map each
 * technology to what it is for. The full, verbatim list stays on /about.
 */
export function HowIBuild() {
  return (
    <section id="stack" className="section-py">
      <div className="container-page">
        <ChapterMark number={chapterSystems.number} title={chapterSystems.title} />

        <div className="mt-14 grid gap-14 sm:mt-20 lg:grid-cols-[5fr_7fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <ScrubText text={chapterSystems.paragraph} className="font-display text-h3 font-medium" />
            <p className="mt-8 font-serif text-h2 italic text-accent">{chapterSystems.closing}</p>

            <dl className="mt-10 grid gap-6 border-t border-border pt-6 sm:grid-cols-2 lg:grid-cols-1">
              <div>
                <dt className="font-mono text-eyebrow uppercase text-text-tertiary">Languages</dt>
                <dd className="mt-2 text-text-secondary">{chapterSystems.languages.join(" · ")}</dd>
              </div>
              <div>
                <dt className="font-mono text-eyebrow uppercase text-text-tertiary">
                  Testing &amp; quality
                </dt>
                <dd className="mt-2 text-text-secondary">{chapterSystems.quality.join(" · ")}</dd>
              </div>
              <div>
                <dt className="font-mono text-eyebrow uppercase text-text-tertiary">Practices</dt>
                <dd className="mt-2 text-text-secondary">{chapterSystems.practices.join(" · ")}</dd>
              </div>
            </dl>
          </div>

          <LayerStack layers={chapterSystems.layers} />
        </div>
      </div>
    </section>
  );
}
