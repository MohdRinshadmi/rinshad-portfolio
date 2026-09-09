"use client";

import { Fragment, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { DURATION, EASE } from "@/lib/animation";
import { subscribeEntranceReplay } from "@/lib/scroll-controller";

/**
 * PageTransition — the fade a route arrives on, and the replay it can be asked
 * to run again.
 *
 * Mounted from the `template.tsx` files, which the App Router remounts on
 * navigation (the root one keys on the first path segment, so it covers every
 * header tab; the nested ones cover /work/[slug] and /blog/[slug]).
 *
 * Three deliberate constraints:
 *
 * 1. OPACITY ONLY — no translate. A `transform` on an ancestor establishes a
 *    containing block, and this wraps pages built on `sticky` pinning (the
 *    horizontal chapter, the systems canvas, the stacking work deck, the case
 *    study meta rail). Sliding the wrapper would break all of them. Opacity
 *    creates a stacking context but never a containing block, so it is safe.
 *    (`filter` is out for the same reason — it *does* create one.)
 *
 * 2. THE FIRST PAINT OF A SESSION DOES NOT FADE. An `initial={{ opacity: 0 }}`
 *    renders into the SSR HTML, so the page would stay invisible until
 *    hydration finished — which is exactly the regression the Prologue's
 *    portrait comment documents (it cost ~1.65s of LCP render delay there).
 *    `hasNavigated` lives at module scope so it survives the remount, letting
 *    the entry page render opaque and only client-side navigations animate.
 *
 * 3. A REPLAY IS A REMOUNT. Clicking the header tab for the route you are
 *    already on can't go through the router, so `useNavClick` glides to the top
 *    and calls `replayEntrance()`. Bumping `replay` re-keys the subtree, which
 *    resets every `initial`/`animate` entrance and every `once: true` scroll
 *    reveal underneath — the page introduces itself again, with none of a
 *    reload's cost.
 */
let hasNavigated = false;

export function PageTransition({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();
  // Read once per mount. False on the very first page of the session, true for
  // every route entered after it.
  const [animate] = useState(() => hasNavigated);
  const [replay, setReplay] = useState(0);

  useEffect(() => {
    hasNavigated = true;
  }, []);

  useEffect(() => subscribeEntranceReplay(() => setReplay((n) => n + 1)), []);

  // Render children bare rather than in an opaque wrapper: identical markup on
  // the server and on the first client render, and one less div on the LCP path.
  // The keyed Fragment still remounts them on replay.
  if (reduceMotion || (!animate && replay === 0)) {
    return <Fragment key={replay}>{children}</Fragment>;
  }

  return (
    <motion.div
      key={replay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      // A replay has no route change to explain it, so it gets the longer,
      // softer curve — it should read as the page settling, not a flicker.
      transition={{
        duration: replay > 0 ? DURATION.reveal : DURATION.base,
        ease: EASE.out,
      }}
    >
      {children}
    </motion.div>
  );
}
