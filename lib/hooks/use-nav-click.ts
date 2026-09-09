"use client";

import { useCallback, type MouseEvent } from "react";
import { usePathname } from "next/navigation";
import { replayEntrance, scrollToTop } from "@/lib/scroll-controller";

/**
 * The click behaviour every site-nav link shares.
 *
 * A header tab is a promise: "take me to the start of this section." Two cases
 * break that promise on their own, and this closes both.
 *
 * 1. SAME ROUTE. `<Link href="/work">` while already on `/work` is a no-op in
 *    the router, so a reader parked at the bottom of the page clicks Work and
 *    nothing moves. Here the click glides back to the top and then replays the
 *    page's entrance — the "refresh" without a reload.
 *
 * 2. DIFFERENT ROUTE. Next keeps the scroll position when the Page element is
 *    still inside the viewport (see the `scroll` prop in the Link docs), so
 *    arriving deep in a long page is normal, not exceptional. `SmoothScroll`
 *    pins every forward navigation to the top before the browser paints; this
 *    handler leaves that click alone.
 *
 * Modified clicks (⌘/ctrl/shift/alt, middle button) fall through untouched so
 * "open in new tab" keeps working.
 */
export function useNavClick(): (event: MouseEvent<HTMLAnchorElement>, href: string) => void {
  const pathname = usePathname();

  return useCallback(
    (event: MouseEvent<HTMLAnchorElement>, href: string) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      if (href !== pathname) return;

      event.preventDefault();
      scrollToTop(replayEntrance);
    },
    [pathname],
  );
}
