"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { frame, cancelFrame } from "framer-motion";
import Lenis from "lenis";
import { registerLenis } from "@/lib/scroll-controller";

/* This component is server-rendered but only ever *acts* on the client; the
   layout effect is what keeps the post-navigation scroll reset off-screen. */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

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
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();
  // Distinguishes a forward navigation (pin to the top) from back/forward
  // (restore what the reader was looking at). `popstate` fires with the URL
  // already updated and before React commits the new route, so the path it
  // records is always there to compare against by the time we read it.
  const poppedPathRef = useRef<string | null>(null);
  const firstRenderRef = useRef(true);

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
    lenisRef.current = lenis;
    registerLenis(lenis);

    const update = (data: { timestamp: number }) => lenis.raf(data.timestamp);
    // keepAlive = true — a persistent per-frame process, not a one-shot.
    frame.update(update, true);

    return () => {
      cancelFrame(update);
      lenis.destroy();
      lenisRef.current = null;
      registerLenis(null);
    };
  }, []);

  useEffect(() => {
    // Stored as the path rather than a flag: a hash-only pop changes the URL
    // without changing the route, so nothing would consume a bare flag and the
    // next forward navigation would inherit it.
    const onPopState = () => {
      poppedPathRef.current = window.location.pathname;
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  /**
   * Land every navigation where the reader expects, then hand the position to
   * Lenis.
   *
   * TOP-PINNING. Next's default is to *keep* the scroll position whenever the
   * new Page element is still inside the viewport — which, on pages this long,
   * is most of the time. Click a header tab from the bottom of one page and you
   * arrive at the bottom of the next. A tab has to mean "start here", so a
   * forward navigation is pinned to 0. Back/forward is left alone (that is the
   * one case where the old offset is the right answer), and so is a URL that
   * carries a hash, since the fragment is the reader's explicit target.
   *
   * Running this in a LAYOUT effect matters: it writes the scroll position in
   * the same commit that swaps the markup, so the wrong offset never paints.
   *
   * LENIS SYNC. Lenis only picks up an external scroll through its native
   * listener, and that listener is gated on `isScrolling` being `false` or
   * `"native"`. Click a nav link while a smooth scroll is still settling — i.e.
   * scroll, then immediately click, which is the normal way people browse — and
   * `isScrolling` is `"smooth"`, the sync is skipped, and Lenis keeps animating
   * toward the OLD target. Re-anchoring to the real scroll position makes it
   * deterministic instead of a race.
   */
  useIsomorphicLayoutEffect(() => {
    // The first paint of a session is the browser's to place (it may be
    // restoring a reload); only route *changes* are ours.
    const isNavigation = !firstRenderRef.current;
    firstRenderRef.current = false;

    const restoring = poppedPathRef.current === pathname;
    poppedPathRef.current = null;

    const pinToTop =
      isNavigation && !restoring && window.location.hash.length <= 1;

    if (pinToTop) window.scrollTo(0, 0);

    // The router writes scroll during its own commit, which may land after this
    // effect, so re-assert once a frame later and read the settled value.
    const id = requestAnimationFrame(() => {
      if (pinToTop && window.scrollY !== 0) window.scrollTo(0, 0);

      const lenis = lenisRef.current;
      if (!lenis) return;
      // The new route is a different height; recompute the scroll limit before
      // anchoring so Lenis doesn't clamp against the previous page's bounds.
      lenis.resize();
      lenis.scrollTo(window.scrollY, { immediate: true, force: true });
    });

    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return <>{children}</>;
}
