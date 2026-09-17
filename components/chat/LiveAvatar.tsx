"use client";

import { useEffect, type CSSProperties } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";

/* Rinshad from the chatbot illustration (public/images/rinshad_chatbot_avatar.webp),
   cut out with Apple's Vision subject mask: a 512px head and shoulders on
   transparency, so the head can rise out of its own circle. */
const CUTOUT_SRC = "/images/rinshad_chatbot_avatar_cutout.webp";

/** What the assistant is doing, as the avatar shows it. */
export type AvatarMood = "idle" | "thinking" | "searching" | "speaking";

interface LiveAvatarProps {
  /** Diameter of the circle, in px. The head rises above it by ~18%. */
  size: number;
  mood?: AvatarMood;
  /** Turn the head toward the cursor anywhere on the page (fine pointers only). */
  followPointer?: boolean;
  /** Shared-layout id, so one avatar can travel into another's place. */
  layoutId?: string;
  className?: string;
}

/** How far the head rises above the circle, as a fraction of its diameter. */
const RISE = 0.22;
/** The bust is drawn past the circle, so the face — not the shoulders — fills it. */
const BUST_SCALE = 1.3;
/** How far the bust hangs below the circle, so the face sits just above its centre. */
const BUST_DROP = 0.155;

const LOOK_SPRING = { stiffness: 120, damping: 18, mass: 0.6 } as const;

/**
 * LiveAvatar — the assistant's face, alive.
 *
 * Layers, back to front: a terracotta aura with a slowly turning sheen; ripples
 * while it speaks, or an orbiting pair of sparks while it thinks or searches;
 * then the illustrated Rinshad, masked to the circle below its centre and free
 * above it, so the head breaks out of the frame.
 *
 * The idle loops (sheen, breathing) are CSS so they run on the compositor —
 * this sits on every page. Framer drives only what reacts: mood changes,
 * shared-layout travel and the spring that turns the head toward the cursor.
 * Under reduced motion the loops stop (globals.css) and MotionConfig drops the
 * transforms, leaving a still face.
 */
export function LiveAvatar({ size, mood = "idle", followPointer = false, layoutId, className }: LiveAvatarProps) {
  const reduceMotion = useReducedMotion();
  const busy = mood !== "idle" && !reduceMotion;

  /* LOOK. Pointer position across the viewport, -0.5…0.5, eased by a spring. */
  const lookX = useMotionValue(0);
  const lookY = useMotionValue(0);
  const springX = useSpring(lookX, LOOK_SPRING);
  const springY = useSpring(lookY, LOOK_SPRING);
  const rotate = useTransform(springX, [-0.5, 0.5], [-7, 7]);
  const headX = useTransform(springX, [-0.5, 0.5], [-size * 0.04, size * 0.04]);
  const headY = useTransform(springY, [-0.5, 0.5], [-size * 0.02, size * 0.03]);

  useEffect(() => {
    if (!followPointer || reduceMotion || !window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (event: PointerEvent) => {
      lookX.set(event.clientX / window.innerWidth - 0.5);
      lookY.set(event.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [followPointer, reduceMotion, lookX, lookY]);

  const rise = Math.round(size * RISE);
  const centre = rise + size / 2;
  // Circle below the centre line, everything above it: the head breaks out.
  const mask = `radial-gradient(circle ${size / 2}px at 50% ${centre}px, #000 calc(100% - 0.5px), transparent 100%), linear-gradient(#000 ${centre}px, transparent ${centre}px)`;

  return (
    <motion.span
      aria-hidden="true"
      layoutId={layoutId}
      className={cn("relative inline-block shrink-0", className)}
      style={{ width: size, height: size }}
    >
      {/* Ripples — speaking. */}
      <AnimatePresence>
        {busy &&
          mood === "speaking" &&
          [0, 1].map((ring) => (
            <motion.span
              key={`ripple-${ring}`}
              className="absolute inset-0 rounded-full border border-accent/50"
              initial={{ scale: 1, opacity: 0 }}
              animate={{ scale: [1, 1.55], opacity: [0.7, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.6, ease: "easeOut", repeat: Infinity, delay: ring * 0.8 }}
            />
          ))}
      </AnimatePresence>

      {/* Aura. */}
      <motion.span
        className="absolute inset-0 overflow-hidden rounded-full bg-[radial-gradient(circle_at_32%_24%,#f7dccd_0%,#e39a78_45%,#c75c37_100%)] shadow-[inset_0_-6px_14px_rgba(120,40,15,0.25),0_6px_18px_-8px_rgba(199,92,55,0.55)]"
        animate={busy ? { scale: mood === "speaking" ? [1, 1.05, 1] : 1 } : { scale: 1 }}
        transition={mood === "speaking" ? { duration: 0.9, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
      >
        <span className="absolute -inset-1/4 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,255,255,0.55)_50deg,transparent_120deg,transparent_220deg,rgba(255,255,255,0.3)_260deg,transparent_320deg)] animate-[spin_9s_linear_infinite]" />
      </motion.span>

      {/* Sparks — thinking (slow) or searching (fast). */}
      <AnimatePresence>
        {busy && mood !== "speaking" && (
          <motion.span
            key="sparks"
            className="absolute -inset-[12%]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, rotate: 360 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              opacity: { duration: 0.2 },
              scale: { duration: 0.2 },
              rotate: { duration: mood === "searching" ? 1.1 : 2.4, repeat: Infinity, ease: "linear" },
            }}
          >
            <span className="absolute left-1/2 top-0 size-[9%] min-h-1 min-w-1 -translate-x-1/2 rounded-full bg-accent shadow-[0_0_8px_2px_rgba(199,92,55,0.6)]" />
            <span className="absolute bottom-0 left-1/2 size-[6%] min-h-1 min-w-1 -translate-x-1/2 rounded-full bg-accent-hover/80" />
          </motion.span>
        )}
      </AnimatePresence>

      {/* Rinshad, breaking out of the circle. */}
      <span
        className="absolute inset-x-0 bottom-0"
        style={{ top: -rise, maskImage: mask, WebkitMaskImage: mask } as CSSProperties}
      >
        <motion.span
          className="absolute left-1/2 block"
          style={{
            width: size * BUST_SCALE,
            height: size * BUST_SCALE,
            marginLeft: (-size * BUST_SCALE) / 2,
            bottom: -size * BUST_DROP,
            rotate,
            x: headX,
            y: headY,
            transformOrigin: "50% 80%",
          }}
        >
          <span
            className={cn(
              "absolute inset-0 block origin-bottom",
              mood === "speaking" && !reduceMotion
                ? "animate-[avatar-talk_0.9s_ease-in-out_infinite]"
                : "animate-[avatar-breathe_4.8s_ease-in-out_infinite]",
            )}
          >
            <Image
              src={CUTOUT_SRC}
              alt=""
              fill
              sizes={`${Math.ceil(size * BUST_SCALE)}px`}
              draggable={false}
              className="object-contain object-bottom drop-shadow-[0_3px_5px_rgba(20,18,14,0.3)]"
            />
          </span>
        </motion.span>
      </span>
    </motion.span>
  );
}
