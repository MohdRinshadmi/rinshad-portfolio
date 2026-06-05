/* ============================================================================
   CONTENT TYPES
   ========================================================================== */

export interface ProjectMetric {
  label: string;
  value: string;
}

export interface StackGroup {
  label: string;
  items: string[];
}

/** A before → after performance line, with a real number. */
export interface PerfPoint {
  label: string;
  before: string;
  after: string;
  note?: string;
}

/** One node in the case-study architecture flow (client → realtime → AI → …). */
export interface ArchNode {
  id: string;
  label: string;
  sub?: string;
  /** marks the critical path — rendered in accent */
  critical?: boolean;
}

export interface Project {
  slug: string;
  title: string;
  /** one-line outcome shown on the card + case-study hero */
  tagline: string;
  /** card body / index summary */
  description: string;
  /** mono eyebrow, e.g. "WEB · REAL-TIME" */
  platform: string;
  year: string;
  role: string;
  timeline: string;
  /** filter buckets for /work, e.g. ["AI", "Real-time"] */
  categories: string[];

  /* — case-study long-form (all évidence-backed from the résumé) — */
  overview: string;
  problem: string;
  approach: string;
  solution: string;
  architecture: {
    summary: string;
    nodes: ArchNode[];
  };
  challenges: string[];
  performance: PerfPoint[];
  results: string[];
  lessons: string[];

  /* — chips & stack — */
  tags: string[]; // short tech chips on the card (cap to 4 in UI)
  stack: StackGroup[]; // grouped, full, on the case study
  metrics: ProjectMetric[]; // inline stat ticks / stat cards

  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
}

/** Capability pillar for the homepage matrix (replaces % skill bars). */
export interface Capability {
  title: string;
  blurb: string;
  items: string[];
}

/** A single proof-strip fact (some count up, some are static labels). */
export interface ProofStat {
  /** numeric target for count-up; omit for static-value stats */
  to?: number;
  prefix?: string;
  suffix?: string;
  /** static display value when `to` is absent, e.g. "App Store + Play" */
  value?: string;
  label: string;
}

export interface SkillGroup {
  label: string;
  items: string[];
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  description: string;
  achievements: string[];
  technologies: string[];
  current?: boolean;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  affiliation: string;
  location: string;
  period: string;
}

export interface WorkProcess {
  step: number;
  title: string;
  description: string;
  icon: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  title: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tags: string[];
  coverImage?: string;
}

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

/** Kept for backwards-compat; new UI uses Capability/SkillGroup instead. */
export interface Skill {
  name: string;
  icon: string;
  category: "languages" | "frameworks" | "ai" | "realtime" | "tooling" | "workflow";
  level: number;
}
