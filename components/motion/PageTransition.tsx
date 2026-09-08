"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { DURATION, EASE } from "@/lib/animation";

/**
 * PageTransition — the fade a route arrives on.
 *
 * Mounted from the `template.tsx` files, which the App Router remounts on
 * navigation (the root one keys on the first path segment, so it covers every
 * header tab; the nested ones cover /work/[slug] and /blog/[slug]).
 *
 * Two deliberate constraints:
 *
 * 1. OPACITY ONLY — no translate. A `transform` on an ancestor establishes a
 *    containing block, and this wraps pages built on `sticky` pinning (the
 *    horizontal chapter, the systems canvas, the stacking work deck, the case
 *    study meta rail). Sliding the wrapper would break all of them. Opacity
 *    creates a stacking context but never a containing block, so it is safe.
 *
 * 2. THE FIRST PAINT OF A SESSION DOES NOT FADE. An `initial={{ opacity: 0 }}`
 *    renders into the SSR HTML, so the page would stay invisible until
 *    hydration finished — which is exactly the regression the Prologue's
 *    portrait comment documents (it cost ~1.65s of LCP render delay there).
 *    `hasNavigated` lives at module scope so it survives the remount, letting
 *    the entry page render opaque and only client-side navigations animate.
 */
let hasNavigated = false;

export function PageTransition({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();
  // Read once per mount. False on the very first page of the session, true for
  // every route entered after it.
  const [animate] = useState(() => hasNavigated);

  useEffect(() => {
    hasNavigated = true;
  }, []);

  // Render children bare rather than in an opaque wrapper: identical markup on
  // the server and on the first client render, and one less div on the LCP path.
  if (!animate || reduceMotion) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: DURATION.base, ease: EASE.out }}
    >
      {children}
    </motion.div>
  );
}
