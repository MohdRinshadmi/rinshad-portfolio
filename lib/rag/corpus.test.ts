import { describe, expect, it } from "vitest";

import * as siteModule from "@/lib/config/site";
import * as profileModule from "@/lib/content/profile";
import * as projectsModule from "@/lib/content/projects";
import * as faqModule from "@/lib/content/faq";
import * as metricsModule from "@/lib/content/metrics";
import * as usesModule from "@/lib/content/uses";
import * as storyModule from "@/lib/content/story";
import { getAllPosts, getPostBySlug } from "@/lib/server/blog";
import { CITATION_ID } from "@/lib/chat/protocol";
import {
  buildCorpus,
  CORPUS_TOKEN_BUDGET,
  estimateTokens,
  renderCorpusForPrompt,
  slugify,
  splitMarkdownSections,
  type Chunk,
} from "./corpus";

/* ============================================================================
   CORPUS INTEGRITY

   The chat assistant can only answer from what the corpus carries, so the
   failure that matters is a SILENT one: a new content export nobody wired in,
   a blog directory missing at runtime, a heading that stopped being a chunk.
   The assistant would still answer — just from less than the site says, with
   no error anywhere. These assertions make that loud.
   ========================================================================== */

const { siteConfig } = siteModule;
const { projects, workDisclaimer } = projectsModule;
const { faqs } = faqModule;
const { about, education, experience, keyAchievements, proofStats, skillGroups, workProcess } =
  profileModule;
const { usesCategories, usesIntro, colophon } = usesModule;
const { chapterInterfaces, chapterPrinciples, chapterSystems, chapterWork, epilogue, prologue } =
  storyModule;

const corpus = buildCorpus();
const chunkIds = corpus.map((chunk) => chunk.id);

/** Ids of every chunk whose text contains `needle`. */
const chunksContaining = (needle: string) =>
  corpus.filter((chunk) => chunk.text.includes(needle)).map((chunk) => chunk.id);

/** Asserts `needle` lands in exactly one chunk — and, if given, the right one. */
function expectExactlyOnce(needle: string, id?: string) {
  const found = chunksContaining(needle);
  expect(found, `"${needle.slice(0, 60)}…" should appear in exactly one chunk`).toHaveLength(1);
  if (id) expect(found[0]).toBe(id);
}

describe("export coverage", () => {
  /* Every runtime export of every content module is either rendered into the
     corpus or explicitly ruled out here, with the reason. Adding an export to
     lib/content fails this test until someone decides which it is. */
  const registry: {
    name: string;
    module: Record<string, unknown>;
    rendered: string[];
    notContent: Record<string, string>;
  }[] = [
    {
      name: "config/site",
      module: siteModule,
      rendered: ["siteConfig", "footerLinks", "socialLinks"],
      notContent: {
        navLinks: "a subset of footerLinks, which is rendered",
        resolveSiteUrl: "function",
      },
    },
    {
      name: "content/profile",
      module: profileModule,
      rendered: [
        "proofStats",
        "keyAchievements",
        "experience",
        "education",
        "skillGroups",
        "workProcess",
        "about",
      ],
      notContent: { HIGHLIGHT_INDICES: "indices into experience achievements, already rendered" },
    },
    {
      name: "content/projects",
      module: projectsModule,
      rendered: ["projects", "workDisclaimer"],
      notContent: { getProject: "function" },
    },
    { name: "content/faq", module: faqModule, rendered: ["faqs"], notContent: {} },
    {
      name: "content/metrics",
      module: metricsModule,
      rendered: [],
      notContent: {
        METRIC_PATTERN: "a highlighting regex — the numbers live in profile.ts",
        splitMetrics: "function",
      },
    },
    {
      name: "content/uses",
      module: usesModule,
      rendered: ["usesIntro", "usesCategories", "colophon"],
      notContent: {},
    },
    {
      name: "content/story",
      module: storyModule,
      rendered: [
        "prologue",
        "chapterProduction",
        "chapterInterfaces",
        "chapterWork",
        "chapterSystems",
        "chapterPrinciples",
        "epilogue",
      ],
      notContent: {},
    },
  ];

  for (const entry of registry) {
    it(`accounts for every export of ${entry.name}`, () => {
      const declared = [...entry.rendered, ...Object.keys(entry.notContent)].sort();
      expect(Object.keys(entry.module).sort()).toEqual(declared);
    });
  }

  it("accounts for every siteConfig field", () => {
    const rendered = [
      "name",
      "fullName",
      "role",
      "tagline",
      "bio",
      "location",
      "timezone",
      "email",
      "availability",
      "relocation",
      "responsePromise",
      "resumeFileName",
      "employer",
      "education",
    ];
    const excluded = {
      phone: "on /contact for humans; not handed out by a chatbot",
      title: "SEO restatement of role",
      description: "SEO restatement of bio",
      locationShort: "short form of location",
      resumeUrl: "a URL — the prompt carries none",
      url: "a URL — the prompt carries none",
      social: "URLs — socialLinks names are rendered instead",
      portrait: "asset metadata",
      geo: "coordinates for schema markup",
    };
    expect(Object.keys(siteConfig).sort()).toEqual([...rendered, ...Object.keys(excluded)].sort());
    for (const field of ["phone"] as const) {
      expect(renderCorpusForPrompt(), field).not.toContain(siteConfig[field]);
    }
  });
});

describe("content completeness", () => {
  it("renders the identity chunk from site config", () => {
    expectExactlyOnce(siteConfig.bio, "site/identity");
    expect(corpus.find((c) => c.id === "site/identity")?.text).toContain(siteConfig.email);
  });

  it("gives every project exactly one chunk", () => {
    for (const p of projects) {
      expectExactlyOnce(p.overview, `project/${p.slug}`);
      expectExactlyOnce(p.architecture.summary, `project/${p.slug}`);
      for (const lesson of p.lessons) expectExactlyOnce(lesson, `project/${p.slug}`);
    }
    expectExactlyOnce(workDisclaimer, "project/disclaimer");
  });

  it("gives every FAQ exactly one chunk", () => {
    for (const faq of faqs) expectExactlyOnce(faq.answer, `faq/${slugify(faq.question)}`);
  });

  it("carries every role, achievement, and education entry once", () => {
    for (const role of experience) {
      expectExactlyOnce(role.description, `experience/${role.id}`);
      for (const line of role.achievements) expectExactlyOnce(line, `experience/${role.id}`);
    }
    for (const entry of education) expectExactlyOnce(entry.degree, `education/${entry.id}`);
    // Lead + detail, not the detail alone: the FAQ repeats the detail's wording
    // verbatim ("He cut average API response time 35% across 40+ …"), which is
    // the content's duplication, not the corpus's.
    for (const item of keyAchievements) {
      expectExactlyOnce(`${item.lead} ${item.detail}`, "profile/key-achievements");
    }
    for (const stat of proofStats) expectExactlyOnce(`— ${stat.label}`, "profile/proof-stats");
  });

  it("carries every skill group, process step, and about paragraph once", () => {
    for (const group of skillGroups) {
      expectExactlyOnce(`${group.label}: ${group.items.join(", ")}`, `skills/${slugify(group.label)}`);
    }
    for (const step of workProcess) expectExactlyOnce(step.description, "profile/work-process");
    for (const paragraph of [about.intro, ...about.paragraphs, about.closing]) {
      expectExactlyOnce(paragraph, "profile/about");
    }
  });

  it("carries every uses category and item once", () => {
    expectExactlyOnce(usesIntro.byline, "uses/intro");
    expectExactlyOnce(colophon.note, "uses/colophon");
    for (const category of usesCategories) {
      for (const item of category.items) {
        expectExactlyOnce(`${item.name} — ${item.note}`, `uses/${category.key}`);
      }
    }
  });

  it("carries the homepage story once", () => {
    expectExactlyOnce(prologue.support, "story/prologue");
    expectExactlyOnce(chapterWork.intro, "story/chapter-03");
    expectExactlyOnce(chapterSystems.paragraph, "story/chapter-04");
    expectExactlyOnce(epilogue.invitation, "story/epilogue");
    for (const stage of chapterInterfaces.stages) expectExactlyOnce(stage.body, "story/chapter-02");
    for (const item of chapterPrinciples.items) expectExactlyOnce(item.gloss, "story/chapter-05");
  });

  it("splits every blog post into its intro and one chunk per ## section", () => {
    const posts = getAllPosts();
    expect(posts.length, "no blog posts found — is content/blog readable?").toBeGreaterThan(0);

    for (const post of posts) {
      const { content } = getPostBySlug(post.slug);
      const headings = splitMarkdownSections(content, post.title)
        .map((section) => section.heading)
        .filter((heading): heading is string => heading !== null);
      expect(headings.length, `${post.slug} has no ## sections`).toBeGreaterThan(0);

      const expected = [
        `blog/${post.slug}/intro`,
        ...headings.map((heading) => `blog/${post.slug}/${slugify(heading)}`),
      ].sort();
      const actual = chunkIds.filter((id) => id.startsWith(`blog/${post.slug}/`));
      expect(actual).toEqual(expected);
    }
  });

  it("keeps the parent post title at the head of every blog chunk", () => {
    const titles = new Map(getAllPosts().map((post) => [post.slug, post.title]));
    for (const chunk of corpus.filter((c) => c.kind === "blog")) {
      const slug = chunk.id.split("/")[1];
      expect(chunk.text.startsWith(titles.get(slug)!), chunk.id).toBe(true);
    }
  });

  it("produces exactly the expected number of chunks per source", () => {
    const count = (kind: Chunk["kind"]) => corpus.filter((c) => c.kind === kind).length;
    expect(count("site")).toBe(2);
    expect(count("profile")).toBe(4);
    expect(count("experience")).toBe(experience.length);
    expect(count("education")).toBe(education.length);
    expect(count("skills")).toBe(skillGroups.length);
    expect(count("project")).toBe(projects.length + 1);
    expect(count("faq")).toBe(faqs.length);
    expect(count("uses")).toBe(usesCategories.length + 2);
    expect(count("story")).toBe(7);
  });

  it("leaves no chunk empty", () => {
    for (const chunk of corpus) {
      expect(chunk.title.trim(), chunk.id).not.toBe("");
      expect(chunk.text.trim().length, chunk.id).toBeGreaterThan(20);
    }
  });
});

describe("determinism", () => {
  it("renders byte-identical output on every call", () => {
    const a = renderCorpusForPrompt();
    const b = renderCorpusForPrompt();
    expect(a).toBe(b);
  });

  it("sorts chunks by id", () => {
    const sorted = [...chunkIds].sort((x, y) => (x < y ? -1 : x > y ? 1 : 0));
    expect(chunkIds).toEqual(sorted);
  });
});

describe("ids and source urls", () => {
  it("gives every chunk a unique id the citation syntax can carry", () => {
    expect(new Set(chunkIds).size).toBe(chunkIds.length);
    for (const id of chunkIds) expect(id, id).toMatch(CITATION_ID);
  });

  it("builds every sourceUrl the way llms.txt does — siteConfig.url + a real path", () => {
    const paths = new Set([
      "/",
      "/about",
      "/work",
      "/uses",
      ...projects.map((p) => `/work/${p.slug}`),
      ...getAllPosts().map((post) => `/blog/${post.slug}`),
    ]);

    for (const chunk of corpus) {
      expect(chunk.sourceUrl.startsWith(siteConfig.url), chunk.id).toBe(true);
      const url = new URL(chunk.sourceUrl);
      expect(url.origin, chunk.id).toBe(siteConfig.url);
      expect(paths.has(url.pathname), `${chunk.id} → ${url.pathname}`).toBe(true);
      expect(url.search, chunk.id).toBe("");
    }
  });

  it("puts no URL into the prompt, so the model has none to repeat or invent", () => {
    expect(renderCorpusForPrompt()).not.toMatch(/https?:\/\//);
  });
});

describe("token budget", () => {
  it(`fits the documented budget of ${CORPUS_TOKEN_BUDGET.toLocaleString("en-US")} tokens`, () => {
    const tokens = estimateTokens(renderCorpusForPrompt());
    expect(
      tokens,
      `corpus is ~${tokens.toLocaleString("en-US")} tokens — over budget. Trim content, ` +
        `raise CORPUS_TOKEN_BUDGET deliberately, or move to retrieval. Never truncate.`,
    ).toBeLessThanOrEqual(CORPUS_TOKEN_BUDGET);
  });
});

describe("splitMarkdownSections", () => {
  const md = [
    "# Post Title",
    "",
    "Preamble line.",
    "",
    "## First",
    "Body one.",
    "```md",
    "## not a heading — inside a fence",
    "```",
    "## Empty",
    "",
    "## Second ##",
    "Body two.",
  ].join("\n");

  const sections = splitMarkdownSections(md, "Post Title");

  it("splits on ## headings outside code fences only", () => {
    expect(sections.map((s) => s.heading)).toEqual([null, "First", "Second"]);
    expect(sections[1].body).toContain("## not a heading — inside a fence");
  });

  it("drops the H1 that repeats the title, and sections with no body", () => {
    expect(sections[0].body).toBe("Preamble line.");
    expect(sections.some((s) => s.heading === "Empty")).toBe(false);
  });
});

describe("slugify", () => {
  it("produces citation-safe ids", () => {
    expect(slugify("Cloud & DevOps")).toBe("cloud-and-devops");
    expect(slugify("What I'd keep")).toBe("what-i-d-keep");
    expect(slugify("1. Design the partial states first")).toBe("1-design-the-partial-states-first");
    expect(slugify("Résumé — AI / Data")).toBe("resume-ai-data");
  });
});
