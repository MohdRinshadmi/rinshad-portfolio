import type { Project } from "../types";

/* ============================================================================
   PROJECTS — the résumé's three portfolio projects, in résumé order and with
   its framing: backend first, client second. Honesty rule from the PDF:
   "Self-initiated projects on self-hosted, open-source infrastructure
   (PostgreSQL, Redis, Docker); no commercial users." Nothing here claims
   traffic, revenue, or users, and no number appears that the PDF can't back.
   ========================================================================== */

/** Rendered above the /work index — the résumé's own disclaimer, verbatim in
    spirit. Keep it visible: it is what makes every claim below credible. */
export const workDisclaimer =
  "Self-initiated projects on self-hosted, open-source infrastructure (PostgreSQL, Redis, Docker) — no commercial users. Source for all three is on GitHub.";

export const projects: Project[] = [
  {
    slug: "iot-analytics-dashboard",
    title: "Cloud-Native IoT Analytics Platform",
    tagline: "A Golang backend on Clean Architecture, ingesting high-frequency telemetry.",
    description:
      "A Go/Gin backend structured on Clean Architecture — repository and service-layer separation with dependency injection — ingesting high-frequency device telemetry into indexed PostgreSQL time-series tables, with a type-safe React dashboard on top.",
    image: "/images/projects/iot-analytics-dashboard.png",
    platform: "BACKEND · GOLANG · CLOUD-NATIVE",
    year: "2023",
    role: "Solo developer",
    timeline: "Self-initiated · Self-hosted",
    categories: ["Backend", "Cloud-native"],
    overview:
      "A cloud-native IoT analytics platform built backend-first in Golang: Gin handlers over a Clean-Architecture service layer with dependency injection, GORM repositories over PostgreSQL and Redis, indexed time-series tables for high-frequency telemetry, and backend, database, and broker containerized with Docker Compose. The React dashboard sits on top — TanStack Query and Zustand against a type-safe API client.",
    problem:
      "Device telemetry arrives fast, unevenly, and forever. The system needed a data layer that stays queryable as tables grow, and a code structure that separates transport, domain, and storage cleanly enough to survive changing requirements without a rewrite.",
    approach:
      "Lead with architecture. Clean Architecture on the Go side — handlers know nothing about GORM, services know nothing about HTTP, and dependencies are injected at the boundary. A monorepo splitting backend, frontend, and infrastructure so each can move independently.",
    solution:
      "Built a Golang backend on Clean Architecture with repository and service-layer separation and dependency injection, in a monorepo splitting backend, frontend, and infrastructure. Developed REST APIs and device-management services ingesting high-frequency telemetry with Gin, GORM, PostgreSQL, and Redis over indexed time-series tables. Containerized backend, database, and broker with Docker Compose, and built the React dashboard on TanStack Query and Zustand with type-safe API clients.",
    architecture: {
      summary:
        "Devices push telemetry into Gin HTTP handlers, which stay thin — validation and routing only. A Clean-Architecture service layer holds the domain rules and receives its dependencies by injection; a GORM repository is the only thing that knows about storage, writing to indexed time-series tables in PostgreSQL with Redis in front for hot reads. Backend, database, and broker come up together under Docker Compose. The React dashboard reads through a type-safe API client on TanStack Query and Zustand.",
      nodes: [
        { id: "devices", label: "Devices", sub: "high-frequency telemetry" },
        { id: "api", label: "Gin Handlers", sub: "REST · thin transport" },
        { id: "service", label: "Service Layer", sub: "Clean Arch · DI", critical: true },
        { id: "repo", label: "GORM Repository", sub: "indexed time-series", critical: true },
        { id: "data", label: "Postgres · Redis", sub: "Docker Compose" },
      ],
    },
    challenges: [
      "Keeping time-series queries fast as telemetry tables grow — the index has to match the access path, not the schema diagram.",
      "Holding the Clean Architecture boundary honestly: no GORM types leaking up into services, no HTTP types leaking down.",
      "Bringing backend, database, and broker up as one reproducible unit so the stack is one `docker compose up` away.",
    ],
    performance: [
      {
        label: "Telemetry reads",
        before: "Sequential scans over a growing table",
        after: "Indexed time-series access paths, Redis in front of hot reads",
      },
      {
        label: "Code structure",
        before: "Handlers talking straight to the ORM",
        after: "Clean Architecture — repository / service split with DI",
      },
    ],
    results: [
      "A Go backend where transport, domain, and storage can each be changed without touching the other two.",
      "Backend, database, and broker reproducible in one Docker Compose command, with a type-safe React client on top.",
    ],
    lessons: [
      "Clean Architecture costs an afternoon up front and refunds it the first time requirements move.",
      "An index is a statement about how you read, not about how you store. Write the query first.",
    ],
    tags: ["Golang · Gin", "GORM", "PostgreSQL", "Redis", "Docker Compose"],
    stack: [
      { label: "Backend (Go)", items: ["Golang · Gin", "GORM", "REST API design", "Clean Architecture · DI", "Monorepo"] },
      { label: "Data & infra", items: ["PostgreSQL (indexed time-series)", "Redis", "Docker Compose", "Message broker"] },
      { label: "Client", items: ["React", "TypeScript", "TanStack Query", "Zustand", "Type-safe API clients"] },
    ],
    metrics: [
      { label: "Architecture", value: "Clean · DI" },
      { label: "Ingest", value: "High-frequency" },
      { label: "Stack up", value: "1 compose cmd" },
    ],
    githubUrl: "https://github.com/MohdRinshadmi/cloud-native-iot-dashboard",
    featured: true,
  },
  {
    slug: "ai-life-assistant",
    title: "AI Life Assistant Super App",
    tagline: "The Node.js API layer for a voice-first assistant — streaming, tools, and RAG.",
    description:
      "A Node.js/TypeScript API layer for a voice-first AI assistant: streaming LLM responses, speech-to-text and TTS orchestration, server-side tool/function calling, and Python ingestion pipelines feeding HNSW-indexed pgvector retrieval.",
    image: "/images/projects/ai-life-assistant.png",
    platform: "BACKEND · AI · RAG",
    year: "2024",
    role: "Solo developer",
    timeline: "Self-initiated · Self-hosted",
    categories: ["Backend", "AI"],
    overview:
      "The API layer for a voice-first AI assistant, built in Node.js and TypeScript: Gemini responses streamed to the client, speech-to-text and TTS orchestrated server-side, and tool/function calling executed on the server rather than trusted to the browser. Python data-ingestion pipelines handle chunking and embedding generation; retrieval runs on PostgreSQL + pgvector with an HNSW index over thousands of documents. JWT refresh-token rotation and Redis rate limiting sit at the edge, and a Next.js App Router client consumes the streaming endpoints.",
    problem:
      "A voice assistant makes the backend's latency visible. Answers have to start arriving before they're finished, retrieval has to keep up with speech, tool calls have to run somewhere trustworthy, and none of it can be left open to abuse.",
    approach:
      "Treat streaming as an API design constraint, not a UI trick. Keep tool execution server-side where credentials live. Push chunking and embedding into Python pipelines that run offline, so the request path only ever does a vector lookup.",
    solution:
      "Built the Node.js API layer for a voice-first AI assistant — streaming LLM responses, speech-to-text and TTS orchestration, and server-side tool/function calling. Built Python data-ingestion pipelines and pgvector retrieval: chunking, embedding generation, and HNSW-indexed semantic search over thousands of documents. Secured the API with JWT refresh-token rotation and Redis rate limiting, and built the Next.js App Router client on the streaming endpoints.",
    architecture: {
      summary:
        "Speech enters the Node.js API, which owns JWT refresh-token rotation and Redis rate limiting before anything reaches a model. The API streams Gemini completions back token by token and executes tool/function calls server-side. Grounding comes from a RAG path built offline by Python ingestion pipelines — chunk, embed, store — and read online as an HNSW-indexed pgvector lookup over thousands of documents. The answer returns as text and as TTS audio; the Next.js App Router client renders the stream.",
      nodes: [
        { id: "client", label: "Next.js Client", sub: "App Router · streams" },
        { id: "api", label: "Node.js API", sub: "JWT rotation · rate limit", critical: true },
        { id: "gemini", label: "Gemini", sub: "stream · server-side tools", critical: true },
        { id: "rag", label: "pgvector · HNSW", sub: "Python ingestion" },
        { id: "tts", label: "STT / TTS", sub: "voice in, voice out" },
      ],
    },
    challenges: [
      "Holding a streaming response open through server-side tool calls without the connection or the client's state falling apart.",
      "Making retrieval fast enough to sit inside a spoken turn — a sequential vector scan is far too slow at conversational pace.",
      "Rotating refresh tokens safely under concurrent requests, so one racing client can't invalidate its own session.",
    ],
    performance: [
      {
        label: "Response delivery",
        before: "Wait for the full completion, then respond",
        after: "Token-by-token streaming from the API",
      },
      {
        label: "Retrieval",
        before: "Sequential scan across the embedding table",
        after: "HNSW-indexed pgvector search over thousands of documents",
      },
    ],
    results: [
      "A voice-in, voice-out API: streaming completions, server-side tool calling, and TTS orchestration behind one interface.",
      "Offline Python ingestion feeding HNSW-indexed semantic search, with JWT rotation and Redis rate limiting at the edge.",
    ],
    lessons: [
      "Streaming is an architecture decision that reaches all the way down to the API contract — retrofitting it is a rewrite.",
      "Tool calls belong on the server. That's where the credentials are, and where you can still say no.",
    ],
    tags: ["Node.js", "TypeScript", "Python", "pgvector · HNSW", "Gemini API"],
    stack: [
      { label: "API & runtime", items: ["Node.js", "TypeScript", "Streaming responses", "Server-side tool / function calling"] },
      { label: "Data & retrieval", items: ["Python data-ingestion pipelines", "PostgreSQL + pgvector", "HNSW indexing", "Chunking & embedding generation"] },
      { label: "Security & client", items: ["JWT refresh-token rotation", "Redis rate limiting", "Next.js (App Router)", "React"] },
    ],
    metrics: [
      { label: "Vector index", value: "HNSW" },
      { label: "Corpus", value: "1,000s of docs" },
      { label: "Delivery", value: "Streamed" },
    ],
    githubUrl: "https://github.com/MohdRinshadmi/ai-life-assistant",
    featured: true,
  },
  {
    slug: "realtime-collab-platform",
    title: "Real-Time Collaboration Platform",
    tagline: "A stateless WebSocket fan-out server that scales without sticky sessions.",
    description:
      "A stateless WebSocket server with channel-based routing over Redis Pub/Sub — scaling horizontally without sticky sessions — carrying Yjs CRDT document sync, presence signals, and streaming LLM summarization behind JWT/OAuth.",
    image: "/images/projects/realtime-collab-platform.png",
    platform: "BACKEND · REAL-TIME · DISTRIBUTED",
    year: "2024",
    role: "Solo developer",
    timeline: "Self-initiated · Self-hosted",
    categories: ["Backend", "Real-time"],
    overview:
      "A real-time collaboration backend built to scale sideways. The WebSocket server holds no session state: connections route by channel, and Redis Pub/Sub fans messages across every instance, so adding a node needs no sticky sessions and no shared memory. Document sync runs on Yjs CRDTs for conflict-free convergence, presence rides the same channels, and streaming LLM summarization is gated by JWT/OAuth. Playwright drives the whole thing end to end.",
    problem:
      "A stateful WebSocket server is a scaling dead end: pin users to instances and you inherit sticky sessions, uneven load, and a failover that drops everyone connected. Meanwhile concurrent editors need their changes to converge, not to overwrite each other.",
    approach:
      "Take state out of the socket layer entirely — route by channel, fan out through Redis Pub/Sub, and let every instance be interchangeable. Push correctness down into CRDTs so convergence is a property of the data type rather than a lock protocol to babysit.",
    solution:
      "Built a stateless WebSocket fan-out server with channel-based routing and Redis Pub/Sub, scaling horizontally without sticky sessions. Implemented CRDT document sync with Yjs for conflict-free convergence, plus presence signals and streaming LLM summarization gated by JWT/OAuth. Wrote end-to-end Playwright tests for multi-user editing, reconnection, and conflict resolution.",
    architecture: {
      summary:
        "Clients connect to any instance — no affinity required. Each socket subscribes to channels, and Redis Pub/Sub carries every message to every instance holding a subscriber, so horizontal scaling needs no sticky sessions. Yjs CRDT updates travel those channels and converge conflict-free wherever they land; presence signals ride alongside. Streaming LLM summarization sits behind JWT/OAuth. Playwright exercises multi-user editing, reconnection, and conflict resolution end to end.",
      nodes: [
        { id: "clients", label: "Clients", sub: "any instance · no affinity" },
        { id: "ws", label: "WS Server", sub: "stateless · channel routing", critical: true },
        { id: "pubsub", label: "Redis Pub/Sub", sub: "cross-instance fan-out", critical: true },
        { id: "crdt", label: "Yjs CRDT", sub: "conflict-free convergence" },
        { id: "ai", label: "Streaming LLM", sub: "summarize · JWT/OAuth" },
      ],
    },
    challenges: [
      "Fanning updates across instances without duplicating deliveries or losing them when a node restarts mid-broadcast.",
      "Reconnecting a client cleanly — replaying what it missed and converging its CRDT state without a full document resend.",
      "Testing concurrency honestly: two real browsers, real network drops, and an assertion that both documents actually agree.",
    ],
    performance: [
      {
        label: "Scale-out",
        before: "Stateful sockets pinned by sticky sessions",
        after: "Stateless instances fanning out over Redis Pub/Sub",
      },
      {
        label: "Concurrent edits",
        before: "Lock contention and last-write-wins loss",
        after: "Yjs CRDT convergence — conflict-free by construction",
      },
    ],
    results: [
      "A WebSocket tier that scales by adding instances, with no sticky sessions and no shared session store.",
      "Conflict-free multi-user editing with presence, verified end to end by Playwright across reconnection and conflict scenarios.",
    ],
    lessons: [
      "Statelessness is what makes a real-time tier boring to operate — and boring is the goal.",
      "CRDTs trade a steeper mental model for correctness you never have to page someone about.",
    ],
    tags: ["Node.js", "WebSockets", "Redis Pub/Sub", "Yjs (CRDT)", "Playwright"],
    stack: [
      { label: "Real-time core", items: ["Node.js", "TypeScript", "WebSockets", "Channel-based routing", "Redis Pub/Sub"] },
      { label: "Sync & AI", items: ["Yjs (CRDT)", "Presence signals", "Streaming LLM summarization", "JWT / OAuth"] },
      { label: "Data & delivery", items: ["PostgreSQL + pgvector", "Docker", "Playwright e2e", "React", "Next.js"] },
    ],
    metrics: [
      { label: "Sockets", value: "Stateless" },
      { label: "Fan-out", value: "Redis Pub/Sub" },
      { label: "Convergence", value: "CRDT" },
    ],
    githubUrl: "https://github.com/MohdRinshadmi/ai-real-time-collaboration",
    featured: true,
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
