"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { MapPin, Coffee, BookOpen } from "lucide-react";
import { SectionWrapper, SectionHeading } from "@/components/animations/SectionWrapper";
import { FadeUp } from "@/components/animations/FadeUp";
import { siteConfig } from "@/lib/data";

const interests = [
  { icon: Coffee, label: "Coffee + code mornings" },
  { icon: BookOpen, label: "Technical writing" },
  { icon: MapPin, label: "Building in public" },
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
                I care deeply about the craft — not just making things work, but making them
                maintainable, fast, and delightful for the humans who use them. I believe the best
                code is the code that doesn&apos;t need to be explained.
              </p>
              <p>
                Outside of engineering, I write about system design, contribute to open source, and
                occasionally mentor junior developers who want to bridge the gap between &ldquo;it
                works on my machine&rdquo; and shipping production software.
              </p>
            </div>

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
