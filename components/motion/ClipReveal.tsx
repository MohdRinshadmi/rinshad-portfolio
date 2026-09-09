"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { DURATION, EASE } from "@/lib/animation";
import { cn } from "@/lib/utils";

/* ============================================================================
   CLIP REVEAL — an image uncovered rather than faded in.

   The outer element wipes open (`clip-path: inset(…)`), while the child drifts
   back from a slight overscale. The counter-motion is the whole trick: a wipe
   on its own reads as a transition effect, but a wipe over a settling image
   reads as a camera finding its frame.

   WHY IT COSTS NOTHING EXTRA HERE. `clip-path` is not a compositor-only
   property the way transform and opacity are — it repaints the revealed
   region. That is affordable because this runs ONCE per element, on enter, on
   a single large image, rather than on every frame of a scroll. Do not reach
   for this in a scrub.

   ── IT MUST FAIL OPEN ────────────────────────────────────────────────────
   Every other reveal on this site risks, at worst, a missing fade. This one
   hides a photograph completely until its trigger fires, so a trigger that
   never fires is not a missing animation — it is a blank frame where the
   portrait should be. That is exactly what happened: driven by Framer's
   viewport helpers (`whileInView`, then `useInView`, both with the site's
   shared `-64px` margin), the About portrait stayed shut *permanently* at
   viewports below ~640px while the very same helpers fired correctly on its
   own parent element and at every wider width. Verified in a headless Chrome
   at 390 / 700 / 1100 / 1440px against a production build.

   So this owns its observer instead, and takes the safe side of every
   uncertainty:

     · a bare IntersectionObserver, no root margin — the margin bought a 64px
       head start and cost the reveal its reliability;
     · a `requestAnimationFrame` re-check on mount, because an observer that
       is constructed while layout is still settling can miss the element it
       was created for;
     · no IntersectionObserver at all (or a throw) reveals immediately.

   The result degrades to "the picture is simply there", never to "the picture
   is gone".
   ========================================================================== */

interface ClipRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** Which edge the wipe travels from. */
  from?: "left" | "right" | "bottom";
  /** Overscale the child settles back out of. */
  scale?: number;
}

/* Percentages on every side, in both states. Framer interpolates clip-path
   component-wise, so a `0` on one end and a `0%` on the other is a shape it
   has to guess at — keep the two forms identical. */
const CLOSED = {
  left: "inset(0% 100% 0% 0%)",
  right: "inset(0% 0% 0% 100%)",
  bottom: "inset(100% 0% 0% 0%)",
} as const;

const OPEN = "inset(0% 0% 0% 0%)";

export function ClipReveal({
  children,
  className,
  delay = 0,
  from = "left",
  scale = 1.05,
}: ClipRevealProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /* Reduced motion opens on the next frame with a zero-length transition —
       it must NOT open by rendering a different tree. `useReducedMotion` is
       false on the server and true on a reduced-motion client's first render,
       so branching the markup on it makes the SSR HTML and the first client
       render disagree. Framer serialises `initial` into inline styles during
       SSR, so that disagreement is a real attribute mismatch: it threw React
       #418 on /about until this was flattened to one tree. (`Reveal` gets away
       with a two-branch shape only because `whileInView` renders at rest on
       the server and emits no style to mismatch against.) */
    if (reduceMotion) {
      const raf = requestAnimationFrame(() => setRevealed(true));
      return () => cancelAnimationFrame(raf);
    }

    let observer: IntersectionObserver | undefined;
    const open = () => {
      setRevealed(true);
      observer?.disconnect();
    };

    /* `watching` stays false if the observer could not be built at all, which
       turns the frame check below into an unconditional reveal. */
    let watching = false;
    if (typeof IntersectionObserver !== "undefined") {
      try {
        observer = new IntersectionObserver(
          (entries) => {
            if (entries.some((e) => e.isIntersecting)) open();
          },
          { threshold: 0 },
        );
        observer.observe(el);
        watching = true;
      } catch {
        observer = undefined;
      }
    }

    /* Belt and braces, deferred a frame — an observer constructed while layout
       is still settling can miss the element it was created for. One rect
       read, once per element, never during a scroll. Deferring also keeps the
       reveal out of the effect body, where a synchronous setState would
       cascade a second render before paint. */
    const raf = requestAnimationFrame(() => {
      if (!watching) {
        open();
        return;
      }
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0 && r.height > 0) open();
    });

    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, [reduceMotion]);

  /* One tree for everybody — see the hydration note in the effect. Reduced
     motion differs only in the transition, which is applied after mount and so
     can never disagree with the server. */
  const wipe = reduceMotion
    ? { duration: 0 }
    : { duration: DURATION.hero, ease: EASE.emphasis, delay };
  const settle = reduceMotion
    ? { duration: 0 }
    : { duration: DURATION.hero + 0.35, ease: EASE.out, delay };

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial={{ clipPath: CLOSED[from] }}
      animate={{ clipPath: revealed ? OPEN : CLOSED[from] }}
      transition={wipe}
    >
      <motion.div
        initial={{ scale }}
        animate={{ scale: revealed ? 1 : scale }}
        // Outlasts the wipe so the image is still settling as the frame
        // finishes opening — they must not land on the same beat.
        transition={settle}
        className="will-change-transform"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
