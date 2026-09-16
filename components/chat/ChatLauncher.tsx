"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { siteConfig } from "@/lib/config/site";
import { DURATION, EASE } from "@/lib/animation";
import { useHydrated } from "@/lib/hooks/use-hydrated";

/* Lazy chunk: the panel, its state machine, the stream parser and every piece
   of choreography inside it download on the first tap of the launcher, not
   with every page's shell — the same split Navbar makes for MobileMenu. */
const ChatWidget = dynamic(
  () => import("./ChatWidget").then((mod) => ({ default: mod.ChatWidget })),
  { ssr: false },
);

/**
 * The floating "Ask AI" control. Everything it imports — framer-motion, lucide,
 * site config — already ships with the Navbar, so this adds a few hundred bytes
 * of component to the shell and none of the chat.
 *
 * It renders only after hydration. A server-rendered button would sit dead
 * until React booted, and keeping it out of the HTML means it can never be the
 * LCP element or compete with the hero's entrance. It is `fixed`, so appearing
 * late shifts no layout.
 */
export function ChatLauncher() {
  const hydrated = useHydrated();
  const [open, setOpen] = useState(false);
  // Latches true on first intent so the lazy widget stays mounted afterwards:
  // the panel closes by animating out rather than unmounting, and the
  // conversation survives closing it.
  const [mounted, setMounted] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  // Hover or keyboard focus mounts the (still closed) widget, so its chunk is
  // usually parsed by the time the click lands. Latching the mount — rather
  // than calling import() separately — keeps next/dynamic the only loader: a
  // bare import() compiled to a second copy of the chunk, and a hover followed
  // by a click downloaded both.
  const warm = useCallback(() => setMounted(true), []);

  if (!hydrated) return null;

  return (
    <>
      <motion.button
        type="button"
        onClick={() => {
          setMounted(true);
          setOpen((value) => !value);
        }}
        onPointerEnter={warm}
        onFocus={warm}
        aria-label={open ? "Close Ask AI" : `Ask AI about ${siteConfig.name}`}
        aria-expanded={open}
        aria-controls={mounted ? "chat-panel" : undefined}
        aria-haspopup="dialog"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.base, ease: EASE.out }}
        whileHover={{ y: -2, transition: EASE.springSnappy }}
        whileTap={{ scale: 0.96, transition: EASE.springSnappy }}
        className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-40 inline-flex size-13 items-center justify-center gap-2 rounded-full bg-text text-sm font-medium text-bg shadow-raised transition-colors duration-200 ease-out hover:bg-accent-press md:bottom-6 md:right-6 md:h-11 md:w-auto md:pl-3.5 md:pr-4.5"
      >
        <span aria-hidden="true" className="relative inline-flex size-5 items-center justify-center">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={open ? "close" : "open"}
              initial={{ opacity: 0, rotate: -45, scale: 0.7 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 45, scale: 0.7 }}
              transition={{ duration: DURATION.fast, ease: EASE.out }}
              className="inline-flex"
            >
              {open ? <X size={18} strokeWidth={2} /> : <Sparkles size={18} strokeWidth={1.75} />}
            </motion.span>
          </AnimatePresence>
        </span>
        <span className="hidden md:inline">Ask AI</span>
      </motion.button>

      {mounted && <ChatWidget open={open} onClose={close} />}
    </>
  );
}
