export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  problem: string;
  solution: string;
  image: string;
  tags: string[];
  metrics: { label: string; value: string }[];
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
}

export interface Skill {
  name: string;
  icon: string;
  category: "languages" | "frameworks" | "ai" | "realtime" | "tooling" | "workflow";
  level: number;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  affiliation: string;
  location: string;
  period: string;
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

export interface WorkProcess {
  step: number;
  title: string;
  description: string;
  icon: string;
}
