"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import { siteConfig } from "@/lib/config/site";
import { DURATION, EASE } from "@/lib/animation";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { LiveAvatar } from "./LiveAvatar";

/* Lazy chunk: the panel, its state machine, the stream parser and every piece
   of choreography inside it download on the first tap of the launcher, not
   with every page's shell — the same split Navbar makes for MobileMenu. */
const ChatWidget = dynamic(
  () => import("./ChatWidget").then((mod) => ({ default: mod.ChatWidget })),
  { ssr: false },
);

/* Hover propagates from the button to its children as a named variant, so the
   avatar hops and the arrow turns on one spring — Framer's orchestration
   rather than per-element CSS hovers. */
const hop: Variants = { rest: { y: 0 }, hover: { y: -3 } };
const nudge: Variants = { rest: { scale: 1 }, hover: { scale: 1.1 } };

/** A label that slides and un-blurs into place when it changes. */
function Swap({ id, className, children }: { id: string; className?: string; children: React.ReactNode }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={id}
        initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
        transition={{ duration: DURATION.base, ease: EASE.out }}
        className={className}
      >
        {children}
      </motion.span>
    </AnimatePresence>
  );
}

/**
 * The floating "Ask AI" control — Rinshad himself, live (see LiveAvatar),
 * rising out of a dark pill and watching the cursor. Everything it imports is
 * already in the shell except the avatar, a 28KB cut-out that loads after
 * hydration; the chat still costs the first paint nothing.
 *
 * It renders only after hydration. A server-rendered button would sit dead
 * until React booted, and keeping it out of the HTML means it can never be the
 * LCP element or compete with the hero's entrance. It is `fixed`, so appearing
 * late shifts no layout.
 *
 * iOS Safari clips fixed content at the top of its bottom toolbar, yet resolves
 * `bottom` against a viewport that runs underneath it once the bar minimises on
 * scroll — so `bottom: 1rem` put half the launcher behind the bar. On iOS
 * (`-webkit-touch-callout` is WebKit-on-iOS only) it is lifted by the gap
 * between the current viewport (`100%` of the fixed containing block) and
 * `100svh`, the viewport with the toolbar fully shown: it sits 1.25rem above
 * the expanded bar and holds that spot while the bar shrinks, never beneath it.
 * Android's toolbar is at the top, so it keeps the plain offset there.
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
        initial={{ opacity: 0, y: 24, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileHover="hover"
        whileTap={{ scale: 0.96 }}
        transition={{ ...EASE.spring, opacity: { duration: DURATION.base } }}
        className="group fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] max-md:supports-[-webkit-touch-callout:none]:bottom-[calc(100%-100svh+max(1.25rem,env(safe-area-inset-bottom)))] z-40 flex items-center gap-2.5 rounded-full bg-ink p-1.5 pr-4.5 text-left text-ink-text shadow-[0_18px_40px_-14px_rgba(20,18,14,0.55),inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-ink-border transition-shadow duration-300 hover:shadow-[0_22px_48px_-12px_rgba(199,92,55,0.45),inset_0_1px_0_rgba(255,255,255,0.14)] md:bottom-6 md:right-6 md:gap-3 md:pr-2"
      >
        <motion.span variants={hop} transition={EASE.springSnappy} className="inline-flex">
          <LiveAvatar size={46} followPointer />
        </motion.span>

        {/* Phones keep the label but not the pitch: without it the launcher is
            just a face in a ring and nothing says it opens a chat. The panel
            covers the whole screen there, so the "open" copy is never seen. */}
        <span aria-hidden="true" className="flex flex-col md:min-w-34">
          <Swap id={open ? "close" : "ask"} className="whitespace-nowrap text-sm font-semibold leading-tight tracking-tight">
            {open ? "Close chat" : "Ask my AI"}
          </Swap>
          <span className="mt-0.5 flex items-center gap-1.5 whitespace-nowrap text-[0.6875rem] leading-tight text-ink-text-secondary">
            <span className="relative flex size-1.5">
              <span className="absolute inset-0 rounded-full bg-positive motion-safe:animate-ping" />
              <span className="relative size-1.5 rounded-full bg-positive" />
            </span>
            <span className="md:hidden">Online</span>
            <span className="hidden md:flex">
              <Swap id={open ? "saved" : "online"}>{open ? "Your chat is kept" : "Online · replies in seconds"}</Swap>
            </span>
          </span>
        </span>

        <motion.span
          aria-hidden="true"
          variants={nudge}
          transition={EASE.springSnappy}
          className="hidden size-9 items-center justify-center rounded-full bg-ink-text text-ink md:inline-flex"
        >
          <Swap id={open ? "x" : "arrow"} className="inline-flex">
            {open ? <X size={17} strokeWidth={2.25} /> : <ArrowUpRight size={17} strokeWidth={2.25} />}
          </Swap>
        </motion.span>
      </motion.button>

      {mounted && <ChatWidget open={open} onClose={close} />}
    </>
  );
}
