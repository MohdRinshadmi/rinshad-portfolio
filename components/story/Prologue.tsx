"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useScrubProgress } from "@/lib/hooks/use-scrub-progress";
import { LineMask } from "@/components/motion/LineMask";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { prologue } from "@/lib/content/story";
import { DURATION, EASE } from "@/lib/animation";

/* Vertical edge fade for the hover reel (mask-fade-x's vertical sibling). */
const FADE_Y = "linear-gradient(to bottom, transparent, #000 9%, #000 91%, transparent)";

/* The tilt's follow-through: soft enough to trail the cursor a beat, damped
   past a wobble. Heavier than SCRUB_SPRING because this one carries a plate. */
const TILT_SPRING = { stiffness: 170, damping: 22, mass: 0.6 } as const;
/* Degrees of rotation at the frame's far edges. Past ~8° the crop distorts. */
const TILT_MAX = 7;

/**
 * Prologue — the documentary's cover, typeset like a magazine front. A hairline
 * meta row, then the introduction: "I am Rinshad," in a light greeting (name in
 * terracotta serif italic) over two heavy caps lines — FULL-STACK / SOFTWARE ENGINEER.
 * Beside it, a vertical reel of project stills drifts top → bottom with the
 * work CTA floating over it. Scrolling away recedes the whole frame like a
 * title card giving way to chapter one.
 */
export function Prologue() {
  const reduceMotion = useReducedMotion();
  const hydrated = useHydrated();
  const sectionRef = useRef<HTMLElement>(null);

  const scrollYProgress = useScrubProgress(sectionRef, ["start start", "end start"]);
  // The cover doesn't slide away at a constant rate — it holds for the first
  // beat, then accelerates out, the way a title card gives up the screen.
  const departY = useTransform(scrollYProgress, [0, 0.5, 1], [0, 22, 80]);
  const departOpacity = useTransform(scrollYProgress, [0, 0.45, 0.85], [1, 0.86, 0.3]);

  /* ── The photograph's own motion ────────────────────────────────────────
     Two independent layers, both transform-only so the LCP image still paints
     at first frame (see the entrance comment on the frame below).

     PARALLAX. The photo drifts up and pushes in *inside* its frame while the
     cover recedes, so the picture reads as a window rather than a sticker on
     the page. Both values start at rest (progress 0 = page load), so nothing
     snaps at hydration. The bleed on the wrapper (-inset-y-7 = 28px) is the
     headroom the drift spends; keep `PHOTO_DRIFT` inside it or the frame
     shows its own background at the bottom edge. */
  const photoY = useTransform(scrollYProgress, [0, 1], [0, -24]);
  const photoScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);

  /* TILT. The frame leans toward the cursor, with a specular sheen sliding
     across the glass. Pointer-driven, so it costs nothing until someone
     reaches for it — and it is never armed on touch, where there is no cursor
     to follow and the hover reel is the whole interaction. */
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateX = useSpring(
    useTransform(pointerY, [-0.5, 0.5], [TILT_MAX, -TILT_MAX]),
    TILT_SPRING,
  );
  const rotateY = useSpring(
    useTransform(pointerX, [-0.5, 0.5], [-TILT_MAX, TILT_MAX]),
    TILT_SPRING,
  );
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

  /* Measured on the column, not the frame: the lean begins as the cursor
     approaches the photograph, a beat before hover swaps in the reel. */
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
    <section ref={sectionRef} id="prologue" className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-aurora" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-grain opacity-50" />

      <motion.div
        className="container-wide flex min-h-svh flex-col pb-28 pt-28"
        style={
          hydrated && !reduceMotion
            ? { y: departY, opacity: departOpacity, willChange: "transform, opacity" }
            : undefined
        }
      >
        {/* ── Colophon plate — serif index, faint warm plate, drawn rule ──── */}
        <div className="relative pb-5 xl:px-12">
          {/* faint terracotta plate — warms the top-left behind the index like a
              nameplate catching the cover's aurora. Whisper level, never a box. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-6 -top-5 -z-10 h-28 w-[min(34rem,88%)] rounded-4xl bg-[radial-gradient(70%_100%_at_0%_0%,rgba(199,92,55,0.07),transparent_72%)]"
          />
          <div className="flex items-stretch font-mono text-[10px] uppercase leading-none tracking-[0.16em] text-text-secondary">
            {/* Index — serif italic terracotta numeral, rhyming with the name in the
                headline below. The colophon's signature and its only fill of accent. */}
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: -6 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: DURATION.base, ease: EASE.out, delay: 0.06 }}
              className="flex shrink-0 items-center gap-2.5 pr-4"
            >
              <span className="font-serif text-[1.7em] italic leading-none text-accent">
                <span className="sr-only">Entry </span>
                {prologue.meta.index}
              </span>
              <span aria-hidden="true" className="hidden text-text-tertiary sm:inline">
                {prologue.meta.edition}
              </span>
            </motion.div>

            {/* Name · role — the masthead cell. Name stays legible at every width
                (truncates rather than vanishing); role is the part that drops on phones. */}
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: -6 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: DURATION.base, ease: EASE.out, delay: 0.12 }}
              className="flex min-w-0 flex-1 items-center gap-2 border-l border-border px-4"
            >
              <span className="truncate text-text">{prologue.meta.name}</span>
              <span aria-hidden="true" className="hidden shrink-0 text-text-tertiary sm:inline">
                {prologue.meta.role}
              </span>
            </motion.div>

            {/* Location · coordinates (md+) — quiet positioning metadata. */}
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: -6 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: DURATION.base, ease: EASE.out, delay: 0.18 }}
              className="hidden shrink-0 items-center gap-1.5 border-l border-border px-4 md:flex"
            >
              <span>{prologue.meta.location}</span>
              <span aria-hidden="true" className="tabular-nums text-text-tertiary">
                · {prologue.meta.coords}
              </span>
            </motion.div>

            {/* Live status cell — always visible, anchors the right edge. */}
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: -6 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: DURATION.base, ease: EASE.out, delay: 0.18 }}
              className="flex shrink-0 items-center gap-2 border-l border-border pl-4"
            >
              <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-positive animate-pulse-dot" />
              <span className="text-text">{prologue.meta.status}</span>
            </motion.div>
          </div>

          {/* The hairline rule — ignites terracotta at the left (under the index)
              and fades into the page, drawn in from the left at 0.22. */}
          <motion.div
            aria-hidden="true"
            className="mt-5 h-px origin-left bg-linear-to-r from-accent/60 via-border to-transparent"
            initial={reduceMotion ? false : { scaleX: 0 }}
            animate={reduceMotion ? undefined : { scaleX: 1 }}
            transition={{ duration: DURATION.reveal, ease: EASE.out, delay: 0.22 }}
          />
        </div>

        <div className="grid flex-1 items-center gap-14 pt-12 lg:grid-cols-[1fr_minmax(22rem,28rem)] lg:gap-20 lg:pt-0 xl:grid-cols-[1fr_minmax(24rem,30rem)] xl:px-12">
          {/* ── The introduction ────────────────────────────────────────── */}
          <div>
            <h1 className="font-display text-text">
              <LineMask delay={0.18}>
                <span className="block text-[clamp(1.75rem,3.2vw,2.75rem)] font-light leading-snug tracking-[-0.01em] text-text-secondary">
                  {prologue.headline.intro}{" "}
                  <em className="font-serif text-[1.2em] italic text-accent">
                    {prologue.headline.name}
                  </em>
                  ,
                </span>
              </LineMask>
              <LineMask delay={0.32} className="mt-4">
                <span className="block font-(family-name:--font-archivo-black) text-[clamp(2.75rem,6.5vw,6.25rem)] font-normal uppercase leading-[0.98] tracking-[-0.02em]">
                  {prologue.headline.lines[0]}
                </span>
              </LineMask>
              <LineMask delay={0.46}>
                <span className="block font-(family-name:--font-archivo-black) text-[clamp(2.75rem,6.5vw,6.25rem)] font-normal uppercase leading-[0.98] tracking-[-0.02em]">
                  {prologue.headline.lines[1]}
                  <span className="text-accent">.</span>
                </span>
              </LineMask>
            </h1>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: DURATION.reveal, ease: EASE.out, delay: 0.75 }}
              className="mt-11 max-w-[46ch] border-t border-dashed border-border pt-7"
            >
              <p className="text-body-lg text-text-secondary">{prologue.byline}</p>
              <p className="mt-6 inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-text-secondary">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-positive animate-pulse-dot" />
                {prologue.availability}
              </p>
            </motion.div>
          </div>

          {/* ── Portrait — the cover photograph ──────────────────────────
              Above the masthead on phones (order-first), right column on lg+.
              A terracotta gradient ring frames the shot; hover lifts it with a
              soft glow + gentle zoom. aspect-[3/4] reserves the box, so the
              preloaded LCP image paints with zero layout shift.

              The column itself never animates: it carries the `lg:before`
              dashed rule, which belongs to the page's guide rails rather than
              to the card. Swinging the card must not swing the grid, so the
              entrance lives one level in, on the 3D stage below. */}
          <div
            onPointerMove={tilting ? trackPointer : undefined}
            onPointerLeave={tilting ? releasePointer : undefined}
            className="relative order-first w-full max-w-72 justify-self-center sm:max-w-88 lg:order-none lg:max-w-none lg:justify-self-auto lg:self-center lg:before:absolute lg:before:inset-y-0 lg:before:-left-10 lg:before:border-l lg:before:border-dashed lg:before:border-border lg:before:content-['']"
          >
            {/* Soft terracotta wash behind the frame — the cover's aurora,
                gathered around the photograph. */}
            <div
              aria-hidden="true"
              className="absolute -inset-10 -z-20 bg-[radial-gradient(60%_55%_at_50%_38%,rgba(199,92,55,0.12),transparent_72%)] blur-2xl"
            />

            {/* ── The 3D stage ───────────────────────────────────────────
                The card turns to face the reader: it starts lying back and set
                behind the page (rotateX/rotateY, pushed away on z), then rises
                and squares up. `transform-3d` is what makes it read as depth
                rather than a flat skew — it gives the layers inside a shared 3D
                space, so the dashed plate sitting at -28px genuinely parallaxes
                against the frame through the swing instead of being painted
                flat onto it.

                NOTHING IN THIS SUBTREE MAY WAIT ON JS. It holds the LCP
                element. An `opacity: 0` start renders into the SSR HTML and
                keeps the portrait invisible until hydration runs the tween —
                ~1.65s of LCP render delay, the last time it was tried. The
                entrance is therefore a CSS wipe (`.hero-portrait-reveal`),
                which begins as soon as the stylesheet parses rather than when
                React boots, and the stage below no longer animates at all.
                Measured after the change: LCP still lands on this image, still
                equal to FCP. Keep opacity — and Framer entrances — out of here.

                The stage keeps its perspective even though it no longer moves:
                the dashed plate inside sits at translate-z, and that depth is
                what this shared 3D space buys it. */}
            <motion.div
              style={{ transformPerspective: 1400, transformStyle: "preserve-3d" }}
              className="relative"
            >
              {/* Hover story: the portrait recedes (soft zoom + fade), and the
                  project reel from the earlier cover drifts up in its place —
                  hover off returns the portrait. Pure CSS, so touch devices and
                  keyboard users simply keep the portrait. */}
              <motion.div
                className="group relative transform-3d"
                style={
                  tilting
                    ? { rotateX, rotateY, transformPerspective: 1100 }
                    : undefined
                }
              >
                {/* Offset plate — a dashed hairline frame peeking out behind the
                    bottom-right corner, rhyming with the page's guide rails. It
                    eases further out as the frame is hovered.

                    `-translate-z-7` is what the 3D stage above buys: the plate
                    sits 28px behind the photograph in the shared space, so it
                    slides against the frame on its own through the entrance
                    swing and under the pointer tilt. Real parallax, no second
                    animation to keep in sync.

                    The depth is repeated on the hover state because Tailwind's
                    `translate-x/y` utilities emit the two-value `translate`
                    shorthand, which drops the z component. Without it the plate
                    snaps flat onto the card the moment the frame is hovered —
                    exactly when the tilt engages. */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 -translate-z-7 translate-x-4 translate-y-4 rounded-4xl border border-dashed border-border-strong transition-transform duration-500 ease-out group-hover:-translate-z-7 group-hover:translate-x-5 group-hover:translate-y-5"
                />
                {/* The wipe lives on its own wrapper, outside the card. The
                    card owns `transform` for its hover lift, and the reveal
                    animates `transform` too — sharing one element would mean
                    the hover and the entrance overwriting each other. Wrapping
                    also leaves the dashed plate above unclipped, so it keeps
                    parallaxing in the 3D space instead of being cut off. */}
                <div className="hero-portrait-reveal">
                  <div className="rounded-4xl bg-linear-to-br from-accent/70 via-accent/15 to-border p-[3px] shadow-card transition-[transform,box-shadow] duration-500 ease-out group-hover:-translate-y-1.5 group-hover:shadow-glow">
                    <figure className="relative aspect-[3/4] overflow-hidden rounded-[calc(2rem-3px)] bg-surface">
                      {/* The bleed is the parallax's headroom — the photo drifts
                          inside it, so no edge of the frame is ever uncovered. */}
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
                          sizes="(min-width: 1280px) 30rem, (min-width: 1024px) 28rem, (min-width: 640px) 22rem, 18rem"
                          className="object-cover transition-[transform,opacity] duration-500 ease-out group-hover:scale-[1.06] group-hover:opacity-0"
                        />
                      </motion.div>

                      {/* Project reel — fades in a beat after the portrait recedes */}
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
                                  // Taller-than-wide crop: full frame width, 4:5 height,
                                  // object-cover trims the landscape source.
                                  className="relative aspect-4/5 w-full overflow-hidden rounded-xl border border-border bg-surface shadow-card"
                                >
                                  <Image
                                    src={item.src}
                                    alt=""
                                    fill
                                    quality={90}
                                    // The 4:5 card center-crops these 4:3 shots,
                                    // so the browser needs ~1.67× the card's width
                                    // (1.25 × 4/3) — down from 2.9× back when this
                                    // reel carried a 2.29:1 screenshot.
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

                      {/* Specular sheen — a soft highlight sliding across the glass
                          with the cursor. Its own transform only, so it composites
                          alongside the tilt instead of repainting the photograph. */}
                      {tilting && (
                        <motion.div
                          aria-hidden="true"
                          className="pointer-events-none absolute -left-[15%] -top-[15%] z-10 h-[130%] w-[130%] bg-[radial-gradient(closest-side,rgba(255,255,255,0.32),rgba(255,255,255,0)_72%)] opacity-0 mix-blend-overlay transition-opacity duration-500 ease-out group-hover:opacity-100"
                          style={{ x: sheenX, y: sheenY }}
                        />
                      )}
                      {/* Arrival gleam — one pass of light across the glass as
                          the card squares up, landing on the tail of the swing.
                          It also teaches the sheen: a reader who never moves the
                          cursor here still sees the frame catch the light once.

                          Transform-only, so it stays clear of the LCP guard —
                          it starts clipped off the left edge and ends clipped off
                          the right, never needing an opacity keyframe.

                          Gated by prop rather than by mounting: `useReducedMotion`
                          reads the real preference on the first CLIENT render but
                          always false on the server, so `{!reduceMotion && …}`
                          would hand a reduced-motion visitor a node the server
                          rendered and the client does not. Same reason the rest of
                          this file gates `initial`/`animate` instead. */}
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

            {/* CTA — the hero's path into the work, floating over the frame's
                bottom edge like a magazine cover line */}
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
              animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
              transition={{ duration: DURATION.base, ease: EASE.out, delay: 1.05 }}
              className="absolute inset-x-0 -bottom-6 z-10 hidden justify-center lg:flex"
            >
              <MagneticButton>
                <Link
                  href={prologue.reel.href}
                  className="group/cta flex items-center gap-3 rounded-full bg-ink py-2.5 pl-6 pr-2.5 text-sm font-medium text-ink-text shadow-raised ring-hairline-ink transition-colors duration-200 hover:bg-ink-raised"
                >
                  {prologue.reel.cta}
                  <span className="flex size-9 items-center justify-center rounded-full bg-white/10 transition-colors duration-200 group-hover/cta:bg-accent group-hover/cta:text-accent-fg">
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </span>
                </Link>
              </MagneticButton>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ── Scroll cue — a thin line drawing downward ───────────────── */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-7 flex flex-col items-center gap-3"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={reduceMotion ? undefined : { opacity: 1 }}
        transition={{ duration: DURATION.base, ease: EASE.out, delay: 1.3 }}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">
          {prologue.scrollCue} · Chapter 01
        </span>
        <motion.span
          className="block h-10 w-px origin-top bg-text/25"
          animate={reduceMotion ? undefined : { scaleY: [0, 1, 1], opacity: [0, 1, 0] }}
          transition={
            reduceMotion
              ? undefined
              : { duration: 2.2, ease: EASE.inOut, times: [0, 0.45, 1], repeat: Infinity, repeatDelay: 0.4 }
          }
        />
      </motion.div>
    </section>
  );
}
