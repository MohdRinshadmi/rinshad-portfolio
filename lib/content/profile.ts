import type {
  Experience,
  Education,
  KeyAchievement,
  ProofStat,
  SkillGroup,
  WorkProcess,
} from "../types";

/* ============================================================================
   PROOF STRIP — the band under the hero. Every number is on the résumé
   (public/MohdRinshad_FullStackEngineer_Resume.pdf); nothing here may be rounded up.
   ========================================================================== */
export const proofStats: ProofStat[] = [
  { to: 3, suffix: "+", label: "Years shipping production systems end to end" },
  { to: 40, suffix: "+", label: "Production REST endpoints" },
  { to: 35, suffix: "%", label: "Lower average API response time" },
  { to: 2000, suffix: "+", label: "Transactions a month across 3 payment gateways" },
  { to: 60, suffix: "%+", label: "Faster frontend builds" },
  { value: "AWS · Docker · CI/CD", label: "Production infrastructure owned" },
];

/* ============================================================================
   KEY ACHIEVEMENTS — the résumé's three headline results, verbatim.
   ========================================================================== */
export const keyAchievements: KeyAchievement[] = [
  {
    lead: "Cut average API response time 35%",
    detail:
      "across 40+ production endpoints through SQL query and index optimization and a Redis caching layer.",
  },
  {
    lead: "Delivered payment infrastructure across 3 gateways",
    detail:
      "— Stripe, PayPal, and Razorpay — for an eCommerce platform processing 2,000+ transactions per month.",
  },
  {
    lead: "Led a platform-wide TypeScript migration",
    detail:
      "and set the shared API-contract standard adopted by 3 client applications; cut frontend build times 60%+ and lifted Lighthouse 62 to 89.",
  },
];

/** The homepage's "In Production" chapter shows the key achievements, then
    the role's bullets they don't already cover — data layer, infrastructure,
    offline sync — as indices into `achievements`, so no sentence is written
    twice. Guarded by lib/content/content.test.ts. */
export const HIGHLIGHT_INDICES = [1, 2, 5] as const;

/* ============================================================================
   EXPERIENCE & EDUCATION — mirrors the résumé bullet-for-bullet.
   Location stays Calicut/Palakkad by the user's choice (the PDF says Bangalore).
   ========================================================================== */
export const experience: Experience[] = [
  {
    id: "exp-ioss",
    role: "Software Engineer",
    company: "Infinite Open Source Solution LLP",
    location: "Calicut, Kerala",
    period: "Nov 2023 — Present",
    current: true,
    description:
      "Designing, shipping, and operating the production platform end to end — REST APIs, the MySQL data layer, Redis caching, and payment infrastructure in Node.js, Express.js, and TypeScript on AWS and Linux/VPS — and leading the TypeScript migration and shared API contract for its React, Next.js, and React Native clients.",
    achievements: [
      "Designed and shipped 40+ production REST endpoints with Express.js, Sequelize ORM, and TypeScript — middleware validation, JWT authorization, and SQL query and index optimization.",
      "Owned the platform's MySQL data layer — normalized schema design, foreign-key constraints, indexed access paths, and versioned migrations released to production with zero downtime.",
      "Owned production infrastructure on AWS (EC2, S3, IAM, CloudWatch) and Linux/VPS — Docker-containerized services behind Nginx and PM2, GitHub Actions CI/CD, structured logging, and monitoring.",
      "Architected payment infrastructure across Stripe, PayPal, and Razorpay for an eCommerce platform — webhook-driven order lifecycles, signature verification, and idempotent retries.",
      "Cut database load under peak traffic with a Redis caching layer over read-heavy endpoints and session storage.",
      "Designed the sync backend for an offline-first geolocation tracking system — batched uploads, idempotent writes, and retry-based recovery that survives prolonged network outages.",
      "Led the platform-wide migration from JavaScript to TypeScript and set the shared API-contract and component library standard for the React, Next.js, and React Native clients.",
      "Drove the React build migration from Create React App to Vite; code-splitting and CDN asset delivery lifted Lighthouse 62 to 89 and page load 3.8s to 2.1s.",
      "Shipped and maintained React Native apps on Google Play and the Apple App Store, with background location capture and local buffering for offline use.",
    ],
    technologies: [
      "Node.js · Express.js",
      "TypeScript",
      "MySQL · Sequelize",
      "Redis",
      "REST APIs",
      "Docker · AWS",
      "Nginx · Linux/VPS",
      "React · React Native",
    ],
  },
];

export const education: Education[] = [
  {
    id: "edu-bba",
    degree: "Bachelor of Business Administration (BBA)",
    institution: "SJES College of Management",
    affiliation: "Bangalore North University",
    location: "Bangalore, India",
    period: "Jun 2019 — Oct 2022",
  },
];

/* ============================================================================
   FULL SKILL INVENTORY (for /about) — the résumé's nine groups, verbatim
   and in résumé order. Adding anything here means adding it to the PDF first.
   ========================================================================== */
export const skillGroups: SkillGroup[] = [
  {
    label: "Languages",
    items: ["TypeScript", "JavaScript", "Python", "Golang", "SQL"],
  },
  {
    label: "Cloud & DevOps",
    items: [
      "AWS (EC2 · S3 · IAM · CloudWatch)",
      "Docker",
      "Docker Compose",
      "GitHub Actions (CI/CD)",
      "Nginx (reverse proxy · load balancing · SSL/TLS)",
      "PM2",
      "Linux/VPS Administration",
      "Shell Scripting",
      "Zero-Downtime Deployments",
      "Observability & Alerting",
    ],
  },
  {
    label: "Backend & APIs",
    items: [
      "Node.js",
      "Express.js",
      "FastAPI",
      "Gin",
      "REST API Design",
      "WebSockets",
      "Authentication & Authorization (JWT · OAuth · RBAC)",
      "Middleware Architecture",
      "Webhooks (Stripe · PayPal · Razorpay)",
      "Background Jobs",
      "API Versioning",
      "Rate Limiting",
      "Redis Pub/Sub",
    ],
  },
  {
    label: "Databases",
    items: [
      "PostgreSQL",
      "MySQL",
      "MongoDB",
      "Redis",
      "SQLite",
      "pgvector",
      "Sequelize ORM",
      "GORM",
      "Schema Design",
      "Indexing",
      "Query Optimization",
      "Transactions",
      "Migrations",
    ],
  },
  {
    label: "Architecture & System Design",
    items: [
      "Clean Architecture",
      "Repository & Service-Layer Patterns",
      "Dependency Injection",
      "Modular Monolith",
      "Caching Strategies",
      "Event-Driven & Real-Time Systems",
      "Distributed Systems",
      "Horizontal Scaling",
      "Idempotency & Fault Tolerance",
      "Concurrency",
    ],
  },
  {
    label: "Frontend & Mobile",
    items: [
      "React",
      "Next.js (App Router · Server Components)",
      "React Native",
      "Redux Toolkit",
      "Zustand",
      "TanStack Query",
      "Tailwind CSS",
      "Vite",
      "Web Performance Optimization",
    ],
  },
  {
    label: "AI / Data Backend",
    items: [
      "Python Data-Ingestion Pipelines",
      "RAG",
      "Embeddings",
      "Semantic Search (PostgreSQL + pgvector · HNSW)",
      "LLM APIs (Gemini · Groq · Ollama)",
      "LangChain",
      "Streaming Responses",
      "Tool / Function Calling",
    ],
  },
  {
    label: "Testing & Quality",
    items: [
      "Jest",
      "Vitest",
      "Playwright",
      "Postman",
      "Unit & Integration Testing",
      "End-to-End Testing",
      "API Testing",
      "Structured Logging",
      "Sentry",
      "Debugging & Profiling",
    ],
  },
  {
    label: "Leadership & Practices",
    items: [
      "Technical Ownership",
      "Architecture & Design Decisions",
      "Code Review",
      "Cross-Functional Collaboration",
      "Technical Documentation",
      "Knowledge Sharing",
      "Agile/Scrum",
      "Git/GitHub",
    ],
  },
];

/* ============================================================================
   HOW I WORK (moved off homepage → /about)
   ========================================================================== */
export const workProcess: WorkProcess[] = [
  {
    step: 1,
    title: "Model the data",
    description:
      "Start at the schema, not the screen. Normalized models, foreign keys, the access paths the product will actually read by. Get this wrong and every layer above it pays rent forever.",
    icon: "Search",
  },
  {
    step: 2,
    title: "Design the contract",
    description:
      "Define the API before anyone builds against it. Resources, status codes, error shapes, versioning, and a typed contract the React, Next.js, and React Native clients all share.",
    icon: "Layout",
  },
  {
    step: 3,
    title: "Build the service",
    description:
      "Express handlers stay thin; validation lives in middleware, business rules in the service layer, queries in the repository. Idempotent writes on every path that carries money or state.",
    icon: "Code2",
  },
  {
    step: 4,
    title: "Make it fast",
    description:
      "Read the query plan before adding a server. Index the access path, cache the read-heavy endpoint in Redis, batch the chatty write. That is how 35% came off average response time across 40+ endpoints.",
    icon: "Sparkles",
  },
  {
    step: 5,
    title: "Ship and watch",
    description:
      "Docker image, GitHub Actions pipeline, Nginx and PM2 in front, migrations versioned so releases go out with zero downtime — then structured logs, monitoring, and alerting, because production is the only honest reviewer.",
    icon: "Rocket",
  },
];

/* ============================================================================
   ABOUT — long-form story (first person, editorial)
   ========================================================================== */
export const about = {
  intro:
    "I'm Rinshad — a full-stack software engineer who designs, ships, and operates production systems end to end, and lives closest to the backend: the APIs, data layers, and infrastructure everything else depends on.",
  paragraphs: [
    "For three years I've owned production work in Node.js, Express.js, and TypeScript on MySQL, Redis, Docker, and AWS. Forty-plus production REST endpoints with middleware validation and JWT authorization, where SQL query and index optimization and a Redis caching layer cut average response time by 35%. The platform's MySQL data layer, with versioned migrations released to production with zero downtime. Payment infrastructure across three gateways — Stripe, PayPal, and Razorpay — with webhook-driven order lifecycles, signature verification, and idempotent retries behind 2,000+ transactions a month. And the AWS and Linux/VPS infrastructure it all runs on: Docker containers behind Nginx and PM2, GitHub Actions CI/CD, structured logging, and monitoring.",
    "Backend-heavy, but not backend-only. I led the platform-wide migration from JavaScript to TypeScript and set the shared API-contract standard adopted by three client applications across React, Next.js, and React Native. I drove the move from Create React App to Vite — 60%+ off build times — while code-splitting and CDN asset delivery took Lighthouse from 62 to 89 and page load from 3.8s to 2.1s. I designed the sync backend for an offline-first geolocation tracking system, with batched uploads, idempotent writes, and retry-based recovery, and I ship and maintain React Native apps on Google Play and the App Store.",
    "Outside work I build systems end to end — architecture, backend, infrastructure, and client. A Golang backend on Clean Architecture ingesting high-frequency telemetry. A streaming Node.js AI API with Python ingestion and HNSW-indexed pgvector retrieval. A stateless WebSocket fan-out server on Redis Pub/Sub that scales horizontally without sticky sessions. They are self-hosted personal projects with no commercial users, and the source for each is on GitHub.",
  ],
  closing:
    "Based in Palakkad, Kerala, India — open to full-stack and backend engineering roles, remote or relocation.",
};
