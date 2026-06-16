"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, RotateCcw } from "lucide-react";
import { InkStage, StageHeading } from "../core/InkStage";
import { codeArtifacts, type CodeArtifact } from "@/lib/experience/data";
import { useExperience } from "@/lib/experience/store";
import { EASE } from "@/lib/animation";
import { cn } from "@/lib/utils";

/* ============================================================================
   CODE DIMENSION — real implementations floating in a 3D plane. Each panel
   animates its syntax in line by line, then morphs (a CSS-3D flip) into the
   product it became. Deliberately canvas-free: the code itself is the
   spectacle here, and one fewer WebGL context keeps the page honest.
   ========================================================================== */

function CodePanel({ artifact, index }: { artifact: CodeArtifact; index: number }) {
  const [flipped, setFlipped] = useState(false);
  const reducedMotion = useExperience((s) => s.reducedMotion);
  const lines = artifact.code.split("\n");

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 40, rotateX: 8 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay: (index % 2) * 0.12, ease: EASE.out }}
      style={{ transformPerspective: 1200 }}
      className="relative min-h-[26rem] [transform-style:preserve-3d]"
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.7, ease: EASE.inOut }}
        className="relative h-full w-full [transform-style:preserve-3d]"
      >
        {/* FRONT — the implementation. */}
        <div
          aria-hidden={flipped}
          className="absolute inset-0 flex flex-col overflow-hidden rounded-xl border border-ink-border bg-ink-raised/80 ring-hairline-ink [backface-visibility:hidden]"
        >
          <header className="flex items-center justify-between border-b border-ink-border px-5 py-3.5">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-text-tertiary">
              <span className="text-accent">{">"}</span> {artifact.theme}
            </p>
            <span className="flex gap-1.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-ink-border" />
              <span className="h-2.5 w-2.5 rounded-full bg-ink-border" />
              <span className="h-2.5 w-2.5 rounded-full bg-accent/60" />
            </span>
          </header>
          <h3 className="px-5 pt-4 font-display text-base font-semibold text-ink-text">
            {artifact.title}
          </h3>
          <pre className="flex-1 overflow-x-auto px-5 pb-4 pt-3 text-[12.5px] leading-relaxed text-ink-text-secondary">
            <code>
              {lines.map((line, i) => (
                <motion.span
                  key={i}
                  initial={reducedMotion ? false : { opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.3 + i * 0.04, ease: EASE.out }}
                  className={cn(
                    "block min-h-[1.4em] whitespace-pre",
                    line.trimStart().startsWith("//") && "text-ink-text-tertiary italic",
                  )}
                >
                  {line || " "}
                </motion.span>
              ))}
            </code>
          </pre>
          <button
            type="button"
            onClick={() => setFlipped(true)}
            className="group flex items-center justify-between border-t border-ink-border px-5 py-3.5 text-sm font-medium text-accent transition-colors hover:bg-ink-raised"
          >
            See what it became
            <ArrowRight
              size={15}
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </button>
        </div>

        {/* BACK — the product it morphed into. */}
        <div
          aria-hidden={!flipped}
          className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-xl border border-accent/25 bg-product p-6 ring-hairline-ink [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-7"
        >
          <div>
            <p className="font-grotesk text-eyebrow font-medium uppercase tracking-[0.14em] text-accent">
              Shipped as
            </p>
            <p className="mt-4 font-display text-h3 font-semibold leading-snug text-ink-text">
              {artifact.morphsInto}
            </p>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-text-secondary">
              {artifact.takeaway}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFlipped(false)}
            tabIndex={flipped ? 0 : -1}
            className="group inline-flex items-center gap-2 self-start rounded-full border border-ink-border px-5 py-2.5 text-sm font-medium text-ink-text transition-colors hover:border-ink-text/30"
          >
            <RotateCcw
              size={14}
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:-rotate-90"
            />
            Back to the code
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function CodeDimensionSection() {
  return (
    <InkStage id="code-dimension" label="Code patterns">
      <div className="relative">
        <div className="absolute inset-0 bg-grid-ink opacity-30" aria-hidden="true" />
        <div className="container-wide relative z-10 py-24 sm:py-28">
          <StageHeading
            eyebrow="06 — THE CODE DIMENSION"
            title="Implementations, floating"
            blurb="Four patterns that carry the products above — flip each one to see what it became."
          />
          <div className="mt-14 grid gap-5 lg:grid-cols-2">
            {codeArtifacts.map((artifact, i) => (
              <CodePanel key={artifact.id} artifact={artifact} index={i} />
            ))}
          </div>
        </div>
      </div>
    </InkStage>
  );
}
