import type { Variants, Transition } from "framer-motion";

/* ============================================================================
   MOTION TOKENS
   Philosophy: motion *demonstrates* the product (streaming, presence, agentic).
   Fast, transform/opacity-only, enters once. Curves tuned for the "expensive"
   premium feel (fast start, long soft settle).
   ========================================================================== */

export const EASE = {
  /** expo-out — the premium reveal curve (Linear/Vaul feel) */
  out: [0.16, 1, 0.3, 1],
  /** symmetric — moves & toggles */
  inOut: [0.65, 0, 0.35, 1],
  /** large entrances — hero, big statements */
  emphasis: [0.22, 1, 0.36, 1],
  /** cards, magnetic */
  spring: { type: "spring", stiffness: 320, damping: 32 } as Transition,
  /** buttons, taps */
  springSnappy: { type: "spring", stiffness: 420, damping: 26 } as Transition,
  // kept for backwards-compat with any existing imports:
  springBounce: { type: "spring", stiffness: 400, damping: 20 } as Transition,
} as const;

export const DURATION = {
  micro: 0.15, // hover, taps, chips
  base: 0.3, // most UI transitions
  reveal: 0.65, // scroll reveals
  hero: 0.95, // hero entrance, big statements
  slow: 1.2, // background drifts, marquee step
  // legacy aliases:
  fast: 0.2,
  xslow: 0.9,
} as const;

/* ----------------------------------------------------------------------------
   Reveal variants
   -------------------------------------------------------------------------- */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.reveal, ease: EASE.out },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: DURATION.base, ease: EASE.out },
  },
};

export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: DURATION.reveal, ease: EASE.out },
  },
};

export const fadeRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: DURATION.reveal, ease: EASE.out },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.reveal, ease: EASE.out },
  },
};

/** Line-mask reveal: child slides up from inside an overflow:hidden parent. */
export const lineMask: Variants = {
  hidden: { y: "110%" },
  visible: {
    y: "0%",
    transition: { duration: DURATION.reveal, ease: EASE.emphasis },
  },
};

/* ----------------------------------------------------------------------------
   Stagger containers
   -------------------------------------------------------------------------- */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

export const staggerContainerFast: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

/** Token-stream stagger — words fade up L→R like an LLM completing. */
export const tokenStream: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.045, delayChildren: 0.1 },
  },
};

export const tokenWord: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE.emphasis },
  },
};

/* ----------------------------------------------------------------------------
   Interaction variants
   -------------------------------------------------------------------------- */
export const cardHover = {
  rest: { y: 0, scale: 1 },
  hover: { y: -6, scale: 1.015, transition: EASE.spring },
};

export const buttonHover = {
  rest: { scale: 1 },
  hover: { scale: 1.03, transition: EASE.springSnappy },
  tap: { scale: 0.97 },
};

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.reveal, ease: EASE.out },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: DURATION.base, ease: EASE.out },
  },
};

/** Shared viewport config for whileInView reveals (enter once). */
export const VIEWPORT = { once: true, margin: "-80px" } as const;
