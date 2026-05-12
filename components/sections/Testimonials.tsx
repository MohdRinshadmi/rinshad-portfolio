"use client";

import { useEffect, useRef } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { Quote } from "lucide-react";
import { SectionWrapper, SectionHeading } from "@/components/animations/SectionWrapper";
import { testimonials } from "@/lib/data";

function TestimonialCard({ testimonial }: { testimonial: (typeof testimonials)[0] }) {
  return (
    <div className="w-[360px] shrink-0 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm hover:border-violet-500/20 transition-colors">
      <Quote size={20} className="mb-4 text-violet-500/60" />
      <p className="text-sm leading-relaxed text-zinc-300">&ldquo;{testimonial.quote}&rdquo;</p>
      <div className="mt-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-bold text-white">
          {testimonial.name[0]}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{testimonial.name}</p>
          <p className="text-xs text-zinc-500">
            {testimonial.role}, {testimonial.company}
          </p>
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  const doubled = [...testimonials, ...testimonials, ...testimonials];
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();

  useEffect(() => {
    const runScroll = async () => {
      await controls.start({
        x: "-50%",
        transition: {
          duration: 28,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop",
        },
      });
    };
    runScroll();
  }, [controls]);

  return (
    <SectionWrapper id="testimonials" className="py-24 overflow-hidden">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          label="What People Say"
          title="Trusted by teams I've worked with."
          centered
        />
      </div>

      <div className="relative mt-12">
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-[#080808] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-[#080808] to-transparent" />

        <div className="flex overflow-hidden">
          <motion.div
            animate={controls}
            className="flex gap-5 will-change-transform"
            onHoverStart={() => controls.stop()}
            onHoverEnd={() => {
              controls.start({
                x: "-50%",
                transition: {
                  duration: 28,
                  ease: "linear",
                  repeat: Infinity,
                  repeatType: "loop",
                },
              });
            }}
          >
            {doubled.map((t, i) => (
              <TestimonialCard key={`${t.id}-${i}`} testimonial={t} />
            ))}
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
}
