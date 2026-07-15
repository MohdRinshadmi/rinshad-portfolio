import type { FaqItem } from "@/lib/seo";

/* ============================================================================
   FAQ — visible Q&A + FAQPage schema (entity-rich, AI-search & snippet fuel).
   Written as natural-language answers to the exact questions recruiters, and
   AI assistants (ChatGPT, Gemini, Claude, Perplexity), actually ask. Every
   answer is résumé-backed and mirrors the copy elsewhere on the site.
   ========================================================================== */
export const faqs: FaqItem[] = [
  {
    question: "Who is Mohammed Rinshad?",
    answer:
      "Mohammed Rinshad M I is a Full-Stack Web & Mobile Engineer based in Palakkad, Kerala, India, with 2.5+ years of experience shipping 20+ production features across eCommerce, LMS, and AI platforms. He builds end-to-end products on React, Next.js, React Native, TypeScript, Node.js, Golang, and AWS — including AI/LLM features, real-time systems, and payment integrations.",
  },
  {
    question: "What kind of developer is Rinshad — full-stack, frontend, or backend?",
    answer:
      "Rinshad is a full-stack engineer who works across the whole path: React, Next.js, and React Native front-ends wired to Node.js and Golang REST APIs, backed by PostgreSQL, Redis, and Docker. He has architected 40+ REST endpoints, led a live JavaScript-to-TypeScript migration across web and mobile, and owns everything from UI to API contracts to deployment.",
  },
  {
    question: "Is Rinshad available for hire or remote work?",
    answer:
      "Yes. Rinshad is open to full-stack web and mobile engineering roles — remote across India and worldwide, or on-site with relocation. He typically replies within 24 hours by email at rinshad803@gmail.com.",
  },
  {
    question: "What is Rinshad's technology stack?",
    answer:
      "Core stack: React, Next.js (App Router, React Server Components, SSR), React Native, and TypeScript on the front end; Node.js/Express and Golang/Gin on the back end; PostgreSQL with pgvector, Redis, and MongoDB for data; and AWS, Docker, and CI/CD for delivery. On the AI side he uses the Vercel AI SDK, LangChain, Gemini, and Groq for RAG, semantic search, streaming chat, and tool/function calling.",
  },
  {
    question: "Does Rinshad build AI and LLM features?",
    answer:
      "Yes — AI is a first-class part of his work, not a bolt-on. He has built streaming AI copilots with tool/function calling, Retrieval-Augmented Generation (RAG) over pgvector with HNSW indexing, semantic search, and multi-agent workflows using LangChain and the Vercel AI SDK, designing for streaming, cancellation, and tool-call transparency in production interfaces.",
  },
  {
    question: "What measurable results has Rinshad delivered?",
    answer:
      "He cut average API latency by 35% across 40+ Express endpoints, raised a product's Lighthouse performance score from 62 to 89 (3.8s to 2.1s load), processed 2,000+ monthly transactions with webhook-driven Stripe, PayPal, and Razorpay integrations, and cut team build times 60% by migrating from Create React App to Vite.",
  },
  {
    question: "Does Rinshad build mobile apps?",
    answer:
      "Yes. He builds cross-platform mobile apps with React Native — including an offline-first geolocation tracking system with background capture and retry-based recovery — and has shipped and published apps to the Apple App Store and Google Play Store with signing, release builds, and store-review compliance.",
  },
  {
    question: "Where is Rinshad based, and which regions does he work with?",
    answer:
      "Rinshad is based in Palakkad, Kerala, India, and currently works as a Software Engineer in Calicut. He collaborates with teams remotely across India and internationally, and is open to relocation for roles in regions such as the UAE (Dubai), Germany, and the United Kingdom.",
  },
];
