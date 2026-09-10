import { ArrowUpRight, Download } from "lucide-react";
import { ChapterMark } from "@/components/story/ChapterMark";
import { ScrubText } from "@/components/motion/ScrubText";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { MetricText } from "@/components/ui/MetricText";
import { chapterProduction } from "@/lib/content/story";
import { experience, HIGHLIGHT_INDICES, keyAchievements } from "@/lib/content/profile";
import { siteConfig } from "@/lib/config/site";

const LIST_LABEL = "font-mono text-[11px] uppercase tracking-[0.14em] text-text-tertiary";

/**
 * Chapter 01 — In Production. Professional experience on the homepage, where
 * a reviewer actually looks for it: the current role, the résumé's three key
 * achievements (bold lead, then evidence), the bullets those don't already
 * cover, and a path to the full timeline and the résumé.
 *
 * Server component; the scrubbed sentence and the reveals are the only islands.
 */
export function InProduction() {
  const role = experience.find((item) => item.current) ?? experience[0];
  const highlights = HIGHLIGHT_INDICES.map((index) => role.achievements[index]);

  return (
    <section id="experience" className="section-py">
      <div className="container-page">
        <ChapterMark number={chapterProduction.number} title={chapterProduction.title} />

        <ScrubText
          text={chapterProduction.intro}
          className="mt-10 max-w-[42ch] font-display text-h2 font-medium sm:mt-12"
        />

        <Reveal className="mt-14 sm:mt-20">
          <article
            aria-labelledby="current-role"
            className="grid gap-10 border-t border-border-strong pt-10 lg:grid-cols-[17rem_1fr] lg:gap-16"
          >
            <header>
              <p className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-text-tertiary">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-positive animate-pulse-dot" />
                Current role
              </p>
              <h3 id="current-role" className="mt-4 font-display text-h3 text-text">
                {role.role}
              </h3>
              <p className="mt-1 text-text-secondary">{role.company}</p>
              <p className="mt-3 font-mono text-xs uppercase tracking-wider text-text-tertiary">
                {role.period} · {role.location}
              </p>
              <ul aria-label="Technologies used in this role" className="mt-6 flex flex-wrap gap-1.5">
                {role.technologies.map((tech) => (
                  <li key={tech}>
                    <Chip size="sm">{tech}</Chip>
                  </li>
                ))}
              </ul>
            </header>

            <div>
              <h4 className={LIST_LABEL}>{chapterProduction.achievementsLabel}</h4>
              <ul className="mt-3 flex flex-col divide-y divide-border">
                {keyAchievements.map((item) => (
                  <li key={item.lead} className="py-4 text-body-lg leading-relaxed text-text-secondary">
                    <strong className="font-semibold text-text">{item.lead}</strong>{" "}
                    <MetricText text={item.detail} />
                  </li>
                ))}
              </ul>

              <h4 className={`${LIST_LABEL} mt-8`}>{chapterProduction.alsoLabel}</h4>
              <ul className="mt-3 flex flex-col divide-y divide-border">
                {highlights.map((text) => (
                  <li key={text} className="py-4 leading-relaxed text-text-secondary">
                    <MetricText text={text} />
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button
                  href={chapterProduction.more.href}
                  iconRight={<ArrowUpRight className="size-4" />}
                >
                  {chapterProduction.more.label}
                </Button>
                <Button
                  href={siteConfig.resumeUrl}
                  download={siteConfig.resumeFileName}
                  variant="ghost"
                  iconRight={<Download className="size-4" />}
                >
                  Download résumé
                </Button>
              </div>
            </div>
          </article>
        </Reveal>

        <Reveal className="mt-16 sm:mt-24 lg:ml-68 lg:pl-16">
          <figure className="border-l-2 border-accent pl-6 sm:pl-8">
            <blockquote className="max-w-[30ch] font-serif text-h2 italic text-text">
              “{chapterProduction.quote}”
            </blockquote>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
