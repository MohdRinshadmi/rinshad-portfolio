"use client";

import { useEffect } from "react";
import { frame, cancelFrame } from "framer-motion";
import Lenis from "lenis";

/**
 * Smooth scrolling, driven from Framer Motion's frame loop rather than its own
 * `requestAnimationFrame`.
 *
 * Why it matters: every scroll-linked transform on this site (ScrubText,
 * ScrollScale, the Prologue's departure) reads scroll position through
 * `useScroll`, which measures inside Motion's frame loop. When Lenis owns a
 * separate rAF, it writes `scrollTop` at an arbitrary point relative to that
 * measurement, so the scrubbed values trail the actual scroll by up to a frame
 * — the micro-jitter you feel on a trackpad. Running `lenis.raf` inside
 * `frame.update` puts the write and the read in the same tick, every tick.
 *
 * `lerp` (frame-rate independent smoothing) is used instead of `duration` so
 * the feel is identical on 60Hz and 120Hz displays. Touch stays native:
 * `syncTouch` fights iOS momentum and makes phones feel worse, not better.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Native scroll for reduced-motion users — also skips the always-running loop.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      wheelMultiplier: 1,
      // Let the platform own touch momentum.
      syncTouch: false,
      touchMultiplier: 1.6,
      // We drive the loop; Lenis must not start its own.
      autoRaf: false,
    });

    const update = (data: { timestamp: number }) => lenis.raf(data.timestamp);
    // keepAlive = true — a persistent per-frame process, not a one-shot.
    frame.update(update, true);

    return () => {
      cancelFrame(update);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
