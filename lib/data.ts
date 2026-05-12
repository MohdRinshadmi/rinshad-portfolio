import type {
  Project,
  Skill,
  Experience,
  Testimonial,
  SocialLink,
  WorkProcess,
} from "./types";

export const siteConfig = {
  name: "Rinshad",
  fullName: "Rinshad C",
  role: "Full-Stack Engineer",
  tagline: "I build products that scale.",
  bio: "Senior full-stack engineer with 6+ years crafting high-performance web products. I specialize in React/Next.js frontends paired with robust Node.js and cloud backends. Currently open to senior roles at product-focused companies.",
  location: "Dubai, UAE",
  email: "rinshad@example.com",
  availability: "Available for senior roles",
  avatarUrl: "/images/avatar/rinshad.jpg",
  resumeUrl: "/rinshad-resume.pdf",
  social: {
    github: "https://github.com/rinshad",
    linkedin: "https://linkedin.com/in/rinshad",
    twitter: "https://twitter.com/rinshad",
  } as Record<string, string>,
} as const;

export const stats = [
  { label: "Years Experience", value: 6, suffix: "+" },
  { label: "Projects Shipped", value: 42, suffix: "+" },
  { label: "Happy Clients", value: 28, suffix: "" },
  { label: "GitHub Stars", value: 1400, suffix: "+" },
];

export const projects: Project[] = [
  {
    id: "saas-dashboard",
    title: "SaaS Analytics Platform",
    tagline: "Real-time data at enterprise scale",
    description:
      "A multi-tenant SaaS analytics dashboard serving 50k+ users with real-time data visualization and custom reporting.",
    problem:
      "Clients needed live visibility into complex business KPIs without building internal tooling.",
    solution:
      "Built a multi-tenant platform with WebSocket-powered live dashboards, role-based access, and a no-code report builder.",
    image: "/images/projects/saas-dashboard.png",
    tags: ["Next.js", "TypeScript", "PostgreSQL", "Redis", "WebSockets", "AWS"],
    metrics: [
      { label: "Active Users", value: "50k+" },
      { label: "Latency Reduction", value: "60%" },
      { label: "Uptime", value: "99.97%" },
    ],
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/rinshad/saas-dashboard",
    featured: true,
  },
  {
    id: "ecommerce-engine",
    title: "Headless Commerce Engine",
    tagline: "Blazing-fast storefronts, zero compromise",
    description:
      "A headless e-commerce engine powering multiple storefronts with a shared inventory and order management backend.",
    problem:
      "Agency clients needed performant storefronts that could be customized without touching backend logic.",
    solution:
      "Architected a headless system with Next.js storefronts, a GraphQL API layer, and a shared fulfillment service.",
    image: "/images/projects/ecommerce.png",
    tags: ["Next.js", "GraphQL", "Stripe", "Node.js", "MongoDB", "Vercel"],
    metrics: [
      { label: "Core Web Vitals", value: "100/100" },
      { label: "Conversion Lift", value: "+23%" },
      { label: "Deploy Time", value: "45s" },
    ],
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/rinshad/headless-commerce",
    featured: true,
  },
  {
    id: "devtools-cli",
    title: "DevOps CLI Toolkit",
    tagline: "One CLI to rule your entire workflow",
    description:
      "An extensible CLI tool that unifies cloud deployments, secret management, and DB migrations across environments.",
    problem:
      "Teams were juggling 8+ tools for environment management, causing deployment errors and secrets sprawl.",
    solution:
      "Built a single CLI with pluggable commands that wraps Terraform, Vault, and custom migration runners.",
    image: "/images/projects/devtools.png",
    tags: ["Node.js", "TypeScript", "Terraform", "Docker", "AWS", "Vault"],
    metrics: [
      { label: "GitHub Stars", value: "1.2k" },
      { label: "Deploy Errors", value: "-80%" },
      { label: "Onboarding Time", value: "2hrs→20min" },
    ],
    githubUrl: "https://github.com/rinshad/devtools-cli",
    featured: true,
  },
];

export const skills: Skill[] = [
  { name: "TypeScript", icon: "typescript", category: "frontend", level: 95 },
  { name: "React / Next.js", icon: "react", category: "frontend", level: 95 },
  { name: "Tailwind CSS", icon: "tailwind", category: "frontend", level: 90 },
  { name: "Framer Motion", icon: "framer", category: "frontend", level: 85 },
  { name: "Node.js", icon: "nodejs", category: "backend", level: 90 },
  { name: "PostgreSQL", icon: "postgres", category: "backend", level: 85 },
  { name: "Redis", icon: "redis", category: "backend", level: 80 },
  { name: "GraphQL", icon: "graphql", category: "backend", level: 80 },
  { name: "Docker", icon: "docker", category: "devops", level: 85 },
  { name: "AWS", icon: "aws", category: "devops", level: 80 },
  { name: "Terraform", icon: "terraform", category: "devops", level: 70 },
  { name: "GitHub Actions", icon: "github", category: "devops", level: 85 },
  { name: "Figma", icon: "figma", category: "tools", level: 75 },
  { name: "Vercel", icon: "vercel", category: "tools", level: 90 },
];

export const experience: Experience[] = [
  {
    id: "exp-1",
    role: "Senior Full-Stack Engineer",
    company: "TechCorp Inc.",
    location: "Dubai, UAE (Remote)",
    period: "2022 – Present",
    current: true,
    description:
      "Leading front-end architecture for a B2B SaaS product used by Fortune 500 companies. Own the performance roadmap and mentor 3 junior engineers.",
    achievements: [
      "Rebuilt core dashboard with Next.js App Router, cutting TTI by 55%",
      "Designed a real-time notification system handling 2M events/day",
      "Established component library used across 4 product teams",
    ],
    technologies: ["Next.js", "TypeScript", "Node.js", "PostgreSQL", "Redis", "AWS"],
  },
  {
    id: "exp-2",
    role: "Full-Stack Engineer",
    company: "Agency XYZ",
    location: "Kochi, India",
    period: "2020 – 2022",
    description:
      "Built bespoke web products for clients across fintech, logistics, and retail verticals.",
    achievements: [
      "Delivered 12 production projects on time and under budget",
      "Introduced automated E2E testing, reducing QA cycles by 40%",
      "Open-sourced a reusable headless component library (300+ GitHub stars)",
    ],
    technologies: ["React", "Node.js", "MongoDB", "Stripe", "Vercel"],
  },
  {
    id: "exp-3",
    role: "Junior Frontend Developer",
    company: "Startup Hub",
    location: "Kochi, India",
    period: "2019 – 2020",
    description:
      "Built responsive UIs for early-stage startup products, collaborating directly with founders and designers.",
    achievements: [
      "Shipped 3 MVPs from 0 to launch within 6-month timelines",
      "Improved Lighthouse performance scores from 45 to 90+ on all projects",
    ],
    technologies: ["React", "JavaScript", "CSS", "Firebase"],
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Sarah Chen",
    role: "CTO",
    company: "TechCorp Inc.",
    avatar: "/images/avatar/sarah.jpg",
    quote:
      "Rinshad doesn't just write code — he thinks in systems. The architecture he designed for our analytics platform is the reason we scaled to 50k users without a rewrite. Rare engineer.",
  },
  {
    id: "t2",
    name: "Alex Martinez",
    role: "Product Lead",
    company: "Agency XYZ",
    avatar: "/images/avatar/alex.jpg",
    quote:
      "Every project Rinshad touched shipped on time and exceeded expectations. He has a designer's eye combined with serious engineering depth. Our clients consistently noticed the quality difference.",
  },
  {
    id: "t3",
    name: "Priya Nair",
    role: "Engineering Manager",
    company: "Fintech Startup",
    avatar: "/images/avatar/priya.jpg",
    quote:
      "Brought Rinshad in to rescue a performance-critical feature. He diagnosed the root cause in 2 hours and delivered a fix that was 10x better than our original approach. A true force-multiplier.",
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
  { name: "Twitter / X", url: siteConfig.social.twitter, icon: "Twitter" },
];
