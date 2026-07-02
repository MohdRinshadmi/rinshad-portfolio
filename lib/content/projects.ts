import type { Project } from "../types";

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
    role: "Solo developer",
    timeline: "Self-initiated · Live",
    categories: ["AI", "Full-stack"],
    overview:
      "A voice-first AI assistant that streams Gemini completions in real time, calls tools mid-conversation, and grounds its answers in thousands of embedded documents — all inside React Server Components for sub-second perceived latency.",
    problem:
      "Users needed a responsive AI copilot that could handle text, image, and voice input while staying transparent about what the agent was doing — without the UI freezing on long, tool-heavy runs.",
    approach:
      "Design for streaming first. Treat partial messages, cancellation, and tool-call traces as first-class UI states, and keep agent state reusable so the same primitives power every conversation surface.",
    solution:
      "Engineered a streaming copilot with tool/function calling, multimodal inputs, and live agent-trace rendering inside RSC, backed by reusable agent-state primitives (Zustand + hooks) for retries, cancellation, and partial-message hydration across long-running conversations.",
    architecture: {
      summary:
        "A voice-first assistant streams Gemini chat and tool calls through a Next.js RSC UI to a Node.js API that owns JWT refresh-token rotation and Redis-backed rate limiting. A RAG pipeline — fed by Python ingestion scripts for chunking and embedding — retrieves across thousands of pgvector-embedded documents with HNSW indexing, cutting retrieval from seconds to sub-second, then speaks the answer back via TTS.",
      nodes: [
        { id: "client", label: "Streaming UI", sub: "Next.js · RSC · voice" },
        { id: "api", label: "Node.js API", sub: "JWT · rate limit" },
        { id: "gemini", label: "Gemini", sub: "stream · tool calls", critical: true },
        { id: "rag", label: "RAG · pgvector", sub: "HNSW · Python ingestion", critical: true },
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
        after: "Sub-second via HNSW over thousands of documents",
      },
    ],
    results: [
      "A voice-first, transparent streaming assistant — speech-to-text in, TTS playback out — running live.",
      "RAG over thousands of embedded documents with sub-second HNSW retrieval, fed by Python ingestion scripts.",
    ],
    lessons: [
      "Streaming is a UI architecture, not a feature — design every partial state up front.",
      "Showing the agent's tool calls builds more trust than hiding them behind a spinner.",
    ],
    tags: ["Next.js", "Node.js", "Gemini API", "pgvector · HNSW", "Redis"],
    stack: [
      { label: "Framework", items: ["Next.js (App Router · RSC)", "Node.js", "TypeScript", "React"] },
      { label: "AI & RAG", items: ["Gemini API", "Tool / function calling", "RAG · PostgreSQL + pgvector", "HNSW vector indexing", "Python ingestion scripts"] },
      { label: "State, data & UI", items: ["Zustand", "Redis (rate limiting)", "Tailwind CSS", "shadcn/ui"] },
    ],
    metrics: [
      { label: "Retrieval", value: "<1s" },
      { label: "Knowledge base", value: "1,000s of docs" },
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
    role: "Solo developer",
    timeline: "Self-initiated · Live",
    categories: ["Real-time", "AI"],
    overview:
      "A Yjs CRDT collaborative editor where many people edit the same document at once — with live cursors, presence, and inline AI assistance — broadcasting conflict-free updates across multiple stateless server instances via Redis Pub/Sub.",
    problem:
      "Teams editing the same large document needed conflict-free real-time collaboration with AI help that assisted without interrupting the writing flow.",
    approach:
      "Lean on CRDTs for correctness instead of fragile lock-based sync, stream UI updates through Suspense, and keep AI inline and on-demand so it never blocks typing.",
    solution:
      "Built a Yjs CRDT editor with live cursors, presence, and typing indicators handling many concurrent clients without merge conflicts, on a stateless WebSocket layer that fans updates out via Redis Pub/Sub across multiple app instances. Inline AI — streaming summarization and agent actions on a selection — sits behind JWT/OAuth access control, verified by end-to-end Playwright tests covering multi-user editing, reconnection, and conflict resolution.",
    architecture: {
      summary:
        "Editor clients hold Yjs CRDT documents with live presence and typing indicators. A stateless WebSocket gateway fans updates out through Redis Pub/Sub across multiple app instances by channel, where they merge conflict-free. Inline streaming LLM (summarize, agent actions on a selection) sits behind JWT/OAuth access control, with end-to-end Playwright tests covering multi-user editing, reconnection, and conflict resolution.",
      nodes: [
        { id: "client", label: "Editor Clients", sub: "Yjs · presence · typing" },
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
        after: "Many clients, conflict-free via CRDT merge",
      },
      {
        label: "Scale-out",
        before: "Single-instance WebSocket server",
        after: "Stateless, fanned out via Redis Pub/Sub",
      },
    ],
    results: [
      "Conflict-free multi-user editing with live presence, verified by Playwright e2e tests covering reconnection and conflict resolution.",
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
      { label: "AI, security & testing", items: ["Streaming LLM (inline)", "Tool / function calling", "JWT/OAuth access control", "Playwright e2e tests"] },
    ],
    metrics: [
      { label: "Merge", value: "Conflict-free" },
      { label: "Fan-out", value: "Redis Pub/Sub" },
      { label: "E2E coverage", value: "Playwright" },
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
    role: "Solo developer",
    timeline: "Self-initiated · Live",
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
