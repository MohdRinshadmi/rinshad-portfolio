import type {
  Project,
  Skill,
  Experience,
  Education,
  SocialLink,
  WorkProcess,
} from "./types";

export const siteConfig = {
  name: "Rinshad",
  fullName: "Mohammed Rinshad M I",
  role: "AI-Augmented React Native Engineer",
  tagline: "I build streaming AI UIs and agentic copilots.",
  bio: "AI-augmented React Native Engineer with 2.5+ years shipping production React, Next.js, and React Native interfaces to the App Store, Play Store, and the web. I specialize in streaming AI UIs, agentic copilots, and real-time dashboards on TypeScript, React Server Components, and the Vercel AI SDK with Claude, OpenAI, and tool-calling pipelines — owning delivery from Figma to Core Web Vitals, store releases, and production telemetry.",
  location: "Palakkad, Kerala, India",
  email: "rinshad803@gmail.com",
  phone: "+91 88486 75355",
  availability: "Open to frontend & AI UI roles",
  avatarUrl: "/images/avatar/rinshad.jpg",
  resumeUrl: "/rinshad-resume.pdf",
  social: {
    github: "https://github.com/MohdRinshadmi",
    linkedin: "https://linkedin.com/in/mohd-rinshadmi",
  } as Record<string, string>,
} as const;

export const stats = [
  { label: "Years Experience", value: 2.5, suffix: "+" },
  { label: "Production Apps", value: 20, suffix: "+" },
  { label: "Faster Delivery", value: 30, suffix: "%" },
  { label: "Fewer Re-renders", value: 40, suffix: "%" },
];

export const projects: Project[] = [
  {
    id: "iot-analytics-dashboard",
    title: "Cloud-Native IoT Analytics Dashboard",
    tagline: "Real-time telemetry from 10k+ devices",
    description:
      "A cloud-native analytics dashboard streaming live telemetry from 10k+ IoT devices into virtualized charts and heatmaps.",
    problem:
      "Operators needed live visibility into thousands of devices without the UI buckling under the volume of incoming data.",
    solution:
      "Streamed telemetry over WebSockets into virtualized charts sustaining 60fps with React 18 transitions and Suspense, backed by RSC + edge caching for sub-second TTFB and a configurable alert/rule builder with optimistic UI and per-tenant theming via shadcn/ui.",
    image: "",
    tags: ["Next.js", "RSC", "TypeScript", "TanStack Query", "WebSockets", "Recharts"],
    metrics: [
      { label: "Devices", value: "10k+" },
      { label: "Frame Rate", value: "60fps" },
      { label: "TTFB", value: "<1s" },
    ],
    featured: true,
  },
  {
    id: "ai-life-assistant",
    title: "AI Life Assistant Super App",
    tagline: "Streaming AI copilot with tool calling",
    description:
      "The web companion for an AI life-assistant super app — a streaming copilot with multimodal inputs and live agent-trace rendering.",
    problem:
      "Users needed a responsive AI copilot that could handle text, image, and voice while staying transparent about what the agent was doing.",
    solution:
      "Engineered a streaming copilot with tool/function calling, multimodal inputs, and live agent-trace rendering inside RSC, plus reusable agent-state primitives (Zustand + hooks) for retries, cancellation, and partial-message hydration across long-running conversations.",
    image: "",
    tags: ["Next.js", "Vercel AI SDK", "Claude API", "OpenAI API", "Zustand", "shadcn/ui"],
    metrics: [
      { label: "Input Modes", value: "3" },
      { label: "Latency", value: "<1s" },
      { label: "Agent Traces", value: "Live" },
    ],
    featured: true,
  },
  {
    id: "realtime-collab-platform",
    title: "AI-Powered Real-Time Collaboration Platform",
    tagline: "CRDT editor with inline Claude assistance",
    description:
      "A real-time collaborative editor with conflict-free editing, live presence, and inline AI assistance.",
    problem:
      "Teams editing the same large document needed conflict-free real-time collaboration with AI help that didn't get in the way.",
    solution:
      "Built a CRDT-based editor (Yjs) with live cursors, presence, and conflict-free updates streamed via Suspense, plus inline Claude assistance — streaming completions, “explain selection,” and summarization with tool calling — at <16ms input latency on 10k+ node documents.",
    image: "",
    tags: ["Next.js", "Yjs (CRDT)", "WebSockets", "TypeScript", "Vercel AI SDK", "Tailwind CSS"],
    metrics: [
      { label: "Input Latency", value: "<16ms" },
      { label: "Nodes", value: "10k+" },
      { label: "Sync", value: "CRDT" },
    ],
    featured: true,
  },
];

export const skills: Skill[] = [
  // Languages
  { name: "TypeScript", icon: "typescript", category: "languages", level: 92 },
  { name: "JavaScript (ES6+)", icon: "javascript", category: "languages", level: 90 },
  { name: "HTML5", icon: "html5", category: "languages", level: 88 },
  { name: "CSS3", icon: "css3", category: "languages", level: 88 },
  { name: "SQL", icon: "sql", category: "languages", level: 72 },

  // Frameworks & Libraries
  { name: "React", icon: "react", category: "frameworks", level: 93 },
  { name: "Next.js", icon: "nextjs", category: "frameworks", level: 92 },
  { name: "React Native", icon: "reactnative", category: "frameworks", level: 85 },
  { name: "Expo", icon: "expo", category: "frameworks", level: 80 },
  { name: "Remix", icon: "remix", category: "frameworks", level: 65 },

  // AI UI & SDKs
  { name: "Vercel AI SDK", icon: "vercel", category: "ai", level: 90 },
  { name: "Claude API", icon: "anthropic", category: "ai", level: 88 },
  { name: "OpenAI API", icon: "openai", category: "ai", level: 85 },
  { name: "Tool / Function Calling", icon: "tools", category: "ai", level: 85 },
  { name: "RAG Interfaces", icon: "rag", category: "ai", level: 82 },

  // Styling, State & Realtime
  { name: "Tailwind CSS", icon: "tailwind", category: "realtime", level: 92 },
  { name: "shadcn/ui", icon: "shadcn", category: "realtime", level: 88 },
  { name: "Framer Motion", icon: "framer", category: "realtime", level: 85 },
  { name: "Zustand", icon: "zustand", category: "realtime", level: 85 },
  { name: "React Query (TanStack)", icon: "reactquery", category: "realtime", level: 85 },

  // Testing, Build & Tooling
  { name: "Jest", icon: "jest", category: "tooling", level: 80 },
  { name: "Playwright", icon: "playwright", category: "tooling", level: 78 },
  { name: "ESLint", icon: "eslint", category: "tooling", level: 85 },
  { name: "Storybook", icon: "storybook", category: "tooling", level: 75 },
  { name: "GitHub Actions", icon: "github", category: "tooling", level: 80 },

  // AI Workflow & Deploy
  { name: "Claude Code", icon: "anthropic", category: "workflow", level: 90 },
  { name: "Cursor", icon: "cursor", category: "workflow", level: 85 },
  { name: "GitHub Copilot", icon: "copilot", category: "workflow", level: 82 },
  { name: "Vercel", icon: "vercel", category: "workflow", level: 90 },
  { name: "EAS / App Stores", icon: "expo", category: "workflow", level: 78 },
];

export const experience: Experience[] = [
  {
    id: "exp-ioss",
    role: "Frontend Developer (Full Stack)",
    company: "Infinite Open Source Solution LLP",
    location: "Calicut, Kerala",
    period: "Nov 2023 – Present",
    current: true,
    description:
      "Building cross-platform React, Next.js, and React Native interfaces — streaming AI UIs, agentic copilots, and real-time dashboards — and owning delivery from Figma to store release.",
    achievements: [
      "Architected a cross-platform TypeScript component library across React, Next.js, and React Native — cutting feature delivery time 30% across 20+ production apps.",
      "Engineered streaming AI UIs with the Vercel AI SDK — rendering Claude/OpenAI completions, tool-call traces, and RAG citations inside React Server Components for sub-second perceived latency.",
      "Led a full JS-to-TypeScript migration on a live React Native codebase with strict typing and type-safe API contracts — eliminating an entire class of runtime UI errors.",
      "Optimized React rendering with memoization, code splitting, lazy loading, and React Query caching — cutting re-renders on AI dashboards by 40% and lifting Core Web Vitals.",
      "Integrated agentic AI workflows (Claude Code, Cursor, GitHub Copilot, v0) into daily delivery — accelerating scaffolding, refactors, and test generation with human review as the gate.",
      "Owned the cross-platform release pipeline for React Native apps — App Store/Play Store signing, build config, compliance, and staged rollouts end-to-end.",
    ],
    technologies: ["React", "Next.js", "React Native", "TypeScript", "Vercel AI SDK", "React Query"],
  },
];

export const education: Education[] = [
  {
    id: "edu-bba",
    degree: "BBA",
    institution: "SJES College of Management",
    affiliation: "Bangalore North University",
    location: "Bangalore, India",
    period: "Jun 2019 – Oct 2022",
  },
];

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

export const socialLinks: SocialLink[] = [
  { name: "GitHub", url: siteConfig.social.github, icon: "Github" },
  { name: "LinkedIn", url: siteConfig.social.linkedin, icon: "Linkedin" },
];
