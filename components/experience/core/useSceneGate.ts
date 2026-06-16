"use client";

import { useInView } from "react-intersection-observer";
import { useExperience } from "@/lib/experience/store";

/* ============================================================================
   useSceneGate — decides when a section may download + mount its 3D chunk.

   `mount` flips true once the section is within ~1.5 viewports AND the device
   graded into a WebGL-capable tier. Sections render their dynamic() scene
   behind this flag, so the three.js bundle never ships to visitors who bounce
   from the hero, scroll past, or can't run WebGL at all.
   ========================================================================== */

export function useSceneGate() {
  const tier = useExperience((s) => s.tier);
  const { ref, inView } = useInView({ rootMargin: "75% 0px", triggerOnce: true });

  const mount = inView && tier !== null && tier !== "none";
  // Tuple, destructured at the call site: [canvas host ref, may-mount flag].
  return [ref, mount] as const;
}
