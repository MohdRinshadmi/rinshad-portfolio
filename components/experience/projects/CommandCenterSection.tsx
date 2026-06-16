"use client";

import dynamic from "next/dynamic";
import { InkStage, StageHeading } from "../core/InkStage";
import { useSceneGate } from "../core/useSceneGate";
import { flagshipProjects } from "@/lib/experience/data";
import { ModuleCard } from "./ModuleCard";
import { ProjectDialog } from "./ProjectDialog";

const CommandScene = dynamic(() => import("./CommandScene"), { ssr: false });

/* ============================================================================
   PROJECT COMMAND CENTER — three flagship modules docked on a holographic
   deck. Cards tilt in CSS 3D, expand to a fullscreen dialog, and remain
   plain buttons under the hood — Tab, Enter, Escape all behave.
   ========================================================================== */

export function CommandCenterSection() {
  const [gateRef, mountScene] = useSceneGate();

  return (
    <InkStage id="command-center" label="Flagship projects">
      <div className="relative">
        <div ref={gateRef} className="absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0 bg-product opacity-75" />
          {mountScene && <CommandScene />}
        </div>

        <div className="container-wide relative z-10 py-24 sm:py-28">
          <StageHeading
            eyebrow="04 — COMMAND CENTER"
            title="Flagship modules"
            blurb="Three production systems, docked and ready for inspection. Open a module for challenges, achievements, and the stack inside."
          />

          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {flagshipProjects.map((project, i) => (
              <ModuleCard key={project.slug} project={project} index={i} />
            ))}
          </div>
        </div>
      </div>

      <ProjectDialog />
    </InkStage>
  );
}
