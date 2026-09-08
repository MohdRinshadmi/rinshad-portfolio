import { siteConfig } from "@/lib/config/site";

const BASE = siteConfig.url;

/**
 * /llms.txt — the llmstxt.org convention: a single plain-text brief that AI
 * assistants can read instead of scraping the whole site.
 *
 * This was a static file under public/, which meant its ~15 absolute URLs were
 * hard-coded to a domain that does not resolve. Served from a route handler
 * instead so every URL derives from the same `siteConfig.url` as the sitemap,
 * feed, canonicals and JSON-LD — one origin, resolved per environment.
 *
 * The prose is otherwise byte-identical to the file it replaced.
 */
export async function GET() {
  const body = `# Rinshad — Full-Stack Software Engineer

> Mohammed Rinshad M I is a Full-Stack Software Engineer based in Palakkad, Kerala, India, with 3+ years building and running production REST APIs, relational schemas, and containerized services in Node.js, Express.js, and TypeScript on MySQL, Redis, Docker, and AWS. Backend-heavy, and hands-on with the clients those APIs serve: React, Next.js, and React Native. Additional backend work in Golang (Gin) and Python across self-directed projects on PostgreSQL, pgvector, and RAG pipelines.

Key facts:
- Role: Full-Stack Software Engineer (backend-heavy)
- Location: Palakkad, Kerala, India (open to remote or relocation)
- Availability: Open to backend & full-stack engineering roles
- Email: rinshad803@gmail.com
- Languages: TypeScript, JavaScript, Python, Golang, SQL
- Backend & APIs: Node.js, Express.js, FastAPI, Gin, REST API design, WebSockets, JWT/OAuth, RBAC, middleware architecture, webhooks, background jobs, API versioning, rate limiting, Redis Pub/Sub
- Databases: PostgreSQL, MySQL, MongoDB, Redis, SQLite, pgvector, Sequelize ORM, GORM, schema design, indexing, query optimization, transactions, migrations
- Cloud & DevOps: AWS (EC2, S3, IAM, CloudWatch), Docker, Docker Compose, GitHub Actions (CI/CD), Nginx (reverse proxy, SSL), PM2, Linux/VPS administration
- Architecture & system design: Clean Architecture, repository & service-layer patterns, dependency injection, modular monolith, caching strategies, event-driven & real-time systems, distributed systems
- Frontend & mobile: React, Next.js (App Router, Server Components), React Native, Redux Toolkit, Zustand, TanStack Query, Tailwind CSS, Vite
- AI / data backend: Python data-ingestion pipelines, RAG, embeddings, semantic search (PostgreSQL + pgvector, HNSW), LLM APIs (Gemini, Groq, Ollama), LangChain, streaming responses, tool/function calling
- Testing & observability: Jest, Vitest, Playwright, Postman, unit & integration testing, structured logging, Sentry, CloudWatch, Git/GitHub, Agile/Scrum
- Payments: Stripe, PayPal, Razorpay (webhook-driven order lifecycles, signature verification, safe retries)
- Impact: designed and built 40+ REST API endpoints (Express.js + Sequelize) cutting average API response time 35%; designed normalized MySQL schemas with versioned zero-downtime migrations; handled 2,000+ monthly transactions; added Redis caching for read-heavy endpoints; built the sync backend for an offline-first geolocation tracking system; containerized and deployed to Linux/VPS and AWS behind Nginx and PM2 with GitHub Actions CI/CD; led a JS→TypeScript migration and built the shared API-contract library; cut front-end build times 60%+ (CRA→Vite, ~90s→~35s) and raised Lighthouse 62→89 (3.8s→2.1s load); shipped React Native apps to the App Store and Play Store

## Pages

- [Home](${BASE}): Overview, positioning, and featured work
- [Work](${BASE}/work): Case studies of backend systems
- [About](${BASE}/about): Long-form bio, skills, experience, and how he works
- [Writing](${BASE}/blog): Engineering articles
- [Contact](${BASE}/contact): Get in touch

## Case studies

Self-initiated projects on self-hosted, open-source infrastructure (PostgreSQL, Redis, Docker); no commercial users. Source: https://github.com/MohdRinshadmi

- [Cloud-Native IoT Analytics Platform](${BASE}/work/iot-analytics-dashboard): A Golang backend on Clean Architecture — repository and service-layer separation with dependency injection, in a monorepo splitting backend, frontend, and infrastructure. REST APIs and device-management services ingest high-frequency telemetry with Gin, GORM, PostgreSQL, and Redis over indexed time-series tables; backend, database, and broker are containerized with Docker Compose, with a React dashboard on TanStack Query and Zustand over type-safe API clients. Stack: Golang, Gin, GORM, PostgreSQL, Redis, Docker Compose, React, TypeScript. Code: https://github.com/MohdRinshadmi/cloud-native-iot-dashboard
- [AI Life Assistant Super App](${BASE}/work/ai-life-assistant): The Node.js API layer for a voice-first AI assistant — streaming LLM responses, speech-to-text and TTS orchestration, and server-side tool/function calling. Python data-ingestion pipelines and pgvector retrieval handle chunking, embedding generation, and HNSW-indexed semantic search over thousands of documents; the API is secured with JWT refresh-token rotation and Redis rate limiting, with a Next.js App Router client on the streaming endpoints. Stack: Node.js, TypeScript, Python, PostgreSQL + pgvector, Redis, Gemini API, Next.js, React. Code: https://github.com/MohdRinshadmi/ai-life-assistant
- [Real-Time Collaboration Platform](${BASE}/work/realtime-collab-platform): A stateless WebSocket fan-out server with channel-based routing and Redis Pub/Sub, scaling horizontally without sticky sessions. CRDT document sync with Yjs gives conflict-free convergence, alongside presence signals and streaming LLM summarization gated by JWT/OAuth, verified by end-to-end Playwright tests for multi-user editing, reconnection, and conflict resolution. Stack: Node.js, TypeScript, WebSockets, Redis Pub/Sub, Yjs (CRDT), PostgreSQL + pgvector, Docker, React, Next.js. Code: https://github.com/MohdRinshadmi/ai-real-time-collaboration

## Writing

- [Next.js Performance Patterns](${BASE}/blog/nextjs-performance-patterns): Practical patterns for fast React Server Component apps.

## FAQ

- Is Rinshad a backend, frontend, or full-stack engineer? Full-stack, weighted toward the backend: REST API design, relational schema design, caching, and deployment in Node.js/Express and TypeScript, plus the React, Next.js, and React Native clients those APIs serve.
- Is he available for hire? Yes — open to backend and full-stack software engineering roles, remote across India and worldwide or on-site with relocation. Email rinshad803@gmail.com (usually replies within 24h).
- What backend results has he delivered? 40+ Express.js REST endpoints with middleware validation, JWT auth, and SQL query/index optimization cutting average API response time 35%; normalized MySQL schemas with versioned zero-downtime migrations; webhook-driven Stripe/PayPal/Razorpay lifecycles behind 2,000+ monthly transactions; Redis caching for read-heavy endpoints; and the sync backend for an offline-first geolocation tracker with batched uploads, duplicate-safe writes, and retry-based recovery.
- Does he work with AI, LLMs, and RAG? Yes, from the data side — Python ingestion pipelines for chunking and embedding generation, HNSW-indexed pgvector semantic search, and Node.js API layers that stream LLM responses and execute server-side tool/function calling against Gemini, Groq, and Ollama with LangChain.
- What about DevOps? Docker and Docker Compose, deployment to Linux/VPS and AWS behind Nginx (reverse proxy, SSL) under PM2, GitHub Actions CI/CD, structured logging, Sentry, and CloudWatch.
- Does he build frontend and mobile apps? Yes — a JS→TypeScript migration with a shared API-contract and component library for React, Next.js, and React Native; CRA→Vite cutting build times 60%+; Lighthouse 62→89; and React Native apps published to the App Store and Play Store with background location capture and local offline buffering.
- Where is he based? Palakkad, Kerala, India; works as a Software Engineer at Infinite Open Source Solution LLP in Calicut; open to relocation (Bangalore, UAE/Dubai, Germany, UK).

## Optional

- [Résumé (PDF)](${BASE}/MohammedRinshadMI_FullStack.pdf): Full résumé
- [Sitemap](${BASE}/sitemap.xml): All public URLs
- [GitHub](https://github.com/MohdRinshadmi)
- [LinkedIn](https://linkedin.com/in/mohd-rinshadmi)
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
