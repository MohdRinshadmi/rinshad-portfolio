"use client";

import { useRef } from "react";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useHydrated } from "@/lib/use-hydrated";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { TokenStream } from "@/components/ui/TokenStream";
import { Typewriter } from "@/components/ui/Typewriter";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { HeroSlideshow } from "@/components/sections/HeroSlideshow";
import { GithubIcon, LinkedinIcon } from "@/components/ui/SocialIcons";
import { hero, siteConfig } from "@/lib/data";
import { DURATION, EASE } from "@/lib/animation";

/**
 * Hero — editorial 7/5 split on a warm paper canvas. A streaming H1 (TokenStream)
 * with a muted two-tone tail demonstrates the AI-native positioning, two pill CTAs,
 * inline socials, and a dark "ink" spec card on the right (the Formix light-page /
 * dark-panel contrast). Stacks on mobile with the spec card below the CTAs.
 */
export function Hero() {
  const reduceMotion = useReducedMotion();
  const hydrated = useHydrated();
  const sectionRef = useRef<HTMLElement>(null);

  // Apple-style departure: as the hero scrolls out, its content drifts down
  // slightly slower than the page and softens — the next section feels like
  // it slides over a receding stage. Scrubbed by scroll, transform/opacity only.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const departY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const departOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.35]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative overflow-hidden pt-16 pb-16 sm:pb-20"
    >
      {/* Layered background motifs — non-interactive, behind content */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-aurora" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-grain opacity-50" />

      <motion.div
        className="container-wide"
        style={hydrated && !reduceMotion ? { y: departY, opacity: departOpacity } : undefined}
      >
        {/* Side rails only — the bottom is left open so the page-wide GuideRails read
            as one continuous frame. At xl+ the global rails take over the sides. */}
        <div className="grid grid-cols-1 border-x border-dashed border-border-strong xl:border-x-0 lg:grid-cols-[3fr_2fr]">
          {/* ── Content cell (left) ────────────────────────────────────── */}
          <div className="px-6 pt-9 pb-12 sm:px-8 lg:border-r lg:border-dashed lg:border-border-strong lg:pl-14 lg:pr-12 lg:pt-12 lg:pb-16">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: DURATION.base, ease: EASE.out }}
            >
              <Eyebrow pill>{hero.eyebrow}</Eyebrow>
            </motion.div>

            {/* ── Name + role — oversized editorial two-tone. The name streams in
                  at display scale in the ember accent; the role drops to a quieter
                  secondary line beneath it. ──────────────────────────────────────── */}
            <h1 className="mt-7 font-display font-bold tracking-[-0.045em] text-text">
              <TokenStream
                as="span"
                text={`I'm ${siteConfig.name}`}
                accent={siteConfig.name}
                accentClassName="text-accent"
                className="block text-display-2xl leading-[0.9]"
              />
              <span className="mt-3 block text-display-lg font-semibold tracking-[-0.025em] text-text-secondary">
                {hero.headline}
              </span>
            </h1>

            {/* ── Summary — labeled, hairline-ruled editorial block ────────────── */}
            <div className="mt-8 max-w-[56ch] border-t border-dashed border-border pt-6">
              <span className="font-mono text-eyebrow uppercase text-text-tertiary">
                {"Summary"}
              </span>
              <Typewriter
                text={hero.subheadline}
                startDelay={650}
                speed={22}
                className="mt-3 text-body-lg text-text-secondary"
              />
            </div>

            {/* ── CTAs ──────────────────────────────────────────────── */}
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: DURATION.reveal, ease: EASE.out, delay: 0.45 }}
              className="mt-10 flex flex-wrap items-center gap-3"
            >
              <MagneticButton>
                <Button
                  href={hero.primaryCta.href}
                  variant="primary"
                  size="lg"
                  iconRight={<ArrowUpRight className="size-4" />}
                >
                  {hero.primaryCta.label}
                </Button>
              </MagneticButton>

              <Button
                href={hero.secondaryCta.href}
                variant="ghost"
                size="lg"
                iconRight={<ArrowUpRight className="size-4" />}
              >
                {hero.secondaryCta.label}
              </Button>

              {/* Tertiary inline social links */}
              <div className="ml-1 flex items-center gap-1">
                <a
                  href={siteConfig.social.github}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub profile"
                  className="inline-flex size-11 items-center justify-center rounded-full text-text-tertiary transition-colors duration-200 ease-out hover:text-text"
                >
                  <GithubIcon className="size-5" />
                </a>
                <a
                  href={siteConfig.social.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn profile"
                  className="inline-flex size-11 items-center justify-center rounded-full text-text-tertiary transition-colors duration-200 ease-out hover:text-text"
                >
                  <LinkedinIcon className="size-5" />
                </a>
              </div>
            </motion.div>
          </div>

          {/* ── Slideshow cell (right; below content on mobile) ───────── */}
          <div className="border-t border-dashed border-border-strong px-6 pt-9 pb-12 sm:px-8 lg:border-t-0 lg:pl-12 lg:pr-10 lg:pt-12 lg:pb-16">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: DURATION.reveal, ease: EASE.out, delay: 0.55 }}
            >
              <HeroSlideshow />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ── Scroll cue ─────────────────────────────────────────────── */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={reduceMotion ? undefined : { opacity: 1 }}
        transition={{ duration: DURATION.base, ease: EASE.out, delay: 0.9 }}
      >
        <motion.span
          className="inline-flex"
          animate={reduceMotion ? undefined : { y: [0, 6, 0] }}
          transition={
            reduceMotion ? undefined : { duration: 1.8, ease: EASE.inOut, repeat: Infinity }
          }
        >
          <ChevronDown className="size-5 text-text-tertiary" />
        </motion.span>
      </motion.div>
    </section>
  );
}
