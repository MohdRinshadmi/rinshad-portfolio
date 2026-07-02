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
    "Everything here earns its place in a real production workflow — the editor and AI tooling I write code with, the stack I reach for by default, and what keeps it all shipped and observable.",
} as const;

export const usesCategories: UsesCategory[] = [
  {
    key: "ai-workflow",
    title: "Editor & AI workflow",
    blurb: "AI-native from the first keystroke — agents draft, I direct and review.",
    items: [
      { name: "Claude Code", note: "terminal-first agentic coding; most new features start here" },
      { name: "Cursor", note: "AI-native editor for larger refactors and multi-file work" },
      { name: "GitHub Copilot", note: "inline completions for the in-between typing" },
      { name: "v0", note: "quick UI scaffolds to react against, not ship" },
      { name: "MCP servers", note: "wiring project tools and data into the agent loop" },
    ],
  },
  {
    key: "frontend",
    title: "Frontend — web & mobile",
    blurb: "One TypeScript brain, two render targets.",
    items: [
      { name: "React & Next.js", note: "App Router, RSC, Server Actions — this site runs on it" },
      { name: "React Native", note: "production mobile apps sharing contracts with the web" },
      { name: "TypeScript", note: "non-negotiable; led a full JS→TS migration across web + mobile" },
      { name: "Tailwind CSS + shadcn/ui", note: "design tokens over one-off CSS" },
      { name: "Framer Motion", note: "scroll-scrubbed, transform-only motion" },
      { name: "Redux Toolkit · React Query · Zustand", note: "server cache vs. client state, kept separate" },
    ],
  },
  {
    key: "backend",
    title: "Backend, data & real-time",
    blurb: "Typed APIs in front, boring reliable storage behind.",
    items: [
      { name: "Node.js · Express", note: "40+ production REST endpoints, middleware-validated" },
      { name: "Golang · Gin · GORM", note: "Clean-Architecture services when throughput matters" },
      { name: "PostgreSQL + pgvector", note: "one database for rows and embeddings — HNSW for RAG" },
      { name: "Redis", note: "rate limiting, caching, and Pub/Sub fan-out" },
      { name: "WebSockets · Yjs CRDT", note: "live presence and conflict-free collaborative editing" },
    ],
  },
  {
    key: "ai-engineering",
    title: "AI engineering",
    blurb: "Streaming, tool calls, and retrieval treated as first-class UI states.",
    items: [
      { name: "Vercel AI SDK", note: "streaming chat and tool/function calling primitives" },
      { name: "Gemini · Groq", note: "hosted models for production copilots" },
      { name: "Ollama", note: "local models for offline iteration" },
      { name: "LangChain", note: "RAG pipelines and agent orchestration" },
    ],
  },
  {
    key: "quality",
    title: "Testing & tooling",
    blurb: "Fast feedback loops or nothing.",
    items: [
      { name: "Vite · Turbopack", note: "migrated a team off CRA — build times down 60%" },
      { name: "Jest · Vitest · React Testing Library", note: "unit and component coverage" },
      { name: "Playwright", note: "e2e — including multi-user real-time editing flows" },
      { name: "ESLint · Prettier", note: "zero-debate formatting and lint gates in CI" },
    ],
  },
  {
    key: "ship",
    title: "Deploy & observe",
    blurb: "Done means running in production with eyes on it.",
    items: [
      { name: "Vercel", note: "web deploys — previews on every push" },
      { name: "AWS", note: "services, storage, and the pieces Vercel doesn't cover" },
      { name: "Docker · Docker Compose", note: "six-service local stacks in one command" },
      { name: "GitHub Actions", note: "CI/CD — test, lint, build, release" },
      { name: "Sentry", note: "errors and performance telemetry in production" },
    ],
  },
];

/** Colophon — what this site itself is built with. */
export const colophon = {
  title: "This site",
  note: "Next.js 16 (App Router · RSC) · Tailwind CSS v4 · Framer Motion · Lenis · MDX — statically rendered, no trackers.",
} as const;
