/* ============================================================================
   THE DOCUMENTARY — homepage narrative content.

   The homepage reads as the opening chapter of a documentary about a product
   engineer: a prologue, five chapters, an epilogue. Voice rules: first person,
   concrete, no buzzwords, every claim résumé-backed. Components render this
   verbatim — copy edits happen here, not in JSX.
   ========================================================================== */

export const prologue = {
  /** Colophon plate across the top of the cover — an instrument readout that
      sheds cells as the viewport narrows (index + name + status always survive). */
  meta: {
    index: "01",
    edition: "Ed. 2026",
    name: "Mohammed Rinshad",
    role: "Full-stack web & mobile engineering",
    location: "Palakkad, IN",
    coords: "10.79°N",
    status: "Available",
  },
  /** Masthead introduction. Reads "I am Rinshad, full-stack engineer." —
      a light greeting line (name in serif italic), then two heavy lines. */
  headline: {
    intro: "I am",
    name: "Rinshad",
    lines: ["full-stack web", "& mobile engineer"],
  },
  byline:
    "Mohammed Rinshad — full-stack web & mobile engineer. Two and a half years, twenty-plus production features shipped. This is how the work actually happens.",
  availability: "Open to AI & full-stack engineering roles",
  scrollCue: "Scroll to begin",
  /** Vertical project reel — the cover photograph, in motion. Placeholder art
      (picsum seeds keep the same photo every build) until real shots exist. */
  reel: {
    cta: "View all projects",
    href: "/work",
    items: [
      {
        src: "https://picsum.photos/seed/rinshad-copilot/720/540?grayscale",
        width: 720,
        height: 540,
        label: "AI Life Assistant — streaming copilot",
      },
      {
        src: "https://picsum.photos/seed/rinshad-collab/720/620?grayscale",
        width: 720,
        height: 620,
        label: "Real-time collaboration — CRDT editor",
      },
      {
        src: "https://picsum.photos/seed/rinshad-telemetry/720/460?grayscale",
        width: 720,
        height: 460,
        label: "IoT analytics — React + Go platform",
      },
      {
        src: "https://picsum.photos/seed/rinshad-systems/720/560?grayscale",
        width: 720,
        height: 560,
        label: "Systems & architecture",
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
    "Some engineers collect technologies. I collect shipped systems — twenty-some of them over the last two and a half years, across web and mobile: streaming AI copilots, conflict-free collaborative editors, React Native apps, and a cloud-native analytics platform engineered on Clean Architecture to scale.",
    "Each one started messy. A vague brief, an impossible latency budget, a codebase mid-migration. The work is the same every time: understand the problem until it stops being scary, draw the system before writing the code, then ship, watch it break, and stay until it doesn't.",
  ],
  quote: "The fastest way to understand a system is to ship it — and stay until it stops breaking.",
  /** Editorial footnotes — quiet, annotated facts instead of counters. */
  footnotes: [
    {
      mark: "1",
      fact: "20+ production features",
      gloss: "across eCommerce, LMS, and AI platforms — React, React Native, and Node.js",
    },
    {
      mark: "2",
      fact: "35% lower API latency",
      gloss: "40+ Express endpoints — SQL query optimization, JWT auth, structured error handling",
    },
    {
      mark: "3",
      fact: "2,000+ monthly transactions",
      gloss: "Stripe, PayPal, and Razorpay with webhook-driven order lifecycle management",
    },
  ],
} as const;

/* ── Chapter 02 — Behind the Interfaces ─────────────────────────────────── */
export const chapterInterfaces = {
  number: "02",
  title: "Behind the Interfaces",
  intro:
    "Every polished interface hides an argument about how it should work. Here is one product — a streaming AI copilot — from first complaint to shipped system.",
  stages: [
    {
      step: "Problem",
      title: "The assistant froze.",
      body: "Users asked the copilot hard questions, and the UI answered with a spinner. Long, tool-heavy runs locked the screen for thirty seconds. People didn't distrust the answers — they distrusted the silence.",
      detail: "“Is it doing anything?” appeared in feedback eleven times in one week.",
    },
    {
      step: "Thinking",
      title: "Streaming isn't a feature.",
      body: "It's the architecture. If tokens arrive over seconds, then partial messages, cancellation, and tool-call traces aren't edge cases — they are the primary states of the interface. Design for them first and the spinner problem disappears by construction.",
      detail: "The decision: treat every in-flight state as first-class UI.",
    },
    {
      step: "Architecture",
      title: "Draw the system before the screens.",
      body: "A streaming gateway fans requests out to Gemini and to tool endpoints. Tokens and tool events flow back through React Server Components; a small agent-state store owns retries, cancellation, and partial-message hydration.",
      detail: "Client ⇄ AI gateway ⇄ models + tools, with state that survives interruption.",
    },
    {
      step: "Execution",
      title: "Make the partial states beautiful.",
      body: "Tokens hydrate into the message without layout shift. A run cancelled mid-stream reconciles cleanly instead of leaving half a sentence. Tool calls render inline as they happen — the agent visibly doing its work.",
      detail: "The hardest bug: reconciling a half-rendered message after cancel.",
    },
    {
      step: "Impact",
      title: "The silence disappeared.",
      body: "First token in under a second. Three input modes in one composer. And the agent-state primitives built for this copilot now power every conversation surface in the product.",
      detail: "Perceived latency: 30s of spinner → sub-second first token.",
    },
  ],
} as const;

/* ── Chapter 03 — Systems Thinking ──────────────────────────────────────── */
export const chapterSystems = {
  number: "03",
  title: "Systems Thinking",
  paragraphs: [
    "A screen is the last mile of a much longer system. Behind every interface I ship there are APIs holding contracts, sockets carrying live state, queues absorbing failure, and — increasingly — models reasoning in the loop.",
    "I engineer that whole path. Not because full-stack is a job title, but because latency, trust, and reliability are decided everywhere except the screen.",
  ],
  /** The canvas chain — drawn top to bottom as the reader scrolls. */
  nodes: [
    { id: "users", label: "People", sub: "the only metric that matters" },
    { id: "apps", label: "Interfaces", sub: "React · Next.js · React Native" },
    { id: "apis", label: "APIs", sub: "Node.js · typed contracts" },
    { id: "realtime", label: "Real-time", sub: "WebSockets · CRDTs · presence" },
    { id: "cloud", label: "Cloud", sub: "AWS · Docker · event-driven workers" },
    { id: "ai", label: "AI", sub: "Gemini · RAG · tool calling" },
  ],
  closing: "Ecosystems, not screens.",
} as const;

/* ── Chapter 04 — Selected Work ─────────────────────────────────────────── */
export const chapterWork = {
  number: "04",
  title: "Selected Work",
  intro: "Three self-initiated systems built to explore production patterns — the problem, the difficulty, and what changed.",
  /** Editorial framing per featured project, keyed by slug. */
  features: {
    "ai-life-assistant": {
      kicker: "Feature · Voice-first AI",
      hook: "A voice-first assistant that streams its answers — grounded in thousands of embedded documents.",
      difficulty: "Voice, streaming, and retrieval had to feel like one calm surface — and retrieval had to be fast enough to keep up with speech.",
      outcome: "Sub-second first token, sub-second RAG retrieval via HNSW, and a voice-to-voice loop, running live.",
    },
    "realtime-collab-platform": {
      kicker: "Feature · Real-time collaboration",
      hook: "Many hands in one document, no conflicts — with AI waiting quietly inline.",
      difficulty: "Broadcasting CRDT updates across multiple stateless server instances, conflict-free, with many clients editing at once.",
      outcome: "Conflict-free editing with live presence, fanned out via Redis Pub/Sub and verified end-to-end with Playwright — and AI that never interrupts typing.",
    },
    "iot-analytics-dashboard": {
      kicker: "Feature · Cloud-native platform",
      hook: "A React-over-Go platform built architecture-first — Clean Architecture, 15+ REST APIs, ready to scale.",
      difficulty: "The system had to stay extensible — a clean split between transport, domain, and data that could grow into real-time and microservices without a rewrite.",
      outcome: "15+ Go REST APIs and 25+ reusable React components behind a type-safe contract; six services one Docker Compose up away.",
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
      statement: "Build for people.",
      gloss: "Latency budgets and error states are empathy, written in code.",
    },
    {
      statement: "Design for reliability.",
      gloss: "The system you draw before coding is the one that survives production.",
    },
    {
      statement: "Obsess over details.",
      gloss: "The last 10% — the reconciled cancel, the unshifted layout — is the product.",
    },
    {
      statement: "Optimize before scaling.",
      gloss: "A 40% render cut bought more headroom than any bigger server would have.",
    },
    {
      statement: "Ship and learn.",
      gloss: "Production is the only honest reviewer. Get there early, listen hard.",
    },
  ],
} as const;

/* ── Epilogue ───────────────────────────────────────────────────────────── */
export const epilogue = {
  statement: "Every product starts as an unfinished idea.",
  invitation: "If you're building something ambitious, I'd love to hear about it.",
} as const;
