"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Returns `false` on the server and during the first (hydration) client render,
 * then `true` after hydration — without a setState-in-effect. Use it to gate any
 * render output that can only be computed on the client (e.g. framer motion
 * values in `style`) so the server HTML and first client render stay identical.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true, // client snapshot
    () => false, // server snapshot (also used for the hydration render)
  );
}
