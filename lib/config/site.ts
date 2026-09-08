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

/** Used only when nothing is configured — i.e. local dev and the test run. */
const DEV_FALLBACK = "http://localhost:3000";

/** Reduce any accepted form to a bare origin: scheme + host + port, no path,
    no trailing slash. `URL.origin` does all three, which is why the value is
    round-tripped through it rather than string-concatenated. */
function toOrigin(value: string): string | null {
  // VERCEL_PROJECT_PRODUCTION_URL is a BARE hostname ("foo.vercel.app"), while
  // NEXT_PUBLIC_SITE_URL is normally a full URL. Only add the scheme when one
  // is absent, so a configured "https://..." can't become "https://https://...".
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    return new URL(withScheme).origin;
  } catch {
    return null;
  }
}

/**
 * The canonical origin every absolute URL on this site is built from —
 * canonical tags, OG urls, sitemap, robots, RSS, and every JSON-LD @id.
 *
 * Priority:
 *   1. NEXT_PUBLIC_SITE_URL          — explicit, wins everywhere
 *   2. VERCEL_PROJECT_PRODUCTION_URL — Vercel's own production hostname
 *   3. http://localhost:3000         — local dev / tests only
 *
 * (2) is a SAFETY NET, not the intended production path. Vercel sets it to the
 * project's production domain even inside preview builds, so a deploy where
 * someone forgot (1) still emits real production canonicals instead of pointing
 * the whole sitemap at localhost. Set NEXT_PUBLIC_SITE_URL in the project
 * anyway: it is the only one of the three that is also inlined into the CLIENT
 * bundle, so it is what keeps server and browser agreeing if any client
 * component ever renders `siteConfig.url`. Nothing renders it today.
 *
 * A configured-but-unparseable value throws rather than falling back. Failing
 * the build is the cheap outcome; the expensive one is silently publishing a
 * sitemap full of http://localhost:3000.
 */
export function resolveSiteUrl(
  env: Record<string, string | undefined> = process.env,
): string {
  for (const key of ["NEXT_PUBLIC_SITE_URL", "VERCEL_PROJECT_PRODUCTION_URL"] as const) {
    const raw = env[key]?.trim();
    if (!raw) continue;

    const origin = toOrigin(raw);
    if (!origin) {
      throw new Error(
        `${key} is not a usable URL or hostname (got "${raw}"). ` +
          `Expected something like "https://example.com" or "example.vercel.app".`,
      );
    }
    return origin;
  }

  return DEV_FALLBACK;
}

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
  /** Environment-resolved — see resolveSiteUrl above. Deliberately NOT a
      hard-coded domain: rinshad.dev is not registered, and shipping canonicals
      to a domain that does not resolve is worse than having none. */
  url: resolveSiteUrl(),
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
