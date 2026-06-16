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
    role: "AI-native product engineering",
    location: "Palakkad, IN",
    coords: "10.79°N",
    status: "Available",
  },
  /** Masthead introduction. Reads "I am Rinshad, full-stack engineer." —
      a light greeting line (name in serif italic), then two heavy lines. */
  headline: {
    intro: "I am",
    name: "Rinshad",
    lines: ["full-stack", "engineer"],
  },
  byline:
    "Mohammed Rinshad — product engineer. Two and a half years, twenty-plus systems shipped. This is how the work actually happens.",
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
        label: "IoT telemetry — 10k devices, 60fps",
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

/** The "living artifact" — the evolution every product goes through. */
export const artifactLayers = [
  {
    key: "idea",
    label: "Idea",
    note: "“What if the assistant showed its work — every tool call, live, as it streams?”",
    caption: "A margin note, before anything exists",
  },
  {
    key: "architecture",
    label: "Architecture",
    note: "Client ⇄ gateway ⇄ models. Streaming first. Cancellation is a feature.",
    caption: "The sketch that decides everything",
  },
  {
    key: "product",
    label: "Shipped",
    note: "Sub-second first token. Tool traces inline. In production, under real load.",
    caption: "What people actually touch",
  },
] as const;

/* ── Chapter 01 — The Builder ───────────────────────────────────────────── */
export const chapterBuilder = {
  number: "01",
  title: "The Builder",
  /** Large scrubbed paragraphs — the narrative spine. */
  paragraphs: [
    "Some engineers collect technologies. I collect shipped systems — twenty-some of them over the last two and a half years: streaming AI copilots, conflict-free collaborative editors, telemetry dashboards that hold sixty frames a second while ten thousand devices report in.",
    "Each one started messy. A vague brief, an impossible latency budget, a codebase mid-migration. The work is the same every time: understand the problem until it stops being scary, draw the system before writing the code, then ship, watch it break, and stay until it doesn't.",
  ],
  quote: "The fastest way to understand a system is to ship it — and stay until it stops breaking.",
  /** Editorial footnotes — quiet, annotated facts instead of counters. */
  footnotes: [
    {
      mark: "1",
      fact: "20+ production systems",
      gloss: "shipped end-to-end on React, Next.js, Node.js, and AWS",
    },
    {
      mark: "2",
      fact: "35% lower API latency",
      gloss: "Node.js services rebuilt around idempotent webhooks and event-driven workers",
    },
    {
      mark: "3",
      fact: "Zero reconciliation failures",
      gloss: "across all Stripe and PayPal billing processed to date",
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
      body: "A streaming gateway fans requests out to Claude and OpenAI and to tool endpoints. Tokens and tool events flow back through React Server Components; a small agent-state store owns retries, cancellation, and partial-message hydration.",
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
    { id: "ai", label: "AI", sub: "Claude · RAG · tool calling" },
  ],
  closing: "Ecosystems, not screens.",
} as const;

/* ── Chapter 04 — Selected Work ─────────────────────────────────────────── */
export const chapterWork = {
  number: "04",
  title: "Selected Work",
  intro: "Three systems, told properly — the problem, the difficulty, and what changed.",
  /** Editorial framing per featured project, keyed by slug. */
  features: {
    "ai-life-assistant": {
      kicker: "Feature · AI copilot",
      hook: "An AI assistant that shows its work — every tool call streamed live into the conversation.",
      difficulty: "Streaming, cancellation, and multimodal input had to feel like one calm surface, not three features fighting.",
      outcome: "Sub-second first token; the agent-state primitives now power every conversation surface.",
    },
    "realtime-collab-platform": {
      kicker: "Feature · Real-time collaboration",
      hook: "Many hands in one large document, no conflicts, with Claude waiting quietly inline.",
      difficulty: "Merging CRDT updates on 10k-node documents without ever letting input latency cross 16 milliseconds.",
      outcome: "Conflict-free editing with live presence in production — and AI help that never interrupts typing.",
    },
    "iot-analytics-dashboard": {
      kicker: "Feature · Live telemetry",
      hook: "Ten thousand devices reporting at once, rendered at sixty frames a second.",
      difficulty: "A firehose of telemetry had to stay readable — and interactive — while the data never stopped arriving.",
      outcome: "Sustained 60fps under burst load, sub-second first paint, and an alert builder operators use without engineers.",
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
