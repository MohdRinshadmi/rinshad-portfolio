import type { Metadata } from "next";
import { siteConfig } from "./data";
import type { BlogPost, Project } from "./types";

const BASE = siteConfig.url;

/** Shared keyword set woven naturally into copy + meta. */
export const SITE_KEYWORDS = [
  "Full-Stack Engineer",
  "Full-Stack Developer",
  "Full-Stack Web and Mobile Developer",
  "Full-Stack Web and Mobile Engineer",
  "Web and Mobile Developer",
  "React Native Developer",
  "Mobile App Developer",
  "React Developer",
  "Next.js Developer",
  "Node.js Developer",
  "Golang Developer",
  "TypeScript",
  "AI Engineer",
  "LLM application developer",
  "RAG",
  "multi-agent systems",
  "Vercel AI SDK",
  "real-time systems",
  "WebSockets",
  "Core Web Vitals",
  siteConfig.fullName,
];

interface BuildMetaArgs {
  title?: string;
  description?: string;
  /** route path beginning with "/", used for canonical + OG url */
  path?: string;
  /** override the OG image (defaults to the route's generated opengraph-image) */
  image?: string;
}

/** Build per-route Metadata with canonical, Open Graph, and Twitter cards. */
export function buildMetadata({
  title,
  description = siteConfig.bio,
  path = "/",
}: BuildMetaArgs = {}): Metadata {
  const url = `${BASE}${path === "/" ? "" : path}`;
  const fullTitle = title ? `${title} | ${siteConfig.name}` : `${siteConfig.fullName} — ${siteConfig.role}`;
  const ogTitle = title ?? `${siteConfig.fullName} — ${siteConfig.role}`;

  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      title: ogTitle,
      description,
      siteName: siteConfig.name,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
    },
  };
}

/* ============================================================================
   JSON-LD
   ========================================================================== */
export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.fullName,
    alternateName: siteConfig.name,
    jobTitle: siteConfig.role,
    description: siteConfig.bio,
    email: `mailto:${siteConfig.email}`,
    url: BASE,
    image: `${BASE}/opengraph-image`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Palakkad",
      addressRegion: "Kerala",
      addressCountry: "IN",
    },
    sameAs: [siteConfig.social.github, siteConfig.social.linkedin],
    knowsAbout: [
      "Full-Stack Development",
      "Web Development",
      "Mobile App Development",
      "React",
      "React Native",
      "Next.js",
      "Node.js",
      "Golang",
      "TypeScript",
      "Vercel AI SDK",
      "LLM applications",
      "RAG",
      "Multi-agent systems",
      "Real-time systems",
      "WebSockets",
    ],
  };
}

export function projectJsonLd(project: Project) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    headline: project.tagline,
    description: project.overview,
    url: `${BASE}/work/${project.slug}`,
    author: { "@type": "Person", name: siteConfig.fullName },
    keywords: project.tags.join(", "),
  };
}

export function articleJsonLd(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    url: `${BASE}/blog/${post.slug}`,
    author: { "@type": "Person", name: siteConfig.fullName },
    keywords: post.tags.join(", "),
  };
}

/** Inline <script type="application/ld+json"> payload string. */
export function jsonLdScript(data: object): string {
  return JSON.stringify(data);
}
