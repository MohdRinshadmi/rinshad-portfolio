/* ============================================================================
   /uses — the daily toolkit, grouped and annotated.
   Voice rules match the rest of the site: first person, concrete, only tools
   actually in the workflow (résumé-backed) — no aspirational entries.
   ========================================================================== */

export interface UsesItem {
  name: string;
  note: string;
}

export interface UsesCategory {
  key: string;
  title: string;
  blurb: string;
  items: UsesItem[];
}

export const usesIntro = {
  eyebrow: "Uses",
  headline: {
    lead: "The tools behind",
    accent: "the work",
  },
  byline:
    "Everything here earns its place in a real production workflow — the API and data layer I spend most of my day in, the clients those APIs serve, and what keeps it all containerized, shipped, and observable.",
} as const;

export const usesCategories: UsesCategory[] = [
  {
    key: "backend",
    title: "APIs & services",
    blurb: "Where most of the day goes: typed contracts in front, boring reliable storage behind.",
    items: [
      { name: "Node.js · Express.js", note: "40+ production REST endpoints — middleware validation, JWT auth" },
      { name: "TypeScript", note: "non-negotiable; led a full JS→TS migration across web and mobile" },
      { name: "Golang · Gin · GORM", note: "Clean-Architecture services with repository/service separation and DI" },
      { name: "Python · FastAPI", note: "data-ingestion pipelines and the odd service that belongs in Python" },
      { name: "WebSockets · Redis Pub/Sub", note: "stateless real-time tiers that scale without sticky sessions" },
      { name: "JWT · OAuth · RBAC", note: "refresh-token rotation, role checks in middleware, rate limits at the edge" },
    ],
  },
  {
    key: "data",
    title: "Databases & caching",
    blurb: "Schema first. The index is a statement about how you read.",
    items: [
      { name: "MySQL · Sequelize ORM", note: "normalized models, foreign keys, versioned zero-downtime migrations" },
      { name: "PostgreSQL", note: "the default for anything new — indexes, transactions, honest constraints" },
      { name: "pgvector (HNSW)", note: "one database for rows and embeddings; semantic search without a second system" },
      { name: "Redis", note: "read-heavy endpoint caching, sessions, rate limiting, and Pub/Sub fan-out" },
      { name: "MongoDB · SQLite", note: "document stores where they fit; SQLite for on-device offline buffers" },
      { name: "EXPLAIN", note: "read the plan before provisioning a bigger box — 35% of response time came off this way" },
    ],
  },
  {
    key: "ship",
    title: "Containers, deploy & observe",
    blurb: "Done means running in production with eyes on it.",
    items: [
      { name: "Docker · Docker Compose", note: "backend, database, and broker up in one command" },
      { name: "Nginx · PM2", note: "reverse proxy with SSL in front, process supervision behind" },
      { name: "Linux / VPS · AWS", note: "EC2, S3, IAM, CloudWatch — and plain servers I administer myself" },
      { name: "GitHub Actions", note: "CI/CD — test, lint, build, release" },
      { name: "Structured logging · Sentry", note: "errors and performance telemetry that survive a 2am page" },
      { name: "Vercel", note: "web deploys — previews on every push (this site included)" },
    ],
  },
  {
    key: "ai-engineering",
    title: "AI / data backend",
    blurb: "Streaming, tool calls, and retrieval — treated as backend problems, because they are.",
    items: [
      { name: "Python ingestion pipelines", note: "chunking and embedding generation, run offline so requests only look up" },
      { name: "RAG · semantic search", note: "pgvector with HNSW over thousands of documents" },
      { name: "Gemini · Groq", note: "hosted models behind a streaming Node.js API layer" },
      { name: "Ollama", note: "local models for offline iteration" },
      { name: "LangChain", note: "RAG pipelines and orchestration" },
      { name: "Server-side tool calling", note: "tools execute where the credentials are, never in the browser" },
    ],
  },
  {
    key: "frontend",
    title: "Clients — web & mobile",
    blurb: "The surfaces those APIs serve. One TypeScript brain, two render targets.",
    items: [
      { name: "React & Next.js", note: "App Router, RSC, Server Actions — this site runs on it" },
      { name: "React Native", note: "shipped to both stores; background capture with local offline buffering" },
      { name: "TanStack Query · Redux Toolkit · Zustand", note: "server cache vs. client state, kept separate" },
      { name: "Tailwind CSS + shadcn/ui", note: "design tokens over one-off CSS" },
      { name: "Framer Motion", note: "scroll-scrubbed, transform-only motion" },
      { name: "Vite", note: "drove the CRA → Vite migration — frontend build times down 60%+" },
    ],
  },
  {
    key: "quality",
    title: "Testing & tooling",
    blurb: "Fast feedback loops or nothing.",
    items: [
      { name: "Jest · Vitest", note: "unit and integration coverage on the paths that carry money or state" },
      { name: "Playwright", note: "e2e — including multi-user real-time editing, reconnection, and conflict resolution" },
      { name: "Postman", note: "contract checks while the endpoint is still being designed" },
      { name: "ESLint · Prettier", note: "zero-debate formatting and lint gates in CI" },
      { name: "Claude Code · Cursor", note: "agentic coding; agents draft, I direct and review" },
    ],
  },
];

/** Colophon — what this site itself is built with. */
export const colophon = {
  title: "This site",
  note: "Next.js 16 (App Router · RSC) · Tailwind CSS v4 · Framer Motion · Lenis · MDX — statically rendered, no trackers.",
} as const;
