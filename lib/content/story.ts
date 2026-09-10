/* ============================================================================
   THE DOCUMENTARY — homepage narrative content.

   The homepage reads as a short documentary about a production engineer: a
   cover, five chapters, an ending. Voice rules: first person, concrete, no
   buzzwords, every claim backed by the résumé
   (public/MohdRinshad_FullStackEngineer_Resume.pdf) or checkable in a linked
   repository. Components render this verbatim — copy edits happen here.

   Positioning: Full-Stack Software Engineer who designs, ships, and operates
   production systems end to end — backend, cloud, distributed systems and
   AI/LLM lead; the React / Next.js / React Native clients follow.
   ========================================================================== */

export const prologue = {
  /** Colophon plate across the top of the cover — an instrument readout that
      sheds cells as the viewport narrows (index + name + status always survive). */
  meta: {
    index: "01",
    edition: "Ed. 2026",
    name: "Mohammed Rinshad",
    role: "Full-stack software engineering",
    location: "Palakkad, India",
    coords: "UTC+5:30",
    status: "Available",
  },
  /** Masthead introduction. Reads "I am Rinshad, full-stack software engineer."
      — a light greeting line (name in serif italic), then two heavy lines. */
  headline: {
    intro: "I am",
    name: "Rinshad",
    lines: ["full-stack", "software engineer"],
  },
  /** WHAT — the areas, in the order the résumé headline weights them. */
  focus: "Backend · Cloud · Distributed systems · AI/LLM",
  /** VALUE — one sentence, then the evidence behind it. */
  value: "3+ years designing, shipping and operating production systems end to end.",
  support:
    "REST APIs, MySQL data layers and payment infrastructure on AWS, the React and React Native clients that consume them — and self-built distributed systems in Go, Python and pgvector.",
  /** TECHNOLOGY — the résumé headline's stack. */
  stack: ["TypeScript", "Node.js", "Python", "Go", "React Native", "AWS", "Docker"],
  cta: {
    work: { label: "View projects", href: "/work" },
    resume: { label: "Download résumé" },
    talk: { label: "Let's talk", href: "/contact" },
  },
  availability: "Open to full-stack & backend roles · Remote or relocation",
  scrollCue: "Scroll to begin",
  /** The cover portrait — right column on desktop, below the introduction on phones. */
  portrait: {
    src: "/images/rinshad-portrait-v2.jpg",
    alt: "Portrait of Mohammed Rinshad, full-stack software engineer",
    width: 1200,
    height: 1277,
  },
  /** Vertical project reel revealed when the portrait is hovered. One still per
      featured project, all served from /public — remote placeholders cost a
      third-party DNS + TLS hop on the homepage's critical path. */
  reel: {
    items: [
      {
        src: "/images/projects/iot-analytics-dashboard.png",
        width: 2400,
        height: 1800,
        label: "IoT telemetry — Golang on Clean Architecture",
      },
      {
        src: "/images/projects/ai-life-assistant.png",
        width: 2400,
        height: 1800,
        label: "AI Life Assistant — streaming Node.js API",
      },
      {
        src: "/images/projects/realtime-collab-platform.png",
        width: 2400,
        height: 1800,
        label: "Real-time collaboration — stateless WebSocket tier",
      },
    ],
  },
} as const;

/* ── Chapter 01 — In Production ─────────────────────────────────────────── */
export const chapterProduction = {
  number: "01",
  title: "In Production",
  /** Scrubbed word by word — the chapter's one long sentence. */
  intro:
    "Most of what I own is invisible: endpoints, schemas with foreign keys that hold, payment webhooks that survive a retry, releases that go out with zero downtime. People only notice it when it isn't there.",
  achievementsLabel: "Key achievements",
  alsoLabel: "Also owned",
  quote: "Nobody thanks you for the index. They just stop complaining about the page.",
  more: { label: "Full experience & education", href: "/about#experience" },
} as const;

/* ── Chapter 02 — Behind the Interfaces ─────────────────────────────────── */
export const chapterInterfaces = {
  number: "02",
  title: "Behind the Interfaces",
  intro:
    "One production system, start to finish: the sync backend for an offline-first geolocation tracker — from the first bug report to something that survives a dead network.",
  stages: [
    {
      step: "Challenge",
      title: "The field has no signal.",
      body: "Workforce tracking assumes a connection the field doesn't have. Devices went into warehouses and out past coverage, then came back hours later with a backlog of location points and no safe way to hand them over.",
      detail: "A device offline for four hours is not an edge case. It is Tuesday.",
    },
    {
      step: "Decision",
      title: "Every upload will arrive twice.",
      body: "If the client buffers and retries, the same write eventually lands more than once — from the retry that timed out and from the one that worked. So idempotency became the design, not a feature: every write had to be safe to repeat.",
      detail: "No upload is ever assumed to have happened exactly once.",
    },
    {
      step: "Architecture",
      title: "Batch, write idempotently, retry.",
      body: "Devices buffer points locally and upload them in batches instead of one request per fix. The sync endpoint treats each batch as replayable, so a repeat lands as a no-op instead of a second row; failed batches back off and try again.",
      detail: "Device buffer → batched upload → idempotent write → acknowledged.",
    },
    {
      step: "Implementation",
      title: "Make recovery the normal path.",
      body: "React Native captures location in the background and buffers it while offline. The backend accepts the same batch any number of times, and both sides converge without anyone reconciling data by hand.",
      detail: "The test that mattered: the same batch twice changes nothing.",
    },
    {
      step: "Result",
      title: "Outages stopped being incidents.",
      body: "Recovery now survives prolonged network outages instead of losing the window, and the React Native apps are shipped and maintained on Google Play and the App Store with background capture and local buffering.",
      detail: "Prolonged outage → complete history, rebuilt on reconnect.",
    },
  ],
} as const;

/* ── Chapter 03 — Selected Work ─────────────────────────────────────────── */
export const chapterWork = {
  number: "03",
  title: "Selected Work",
  intro:
    "Three self-built systems, each owned end to end — architecture, backend, infrastructure and client: the problem, the decision that mattered, and a result you can check in the code. Personal projects on self-hosted infrastructure, with no commercial users.",
} as const;

/* ── Chapter 04 — How I build production systems ───────────────────────── */
export const chapterSystems = {
  number: "04",
  title: "How I build production systems",
  paragraph:
    "A screen is the last mile of a much longer system. I work closest to the middle — the contracts, schemas, caches and containers where latency and reliability are decided long before anything renders.",
  closing: "Systems, not screens.",
  languages: ["TypeScript", "JavaScript", "Python", "Go", "SQL"],
  quality: ["Jest", "Vitest", "Playwright", "Postman", "End-to-end & API testing", "Sentry", "Debugging & profiling"],
  practices: ["Technical ownership", "Architecture & design decisions", "Code review", "Technical documentation", "Agile/Scrum"],
  /** Client → AI, top to bottom. Every item is on the résumé's skills list. */
  layers: [
    {
      id: "client",
      label: "Client",
      role: "Interfaces built against a shared, typed API contract.",
      tech: ["React", "Next.js", "React Native", "TanStack Query", "Tailwind CSS", "Web performance"],
    },
    {
      id: "api",
      label: "API",
      role: "Contracts, validation and auth at the edge.",
      tech: ["Node.js", "Express", "FastAPI", "Go · Gin", "REST", "JWT / OAuth", "RBAC", "Rate limiting"],
    },
    {
      id: "realtime",
      label: "Real-time & events",
      role: "Events that fan out across instances and survive a retry.",
      tech: ["WebSockets", "Redis Pub/Sub", "Webhooks", "Background jobs", "Idempotency", "Horizontal scaling"],
    },
    {
      id: "data",
      label: "Data",
      role: "Schemas, indexes and caches that hold under peak load.",
      tech: ["PostgreSQL", "MySQL", "Redis", "pgvector", "MongoDB", "Sequelize", "GORM", "Migrations"],
    },
    {
      id: "infra",
      label: "Cloud & infrastructure",
      role: "Services that deploy with zero downtime, then restart and report on their own.",
      tech: [
        "AWS (EC2 · S3 · IAM · CloudWatch)",
        "Docker",
        "GitHub Actions CI/CD",
        "Nginx (load balancing · SSL/TLS)",
        "PM2",
        "Linux/VPS",
        "Observability & alerting",
      ],
    },
    {
      id: "ai",
      label: "AI engineering",
      role: "Retrieval and model calls held to the same API discipline.",
      tech: ["LLM APIs (Gemini · Groq · Ollama)", "RAG", "Embeddings", "pgvector · HNSW", "Tool calling", "Streaming", "LangChain"],
    },
  ],
} as const;

/* ── Chapter 05 — Principles ────────────────────────────────────────────── */
export const chapterPrinciples = {
  number: "05",
  title: "Principles",
  intro: "Five rules the work keeps teaching me.",
  items: [
    {
      statement: "Start at the schema.",
      gloss: "Every shortcut in the data model is a bill the whole system pays, monthly, forever.",
    },
    {
      statement: "Read the query plan first.",
      gloss: "35% came off average response time across 40+ endpoints — from indexes and a cache, not a bigger box.",
    },
    {
      statement: "Design for the retry.",
      gloss: "Assume every request arrives twice and none of them are in order. Make the write idempotent and it doesn't matter.",
    },
    {
      statement: "Keep the boundaries honest.",
      gloss: "Handlers know nothing about the ORM. Services know nothing about HTTP. That is the whole trick.",
    },
    {
      statement: "Own it in production.",
      gloss: "Production is the only honest reviewer. Ship with zero downtime, log structurally, watch the alerts.",
    },
  ],
} as const;

/* ── Epilogue — contact ─────────────────────────────────────────────────── */
export const epilogue = {
  eyebrow: "Contact",
  statement: "Hiring for backend or full-stack? Let's talk.",
  invitation:
    "Open to full-stack and backend engineering roles — remote, or relocating to Europe, the UK or the UAE. Email is the fastest route.",
} as const;
