import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { usesIntro, usesCategories, colophon } from "@/lib/content/uses";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = buildMetadata({
  title: "Uses",
  description:
    "The tools behind the work — the AI-native coding workflow (Claude Code, Cursor), the React/Next.js/React Native + Node.js/Go stack, and the testing and deployment setup I ship with.",
  path: "/uses",
});

/**
 * /uses — the daily toolkit as editorial hairline rows: a category label in
 * the margin, then annotated tool rows. Server component; all copy lives in
 * `lib/content/uses.ts`.
 */
export default function UsesPage() {
  return (
    <div className="section-pt pb-32">
      <div className="container-page">
        {/* Header */}
        <header className="max-w-[68ch]">
          <Eyebrow dot>{usesIntro.eyebrow}</Eyebrow>
          <h1 className="mt-5 font-display text-display-xl text-text">
            {usesIntro.headline.lead}{" "}
            <span className="font-serif italic text-text-secondary">
              {usesIntro.headline.accent}
            </span>
          </h1>
          <p className="mt-6 text-body-lg text-text-secondary">{usesIntro.byline}</p>
        </header>

        {/* Categories — hairline rows, label in the margin */}
        <div className="mt-16 border-t border-border-strong sm:mt-20">
          {usesCategories.map((category, i) => (
            <Reveal key={category.key} delay={Math.min(i * 0.04, 0.12)}>
              <section
                aria-labelledby={`uses-${category.key}`}
                className="grid gap-6 border-b border-border py-10 sm:grid-cols-[14rem_1fr] sm:gap-10 sm:py-12"
              >
                <div>
                  <h2
                    id={`uses-${category.key}`}
                    className="font-display text-h3 font-medium text-text"
                  >
                    {category.title}
                  </h2>
                  <p className="mt-2 max-w-[26ch] text-sm text-text-tertiary">
                    {category.blurb}
                  </p>
                </div>

                <dl>
                  {category.items.map((item) => (
                    <div
                      key={item.name}
                      className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-baseline sm:gap-6"
                    >
                      <dt className="shrink-0 font-medium text-text sm:w-64">{item.name}</dt>
                      <dd className="text-sm leading-relaxed text-text-secondary">
                        {item.note}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            </Reveal>
          ))}
        </div>

        {/* Colophon */}
        <Reveal delay={0.1}>
          <p className="mt-12 max-w-[68ch] font-mono text-xs leading-relaxed text-text-tertiary">
            <span className="text-accent">{colophon.title}:</span> {colophon.note}
          </p>
        </Reveal>
      </div>
    </div>
  );
}
