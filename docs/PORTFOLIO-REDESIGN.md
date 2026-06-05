# Portfolio Redesign Blueprint — Mohammed Rinshad M I

**Positioning:** AI-native Mobile & Full-Stack Engineer (evidence-backed)
**Architecture:** Hybrid — rich smooth-scroll homepage + key sub-pages
**Aesthetic:** Editorial · luxury-minimal · dark · engineering-grade
**Stack target:** Next.js 16.2.6 · React 19 · Tailwind v4 · Framer Motion 12 · Lenis

> This is a design + UX strategy blueprint. It is the source of truth for the next
> implementation session. No app code is written here. **Before implementing, read the
> relevant guides in `node_modules/next/dist/docs/` (per AGENTS.md) — this Next.js build
> has breaking changes vs. training data.**

---

## Table of Contents

0. [Design North Star & Positioning Spine](#0-design-north-star--positioning-spine)
1. [Site Architecture](#1-site-architecture)
2. [Homepage Design](#2-homepage-design)
3. [Project Showcase Design](#3-project-showcase-design)
4. [Visual Design System](#4-visual-design-system)
5. [Motion Design](#5-motion-design)
6. [Modern Components](#6-modern-components)
7. [Developer-Focused Personal Brand](#7-developer-focused-personal-brand)
8. [Case Study Template](#8-case-study-template)
9. [Next.js Implementation Plan](#9-nextjs-implementation-plan)
10. [Final Deliverable — Wireframes & Rationale](#10-final-deliverable--wireframes--rationale)
- [Appendix A — Paste-ready design tokens](#appendix-a--paste-ready-design-tokens-globalscss)
- [Appendix B — Content reconciliation (data.ts ↔ résumé)](#appendix-b--content-reconciliation)
- [Appendix C — Migration map (current → target)](#appendix-c--migration-map-current--target)

---

## 0. Design North Star & Positioning Spine

### 0.1 The one-sentence positioning (the spine everything hangs from)

> **AI-native Mobile & Full-Stack Engineer.** I design and ship streaming AI chat, voice
> interfaces, and real-time apps — from Swift/Kotlin native modules to Node back-ends — to
> the App Store, Play Store, and the web.

Every headline, project frame, and section below ladders up to this. Your *rare, defensible
edge* is the intersection most engineers can't claim: **production LLM/voice UX × real native
mobile depth × full-stack delivery, all shipped to stores.** We lead with that, not with years.

### 0.2 What "premium" actually means here (and how we earn it without an agency look)

We synthesize six references, then add one thing none of them have:

| Reference | What we borrow | Where we use it |
|---|---|---|
| **Apple** | Reverent whitespace, product-as-hero, confident restraint | Section rhythm, hero scale |
| **Linear** | Precision borders, engineering texture, subtle gradients | Cards, nav, micro-states |
| **Vercel** | Geist type, black canvas, mono accents, geometric calm | Type system, footer, docs feel |
| **Stripe** | Editorial gradients, depth, world-class diagrams | Case-study architecture diagrams |
| **Formix** | Editorial typographic scale, luxury minimalism, scroll storytelling | Headlines, scroll reveals |
| **Raycast** | Playful-premium dark, accent pops, soft radii | CTAs, badges, hover states |

**The unique twist — the "AI-native signature":** cheap-to-render motifs that *show* what you
build instead of decorating: **token-stream text reveals** (text appears like an LLM
streaming), **agent-trace connector lines** in case studies, a **voice waveform** accent for
the voice-AI work, and **live-presence dots**. These become your visual fingerprint and they
cost almost nothing on the GPU.

### 0.3 Hard constraint that shapes the whole system: perform on a memory-constrained machine

Your dev machine swaps under heavy builds and the 3D `HeroScene` was disabled on purpose.
So this design is **deliberately GPU-light and build-light**:

- **No WebGL / no three.js in the critical path.** The hero "depth" comes from layered CSS
  radial gradients + an SVG grain/noise overlay + transform-only motion.
- **Animate only `transform` and `opacity`** (compositor-friendly). Avoid animating `filter:
  blur`, `box-shadow`, `width/height`, or large `background` repaints in loops.
- **No infinite render loops.** The old 3D scene ran at 60fps even offscreen. Everything here
  is enter-once-on-scroll or pointer-driven, never a perpetual rAF.
- **One signature gradient, reused** as a CSS variable — not per-section bespoke gradients.
- three.js, @react-three/fiber, @react-three/drei can be **removed from `package.json`** (saves
  ~38MB / 1,150 files of install + compile). Keep `HeroScene.tsx` archived if you want to
  revisit on a beefier machine.

### 0.4 Design principles (the rules we will not break)

1. **Restraint is the luxury.** Near-monochrome canvas; the accent covers **≤ 8%** of any
   viewport. Color is a scalpel, not a paint roller. (Your current site is "violet
   everywhere" — that reads template, not premium.)
2. **Type carries the design.** Editorial scale + a serif accent does the heavy lifting; the
   UI chrome stays quiet.
3. **Every claim is evidence-backed.** Numbers come from the résumé (20+ apps, 35% latency,
   30% delivery, MTTR < 1h, zero reconciliation failures). No vanity metrics.
4. **Engineer, not agency.** Show architecture diagrams, latency budgets, and trade-offs — the
   stuff a Tech Lead/CTO actually evaluates. That's the conversion lever for your audience.
5. **Motion has meaning.** Reveals mimic streaming/agentic behavior; nothing moves just to move.

---

## 1. Site Architecture

**Chosen model: Hybrid** — a strong scroll-narrative homepage plus dedicated routes where depth
genuinely helps (individual case studies, writing, a deeper about). Thin pages from the
original 9-page brief are folded into sections to avoid an "agency sitemap" with empty rooms.

### 1.1 Route map

```
/                     Home — the full narrative (scroll storytelling)
/work                 Projects index — filterable grid of all work
/work/[slug]          Case study — deep, per-project (the conversion centerpiece)
/about                About — long-form story, stack, ways of working, timeline
/blog                 Writing index (MDX; you already have one post)
/blog/[slug]          Article
/contact              Standalone contact (also a homepage section; route = shareable + SEO)
  ├─ open-source  → folded into /about + a homepage strip (not its own page yet)
  └─ skills       → homepage section + /about; not a standalone page
```

### 1.2 Purpose of each surface

| Surface | Job-to-be-done | Primary audience | Success signal |
|---|---|---|---|
| **Home** | In 8 seconds: who you are, the proof, the work. Then guide the scroll to the CTA. | Recruiters, all | Scroll depth, “View work” + “Resume” clicks |
| **/work** | Let a Tech Lead scan *everything* and pick what to read deeply. | Tech Leads, EMs | Click into a case study |
| **/work/[slug]** | Prove senior judgment: problem → architecture → trade-offs → measured results. | Tech Leads, CTOs | Time-on-page, contact after read |
| **/about** | Build trust + human story; full stack inventory; how you work; timeline; OSS. | EMs, Founders | Resume download, contact |
| **/blog** | Demonstrate communication + depth (huge for remote EU/UK/Dubai hiring). | Tech Leads, peers | Read, share, return visits |
| **/contact** | Remove every gram of friction to start a conversation. | Recruiters, Founders | Form submit / email / calendar |

**Why this beats the literal 9-page brief:** separate `Experience`, `Skills`, `Open Source`,
`Case Studies` *and* `Projects` pages would spread thin content across many near-empty routes —
the opposite of premium. Depth concentrated in `/work/[slug]` reads far more senior, and it's
faster to ship and maintain on your machine.

### 1.3 Global navigation model

- **Top nav (homepage):** floating, minimal — `Work · About · Writing · Resume` + a primary
  `Let's talk` button. Section anchors on home; real links elsewhere.
- **Persistent footer** (every page): big wordmark, primary links, social, availability badge,
  email, "Built with Next.js + Tailwind — view source."
- **Command-style touch (optional, on-brand):** a `⌘K`-flavored "Jump to" affordance is very
  Linear/Raycast and signals "engineer." Mark as a phase-2 nicety, not launch-critical.

---

## 2. Homepage Design

The homepage is a **single vertical story in 9 beats**. Each beat answers the next question a
skeptical hiring manager is forming.

```
1. Hero ............... "Who are you and why should I care?"
2. Logo/Proof strip ... "Is this real?"  (stores, stats)
3. Selected Work ...... "Show me."        (3 featured case studies)
4. Capabilities ....... "What exactly can you do?"
5. Signature: AI-native "What's your edge?" (streaming/voice/native motif)
6. Experience timeline  "Where have you done it?"
7. Testimonials ....... "Does anyone vouch for you?"
8. Writing preview ..... "Can you think + communicate?"
9. Contact CTA ........ "Okay — how do I reach you?"
```

### Beat 1 — Hero (editorial, asymmetric, left-aligned)

Replace the centered, gradient-name hero with an **editorial left-aligned** statement at
oversized scale, with a quiet right-column "spec sheet."

- **Eyebrow (mono):** `AI-NATIVE · MOBILE + FULL-STACK · 2.5 YRS · 20+ SHIPPED`
- **H1 (display, clamp ~64–104px):**
  > **I build AI-native apps —**
  > **shipped to real pockets.**
  >
  > with *streaming* and *voice* set in the **Instrument Serif italic** accent.
- **Sub (body, max ~58ch):** "React Native engineer shipping real-time AI chat, voice AI, and
  full-stack products to iOS, Android, and the web — native modules to Node back-ends, owned
  end-to-end."
- **CTAs:** Primary `View selected work →` (accent, magnetic). Secondary `Download résumé`
  (ghost). Tertiary inline: GitHub · LinkedIn.
- **Right rail "spec card" (mono):** a small monospaced fact list — `LOCATION  Palakkad, IN`,
  `STATUS  ● Open to roles`, `FOCUS  AI UX · Mobile · Realtime`, `STORES  App Store · Play`.
- **Background:** one reusable radial-gradient "aurora" (low opacity) + SVG grain. The H1
  reveals as a **token-stream** (words fade up left-to-right like an LLM completing) — the
  signature motif, done with `opacity`/`y` only.
- **Scroll cue:** keep the subtle bouncing arrow (it works), restyled.

**Why:** centered hero = portfolio template. Left-aligned editorial + mono spec card = the
Linear/Stripe/Formix register, and it reads "senior engineer," not "fresh grad."

### Beat 2 — Proof strip (social proof, immediately under the fold)

Not a logo wall (you can't show client logos) — a **"shipped" proof bar**:

```
●  App Store + Play Store        20+        35%           30%            < 1 hr
   5+ apps shipped solo          apps       lower API      faster        crash MTTR
                                 in prod    latency        delivery
```

- Numbers **count up** once on scroll (cheap).
- Sub-line: "Production apps with real users — billing reconciled to zero failures."
- Optional micro-trust: "App Store" / "Google Play" / "Expo EAS" wordmarks as quiet mono
  labels (you legitimately ship through these).

### Beat 3 — Selected Work (the centerpiece)

3 featured case-study cards (editorial, not the current alternating block). Each card is a
*doorway* into `/work/[slug]`. See [§3](#3-project-showcase-design) for the card anatomy.
Order by strength:

1. **AI Life Assistant Super App** — voice-first, streaming LLM, Whisper, native audio module.
2. **AI-Powered Real-Time Collaboration Platform** — Yjs CRDT, WebRTC voice notes, inline AI.
3. **Cloud-Native IoT Analytics Dashboard** — WebSocket telemetry, offline sync, MTTR < 1h.

Footer link: `View all work →` to `/work`.

### Beat 4 — Capabilities (replaces the % "skill bars")

Kill the percentage skill bars (recruiters distrust "TypeScript 92%"). Replace with a
**capability matrix** grouped by the way you actually deliver — see [§6.4](#64-skills--capability-matrix).
Four pillars, each with concrete tools as quiet mono chips:

- **AI on Mobile & Web** — streaming chat, voice AI (Whisper), tool-calling, RAG, on-device.
- **Native Mobile** — React Native, Expo/EAS, Swift/Kotlin modules, push, biometrics, IAP.
- **Real-Time & Media** — WebSockets, WebRTC, CRDT (Yjs), offline sync, 60fps interactions.
- **Full-Stack & Delivery** — Node/Express, REST, Mongo/SQL/Redis, CI/CD, store release.

### Beat 5 — The AI-native signature section (your differentiator, made visual)

A dedicated editorial moment that *demonstrates* the edge. Left: a short manifesto paragraph.
Right: a cheap, looping-on-view **"streaming + voice" motif** — a faux chat bubble that types
out a token stream, a small CSS waveform, and an "agent trace" line (`tool: search → call →
stream`). This is the screen people screenshot. All `transform`/`opacity`, no canvas.

Copy: *"Most engineers bolt AI on. I design for it — streaming states, partial hydration,
cancellation, tool-call traces, and voice latency budgets, on devices that ship to stores."*

### Beat 6 — Experience timeline

A single, well-told role (IOSS, Nov 2023 → present) rendered as a **vertical timeline** with a
scroll-drawn connector line (`scaleY`), achievements as crisp bullets with inline metric chips.
Education + BBA as a compact coda. See [§6.3](#63-experience-timeline).

### Beat 7 — Testimonials

You don't have quotes yet — **design the slot now, fill later** (it's high-conversion for EU/UK
recruiters). Until you collect them, run a tasteful **"LinkedIn recommendation" placeholder
strategy**: 1–2 short quotes from your lead/manager (ask them), shown as editorial pull-quotes.
If truly none exist at launch, **omit the section** rather than fake it (principle 3). See
[§6.6](#66-testimonials).

### Beat 8 — Writing preview

3 latest MDX posts as quiet cards (you already have `nextjs-performance-patterns.mdx`). Signals
communication ability — disproportionately valuable for remote/relocation hiring.

### Beat 9 — Contact CTA

Big editorial close: an oversized line — *"Have something worth building? Let's talk."* — plus
the availability badge, response-time promise ("within 24h"), and the form (or a link to
`/contact`). Reuse your existing solid form; restyle to the new tokens.

---

## 3. Project Showcase Design

### 3.1 Card anatomy (homepage "Selected Work" + `/work` grid)

```
┌──────────────────────────────────────────────────────────┐
│  ▢ media (aspect 16:10) — device frame / app screenshot   │
│     · subtle parallax on scroll · accent glow on hover     │
│                                                            │
│  PLATFORM · YEAR                                  (mono)   │  ← eyebrow
│  AI Life Assistant Super App                  (display)   │  ← title
│  Voice-first AI copilot, streaming + on-device  (body)    │  ← tagline
│                                                            │
│  [React Native] [Whisper] [Claude] [Native Modules]       │  ← tech chips (max 4 + "＋3")
│                                                            │
│  ▸ 60fps   ▸ <1s latency   ▸ iOS + Android      (mono)    │  ← 3 inline metrics
│                                                            │
│  Read case study →                                         │  ← whole card is the link
└──────────────────────────────────────────────────────────┘
```

- **Hover:** card lifts `y:-6`, border brightens to accent/20, media gets a soft accent glow +
  1.03 scale on the image only, `Read case study →` arrow slides `x:+4`. (Spring, transform-only.)
- **Featured (homepage):** larger, alternating media/text columns (you already do this — keep
  the rhythm, upgrade the type + restraint).
- **Grid (`/work`):** 2-up on desktop, uniform card height, filter chips on top
  (`All · AI · Mobile · Real-time · Full-stack`).

### 3.2 What each case study must contain (the senior-signal checklist)

For every project, the `/work/[slug]` page carries the full story. Source content is in your
résumé; map it like this:

| Block | AI Life Assistant (example mapping) |
|---|---|
| **Problem** | Users want a voice-first assistant that feels instant; mobile adds latency, battery, offline, and store constraints. |
| **Architecture** | RN client → streaming LLM (Claude/OpenAI) over WebSockets; native Swift/Kotlin audio module for low-latency mic + VAD; Whisper transcription; TTS playback; offline-first SQLite sync; FCM/APNs for proactive actions. *(Diagram, see §8.)* |
| **Tech stack** | React Native · TypeScript · OpenAI/Claude API · Whisper · WebSockets · Reanimated · Native Modules (Swift/Kotlin) · SQLite |
| **Challenges** | Low-latency mic capture + VAD on two platforms; partial-message hydration; cancellation mid-stream; keeping 60fps while streaming + animating. |
| **Performance** | 60fps message animations (Reanimated on UI thread); sub-second perceived latency via streaming + optimistic UI; on-device VAD to cut round-trips. |
| **Business impact** | Voice-first flow shipped to stores; reusable agent-state primitives reused across apps (ties to the 30% delivery win). |
| **Screenshots** | Device-framed: chat streaming, voice capture, agent trace. *(Placeholders until you export real ones.)* |
| **Metrics** | `60fps` · `<1s latency` · `iOS + Android` · `3 input modes` |

> **Note:** screenshots are the one asset gap. Until you export real device captures, use the
> **device-frame placeholder** component (a phone/tablet bezel around a tasteful gradient +
> the app name) so layouts look intentional, never broken. Replace as you capture them.

### 3.3 Metrics treatment

Metrics render as **mono "stat ticks"** (`▸ 60fps`) inline, and as larger **count-up stat
cards** at the top of each case study. Keep them factual and tied to the résumé.

---

## 4. Visual Design System

All values below are paste-ready. Full token block is in [Appendix A](#appendix-a--paste-ready-design-tokens-globalscss).

### 4.1 Typography

**Font pairing (all available via `next/font/google`, zero-friction):**

| Role | Font | Why | Usage |
|---|---|---|---|
| **Display / headings** | **Geist** | Vercel's grotesk — engineering-grade, neutral, premium | H1–H3, big numbers |
| **Editorial accent** | **Instrument Serif** (italic) | High-contrast serif for *one or two* emphasized words | Hero accent words, pull-quotes |
| **Body / UI** | **Inter** (keep) | Workhorse legibility | Paragraphs, labels, forms |
| **Mono / technical** | **Geist Mono** | Eyebrows, metrics, kbd, code, "engineer texture" | Eyebrows, stats, chips, code |

> Premium alternative if you want more signature: swap Geist → **General Sans** or **Satoshi**
> (Fontshare, self-hosted via `next/font/local`). Keep Instrument Serif + Geist Mono. Lead with
> the Google set for launch; it ships today with no asset wrangling.

**Type scale (fluid, `clamp()` — editorial jumps, not a timid ramp):**

| Token | clamp() | ~Desktop | Use |
|---|---|---|---|
| `display-2xl` | `clamp(3.5rem, 8vw, 6.5rem)` | 104px | Hero H1 |
| `display-xl` | `clamp(2.75rem, 5.5vw, 4.5rem)` | 72px | Section openers, case-study H1 |
| `display-lg` | `clamp(2.25rem, 4vw, 3.25rem)` | 52px | Big statements |
| `h2` | `clamp(1.75rem, 3vw, 2.5rem)` | 40px | Section titles |
| `h3` | `1.5rem` | 24px | Card titles |
| `body-lg` | `1.125rem` | 18px | Hero sub, intros |
| `body` | `1rem` | 16px | Default |
| `body-sm` | `0.875rem` | 14px | Secondary |
| `mono-eyebrow` | `0.75rem` / `0.14em` tracking / uppercase | 12px | Eyebrows, labels |

**Hierarchy rules:**
- **Tracking:** display `-0.03em` (tight, modern); mono eyebrows `+0.14em` (airy, technical).
- **Leading:** display `0.95–1.05`; body `1.6–1.7` (generous, editorial).
- **Weights:** Geist 500/600/700 for display; Inter 400/500 body; Geist Mono 400/500.
- **Measure:** body max `60–66ch`. Never full-bleed paragraphs.
- **Color of type = hierarchy:** primary `#FAFAF9`, secondary `#A1A1AA`, tertiary `#71717A`.
- **Serif accent rule:** at most **one serif phrase per viewport**. It's seasoning, not a font.

### 4.2 Color system

A near-monochrome "ink" canvas + **one** restrained accent. Default accent = a refined electric
indigo (evolves your current violet into something less "template," more "signal").

**Neutrals (ink ramp):**

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#08080A` | Page canvas (near-black, hair of cool) |
| `--bg-subtle` | `#0C0C0F` | Alternating section band |
| `--surface` | `#111114` | Cards, inputs |
| `--surface-raised` | `#17171B` | Hover / popover / raised |
| `--border` | `rgba(255,255,255,0.08)` | Default hairline |
| `--border-strong` | `rgba(255,255,255,0.14)` | Emphasis / focus |
| `--text` | `#FAFAF9` | Primary text |
| `--text-secondary` | `#A1A1AA` | Body secondary |
| `--text-tertiary` | `#71717A` | Captions, eyebrows |
| `--text-muted` | `#52525B` | Disabled, faint |

**Accent — "Electric Indigo" (default, recommended):**

| Token | Hex | Use |
|---|---|---|
| `--accent` | `#6E56F7` | Primary actions, links, focus |
| `--accent-hover` | `#7C6BFF` | Hover |
| `--accent-press` | `#5B45E0` | Active/press |
| `--accent-fg` | `#FFFFFF` | Text on accent |
| `--accent-subtle` | `rgba(110,86,247,0.10)` | Tinted chip/badge bg |
| `--accent-border` | `rgba(110,86,247,0.22)` | Tinted borders |
| `--accent-glow` | `rgba(110,86,247,0.35)` | CTA glow, media glow |

**Two alternative accent directions (documented so you can choose — swap the 7 tokens above):**

| Direction | Core hex | Personality | Trade-off |
|---|---|---|---|
| **Electric Indigo** *(default)* | `#6E56F7` | AI, modern, trustworthy | Closest to current — safe evolution |
| **Signal Lime** (Raycast/Linear) | `#C4F042` | High-energy, unmistakably "engineer" | Less "luxury," needs careful contrast |
| **Ember Gold** (editorial luxury) | `#E8B339` | Warm, premium, magazine | Reads less "tech," more "creative" |

> **Recommendation:** ship **Electric Indigo**. It's a confident evolution of your current
> violet (so it feels intentional, not a reskin), pairs naturally with "AI," and survives the
> "≤8% of viewport" restraint rule. Keep Signal Lime in your back pocket for a v2 refresh.

**Signature gradient (one, reused everywhere):**
```
--aurora: radial-gradient(60% 50% at 30% 25%, rgba(110,86,247,0.18), transparent 70%),
          radial-gradient(50% 50% at 78% 60%, rgba(56,40,180,0.14), transparent 70%);
```

**Semantic / state:** success `#34D399`, warning `#FBBF24`, danger `#F87171`, "live" dot
`#34D399` (your existing green pulse — keep).

### 4.3 Spacing system (4px base)

`--space-*`: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 · 160 · 192` (px).

- **Section vertical rhythm:** `clamp(96px, 12vw, 192px)` top/bottom. Premium = *more* air than
  feels comfortable (you're at `py-24`/96px — push to 128–160 on desktop).
- **Stack gaps:** eyebrow→title `16`; title→body `24`; body→action `32`.
- **Card padding:** `24` (mobile) → `32–40` (desktop).
- **Container gutter:** `24` mobile, `48` desktop.

### 4.4 Grid system

- **Container:** max-width **1200px** content (`--container`), **1440px** for full-bleed media
  bands. (You're at `max-w-6xl`/1152px — nudge to 1200.)
- **Columns:** 12-col, 24–32px gutter. Editorial layouts use **asymmetric splits**: hero
  `7/5`, signature section `6/6` offset, case-study body `8` (text) within a 12 with a sticky
  `3`-col meta rail.
- **Baseline:** 8px vertical grid; align section paddings + type leading to it.
- **Breakpoints** (Tailwind defaults, used intentionally):
  `sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536`. Design **mobile-first** (it's a mobile
  engineer's site — the phone view must be flawless).

### 4.5 Border radius

| Token | px | Use |
|---|---|---|
| `--r-sm` | 8 | Chips, inputs, small buttons |
| `--r-md` | 12 | Inputs, secondary cards |
| `--r-lg` | 16 | Cards (default) |
| `--r-xl` | 20 | Feature cards, media frames |
| `--r-2xl` | 28 | Hero media, large panels |
| `--r-full` | 9999 | Pills, badges, avatars |

Consistency rule: **one radius family per component tier.** Cards = `lg/xl`, controls = `sm/md`,
pills = `full`. (Mixing radii is the #1 "template" tell.)

### 4.6 Shadow / elevation system

Dark UIs get depth from **borders + inset highlights + a single accent glow**, *not* heavy drop
shadows (those muddy on black).

| Token | Value | Use |
|---|---|---|
| `--elev-hairline` | `inset 0 1px 0 rgba(255,255,255,0.06)` | Top inner highlight on cards |
| `--elev-card` | `0 1px 2px rgba(0,0,0,0.4), 0 8px 24px -12px rgba(0,0,0,0.5)` | Resting card |
| `--elev-raised` | `0 12px 40px -16px rgba(0,0,0,0.6)` | Hover / popover |
| `--glow-accent` | `0 0 0 1px var(--accent-border), 0 8px 32px -8px var(--accent-glow)` | Primary CTA, focused media |
| `--ring-focus` | `0 0 0 2px var(--bg), 0 0 0 4px var(--accent)` | Keyboard focus |

---

## 5. Motion Design

**Philosophy:** motion *demonstrates* the product (streaming, presence, agentic). It's fast,
transform-only, and enters once. Respect `prefers-reduced-motion` (instant, no transforms).

### 5.1 Easing + duration tokens

```ts
// lib/animation.ts — evolve your existing tokens to these
export const EASE = {
  out:     [0.16, 1, 0.30, 1],   // "expo-out" — the premium reveal curve (Linear/Vaul feel)
  inOut:   [0.65, 0, 0.35, 1],   // symmetric, for moves/toggles
  emphasis:[0.22, 1, 0.36, 1],   // hero / large entrances
  spring:        { type: "spring", stiffness: 320, damping: 32 }, // cards, magnetic
  springSnappy:  { type: "spring", stiffness: 420, damping: 26 }, // buttons, taps
} as const;

export const DURATION = {
  micro: 0.15,  // hover, taps, chips
  base:  0.30,  // most UI transitions
  reveal:0.65,  // scroll reveals
  hero:  0.95,  // hero entrance, big statements
  slow:  1.20,  // background drifts, marquee step
} as const;
```

> Your current `EASE.out = [0,0,0.2,1]` is fine but a touch flat. `[0.16,1,0.3,1]` is the curve
> that makes premium sites feel "expensive" — a fast start with a long, soft settle.

### 5.2 Animation specs (per interaction)

| Interaction | Spec | Duration · Easing |
|---|---|---|
| **Hero entrance (token-stream)** | H1 words `opacity 0→1, y 12→0`, staggered `0.045s` L→R (mimics LLM streaming); eyebrow + sub + CTA follow with `0.08s` stagger | `hero` (0.95) · `emphasis` |
| **Scroll reveal (default)** | `opacity 0→1, y 24→0`, trigger at ~15% in view, **once** | `reveal` (0.65) · `out` |
| **Section heading reveal** | Eyebrow fades; title does a **line-mask reveal** (`y 100%→0` inside `overflow:hidden`) | `reveal` · `emphasis` |
| **Stagger group** | children `staggerChildren 0.06`, `delayChildren 0.05` | — |
| **Card hover** | `y -6, scale 1.015`, border→accent/22, inner media `scale 1.03`, arrow `x +4` | `spring` |
| **Magnetic button** | translate toward cursor up to `~8px`, label `scale 1.03`; release → spring home; tap `scale 0.97` | `springSnappy` |
| **Stat count-up** | number tweens `0→value` over `1.1s` on first view; suffix static | `1.1s` · `out` |
| **Nav on scroll** | at `>20px`: bg `transparent→bg/80`, `backdrop-blur`, hairline border in; height `64→56` | `base` · `out` |
| **Mobile menu** | full-screen overlay; backdrop fade; links stagger up `0.05s`; panel `clip-path`/`y` in | `base` · `emphasis` |
| **Page transition** (route change) | exiting `opacity→0, y -8`; entering `opacity 0→1, y 16→0` | `base` · `out` |
| **Case-study hero media** | parallax `y` via scroll progress (translate only, clamp range) | scroll-linked |
| **Signature stream motif** | typewriter token reveal loop **only while in view** (IntersectionObserver gates the loop; pause offscreen) | `slow` step |
| **Live presence dots** | 2–3px opacity pulse, `1.8s` ease-in-out (your existing green pulse pattern) | `1.8s` |

### 5.3 Performance guardrails (non-negotiable on your machine)

- Animate **only `transform` + `opacity`**. No animated `blur`, `box-shadow`, `width/height`.
- Gate every loop with IntersectionObserver — **nothing animates offscreen** (the old 3D
  bug). Use Framer's `whileInView` + `viewport={{ once: true }}` for reveals.
- Prefer CSS `@keyframes` for tiny idle loops (pulse, marquee) over JS rAF.
- `will-change: transform` only on actively-animating nodes; remove after.
- Honor `prefers-reduced-motion: reduce` → opacity-only or no motion.

---

## 6. Modern Components

Component inventory with anatomy + states. Maps to `components/` (see [§9.3](#93-component-structure)).

### 6.1 Navbar

- **Resting (top):** transparent, wordmark `Rinshad●` (accent dot), links right, `Let's talk`
  pill (accent). Generous height (64px).
- **Scrolled:** condenses to 56px, `bg/80` + `backdrop-blur-xl` + bottom hairline (you do this —
  keep, restyle). Active-section underline indicator (`layoutId` magic-line) on home.
- **States:** link hover → `text-secondary→text`; focus-visible ring; reduced-motion safe.

### 6.2 Project / Case-study card — see [§3.1](#31-card-anatomy-homepage-selected-work--work-grid).

### 6.3 Experience timeline

```
│
●───  Full Stack Developer · IOSS                    Nov 2023 — Present
│     Calicut, Kerala · React Native · Full-Stack
│     ▸ Cut feature delivery 30% — cross-platform TS component library
│     ▸ Shipped streaming Claude/OpenAI chat + Whisper voice AI to stores
│     ▸ Led live JS→TS migration — killed a class of runtime errors
│     ▸ Native modules (Kotlin): geolocation, FCM/APNs push, biometrics
│     ▸ Stripe/PayPal billing — zero reconciliation failures
●───  BBA · SJES College (Bangalore North Univ.)     2019 — 2022
```

- Vertical connector **draws on scroll** (`scaleY 0→1`, transform-origin top).
- Node dots pulse subtly when their row enters view.
- Metric words (`30%`, `zero`) get an accent-tinted inline chip.

### 6.4 Skills / capability matrix

Replace % bars with a **4-pillar matrix**. Each pillar = a card with an icon, a one-line
description, and tech as **mono chips**. Source from résumé skills:

```
┌── AI on Mobile & Web ────────┐  ┌── Native Mobile ─────────────┐
│ Streaming chat · voice · RAG │  │ Cross-platform, store-ready  │
│ [Claude][OpenAI][Whisper]    │  │ [React Native][Expo/EAS]     │
│ [Vercel AI SDK][tool-calling]│  │ [Swift/Kotlin][FCM/APNs][IAP]│
└──────────────────────────────┘  └──────────────────────────────┘
┌── Real-Time & Media ─────────┐  ┌── Full-Stack & Delivery ─────┐
│ Live, offline-first, 60fps   │  │ APIs → release, owned        │
│ [WebSockets][WebRTC][Yjs]    │  │ [Node/Express][Mongo][SQL]   │
│ [Offline sync][Reanimated]   │  │ [Redis][CI/CD][Sentry]       │
└──────────────────────────────┘  └──────────────────────────────┘
```

Optional row: **AI workflow** (`Claude Code · Cursor · Copilot`) — honest, modern, and a
talking point with engineering leaders.

### 6.5 Contact form

You already have a strong RHF + Zod + nodemailer form — **keep the logic, restyle to tokens**.
Upgrades: floating labels, inline validation with the danger token, success state with a
checkmark spring (you have this), and a left "info rail" (email/phone/location + availability
badge — you have this). Add honeypot + basic rate-limit note for spam.

### 6.6 Testimonials

- **Format:** editorial pull-quotes (large serif open-quote, quote in `body-lg`, attribution in
  mono). 2–3 max. Optional gentle marquee if you get more.
- **Until you have real quotes:** omit, or use a single honest line from your manager/lead
  (ask for one LinkedIn recommendation — highest ROI pre-launch task).

### 6.7 Statistics cards

- Big number (`display-lg`, count-up) + mono label + optional sparkline/`▸` tick.
- Used in the proof strip and atop each case study.

### 6.8 Mobile menu

Full-screen overlay (not a dropdown): backdrop blur, oversized links (`display-lg`) that
stagger up, socials + résumé at the bottom, `Let's talk` CTA. Close on `Esc` + tap-out. This
is where a *mobile* engineer proves the mobile craft — make it the best part of the site.

### 6.9 Supporting primitives

`Badge` (availability/live), `Chip` (tech, mono), `Button` (primary/ghost/magnetic), `Eyebrow`
(mono label), `SectionHeading` (eyebrow + masked title + sub — you have this, upgrade),
`StatTick`, `DeviceFrame` (screenshot placeholder), `Marquee`, `Cursor-spotlight` (optional).

---

## 7. Developer-Focused Personal Brand

Voice: **confident, concrete, senior, no fluff.** Lead with verbs and numbers. Never "passionate
about clean code."

### 7.1 Positioning statement (the canonical one)

> **AI-native Mobile & Full-Stack Engineer.** I design and ship streaming AI chat, voice
> interfaces, and real-time apps — from Swift/Kotlin native modules to Node back-ends — to the
> App Store, Play Store, and the web.

### 7.2 Taglines (short, for nav/footer/OG)

1. *AI-native apps, shipped to real pockets.*
2. *Streaming AI · voice · real-time — engineered for mobile.*
3. *From Whisper to the App Store.*
4. *I build the apps where AI meets the App Store.*

### 7.3 Hero headline options (H1)

- **Primary:** *"I build AI-native apps — shipped to real pockets."*
- *"Mobile-first AI engineering, owned end-to-end."*
- *"Streaming AI. Native speed. Store-ready."*
- *"I turn LLMs and voice into apps people actually ship."*

> Pair with the serif-italic accent on one phrase, e.g. *I build **AI-native** apps — shipped
> to real* ***pockets.*** Keep the H1 ≤ 7 words per line, 2 lines max.

### 7.4 About section copy (editorial, first person)

> I'm Rinshad — a React Native engineer who builds **AI-native** mobile and full-stack
> products and ships them all the way to the store.
>
> Over the last 2.5 years I've shipped **20+ cross-platform apps** to the App Store and Play
> Store: real-time AI chat, voice assistants with Whisper transcription and TTS, CRDT
> collaboration, and live telemetry dashboards. I work the whole stack — Swift/Kotlin native
> modules and Reanimated on one end, Node/Express APIs, WebSockets, and billing on the other —
> and I own the release pipeline end-to-end: signing, store compliance, and production
> monitoring.
>
> I care about the parts users feel: sub-second streaming, 60fps interactions, offline that
> just works, and crashes caught before they spread (MTTR under an hour). I led a live
> **JS→TypeScript** migration that erased a recurring class of runtime errors, and I reconciled
> Stripe/PayPal billing to **zero failures**. AI isn't a bolt-on for me — I design for it:
> streaming states, cancellation, tool-call traces, and voice latency budgets.
>
> Based in Kerala, India — **open to mobile, AI-UX, and full-stack roles**, remote or relocation
> (EU/UK/Dubai).

### 7.5 Professional bio (50–80 words, for LinkedIn/OG/press)

> Mohammed Rinshad M I is an AI-native Mobile & Full-Stack Engineer with 2.5+ years shipping
> 20+ cross-platform apps to the App Store and Play Store. He specializes in production AI
> mobile experiences — streaming LLM chat, voice AI (Whisper), real-time/offline sync, and
> Swift/Kotlin native modules — and owns delivery end-to-end, from Figma to store release and
> production telemetry.

### 7.6 Micro-copy bank

- Availability: `● Open to roles — usually replies within 24h`
- CTA primary: `View selected work →` · `Read the case study →` · `Let's talk`
- Résumé: `Download résumé (PDF)`
- Footer sign-off: `Designed & built in Kerala. Next.js · Tailwind · Framer Motion.`
- 404: `This route streamed off into the void. → Back home`

---

## 8. Case Study Template (`/work/[slug]`)

A reusable 9-block structure. Every project uses the same skeleton so they read as a confident
body of work.

```
┌─ HERO ───────────────────────────────────────────────────────┐
│ eyebrow: PLATFORM · YEAR · ROLE                               │
│ H1 (display-xl): {Project title}                              │
│ one-line outcome (body-lg)                                    │
│ [stat tick] [stat tick] [stat tick]   ·   [Live] [GitHub]    │
│ ── full-bleed device-framed hero media (parallax) ──         │
├─ STICKY META RAIL (3-col) ─┬─ BODY (8-col) ───────────────────┤
│ Role / Timeline / Stack    │ 1. OVERVIEW                      │
│ Platforms / Links          │    2–3 sentences, the TL;DR      │
│ (sticky on scroll)         │ 2. PROBLEM                       │
│                            │    user + business + constraints │
│                            │ 3. RESEARCH / CONSTRAINTS         │
│                            │    what shaped the approach       │
│                            │ 4. ARCHITECTURE  ◀ diagram       │
│                            │    system diagram + data flow     │
│                            │ 5. IMPLEMENTATION                 │
│                            │    key decisions, code/diagrams   │
│                            │ 6. CHALLENGES                     │
│                            │    the hard parts + how solved    │
│                            │ 7. PERFORMANCE IMPROVEMENTS       │
│                            │    before→after, with numbers     │
│                            │ 8. RESULTS / IMPACT  ◀ stat cards │
│                            │ 9. LESSONS LEARNED                │
├────────────────────────────┴──────────────────────────────────┤
│ NEXT CASE STUDY → (prev/next pager)        ·   Contact CTA     │
└───────────────────────────────────────────────────────────────┘
```

**Block guidance:**
- **Overview:** the elevator version a CTO reads if they read nothing else.
- **Architecture:** the senior signal. Use a clean **SVG/Mermaid diagram** with the "agent
  trace" connector style (client → realtime → LLM/tooling → native module). Keep it
  black-canvas, hairline boxes, accent for the critical path.
- **Performance:** always a **before → after** with a real number from the résumé (latency
  -35%, re-renders -40%, MTTR < 1h, 60fps).
- **Lessons:** 2–3 honest takeaways. Shows reflection = seniority.
- **Data shape:** extend the `Project` type with optional `overview`, `research`,
  `architecture`, `challenges`, `performance`, `results`, `lessons`, `gallery[]`, `stack`
  (grouped). MDX per case study is a clean option (you already run MDX for blog).

---

## 9. Next.js Implementation Plan

> **First step every session: read `node_modules/next/dist/docs/` for the APIs you touch**
> (App Router, `next/font`, Metadata, dynamic, MDX). Per AGENTS.md this build diverges from
> training data — verify `metadata`, route handlers, and `generateStaticParams` signatures
> against the local docs before writing.

### 9.1 Section hierarchy (homepage render order)

`Hero → ProofStrip → SelectedWork → Capabilities → AINativeSignature → ExperienceTimeline →
Testimonials? → WritingPreview → ContactCTA`. (Drops the current `HowIWork` from the homepage
into `/about`; the 5-step process is good but mid-funnel — it belongs on the deeper page.)

### 9.2 Responsive breakpoints & rules

- Design **mobile-first**; verify every section at 375px, 768px, 1024px, 1440px.
- Hero: stacks (spec card below H1) `< lg`; 7/5 split `≥ lg`.
- Work grid: 1-col `< md`, 2-col `≥ lg`. Featured cards stack `< lg`.
- Type: the `clamp()` scale handles fluidity; check line-count at 320px (no orphan H1 words).
- Touch targets ≥ 44px; mobile menu is full-screen.

### 9.3 Component structure

```
app/
  layout.tsx                 # fonts (Geist, Geist Mono, Inter, Instrument Serif), <Nav/Footer>
  page.tsx                   # homepage = compose sections (server component)
  work/page.tsx              # index (server) + client filter island
  work/[slug]/page.tsx       # case study (generateStaticParams from data/MDX)
  about/page.tsx
  blog/page.tsx  blog/[slug]/page.tsx
  contact/page.tsx
  api/contact/route.ts       # keep
components/
  layout/      Navbar  Footer  SmoothScroll(Lenis)  MobileMenu  CommandHint?
  sections/    Hero  ProofStrip  SelectedWork  Capabilities  AINativeSignature
               ExperienceTimeline  Testimonials  WritingPreview  ContactCTA
  work/        ProjectCard  CaseStudyHero  ArchitectureDiagram  MetaRail  StatCard  DeviceFrame
  ui/          Button  Chip  Badge  Eyebrow  SectionHeading  StatTick  Marquee  TokenStream
  motion/      Reveal  StaggerGroup  MagneticButton  CountUp  LineMask  (wrap framer-motion)
lib/
  data.ts (reconciled — see Appendix B)  types.ts  animation.ts  utils.ts  blog.ts
  seo.ts (metadata helpers + JSON-LD)
content/
  work/*.mdx (optional)  blog/*.mdx
```

**Server vs client:** keep sections as **server components**; push `"use client"` down to the
smallest motion/interactive leaves (`Reveal`, `MagneticButton`, `Navbar`, form, filters). This
keeps JS shipped small — better on your machine and for Core Web Vitals.

### 9.4 Animation libraries

- **Framer Motion 12** (have it) — reveals, stagger, layout, page transitions.
- **Lenis** (have it) — smooth scroll; drive scroll-linked parallax via `useScroll`.
- **No three.js** in the critical path (remove from deps; archive `HeroScene.tsx`).
- Count-up: tiny custom hook with `useInView` (no new dep) or a 1–2KB lib.
- Diagrams: hand-authored **SVG** (sharpest, themeable) or **Mermaid** rendered to SVG at build.

### 9.5 SEO strategy

- **Metadata API** per route (`generateMetadata`): unique title/description/canonical; titles
  like `AI Life Assistant — Case Study | Rinshad`.
- **Open Graph images:** dynamic OG via the Next OG image route — black canvas, name, role,
  one stat. (Verify the OG API shape in the local docs.)
- **JSON-LD:** `Person` (name, jobTitle, sameAs: GitHub/LinkedIn, knowsAbout: your stack) on
  home; `CreativeWork`/`Article` on case studies/blog. Put in `lib/seo.ts`.
- **Sitemap + robots:** `app/sitemap.ts`, `app/robots.ts`.
- **Semantics:** one `<h1>` per page, real heading order, `<nav>/<main>/<article>`, `alt` text,
  `<time>` on dates.
- **Targets:** LCP < 2.0s (hero is text+CSS, not 3D — easy now), CLS ~0 (reserve media boxes),
  INP low (small client JS). Self-host fonts via `next/font` (no layout shift).
- **Keywords (natural, in copy + meta):** React Native engineer, AI mobile developer, streaming
  LLM, voice AI, WebRTC, full-stack engineer, hire (remote/EU/UK/Dubai).

### 9.6 Phasing (when you greenlight implementation)

1. **Tokens & type** — `globals.css` + fonts + `lib/animation.ts` (Appendix A). *Foundational.*
2. **Primitives & motion** — `Button/Chip/Eyebrow/SectionHeading/Reveal/StaggerGroup/CountUp`.
3. **Nav + Hero + Footer** — the first-impression trio.
4. **Homepage sections** — ProofStrip → SelectedWork → Capabilities → Signature → Timeline.
5. **`/work` + `/work/[slug]`** — card grid + case-study template + first real case study.
6. **`/about`, `/blog`, `/contact`** — fill the hybrid routes; restyle the form.
7. **SEO + OG + polish** — metadata, JSON-LD, reduced-motion, a11y + Lighthouse pass.

Each phase is independently shippable — the site never breaks mid-redesign.

---

## 10. Final Deliverable — Wireframes & Rationale

### 10.1 Homepage wireframe (desktop)

```
┌───────────────────────────────────────────────────────────────────────┐
│  Rinshad●                       Work   About   Writing   [ Let's talk ] │  NAV (transparent→blur)
├───────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  AI-NATIVE · MOBILE + FULL-STACK · 2.5 YRS · 20+ SHIPPED      ┌───────┐ │  HERO (7/5)
│                                                              │ SPEC  │ │
│  I build AI-native apps —                                    │ ───── │ │  H1 display-2xl,
│  shipped to real /pockets./                                  │ LOC   │ │  token-stream reveal;
│                                                              │ STATUS│ │  serif-italic accent
│  React Native engineer shipping real-time AI chat, voice     │ FOCUS │ │  on "pockets"
│  AI, and full-stack products to iOS, Android, and the web.   │ STORES│ │
│                                                              └───────┘ │
│  [ View selected work → ]   [ Download résumé ]     gh · in            │
│                                              ↓ (scroll cue)            │
├───────────────────────────────────────────────────────────────────────┤
│  ● App Store + Play Store    20+      35%        30%        < 1 hr      │  PROOF STRIP
│    5+ apps shipped solo      apps     ↓ latency  ↑ delivery crash MTTR  │  (count-up)
├───────────────────────────────────────────────────────────────────────┤
│  SELECTED WORK                                                          │  SELECTED WORK
│  ┌─────────────────────────┐   ┌─────────────────────────────────────┐ │  featured cards,
│  │ [ device media ]        │   │ PLATFORM·YEAR                       │ │  alternating media
│  │                         │   │ AI Life Assistant Super App         │ │  / text columns
│  │                         │   │ Voice-first AI copilot…             │ │
│  │                         │   │ [RN][Whisper][Claude][Native]       │ │
│  │                         │   │ ▸60fps ▸<1s ▸iOS+Android            │ │
│  └─────────────────────────┘   │ Read case study →                   │ │
│                                └─────────────────────────────────────┘ │
│           …Collaboration Platform (text/media flipped)…                │
│           …IoT Analytics Dashboard…                                    │
│                                              View all work →           │
├───────────────────────────────────────────────────────────────────────┤
│  CAPABILITIES        ┌── AI on Mobile&Web ──┐ ┌── Native Mobile ─────┐ │  CAPABILITY MATRIX
│  How I deliver       │ chips…               │ │ chips…              │ │  (4 pillars, mono chips)
│                      └──────────────────────┘ └─────────────────────┘ │
│                      ┌── Real-Time&Media ───┐ ┌── Full-Stack&Deliver ┐ │
│                      └──────────────────────┘ └─────────────────────┘ │
├───────────────────────────────────────────────────────────────────────┤
│  THE EDGE: AI-NATIVE                          ┌──────────────────────┐ │  SIGNATURE SECTION
│  Most engineers bolt AI on. I design for it…  │ [streaming bubble]   │ │  (manifesto + cheap
│  streaming · cancellation · tool traces ·     │ ▁▂▅▇▅▂ waveform      │ │  token-stream + voice
│  voice latency budgets, on store-shipped apps │ tool: search→call→…  │ │  waveform motif)
│                                               └──────────────────────┘ │
├───────────────────────────────────────────────────────────────────────┤
│  EXPERIENCE                                                            │  TIMELINE
│  ●── Full Stack Developer · IOSS              Nov 2023 — Present       │  (scroll-drawn line,
│  │   ▸ delivery 30% ▸ streaming AI+voice ▸ JS→TS ▸ native ▸ billing   │  metric chips)
│  ●── BBA · SJES College                       2019 — 2022             │
├───────────────────────────────────────────────────────────────────────┤
│  “ Pull-quote testimonial (serif) ”  — Lead/Manager  (or omit if none)│  TESTIMONIALS
├───────────────────────────────────────────────────────────────────────┤
│  WRITING   ┌ post ┐ ┌ post ┐ ┌ post ┐                  All writing →  │  WRITING PREVIEW
├───────────────────────────────────────────────────────────────────────┤
│  Have something worth building?                                       │  CONTACT CTA
│  Let's talk.                          [ contact form / info rail ]     │  (oversized close)
├───────────────────────────────────────────────────────────────────────┤
│  Rinshad●   email · gh · in   ● open to roles   Next.js·Tailwind·FM    │  FOOTER
└───────────────────────────────────────────────────────────────────────┘
```

### 10.2 Homepage wireframe (mobile, 375px)

```
┌──────────────────────┐
│ Rinshad●        [≡]  │  nav → full-screen overlay menu
├──────────────────────┤
│ AI-NATIVE · MOBILE   │  eyebrow (mono, wraps)
│                      │
│ I build AI-native    │  H1 (clamp small end ~56px),
│ apps — shipped to    │  serif accent on one word
│ real /pockets./      │
│                      │
│ React Native eng…    │  sub (body-lg)
│                      │
│ [ View work → ]      │  CTAs stack full-width
│ [ Download résumé ]  │
│ ┌──── SPEC ────────┐ │  spec card drops below
│ │ LOC · STATUS ·…  │ │
│ └──────────────────┘ │
├──────────────────────┤
│ 20+   ·   35% ↓      │  proof: 2-up grid
│ 30% ↑  ·  <1h MTTR   │
├──────────────────────┤
│ SELECTED WORK        │  cards stack 1-col,
│ ┌──────────────────┐ │  media on top
│ │ [ media ]        │ │
│ │ title · chips    │ │
│ │ ▸metrics  read → │ │
│ └──────────────────┘ │
│        …             │
└──────────────────────┘
```

### 10.3 Section-by-section UI description (the "why")

| Section | UI in one line | Visual-hierarchy intent |
|---|---|---|
| **Nav** | Quiet until you scroll; one accent CTA | Stays out of the way; single conversion accent |
| **Hero** | Oversized editorial H1 + mono spec card; token-stream reveal | Establishes seniority + the AI-native signature in 2s |
| **Proof strip** | 5 count-up facts on a thin band | Converts curiosity → credibility instantly |
| **Selected Work** | 3 big doorways with metrics | The "show me" payoff; metrics pre-qualify you |
| **Capabilities** | 4-pillar matrix, mono chips | Scannable breadth without "92%" gimmicks |
| **Signature** | Manifesto + streaming/voice motif | The screenshot moment; your moat, made visible |
| **Timeline** | Scroll-drawn line, metric chips | Proof of *where*; motion rewards the scroll |
| **Testimonials** | Serif pull-quotes (or omitted) | Third-party trust; honest if empty |
| **Writing** | 3 quiet cards | Signals communication — key for remote hiring |
| **Contact** | Oversized line + low-friction form | The close; one obvious next step |
| **Footer** | Wordmark, links, "built with" | Calm exit; quiet engineering flex |

### 10.4 Design rationale (defense of the key calls)

1. **Editorial hero over centered-gradient hero** → instantly separates you from template
   portfolios; the mono spec card says "engineer," the serif accent says "premium."
2. **Near-monochrome + one accent (≤8%)** → luxury reads as *restraint*. The current
   violet-everywhere is the single biggest "template" tell; fixing it is the highest-leverage
   visual change.
3. **Capability matrix over % skill bars** → senior audiences distrust self-rated percentages;
   grouped capabilities + real tools read as judgment, not bravado.
4. **Depth in `/work/[slug]`, not 9 thin pages** → concentrates the senior signal (architecture,
   trade-offs, measured results) where CTOs actually convert, and is faster to maintain.
5. **AI-native signature motif** → turns your differentiator from a *claim* into a *demo*,
   cheaply (no 3D), giving the site a memorable fingerprint.
6. **GPU-light motion** → respects your machine and Core Web Vitals while still feeling
   "expensive" via expo-out easing + masked reveals.
7. **Evidence-only metrics** → everything is interview-defensible, which protects you in the
   room, not just on the page.

### 10.5 Visual hierarchy (how the eye should travel)

`Eyebrow (mono, small) → Headline (display, huge) → Sub (body, medium) → Action (accent) →
Proof (mono ticks)`. Repeated at every section. Contrast is driven by **size + weight + color +
font-family swaps**, never by adding more accent color. Accent is reserved for: the primary
CTA, active nav, links, focus rings, and the single critical path in each diagram — nothing
else.

---

## Appendix A — Paste-ready design tokens (`globals.css`)

> Tailwind v4 is CSS-first (`@theme`). Wire these as CSS variables + expose the ones you want as
> Tailwind utilities via `@theme inline`. Verify v4 `@theme` syntax against your installed
> Tailwind before pasting.

```css
@import "tailwindcss";

:root {
  /* ink */
  --bg: #08080A;            --bg-subtle: #0C0C0F;
  --surface: #111114;       --surface-raised: #17171B;
  --border: rgba(255,255,255,0.08);  --border-strong: rgba(255,255,255,0.14);
  --text: #FAFAF9;          --text-secondary: #A1A1AA;
  --text-tertiary: #71717A; --text-muted: #52525B;

  /* accent — Electric Indigo (swap these 7 for Lime/Gold) */
  --accent: #6E56F7;        --accent-hover: #7C6BFF;  --accent-press: #5B45E0;
  --accent-fg: #FFFFFF;     --accent-subtle: rgba(110,86,247,0.10);
  --accent-border: rgba(110,86,247,0.22); --accent-glow: rgba(110,86,247,0.35);

  /* signature gradient */
  --aurora:
    radial-gradient(60% 50% at 30% 25%, rgba(110,86,247,0.18), transparent 70%),
    radial-gradient(50% 50% at 78% 60%, rgba(56,40,180,0.14), transparent 70%);

  /* radius */
  --r-sm:8px; --r-md:12px; --r-lg:16px; --r-xl:20px; --r-2xl:28px; --r-full:9999px;

  /* elevation */
  --elev-hairline: inset 0 1px 0 rgba(255,255,255,0.06);
  --elev-card: 0 1px 2px rgba(0,0,0,.4), 0 8px 24px -12px rgba(0,0,0,.5);
  --elev-raised: 0 12px 40px -16px rgba(0,0,0,.6);
  --glow-accent: 0 0 0 1px var(--accent-border), 0 8px 32px -8px var(--accent-glow);

  /* type scale */
  --display-2xl: clamp(3.5rem, 8vw, 6.5rem);
  --display-xl:  clamp(2.75rem, 5.5vw, 4.5rem);
  --display-lg:  clamp(2.25rem, 4vw, 3.25rem);
  --h2:          clamp(1.75rem, 3vw, 2.5rem);

  /* fonts (set via next/font variables in layout.tsx) */
  --font-display: var(--font-geist), system-ui, sans-serif;
  --font-body:    var(--font-inter), system-ui, sans-serif;
  --font-mono:    var(--font-geist-mono), ui-monospace, monospace;
  --font-serif:   var(--font-instrument), ui-serif, Georgia, serif;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration:.01ms !important; transition-duration:.01ms !important; }
}
```

```ts
// app/layout.tsx — font wiring (verify next/font API in node_modules/next/dist/docs)
import { Geist, Geist_Mono, Inter, Instrument_Serif } from "next/font/google";
const geist     = Geist({ subsets:["latin"], variable:"--font-geist" });
const geistMono = Geist_Mono({ subsets:["latin"], variable:"--font-geist-mono" });
const inter     = Inter({ subsets:["latin"], variable:"--font-inter" });
const instrument= Instrument_Serif({ subsets:["latin"], weight:"400", style:["normal","italic"], variable:"--font-instrument" });
// className: `${geist.variable} ${geistMono.variable} ${inter.variable} ${instrument.variable}`
```

---

## Appendix B — Content reconciliation

**Problem:** `lib/data.ts` currently frames the 3 projects as **web** (Next.js/RSC/TanStack/
Recharts) and the role/bio as "AI-Augmented React Native Engineer" — but your **résumé frames
the same 3 projects as React Native mobile apps** (Whisper, native audio modules, FCM/APNs,
WebRTC, Reanimated, SQLite). With the chosen **AI-native mobile + full-stack** positioning, the
résumé is the source of truth.

**Action (Phase 0 of implementation):** rewrite `data.ts` so:
- `siteConfig.role` = `"AI-native Mobile & Full-Stack Engineer"`; `tagline`/`bio` per [§7](#7-developer-focused-personal-brand).
- Each `Project` reframed mobile-first cross-platform, with the **résumé's** stack + metrics:
  - *AI Life Assistant* → RN · TS · OpenAI/Claude · Whisper · WebSockets · Reanimated · Native
    Modules (Swift/Kotlin) · SQLite. Metrics: `60fps · <1s · iOS+Android`.
  - *Real-Time Collaboration* → RN · Yjs (CRDT) · WebSockets · WebRTC · OpenAI. Metrics:
    `live presence · <16ms · CRDT`.
  - *IoT Analytics (mobile companion)* → RN · WebSockets · SQLite · Redux Toolkit · React Query
    · Sentry. Metrics: `10k+ devices · offline · MTTR <1h`.
- Extend `Project` type with the case-study fields from [§8](#8-case-study-template-workslug).
- `stats` already match the résumé (2.5+, 20+, 30%, 40%) — add `35% lower API latency` and
  `MTTR < 1h` to the proof strip.

This is a copy/data change only — no architectural risk — but it must happen **before** the
work cards are built, or the case studies will contradict your résumé in an interview.

---

## Appendix C — Migration map (current → target)

| Current file | Action | Target |
|---|---|---|
| `app/globals.css` | Replace | Token system (Appendix A); keep scrollbar/selection/focus, retune to accent |
| `app/layout.tsx` | Edit | Add Geist/Geist Mono/Instrument Serif fonts; keep Lenis `SmoothScroll` |
| `lib/data.ts` | Rewrite | Reconcile to mobile-first (Appendix B) |
| `lib/animation.ts` | Edit | New EASE/DURATION tokens (§5.1); keep variant exports |
| `components/sections/Hero.tsx` | Rebuild | Editorial 7/5 hero + token-stream + spec card |
| `components/layout/Navbar.tsx` | Restyle | Tokens, magic-line active indicator, `Let's talk` CTA |
| `components/sections/Projects.tsx` | Rebuild | New card anatomy (§3.1); link into `/work/[slug]` |
| `components/sections/Skills.tsx` | Replace | Capability matrix (§6.4); drop % bars |
| `components/sections/SocialProof.tsx` | Rebuild | Proof strip with count-up (§ Beat 2) |
| `components/sections/Contact.tsx` | Restyle | Keep RHF+Zod logic, new tokens, floating labels |
| `components/sections/HowIWork.tsx` | Move | Relocate to `/about` |
| `components/3d/HeroScene.tsx` | Archive | Remove three.js deps; keep file for a future beefier machine |
| `components/sections/{Experience,About,BlogPreview}.tsx` | Restyle | Timeline (§6.3), About copy (§7.4), writing cards |
| — | Add | `app/work`, `app/work/[slug]`, `app/about`, `app/contact`; `components/work/*`, `components/motion/*`, `components/ui/*`, `lib/seo.ts` |

---

*End of blueprint. Greenlight implementation and I'll start at Phase 0 (content reconciliation)
→ Phase 1 (tokens & type), checking in between phases.*
