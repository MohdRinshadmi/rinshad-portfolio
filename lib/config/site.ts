/* ============================================================================
   SITE CONFIG — identity, contact channels, navigation.
   Positioning: Full-Stack Web & Mobile Engineer (AI/LLM a supporting theme).
   Voice: confident, concrete, senior. Lead with verbs and numbers.
   Every claim is evidence-backed by the résumé.
   ========================================================================== */
export const siteConfig = {
  name: "Rinshad",
  fullName: "Mohammed Rinshad M I",
  role: "Full-Stack Web & Mobile Engineer",
  tagline: "I build full-stack web and mobile apps end-to-end — React, Next.js, React Native, and Node.js.",
  bio: "Full-Stack Web & Mobile Engineer with 2.5+ years building and scaling production web and mobile apps — 20+ features shipped across eCommerce, LMS, and AI platforms on React, Next.js, React Native, TypeScript, Node.js, Golang, and AWS. I build full-stack products — React and React Native front-ends wired to Node.js and Go APIs — with AI/LLM features (RAG, semantic search, streaming chat, and tool/function calling via LangChain and the Vercel AI SDK), real-time collaboration (WebSockets, Yjs CRDT), and payment systems (Stripe, PayPal, Razorpay), backed by PostgreSQL + pgvector, Redis, and Docker. I cut API latency 35%, raised Lighthouse from 62 to 89, and processed 2,000+ monthly transactions with webhook-driven order lifecycles. Based in Palakkad, Kerala, India — available remotely across India and worldwide.",
  location: "Palakkad, Kerala, India",
  locationShort: "Palakkad, IN",
  email: "rinshad803@gmail.com",
  phone: "+91 88486 75355",
  availability: "Open to AI & full-stack engineering roles",
  responsePromise: "Usually replies within 24h",
  resumeUrl: "/MohammedRinshadMI_FullStack.pdf",
  url: "https://rinshad.dev",
  social: {
    github: "https://github.com/MohdRinshadmi",
    linkedin: "https://linkedin.com/in/mohd-rinshadmi",
  } as Record<string, string>,
} as const;

export const navLinks = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Writing" },
  { href: "/contact", label: "Contact" },
];

/** Footer gets the full map; the navbar stays tight (quiet pages live here only). */
export const footerLinks = [...navLinks, { href: "/uses", label: "Uses" }];

/** Icon names resolve in the consuming component (parked 3D journey uses this). */
export const socialLinks = [
  { name: "GitHub", url: siteConfig.social.github, icon: "Github" },
  { name: "LinkedIn", url: siteConfig.social.linkedin, icon: "Linkedin" },
];
