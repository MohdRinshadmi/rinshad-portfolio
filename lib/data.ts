import type {
  Project,
  Experience,
  Education,
  SocialLink,
  WorkProcess,
  Capability,
  ProofStat,
  SkillGroup,
  Testimonial,
} from "./types";

/* ============================================================================
   SITE CONFIG
   Positioning: AI-Augmented Full-Stack Engineer.
   Voice: confident, concrete, senior. Lead with verbs and numbers.
   Every claim is évidence-backed by the résumé.
   ========================================================================== */
export const siteConfig = {
  name: "Rinshad",
  fullName: "Mohammed Rinshad M I",
  role: "AI-Augmented Full-Stack Engineer",
  tagline: "I build production LLM apps end-to-end — React, Next.js, and Node.js.",
  bio: "AI-Augmented Full-Stack Engineer with 2.5+ years shipping 20+ production systems on React, Next.js, TypeScript, Node.js, and AWS. I build React UIs — hooks, React Server Components, SSR, Redux Toolkit, React Query, and Tailwind — wired to Node.js APIs running LLM applications, RAG, multi-agent systems, and tool/function calling with Claude, OpenAI, LangChain, and the Vercel AI SDK, backed by PostgreSQL + pgvector, Redis, WebSockets, and event-driven microservices on Docker and serverless. I cut API latency 35%, eliminated a recurring runtime-error class via a live JS→TypeScript migration, and processed Stripe/PayPal billing with zero reconciliation failures.",
  location: "Palakkad, Kerala, India",
  locationShort: "Palakkad, IN",
  email: "rinshad803@gmail.com",
  phone: "+91 88486 75355",
  availability: "Open to AI & full-stack engineering roles",
  responsePromise: "Usually replies within 24h",
  resumeUrl: "/rinshad-resume.pdf",
  url: "https://rinshad.dev",
  social: {
    github: "https://github.com/MohdRinshadmi",
    linkedin: "https://linkedin.com/in/mohd-rinshadmi",
  } as Record<string, string>,
} as const;

/* ============================================================================
   HERO
   ========================================================================== */
export const hero = {
  eyebrow: "AI · FULL-STACK · 2.5 YRS · 20+ SHIPPED",
  /** Primary H1. `accent` MUST be a verbatim substring — Hero renders it as the muted two-tone tail. */
  headline: "AI-Augmented Full-Stack Engineer",
  accent: "Full-Stack Engineer",
  subheadline:
    "I build production LLM apps end-to-end — React, Next.js, React Native, and TypeScript front-ends wired to Node.js APIs on AWS running RAG, multi-agent systems, and tool calling with Claude, OpenAI, and the Vercel AI SDK.",
  primaryCta: { label: "View Projects", href: "/work" },
  secondaryCta: { label: "Let's Talk", href: "/contact" },
  /** Alternative headlines (per brief) — keep for easy A/B swaps. */
  alternates: [
    "I build AI-native products — streaming, real-time, and shipped.",
    "Streaming AI interfaces and real-time systems, engineered end-to-end.",
    "Full-stack AI engineering — from the data layer to the UI.",
    "I turn LLMs and real-time data into products people actually use.",
  ],
  /** Right-rail mono "spec card". */
  spec: [
    { k: "LOCATION", v: "Palakkad, IN" },
    { k: "STATUS", v: "Open to roles", live: true },
    { k: "FOCUS", v: "LLM apps · RAG · Realtime" },
    { k: "SHIPS TO", v: "Web · APIs · Cloud" },
  ],
} as const;

/* ============================================================================
   PROOF STRIP — count-up facts (all résumé-backed)
   ========================================================================== */
export const proofStats: ProofStat[] = [
  { to: 35, suffix: "%", label: "Lower API latency" },
  { to: 20, suffix: "+", label: "Production systems shipped" },
  { to: 30, suffix: "%", label: "Faster feature delivery" },
  { to: 40, suffix: "%", label: "Fewer dashboard re-renders" },
  { to: 2.5, suffix: "+", label: "Years shipping" },
];

/** Legacy alias (kept for safety). */
export const stats = [
  { label: "Years Experience", value: 2.5, suffix: "+" },
  { label: "Production Apps", value: 20, suffix: "+" },
  { label: "Faster Delivery", value: 30, suffix: "%" },
  { label: "Fewer Re-renders", value: 40, suffix: "%" },
];

/* ============================================================================
   PROJECTS — web-accurate framing (per "Web evidence + RN where true")
   ========================================================================== */
export const projects: Project[] = [
  {
    slug: "ai-life-assistant",
    title: "AI Life Assistant Super App",
    tagline: "A streaming AI copilot with tool-calling and live agent traces.",
    description:
      "The web companion for an AI life-assistant super app — a streaming copilot with multimodal inputs and transparent, live agent-trace rendering inside React Server Components.",
    image: "https://picsum.photos/seed/rinshad-copilot/1280/800?grayscale",
    platform: "WEB · AI COPILOT",
    year: "2024",
    role: "Lead Frontend Engineer",
    timeline: "Production",
    categories: ["AI", "Full-stack"],
    overview:
      "A production AI copilot that streams Claude and OpenAI completions in real time, calls tools mid-conversation, and shows the user exactly what the agent is doing — all inside React Server Components for sub-second perceived latency.",
    problem:
      "Users needed a responsive AI copilot that could handle text, image, and voice input while staying transparent about what the agent was doing — without the UI freezing on long, tool-heavy runs.",
    approach:
      "Design for streaming first. Treat partial messages, cancellation, and tool-call traces as first-class UI states, and keep agent state reusable so the same primitives power every conversation surface.",
    solution:
      "Engineered a streaming copilot with tool/function calling, multimodal inputs, and live agent-trace rendering inside RSC, backed by reusable agent-state primitives (Zustand + hooks) for retries, cancellation, and partial-message hydration across long-running conversations.",
    architecture: {
      summary:
        "The client opens a streaming channel to an AI gateway that fans requests out to Claude/OpenAI and tool endpoints. Tokens and tool events stream back through React Server Components and Suspense, while a Zustand store holds cancellable, hydratable agent state.",
      nodes: [
        { id: "client", label: "RSC Client", sub: "Next.js · streaming UI" },
        { id: "gateway", label: "AI Gateway", sub: "Vercel AI SDK", critical: true },
        { id: "models", label: "Claude · OpenAI", sub: "completions + tools", critical: true },
        { id: "tools", label: "Tool calls", sub: "function calling" },
        { id: "state", label: "Agent State", sub: "Zustand · retries · cancel" },
      ],
    },
    challenges: [
      "Hydrating partial messages as tokens stream without layout thrash or dropped frames.",
      "Cancelling a run mid-stream and reconciling the half-rendered message cleanly.",
      "Rendering tool-call traces inline so users trust the agent without overwhelming the chat.",
    ],
    performance: [
      {
        label: "Perceived latency",
        before: "Spinner until full completion",
        after: "Sub-second first token via streaming + optimistic UI",
      },
      {
        label: "Input modes",
        before: "Text only",
        after: "Text, image & voice in one composer",
      },
    ],
    results: [
      "Shipped a transparent, streaming copilot with live agent traces to production.",
      "Reusable agent-state primitives now power multiple conversation surfaces.",
    ],
    lessons: [
      "Streaming is a UI architecture, not a feature — design every partial state up front.",
      "Showing the agent's tool calls builds more trust than hiding them behind a spinner.",
    ],
    tags: ["Next.js", "Vercel AI SDK", "Claude API", "OpenAI API", "Zustand"],
    stack: [
      { label: "Framework", items: ["Next.js (App Router · RSC)", "TypeScript", "React 19"] },
      { label: "AI", items: ["Vercel AI SDK", "Claude API", "OpenAI API", "Tool calling"] },
      { label: "State & UI", items: ["Zustand", "Tailwind CSS", "shadcn/ui", "Framer Motion"] },
    ],
    metrics: [
      { label: "Latency", value: "<1s" },
      { label: "Input modes", value: "3" },
      { label: "Agent traces", value: "Live" },
    ],
    featured: true,
  },
  {
    slug: "realtime-collab-platform",
    title: "AI-Powered Real-Time Collaboration Platform",
    tagline: "A CRDT editor with live presence and inline Claude assistance.",
    description:
      "A real-time collaborative editor with conflict-free editing, live presence, and inline AI assistance that stays out of the way until you ask for it.",
    image: "https://picsum.photos/seed/rinshad-collab/1280/800?grayscale",
    platform: "WEB · REAL-TIME · AI",
    year: "2024",
    role: "Frontend Engineer",
    timeline: "Production",
    categories: ["Real-time", "AI"],
    overview:
      "A CRDT-based collaborative editor where many people edit the same large document at once — with live cursors, presence, and inline Claude assistance — at sub-16ms input latency on 10k+ node documents.",
    problem:
      "Teams editing the same large document needed conflict-free real-time collaboration with AI help that assisted without interrupting the writing flow.",
    approach:
      "Lean on CRDTs for correctness instead of fragile lock-based sync, stream UI updates through Suspense, and keep AI inline and on-demand so it never blocks typing.",
    solution:
      "Built a CRDT-based editor (Yjs) with live cursors, presence, and conflict-free updates streamed via Suspense, plus inline Claude assistance — streaming completions, “explain selection,” and summarization with tool calling — at <16ms input latency on 10k+ node documents.",
    architecture: {
      summary:
        "Each client holds a Yjs document and syncs CRDT updates over WebSockets, so edits merge conflict-free. Presence rides the same channel; AI requests stream completions back into the document through Suspense without blocking input.",
      nodes: [
        { id: "client", label: "Editor Client", sub: "Yjs document" },
        { id: "ws", label: "WebSocket Sync", sub: "CRDT updates", critical: true },
        { id: "crdt", label: "Conflict-free Merge", sub: "Yjs", critical: true },
        { id: "presence", label: "Live Presence", sub: "cursors · awareness" },
        { id: "ai", label: "Inline Claude", sub: "streamed via Suspense" },
      ],
    },
    challenges: [
      "Keeping input latency under 16ms while merging CRDT updates on 10k+ node documents.",
      "Rendering live cursors and presence without re-rendering the whole editor.",
      "Streaming AI completions into a live document without fighting concurrent edits.",
    ],
    performance: [
      {
        label: "Input latency",
        before: "Jank on large documents",
        after: "<16ms on 10k+ node docs",
      },
      {
        label: "Conflict handling",
        before: "Lock contention & lost edits",
        after: "Conflict-free via CRDT merge",
      },
    ],
    results: [
      "Conflict-free multi-user editing with live presence shipped to production.",
      "Inline AI assistance that accelerates writing without breaking flow.",
    ],
    lessons: [
      "CRDTs trade a steeper model for correctness you don't have to babysit later.",
      "AI in a live document has to be on-demand and inline, or it becomes noise.",
    ],
    tags: ["Next.js", "Yjs (CRDT)", "WebSockets", "TypeScript", "Vercel AI SDK"],
    stack: [
      { label: "Framework", items: ["Next.js", "TypeScript", "React"] },
      { label: "Real-time", items: ["Yjs (CRDT)", "WebSockets", "Suspense", "Presence / awareness"] },
      { label: "AI", items: ["Vercel AI SDK", "Claude API", "Tool calling"] },
    ],
    metrics: [
      { label: "Input latency", value: "<16ms" },
      { label: "Document size", value: "10k+ nodes" },
      { label: "Sync", value: "CRDT" },
    ],
    featured: true,
  },
  {
    slug: "iot-analytics-dashboard",
    title: "Cloud-Native IoT Analytics Dashboard",
    tagline: "Live telemetry from 10k+ devices, streamed at 60fps.",
    description:
      "A cloud-native analytics dashboard that streams live telemetry from 10k+ IoT devices into virtualized charts and heatmaps — without the UI buckling under the volume.",
    image: "https://picsum.photos/seed/rinshad-telemetry/1280/800?grayscale",
    platform: "WEB · REAL-TIME",
    year: "2023",
    role: "Frontend Engineer",
    timeline: "Production",
    categories: ["Real-time", "Full-stack"],
    overview:
      "An operations dashboard that turns a firehose of IoT telemetry into something a human can actually read — virtualized charts and heatmaps holding 60fps while thousands of devices report in, with sub-second TTFB from RSC and edge caching.",
    problem:
      "Operators needed live visibility into thousands of devices without the UI buckling under the sheer volume of incoming data.",
    approach:
      "Virtualize everything that renders, push first paint to the edge, and use React 18 transitions so high-frequency updates never block interaction.",
    solution:
      "Streamed telemetry over WebSockets into virtualized charts sustaining 60fps with React 18 transitions and Suspense, backed by RSC + edge caching for sub-second TTFB and a configurable alert/rule builder with optimistic UI and per-tenant theming via shadcn/ui.",
    architecture: {
      summary:
        "A device fleet streams telemetry through a WebSocket gateway. React Server Components prerender the shell at the edge for fast TTFB, while virtualized charts apply high-frequency updates inside React transitions to protect the frame budget.",
      nodes: [
        { id: "fleet", label: "Device Fleet", sub: "10k+ devices" },
        { id: "ws", label: "WebSocket Gateway", sub: "live telemetry", critical: true },
        { id: "rsc", label: "RSC + Edge Cache", sub: "sub-second TTFB" },
        { id: "charts", label: "Virtualized Charts", sub: "60fps · transitions", critical: true },
        { id: "alerts", label: "Alert / Rule Builder", sub: "optimistic UI" },
      ],
    },
    challenges: [
      "Sustaining 60fps while thousands of devices stream updates simultaneously.",
      "Keeping TTFB sub-second on a data-heavy, multi-tenant dashboard.",
      "Letting operators build alert rules with instant, optimistic feedback.",
    ],
    performance: [
      {
        label: "Frame rate under load",
        before: "Dropped frames on burst data",
        after: "Sustained 60fps via virtualization + transitions",
      },
      {
        label: "Time to first byte",
        before: "Slow data-heavy first paint",
        after: "<1s via RSC + edge caching",
      },
    ],
    results: [
      "Live visibility across 10k+ devices in a single, responsive dashboard.",
      "A per-tenant alert builder that operators configure without engineering help.",
    ],
    lessons: [
      "At high update frequencies, virtualization and transitions matter more than raw render speed.",
      "Pushing first paint to the edge buys headroom the rest of the UI spends well.",
    ],
    tags: ["Next.js", "RSC", "WebSockets", "TanStack Query", "Recharts"],
    stack: [
      { label: "Framework", items: ["Next.js (App Router · RSC)", "TypeScript", "Server Actions"] },
      { label: "Real-time & data", items: ["WebSockets", "TanStack Query", "React 18 transitions"] },
      { label: "Viz & UI", items: ["D3 / Recharts", "shadcn/ui", "Tailwind CSS", "Edge caching"] },
    ],
    metrics: [
      { label: "Devices", value: "10k+" },
      { label: "Frame rate", value: "60fps" },
      { label: "TTFB", value: "<1s" },
    ],
    featured: true,
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/* ============================================================================
   CAPABILITIES — 4-pillar matrix (replaces % skill bars)
   ========================================================================== */
export const capabilities: Capability[] = [
  {
    title: "AI Engineering",
    blurb: "LLM apps, multi-agent systems, tool-calling, and RAG — designed for, not bolted on.",
    items: ["Vercel AI SDK", "Claude · OpenAI", "LangChain", "Tool / function calling", "RAG · pgvector", "Multi-agent systems"],
  },
  {
    title: "Frontend Engineering",
    blurb: "React, Next.js, and TypeScript — hooks, React Server Components, and SSR, production UIs that ship.",
    items: ["React (hooks · RSC)", "Next.js (App Router · SSR)", "TypeScript", "Redux Toolkit · React Query", "Tailwind · shadcn/ui", "Framer Motion"],
  },
  {
    title: "Backend & Real-Time",
    blurb: "Node.js APIs, event-driven services, and live data that hold up under real load.",
    items: ["Node.js · Express", "PostgreSQL · pgvector", "Redis", "WebSockets", "Event-driven microservices", "Core Web Vitals"],
  },
  {
    title: "Delivery & Tooling",
    blurb: "From data layer to deploy, owned end-to-end — containers, CI/CD, and production telemetry.",
    items: ["Docker · serverless", "CI/CD · GitHub Actions", "Jest · Playwright", "Sentry", "Vercel · AWS"],
  },
];

/** Honest, modern, and a talking point with engineering leaders. */
export const aiWorkflow = ["Claude Code", "Cursor", "GitHub Copilot", "v0", "MCP servers"];

/* ============================================================================
   AI-NATIVE SIGNATURE — manifesto copy
   ========================================================================== */
export const signature = {
  eyebrow: "THE EDGE — AI-NATIVE",
  title: "Most engineers bolt AI on. I design for it.",
  body: "Streaming states, partial hydration, cancellation, tool-call traces, and latency budgets — treated as first-class UI, not an afterthought. The result feels instant, transparent, and in control, in production under real load.",
  /** Faux tokens the signature motif streams out. */
  streamLine: "Designing for streaming, agentic, and real-time from the first commit.",
  agentTrace: ["tool: search", "→ call: retrieve()", "→ stream: tokens", "✓ done"],
};

/* ============================================================================
   EXPERIENCE & EDUCATION
   ========================================================================== */
export const experience: Experience[] = [
  {
    id: "exp-ioss",
    role: "Full-Stack Engineer",
    company: "Infinite Open Source Solution LLP",
    location: "Calicut, Kerala",
    period: "Nov 2023 — Present",
    current: true,
    description:
      "Building React, Next.js, and TypeScript front-ends wired to Node.js APIs — streaming AI copilots, agentic systems, and real-time dashboards — and owning delivery from Figma to production.",
    achievements: [
      "Architected a shared TypeScript component library across React and Next.js — cutting feature delivery time 30% across 20+ production systems.",
      "Engineered streaming AI features with the Vercel AI SDK — Claude/OpenAI completions, tool-call traces, multi-agent flows, and RAG citations inside React Server Components for sub-second perceived latency.",
      "Led a full JS-to-TypeScript migration on a live production codebase with strict typing and type-safe API contracts — eliminating an entire class of runtime errors.",
      "Optimized React rendering with memoization, code splitting, lazy loading, and React Query caching — cutting re-renders on AI dashboards by 40% and lifting Core Web Vitals.",
      "Integrated agentic AI workflows (Claude Code, Cursor, GitHub Copilot, v0) into daily delivery — accelerating scaffolding, refactors, and test generation with human review as the gate.",
      "Cut API latency 35% and processed Stripe/PayPal billing with zero reconciliation failures — Node.js services with idempotent webhooks, retries, and event-driven workers on Docker.",
    ],
    technologies: ["React", "Next.js", "Node.js", "TypeScript", "Vercel AI SDK", "PostgreSQL"],
  },
];

export const education: Education[] = [
  {
    id: "edu-bba",
    degree: "BBA",
    institution: "SJES College of Management",
    affiliation: "Bangalore North University",
    location: "Bangalore, India",
    period: "Jun 2019 — Oct 2022",
  },
];

/* ============================================================================
   FULL SKILL INVENTORY (for /about) — verbatim from the résumé
   ========================================================================== */
export const skillGroups: SkillGroup[] = [
  { label: "Languages", items: ["TypeScript", "JavaScript (ES6+)", "HTML5", "CSS3", "SQL"] },
  {
    label: "Frameworks & Libraries",
    items: ["React", "Next.js (App Router · RSC · Server Actions)", "Remix (familiar)"],
  },
  {
    label: "Backend & Data",
    items: ["Node.js · Express", "REST · WebSockets", "PostgreSQL · pgvector", "Redis", "MongoDB · MySQL", "Event-driven microservices"],
  },
  {
    label: "AI Engineering & SDKs",
    items: ["Vercel AI SDK", "Claude API", "OpenAI API", "LangChain", "Tool / function calling", "RAG · pgvector", "Multi-agent systems"],
  },
  {
    label: "Styling, State & Realtime",
    items: ["Tailwind CSS", "shadcn/ui", "Radix UI", "Framer Motion", "Redux Toolkit", "Zustand", "React Query", "SWR", "WebSockets"],
  },
  {
    label: "Testing, Build & Tooling",
    items: ["Jest", "React Testing Library", "Playwright", "ESLint", "Prettier", "Vite", "Webpack", "Turbopack", "Storybook", "GitHub Actions"],
  },
  {
    label: "AI Workflow & Performance",
    items: ["Claude Code", "Cursor", "GitHub Copilot", "v0", "MCP servers", "Core Web Vitals", "Lighthouse", "React Profiler", "Sentry"],
  },
  {
    label: "Cloud & Deployment",
    items: ["AWS", "Docker", "Serverless", "Vercel", "Netlify", "GitHub Actions CI/CD"],
  },
];

/* ============================================================================
   HOW I WORK (moved off homepage → /about)
   ========================================================================== */
export const workProcess: WorkProcess[] = [
  {
    step: 1,
    title: "Discover",
    description:
      "Deep-dive into the problem space — user needs, business goals, technical constraints. No code until the problem is crystal clear.",
    icon: "Search",
  },
  {
    step: 2,
    title: "Architect",
    description:
      "Design the system before the UI. Define data models, API contracts, and component boundaries. Draw the map before building the roads.",
    icon: "Layout",
  },
  {
    step: 3,
    title: "Build",
    description:
      "Iterative development with fast feedback loops. Ship small working increments. Tests first, performance by default.",
    icon: "Code2",
  },
  {
    step: 4,
    title: "Polish",
    description:
      "Micro-interactions, accessibility passes, and performance audits. The last 10% that separates good from exceptional.",
    icon: "Sparkles",
  },
  {
    step: 5,
    title: "Ship",
    description:
      "Zero-downtime deployments, monitoring in place, runbooks written. Done doesn't mean deployed — it means production-ready.",
    icon: "Rocket",
  },
];

/* ============================================================================
   ABOUT — long-form story (first person, editorial)
   ========================================================================== */
export const about = {
  intro:
    "I'm Rinshad — an AI-augmented full-stack engineer who builds production LLM apps end-to-end, from React and Next.js UIs to Node.js APIs and the data layer.",
  paragraphs: [
    "Over the last 2.5 years I've shipped 20+ production systems on React, Next.js, TypeScript, Node.js, and AWS: streaming AI copilots, agentic interfaces, real-time collaboration, and live telemetry dashboards. I build React UIs — hooks, React Server Components, SSR, Redux Toolkit, and React Query — wired to Node.js APIs running LLM applications, RAG, multi-agent systems, and tool calling on Claude, OpenAI, LangChain, and the Vercel AI SDK, backed by PostgreSQL + pgvector, Redis, and event-driven microservices.",
    "I care about the parts users feel: sub-second streaming, conflict-free real-time editing, and transparent agents that show their work. I cut API latency 35%, processed Stripe/PayPal billing with zero reconciliation failures, led a live JS→TypeScript migration that erased a recurring class of runtime errors, and built a shared component library that cut feature delivery time 30% across 20+ systems.",
    "AI isn't a bolt-on for me — I design for it: streaming states, cancellation, tool-call traces, and latency budgets, treated as first-class UI in production.",
  ],
  closing:
    "Based in Kerala, India — open to AI and full-stack engineering roles, remote or relocation.",
};

/* ============================================================================
   TESTIMONIALS — design the slot; omit until real quotes exist (principle: no fakes)
   ========================================================================== */
export const testimonials: Testimonial[] = [];

/* ============================================================================
   NAV & SOCIAL
   ========================================================================== */
export const navLinks = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Writing" },
  { href: "/contact", label: "Contact" },
];

export const socialLinks: SocialLink[] = [
  { name: "GitHub", url: siteConfig.social.github, icon: "Github" },
  { name: "LinkedIn", url: siteConfig.social.linkedin, icon: "Linkedin" },
];
