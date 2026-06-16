"use client";

import { useEffect } from "react";
import { useExperience } from "@/lib/experience/store";
import { detectCapabilities } from "@/lib/experience/capabilities";

/* ============================================================================
   CapabilityProbe — mounted once on the immersive page. Grades the device
   into a quality tier before any scene asks for it, and re-grades if the
   visitor toggles their reduced-motion preference mid-session.
   ========================================================================== */

export function CapabilityProbe() {
  const setCapabilities = useExperience((s) => s.setCapabilities);

  useEffect(() => {
    setCapabilities(detectCapabilities());

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setCapabilities(detectCapabilities());
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [setCapabilities]);

  return null;
}
