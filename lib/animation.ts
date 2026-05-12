import type { Variants } from "framer-motion";

export const DURATION = {
  fast: 0.2,
  base: 0.4,
  slow: 0.6,
  xslow: 0.9,
} as const;

export const EASE = {
  out: [0.0, 0.0, 0.2, 1],
  inOut: [0.4, 0, 0.2, 1],
  spring: { type: "spring", stiffness: 300, damping: 30 },
  springBounce: { type: "spring", stiffness: 400, damping: 20 },
} as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.slow, ease: EASE.out },
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
    transition: { duration: DURATION.slow, ease: EASE.out },
  },
};

export const fadeRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: DURATION.slow, ease: EASE.out },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.slow, ease: EASE.out },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

export const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.015,
    y: -4,
    transition: EASE.spring,
  },
};

export const buttonHover = {
  rest: { scale: 1 },
  hover: { scale: 1.04, transition: EASE.springBounce },
  tap: { scale: 0.97 },
};

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.slow, ease: EASE.out },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: DURATION.fast, ease: EASE.out },
  },
};
