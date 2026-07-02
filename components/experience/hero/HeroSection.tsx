"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { InkStage } from "../core/InkStage";
import { useSceneGate } from "../core/useSceneGate";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { journeyHero } from "@/lib/experience/data";
import { siteConfig } from "@/lib/config/site";
import { EASE, lineMask, staggerContainer } from "@/lib/animation";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

/* ============================================================================
   HERO STAGE — "Digital Universe"
   The copy is real, server-rendered DOM (name + title carry the SEO weight);
   the universe streams in behind it once the device proves capable. The
   static .bg-product field doubles as loading state and no-WebGL fallback.
   ========================================================================== */

/** Overflow-hidden wrapper so lineMask children rise into view. */
function MaskedLine({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`block overflow-hidden ${className ?? ""}`}>
      <motion.span variants={lineMask} className="block">
        {children}
      </motion.span>
    </span>
  );
}

export function HeroSection() {
  const [gateRef, mountScene] = useSceneGate();

  return (
    <InkStage id="digital-universe" label="Introduction">
      <div className="relative flex min-h-[calc(100svh-1.5rem)] flex-col justify-end">
        {/* Scene layer — static product field beneath, universe fades in over it. */}
        <div ref={gateRef} className="absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0 bg-product" />
          <div className="absolute inset-0 bg-grid-ink opacity-40" />
          {mountScene && <HeroScene />}
          {/* Bottom scrim so copy stays AAA-readable over any particle drift. */}
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink via-ink/55 to-transparent" />
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="container-wide relative z-10 pb-16 pt-32 sm:pb-20"
        >
          <MaskedLine>
            <p className="font-grotesk text-eyebrow font-medium uppercase tracking-[0.14em] text-accent">
              {journeyHero.eyebrow}
            </p>
          </MaskedLine>

          <h1 className="mt-6">
            <MaskedLine>
              <span className="font-display text-display-2xl font-semibold tracking-tight text-ink-text">
                {journeyHero.name}
                <span className="text-accent">.</span>
              </span>
            </MaskedLine>
            <MaskedLine className="mt-3">
              <span className="font-display text-display-lg font-medium tracking-tight text-ink-text-secondary">
                {journeyHero.role}{" "}
                <span className="text-ink-text-tertiary">{journeyHero.roleTail}</span>
              </span>
            </MaskedLine>
          </h1>

          <MaskedLine className="mt-6">
            <p className="max-w-2xl text-body-lg text-ink-text-secondary">
              {journeyHero.subline}
            </p>
          </MaskedLine>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 18 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.65, ease: EASE.out, delay: 0.5 },
              },
            }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <MagneticButton>
              <a
                href={journeyHero.primaryCta.href}
                className="group inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-accent-fg shadow-glow transition-colors duration-200 hover:bg-accent-hover"
              >
                {journeyHero.primaryCta.label}
                <ArrowDown
                  size={15}
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:translate-y-0.5"
                />
              </a>
            </MagneticButton>
            <MagneticButton>
              <a
                href={journeyHero.secondaryCta.href}
                className="inline-flex items-center gap-2 rounded-full border border-ink-border px-7 py-3.5 text-sm font-medium text-ink-text transition-colors duration-200 hover:border-ink-text/30 hover:bg-ink-raised"
              >
                {journeyHero.secondaryCta.label}
              </a>
            </MagneticButton>
            <Link
              href="/work"
              className="group inline-flex items-center gap-1 px-2 py-3 text-sm font-medium text-ink-text-tertiary transition-colors hover:text-ink-text"
            >
              Classic case studies
              <ArrowUpRight
                size={14}
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </motion.div>

          {/* Spec line — grounded facts under the cinematics. */}
          <motion.p
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { duration: 0.8, ease: EASE.out, delay: 0.9 } },
            }}
            className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-wider text-ink-text-tertiary"
          >
            <span>{siteConfig.locationShort}</span>
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-positive" aria-hidden="true" />
              {siteConfig.availability}
            </span>
            <span aria-hidden="true" className="hidden sm:inline">
              SCROLL TO BEGIN ↓
            </span>
          </motion.p>
        </motion.div>
      </div>
    </InkStage>
  );
}
