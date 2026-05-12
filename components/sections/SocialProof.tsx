"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { SectionWrapper } from "@/components/animations/SectionWrapper";
import { StaggerChildren } from "@/components/animations/FadeUp";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animation";
import { stats } from "@/lib/data";

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;

    let start = 0;
    const duration = 1800;
    const step = 16;
    const increment = target / (duration / step);

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, step);

    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export function SocialProof() {
  return (
    <SectionWrapper id="stats" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-sm sm:p-12">
          {/* Glow */}
          <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-violet-600/10 via-transparent to-indigo-600/10" />

          <StaggerChildren className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                className="flex flex-col items-center text-center"
              >
                <div className="text-4xl font-bold tabular-nums text-white sm:text-5xl">
                  <CountUp target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="mt-2 text-sm text-zinc-500">{stat.label}</div>
              </motion.div>
            ))}
          </StaggerChildren>
        </div>
      </div>
    </SectionWrapper>
  );
}
