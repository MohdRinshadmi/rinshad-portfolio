"use client";

import { useEffect, useState } from "react";
import { journeySections } from "@/lib/experience/data";
import { cn } from "@/lib/utils";

/* ============================================================================
   JourneyRail — the mission map. A fixed rail of waypoints (desktop only)
   tracking which stage of the journey is on screen. Real anchor links, so
   it's also the fastest keyboard route between stages.
   ========================================================================== */

export function JourneyRail() {
  const [active, setActive] = useState<string>(journeySections[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Of the stages on screen, follow the one closest to the viewport top.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-35% 0px -45% 0px" },
    );
    for (const { id } of journeySections) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Journey sections"
      className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 lg:block"
    >
      <ol className="flex flex-col items-end gap-3.5">
        {journeySections.map(({ id, label }) => {
          const current = active === id;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                aria-current={current ? "true" : undefined}
                className="group flex items-center gap-2.5 py-0.5"
              >
                <span
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-[0.18em] transition-all duration-300",
                    current
                      ? "translate-x-0 text-accent opacity-100"
                      : "translate-x-1 text-text-tertiary opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100",
                  )}
                >
                  {label}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "block rounded-full transition-all duration-300",
                    current
                      ? "h-5 w-1.5 bg-accent"
                      : "h-1.5 w-1.5 bg-text-tertiary/50 group-hover:bg-text-tertiary",
                  )}
                />
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
