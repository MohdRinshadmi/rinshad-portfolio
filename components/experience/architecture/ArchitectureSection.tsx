"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Minus, Plus } from "lucide-react";
import { InkStage, StageHeading } from "../core/InkStage";
import { useSceneGate } from "../core/useSceneGate";
import { flagshipProjects } from "@/lib/experience/data";
import { cn } from "@/lib/utils";

const ArchitectureScene = dynamic(() => import("./ArchitectureScene"), { ssr: false });

/* ============================================================================
   ARCHITECTURE SIMULATOR — section shell. Pick a system; watch real request
   paths flow between its services. Drag to pan, buttons to zoom (keyboard-
   friendly), and the legend below spells out every node in plain text.
   ========================================================================== */

const ZOOM_MIN = 0.7;
const ZOOM_MAX = 2.2;

export function ArchitectureSection() {
  const [gateRef, mountScene] = useSceneGate();
  const [activeSlug, setActiveSlug] = useState(flagshipProjects[0].slug);
  const [zoom, setZoom] = useState(1);
  const project = flagshipProjects.find((p) => p.slug === activeSlug) ?? flagshipProjects[0];

  return (
    <InkStage id="architecture-sim" label="System architectures">
      <div className="container-wide relative z-10 py-24 sm:py-28">
        <StageHeading
          eyebrow="05 — LIVE SYSTEMS"
          title="The architecture, running"
          blurb="Not a static diagram — packets flow at each edge's real traffic shape. Drag to pan, zoom with the controls."
        />

        {/* System picker. */}
        <div
          role="group"
          aria-label="Choose a system to simulate"
          className="mt-10 inline-flex flex-wrap gap-1 rounded-full border border-ink-border bg-ink-raised/60 p-1"
        >
          {flagshipProjects.map((p) => (
            <button
              key={p.slug}
              type="button"
              onClick={() => setActiveSlug(p.slug)}
              aria-pressed={p.slug === activeSlug}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-medium transition-colors duration-200",
                p.slug === activeSlug
                  ? "bg-accent text-accent-fg"
                  : "text-ink-text-secondary hover:text-ink-text",
              )}
            >
              {p.title}
            </button>
          ))}
        </div>

        {/* Simulation viewport. */}
        <div className="relative mt-6 h-[58svh] min-h-[380px] overflow-hidden rounded-xl border border-ink-border bg-product ring-hairline-ink">
          <div ref={gateRef} className="absolute inset-0">
            <div className="absolute inset-0 bg-grid-ink opacity-50" aria-hidden="true" />
            {mountScene && <ArchitectureScene project={project} zoom={zoom} />}
          </div>

          {/* Zoom controls — DOM buttons so keyboard users can explore too. */}
          <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(ZOOM_MAX, +(z + 0.3).toFixed(2)))}
              aria-label="Zoom in"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-ink-border bg-ink/80 text-ink-text-secondary backdrop-blur-sm transition-colors hover:text-ink-text"
            >
              <Plus size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(ZOOM_MIN, +(z - 0.3).toFixed(2)))}
              aria-label="Zoom out"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-ink-border bg-ink/80 text-ink-text-secondary backdrop-blur-sm transition-colors hover:text-ink-text"
            >
              <Minus size={16} aria-hidden="true" />
            </button>
          </div>

          <p className="pointer-events-none absolute left-4 top-4 z-10 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-text-tertiary">
            sim://{project.slug} · drag to pan
          </p>
        </div>

        {/* Plain-text legend — the accessible map of the system. */}
        <dl className="mt-6 grid gap-px overflow-hidden rounded-xl border border-ink-border bg-ink-border sm:grid-cols-3 lg:grid-cols-6">
          {project.architecture.nodes.map((node) => (
            <div key={node.id} className="bg-ink px-4 py-3.5">
              <dt className="font-mono text-xs font-medium uppercase tracking-wider text-ink-text">
                {node.label}
              </dt>
              <dd className="mt-1 text-xs text-ink-text-tertiary">{node.sub}</dd>
            </div>
          ))}
        </dl>
      </div>
    </InkStage>
  );
}
