/* ============================================================================
   IMMERSIVE JOURNEY CONTENT
   Positioning (per redesign brief): AI-Augmented React Native Engineer &
   Full-Stack Developer. Web case studies stay in lib/data.ts and power /work;
   this file powers the 3D homepage journey.

   NOTE: GitHub/demo links on flagship projects point at the GitHub profile
   until real repo/store links are supplied — replace before launch.
   ========================================================================== */

export const journeyHero = {
  eyebrow: "REACT NATIVE · FULL-STACK · AI-NATIVE",
  name: "Rinshad",
  fullName: "Mohammed Rinshad M I",
  role: "AI-Augmented React Native Engineer",
  roleTail: "& Full-Stack Developer",
  subline:
    "I build mobile and web products end-to-end — React Native and React front-ends wired to Node.js and Go services, real-time systems, and production LLM integrations.",
  primaryCta: { label: "Enter the work", href: "#command-center" },
  secondaryCta: { label: "Open a channel", href: "#contact-portal" },
} as const;

/* ----------------------------------------------------------------------------
   Career timeline corridor
   -------------------------------------------------------------------------- */
export interface Milestone {
  id: string;
  year: string;
  title: string;
  body: string;
  achievements: string[];
  tech: string[];
}

export const milestones: Milestone[] = [
  {
    id: "m-join",
    year: "2023",
    title: "Production begins",
    body: "Joined Infinite Open Source Solution as a Full-Stack Engineer — owning delivery from Figma to production across React, Next.js, and Node.js.",
    achievements: [
      "First production systems shipped within the first quarter.",
      "Owned features end-to-end: UI, API, data layer, deploy.",
    ],
    tech: ["React", "Next.js", "Node.js", "PostgreSQL"],
  },
  {
    id: "m-typescript",
    year: "2024",
    title: "The TypeScript migration",
    body: "Led a full JS-to-TypeScript migration on a live production codebase — strict typing and type-safe API contracts, with zero downtime.",
    achievements: [
      "Eliminated an entire class of recurring runtime errors.",
      "Type-safe contracts between every client and service.",
    ],
    tech: ["TypeScript", "Zod", "Express"],
  },
  {
    id: "m-library",
    year: "2024",
    title: "The shared component library",
    body: "Architected a shared TypeScript component library used across React and Next.js apps — one design system, twenty-plus consumers.",
    achievements: [
      "Cut feature delivery time 30% across 20+ production systems.",
      "Storybook-driven workflow adopted by the whole team.",
    ],
    tech: ["React", "Storybook", "Tailwind CSS"],
  },
  {
    id: "m-realtime",
    year: "2024",
    title: "Real-time, for real load",
    body: "Engineered WebSocket-driven features — live dashboards, presence, messaging — and the Node.js services behind them, tuned until they held up.",
    achievements: [
      "Cut API latency 35% with caching, indexing, and payload work.",
      "Stripe/PayPal billing with zero reconciliation failures.",
    ],
    tech: ["WebSockets", "Redis", "Node.js", "Docker"],
  },
  {
    id: "m-mobile",
    year: "2025",
    title: "Going native",
    body: "Took products to mobile with React Native — offline-first field tracking, background geolocation, SQLite sync, and native modules where JS can't reach.",
    achievements: [
      "Desklog: offline geolocation tracking with background services.",
      "Conflict-safe SQLite sync queues for unreliable networks.",
    ],
    tech: ["React Native", "SQLite", "Native modules", "Background tasks"],
  },
  {
    id: "m-ai",
    year: "2026",
    title: "AI-native engineering",
    body: "Designing for LLMs as a first-class runtime: streaming copilots, tool calling, RAG, multi-agent systems — with agentic tooling woven into daily delivery.",
    achievements: [
      "Streaming AI features with sub-second perceived latency.",
      "Claude Code, Cursor & Copilot integrated into the team workflow.",
    ],
    tech: ["Claude", "OpenAI", "Vercel AI SDK", "RAG · pgvector"],
  },
];

/* ----------------------------------------------------------------------------
   Skills galaxy — orbital speed and size scale with proficiency (0–100)
   -------------------------------------------------------------------------- */
export interface SkillBody {
  name: string;
  proficiency: number;
}
export interface SkillCluster {
  id: string;
  label: string;
  /** orbit radius of the cluster ring around the core */
  radius: number;
  /** orbital plane tilt in radians — gives the galaxy its depth */
  tilt: number;
  skills: SkillBody[];
}

export const skillClusters: SkillCluster[] = [
  {
    id: "frontend",
    label: "Frontend",
    radius: 3.1,
    tilt: 0.18,
    skills: [
      { name: "React", proficiency: 95 },
      { name: "React Native", proficiency: 90 },
      { name: "TypeScript", proficiency: 92 },
      { name: "Next.js", proficiency: 90 },
    ],
  },
  {
    id: "backend",
    label: "Backend",
    radius: 4.4,
    tilt: -0.26,
    skills: [
      { name: "Node.js", proficiency: 88 },
      { name: "Go · Gin", proficiency: 72 },
      { name: "PostgreSQL", proficiency: 82 },
      { name: "WebSockets", proficiency: 86 },
      { name: "Redis", proficiency: 76 },
    ],
  },
  {
    id: "cloud",
    label: "Cloud",
    radius: 5.7,
    tilt: 0.42,
    skills: [
      { name: "Docker", proficiency: 80 },
      { name: "AWS", proficiency: 75 },
      { name: "CI/CD", proficiency: 82 },
      { name: "Serverless", proficiency: 74 },
    ],
  },
  {
    id: "ai",
    label: "AI",
    radius: 7.0,
    tilt: -0.12,
    skills: [
      { name: "Claude", proficiency: 90 },
      { name: "OpenAI", proficiency: 88 },
      { name: "Gemini", proficiency: 72 },
      { name: "RAG", proficiency: 84 },
      { name: "Real-time AI", proficiency: 86 },
    ],
  },
];

/* ----------------------------------------------------------------------------
   Project command center — flagship modules
   -------------------------------------------------------------------------- */
export interface FlowNode {
  id: string;
  label: string;
  sub: string;
  /** layout position in scene units (x →, y ↑) */
  pos: [number, number];
}
export interface FlowEdge {
  from: string;
  to: string;
  /** packets per second along this edge — busier edges feel hotter */
  rate: number;
}

export interface FlagshipProject {
  slug: string;
  title: string;
  platform: string;
  tagline: string;
  summary: string;
  challenges: string[];
  achievements: string[];
  metrics: { label: string; value: string }[];
  stack: string[];
  links: { label: string; href: string }[];
  architecture: { nodes: FlowNode[]; edges: FlowEdge[] };
}

const GITHUB = "https://github.com/MohdRinshadmi";

export const flagshipProjects: FlagshipProject[] = [
  {
    slug: "desklog",
    title: "Desklog",
    platform: "REACT NATIVE · FIELD OPS",
    tagline: "Offline-first workforce tracking that never loses a point.",
    summary:
      "A field-workforce tracking app where connectivity is never guaranteed. Geolocation is captured in background services, persisted to SQLite, and synced through a conflict-safe queue the moment the network returns — so the timeline an operations team sees is complete, not best-effort.",
    challenges: [
      "Capturing reliable geolocation while the app is backgrounded or killed.",
      "Designing a SQLite sync queue that survives crashes mid-flush.",
      "Keeping battery drain acceptable during all-day tracking shifts.",
    ],
    achievements: [
      "Offline-first architecture — zero data loss across network dropouts.",
      "Background geolocation via headless tasks and native services.",
      "Real-time location updates streamed to the ops dashboard when online.",
    ],
    metrics: [
      { label: "Capture", value: "Offline-first" },
      { label: "Tracking", value: "Background" },
      { label: "Sync", value: "Conflict-safe" },
    ],
    stack: ["React Native", "TypeScript", "SQLite", "Background geolocation", "Node.js", "WebSockets"],
    links: [{ label: "GitHub", href: GITHUB }],
    architecture: {
      nodes: [
        { id: "app", label: "RN Client", sub: "background geo", pos: [-6, 0] },
        { id: "sqlite", label: "SQLite", sub: "local queue", pos: [-3, -1.6] },
        { id: "api", label: "Sync API", sub: "Node.js", pos: [0, 0] },
        { id: "db", label: "PostgreSQL", sub: "source of truth", pos: [3, -1.6] },
        { id: "ws", label: "WebSocket", sub: "live positions", pos: [3, 1.6] },
        { id: "dash", label: "Ops Dashboard", sub: "real-time map", pos: [6, 0] },
      ],
      edges: [
        { from: "app", to: "sqlite", rate: 2.2 },
        { from: "sqlite", to: "api", rate: 1.4 },
        { from: "api", to: "db", rate: 1.2 },
        { from: "api", to: "ws", rate: 1.8 },
        { from: "ws", to: "dash", rate: 2.4 },
      ],
    },
  },
  {
    slug: "ai-life-assistant",
    title: "AI Life Assistant",
    platform: "REACT NATIVE · AI COPILOT",
    tagline: "A voice-first copilot with streaming LLM responses.",
    summary:
      "A super-app assistant that listens, thinks, and streams. Voice input flows through native modules into LLM pipelines with tool calling; responses stream back over WebSockets token by token, with the agent's tool calls rendered live so users see exactly what it's doing.",
    challenges: [
      "Bridging native voice capture into the JS runtime without dropped audio.",
      "Streaming tokens over WebSockets into a 60fps conversation UI.",
      "Cancelling tool-heavy agent runs mid-stream and reconciling state.",
    ],
    achievements: [
      "Sub-second first token via streaming-first architecture.",
      "Voice, text, and image inputs in one composer.",
      "Live agent-trace rendering — transparency users actually trust.",
    ],
    metrics: [
      { label: "First token", value: "<1s" },
      { label: "Input modes", value: "3" },
      { label: "Agent traces", value: "Live" },
    ],
    stack: ["React Native", "Native modules", "WebSockets", "Claude API", "OpenAI API", "Node.js"],
    links: [{ label: "GitHub", href: GITHUB }],
    architecture: {
      nodes: [
        { id: "app", label: "RN Client", sub: "voice · native modules", pos: [-6, 0] },
        { id: "ws", label: "WS Gateway", sub: "duplex stream", pos: [-3, 0] },
        { id: "api", label: "Agent API", sub: "Node.js orchestrator", pos: [0, 0] },
        { id: "llm", label: "Claude · GPT", sub: "completions + tools", pos: [3, 1.6] },
        { id: "tools", label: "Tool Calls", sub: "functions · search", pos: [3, -1.6] },
        { id: "db", label: "pgvector", sub: "memory · RAG", pos: [6, 0] },
      ],
      edges: [
        { from: "app", to: "ws", rate: 2.6 },
        { from: "ws", to: "api", rate: 2.2 },
        { from: "api", to: "llm", rate: 1.6 },
        { from: "llm", to: "tools", rate: 1.2 },
        { from: "tools", to: "db", rate: 1.0 },
        { from: "db", to: "api", rate: 1.4 },
      ],
    },
  },
  {
    slug: "dating-app",
    title: "Dating App",
    platform: "REACT NATIVE · REAL-TIME SOCIAL",
    tagline: "Real-time chat, video calls, and presence at scale.",
    summary:
      "A mobile dating platform where everything is live: messages deliver instantly, presence indicators tell the truth, and matches escalate to in-app video calls over WebRTC — on an architecture designed to scale horizontally from day one.",
    challenges: [
      "Message ordering and delivery guarantees across flaky mobile networks.",
      "Negotiating WebRTC calls reliably behind mobile NATs.",
      "Presence that's accurate without hammering the battery or the backend.",
    ],
    achievements: [
      "Real-time messaging with typing indicators and read receipts.",
      "In-app video calling via WebRTC with graceful degradation.",
      "Redis-backed presence fan-out across horizontally scaled nodes.",
    ],
    metrics: [
      { label: "Messaging", value: "Real-time" },
      { label: "Calls", value: "WebRTC" },
      { label: "Presence", value: "Live" },
    ],
    stack: ["React Native", "WebSockets", "WebRTC", "Redis", "Node.js", "PostgreSQL"],
    links: [{ label: "GitHub", href: GITHUB }],
    architecture: {
      nodes: [
        { id: "app", label: "RN Client", sub: "chat · video", pos: [-6, 0] },
        { id: "ws", label: "WS Cluster", sub: "messaging", pos: [-3, 1.6] },
        { id: "rtc", label: "WebRTC", sub: "signaling · TURN", pos: [-3, -1.6] },
        { id: "api", label: "API", sub: "Node.js services", pos: [0, 0] },
        { id: "redis", label: "Redis", sub: "presence · pub/sub", pos: [3, 1.6] },
        { id: "db", label: "PostgreSQL", sub: "matches · messages", pos: [3, -1.6] },
      ],
      edges: [
        { from: "app", to: "ws", rate: 2.8 },
        { from: "app", to: "rtc", rate: 1.4 },
        { from: "ws", to: "api", rate: 2.0 },
        { from: "api", to: "redis", rate: 2.4 },
        { from: "api", to: "db", rate: 1.2 },
        { from: "redis", to: "ws", rate: 2.2 },
      ],
    },
  },
];

export function getFlagship(slug: string) {
  return flagshipProjects.find((p) => p.slug === slug);
}

/* ----------------------------------------------------------------------------
   Code dimension — floating implementations that morph into product
   -------------------------------------------------------------------------- */
export interface CodeArtifact {
  id: string;
  theme: string;
  title: string;
  code: string;
  /** what the snippet becomes in the product */
  morphsInto: string;
  takeaway: string;
}

export const codeArtifacts: CodeArtifact[] = [
  {
    id: "offline-queue",
    theme: "Offline-first architecture",
    title: "The sync queue that survives anything",
    code: `async function flush(queue: SyncQueue) {
  const batch = await queue.peek(50);
  if (!batch.length) return;

  try {
    await api.sync(batch);          // idempotent — safe to retry
    await queue.ack(batch);         // remove only after server confirms
  } catch (err) {
    if (isConflict(err)) {
      await queue.rebase(batch);    // merge server truth, retry next tick
    }
    backoff.next();                 // network errors: exponential retry
  }
}`,
    morphsInto: "Desklog's zero-loss location timeline",
    takeaway: "Ack after confirmation, rebase on conflict, back off on failure — the queue, not the network, owns correctness.",
  },
  {
    id: "token-stream",
    theme: "Real-time systems",
    title: "Streaming tokens without dropping frames",
    code: `function useTokenStream(runId: string) {
  const [text, setText] = useState("");

  useEffect(() => {
    const ws = openStream(runId);
    let buffer = "";
    ws.onToken = (t) => { buffer += t; };

    // Batch paints to animation frames — never re-render per token.
    const raf = rafLoop(() => {
      if (!buffer) return;
      setText((prev) => prev + buffer);
      buffer = "";
    });
    return () => { raf.stop(); ws.close(); };
  }, [runId]);

  return text;
}`,
    morphsInto: "The assistant's sub-second streaming replies",
    takeaway: "Tokens arrive faster than React should render. Buffer per frame, paint once — 60fps at any stream rate.",
  },
  {
    id: "presence",
    theme: "State management patterns",
    title: "Presence that tells the truth",
    code: `const usePresence = create<PresenceState>()((set) => ({
  peers: {},
  apply(event: PresenceEvent) {
    set((s) => ({
      peers: {
        ...s.peers,
        [event.userId]: {
          status: event.status,
          // Trust the latest heartbeat, not socket connect state —
          // mobile radios drop silently all the time.
          lastSeen: event.ts,
        },
      },
    }));
  },
}));`,
    morphsInto: "Live presence dots across the dating app",
    takeaway: "On mobile, 'connected' is a lie. Heartbeats with timestamps are the only presence signal worth rendering.",
  },
  {
    id: "render-budget",
    theme: "Performance optimization",
    title: "Spending the frame budget on purpose",
    code: `const Row = memo(function Row({ id }: { id: string }) {
  // Subscribe to one device, not the whole fleet.
  const device = useFleet((s) => s.devices[id]);
  return <TelemetryRow data={device} />;
});

function Fleet() {
  const ids = useFleet((s) => s.ids);            // stable identity
  const [, startTransition] = useTransition();
  useSocket((batch) =>
    startTransition(() => useFleet.getState().ingest(batch)),
  );
  return ids.map((id) => <Row key={id} id={id} />);
}`,
    morphsInto: "Dashboards that hold 60fps under burst telemetry",
    takeaway: "Selector-level subscriptions plus transitions: high-frequency data lands without ever blocking interaction.",
  },
];

/* ----------------------------------------------------------------------------
   Achievement vault — résumé-backed only, no invented numbers
   -------------------------------------------------------------------------- */
export interface Achievement {
  id: string;
  value: number;
  suffix: string;
  decimals?: number;
  label: string;
  detail: string;
}

export const achievements: Achievement[] = [
  {
    id: "years",
    value: 2.5,
    suffix: "+",
    decimals: 1,
    label: "Years in production",
    detail: "Shipping continuously since 2023 — web, mobile, and AI systems.",
  },
  {
    id: "systems",
    value: 20,
    suffix: "+",
    label: "Production systems",
    detail: "From field-ops mobile apps to streaming AI copilots.",
  },
  {
    id: "latency",
    value: 35,
    suffix: "%",
    label: "API latency cut",
    detail: "Caching, indexing, and payload diets on hot Node.js paths.",
  },
  {
    id: "delivery",
    value: 30,
    suffix: "%",
    label: "Faster delivery",
    detail: "A shared TypeScript component library across 20+ systems.",
  },
  {
    id: "rerenders",
    value: 40,
    suffix: "%",
    label: "Fewer re-renders",
    detail: "Memoization, code splitting, and query caching on AI dashboards.",
  },
  {
    id: "billing",
    value: 0,
    suffix: "",
    label: "Reconciliation failures",
    detail: "Stripe/PayPal billing with idempotent webhooks and retries.",
  },
];

/* ----------------------------------------------------------------------------
   Journey navigation — section ids in scroll order (skip-nav + progress rail)
   -------------------------------------------------------------------------- */
export const journeySections = [
  { id: "digital-universe", label: "Origin" },
  { id: "career-corridor", label: "Trajectory" },
  { id: "skills-galaxy", label: "Galaxy" },
  { id: "command-center", label: "Projects" },
  { id: "architecture-sim", label: "Systems" },
  { id: "code-dimension", label: "Code" },
  { id: "achievement-vault", label: "Vault" },
  { id: "contact-portal", label: "Contact" },
] as const;
