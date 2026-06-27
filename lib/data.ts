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
   Positioning: Full-Stack Web & Mobile Engineer (AI/LLM a supporting theme).
   Voice: confident, concrete, senior. Lead with verbs and numbers.
   Every claim is evidence-backed by the résumé.
   ========================================================================== */
export const siteConfig = {
  name: "Rinshad",
  fullName: "Mohammed Rinshad M I",
  role: "Full-Stack Web & Mobile Engineer",
  tagline: "I build full-stack web and mobile apps end-to-end — React, Next.js, React Native, and Node.js.",
  bio: "Full-Stack Web & Mobile Engineer with 2.5+ years building and shipping 20+ production web and mobile apps end-to-end on React, Next.js, React Native, TypeScript, Node.js, Golang, and AWS. I build full-stack products — React and React Native front-ends wired to Node.js and Go APIs — with AI/LLM features (RAG, semantic search, multi-agent systems, and tool/function calling via Claude, OpenAI, LangChain, and the Vercel AI SDK), real-time collaboration (WebSockets, Yjs CRDT), and payment systems (Stripe, PayPal, Razorpay), backed by PostgreSQL + pgvector, Redis, and Docker. I cut API latency 35%, raised Lighthouse from 62 to 89, and led a live JS→TypeScript migration across web and mobile.",
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
  eyebrow: "FULL-STACK · WEB & MOBILE · 2.5 YRS · 20+ SHIPPED",
  /** Primary H1. `accent` MUST be a verbatim substring — Hero renders it as the muted two-tone tail. */
  headline: "Full-Stack Web & Mobile Engineer",
  accent: "Web & Mobile Engineer",
  subheadline:
    "I build full-stack web and mobile apps end-to-end — React, Next.js, and React Native front-ends wired to Node.js and Go APIs on AWS, with AI/LLM, RAG, and real-time features.",
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
    { k: "FOCUS", v: "Web · Mobile · AI" },
    { k: "SHIPS TO", v: "Web · Mobile · Cloud" },
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
    image: "/images/projects/ai-copilot.svg",
    platform: "WEB · AI COPILOT",
    year: "2024",
    role: "Lead Frontend Engineer",
    timeline: "Production",
    categories: ["AI", "Full-stack"],
    overview:
      "A production, voice-first AI assistant that streams Gemini completions in real time, calls tools mid-conversation, and grounds its answers in a 20,000+ chunk knowledge base — all inside React Server Components for sub-second perceived latency.",
    problem:
      "Users needed a responsive AI copilot that could handle text, image, and voice input while staying transparent about what the agent was doing — without the UI freezing on long, tool-heavy runs.",
    approach:
      "Design for streaming first. Treat partial messages, cancellation, and tool-call traces as first-class UI states, and keep agent state reusable so the same primitives power every conversation surface.",
    solution:
      "Engineered a streaming copilot with tool/function calling, multimodal inputs, and live agent-trace rendering inside RSC, backed by reusable agent-state primitives (Zustand + hooks) for retries, cancellation, and partial-message hydration across long-running conversations.",
    architecture: {
      summary:
        "A voice-first assistant streams Gemini chat and tool calls through a Next.js RSC UI to a Node.js API that owns JWT refresh-token rotation and Redis-backed rate limiting. A production RAG pipeline retrieves over 20,000+ pgvector chunks with HNSW indexing — cutting retrieval from seconds to sub-second — then speaks the answer back via TTS.",
      nodes: [
        { id: "client", label: "Streaming UI", sub: "Next.js · RSC · voice" },
        { id: "api", label: "Node.js API", sub: "JWT · rate limit" },
        { id: "gemini", label: "Gemini", sub: "stream · tool calls", critical: true },
        { id: "rag", label: "RAG · pgvector", sub: "HNSW · 20k+ chunks", critical: true },
        { id: "tts", label: "TTS playback", sub: "voice response" },
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
        label: "Retrieval latency",
        before: "Seconds on a naive vector scan",
        after: "Sub-second via HNSW over 20k+ chunks",
      },
    ],
    results: [
      "Shipped a voice-first, transparent streaming assistant to production.",
      "Production RAG over 20,000+ embedded chunks with sub-second HNSW retrieval.",
    ],
    lessons: [
      "Streaming is a UI architecture, not a feature — design every partial state up front.",
      "Showing the agent's tool calls builds more trust than hiding them behind a spinner.",
    ],
    tags: ["Next.js", "Node.js", "Gemini API", "pgvector · HNSW", "Redis"],
    stack: [
      { label: "Framework", items: ["Next.js (App Router · RSC)", "Node.js", "TypeScript", "React"] },
      { label: "AI & RAG", items: ["Gemini API", "Tool / function calling", "RAG · PostgreSQL + pgvector", "HNSW vector indexing"] },
      { label: "State, data & UI", items: ["Zustand", "Redis (rate limiting)", "Tailwind CSS", "shadcn/ui"] },
    ],
    metrics: [
      { label: "Retrieval", value: "<1s" },
      { label: "Knowledge base", value: "20k+ chunks" },
      { label: "Vector index", value: "HNSW" },
    ],
    featured: true,
  },
  {
    slug: "realtime-collab-platform",
    title: "AI-Powered Real-Time Collaboration Platform",
    tagline: "A Yjs CRDT editor with live presence and inline AI assistance.",
    description:
      "A real-time collaborative editor with conflict-free editing, live presence, and inline AI assistance that stays out of the way until you ask for it.",
    image: "/images/projects/collab-editor.svg",
    platform: "WEB · REAL-TIME · AI",
    year: "2024",
    role: "Frontend Engineer",
    timeline: "Production",
    categories: ["Real-time", "AI"],
    overview:
      "A Yjs CRDT collaborative editor where many people edit the same document at once — with live cursors, presence, and inline AI assistance — broadcasting conflict-free updates across multiple stateless server instances via Redis Pub/Sub.",
    problem:
      "Teams editing the same large document needed conflict-free real-time collaboration with AI help that assisted without interrupting the writing flow.",
    approach:
      "Lean on CRDTs for correctness instead of fragile lock-based sync, stream UI updates through Suspense, and keep AI inline and on-demand so it never blocks typing.",
    solution:
      "Built a Yjs CRDT editor with live cursors, presence, and typing indicators handling 20+ concurrent clients without merge conflicts, on a stateless WebSocket layer that fans updates out via Redis Pub/Sub across multiple app instances. Inline AI — streaming summarization and agent actions on a selection — sits behind a JWT/OAuth audit and ACL layer with idempotent webhooks on AWS.",
    architecture: {
      summary:
        "Editor clients hold Yjs CRDT documents with live presence and typing indicators. A stateless WebSocket gateway fans updates out through Redis Pub/Sub across multiple app instances by channel, where they merge conflict-free. Inline streaming LLM (summarize, agent actions on a selection) sits behind a JWT/OAuth audit + ACL layer with idempotent webhooks on AWS.",
      nodes: [
        { id: "client", label: "Editor Clients", sub: "Yjs · presence · 20+" },
        { id: "ws", label: "WS Gateway", sub: "stateless" },
        { id: "pubsub", label: "Redis Pub/Sub", sub: "channel fan-out", critical: true },
        { id: "crdt", label: "CRDT Merge", sub: "Yjs · conflict-free", critical: true },
        { id: "ai", label: "Inline LLM", sub: "summarize · ACL" },
      ],
    },
    challenges: [
      "Broadcasting CRDT updates across multiple stateless server instances without losing consistency.",
      "Rendering live cursors and presence without re-rendering the whole editor.",
      "Streaming AI completions into a live document without fighting concurrent edits.",
    ],
    performance: [
      {
        label: "Concurrent editing",
        before: "Lock contention & lost edits",
        after: "20+ clients, conflict-free via CRDT merge",
      },
      {
        label: "Scale-out",
        before: "Single-instance WebSocket server",
        after: "Stateless, fanned out via Redis Pub/Sub",
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
    tags: ["Next.js", "Yjs (CRDT)", "WebSockets", "Redis Pub/Sub", "AWS"],
    stack: [
      { label: "Framework", items: ["Next.js", "Node.js", "TypeScript", "React"] },
      { label: "Real-time", items: ["Yjs (CRDT)", "WebSockets", "Redis Pub/Sub", "Presence / awareness"] },
      { label: "AI & security", items: ["Streaming LLM (inline)", "Tool / function calling", "JWT/OAuth · ACL", "Idempotent webhooks · AWS"] },
    ],
    metrics: [
      { label: "Concurrent clients", value: "20+" },
      { label: "Merge", value: "Conflict-free" },
      { label: "Fan-out", value: "Redis Pub/Sub" },
    ],
    featured: true,
  },
  {
    slug: "iot-analytics-dashboard",
    title: "Cloud-Native IoT Analytics Platform",
    tagline: "A React + Go platform on Clean Architecture, built to scale.",
    description:
      "A cloud-native IoT analytics platform — a type-safe React client over 15+ Go REST APIs, structured with Clean Architecture and a service/repository split, containerized for a clean local setup and future microservice evolution.",
    image: "/images/projects/analytics-dashboard.svg",
    platform: "WEB · CLOUD-NATIVE",
    year: "2023",
    role: "Full-Stack Engineer",
    timeline: "Production",
    categories: ["Full-stack", "Cloud-native"],
    overview:
      "A cloud-native IoT analytics platform built React-over-Go: a type-safe React client (25+ reusable components, TanStack Query + Zustand) calling 15+ Go/Gin REST APIs through a Clean-Architecture service and repository layer over PostgreSQL and Redis — six services orchestrated with Docker Compose, with real-time and Kubernetes designed in for the next phase.",
    problem:
      "The platform needed a maintainable, scalable foundation — a clean separation between transport, domain, and data — that a team could extend toward real-time telemetry and microservices without a rewrite.",
    approach:
      "Lead with architecture: Clean Architecture with repository/service layers and dependency injection on the Go side, a type-safe API layer and feature modules on the React side, and a monorepo that can split into services later.",
    solution:
      "Built a React + Go platform on Clean Architecture: 15+ Gin/GORM REST endpoints (device registration, telemetry ingestion, auth, analytics) with middleware, a type-safe TanStack Query + Zustand client of 25+ reusable components, and six services wired with Docker Compose — cutting local setup from hours to minutes. Real-time telemetry (MQTT, WebSocket broadcast), AI analytics, and Kubernetes are designed in for the next phase.",
    architecture: {
      summary:
        "A type-safe React client — 25+ reusable components with TanStack Query and Zustand — calls 15+ Go/Gin REST endpoints through middleware into a Clean-Architecture service layer with dependency injection and a GORM repository over PostgreSQL and Redis. Six services are orchestrated with Docker Compose; real-time MQTT, WebSocket broadcast, and Kubernetes are designed in for the next phase.",
      nodes: [
        { id: "client", label: "React Client", sub: "TanStack · Zustand" },
        { id: "api", label: "Go · Gin", sub: "15+ REST · mw", critical: true },
        { id: "service", label: "Service Layer", sub: "Clean Arch · DI", critical: true },
        { id: "repo", label: "Repository", sub: "GORM" },
        { id: "data", label: "Postgres · Redis", sub: "6 svc · Compose" },
      ],
    },
    challenges: [
      "Keeping a clean boundary between transport, domain, and data so the system stays extensible.",
      "Designing a type-safe contract shared across a 25+ component React client and the Go API.",
      "Structuring a monorepo and six containerized services that can split into microservices later.",
    ],
    performance: [
      {
        label: "Local setup",
        before: "Hours of manual service wiring",
        after: "Minutes via Docker Compose (6 services)",
      },
      {
        label: "Architecture",
        before: "Tightly coupled layers",
        after: "Clean Architecture · DI · repository split",
      },
    ],
    results: [
      "A scalable React + Go foundation ready to evolve into microservices.",
      "15+ REST APIs and 25+ reusable components behind a type-safe contract.",
    ],
    lessons: [
      "Clean Architecture is cheap up front and pays for itself the first time requirements move.",
      "A monorepo with clear module boundaries is the lowest-friction path to microservices later.",
    ],
    tags: ["React", "Golang · Gin", "PostgreSQL", "Redis", "Docker"],
    stack: [
      { label: "Frontend", items: ["React", "TypeScript", "TanStack Query", "Zustand"] },
      { label: "Backend (Go)", items: ["Golang · Gin", "GORM", "15+ REST APIs", "Clean Architecture · DI"] },
      { label: "Data & infra", items: ["PostgreSQL", "Redis", "Docker Compose (6 services)", "MQTT · K8s (designed)"] },
    ],
    metrics: [
      { label: "REST APIs", value: "15+" },
      { label: "React components", value: "25+" },
      { label: "Services", value: "6 · Compose" },
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
    title: "Frontend — Web & Mobile",
    blurb: "React, Next.js, and React Native — hooks, React Server Components, and SSR, production web and mobile UIs that ship.",
    items: ["React (hooks · RSC)", "React Native (mobile)", "Next.js (App Router · SSR)", "TypeScript", "Redux Toolkit · React Query", "Tailwind · shadcn/ui"],
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
      "Building React, Next.js, and React Native front-ends wired to Node.js and Go APIs — streaming AI copilots, agentic systems, and real-time dashboards across web and mobile — and owning delivery from Figma to production.",
    achievements: [
      "Architected a shared TypeScript component and API-contract library across React, Next.js, and React Native — cutting feature delivery time 30% across 20+ production systems on web and mobile.",
      "Engineered streaming AI features with the Vercel AI SDK — Claude/OpenAI completions, tool-call traces, multi-agent flows, and RAG citations inside React Server Components for sub-second perceived latency.",
      "Led a full JS-to-TypeScript migration across web (React) and mobile (React Native) on a live production codebase with strict typing and type-safe API contracts — eliminating an entire class of runtime errors.",
      "Optimized React rendering with memoization, code splitting, lazy loading, and React Query caching — cutting re-renders on AI dashboards by 40% and lifting Core Web Vitals.",
      "Integrated agentic AI workflows (Claude Code, Cursor, GitHub Copilot, v0) into daily delivery — accelerating scaffolding, refactors, and test generation with human review as the gate.",
      "Cut API latency 35% and processed Stripe/PayPal billing with zero reconciliation failures — Node.js services with idempotent webhooks, retries, and event-driven workers on Docker.",
    ],
    technologies: ["React", "Next.js", "React Native", "Node.js", "TypeScript", "Golang"],
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
  { label: "Languages", items: ["TypeScript", "JavaScript (ES6+)", "Golang", "Python", "SQL", "HTML5 · CSS3"] },
  {
    label: "Frameworks & Libraries",
    items: ["React", "React Native", "Next.js (App Router · RSC · Server Actions)", "Remix (familiar)"],
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
    "I'm Rinshad — a full-stack web & mobile engineer who builds production apps end-to-end, from React, Next.js, and React Native front-ends to Node.js and Go APIs and the data layer.",
  paragraphs: [
    "Over the last 2.5 years I've shipped 20+ production web and mobile apps on React, Next.js, React Native, TypeScript, Node.js, Golang, and AWS: streaming AI copilots, agentic interfaces, real-time collaboration, and live telemetry dashboards. I build React and React Native front-ends — hooks, React Server Components, SSR, Redux Toolkit, and React Query — wired to Node.js and Go APIs running LLM applications, RAG, multi-agent systems, and tool calling on Claude, OpenAI, LangChain, and the Vercel AI SDK, backed by PostgreSQL + pgvector, Redis, and event-driven microservices.",
    "I care about the parts users feel: sub-second streaming, conflict-free real-time editing, and transparent agents that show their work. I cut API latency 35%, raised Lighthouse from 62 to 89, processed Stripe, PayPal, and Razorpay billing with zero reconciliation failures, led a live JS→TypeScript migration across web and mobile that erased a recurring class of runtime errors, and built a shared component library used across React, Next.js, and React Native.",
    "AI isn't a bolt-on for me — I design for it: streaming states, cancellation, tool-call traces, and latency budgets, treated as first-class UI in production.",
  ],
  closing:
    "Based in Kerala, India — open to full-stack web & mobile engineering roles, remote or relocation.",
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
