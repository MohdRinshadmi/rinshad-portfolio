"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useScrubProgress } from "@/lib/hooks/use-scrub-progress";
import { prologue } from "@/lib/content/story";
import { EASE } from "@/lib/animation";

/* Vertical edge fade for the hover reel (mask-fade-x's vertical sibling). */
const FADE_Y = "linear-gradient(to bottom, transparent, #000 9%, #000 91%, transparent)";

/* The tilt's follow-through: soft enough to trail the cursor a beat, damped
   past a wobble. Heavier than SCRUB_SPRING because this one carries a plate. */
const TILT_SPRING = { stiffness: 170, damping: 22, mass: 0.6 } as const;
/* Degrees of rotation at the frame's far edges. Past ~8° the crop distorts. */
const TILT_MAX = 7;

/**
 * HeroPortrait — the cover photograph. Right column on desktop; below the
 * introduction on phones, so the first screen on a phone says who and what
 * before it shows a face.
 *
 * NOTHING IN THE FRAME MAY WAIT ON JS. The image is the desktop LCP element.
 * Its entrance is a CSS wipe (`.hero-portrait-reveal` in globals.css), which
 * starts when the stylesheet parses; a Framer `initial` opacity kept it
 * invisible until hydration — ~1.65s of LCP render delay, the last time.
 *
 * What does use JS is interaction-only: the pointer tilt with a specular sheen
 * (fine pointers, motion allowed), a small scroll parallax inside the frame,
 * and the project reel that replaces the photo on hover (pure CSS).
 */
export function HeroPortrait() {
  const reduceMotion = useReducedMotion();
  const hydrated = useHydrated();
  const columnRef = useRef<HTMLDivElement>(null);

  /* PARALLAX. The photo drifts up and pushes in inside its frame as the cover
     scrolls away, so it reads as a window rather than a sticker. The bleed on
     the wrapper (-inset-y-7 = 28px) is the headroom the drift spends. */
  const progress = useScrubProgress(columnRef, ["start start", "end start"]);
  const photoY = useTransform(progress, [0, 1], [0, -24]);
  const photoScale = useTransform(progress, [0, 1], [1, 1.06]);

  /* TILT. The frame leans toward the cursor. Never armed on touch. */
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [TILT_MAX, -TILT_MAX]), TILT_SPRING);
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-TILT_MAX, TILT_MAX]), TILT_SPRING);
  const sheenX = useSpring(useTransform(pointerX, [-0.5, 0.5], [-150, 150]), TILT_SPRING);
  const sheenY = useSpring(useTransform(pointerY, [-0.5, 0.5], [-190, 190]), TILT_SPRING);

  const [finePointer, setFinePointer] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(pointer: fine)");
    const sync = () => setFinePointer(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const tilting = finePointer && !reduceMotion;

  const trackPointer = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - box.left) / box.width - 0.5);
    pointerY.set((event.clientY - box.top) / box.height - 0.5);
  };
  const releasePointer = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <div
      ref={columnRef}
      onPointerMove={tilting ? trackPointer : undefined}
      onPointerLeave={tilting ? releasePointer : undefined}
      className="relative mx-auto w-full max-w-64 sm:max-w-80 lg:mx-0 lg:max-w-none lg:self-center lg:before:absolute lg:before:inset-y-0 lg:before:-left-10 lg:before:border-l lg:before:border-dashed lg:before:border-border lg:before:content-['']"
    >
      {/* Soft terracotta wash behind the frame. */}
      <div
        aria-hidden="true"
        className="absolute -inset-10 -z-20 bg-[radial-gradient(60%_55%_at_50%_38%,rgba(199,92,55,0.12),transparent_72%)] blur-2xl"
      />

      {/* The 3D stage — its perspective gives the dashed plate real depth. */}
      <motion.div style={{ transformPerspective: 1400, transformStyle: "preserve-3d" }} className="relative">
        <motion.div
          className="group relative transform-3d"
          style={tilting ? { rotateX, rotateY, transformPerspective: 1100 } : undefined}
        >
          {/* Offset plate 28px behind the photograph (`-translate-z-7`), so it
              parallaxes under the tilt. The depth is repeated on hover because
              Tailwind's two-value `translate` shorthand drops the z component. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 -translate-z-7 translate-x-4 translate-y-4 rounded-4xl border border-dashed border-border-strong transition-transform duration-500 ease-out group-hover:-translate-z-7 group-hover:translate-x-5 group-hover:translate-y-5"
          />
          {/* The wipe lives on its own wrapper: the card below owns `transform`
              for its hover lift, and the two would overwrite each other. */}
          <div className="hero-portrait-reveal">
            <div className="rounded-4xl bg-linear-to-br from-accent/70 via-accent/15 to-border p-[3px] shadow-card transition-[transform,box-shadow] duration-500 ease-out group-hover:-translate-y-1.5 group-hover:shadow-glow">
              <figure className="relative aspect-[3/4] overflow-hidden rounded-[calc(2rem-3px)] bg-surface">
                <motion.div
                  className="absolute -inset-y-7 inset-x-0"
                  style={
                    hydrated && !reduceMotion
                      ? { y: photoY, scale: photoScale, willChange: "transform" }
                      : undefined
                  }
                >
                  <Image
                    src={prologue.portrait.src}
                    alt={prologue.portrait.alt}
                    fill
                    preload
                    fetchPriority="high"
                    sizes="(min-width: 1280px) 30rem, (min-width: 1024px) 28rem, (min-width: 640px) 20rem, 16rem"
                    className="object-cover transition-[transform,opacity] duration-500 ease-out group-hover:scale-[1.06] group-hover:opacity-0"
                  />
                </motion.div>

                {/* Project reel — fades in a beat after the portrait recedes. */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 opacity-0 transition-opacity delay-150 duration-500 ease-out group-hover:opacity-100"
                  style={{ maskImage: FADE_Y, WebkitMaskImage: FADE_Y }}
                >
                  <div
                    className="animate-marquee-y will-change-transform"
                    style={{ "--marquee-duration": "44s" } as CSSProperties}
                  >
                    {/* two identical copies = a seamless -50% → 0 loop */}
                    {[0, 1].map((copy) => (
                      <div key={copy} className="flex flex-col gap-4 px-3 pb-4 pt-3">
                        {prologue.reel.items.map((item) => (
                          <div
                            key={item.src}
                            className="relative aspect-4/5 w-full overflow-hidden rounded-xl border border-border bg-surface shadow-card"
                          >
                            <Image
                              src={item.src}
                              alt=""
                              fill
                              quality={90}
                              // The 4:5 card center-crops these 4:3 shots, so the
                              // browser needs ~1.67× the card's width.
                              sizes="(min-width: 1024px) 43rem, 32rem"
                              className="object-cover"
                            />
                            <span className="absolute bottom-2.5 left-2.5 rounded-full bg-surface/85 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-text-secondary backdrop-blur-sm">
                              {item.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specular sheen under the cursor — its own transform only. */}
                {tilting && (
                  <motion.div
                    aria-hidden="true"
                    className="pointer-events-none absolute -left-[15%] -top-[15%] z-10 h-[130%] w-[130%] bg-[radial-gradient(closest-side,rgba(255,255,255,0.32),rgba(255,255,255,0)_72%)] opacity-0 mix-blend-overlay transition-opacity duration-500 ease-out group-hover:opacity-100"
                    style={{ x: sheenX, y: sheenY }}
                  />
                )}
                {/* Arrival gleam — one pass of light as the card squares up.
                    Transform-only, gated by prop rather than by mounting so the
                    server and client trees match for reduced-motion visitors. */}
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 -left-1/2 z-20 w-1/2 bg-linear-to-r from-transparent via-white/35 to-transparent mix-blend-overlay"
                  initial={{ x: 0, skewX: -12 }}
                  animate={reduceMotion ? undefined : { x: "330%", skewX: -12 }}
                  transition={{ duration: 1.05, ease: EASE.inOut, delay: 1 }}
                />
              </figure>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
