import type { FaqItem } from "@/lib/seo";

/* ============================================================================
   FAQ — visible Q&A + FAQPage schema (entity-rich, AI-search & snippet fuel).
   Written as natural-language answers to the exact questions recruiters, and
   AI assistants (ChatGPT, Gemini, Claude, Perplexity), actually ask. Every
   answer is backed by the résumé (public/MohdRinshad_FullStackEngineer_Resume.pdf)
   and mirrors the copy elsewhere on the site. Location stays Palakkad by choice.
   ========================================================================== */
export const faqs: FaqItem[] = [
  {
    question: "Who is Mohammed Rinshad?",
    answer:
      "Mohammed Rinshad M I is a Full-Stack Software Engineer based in Palakkad, Kerala, India, with 3+ years designing, shipping, and operating production systems end to end — REST APIs, relational schemas, and containerized services in Node.js, Express.js, and TypeScript on MySQL, Redis, Docker, and AWS, together with the React, Next.js, and React Native clients that consume them. He extends into Golang (Gin), Python, PostgreSQL, pgvector, and RAG pipelines through self-built distributed and real-time systems.",
  },
  {
    question: "Is Rinshad a backend, frontend, or full-stack engineer?",
    answer:
      "Full-stack, weighted toward the backend. He owns delivery from schema and API design through CI/CD, deployment, and production monitoring: 40+ production REST endpoints in Express.js, Sequelize ORM, and TypeScript; the platform's MySQL data layer with versioned migrations released with zero downtime; and production infrastructure on AWS and Linux/VPS. He also led the TypeScript migration and shared API-contract standard for the React, Next.js, and React Native clients, so he owns the contract from both sides.",
  },
  {
    question: "Is Rinshad available for hire or remote work?",
    answer:
      "Yes. Rinshad is open to full-stack and backend software engineering roles — remote across India and worldwide, or on-site with relocation. He typically replies within 24 hours by email at rinshad803@gmail.com.",
  },
  {
    question: "What is Rinshad's technology stack?",
    answer:
      "Languages: TypeScript, JavaScript, Python, Golang, and SQL. Backend: Node.js, Express.js, FastAPI, and Gin — REST API design, WebSockets, authentication and authorization (JWT, OAuth, RBAC), middleware architecture, webhooks, background jobs, API versioning, rate limiting, and Redis Pub/Sub. Data: PostgreSQL, MySQL, MongoDB, Redis, SQLite, and pgvector, with Sequelize and GORM. Cloud and DevOps: AWS (EC2, S3, IAM, CloudWatch), Docker and Docker Compose, GitHub Actions CI/CD, Nginx (reverse proxy, load balancing, SSL/TLS), PM2, Linux/VPS administration, shell scripting, zero-downtime deployments, and observability. Frontend and mobile: React, Next.js, React Native, Redux Toolkit, Zustand, TanStack Query, Tailwind CSS, and Vite. Testing: Jest, Vitest, Playwright, Postman, and Sentry.",
  },
  {
    question: "What backend results has Rinshad delivered?",
    answer:
      "He cut average API response time 35% across 40+ production endpoints through SQL query and index optimization and a Redis caching layer. He delivered payment infrastructure across three gateways — Stripe, PayPal, and Razorpay — with webhook-driven order lifecycles, signature verification, and idempotent retries for an eCommerce platform processing 2,000+ transactions a month. He also designed the sync backend for an offline-first geolocation tracking system, with batched uploads, idempotent writes, and retry-based recovery that survives prolonged network outages.",
  },
  {
    question: "Does Rinshad work with AI, LLMs, and RAG?",
    answer:
      "Yes, from the data side. Across self-built systems he has built Python data-ingestion pipelines — chunking and embedding generation — feeding HNSW-indexed semantic search on PostgreSQL with pgvector, and Node.js API layers that stream LLM responses and execute server-side tool/function calling against Gemini, Groq, and Ollama, with LangChain for orchestration and JWT refresh-token rotation plus Redis rate limiting at the edge.",
  },
  {
    question: "What are Rinshad's DevOps and deployment skills?",
    answer:
      "He owns production infrastructure on AWS (EC2, S3, IAM, CloudWatch) and Linux/VPS: Docker-containerized services behind Nginx and PM2, GitHub Actions CI/CD, structured logging, and monitoring. His skill set covers Nginx as reverse proxy, load balancer, and SSL/TLS terminator, shell scripting, observability and alerting, and zero-downtime deployments — database migrations are versioned so releases go out without downtime.",
  },
  {
    question: "Does Rinshad build frontend and mobile apps too?",
    answer:
      "Yes. He led the platform-wide migration from JavaScript to TypeScript and set the shared API-contract and component library standard adopted by three client applications across React, Next.js, and React Native. He drove the React build migration from Create React App to Vite, cutting frontend build times 60%+, while code-splitting and CDN asset delivery lifted Lighthouse from 62 to 89 and page load from 3.8s to 2.1s. He ships and maintains React Native apps on Google Play and the Apple App Store, with background location capture and local buffering for offline use.",
  },
  {
    question: "How does Rinshad work within an engineering team?",
    answer:
      "With technical ownership: he makes and documents architecture and design decisions, reviews code, writes technical documentation, and shares knowledge across cross-functional Agile/Scrum teams. On his current platform he led the TypeScript migration and set the API-contract standard that three client applications adopted.",
  },
  {
    question: "Where is Rinshad based, and which regions does he work with?",
    answer:
      "Rinshad is based in Palakkad, Kerala, India, and works as a Software Engineer at Infinite Open Source Solution LLP. He collaborates with teams remotely across India and internationally, and is open to relocation for roles in regions such as Bangalore, the UAE (Dubai), Germany, and the United Kingdom.",
  },
];
