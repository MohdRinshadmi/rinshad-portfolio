import type {
  Experience,
  Education,
  ProofStat,
  SkillGroup,
  WorkProcess,
} from "../types";

/* ============================================================================
   PROOF STRIP — count-up facts (all résumé-backed)
   ========================================================================== */
export const proofStats: ProofStat[] = [
  { to: 35, suffix: "%", label: "Lower API latency" },
  { to: 20, suffix: "+", label: "Production features shipped" },
  { to: 2000, suffix: "+", label: "Monthly transactions processed" },
  { to: 89, prefix: "62→", label: "Lighthouse performance score" },
  { to: 2.5, suffix: "+", label: "Years shipping" },
];

/* ============================================================================
   EXPERIENCE & EDUCATION
   ========================================================================== */
export const experience: Experience[] = [
  {
    id: "exp-ioss",
    role: "Software Engineer",
    company: "Infinite Open Source Solution LLP",
    location: "Calicut, Kerala",
    period: "Nov 2023 — Present",
    current: true,
    description:
      "Building and scaling production web and mobile apps — eCommerce, LMS, and AI-powered platforms — with React, Next.js, and React Native front-ends wired to Node.js/Express APIs, and owning Docker, CI/CD, and Linux/VPS deployments.",
    achievements: [
      "Migrated the entire codebase from JavaScript to TypeScript across both web (React) and mobile (React Native) apps — full type safety that caught bugs early and eliminated an entire class of runtime errors.",
      "Built a shared TypeScript component and API-contract library used across React, Next.js, and React Native projects — cutting duplicated code and speeding up feature delivery on 20+ production features.",
      "Integrated Stripe, PayPal, and Razorpay payment gateways with webhook-driven order lifecycle management for a production eCommerce platform processing 2,000+ monthly transactions.",
      "Architected 40+ RESTful API endpoints with Express.js and Sequelize ORM — middleware-based validation, JWT authentication, structured error handling, and SQL query optimization cutting average API response time 35%.",
      "Led the frontend migration from Create React App to Vite, cutting build times from ~90s to ~35s (60%+ reduction) across a 4-person frontend team.",
      "Optimized React rendering, code-splitting, and CDN-based asset delivery — lifting the Lighthouse performance score from 62 to 89 and cutting initial page load from 3.8s to 2.1s.",
    ],
    technologies: ["React", "Next.js", "React Native", "Node.js · Express", "TypeScript", "MySQL · Sequelize", "Redis", "Docker"],
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
    items: ["Node.js · Express", "Golang · Gin · GORM", "Sequelize ORM", "REST · WebSockets", "PostgreSQL · pgvector", "Redis", "MongoDB · MySQL", "Event-driven microservices"],
  },
  {
    label: "Payments",
    items: ["Stripe", "PayPal", "Razorpay", "Webhook-driven order lifecycle"],
  },
  {
    label: "AI Engineering & SDKs",
    items: ["Vercel AI SDK", "Gemini · Groq", "Ollama (local LLMs)", "LangChain", "Tool / function calling", "RAG · semantic search · embeddings", "Streaming LLM UIs"],
  },
  {
    label: "Styling, State & Realtime",
    items: ["Tailwind CSS", "shadcn/ui", "Radix UI", "Framer Motion", "Redux Toolkit", "Zustand", "React Query", "SWR", "WebSockets"],
  },
  {
    label: "Testing, Build & Tooling",
    items: ["Jest", "Vitest", "React Testing Library", "Playwright", "ESLint", "Prettier", "Vite", "Webpack", "Turbopack", "Storybook", "GitHub Actions"],
  },
  {
    label: "AI Workflow & Performance",
    items: ["Claude Code", "Cursor", "GitHub Copilot", "v0", "MCP servers", "Core Web Vitals", "Lighthouse", "React Profiler", "Sentry"],
  },
  {
    label: "Cloud & Deployment",
    items: ["AWS", "Docker · Docker Compose", "Nginx · PM2 · Linux/VPS", "Serverless", "Vercel", "Netlify", "GitHub Actions CI/CD"],
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
    "Over the last 2.5 years I've shipped 20+ production features across eCommerce, LMS, and AI platforms on React, Next.js, React Native, TypeScript, Node.js, Golang, and AWS — plus self-initiated systems built to explore production patterns: streaming AI copilots, real-time collaboration, and live telemetry dashboards. I build React and React Native front-ends — hooks, React Server Components, SSR, Redux Toolkit, and React Query — wired to Node.js and Go APIs running LLM applications, RAG, semantic search, and tool calling with LangChain and the Vercel AI SDK, backed by PostgreSQL + pgvector, Redis, and event-driven services.",
    "I care about the parts users feel: sub-second streaming, conflict-free real-time editing, and transparent agents that show their work. I cut API latency 35% across 40+ Express REST endpoints, raised Lighthouse from 62 to 89 (3.8s → 2.1s initial load), processed 2,000+ monthly Stripe, PayPal, and Razorpay transactions with webhook-driven order lifecycles, led a live JS→TypeScript migration across web and mobile that erased a recurring class of runtime errors, and cut team build times 60% by migrating CRA to Vite.",
    "AI isn't a bolt-on for me — I design for it: streaming states, cancellation, tool-call traces, and latency budgets, treated as first-class UI in production.",
  ],
  closing:
    "Based in Kerala, India — open to full-stack web & mobile engineering roles, remote or relocation.",
};
