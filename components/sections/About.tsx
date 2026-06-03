"use client";

import { motion } from "framer-motion";
import { Sparkles, Smartphone, Gauge, GraduationCap } from "lucide-react";
import { SectionWrapper, SectionHeading } from "@/components/animations/SectionWrapper";
import { FadeUp } from "@/components/animations/FadeUp";
import { siteConfig, education } from "@/lib/data";

const interests = [
  { icon: Sparkles, label: "Streaming AI UIs & agentic copilots" },
  { icon: Smartphone, label: "Cross-platform (web + mobile)" },
  { icon: Gauge, label: "Core Web Vitals obsessed" },
];

export function About() {
  return (
    <SectionWrapper id="about" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <FadeUp>
            <div className="relative">
              {/* Avatar placeholder */}
              <div className="relative mx-auto h-64 w-64 overflow-hidden rounded-2xl border border-white/[0.08] sm:h-80 sm:w-80 lg:mx-0">
                <div className="h-full w-full bg-gradient-to-br from-violet-900/40 via-zinc-900 to-indigo-900/40 flex items-center justify-center">
                  <span className="text-7xl font-bold text-white/20">
                    {siteConfig.fullName[0]}
                  </span>
                </div>
              </div>

              {/* Decorative glow */}
              <div className="pointer-events-none absolute -inset-4 rounded-2xl bg-violet-600/5 blur-2xl" />

              {/* Floating badge */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute -bottom-4 -right-4 rounded-xl border border-white/[0.08] bg-zinc-900 px-4 py-2.5 shadow-xl"
              >
                <p className="text-xs text-zinc-500">Based in</p>
                <p className="text-sm font-semibold text-white">{siteConfig.location}</p>
              </motion.div>
            </div>
          </FadeUp>

          <FadeUp delay={0.15}>
            <SectionHeading label="About Me" title={`Hi, I'm ${siteConfig.name}.`} className="mb-6" />

            <div className="space-y-4 text-zinc-400 leading-relaxed">
              <p>{siteConfig.bio}</p>
              <p>
                I work across React, Next.js, and React Native — rendering Claude and OpenAI
                completions, tool-call traces, and RAG citations inside React Server Components,
                and shipping them all the way to the App Store, Play Store, and the web.
              </p>
              <p>
                I lean on agentic AI workflows — Claude Code, Cursor, Copilot, and v0 — to move
                fast, with human review as the gate. I care about the craft: type-safe contracts,
                fewer re-renders, and Core Web Vitals that hold up in production.
              </p>
            </div>

            {education.map((edu) => (
              <div
                key={edu.id}
                className="mt-8 flex items-start gap-3 rounded-xl border border-white/6 bg-white/2 p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                  <GraduationCap size={18} className="text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {edu.degree} — {edu.institution}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {edu.affiliation} · {edu.location} · {edu.period}
                  </p>
                </div>
              </div>
            ))}

            <div className="mt-8 flex flex-wrap gap-3">
              {interests.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-3.5 py-1.5 text-sm text-zinc-300"
                >
                  <Icon size={13} className="text-violet-400" />
                  {label}
                </span>
              ))}
            </div>

            <div className="mt-8">
              <a
                href={siteConfig.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 hover:bg-violet-500 transition-colors"
              >
                Download Resume
              </a>
            </div>
          </FadeUp>
        </div>
      </div>
    </SectionWrapper>
  );
}
