import { siteConfig, footerLinks, socialLinks } from "@/lib/config/site";
import {
  about,
  education,
  experience,
  keyAchievements,
  proofStats,
  skillGroups,
  workProcess,
} from "@/lib/content/profile";
import { projects, workDisclaimer } from "@/lib/content/projects";
import { faqs } from "@/lib/content/faq";
import { colophon, usesCategories, usesIntro } from "@/lib/content/uses";
import {
  chapterInterfaces,
  chapterPrinciples,
  chapterProduction,
  chapterSystems,
  chapterWork,
  epilogue,
  prologue,
} from "@/lib/content/story";
import { getAllPosts, getPostBySlug } from "@/lib/server/blog";

/* ============================================================================
   THE CHAT CORPUS — everything the assistant is allowed to know.

   Phase A deliberately has no retrieval. The whole site is ~15k tokens, so the
   entire corpus rides in the Gemini system prompt and the model never has to
   guess which slice of the site is relevant. Vectors earn their keep past the
   point where the corpus stops fitting in a prompt; this is nowhere near it.

   Three rules hold the grounding together:

   1. NOTHING IS RE-TYPED. Every chunk is flattened from the same content
      exports the pages render, so a résumé edit reaches the assistant on the
      next deploy. A hand-written copy would be the fourth copy of each claim,
      and it would drift exactly the way llms.txt used to.

   2. NO URLS IN THE PROMPT. The model only ever sees chunk ids. Links are
      rebuilt from `sourceUrl` on the server after it cites an id, so there is
      no URL for it to repeat, mangle, or invent.

   3. BYTE-IDENTICAL OUTPUT. Chunks are sorted by id and nothing depends on the
      clock or on filesystem order. A stable prompt is testable, and it is
      also the prefix Gemini's implicit context cache can reuse between
      requests.

   Server-only: this reads content/blog from disk. Never import it from a
   client component.
   ========================================================================== */

export type ChunkKind =
  | "site"
  | "profile"
  | "experience"
  | "education"
  | "skills"
  | "project"
  | "faq"
  | "uses"
  | "story"
  | "blog";

export type Chunk = {
  /** Stable, url-safe id — what the model cites as `[cite:<id>]`. */
  id: string;
  title: string;
  text: string;
  /** Absolute URL of the page that renders this content. */
  sourceUrl: string;
  kind: ChunkKind;
};

/** Gemini's documented rule of thumb for English: ~4 characters per token. */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * The corpus is ~15k tokens today. 20k leaves room for a few more blog posts,
 * and is still small next to a 1M-token context window — the ceiling exists to
 * keep cost and latency per question honest, not to fit the model. Exceeding it
 * fails `corpus.test.ts`; nothing here ever truncates. Raise it deliberately,
 * or move to retrieval.
 */
export const CORPUS_TOKEN_BUDGET = 20_000;

/* Same scheme as app/llms.txt/route.ts: one origin, template-literal paths. */
const BASE = siteConfig.url;

/* ----------------------------------------------------------------------------
   Formatting helpers
   -------------------------------------------------------------------------- */

/** Lowercase kebab-case, ASCII only — the alphabet citation ids are built from. */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const bullets = (items: readonly string[]) => items.map((item) => `- ${item}`).join("\n");

/** Joins non-empty blocks with a blank line between them. */
const blocks = (...parts: (string | false | null | undefined)[]) =>
  parts.filter((part): part is string => Boolean(part && part.trim())).join("\n\n");

/* ----------------------------------------------------------------------------
   Site & profile
   -------------------------------------------------------------------------- */

function siteChunks(): Chunk[] {
  // Excluded on purpose: `phone` (a chatbot reciting it to anyone who asks is
  // a spam vector — /contact lists it for humans), SEO restatements (`title`,
  // `description`, `locationShort`) and every URL-shaped field.
  const identity = blocks(
    `${siteConfig.fullName} (goes by ${siteConfig.name}) — ${siteConfig.role}.`,
    siteConfig.tagline,
    siteConfig.bio,
    [
      `Location: ${siteConfig.location} (${siteConfig.timezone})`,
      `Availability: ${siteConfig.availability}`,
      `Work arrangement: ${siteConfig.relocation}`,
      `Email: ${siteConfig.email} — ${siteConfig.responsePromise.toLowerCase()}`,
      `Current employer: ${siteConfig.employer.name} (${siteConfig.employer.location})`,
      `Education: ${siteConfig.education.name}, ${siteConfig.education.affiliation}`,
      `Résumé: ${siteConfig.resumeFileName}, linked from the header of every page`,
      `Profiles linked from the site: ${socialLinks.map((link) => link.name).join(", ")}`,
    ].join("\n"),
  );

  const pages = Array.from(new Set(footerLinks.map((link) => link.label)));

  return [
    {
      id: "site/identity",
      kind: "site",
      title: `${siteConfig.fullName} — ${siteConfig.role}`,
      text: identity,
      sourceUrl: `${BASE}/about`,
    },
    {
      id: "site/pages",
      kind: "site",
      title: "Pages on this site",
      text: `The site's pages: Home, ${pages.join(", ")}.`,
      sourceUrl: BASE,
    },
  ];
}

function profileChunks(): Chunk[] {
  const stats = proofStats.map((stat) => {
    const value =
      typeof stat.to === "number"
        ? `${stat.prefix ?? ""}${stat.to.toLocaleString("en-US")}${stat.suffix ?? ""}`
        : stat.value;
    return `${value} — ${stat.label}`;
  });

  return [
    {
      id: "profile/proof-stats",
      kind: "profile",
      title: "Headline numbers",
      text: bullets(stats),
      sourceUrl: BASE,
    },
    {
      id: "profile/key-achievements",
      kind: "profile",
      title: "Key achievements",
      text: bullets(keyAchievements.map((item) => `${item.lead} ${item.detail}`)),
      sourceUrl: `${BASE}/#experience`,
    },
    {
      id: "profile/work-process",
      kind: "profile",
      title: "How I work",
      text: workProcess
        .map((step) => `${step.step}. ${step.title} — ${step.description}`)
        .join("\n"),
      sourceUrl: `${BASE}/about#process`,
    },
    {
      id: "profile/about",
      kind: "profile",
      title: "About — the long-form story",
      text: blocks(about.intro, ...about.paragraphs, about.closing),
      sourceUrl: `${BASE}/about#story`,
    },
    ...experience.map(
      (role): Chunk => ({
        id: `experience/${role.id}`,
        kind: "experience",
        title: `${role.role} — ${role.company}`,
        text: blocks(
          `${role.role} at ${role.company}, ${role.location}. ${role.period}${role.current ? " (current role)" : ""}.`,
          role.description,
          `Achievements:\n${bullets(role.achievements)}`,
          `Technologies: ${role.technologies.join(", ")}`,
        ),
        sourceUrl: `${BASE}/about#experience`,
      }),
    ),
    ...education.map(
      (entry): Chunk => ({
        id: `education/${entry.id}`,
        kind: "education",
        title: entry.degree,
        text: `${entry.degree} — ${entry.institution} (${entry.affiliation}), ${entry.location}. ${entry.period}.`,
        sourceUrl: `${BASE}/about#experience`,
      }),
    ),
    ...skillGroups.map(
      (group): Chunk => ({
        id: `skills/${slugify(group.label)}`,
        kind: "skills",
        title: `Skills — ${group.label}`,
        text: `${group.label}: ${group.items.join(", ")}`,
        sourceUrl: `${BASE}/about#stack`,
      }),
    ),
  ];
}

/* ----------------------------------------------------------------------------
   Projects
   -------------------------------------------------------------------------- */

function projectChunks(): Chunk[] {
  const disclaimer: Chunk = {
    id: "project/disclaimer",
    kind: "project",
    title: "About these projects",
    text: workDisclaimer,
    sourceUrl: `${BASE}/work`,
  };

  // Excluded: `image` (an asset path) and `githubUrl`/`liveUrl` — the case
  // study page links the repository, and the prompt carries no URLs.
  return [
    disclaimer,
    ...projects.map(
      (p): Chunk => ({
        id: `project/${p.slug}`,
        kind: "project",
        title: p.title,
        text: blocks(
          `${p.title} — ${p.tagline}`,
          [
            `Platform: ${p.platform}`,
            `Year: ${p.year}`,
            `Role: ${p.role}`,
            `Timeline: ${p.timeline}`,
            `Categories: ${p.categories.join(", ")}`,
            p.featured && "Featured on the homepage",
            p.githubUrl && "Source code: public on GitHub, linked from the case study",
          ]
            .filter(Boolean)
            .join("\n"),
          `Summary: ${p.description}`,
          `Overview: ${p.overview}`,
          `Problem: ${p.problem}`,
          `Approach: ${p.approach}`,
          `Solution: ${p.solution}`,
          `Architecture: ${p.architecture.summary}`,
          `Architecture flow: ${p.architecture.nodes
            .map((node) => {
              const detail = [node.layer, node.sub, node.critical && "critical path"]
                .filter(Boolean)
                .join("; ");
              return detail ? `${node.label} (${detail})` : node.label;
            })
            .join(" → ")}`,
          `Challenges:\n${bullets(p.challenges)}`,
          p.performance.length > 0 &&
            `Before → after:\n${bullets(
              p.performance.map(
                (point) =>
                  `${point.label}: ${point.before} → ${point.after}${point.note ? ` (${point.note})` : ""}`,
              ),
            )}`,
          `Results:\n${bullets(p.results)}`,
          `Lessons:\n${bullets(p.lessons)}`,
          [
            `Purpose: ${p.card.purpose}`,
            `Challenge: ${p.card.challenge}`,
            `Decision: ${p.card.decision}`,
            `Result: ${p.card.result}`,
          ].join("\n"),
          `Stack:\n${bullets(p.stack.map((group) => `${group.label}: ${group.items.join(", ")}`))}`,
          `At a glance: ${p.metrics.map((metric) => `${metric.label} — ${metric.value}`).join("; ")}`,
          `Tags: ${p.tags.join(", ")}`,
        ),
        sourceUrl: `${BASE}/work/${p.slug}`,
      }),
    ),
  ];
}

/* ----------------------------------------------------------------------------
   FAQ, uses, homepage story
   -------------------------------------------------------------------------- */

function faqChunks(): Chunk[] {
  return faqs.map((faq) => ({
    id: `faq/${slugify(faq.question)}`,
    kind: "faq",
    title: faq.question,
    text: `Q: ${faq.question}\nA: ${faq.answer}`,
    sourceUrl: `${BASE}/#faq`,
  }));
}

function usesChunks(): Chunk[] {
  return [
    {
      id: "uses/intro",
      kind: "uses",
      title: "Uses — the daily toolkit",
      text: `${usesIntro.headline.lead} ${usesIntro.headline.accent}. ${usesIntro.byline}`,
      sourceUrl: `${BASE}/uses`,
    },
    {
      id: "uses/colophon",
      kind: "uses",
      title: "How this site is built",
      text: `${colophon.title}: ${colophon.note}`,
      sourceUrl: `${BASE}/uses`,
    },
    ...usesCategories.map(
      (category): Chunk => ({
        id: `uses/${category.key}`,
        kind: "uses",
        title: `Uses — ${category.title}`,
        text: blocks(
          `${category.title}: ${category.blurb}`,
          bullets(category.items.map((item) => `${item.name} — ${item.note}`)),
        ),
        sourceUrl: `${BASE}/uses#uses-${category.key}`,
      }),
    ),
  ];
}

function storyChunks(): Chunk[] {
  const chapter = (c: { number: string; title: string }) => `Chapter ${c.number} — ${c.title}`;

  // Excluded: UI furniture (CTA labels and hrefs, the scroll cue, edition
  // stamp, section labels) and asset metadata (portrait, reel image files).
  return [
    {
      id: "story/prologue",
      kind: "story",
      title: "Homepage introduction",
      text: blocks(
        `${prologue.headline.intro} ${prologue.headline.name}, ${prologue.headline.lines.join(" ")}.`,
        [
          `Focus: ${prologue.focus}`,
          `Status: ${prologue.meta.status} · ${prologue.meta.location} · ${prologue.meta.coords}`,
          `Stack: ${prologue.stack.join(", ")}`,
          `Availability: ${prologue.availability}`,
        ].join("\n"),
        `${prologue.value} ${prologue.support}`,
        `Featured projects: ${prologue.reel.items.map((item) => item.label).join("; ")}`,
      ),
      sourceUrl: `${BASE}/#prologue`,
    },
    {
      id: "story/chapter-01",
      kind: "story",
      title: chapter(chapterProduction),
      text: blocks(chapterProduction.intro, `“${chapterProduction.quote}”`),
      sourceUrl: `${BASE}/#experience`,
    },
    {
      id: "story/chapter-02",
      kind: "story",
      title: chapter(chapterInterfaces),
      text: blocks(
        chapterInterfaces.intro,
        ...chapterInterfaces.stages.map(
          (stage) => `${stage.step}: ${stage.title} ${stage.body} ${stage.detail}`,
        ),
      ),
      sourceUrl: `${BASE}/#chapter-02`,
    },
    {
      id: "story/chapter-03",
      kind: "story",
      title: chapter(chapterWork),
      text: chapterWork.intro,
      sourceUrl: `${BASE}/#work`,
    },
    {
      id: "story/chapter-04",
      kind: "story",
      title: chapter(chapterSystems),
      text: blocks(
        `${chapterSystems.paragraph} ${chapterSystems.closing}`,
        `Layers, client to AI:\n${bullets(
          chapterSystems.layers.map(
            (layer) => `${layer.label} — ${layer.role} ${layer.tech.join(", ")}`,
          ),
        )}`,
        [
          `Languages: ${chapterSystems.languages.join(", ")}`,
          `Quality: ${chapterSystems.quality.join(", ")}`,
          `Practices: ${chapterSystems.practices.join(", ")}`,
        ].join("\n"),
      ),
      sourceUrl: `${BASE}/#stack`,
    },
    {
      id: "story/chapter-05",
      kind: "story",
      title: chapter(chapterPrinciples),
      text: blocks(
        chapterPrinciples.intro,
        bullets(chapterPrinciples.items.map((item) => `${item.statement} ${item.gloss}`)),
      ),
      sourceUrl: `${BASE}/#chapter-05`,
    },
    {
      id: "story/epilogue",
      kind: "story",
      title: "Contact",
      text: `${epilogue.statement} ${epilogue.invitation}`,
      sourceUrl: `${BASE}/#contact`,
    },
  ];
}

/* ----------------------------------------------------------------------------
   Blog — one chunk per `##` section
   -------------------------------------------------------------------------- */

export interface MarkdownSection {
  /** `null` for the text before the first `##` heading. */
  heading: string | null;
  body: string;
}

const FENCE = /^\s*(```|~~~)/;
const H1 = /^#\s+(.+?)\s*#*\s*$/;
const H2 = /^##\s+(.+?)\s*#*\s*$/;

/**
 * Split a post body on its `##` headings. Fence-aware: a line starting with
 * `##` inside a code block is code, not a heading. A leading `# H1` that
 * repeats the post title is dropped — the title already heads every chunk.
 */
export function splitMarkdownSections(markdown: string, title: string): MarkdownSection[] {
  const sections: MarkdownSection[] = [];
  let current: { heading: string | null; lines: string[] } = { heading: null, lines: [] };
  let inFence = false;

  for (const line of markdown.split(/\r?\n/)) {
    if (FENCE.test(line)) inFence = !inFence;

    if (!inFence) {
      const h2 = H2.exec(line);
      if (h2) {
        sections.push({ heading: current.heading, body: current.lines.join("\n").trim() });
        current = { heading: h2[1], lines: [] };
        continue;
      }
      const h1 = H1.exec(line);
      if (h1 && h1[1] === title) continue;
    }

    current.lines.push(line);
  }
  sections.push({ heading: current.heading, body: current.lines.join("\n").trim() });

  // A heading with nothing under it, or an empty preamble, carries no answer.
  return sections.filter((section) => section.body.length > 0);
}

function blogChunks(): Chunk[] {
  return getAllPosts().flatMap((post) => {
    const { content } = getPostBySlug(post.slug);
    const sourceUrl = `${BASE}/blog/${post.slug}`;
    const sections = splitMarkdownSections(content, post.title);
    const preamble = sections.find((section) => section.heading === null)?.body;

    const intro: Chunk = {
      id: `blog/${post.slug}/intro`,
      kind: "blog",
      title: post.title,
      text: blocks(post.title, post.excerpt, preamble),
      sourceUrl,
    };

    return [
      intro,
      ...sections
        .filter((section): section is MarkdownSection & { heading: string } => section.heading !== null)
        .map(
          (section): Chunk => ({
            id: `blog/${post.slug}/${slugify(section.heading)}`,
            kind: "blog",
            title: `${post.title} — ${section.heading}`,
            text: blocks(post.title, `## ${section.heading}`, section.body),
            sourceUrl,
          }),
        ),
    ];
  });
}

/* ----------------------------------------------------------------------------
   Public API
   -------------------------------------------------------------------------- */

/** Code-point order, not `localeCompare` — that one varies with the ICU locale. */
const byId = (a: Chunk, b: Chunk) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

/**
 * Every chunk the assistant may cite, sorted by id. Throws on a duplicate id
 * rather than letting one chunk silently shadow another — two blog headings
 * that slugify alike would otherwise make citations point at the wrong text.
 */
export function buildCorpus(): Chunk[] {
  const chunks = [
    ...siteChunks(),
    ...profileChunks(),
    ...projectChunks(),
    ...faqChunks(),
    ...usesChunks(),
    ...storyChunks(),
    ...blogChunks(),
  ];

  const seen = new Set<string>();
  for (const chunk of chunks) {
    if (seen.has(chunk.id)) throw new Error(`[corpus] duplicate chunk id "${chunk.id}"`);
    seen.add(chunk.id);
  }

  return chunks.sort(byId);
}

const attr = (value: string) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

/**
 * The corpus as it appears in the system prompt. Ids and titles only — no
 * `sourceUrl`, by design (see rule 2 at the top of this file).
 */
export function renderCorpusForPrompt(chunks: Chunk[] = buildCorpus()): string {
  return chunks
    .map(
      (chunk) =>
        `<chunk id="${chunk.id}" kind="${chunk.kind}" title="${attr(chunk.title)}">\n` +
        // Content can't close its own wrapper and pose as instructions.
        `${chunk.text.replace(/<\/chunk/gi, "<\\/chunk")}\n</chunk>`,
    )
    .join("\n\n");
}
