/* ============================================================================
   THE DOCUMENTARY — homepage narrative content.

   The homepage reads as the opening chapter of a documentary about a backend
   engineer: a prologue, five chapters, an epilogue. Voice rules: first person,
   concrete, no buzzwords, every claim résumé-backed. Components render this
   verbatim — copy edits happen here, not in JSX.

   Positioning (from the résumé): Full-Stack Software Engineer, backend-heavy.
   APIs, schemas, and containerized services lead; the React / Next.js /
   React Native clients follow as the surfaces those APIs serve.
   ========================================================================== */

export const prologue = {
  /** Colophon plate across the top of the cover — an instrument readout that
      sheds cells as the viewport narrows (index + name + status always survive). */
  meta: {
    index: "01",
    edition: "Ed. 2026",
    name: "Mohammed Rinshad",
    role: "Full-stack software engineering",
    location: "Palakkad, IN",
    coords: "10.79°N",
    status: "Available",
  },
  /** Masthead introduction. Reads "I am Rinshad, full-stack software engineer."
      — a light greeting line (name in serif italic), then two heavy lines. */
  headline: {
    intro: "I am",
    name: "Rinshad",
    lines: ["full-stack", "software engineer"],
  },
  byline:
    "Mohammed Rinshad — full-stack software engineer, backend-heavy. Three years of production REST APIs, relational schemas, and containerized services. This is how the work actually happens.",
  availability: "Open to backend & full-stack engineering roles",
  scrollCue: "Scroll to begin",
  /** The cover portrait — right column on desktop, above the masthead on phones. */
  portrait: {
    src: "/images/rinshad-portrait-v2.jpg",
    alt: "Portrait of Mohammed Rinshad, full-stack software engineer",
    width: 1200,
    height: 1277,
  },
  /** Vertical project reel — the cover photograph, in motion. One still per
      featured project, all served from /public. Keep it that way: remote
      placeholders cost a third-party DNS + TLS hop on the homepage's critical
      path and force a `remotePatterns` entry in next.config. */
  reel: {
    cta: "View all projects",
    href: "/work",
    items: [
      {
        src: "/images/projects/analytics-dashboard.svg",
        width: 1280,
        height: 800,
        label: "IoT telemetry — Golang on Clean Architecture",
      },
      {
        src: "/images/projects/ai-life-assistant.png",
        width: 1911,
        height: 836,
        label: "AI Life Assistant — streaming Node.js API",
      },
      {
        src: "/images/projects/collab-editor.svg",
        width: 1280,
        height: 800,
        label: "Real-time collaboration — stateless WebSocket tier",
      },
    ],
  },
} as const;

/* ── Chapter 01 — The Builder ───────────────────────────────────────────── */
export const chapterBuilder = {
  number: "01",
  title: "The Builder",
  /** Large scrubbed paragraphs — the narrative spine. */
  paragraphs: [
    "Most of what I've built is invisible. Forty-plus REST endpoints. Relational schemas with foreign keys that actually hold. Payment webhooks that survive a retry. Containers behind Nginx that come back up on their own. Users never see any of it — they only feel it when it isn't there.",
    "Every one of those systems started messy: a vague brief, a query plan nobody had read, a schema mid-migration. The work is the same every time — understand the data until it stops being scary, draw the contract before writing the handler, then ship, watch it break, and stay until it doesn't.",
  ],
  quote: "Nobody thanks you for the index. They just stop complaining about the page.",
  /** Editorial footnotes — quiet, annotated facts instead of counters. */
  footnotes: [
    {
      mark: "1",
      fact: "40+ REST endpoints",
      gloss: "Express.js and Sequelize — middleware validation, JWT auth, SQL query and index optimization",
    },
    {
      mark: "2",
      fact: "35% lower response time",
      gloss: "average across the API, from reading query plans rather than adding servers",
    },
    {
      mark: "3",
      fact: "2,000+ monthly transactions",
      gloss: "Stripe, PayPal, and Razorpay — webhook-driven lifecycles, signature verification, safe retries",
    },
  ],
} as const;

/* ── Chapter 02 — Behind the Interfaces ─────────────────────────────────── */
export const chapterInterfaces = {
  number: "02",
  title: "Behind the Interfaces",
  intro:
    "Every working product hides an argument about how it should fail. Here is one system — the sync backend for an offline-first geolocation tracker — from first bug report to something that survives a dead network.",
  stages: [
    {
      step: "Problem",
      title: "The field has no signal.",
      body: "Workforce tracking assumes a connection. The field doesn't have one. Devices went underground, into warehouses, out past coverage — and came back hours later with a backlog of location points and no safe way to hand them over.",
      detail: "A truck offline for four hours is not an edge case. It is Tuesday.",
    },
    {
      step: "Thinking",
      title: "Assume the network is already gone.",
      body: "If the client buffers locally and uploads later, then every write arrives twice eventually — once from the retry that timed out, once from the retry that worked. Idempotency isn't a nice-to-have here; it's the whole design. Make the write safe to repeat and the outage stops being a data-integrity problem.",
      detail: "The decision: no upload is ever assumed to have happened once.",
    },
    {
      step: "Architecture",
      title: "Batch, deduplicate, retry.",
      body: "The device buffers points locally and uploads them in batches rather than one chatty request per fix. The sync endpoint treats every batch as replayable — duplicate-safe writes keyed so a repeat lands as a no-op instead of a second row. Failed batches back off and come around again.",
      detail: "Device buffer → batched upload → duplicate-safe write → acknowledged.",
    },
    {
      step: "Execution",
      title: "Make the recovery boring.",
      body: "React Native captures location in the background and buffers locally when there's nothing to talk to. The backend absorbs whatever arrives whenever it arrives, in any order, more than once. Both stores end up agreeing, and nobody has to reconcile anything by hand on Monday morning.",
      detail: "The hardest part: proving the same batch twice changes nothing.",
    },
    {
      step: "Impact",
      title: "Outages stopped being incidents.",
      body: "Tracking now survives prolonged network outages instead of losing the window. The apps went to the Play Store and the App Store with background capture and local buffering, and the recovery path is the same one that runs on a good day — because it always runs.",
      detail: "Prolonged outage → complete history, reconstructed on reconnect.",
    },
  ],
} as const;

/* ── Chapter 03 — Systems Thinking ──────────────────────────────────────── */
export const chapterSystems = {
  number: "03",
  title: "Systems Thinking",
  paragraphs: [
    "A screen is the last mile of a much longer system. Behind every interface there is a schema deciding what is even expressible, an API holding a contract, a cache absorbing load, a container that has to come back up on its own — and increasingly, a model reasoning in the loop.",
    "I work closest to that middle. Not because backend is a job title, but because latency, correctness, and reliability are decided long before anything reaches a screen.",
  ],
  /** The canvas chain — drawn top to bottom as the reader scrolls. */
  nodes: [
    { id: "clients", label: "Clients", sub: "React · Next.js · React Native" },
    { id: "apis", label: "REST APIs", sub: "Express · typed contracts · JWT" },
    { id: "services", label: "Services", sub: "Clean Architecture · DI" },
    { id: "data", label: "Data", sub: "MySQL · PostgreSQL · schema design" },
    { id: "cache", label: "Cache & events", sub: "Redis · Pub/Sub · background jobs" },
    { id: "infra", label: "Infrastructure", sub: "Docker · Nginx · PM2 · AWS" },
  ],
  closing: "Systems, not screens.",
} as const;

/* ── Chapter 04 — Selected Work ─────────────────────────────────────────── */
export const chapterWork = {
  number: "04",
  title: "Selected Work",
  intro:
    "Three self-directed backends on self-hosted, open-source infrastructure — the problem, the difficulty, and what changed. No commercial users, and no claim of any.",
  /** Editorial framing per featured project, keyed by slug. */
  features: {
    "iot-analytics-dashboard": {
      kicker: "Feature · Golang & Clean Architecture",
      hook: "A Go backend where the ORM never leaks upward and the index matches the query.",
      difficulty: "High-frequency telemetry has to stay queryable as tables grow, inside a structure that separates transport, domain, and storage well enough to survive changing requirements.",
      outcome: "Gin over a Clean-Architecture service layer with DI, GORM repositories on indexed time-series tables, and the whole stack one Docker Compose command away.",
    },
    "ai-life-assistant": {
      kicker: "Feature · Streaming API & RAG",
      hook: "A Node.js API that starts answering before it has finished thinking.",
      difficulty: "Holding a streaming response open through server-side tool calls, while retrieval keeps pace with speech and the edge stays closed to abuse.",
      outcome: "Token-by-token streaming, server-side tool calling, Python ingestion into HNSW-indexed pgvector, and JWT rotation with Redis rate limiting at the door.",
    },
    "realtime-collab-platform": {
      kicker: "Feature · Distributed real-time",
      hook: "A WebSocket tier with no memory of its own — so you can just add another one.",
      difficulty: "Fanning updates across interchangeable instances without sticky sessions, while concurrent edits converge instead of overwriting each other.",
      outcome: "Stateless sockets over Redis Pub/Sub, Yjs CRDT convergence, and Playwright driving real browsers through reconnection and conflict.",
    },
  } as Record<string, { kicker: string; hook: string; difficulty: string; outcome: string }>,
  readCta: "Read the story",
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
      gloss: "35% of average response time came off an API without anyone provisioning a bigger box.",
    },
    {
      statement: "Design for the retry.",
      gloss: "Assume every request arrives twice and none of them are in order. Then it doesn't matter.",
    },
    {
      statement: "Keep the boundaries honest.",
      gloss: "Handlers know nothing about the ORM. Services know nothing about HTTP. That is the whole trick.",
    },
    {
      statement: "Ship it and watch it.",
      gloss: "Production is the only honest reviewer. Get there early, log structurally, listen hard.",
    },
  ],
} as const;

/* ── Epilogue ───────────────────────────────────────────────────────────── */
export const epilogue = {
  statement: "Every system starts as an unfinished idea.",
  invitation: "If you're building something ambitious, I'd love to hear about it.",
} as const;
