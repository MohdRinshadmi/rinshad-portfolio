import { capabilities, aiWorkflow } from "@/lib/data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Chip } from "@/components/ui/Chip";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Capabilities — the four-pillar matrix (replaces % skill bars).
 * Server component: cards are static; Reveal/SectionHeading handle entrance.
 */
export function Capabilities() {
  return (
    <section id="capabilities" className="section-py">
      <div className="container-page">
        <SectionHeading eyebrow="CAPABILITIES" eyebrowPill title="How I deliver" />

        <div className="mt-12 grid grid-cols-1 gap-4 sm:mt-16 sm:gap-6 md:grid-cols-2">
          {capabilities.map((capability, i) => (
            <Reveal
              key={capability.title}
              delay={i * 0.06}
              className="h-full"
            >
              <article className="flex h-full flex-col gap-5 rounded-xl border border-border bg-surface p-8 ring-hairline">
                <h3 className="font-display text-h3 text-text">
                  {capability.title}
                </h3>
                <p className="text-text-secondary">{capability.blurb}</p>
                <ul className="mt-auto flex flex-wrap gap-2 pt-2">
                  {capability.items.map((item) => (
                    <li key={item}>
                      <Chip>{item}</Chip>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal
          delay={0.08}
          className="mt-10 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:gap-6"
        >
          <span className="font-mono text-eyebrow uppercase text-text-tertiary">
            AI workflow
          </span>
          <ul className="flex flex-wrap gap-2">
            {aiWorkflow.map((tool) => (
              <li key={tool}>
                <Chip>{tool}</Chip>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
