"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { InkStage, StageHeading } from "../core/InkStage";
import { useSceneGate } from "../core/useSceneGate";
import { skillClusters, type SkillBody, type SkillCluster } from "@/lib/experience/data";
import { cn } from "@/lib/utils";

const SkillsScene = dynamic(() => import("./SkillsScene"), { ssr: false });

/* ============================================================================
   SKILLS GALAXY — section shell.
   The galaxy is the spectacle; the legend below is the accessible truth:
   every cluster and skill is server-rendered text, and focusing a cluster
   button highlights its ring in the scene. Hovering a body in the scene
   reports back into the DOM readout.
   ========================================================================== */

export function SkillsSection() {
  const [gateRef, mountScene] = useSceneGate();
  const [focusCluster, setFocusCluster] = useState<string | null>(null);
  const [hovered, setHovered] = useState<{ skill: SkillBody; cluster: SkillCluster } | null>(null);

  return (
    <InkStage id="skills-galaxy" label="Skills">
      <div className="relative">
        <div ref={gateRef} className="absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0 bg-product opacity-70" />
          {mountScene && <SkillsScene focusCluster={focusCluster} onHover={setHovered} />}
        </div>

        <div className="container-wide relative z-10 flex min-h-svh flex-col py-20 sm:py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <StageHeading
              eyebrow="03 — THE GALAXY"
              title="Skills in orbit"
              blurb="Orbital speed scales with proficiency. Hover a body — or focus a cluster below."
            />
            {/* Live readout for the hovered body. */}
            <p
              className="min-h-6 font-mono text-sm text-ink-text-secondary"
              role="status"
              aria-live="polite"
            >
              {hovered
                ? `${hovered.skill.name} — ${hovered.cluster.label} · proficiency ${hovered.skill.proficiency}/100`
                : " "}
            </p>
          </div>

          {/* Spacer the galaxy shines through. */}
          <div className="min-h-[42svh] flex-1" />

          {/* Accessible legend — the real skill inventory. */}
          <div className="grid gap-px overflow-hidden rounded-xl border border-ink-border bg-ink-border sm:grid-cols-2 lg:grid-cols-4">
            {skillClusters.map((cluster) => {
              const active = focusCluster === cluster.id;
              return (
                <button
                  key={cluster.id}
                  type="button"
                  onMouseEnter={() => setFocusCluster(cluster.id)}
                  onMouseLeave={() => setFocusCluster(null)}
                  onFocus={() => setFocusCluster(cluster.id)}
                  onBlur={() => setFocusCluster(null)}
                  onClick={() => setFocusCluster(active ? null : cluster.id)}
                  aria-pressed={active}
                  className={cn(
                    "group bg-ink p-5 text-left backdrop-blur-sm transition-colors duration-300",
                    active ? "bg-ink-raised" : "hover:bg-ink-raised/60",
                  )}
                >
                  <span
                    className={cn(
                      "font-grotesk text-eyebrow font-medium uppercase tracking-[0.14em] transition-colors duration-300",
                      active ? "text-accent" : "text-ink-text-tertiary group-hover:text-accent",
                    )}
                  >
                    {cluster.label}
                  </span>
                  <span className="mt-3 block text-sm leading-relaxed text-ink-text-secondary">
                    {cluster.skills.map((s) => s.name).join(" · ")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </InkStage>
  );
}
