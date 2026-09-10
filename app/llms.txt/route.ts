import { siteConfig } from "@/lib/config/site";
import { experience, keyAchievements, skillGroups } from "@/lib/content/profile";
import { projects, workDisclaimer } from "@/lib/content/projects";
import { faqs } from "@/lib/content/faq";

const BASE = siteConfig.url;

/**
 * /llms.txt — the llmstxt.org convention: a single plain-text brief that AI
 * assistants can read instead of scraping the whole site.
 *
 * Served from a route handler so every URL derives from the same
 * `siteConfig.url` as the sitemap, feed, canonicals and JSON-LD. The prose is
 * GENERATED from the content modules rather than hand-copied: it used to be a
 * third copy of every résumé claim, and it drifted each time the résumé did.
 */
export async function GET() {
  const role = experience.find((item) => item.current) ?? experience[0];
  const intro =
    faqs.find((faq) => faq.question.startsWith("Who is"))?.answer ?? siteConfig.description;

  const lines = [
    `# ${siteConfig.name} — ${siteConfig.role}`,
    "",
    `> ${intro}`,
    "",
    "Key facts:",
    `- Role: ${siteConfig.role} — backend, cloud, distributed systems and AI/LLM`,
    `- Location: ${siteConfig.location} — open to remote roles or relocation (Europe, UK, UAE)`,
    `- Availability: ${siteConfig.availability}`,
    `- Email: ${siteConfig.email}`,
    `- Current role: ${role.role}, ${role.company} (${role.period})`,
    "",
    "Key achievements:",
    ...keyAchievements.map((item) => `- ${item.lead} ${item.detail}`),
    "",
    "Skills:",
    ...skillGroups.map((group) => `- ${group.label}: ${group.items.join(", ")}`),
    "",
    `Experience — ${role.role}, ${role.company}:`,
    ...role.achievements.map((item) => `- ${item}`),
    "",
    "## Pages",
    "",
    `- [Home](${BASE}): Overview, positioning, and featured work`,
    `- [Work](${BASE}/work): Case studies of self-built systems`,
    `- [Experience](${BASE}/about#experience): Current role, achievements, and education`,
    `- [About](${BASE}/about): Long-form bio, skills, experience, and how he works`,
    `- [Writing](${BASE}/blog): Engineering articles`,
    `- [Contact](${BASE}/contact): Get in touch`,
    "",
    "## Systems & cloud projects",
    "",
    `${workDisclaimer} Source: ${siteConfig.social.github}`,
    "",
    ...projects.map(
      (project) =>
        `- [${project.title}](${BASE}/work/${project.slug}): ${project.card.purpose} ${project.solution} Stack: ${project.tags.join(", ")}.${project.githubUrl ? ` Code: ${project.githubUrl}` : ""}`,
    ),
    "",
    "## Writing",
    "",
    `- [Next.js Performance Patterns](${BASE}/blog/nextjs-performance-patterns): Practical patterns for fast React Server Component apps.`,
    "",
    "## FAQ",
    "",
    ...faqs.map((faq) => `- ${faq.question} ${faq.answer}`),
    "",
    "## Optional",
    "",
    `- [Résumé (PDF)](${BASE}${siteConfig.resumeUrl}): Full résumé`,
    `- [Sitemap](${BASE}/sitemap.xml): All public URLs`,
    `- [GitHub](${siteConfig.social.github})`,
    `- [LinkedIn](${siteConfig.social.linkedin})`,
  ];

  return new Response(`${lines.join("\n")}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
