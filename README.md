# Rinshad — Portfolio

Personal site for **Mohammed Rinshad M I**, AI-native Mobile & Full-Stack Engineer.

A premium, editorial, dark-mode portfolio built as a scroll-narrative homepage plus dedicated
case-study, about, writing, and contact routes. Engineered to feel like a product website, not a
template — near-monochrome canvas, one restrained accent, editorial typography, and GPU-light
motion that *demonstrates* the work (token-stream reveals, agent-trace diagrams, scroll-drawn
timelines).

## Stack

- **Next.js 16** (App Router, RSC, Turbopack) · **React 19** · **TypeScript**
- **Tailwind CSS v4** (CSS-first `@theme` design tokens)
- **Framer Motion 12** (reveals, stagger, parallax) · **Lenis** (smooth scroll)
- **next/font** — Geist (display), Inter (body), Geist Mono (technical), Instrument Serif (accent)
- **MDX** writing via `next-mdx-remote/rsc` · **nodemailer** contact route

## Architecture

```
app/
  layout.tsx            fonts, root metadata, Person JSON-LD, Nav/Footer/SmoothScroll
  page.tsx              homepage — composes the 9 sections
  work/                 /work index (filterable) + /work/[slug] case studies
  about/  blog/  contact/
  api/contact/route.ts  contact form handler
  sitemap.ts  robots.ts  opengraph-image.tsx
components/
  ui/       Eyebrow Button Chip Badge StatTick SectionHeading TokenStream Marquee
  motion/   Reveal Stagger LineMask CountUp MagneticButton
  sections/ Hero ProofStrip SelectedWork Capabilities AINativeSignature
            ExperienceTimeline WritingPreview Testimonials ContactCTA ContactForm
  work/     ProjectCard CaseStudyHero MetaRail StatCard ArchitectureDiagram DeviceFrame WorkFilter
  layout/   Navbar MobileMenu Footer SmoothScroll
lib/
  data.ts (content) types.ts animation.ts seo.ts blog.ts utils.ts
docs/
  PORTFOLIO-REDESIGN.md      design + UX blueprint (source of truth)
  IMPLEMENTATION-CONTRACT.md component APIs, tokens, motion/a11y rules
```

The **design system** lives in [`app/globals.css`](app/globals.css) as Tailwind v4 `@theme`
tokens (ink ramp, Electric Indigo accent, fluid type scale, radius/shadow), and the **motion
system** in [`lib/animation.ts`](lib/animation.ts).

> **Heads up for AI agents / contributors:** this Next.js build diverges from training data.
> Read the relevant guide in `node_modules/next/dist/docs/` before changing routing, fonts,
> metadata, or MDX (see [AGENTS.md](AGENTS.md)).

## Develop

```bash
npm run dev     # next dev --turbopack
npm run build   # production build
npm run lint
```

### Contact form

Copy `.env.local.example` → `.env.local` and set SMTP credentials (`SMTP_HOST`, `SMTP_PORT`,
`SMTP_USER`, `SMTP_PASS`, `CONTACT_EMAIL`). Falls back to Ethereal for local testing.

## Conventions

- **Tokens only** — style with the semantic utility classes (`bg-bg`, `text-text-secondary`,
  `text-accent`, `font-display`, `text-display-xl`, …); no raw hex.
- **Restraint** — the accent covers ≤8% of any viewport; reserved for CTAs, links, focus, the
  live dot, and a diagram's critical path.
- **Motion** — animate only `transform`/`opacity`; reveals enter once; loops gate on in-view;
  everything respects `prefers-reduced-motion`.
- **Server-first** — sections/pages are Server Components; `"use client"` is pushed down to the
  smallest interactive leaves.
- **Evidence-backed copy** — every metric traces to the résumé.
