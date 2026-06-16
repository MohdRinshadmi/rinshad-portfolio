"use client";

import { Suspense, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";
import { useExperience } from "@/lib/experience/store";

/* ============================================================================
   SceneCanvas — the one way a 3D scene enters the page.

   Performance contract (every scene gets this for free):
   - Sections lazy-load the chunk containing this via useSceneGate, so three.js
     never downloads for visitors who don't approach the section (or have no
     WebGL). Once mounted, the context is kept — re-creating GL contexts on
     scroll costs more than letting one idle.
   - The frameloop drops to `demand` whenever the section is off-screen:
     zero GPU work for scenes you can't see.
   - DPR and antialiasing come from the device tier, decided once.
   - The canvas fades in over the section's static fallback and stays
     aria-hidden: 3D is presentation; meaning lives in the DOM.
   ========================================================================== */

interface SceneCanvasProps {
  children: ReactNode;
  className?: string;
  camera?: { position?: [number, number, number]; fov?: number };
  /** Keep animating while visible even under reduced motion (default false —
      reduced-motion visitors get a single static frame). */
  ignoreReducedMotion?: boolean;
}

export function SceneCanvas({
  children,
  className,
  camera,
  ignoreReducedMotion = false,
}: SceneCanvasProps) {
  const tier = useExperience((s) => s.tier);
  const dpr = useExperience((s) => s.dpr);
  const reducedMotion = useExperience((s) => s.reducedMotion);

  const { ref, inView: visible } = useInView({ rootMargin: "10% 0px" });
  const [ready, setReady] = useState(false);

  if (tier === null || tier === "none") return null;

  const animate = visible && (ignoreReducedMotion || !reducedMotion);

  return (
    <div ref={ref} className={cn("absolute inset-0", className)} aria-hidden="true">
      <Canvas
        camera={{ position: camera?.position ?? [0, 0, 10], fov: camera?.fov ?? 50 }}
        dpr={dpr}
        frameloop={animate ? "always" : "demand"}
        gl={{
          antialias: tier === "high",
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
        }}
        onCreated={() => setReady(true)}
        className={cn(
          "transition-opacity! duration-1000 ease-out",
          ready ? "opacity-100" : "opacity-0",
        )}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  );
}
