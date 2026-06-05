# Implementation Contract — Portfolio Redesign

**This is the binding spec for every component file.** Read it fully, plus the foundation files
it references, before writing anything. Match these APIs and conventions EXACTLY — other agents
build against the same contract in parallel, so drift breaks the build.

Positioning: **AI-native Mobile & Full-Stack Engineer.** Projects are framed with the résumé's
real **web** stacks (no invented mobile-native claims). Aesthetic: editorial, luxury-minimal,
dark, engineering-grade. Inspiration register: Vercel / Linear / Stripe / Formix / Raycast — but
unique. **Near-monochrome canvas; the accent (Electric Indigo) covers ≤8% of any viewport.**

## Foundation files (already written — READ them, import from them, do not modify)

- `app/globals.css` — Tailwind v4 `@theme` tokens → utilities (see token table below).
- `lib/data.ts` — ALL content. Import everything; never hardcode copy that exists here.
- `lib/types.ts` — types (`Project`, `Capability`, `ProofStat`, `Experience`, etc.).
- `lib/animation.ts` — `EASE`, `DURATION`, `VIEWPORT`, variants (`fadeUp`, `lineMask`,
  `tokenStream`, `tokenWord`, `staggerContainerFast`, `cardHover`, `buttonHover`).
- `lib/utils.ts` — `cn(...)` for class merging, `formatDate(iso)`.
- `lib/seo.ts` — `buildMetadata`, `personJsonLd`, `projectJsonLd`, `articleJsonLd`, `jsonLdScript`.
- `lib/blog.ts` — `getAllPosts(): BlogPost[]`, `getPostBySlug(slug)` → `{ frontmatter, content }`.

## Next.js 16.2.6 rules (verified against local docs — do NOT trust training data)

- `params` and `searchParams` are **Promises**. In pages/metadata: `const { slug } = await params`.
- Dynamic route page props type: `PageProps<'/work/[slug]'>` is a global helper (no import).
- `generateStaticParams()` returns `{ slug: string }[]` (sync ok). Pair with the route.
- `generateMetadata({ params })` is async; return `Metadata`. Use `buildMetadata()` from `lib/seo`.
- OG images: `import { ImageResponse } from "next/og"` in `opengraph-image.tsx`; export `size`,
  `contentType`, default async `Image()`. **Only flexbox + a CSS subset — no `display:grid`.**
- `sitemap.ts` → default fn returning `MetadataRoute.Sitemap`. `robots.ts` → `MetadataRoute.Robots`.
- Blog MDX rendering: `import { MDXRemote } from "next-mdx-remote/rsc"` (RSC-safe), pass
  `source={content}` and `components={...}`.
- Server Components by default. Add `"use client"` ONLY for hooks/motion/browser APIs/events.

## Token utility classes (from globals.css — USE THESE, not raw hex)

| Purpose | Classes |
|---|---|
| Surfaces | `bg-bg` `bg-bg-subtle` `bg-surface` `bg-surface-raised` |
| Borders | `border-border` `border-border-strong` (accent border: `border-accent/20`) |
| Text | `text-text` `text-text-secondary` `text-text-tertiary` `text-text-muted` |
| Accent | `text-accent` `bg-accent` `bg-accent/10` `border-accent/20` `text-accent-hover` |
| State | `text-positive` `text-warning` `text-danger` |
| Fonts | `font-display` (Geist, headings) · `font-sans` (Inter, body, default) · `font-mono` (Geist Mono, eyebrows/metrics/chips) · `font-serif` (Instrument Serif — accent words/pull-quotes, usually `italic`) |
| Type scale | `text-display-2xl` `text-display-xl` `text-display-lg` `text-h2` `text-h3` `text-body-lg` `text-eyebrow` |
| Radius | `rounded-sm` `rounded-md` `rounded-lg` `rounded-xl` `rounded-2xl` `rounded-full` |
| Shadow | `shadow-card` `shadow-raised` `shadow-glow` · `ring-hairline` (inner top highlight) |
| Layout | `container-page` (1200px well) · `container-wide` (1440px) · `section-py` (fluid vertical rhythm) |
| Motifs | `bg-aurora` `bg-grain` `bg-grid` · `mask-fade-x` · `text-gradient` |
| Idle anim | `animate-pulse-dot` (live dot) · `animate-caret` (cursor) · `animate-marquee` (set `--marquee-duration`) |

Accent opacity: write `bg-accent/10`, `border-accent/20`, `text-accent`. Accent is reserved for:
primary CTA, active nav, links, focus, the live dot, and the single critical path in a diagram.
Nothing else gets color.

## Motion rules (non-negotiable — the dev machine is memory-constrained)

- Animate **only `transform` and `opacity`**. Never animate `filter/blur`, `box-shadow`,
  `width/height`, or large `background` in loops.
- Scroll reveals enter **once**: `whileInView` + `viewport={{ once: true }}` (or the `Reveal`/
  `Stagger` primitives, which already do this). Import `VIEWPORT` from `lib/animation`.
- **No perpetual rAF.** Looping motifs (signature stream) must gate on in-view with
  `useInView`/IntersectionObserver and pause offscreen.
- Honor reduced motion: use `useReducedMotion()` from framer-motion in custom client motion and
  skip transforms when true. (globals.css also clamps durations globally.)
- Easing/duration come from `EASE`/`DURATION`. Don't hardcode bezier arrays.

## Accessibility & SEO

- Exactly **one `<h1>` per page** (Hero on home; CaseStudyHero on `/work/[slug]`; page title
  elsewhere). Section titles are `<h2>`, card titles `<h3>`. Real heading order.
- Use semantic landmarks (`<nav> <main> <article> <footer>`), `alt` on images, `<time dateTime>`
  on dates, `aria-label` on icon-only controls, touch targets ≥ 44px.
- External links: `target="_blank" rel="noreferrer"`. Internal nav: `next/link`.

---

# Component APIs — build EXACTLY these signatures (named exports matching filename)

## Primitives — `components/ui/*` (mostly server)

### `Eyebrow` — `components/ui/Eyebrow.tsx` (server)
```ts
function Eyebrow(props: { children: React.ReactNode; dot?: boolean; className?: string }): JSX.Element
```
Mono, uppercase, `text-eyebrow` tracking, `text-text-tertiary`. If `dot`, prefix a small
`bg-accent` rounded-full dot.

### `Button` — `components/ui/Button.tsx` (server, NO event handlers)
```ts
function Button(props: {
  children: React.ReactNode;
  href?: string;            // internal → next/link; external (http) → <a target=_blank>
  variant?: "primary" | "ghost" | "subtle";  // default "primary"
  size?: "sm" | "md" | "lg";                  // default "md"
  iconRight?: React.ReactNode;
  type?: "button" | "submit";                 // renders <button> when no href
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}): JSX.Element
```
Use `class-variance-authority`. primary = `bg-accent text-accent-fg shadow-glow hover:bg-accent-hover`;
ghost = `border border-border-strong text-text hover:border-accent/40 hover:bg-surface`;
subtle = `bg-surface border border-border text-text-secondary hover:text-text`. All `rounded-full`,
`font-medium`, transition transform/colors only. Detect external via `/^https?:/`.

### `Chip` — `components/ui/Chip.tsx` (server)
```ts
function Chip(props: { children: React.ReactNode; accent?: boolean; size?: "sm" | "md"; className?: string }): JSX.Element
```
Mono, `rounded-full`, `border border-border bg-surface/60 text-text-secondary text-xs px-2.5 py-1`.
`accent` → `border-accent/20 bg-accent/10 text-accent`.

### `Badge` — `components/ui/Badge.tsx` (server)
```ts
function Badge(props: { children: React.ReactNode; live?: boolean; tone?: "accent" | "positive" | "neutral"; className?: string }): JSX.Element
```
Pill. `live` → leading `animate-pulse-dot` dot in `bg-positive`. tone sets dot/text color.

### `StatTick` — `components/ui/StatTick.tsx` (server)
```ts
function StatTick(props: { children: React.ReactNode; className?: string }): JSX.Element
```
Inline mono metric like `▸ 60fps`: a small `text-accent` triangle (▸) + `font-mono text-xs
text-text-secondary`.

### `SectionHeading` — `components/ui/SectionHeading.tsx` ("use client")
```ts
function SectionHeading(props: {
  eyebrow?: string;
  title: React.ReactNode;                 // string or JSX (may contain a font-serif italic accent span)
  description?: string;
  align?: "left" | "center";              // default "left"
  size?: "h2" | "display-lg" | "display-xl"; // default "h2" → text-h2
  className?: string;
}): JSX.Element
```
Eyebrow fades in; title uses a **line-mask reveal** (wrap in `overflow-hidden`, child
`variants={lineMask}`, `whileInView`, `viewport={VIEWPORT}`); description fades up after. Title is
`font-display` at the chosen size. `<h2>` element.

### `TokenStream` — `components/ui/TokenStream.tsx` ("use client")
```ts
function TokenStream(props: {
  text: string;
  className?: string;        // applied to the container (set the type size/family here)
  as?: "h1" | "p" | "span";  // default "span"
  accent?: string;           // optional substring rendered in font-serif italic text-text
  startDelay?: number;
}): JSX.Element
```
Splits `text` into words; reveals **once** L→R with `tokenStream`/`tokenWord` variants
(`whileInView`, `viewport={VIEWPORT}`) to mimic an LLM streaming. Words wrapped in
`inline-block`. If `accent` substring present, render those word(s) in `font-serif italic`.

### `Marquee` — `components/ui/Marquee.tsx` (server, CSS-only)
```ts
function Marquee(props: { children: React.ReactNode; durationSec?: number; reverse?: boolean; className?: string }): JSX.Element
```
Duplicate children in a flex track, `animate-marquee` via inline `--marquee-duration`. Wrap in
`mask-fade-x`. Pure CSS, no hooks.

## Motion primitives — `components/motion/*` (all "use client")

### `Reveal` — `components/motion/Reveal.tsx`
```ts
function Reveal(props: { children: React.ReactNode; className?: string; delay?: number; y?: number; as?: "div" | "section" | "li"; once?: boolean }): JSX.Element
```
`motion.<as>` with fadeUp-style `opacity/y` reveal, `whileInView`, `viewport={{ once }}` (default
true, margin -80px), `delay`.

### `Stagger` + `StaggerItem` — `components/motion/Stagger.tsx`
```ts
function Stagger(props: { children: React.ReactNode; className?: string; gap?: "fast" | "base"; once?: boolean; as?: "div" | "ul" }): JSX.Element
function StaggerItem(props: { children: React.ReactNode; className?: string; as?: "div" | "li" }): JSX.Element
```
Container drives `staggerContainerFast` (gap "fast") or `staggerContainer`. Items use `fadeUp`.

### `LineMask` — `components/motion/LineMask.tsx`
```ts
function LineMask(props: { children: React.ReactNode; className?: string; delay?: number }): JSX.Element
```
`overflow-hidden` wrapper; inner `motion.span` (block) `variants={lineMask}` `whileInView`.

### `CountUp` — `components/motion/CountUp.tsx`
```ts
function CountUp(props: { to: number; from?: number; duration?: number; decimals?: number; prefix?: string; suffix?: string; className?: string }): JSX.Element
```
Animate `from`→`to` on first in-view using framer `useInView` + `animate()` / `useMotionValue`.
Reduced motion → render final value immediately. `decimals` for e.g. 2.5.

### `MagneticButton` — `components/motion/MagneticButton.tsx`
```ts
function MagneticButton(props: { children: React.ReactNode; className?: string; strength?: number }): JSX.Element
```
Wrapper that translates children toward the cursor up to ~`strength` px (default 8), springs home
on leave, `whileTap` scale 0.97. Reduced motion → no transform. Wrap a `Button` inside it.

## Work components — `components/work/*`

### `DeviceFrame` — `components/work/DeviceFrame.tsx` (server)
```ts
function DeviceFrame(props: { label?: string; variant?: "browser" | "phone"; className?: string; children?: React.ReactNode }): JSX.Element
```
Screenshot **placeholder**: a hairline bezel (`border-border`, `rounded-xl/2xl`, `bg-surface`)
around a tasteful `bg-aurora`/`bg-grid` field with the `label` centered in `font-mono text-text-
tertiary`. `browser` shows a 3-dot top bar; `phone` shows a notch + tall aspect. If `children`,
render them instead of the placeholder field. Reserve aspect ratio (no CLS).

### `ProjectCard` — `components/work/ProjectCard.tsx` ("use client" for hover)
```ts
function ProjectCard(props: { project: Project; variant?: "featured" | "grid"; index?: number; className?: string }): JSX.Element
```
Whole card is a `next/link` to `/work/${project.slug}`. Anatomy: `DeviceFrame` media (16:10) →
`Eyebrow` `{platform} · {year}` → `<h3 font-display text-h3>` title → tagline (`text-text-
secondary`) → up to 4 `Chip`s (+`＋N` if more) → 3 `StatTick`s from `project.metrics` →
`Read case study →` row. **Hover (spring, transform only):** card `y:-6`, border→`accent/20`,
media inner `scale 1.03`, arrow `x:+4`. `featured` = larger, alternating media/text columns (use
`index` parity to flip); `grid` = uniform compact card.

### `CaseStudyHero` — `components/work/CaseStudyHero.tsx` ("use client" for parallax)
```ts
function CaseStudyHero(props: { project: Project }): JSX.Element
```
`Eyebrow` `{platform} · {year} · {role}` → `<h1 text-display-xl font-display>` title → tagline
`text-body-lg` → row of `StatTick`s + optional Live/GitHub `Button`s → full-bleed `DeviceFrame`
(browser) with a subtle scroll-linked parallax `y` (translate only, clamped) via `useScroll`.

### `MetaRail` — `components/work/MetaRail.tsx` (server)
```ts
function MetaRail(props: { project: Project }): JSX.Element
```
Sticky (`lg:sticky lg:top-28`) meta column: Role, Timeline, Year, Platform, grouped `stack`
(label + `Chip`s), and Live/GitHub links. Mono labels, quiet.

### `StatCard` — `components/work/StatCard.tsx` ("use client")
```ts
function StatCard(props: { value: string; label: string; className?: string }): JSX.Element
```
Big `font-display text-display-lg` value (use `CountUp` only if `value` is purely numeric;
otherwise render the string) + `font-mono text-eyebrow` label. Card surface + `ring-hairline`.

### `ArchitectureDiagram` — `components/work/ArchitectureDiagram.tsx` (server)
```ts
function ArchitectureDiagram(props: { nodes: ArchNode[]; summary?: string; className?: string }): JSX.Element
```
Hand-authored **SVG** (or flex of boxes + SVG connectors) on black canvas: hairline boxes for each
node (`label` + `sub`), connector lines left→right; nodes with `critical` get `accent` border +
the connector into them in accent ("agent-trace" critical path). Responsive: stack vertically on
mobile. No external diagram lib.

## Layout — `components/layout/*`

### `Navbar` — rebuild (`"use client"`)
Floating, `container-page`. Resting (top): transparent, height ~64px. Scrolled (>20px): `bg-bg/80
backdrop-blur-xl` + bottom hairline, condense to ~56px. Left: wordmark `Rinshad` + `text-accent`
dot, links to `/`. Center/right: `navLinks` from data as `next/link` (use `usePathname()` for an
active state — active link `text-text`, others `text-text-secondary hover:text-text`). Right: a
`Let's talk` primary pill → `/contact`. Mobile (`< md`): hamburger that opens `MobileMenu`. Honor
reduced motion.

### `MobileMenu` — new (`"use client"`)
```ts
function MobileMenu(props: { open: boolean; onClose: () => void }): JSX.Element
```
Full-screen overlay (`fixed inset-0 z-[60] bg-bg/95 backdrop-blur-xl`), oversized links
(`text-display-lg`) that stagger up, socials + résumé + `Let's talk` at the bottom. Close on `Esc`
and tap-out; lock body scroll while open; `AnimatePresence`. This is the mobile-craft showcase —
make it excellent.

### `Footer` — rebuild (server)
Big `font-display` wordmark `Rinshad●`, primary `navLinks`, social icons (from
`@/components/ui/SocialIcons`: `GithubIcon`, `LinkedinIcon`), an availability `Badge` (live), the
email as a `mailto:` link, and a quiet line: `Designed & built in Kerala. Next.js · Tailwind ·
Framer Motion.` Plus `© {year} {fullName}`. Use `container-page`, top hairline border.

### `SmoothScroll` — keep existing (Lenis). Do not change.

## Sections — `components/sections/*`

All consume `lib/data`. Wrap each in `<section id="…" className="section-py">` with a
`container-page` inner. Use `SectionHeading` for titles, `Reveal`/`Stagger` for entrance.

- **`Hero`** (`"use client"`): editorial 7/5 split (`lg:grid-cols-12`, content `col-span-7`, spec
  `col-span-5`). `bg-aurora` + `bg-grain` layered background (absolute, `-z-10`, pointer-events-
  none). Eyebrow (`hero.eyebrow`, mono) → H1 via `TokenStream` with `hero.headline` + `accent=
  hero.accent` at `text-display-2xl font-display` → sub (`hero.subheadline`, `text-body-lg
  text-text-secondary max-w-[58ch]`) → CTAs: primary `MagneticButton`>`Button(href=hero.primaryCta
  .href)`, secondary ghost `Button(href=hero.secondaryCta.href)`, tertiary inline GitHub · LinkedIn
  links → right "spec card" (`hero.spec`, mono rows, `STATUS` row shows a live dot) in a `bg-
  surface/60 border-border rounded-2xl ring-hairline` panel. Subtle bouncing scroll cue at bottom.
  Stacks on mobile (spec card below CTAs).
- **`ProofStrip`** (`"use client"`): thin band `bg-bg-subtle border-y border-border`. Render
  `proofStats`: numeric ones via `CountUp` (`to/suffix`, `decimals=1` for 2.5), static ones as the
  string. Each with a mono label. 2-up grid on mobile, row on desktop.
- **`SelectedWork`** (server): `SectionHeading` (eyebrow `SELECTED WORK`, title with a serif accent
  word). Map `projects.filter(p=>p.featured)` to `ProjectCard variant="featured" index={i}`.
  Footer `View all work →` `Button`/link to `/work`.
- **`Capabilities`** (server): `SectionHeading` (`CAPABILITIES` / "How I deliver"). 2×2 grid of
  `capabilities` cards (`bg-surface border-border rounded-xl ring-hairline p-8`): title
  (`font-display text-h3`), blurb (`text-text-secondary`), `items` as mono `Chip`s. Below: a quiet
  `AI workflow` row of `aiWorkflow` chips.
- **`AINativeSignature`** (`"use client"`): 6/6 editorial. Left: `signature.eyebrow` + `signature.
  title` (`text-display-lg`, serif accent ok) + `signature.body`. Right: a cheap motif card — a
  faux chat bubble that **types out `signature.streamLine` token-by-token in a loop only while in
  view** (gate with `useInView`; pause offscreen; `animate-caret` cursor), a small CSS **waveform**
  (a row of bars using the `waveform` keyframe with staggered delays), and the `signature.
  agentTrace` lines in mono. All transform/opacity.
- **`ExperienceTimeline`** (`"use client"`): `SectionHeading` (`EXPERIENCE`). Vertical timeline:
  a connector line that **draws on scroll** (`scaleY 0→1`, origin top, via `useScroll` on the
  list). Each `experience` row: node dot (`animate-pulse-dot` when in view), role · company, period
  (mono, right), location + tech `Chip`s, `achievements` as bullets — wrap metric tokens (`30%`,
  `40%`, `20+`, `zero`) in an accent-tinted inline chip. Education as a compact coda row.
- **`WritingPreview`** (server): `SectionHeading` (`WRITING`). `getAllPosts().slice(0,3)` as quiet
  cards linking to `/blog/{slug}` (title, excerpt, `formatDate(date)` + readTime, tag `Chip`s).
  `All writing →` link. If zero posts, render nothing.
- **`Testimonials`** (server): if `testimonials` is empty, **return `null`**. Otherwise editorial
  serif pull-quotes (large serif open-quote, quote `text-body-lg`, attribution mono).
- **`ContactCTA`** (server wrapper) + **`ContactForm`** (`"use client"`): oversized close line
  ("Have something worth building?" + serif "Let's talk." at `text-display-lg/xl`), a left info
  rail (email/phone/location + availability `Badge` + `responsePromise`), and `ContactForm`.
  `ContactForm` keeps the EXISTING logic (react-hook-form + zod + `POST /api/contact`, success
  spring state) — restyle to tokens (surface inputs, `focus:border-accent/50 focus:ring-accent/30`,
  `text-danger` errors, primary submit `Button`). Reuse the schema from the current Contact.tsx.

## Pages — `app/*` (Phase 3)

- `app/work/page.tsx` (server): `generateMetadata` via `buildMetadata({title:"Work", path:"/work"})`.
  Hero-lite header + a client filter island `WorkFilter` (`components/work/WorkFilter.tsx`,
  `"use client"`) with chips `All · AI · Real-time · Full-stack` (from `project.categories`),
  rendering `ProjectCard variant="grid"` in a 2-col grid.
- `app/work/[slug]/page.tsx` (server): `generateStaticParams` from `projects`; `generateMetadata`
  from the project (`buildMetadata({ title: project.title, description: project.tagline, path })`).
  `notFound()` if missing. Compose: `CaseStudyHero` → grid `[MetaRail sticky | body]` with the
  9 blocks (Overview, Problem, Approach, Architecture→`ArchitectureDiagram`, Implementation/
  Solution, Challenges, Performance→before/after rows, Results→`StatCard`s, Lessons) → prev/next
  pager + `ContactCTA`. Inject `projectJsonLd` via a JSON-LD script.
- `app/about/page.tsx` (server): long-form `about` story, full `skillGroups` inventory (grouped
  mono chips), `workProcess` (the "How I work" 5 steps moved here), `ExperienceTimeline`, education.
- `app/blog/page.tsx` (server): list `getAllPosts()` as cards. `buildMetadata({title:"Writing"})`.
- `app/blog/[slug]/page.tsx` (server): `generateStaticParams` from posts; render frontmatter header
  + `MDXRemote source={content}` with a styled `components` map (prose-like: h2/h3/p/ul/code in
  tokens). `articleJsonLd`. `notFound()` if missing.
- `app/contact/page.tsx` (server): `ContactCTA` full-page + `buildMetadata`.
- `app/sitemap.ts`, `app/robots.ts`, `app/opengraph-image.tsx` (root OG: black canvas, name, role,
  one stat, in `font` available to ImageResponse — keep to system/inline styles).

## Style consistency checklist (every file)

- [ ] Imports use `@/…` alias and the exact paths above; named exports match filenames.
- [ ] Only token classes (no raw hex, no `violet-*`, no `zinc-*` → use `text-text-secondary` etc.).
- [ ] `"use client"` only where required; sections default to server.
- [ ] Reveals enter once; loops gate on in-view; transform/opacity only; reduced-motion safe.
- [ ] One `<h1>` per page; `<h2>`/`<h3>` order; landmarks; alt/aria; ≥44px targets.
- [ ] Spacing from the 4px scale; cards `rounded-xl` + `ring-hairline`; controls `rounded-full/md`.
