import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { HeroDeparture } from "@/components/story/HeroDeparture";
import { HeroPortrait } from "@/components/story/HeroPortrait";
import { prologue } from "@/lib/content/story";
import { siteConfig } from "@/lib/config/site";

/** Stagger for the CSS entrance (`.hero-line` / `.hero-fade` in globals.css). */
const at = (seconds: number) => ({ "--hero-delay": `${seconds}s` }) as CSSProperties;

const MASTHEAD =
  "font-(family-name:--font-archivo-black) text-[clamp(2.25rem,10.5vw,3.5rem)] font-normal uppercase leading-[0.98] tracking-[-0.02em] lg:text-[clamp(3rem,5vw,5.5rem)]";

/**
 * Prologue — the documentary's cover, and the five-second test.
 *
 * In reading order it answers WHO (the masthead), WHAT (backend · cloud ·
 * AI/LLM · real-time), VALUE (one sentence and its evidence), TECHNOLOGY (six
 * chips), then offers the three things a recruiter came to do: see the work,
 * take the résumé, start a conversation.
 *
 * Server component. The entrance is CSS, not Framer: below `lg` this text is
 * the LCP element, and a JS `initial` state would hold it clipped or
 * transparent until hydration. Only the scroll departure and the portrait's
 * interactions hydrate.
 */
export function Prologue() {
  const { meta, headline } = prologue;

  return (
    <section id="prologue" className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-aurora" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-grain opacity-50" />

      <HeroDeparture className="container-wide flex min-h-svh flex-col pb-16 pt-22 sm:pb-24 sm:pt-24">
        {/* ── Colophon plate ─────────────────────────────────────────────── */}
        <div className="relative pb-5 xl:px-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-6 -top-5 -z-10 h-28 w-[min(34rem,88%)] rounded-4xl bg-[radial-gradient(70%_100%_at_0%_0%,rgba(199,92,55,0.07),transparent_72%)]"
          />
          <div className="flex items-stretch font-mono text-[10px] uppercase leading-none tracking-[0.16em] text-text-secondary">
            <div className="hero-fade flex shrink-0 items-center gap-2.5 pr-4" style={at(0.06)}>
              <span className="font-serif text-[1.7em] italic leading-none text-accent">
                <span className="sr-only">Entry </span>
                {meta.index}
              </span>
              <span aria-hidden="true" className="hidden text-text-tertiary sm:inline">
                {meta.edition}
              </span>
            </div>
            <div
              className="hero-fade flex min-w-0 flex-1 items-center gap-2 border-l border-border px-4"
              style={at(0.12)}
            >
              <span className="truncate text-text">{meta.name}</span>
              <span aria-hidden="true" className="hidden shrink-0 text-text-tertiary sm:inline">
                {meta.role}
              </span>
            </div>
            <div
              className="hero-fade hidden shrink-0 items-center gap-1.5 border-l border-border px-4 md:flex"
              style={at(0.18)}
            >
              <span>{meta.location}</span>
              <span className="tabular-nums text-text-tertiary">· {meta.coords}</span>
            </div>
            <div
              className="hero-fade flex shrink-0 items-center gap-2 border-l border-border pl-4"
              style={at(0.18)}
            >
              <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-positive animate-pulse-dot" />
              <span className="text-text">{meta.status}</span>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="hero-rule mt-5 h-px origin-left bg-linear-to-r from-accent/60 via-border to-transparent"
            style={at(0.22)}
          />
        </div>

        <div className="grid flex-1 items-center gap-14 pt-6 sm:pt-10 lg:grid-cols-[1fr_minmax(22rem,28rem)] lg:gap-20 lg:pt-0 xl:grid-cols-[1fr_minmax(24rem,30rem)] xl:px-12">
          {/* ── The introduction ───────────────────────────────────────── */}
          <div>
            <h1 className="font-display text-text">
              <span className="hero-line" style={at(0.14)}>
                <span className="text-[clamp(1.625rem,3.2vw,2.75rem)] font-light leading-snug tracking-[-0.01em] text-text-secondary">
                  {headline.intro}{" "}
                  <em className="font-serif text-[1.2em] italic text-accent">{headline.name}</em>,
                </span>
              </span>
              <span className="hero-line mt-2 sm:mt-3" style={at(0.26)}>
                <span className={MASTHEAD}>{headline.lines[0]}</span>
              </span>
              <span className="hero-line" style={at(0.38)}>
                <span className={MASTHEAD}>
                  {headline.lines[1]}
                  <span className="text-accent">.</span>
                </span>
              </span>
            </h1>

            <div className="hero-fade mt-7 max-w-[54ch] sm:mt-9" style={at(0.56)}>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent-text">
                {prologue.focus}
              </p>
              <p className="mt-4 font-display text-[clamp(1.25rem,1.9vw,1.625rem)] font-medium leading-snug tracking-[-0.015em] text-text">
                {prologue.value}
              </p>
              {/* Phones skip the evidence sentence — the proof strip directly
                  below carries the same facts — so the first screen still
                  reaches "View projects". */}
              <p className="mt-3 hidden text-body-lg text-text-secondary sm:block">{prologue.support}</p>
              <ul aria-label="Core technologies" className="mt-5 flex flex-wrap gap-1.5">
                {prologue.stack.map((tech) => (
                  <li key={tech}>
                    <Chip>{tech}</Chip>
                  </li>
                ))}
              </ul>
            </div>

            <div className="hero-fade mt-7 flex flex-wrap items-center gap-3 sm:mt-8" style={at(0.68)}>
              <Button
                href={prologue.cta.work.href}
                size="lg"
                iconRight={<ArrowUpRight className="size-4" />}
              >
                {prologue.cta.work.label}
              </Button>
              <Button
                href={siteConfig.resumeUrl}
                download={siteConfig.resumeFileName}
                variant="ghost"
                size="lg"
                iconRight={<Download className="size-4" />}
              >
                {prologue.cta.resume.label}
              </Button>
              <Link
                href={prologue.cta.talk.href}
                className="inline-flex h-13 items-center px-3 text-sm font-medium text-text underline decoration-text/30 underline-offset-[6px] transition-colors duration-200 hover:text-accent-text hover:decoration-accent/60"
              >
                {prologue.cta.talk.label}
              </Link>
            </div>

            <p
              className="hero-fade mt-7 inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-text-secondary"
              style={at(0.8)}
            >
              <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-positive animate-pulse-dot" />
              {prologue.availability}
            </p>
          </div>

          <HeroPortrait />
        </div>
      </HeroDeparture>

      {/* ── Scroll cue — a thin line drawing downward (CSS, compositor-only) ── */}
      <div
        aria-hidden="true"
        className="hero-fade pointer-events-none absolute inset-x-0 bottom-6 hidden flex-col items-center gap-3 lg:flex"
        style={at(1.2)}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">
          {prologue.scrollCue} · Chapter 01
        </span>
        <span className="scroll-cue-line block h-10 w-px origin-top bg-text/25" />
      </div>
    </section>
  );
}
