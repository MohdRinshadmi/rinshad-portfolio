import { ChapterMark } from "@/components/story/ChapterMark";
import { Reveal } from "@/components/motion/Reveal";
import { LineMask } from "@/components/motion/LineMask";
import { chapterPrinciples } from "@/lib/story";

/**
 * Chapter 05 — Principles. Five rules, beautifully typeset: a mono index in
 * the margin, the statement in large serif, a one-line gloss beneath. Hairline
 * rules between rows; each statement rises out of a line mask on scroll-in.
 */
export function Principles() {
  return (
    <section id="chapter-05" className="section-py bg-bg-subtle/60">
      <div className="container-page">
        <ChapterMark
          number={chapterPrinciples.number}
          title={chapterPrinciples.title}
          intro={chapterPrinciples.intro}
        />

        <ol className="mt-16 sm:mt-24">
          {chapterPrinciples.items.map((principle, i) => (
            <Reveal as="li" key={principle.statement} delay={0.05}>
              <div className="grid gap-2 border-t border-border-strong py-10 sm:grid-cols-[6rem_1fr] sm:gap-8 sm:py-12 lg:py-14">
                <span className="font-mono text-sm text-accent">0{i + 1}</span>
                <div>
                  <LineMask>
                    <h3 className="font-serif text-display-lg text-text">{principle.statement}</h3>
                  </LineMask>
                  <p className="mt-4 max-w-[52ch] text-body-lg text-text-secondary">
                    {principle.gloss}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
        <div aria-hidden="true" className="h-px bg-border-strong" />
      </div>
    </section>
  );
}
