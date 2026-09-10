import type {
  Experience,
  Education,
  ProofStat,
  SkillGroup,
  WorkProcess,
} from "../types";

/* ============================================================================
   PROOF STRIP — the band under the hero. Every number is on the résumé
   (public/MohdRinshad_FullStackEngineer_Resume.pdf); nothing here may be rounded up.
   ========================================================================== */
export const proofStats: ProofStat[] = [
  { to: 3, suffix: "+", label: "Years shipping production software" },
  { to: 40, suffix: "+", label: "REST endpoints designed & built" },
  { to: 35, suffix: "%", label: "Lower average API response time" },
  { to: 2000, suffix: "+", label: "Monthly payment transactions handled" },
  { to: 60, suffix: "%+", label: "Faster front-end builds" },
  { value: "AWS · Docker · CI/CD", label: "Deployed and monitored in production" },
];

/** The homepage's "In production" chapter shows the bullets a reviewer scans
    for first — scale, money, reliability, infrastructure, delivery speed — as
    indices into the current role's `achievements`, so no sentence is ever
    written twice. Guarded by lib/content/content.test.ts. */
export const HIGHLIGHT_INDICES = [0, 2, 4, 5, 7] as const;

/* ============================================================================
   EXPERIENCE & EDUCATION — mirrors the résumé bullet-for-bullet.
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
      "Building and running the production backend — REST APIs, relational schemas, caching, and payment lifecycles in Node.js, Express.js, and TypeScript on MySQL and Redis — containerized with Docker and deployed to Linux/VPS and AWS behind Nginx and PM2, and hands-on with the React, Next.js, and React Native clients those APIs serve.",
    achievements: [
      "Designed and built 40+ RESTful API endpoints with Express.js and Sequelize ORM — middleware validation, JWT authentication, and SQL query and index optimization cut average API response time by 35%.",
      "Designed relational schemas in MySQL — normalized models, foreign-key constraints, indexed access paths, and versioned migrations shipped without downtime.",
      "Integrated Stripe, PayPal, and Razorpay payments — webhook-driven order lifecycles, signature verification, and safe retries for an eCommerce platform handling 2,000+ monthly transactions.",
      "Added Redis caching for read-heavy endpoints and session data, cutting repeated database round-trips under peak load.",
      "Built the sync backend for an offline-first geolocation tracking system — batched uploads, duplicate-safe writes, and retry-based recovery through prolonged network outages.",
      "Containerized services with Docker and deployed to Linux/VPS and AWS behind Nginx and PM2, with GitHub Actions CI/CD, structured logging, and production monitoring.",
      "Migrated the codebase from JavaScript to TypeScript and built a shared API-contract and component library for React, Next.js, and React Native clients.",
      "Moved the React build from Create React App to Vite, cutting build times 60%+ (~90s to ~35s); code-splitting and CDN assets lifted Lighthouse 62 to 89 and page load 3.8s to 2.1s.",
      "Shipped React Native apps to the Google Play Store and Apple App Store, with background location capture and local buffering for offline use.",
    ],
    technologies: [
      "Node.js · Express",
      "TypeScript",
      "MySQL · Sequelize",
      "Redis",
      "REST APIs",
      "Docker",
      "Nginx · Linux/VPS",
      "React · React Native",
    ],
  },
];

export const education: Education[] = [
  {
    id: "edu-bba",
    degree: "BBA",
    institution: "SJES College of Management",
    affiliation: "Bangalore North University",
    location: "Bangalore, India",
    period: "Jun 2019 — Oct 2022",
  },
];

/* ============================================================================
   FULL SKILL INVENTORY (for /about) — the résumé's eight groups, verbatim
   and in résumé order. Backend and data lead; frontend and mobile follow.
   Adding anything here means adding it to the PDF first.
   ========================================================================== */
export const skillGroups: SkillGroup[] = [
  {
    label: "Languages",
    items: ["TypeScript", "JavaScript", "Python", "Golang", "SQL"],
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
      "JWT / OAuth",
      "RBAC",
      "Middleware Architecture",
      "Webhooks",
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
    label: "Cloud & DevOps",
    items: [
      "AWS (EC2 · S3 · IAM · CloudWatch)",
      "Docker",
      "Docker Compose",
      "GitHub Actions (CI/CD)",
      "Nginx (reverse proxy · SSL)",
      "PM2",
      "Linux/VPS Administration",
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
    ],
  },
  {
    label: "AI / Data Backend",
    items: [
      "Python Data-Ingestion Pipelines",
      "RAG",
      "Embeddings",
      "Semantic Search (pgvector · HNSW)",
      "LLM APIs (Gemini · Groq · Ollama)",
      "LangChain",
      "Streaming Responses",
      "Tool / Function Calling",
    ],
  },
  {
    label: "Testing & Observability",
    items: [
      "Jest",
      "Vitest",
      "Playwright",
      "Postman",
      "Unit & Integration Testing",
      "Structured Logging",
      "Sentry",
      "CloudWatch",
      "Git / GitHub",
      "Agile / Scrum",
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
      "Express handlers stay thin; validation lives in middleware, business rules in the service layer, queries in the repository. Tests on the paths that carry money or state.",
    icon: "Code2",
  },
  {
    step: 4,
    title: "Make it fast",
    description:
      "Read the query plan before adding a server. Index the access path, cache the read-heavy endpoint in Redis, batch the chatty write. 35% of average response time came off this way.",
    icon: "Sparkles",
  },
  {
    step: 5,
    title: "Ship and watch",
    description:
      "Docker image, GitHub Actions pipeline, Nginx and PM2 in front, migrations versioned so releases go out without downtime — then structured logs and monitoring, because production is the only honest reviewer.",
    icon: "Rocket",
  },
];

/* ============================================================================
   ABOUT — long-form story (first person, editorial)
   ========================================================================== */
export const about = {
  intro:
    "I'm Rinshad — a full-stack software engineer who lives closest to the backend: the REST APIs, the relational schemas, and the containerized services that everything else depends on.",
  paragraphs: [
    "For the last three years I've built and run production systems in Node.js, Express.js, and TypeScript on MySQL, Redis, Docker, and AWS. Forty-plus REST endpoints with middleware validation and JWT auth. Relational schemas with normalized models, foreign-key constraints, and versioned migrations that ship without downtime. Payment lifecycles driven by webhooks — Stripe, PayPal, Razorpay — with signature verification and safe retries behind 2,000+ transactions a month. A sync backend for offline-first geolocation tracking that survives prolonged network outages through batched, duplicate-safe writes.",
    "Backend-heavy, but not backend-only: I'm hands-on with the clients those APIs serve. I migrated a codebase from JavaScript to TypeScript and built the shared API-contract and component library that React, Next.js, and React Native all consume. I moved the React build from Create React App to Vite — 60%+ off build times — and code-splitting plus CDN assets took Lighthouse from 62 to 89 and page load from 3.8s to 2.1s. The React Native apps went to both stores, with background location capture and local buffering for offline use.",
    "Outside work I go further down the same road. Golang with Gin and GORM on Clean Architecture. Python data-ingestion pipelines feeding pgvector with HNSW-indexed semantic search. A stateless WebSocket fan-out server on Redis Pub/Sub that scales horizontally without sticky sessions. These are self-directed projects on self-hosted, open-source infrastructure — no commercial users, and I don't claim otherwise.",
  ],
  closing:
    "Based in Kerala, India — open to backend and full-stack engineering roles, remote or relocation.",
};
