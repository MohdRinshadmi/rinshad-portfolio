/* ============================================================================
   DEVICE CAPABILITY DETECTION
   Runs once on the client and grades the device into a quality tier. Every
   scene reads the tier instead of probing the device itself, so the whole
   experience degrades in lockstep:

     high   — desktop-class GPU: full particle counts, postprocessing, AA
     medium — laptops / recent phones: reduced counts, no postprocessing
     low    — old phones, low memory, software GL: minimal counts, dpr 1
     none   — WebGL unavailable or blocked: render static DOM fallbacks only
   ========================================================================== */

export type QualityTier = "high" | "medium" | "low" | "none";

export interface Capabilities {
  tier: QualityTier;
  reducedMotion: boolean;
  /** clamp for <Canvas dpr> — retina only when the GPU can afford it */
  dpr: [number, number];
}

/** Navigator fields that exist in Chromium but not in the TS lib types. */
interface NavigatorExtras {
  deviceMemory?: number;
  hardwareConcurrency?: number;
}

function probeWebGL(): { ok: boolean; renderer: string } {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      (canvas.getContext("webgl") as WebGLRenderingContext | null);
    if (!gl) return { ok: false, renderer: "" };
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = info
      ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL))
      : "";
    // Free the probe context immediately — contexts are a scarce resource.
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return { ok: true, renderer };
  } catch {
    return { ok: false, renderer: "" };
  }
}

export function detectCapabilities(): Capabilities {
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const { ok, renderer } = probeWebGL();
  if (!ok) return { tier: "none", reducedMotion, dpr: [1, 1] };

  // Software rasterizers technically "work" but melt at fragment-heavy scenes.
  if (/swiftshader|llvmpipe|software/i.test(renderer)) {
    return { tier: "low", reducedMotion, dpr: [1, 1] };
  }

  const nav = navigator as Navigator & NavigatorExtras;
  const memory = nav.deviceMemory ?? 8; // Safari/Firefox: assume mid-range
  const cores = nav.hardwareConcurrency ?? 4;
  const mobile = /android|iphone|ipad|mobile/i.test(navigator.userAgent);

  if (memory <= 2 || cores <= 2) return { tier: "low", reducedMotion, dpr: [1, 1] };
  if (mobile || memory <= 4 || cores <= 4) {
    return { tier: "medium", reducedMotion, dpr: [1, 1.5] };
  }
  return { tier: "high", reducedMotion, dpr: [1, 2] };
}

/** Scale a particle/instance count by tier — single knob for scene density. */
export function countForTier(tier: QualityTier, high: number): number {
  switch (tier) {
    case "high":
      return high;
    case "medium":
      return Math.round(high * 0.55);
    case "low":
      return Math.round(high * 0.25);
    default:
      return 0;
  }
}
