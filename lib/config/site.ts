/* ============================================================================
   SITE CONFIG — identity, contact channels, navigation.
   Positioning: Full-Stack Software Engineer, backend-heavy (Node.js,
   Express.js, TypeScript, Python) and hands-on with the clients those APIs
   serve (React, Next.js, React Native). AI/LLM integration is the third rail.
   Voice: confident, concrete, senior. Lead with verbs and numbers.
   Every claim is evidence-backed by the résumé (public/MohammedRinshadMI_FullStack.pdf).
   Location note: the site targets Palakkad, Kerala by deliberate SEO decision —
   the PDF header says Bangalore. That divergence is intentional; don't "fix" it.
   ========================================================================== */
export const siteConfig = {
  name: "Rinshad",
  fullName: "Mohammed Rinshad M I",
  role: "Full-Stack Software Engineer",
  tagline:
    "I build and run production REST APIs, relational schemas, and containerized services — Node.js, Express.js, and TypeScript.",
  bio: "Full-Stack Software Engineer with 3+ years building and running production REST APIs, relational schemas, and containerized services in Node.js, Express.js, and TypeScript on MySQL, Redis, Docker, and AWS. Backend-heavy, and hands-on with the clients those APIs serve: React, Next.js, and React Native. I designed 40+ Express endpoints that cut average API response time 35%, shipped webhook-driven Stripe, PayPal, and Razorpay lifecycles for a platform handling 2,000+ monthly transactions, and deployed containerized services behind Nginx and PM2 with GitHub Actions CI/CD. Additional backend work in Golang (Gin) and Python across self-directed projects on PostgreSQL, pgvector, and RAG pipelines. Based in Palakkad, Kerala, India — available remotely across India and worldwide.",
  location: "Palakkad, Kerala, India",
  locationShort: "Palakkad, IN",
  email: "rinshad803@gmail.com",
  phone: "+91 88486 75355",
  availability: "Open to backend & full-stack engineering roles",
  responsePromise: "Usually replies within 24h",
  resumeUrl: "/MohammedRinshadMI_FullStack.pdf",
  url: "https://rinshad.dev",
  /** Real headshot — used for Person schema image (knowledge-panel eligible). */
  portrait: { src: "/images/rinshad-portrait-v2.jpg", width: 1200, height: 1277 },
  /** Geo (Palakkad, Kerala) — powers geo meta + PostalAddress/GeoCoordinates. */
  geo: { lat: 10.7867, lng: 76.6548, region: "IN-KL", placename: "Palakkad, Kerala, India" },
  /** Current employer — entity node for Person.worksFor (strengthens the graph). */
  employer: {
    name: "Infinite Open Source Solution LLP",
    url: "https://ioss.in",
    location: "Calicut, Kerala, India",
  },
  /** Where I studied — entity node for Person.alumniOf. */
  education: {
    name: "SJES College of Management",
    affiliation: "Bangalore North University",
    url: "https://sjes.in",
  },
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
