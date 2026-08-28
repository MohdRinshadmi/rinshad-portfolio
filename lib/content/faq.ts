import type { FaqItem } from "@/lib/seo";

/* ============================================================================
   FAQ — visible Q&A + FAQPage schema (entity-rich, AI-search & snippet fuel).
   Written as natural-language answers to the exact questions recruiters, and
   AI assistants (ChatGPT, Gemini, Claude, Perplexity), actually ask. Every
   answer is résumé-backed and mirrors the copy elsewhere on the site.
   Positioning: Full-Stack Software Engineer, backend-heavy.
   ========================================================================== */
export const faqs: FaqItem[] = [
  {
    question: "Who is Mohammed Rinshad?",
    answer:
      "Mohammed Rinshad M I is a Full-Stack Software Engineer based in Palakkad, Kerala, India, with 3+ years building and running production REST APIs, relational schemas, and containerized services in Node.js, Express.js, and TypeScript on MySQL, Redis, Docker, and AWS. He is backend-heavy and hands-on with the clients those APIs serve — React, Next.js, and React Native.",
  },
  {
    question: "Is Rinshad a backend, frontend, or full-stack engineer?",
    answer:
      "Full-stack, weighted toward the backend. His day-to-day is REST API design, relational schema design, caching, and deployment: 40+ Express.js endpoints with middleware validation and JWT authentication, normalized MySQL schemas with versioned migrations, Redis caching, and Docker containers behind Nginx and PM2 on Linux/VPS and AWS. He also builds and ships the React, Next.js, and React Native clients that consume those APIs, so he owns the contract from both sides.",
  },
  {
    question: "Is Rinshad available for hire or remote work?",
    answer:
      "Yes. Rinshad is open to backend and full-stack software engineering roles — remote across India and worldwide, or on-site with relocation. He typically replies within 24 hours by email at rinshad803@gmail.com.",
  },
  {
    question: "What is Rinshad's technology stack?",
    answer:
      "Backend: Node.js, Express.js, TypeScript, and Python (FastAPI), plus Golang with Gin — REST API design, WebSockets, JWT/OAuth, RBAC, middleware architecture, webhooks, background jobs, API versioning, and rate limiting. Data: PostgreSQL, MySQL, MongoDB, Redis, SQLite, and pgvector, with Sequelize and GORM, schema design, indexing, query optimization, transactions, and migrations. Cloud and DevOps: AWS (EC2, S3, IAM, CloudWatch), Docker and Docker Compose, GitHub Actions CI/CD, Nginx, PM2, and Linux/VPS administration. Frontend and mobile: React, Next.js (App Router, Server Components), React Native, Redux Toolkit, Zustand, TanStack Query, Tailwind CSS, and Vite.",
  },
  {
    question: "What backend results has Rinshad delivered?",
    answer:
      "He designed and built 40+ RESTful API endpoints with Express.js and Sequelize ORM where middleware validation, JWT authentication, and SQL query and index optimization cut average API response time by 35%. He integrated Stripe, PayPal, and Razorpay with webhook-driven order lifecycles, signature verification, and safe retries for an eCommerce platform handling 2,000+ monthly transactions, added Redis caching for read-heavy endpoints, and built the sync backend for an offline-first geolocation tracking system with batched uploads, duplicate-safe writes, and retry-based recovery through prolonged network outages.",
  },
  {
    question: "Does Rinshad work with AI, LLMs, and RAG?",
    answer:
      "Yes, from the data side. Across self-directed projects he has built Python data-ingestion pipelines — chunking and embedding generation — feeding HNSW-indexed semantic search on PostgreSQL with pgvector, and Node.js API layers that stream LLM responses and execute server-side tool/function calling against Gemini, Groq, and Ollama, with LangChain for orchestration and JWT refresh-token rotation plus Redis rate limiting at the edge.",
  },
  {
    question: "What are Rinshad's DevOps and deployment skills?",
    answer:
      "He containerizes services with Docker and Docker Compose and deploys to Linux/VPS and AWS behind Nginx as a reverse proxy with SSL, running under PM2, with GitHub Actions CI/CD pipelines, structured logging, Sentry, and CloudWatch monitoring in production. Database migrations are versioned so releases go out without downtime.",
  },
  {
    question: "Does Rinshad build frontend and mobile apps too?",
    answer:
      "Yes. He migrated a production codebase from JavaScript to TypeScript and built the shared API-contract and component library that its React, Next.js, and React Native clients all consume. He moved the React build from Create React App to Vite, cutting build times 60%+ (~90s to ~35s), and code-splitting plus CDN assets lifted Lighthouse from 62 to 89 and page load from 3.8s to 2.1s. He has shipped React Native apps to the Google Play Store and Apple App Store with background location capture and local buffering for offline use.",
  },
  {
    question: "Where is Rinshad based, and which regions does he work with?",
    answer:
      "Rinshad is based in Palakkad, Kerala, India, and currently works as a Software Engineer at Infinite Open Source Solution LLP in Calicut. He collaborates with teams remotely across India and internationally, and is open to relocation for roles in regions such as Bangalore, the UAE (Dubai), Germany, and the United Kingdom.",
  },
];
