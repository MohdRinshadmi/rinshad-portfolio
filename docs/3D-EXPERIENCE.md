# The Immersive Journey — 3D Experience Architecture

The homepage is an interactive journey through eight cinematic "ink stages" set into
the site's paper canvas. This document is the engineering contract for that
experience: architecture, performance plan, and the strategies for testing,
extending, and deploying it.

**Design register:** tasteful-premium, on-system. Every scene uses only the
existing tokens — ink surfaces, cream text, one ember accent. No new hues, ever.

---

## 1. Folder & component architecture

```
lib/experience/
  capabilities.ts      device tier detection (high/medium/low/none) + count scaling
  palette.ts           design tokens mirrored as three.js colors (single source)
  store.ts             zustand store (tier, dialog, milestone, vault unlocks)
  data.ts              ALL journey content (typed, résumé-backed)

components/experience/
  core/
    CapabilityProbe.tsx   runs detection once; tracks reduced-motion changes
    SceneCanvas.tsx       the only way a Canvas enters the page (see §4)
    useSceneGate.ts       when a section may download + mount its 3D chunk
    InkStage.tsx          section shell + StageHeading (server component)
    JourneyRail.tsx       fixed waypoint nav tracking the active stage
    materials.ts          shared GLSL materials (holo fresnel, data particles)
  hero/        HeroSection + HeroScene          01 Digital Universe
  timeline/    TimelineSection + TimelineScene  02 Career Corridor
  skills/      SkillsSection + SkillsScene      03 Skills Galaxy
  projects/    CommandCenterSection, ModuleCard,
               ProjectDialog + CommandScene     04 Command Center
  architecture/ ArchitectureSection + Scene     05 Architecture Simulator
  code/        CodeDimensionSection (no canvas) 06 Code Dimension
  vault/       VaultSection (no canvas)         07 Achievement Vault
  contact/     ContactPortalSection + PortalScene 08 Contact Portal
```

**The Section/Scene split is the architecture.** Every stage is a `*Section.tsx`
(semantic DOM: headings, lists, buttons, forms — server-rendered HTML) plus an
optional `*Scene.tsx` (the WebGL layer, `dynamic(..., { ssr: false })`, always
`aria-hidden`). Meaning lives in the DOM; the scene is atmosphere. Delete every
canvas and the page still says everything.

## 2. Scene hierarchy

```
HeroScene          Canvas → fog → ParallaxRig(pointer) → DataStreams(1×Points,
                   custom shader) + HoloCore(2 meshes) → EffectComposer (high tier:
                   Bloom + ChromaticAberration + Vignette)
TimelineScene      Canvas → fog → flight-path Line → 6× MilestoneGate(torus+core+
                   Html year tag) → corridor dust (1×Points) → drei infinite Grid
                   camera: driven by scroll MotionValue, damped
SkillsScene        Canvas → fog → rig(pointer) → GalaxyCore → 4× ClusterRing
                   (ring Line + Html nameplate + N orbiting bodies sharing ONE
                   sphere geometry + ONE material per cluster)
CommandScene       Canvas → fog → deck dust (1×Points) → 3× drifting FrameGhost
ArchitectureScene  Canvas → 6× ServiceNode(plane+Html) → edge Lines → ALL packets
                   in ONE InstancedMesh → MapControls(pan only) + ZoomRig
PortalScene        Canvas → fog → 2 torus rings (flare while transmitting) + dust
```

Code Dimension and the Vault are deliberately canvas-free (CSS 3D flips,
shimmer sweeps): browsers cap live WebGL contexts (~8–16), and those stages are
strongest as typography anyway. Six contexts total, at most ~2 doing work at once.

## 3. State management strategy

One zustand store (`lib/experience/store.ts`), four slices:
- `tier / reducedMotion / dpr` — written once by `CapabilityProbe`, read everywhere.
- `activeProject` — command-center dialog routing.
- `activeMilestone` — corridor scroll position ↔ DOM card sync.
- `unlocked` — vault achievements (monotonic set).

Rules that keep 60fps:
- Components subscribe to **slices** (`useExperience((s) => s.tier)`), never the
  whole store — a dialog opening can't re-render the hero particles.
- **Per-frame values never touch React.** Scroll progress enters scenes as a
  framer `MotionValue` read imperatively inside `useFrame`; uniforms and
  matrices are mutated, not set as state. (The compiler-era lint rules can't
  model this escape hatch — they're scoped off for `*Scene.tsx` files only.)
- DOM ↔ scene communication is props-down, callbacks-up (e.g. galaxy hover
  readout), at interaction frequency, not frame frequency.

## 4. Asset loading strategy

There are **no external 3D assets** — no GLTFs, no texture downloads. Geometry
is procedural, sprites are computed in fragment shaders, "textures" are GLSL.
The entire 3D payload is code, which means the loading strategy is chunking:

1. Initial HTML: full journey copy, zero three.js.
2. `useSceneGate` mounts a stage's `dynamic()` scene chunk only when the
   section is within ~1.5 viewports **and** the tier probe passed. Bounce from
   the hero and the corridor never downloads.
3. Inside `SceneCanvas`, `<Suspense>` guards the scene; the stage's static
   `.bg-product` field doubles as loading state and no-WebGL fallback, and the
   canvas crossfades in over it (no pop).

## 5. Performance optimization plan

Implemented:
- **Device tiers** (`capabilities.ts`): WebGL2 probe, software-renderer sniff,
  deviceMemory/cores/mobile heuristics → `high/medium/low/none`. One knob
  (`countForTier`) scales every particle count (high 100% / medium 55% / low 25%).
- **DPR clamps** per tier ([1,2] / [1,1.5] / [1,1]); antialias on high only;
  postprocessing on high only, hero only.
- **Frameloop discipline**: every canvas drops to `frameloop="demand"` when
  off-screen (zero GPU work) — and under `prefers-reduced-motion`, where scenes
  hold a single static frame (the architecture sim keeps packets flowing — it's
  information — but stops camera drift).
- **Draw-call budget**: particles are one `Points` per scene; all architecture
  packets share one `InstancedMesh`; galaxy bodies share one geometry and one
  material per cluster; materials/geometries are `useMemo`'d and disposed.
- **No shadow maps, no per-frame allocations, no setState in loops.**
- Deliberate omissions (documented tradeoffs): no depth-of-field/motion-blur
  passes (cost ≫ value at this art direction), no real volumetrics (depth-faded
  particles + `FogExp2` read as fog at a fraction of the price).

Lighthouse posture: the LCP element is server-rendered text over a CSS
gradient; three.js is excluded from initial JS; canvases are `aria-hidden`;
all interactivity is native elements. Run Lighthouse against a production
build (`npm run build && npm start`) — dev mode scores are meaningless.

## 6. Accessibility

- Every stage is `<section aria-label>` with real headings; the journey works
  end-to-end with canvases deleted.
- Keyboard: milestone dot nav, galaxy cluster buttons (focus = ring highlight),
  module cards are `<button>`s (Enter expands, Radix traps focus, Esc closes),
  zoom is DOM buttons, the form is labeled native inputs.
- `aria-live` where scroll/hover changes content (corridor card, galaxy readout,
  transmission status). Reduced motion honored globally (CSS kill-switch +
  per-component checks + static scene frames), re-evaluated live on toggle.

## 7. Testing strategy

- **Static**: `npx tsc --noEmit` and `npm run lint` (both green).
- **SSR contract**: prod server + curl asserts the journey copy and all eight
  section ids exist in served HTML with zero `<canvas>` (progressive
  enhancement holds). Wire this into CI as a smoke test.
- **Recommended next**: Playwright — keyboard walk (Tab order through gates,
  module dialog open/Esc), reduced-motion emulation, WebGL-disabled run
  (`--disable-webgl`) asserting fallbacks, axe-core pass per stage; visual
  snapshots of DOM overlays (scenes excluded — nondeterministic).
- **Perf regression**: Lighthouse CI on the built homepage; budget JS ≤ 350KB
  gz initial (three.js must stay out of the entry chunk).

## 8. Deployment strategy

- Static-first: `/` prerenders (verified in the build manifest); only
  `/api/contact` is dynamic. Any Node host or Vercel works unchanged.
- Env needed in prod: `SMTP_HOST/PORT/USER/PASS`, `CONTACT_EMAIL` (contact
  portal falls back gracefully with its failed-transmission state).
- Before launch: replace placeholder GitHub links on the flagship projects in
  `lib/experience/data.ts` (marked with a NOTE), and confirm
  `public/rinshad-resume.pdf` is current.

## 9. Roadmap (phased, each step shippable)

1. ✅ Core infra (tiers, store, gate, materials) + all eight stages.
2. Real project links/screenshots in module dialogs; device frames in 3D.
3. Playwright + Lighthouse CI suite (§7).
4. Tier-high extravagances: galaxy connection arcs on hover, corridor light
   streaks, dialog morph from the clicked card (FLIP).
5. Mobile polish pass: corridor runway height per breakpoint, galaxy radius
   scaling, touch hints.
6. Telemetry: report tier distribution + FPS samples to decide where the
   medium-tier budget actually sits for real visitors.
