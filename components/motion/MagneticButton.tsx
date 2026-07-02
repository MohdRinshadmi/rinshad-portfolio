"use client";

import { useRef, type PointerEvent } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { EASE } from "@/lib/animation";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  /** max px the children translate toward the cursor (default 8) */
  strength?: number;
}

/**
 * Wraps an interactive element (e.g. a `Button`) and gently pulls it toward the
 * pointer — capped at `strength`px — springing home on leave, with a subtle
 * `whileTap` press. Honors reduced motion by disabling the transform entirely.
 */
export function MagneticButton({
  children,
  className,
  strength = 8,
}: MagneticButtonProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // Apply the motion-value transform only after hydration so the server HTML and
  // the first client render are identical (passing live motion values into `style`
  // otherwise renders a transform that can differ → hydration mismatch).
  const hydrated = useHydrated();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, EASE.spring);
  const springY = useSpring(y, EASE.spring);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || event.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // offset of the cursor from the element center, normalized to [-1, 1]
    const relX = (event.clientX - rect.left) / rect.width - 0.5;
    const relY = (event.clientY - rect.top) / rect.height - 0.5;
    x.set(relX * strength * 2);
    y.set(relY * strength * 2);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={cn("inline-flex", className)}
      style={hydrated && !reduceMotion ? { x: springX, y: springY } : undefined}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
    >
      {children}
    </motion.div>
  );
}
