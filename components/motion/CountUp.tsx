"use client";

import { useEffect, useRef } from "react";
import { animate, inView } from "framer-motion";
import { DURATION, EASE } from "@/lib/animation";
import { formatCount } from "@/lib/format";
import { prefersReducedMotion } from "@/lib/scroll-controller";
import { cn } from "@/lib/utils";

interface CountUpProps {
  to: number;
  from?: number;
  /** seconds */
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * A number that counts up once, the first time it scrolls into view.
 *
 * The FINAL value is what React renders: into the server HTML, for crawlers
 * and link previews, for anyone whose JavaScript never arrives, and — through
 * the sr-only copy — for screen readers, which would otherwise announce every
 * intermediate frame. The count is layered on afterwards by writing
 * `textContent` directly, so it costs no re-renders.
 *
 * The previous version rendered `from` until hydration AND an intersection had
 * both happened, which is how production shipped "0+ REST endpoints" to every
 * reader that doesn't run the page's JS.
 *
 * The reset to `from` happens only at the moment the count starts — a little
 * BEFORE the number scrolls into view (positive bottom margin) — so the DOM
 * holds the real value until then. A headless scraper that never scrolls reads
 * "40+", not "0+". No count at all when the number is already on screen at
 * hydration (resetting it in front of the reader would flash) or under reduced
 * motion.
 */
export function CountUp({
  to,
  from = 0,
  duration = DURATION.hero,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const final = formatCount(to, decimals, prefix, suffix);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const box = el.getBoundingClientRect();
    if (box.bottom > 0 && box.top < window.innerHeight) return;

    const write = (value: number) => {
      el.textContent = formatCount(value, decimals, prefix, suffix);
    };

    let controls: ReturnType<typeof animate> | undefined;
    const stopWatching = inView(
      el,
      () => {
        write(from);
        controls = animate(from, to, { duration, ease: EASE.out, onUpdate: write });
        stopWatching();
      },
      // Fire ~a tenth of a screen early: the count is already under way when
      // the number appears, and the reset to zero is never on screen.
      { margin: "0px 0px 10% 0px" },
    );

    return () => {
      stopWatching();
      controls?.stop();
      write(to);
    };
  }, [from, to, duration, decimals, prefix, suffix]);

  return (
    <span className={cn("tabular-nums", className)}>
      <span ref={ref} aria-hidden="true">
        {final}
      </span>
      <span className="sr-only">{final}</span>
    </span>
  );
}
