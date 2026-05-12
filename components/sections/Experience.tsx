"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MapPin, Calendar, ArrowRight } from "lucide-react";
import { SectionWrapper, SectionHeading } from "@/components/animations/SectionWrapper";
import { fadeUp, staggerContainer } from "@/lib/animation";
import { experience } from "@/lib/data";
import { cn } from "@/lib/utils";

function TimelineItem({
  item,
  index,
}: {
  item: (typeof experience)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ delay: index * 0.12 }}
      className="relative flex gap-6"
    >
      {/* Timeline connector */}
      <div className="relative flex flex-col items-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : { scale: 0 }}
          transition={{ delay: index * 0.12 + 0.2, type: "spring", stiffness: 300 }}
          className={cn(
            "mt-1 h-3 w-3 shrink-0 rounded-full border-2",
            item.current
              ? "border-violet-400 bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.5)]"
              : "border-zinc-600 bg-zinc-800"
          )}
        />
        {/* Growing line */}
        <motion.div
          initial={{ height: 0 }}
          animate={inView ? { height: "100%" } : { height: 0 }}
          transition={{ delay: index * 0.12 + 0.3, duration: 0.5, ease: [0, 0, 0.2, 1] }}
          className="mt-2 w-px bg-gradient-to-b from-zinc-700 to-transparent"
          style={{ minHeight: 40 }}
        />
      </div>

      <div className="pb-10">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-white">{item.role}</h3>
            <p className="text-sm font-semibold text-violet-400">{item.company}</p>
          </div>
          {item.current && (
            <span className="rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400">
              Current
            </span>
          )}
        </div>

        <div className="mt-1 flex flex-wrap gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {item.period}
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={11} />
            {item.location}
          </span>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-zinc-400">{item.description}</p>

        <ul className="mt-3 space-y-1.5">
          {item.achievements.map((a) => (
            <li key={a} className="flex items-start gap-2 text-sm text-zinc-400">
              <ArrowRight size={12} className="mt-0.5 shrink-0 text-violet-400" />
              {a}
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-wrap gap-2">
          {item.technologies.map((t) => (
            <span
              key={t}
              className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-xs text-zinc-400"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function Experience() {
  return (
    <SectionWrapper id="experience" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          label="Career"
          title="Where I've worked."
          description="A track record of shipping real products at scale."
        />
        <div className="ml-1.5 mt-12">
          {experience.map((item, i) => (
            <TimelineItem key={item.id} item={item} index={i} />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
