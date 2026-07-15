import type { Metadata } from "next";
import { siteConfig } from "./config/site";
import type { BlogPost, Project } from "./types";

const BASE = siteConfig.url;

/* ============================================================================
   KEYWORDS — woven naturally into copy + meta (not stuffed).
   Ordered by ranking intent: role → stack → specialisation → geo.
   ========================================================================== */
export const SITE_KEYWORDS = [
  "Full-Stack Engineer",
  "Full-Stack Developer",
  "Full-Stack Developer India",
  "Full-Stack Web and Mobile Developer",
  "Full-Stack Web and Mobile Engineer",
  "Senior Full-Stack Developer",
  "Software Engineer India",
  "SDE India",
  "Hire Full-Stack Developer India",
  "React Native Developer",
  "React Native Developer India",
  "Mobile App Developer India",
  "React Developer India",
  "React Developer",
  "Web Developer India",
  "Next.js Developer",
  "Node.js Developer",
  "Golang Developer",
  "TypeScript Developer",
  "Full-Stack Developer Kerala",
  "Software Engineer Kerala",
  "Full-Stack Developer Palakkad",
  "AI Engineer",
  "AI Integrated Full-Stack Developer",
  "LLM application developer",
  "RAG developer",
  "multi-agent systems",
  "Vercel AI SDK",
  "real-time systems developer",
  "WebSockets",
  "AWS Docker Kubernetes developer",
  "Cloud Engineer India",
  "Core Web Vitals",
  siteConfig.fullName,
];

/* ============================================================================
   Stable @id anchors. Every page emits a <script> that references these by
   @id instead of re-defining the entities — one canonical Person/WebSite/brand
   across the whole site (no duplicate schema, cross-linked knowledge graph).
   ========================================================================== */
export const ID = {
  person: `${BASE}/#person`,
  website: `${BASE}/#website`,
  organization: `${BASE}/#organization`,
} as const;

const abs = (path: string) => `${BASE}${path === "/" ? "" : path}`;

/* ============================================================================
   METADATA (per-route)
   ========================================================================== */
interface BuildMetaArgs {
  title?: string;
  description?: string;
  /** route path beginning with "/", used for canonical + OG url */
  path?: string;
  /** "website" | "article" | "profile" — drives OG type */
  type?: "website" | "article" | "profile";
  /** article-only OG fields */
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
}

/**
 * Build per-route Metadata with a self-referencing canonical, Open Graph, and
 * Twitter cards. OG images resolve automatically from the nearest
 * `opengraph-image` file (root card, or a per-segment card), so we never set
 * them here — keeping the source of truth in one place.
 */
export function buildMetadata({
  title,
  description = siteConfig.bio,
  path = "/",
  type = "website",
  publishedTime,
  modifiedTime,
  tags,
}: BuildMetaArgs = {}): Metadata {
  const url = abs(path);
  const fullTitle = title
    ? `${title} | ${siteConfig.name}`
    : `${siteConfig.fullName} — ${siteConfig.role}`;
  const ogTitle = title ?? `${siteConfig.fullName} — ${siteConfig.role}`;

  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: type === "profile" ? "profile" : type,
      locale: "en_IN",
      url,
      title: ogTitle,
      description,
      siteName: siteConfig.name,
      ...(type === "article"
        ? { publishedTime, modifiedTime, authors: [siteConfig.url], tags }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
    },
  };
}

/* ============================================================================
   CORE GRAPH — WebSite + Person + Organization(brand). Emitted once, in the
   root layout, on every page. Everything else references these by @id.
   ========================================================================== */
function personNode() {
  return {
    "@type": "Person",
    "@id": ID.person,
    name: siteConfig.fullName,
    alternateName: siteConfig.name,
    givenName: "Mohammed",
    additionalName: "Rinshad",
    familyName: "M I",
    jobTitle: siteConfig.role,
    description: siteConfig.bio,
    url: BASE,
    mainEntityOfPage: abs("/about"),
    email: `mailto:${siteConfig.email}`,
    telephone: siteConfig.phone,
    image: {
      "@type": "ImageObject",
      url: abs(siteConfig.portrait.src),
      width: siteConfig.portrait.width,
      height: siteConfig.portrait.height,
      caption: `${siteConfig.fullName} — ${siteConfig.role}`,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Palakkad",
      addressRegion: "Kerala",
      addressCountry: "IN",
    },
    homeLocation: {
      "@type": "Place",
      name: siteConfig.location,
      geo: {
        "@type": "GeoCoordinates",
        latitude: siteConfig.geo.lat,
        longitude: siteConfig.geo.lng,
      },
    },
    nationality: { "@type": "Country", name: "India" },
    workLocation: [
      { "@type": "Place", name: "Remote" },
      { "@type": "Country", name: "India" },
    ],
    knowsLanguage: ["English", "Malayalam", "Hindi"],
    worksFor: {
      "@type": "Organization",
      name: siteConfig.employer.name,
      url: siteConfig.employer.url,
    },
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: siteConfig.education.name,
      url: siteConfig.education.url,
    },
    hasOccupation: {
      "@type": "Occupation",
      name: "Full-Stack Web & Mobile Engineer",
      occupationalCategory: "15-1252.00", // O*NET: Software Developers
      occupationLocation: [
        { "@type": "Country", name: "India" },
        { "@type": "AdministrativeArea", name: "Kerala" },
      ],
      skills:
        "React, Next.js, React Native, TypeScript, Node.js, Golang, AWS, Docker, PostgreSQL, Redis, RAG, LLM integration, WebSockets, real-time systems",
    },
    seeks: {
      "@type": "Demand",
      name: "Full-Stack Web & Mobile Engineering roles (remote or relocation)",
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
      "REST APIs",
      "WebSockets",
      "Real-time systems",
      "CRDT",
      "AWS",
      "Docker",
      "Kubernetes",
      "PostgreSQL",
      "pgvector",
      "Redis",
      "Microservices",
      "CI/CD",
      "System Design",
      "Vercel AI SDK",
      "LangChain",
      "LLM applications",
      "Retrieval-Augmented Generation (RAG)",
      "Semantic search",
      "Multi-agent systems",
      "Generative AI",
      "Stripe",
      "Core Web Vitals",
    ],
  };
}

function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": ID.website,
    url: BASE,
    name: `${siteConfig.fullName} — ${siteConfig.role}`,
    alternateName: `${siteConfig.name} Portfolio`,
    description: siteConfig.tagline,
    inLanguage: "en-IN",
    publisher: { "@id": ID.organization },
    author: { "@id": ID.person },
    copyrightHolder: { "@id": ID.person },
  };
}

/** The personal brand — used as the `publisher` of articles (needs a logo). */
function organizationNode() {
  return {
    "@type": "Organization",
    "@id": ID.organization,
    name: siteConfig.name,
    legalName: siteConfig.fullName,
    url: BASE,
    email: siteConfig.email,
    founder: { "@id": ID.person },
    logo: {
      "@type": "ImageObject",
      url: abs("/icon.svg"),
      width: 512,
      height: 512,
    },
    sameAs: [siteConfig.social.github, siteConfig.social.linkedin],
    areaServed: ["IN", "AE", "DE", "GB", "Worldwide"],
  };
}

/** Wrap a set of nodes in a single JSON-LD graph document. */
export function graph(...nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}

/** The site-wide graph: emit once in the root layout. */
export function coreGraph() {
  return graph(websiteNode(), personNode(), organizationNode());
}

/* ============================================================================
   PER-PAGE NODES — all reference the core graph by @id.
   ========================================================================== */
export type Crumb = { name: string; path: string };

export function breadcrumb(trail: Crumb[], pagePath: string) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${abs(pagePath)}#breadcrumb`,
    itemListElement: trail.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: abs(c.path),
    })),
  };
}

interface WebPageArgs {
  path: string;
  title: string;
  description: string;
  type?: "WebPage" | "ProfilePage" | "CollectionPage" | "AboutPage" | "ContactPage";
  /** attach a same-page BreadcrumbList by @id */
  hasBreadcrumb?: boolean;
  /** the page's primary subject, referenced by @id (e.g. ID.person, project id) */
  mainEntityId?: string;
  primaryImage?: string;
}

export function webPage({
  path,
  title,
  description,
  type = "WebPage",
  hasBreadcrumb = true,
  mainEntityId,
  primaryImage,
}: WebPageArgs) {
  const url = abs(path);
  return {
    "@type": type,
    "@id": `${url}#webpage`,
    url,
    name: title,
    description,
    isPartOf: { "@id": ID.website },
    about: { "@id": ID.person },
    inLanguage: "en-IN",
    ...(primaryImage
      ? { primaryImageOfPage: { "@type": "ImageObject", url: abs(primaryImage) } }
      : {}),
    ...(hasBreadcrumb ? { breadcrumb: { "@id": `${url}#breadcrumb` } } : {}),
    ...(mainEntityId ? { mainEntity: { "@id": mainEntityId } } : {}),
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

export function faqPage(items: FaqItem[], pagePath: string) {
  return {
    "@type": "FAQPage",
    "@id": `${abs(pagePath)}#faq`,
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

/** A case study as a linked SoftwareSourceCode/CreativeWork entity. */
export function projectNode(project: Project) {
  const url = abs(`/work/${project.slug}`);
  return {
    "@type": ["SoftwareSourceCode", "CreativeWork"],
    "@id": `${url}#project`,
    name: project.title,
    headline: project.tagline,
    description: project.overview,
    abstract: project.description,
    url,
    ...(project.image ? { image: abs(project.image) } : {}),
    author: { "@id": ID.person },
    creator: { "@id": ID.person },
    isPartOf: { "@id": ID.website },
    inLanguage: "en-IN",
    dateCreated: project.year,
    keywords: project.tags.join(", "),
    programmingLanguage: project.stack
      .flatMap((g) => g.items)
      .filter((i) => /type|java|go|python|sql|node|react|next/i.test(i)),
    about: project.categories,
    ...(project.githubUrl ? { codeRepository: project.githubUrl } : {}),
    ...(project.liveUrl ? { discussionUrl: project.liveUrl } : {}),
    mainEntityOfPage: `${url}#webpage`,
  };
}

/** A blog post as a linked BlogPosting entity (Article rich-result eligible). */
export function articleNode(post: BlogPost) {
  const url = abs(`/blog/${post.slug}`);
  return {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.excerpt,
    url,
    mainEntityOfPage: `${url}#webpage`,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: "en-IN",
    author: { "@id": ID.person },
    publisher: { "@id": ID.organization },
    ...(post.coverImage ? { image: abs(post.coverImage) } : {}),
    keywords: post.tags.join(", "),
    articleSection: post.tags[0] ?? "Engineering",
  };
}

/* ============================================================================
   Back-compat helpers (kept so existing imports keep working).
   ========================================================================== */
export function personJsonLd() {
  return coreGraph();
}

export function projectJsonLd(project: Project) {
  return graph(
    projectNode(project),
    breadcrumb(
      [
        { name: "Home", path: "/" },
        { name: "Work", path: "/work" },
        { name: project.title, path: `/work/${project.slug}` },
      ],
      `/work/${project.slug}`,
    ),
  );
}

export function articleJsonLd(post: BlogPost) {
  return graph(articleNode(post));
}

/**
 * Serialize a JSON-LD payload for inline injection. `<` is escaped to `<`
 * so a string value can never terminate the <script> early (XSS-safe).
 */
export function jsonLdScript(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
