import type { Metadata } from "next";
import Image from "next/image";
import { Search, Layout, Code2, Sparkles, Rocket, type LucideIcon } from "lucide-react";

import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/config/site";
import { about, skillGroups, workProcess } from "@/lib/content/profile";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Chip } from "@/components/ui/Chip";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { ExperienceTimeline } from "@/components/about/ExperienceTimeline";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description: siteConfig.bio,
  path: "/about",
});

/** Map the data-driven icon strings to lucide components (workProcess). */
const PROCESS_ICONS: Record<string, LucideIcon> = {
  Search,
  Layout,
  Code2,
  Sparkles,
  Rocket,
};

export default function AboutPage() {
  return (
    <div>
      {/* ====================================================================
          HERO-LITE — eyebrow + the single H1
          ================================================================== */}
      <section className="relative section-pt pb-4">
        {/* signature background — quiet, behind everything, non-interactive */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-aurora opacity-70"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-grain opacity-50"
        />

        <div className="container-page">
          <Reveal>
            <Eyebrow dot>ABOUT · {siteConfig.locationShort}</Eyebrow>
          </Reveal>

          <Reveal as="div" delay={0.06} className="mt-6">
            <h1 className="max-w-[18ch] font-display text-display-xl text-balance text-text">
              Engineer behind the{" "}
              <span className="font-serif italic text-text">streaming</span>.
            </h1>
          </Reveal>
        </div>
      </section>

      {/* ====================================================================
          STORY — editorial long-form (intro big, paragraphs, closing)
          ================================================================== */}
      <section id="story" className="section-py pt-16 sm:pt-20">
        <div className="container-page">
          {/* Story left · photo right on lg+ (photo keeps first place in the
              DOM so it stacks centered on top below lg). items-center keeps
              the near-square portrait balanced against the text block. */}
          <div className="grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,6fr)] lg:items-center lg:gap-20">
            {/* ── Portrait — larger and calmer than the hero's: hairline
                gradient edge, soft shadow, and a gentle lift on hover. */}
            <Reveal className="mx-auto w-full max-w-88 lg:order-last lg:mx-0 lg:max-w-none">
              <div className="group relative">
                {/* faint terracotta wash — ties the plate to the page aurora */}
                <div
                  aria-hidden
                  className="absolute -inset-8 -z-10 bg-[radial-gradient(55%_50%_at_45%_35%,rgba(199,92,55,0.10),transparent_72%)] blur-2xl"
                />
                <div className="rounded-3xl bg-linear-to-br from-accent/50 via-border to-border p-px shadow-card transition-[transform,box-shadow] duration-500 ease-out group-hover:-translate-y-1 group-hover:shadow-raised">
                  <Image
                    src="/images/rinshad-portrait-v2.jpg"
                    alt="Mohammed Rinshad, full-stack web and mobile engineer, photographed outdoors in Kerala"
                    width={1200}
                    height={1277}
                    priority
                    sizes="(min-width: 1024px) 32rem, (min-width: 640px) 22rem, 88vw"
                    className="h-auto w-full rounded-[calc(1.5rem-1px)] object-cover"
                  />
                </div>
              </div>
            </Reveal>

            {/* ── The story ─────────────────────────────────────────── */}
            <div>
              <Reveal>
                <p className="max-w-[24ch] font-display text-display-lg text-balance text-text">
                  {about.intro}
                </p>
              </Reveal>

              <div className="mt-10 flex flex-col gap-6 sm:mt-12">
                {about.paragraphs.map((paragraph, i) => (
                  <Reveal key={i} delay={0.04 * i}>
                    <p className="max-w-[66ch] text-body-lg text-text-secondary">
                      {paragraph}
                    </p>
                  </Reveal>
                ))}
              </div>

              <Reveal delay={0.08} className="mt-10 sm:mt-12">
                <p className="max-w-[66ch] border-l border-accent/30 pl-5 text-body-lg text-text">
                  {about.closing}
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SKILL INVENTORY — full skillGroups (label + mono chips)
          ================================================================== */}
      <section id="stack" className="section-py">
        <div className="container-page">
          <SectionHeading
            eyebrow="STACK"
            title={
              <>
                The full{" "}
                <span className="font-serif italic text-text">inventory</span>.
              </>
            }
            description="Every tool I reach for — languages, frameworks, AI SDKs, real-time, testing, and delivery. Verbatim from the résumé, no padding."
          />

          <Stagger gap="fast" className="mt-14 flex flex-col sm:mt-16">
            {skillGroups.map((group) => (
              <StaggerItem
                key={group.label}
                className="grid gap-x-8 gap-y-4 border-t border-border py-6 first:border-t-0 first:pt-0 sm:grid-cols-[14rem_1fr] sm:py-7"
              >
                <h3 className="font-mono text-eyebrow uppercase tracking-wider text-text-tertiary">
                  {group.label}
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li key={item}>
                      <Chip>{item}</Chip>
                    </li>
                  ))}
                </ul>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ====================================================================
          HOW I WORK — workProcess 5 steps as numbered cards
          ================================================================== */}
      <section id="process" className="section-py">
        <div className="container-page">
          <SectionHeading
            eyebrow="PROCESS"
            title={
              <>
                How I{" "}
                <span className="font-serif italic text-text">work</span>.
              </>
            }
            description="A repeatable path from a fuzzy problem to something running in production — five steps, no skipped corners."
          />

          <Stagger
            gap="fast"
            as="ul"
            className="mt-14 grid gap-4 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3"
          >
            {workProcess.map((step) => {
              const Icon = PROCESS_ICONS[step.icon];
              return (
                <StaggerItem
                  key={step.step}
                  as="li"
                  className="group flex flex-col rounded-xl border border-border bg-surface p-7 ring-hairline transition-colors duration-300 hover:border-accent/20"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-eyebrow uppercase tracking-wider text-text-tertiary">
                      {String(step.step).padStart(2, "0")}
                    </span>
                    {Icon ? (
                      <Icon
                        aria-hidden
                        className="size-5 text-text-tertiary transition-colors duration-300 group-hover:text-accent"
                        strokeWidth={1.5}
                      />
                    ) : null}
                  </div>
                  <h3 className="mt-6 font-display text-h3 text-text">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-text-secondary">{step.description}</p>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* ====================================================================
          EXPERIENCE — owns the vertical timeline + education coda
          ================================================================== */}
      <ExperienceTimeline />
    </div>
  );
}
