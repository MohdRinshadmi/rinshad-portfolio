"use client";

import type Lenis from "lenis";

/* ============================================================================
   SCROLL CONTROLLER — the one place that owns "take me to the top".

   `SmoothScroll` registers its Lenis instance here on mount, which lets any
   component ask for a scroll without threading a ref (or a context provider)
   through the tree. When Lenis is absent — reduced-motion users never get one —
   every call degrades to the platform's own smooth scroll.

   It also carries the tiny pub/sub that lets a nav click replay a page's
   entrance choreography (see `PageTransition`).
   ========================================================================== */

let lenis: Lenis | null = null;

/** Called by `SmoothScroll`; pass `null` on teardown. */
export function registerLenis(instance: Lenis | null): void {
  lenis = instance;
}

/** expo-out, matching `EASE.out` — the site's reveal curve, as a JS easing. */
const expoOut = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/** How long a click-to-top glide takes, in seconds. */
const TOP_DURATION = 1.05;

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Glide the window back to the top, then run `onArrive`.
 *
 * `onArrive` is guarded by a `done` latch and backed by a timeout: Lenis fires
 * `onComplete` reliably, but the native fallback has no completion event, and a
 * scroll the user interrupts must not leave the callback stranded.
 */
export function scrollToTop(onArrive?: () => void): void {
  if (typeof window === "undefined") return;

  let done = false;
  const arrive = () => {
    if (done) return;
    done = true;
    onArrive?.();
  };

  // Already there — nothing to animate, just hand back control.
  if (window.scrollY <= 1) {
    arrive();
    return;
  }

  if (lenis) {
    lenis.scrollTo(0, {
      duration: TOP_DURATION,
      easing: expoOut,
      force: true,
      onComplete: arrive,
    });
  } else {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }

  window.setTimeout(arrive, TOP_DURATION * 1000);
}

/* ----------------------------------------------------------------------------
   Entrance replay — "refresh" a route that is already on screen.
   -------------------------------------------------------------------------- */
type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeEntranceReplay(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Remounts the current page subtree so every entrance animation runs again. */
export function replayEntrance(): void {
  for (const listener of listeners) listener();
}
