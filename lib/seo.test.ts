import { describe, expect, it } from "vitest";

import {
  ID,
  SITE_KEYWORDS,
  breadcrumb,
  buildMetadata,
  coreGraph,
  faqPage,
  graph,
  jsonLdScript,
  projectNode,
  webPage,
} from "./seo";
import { siteConfig } from "./config/site";
import { projects } from "./content/projects";
import { faqs } from "./content/faq";

/* ============================================================================
   STRUCTURED DATA

   Every page emits a @graph that references the site-wide Person / WebSite /
   Organization nodes by @id rather than redefining them. That only works if the
   @ids match exactly — a mismatch produces a silently broken knowledge graph
   that still validates as JSON. These tests pin the linkage.
   ========================================================================== */

type Node = Record<string, unknown>;
const nodesOf = (g: { "@graph": object[] }) => g["@graph"] as Node[];
const byType = (g: { "@graph": object[] }, type: string) =>
  nodesOf(g).find((n) => {
    const t = n["@type"];
    return Array.isArray(t) ? t.includes(type) : t === type;
  });

describe("graph()", () => {
  it("wraps nodes in a schema.org @graph", () => {
    const g = graph({ "@type": "Thing" });
    expect(g["@context"]).toBe("https://schema.org");
    expect(g["@graph"]).toHaveLength(1);
  });

  it("preserves node order", () => {
    const g = graph({ "@type": "A" }, { "@type": "B" });
    expect(nodesOf(g).map((n) => n["@type"])).toEqual(["A", "B"]);
  });
});

describe("coreGraph()", () => {
  const core = coreGraph();

  it("defines Person, WebSite and Organization", () => {
    expect(byType(core, "Person")).toBeDefined();
    expect(byType(core, "WebSite")).toBeDefined();
    expect(byType(core, "Organization")).toBeDefined();
  });

  it("anchors each entity at the @id the rest of the site references", () => {
    expect(byType(core, "Person")!["@id"]).toBe(ID.person);
    expect(byType(core, "WebSite")!["@id"]).toBe(ID.website);
    expect(byType(core, "Organization")!["@id"]).toBe(ID.organization);
  });

  it("builds every @id from the configured site url", () => {
    for (const id of Object.values(ID)) {
      expect(id.startsWith(siteConfig.url)).toBe(true);
      expect(id).toContain("#");
    }
  });

  it("names the Person and links their public profiles", () => {
    const person = byType(core, "Person")!;
    expect(person.name).toBe(siteConfig.fullName);
    expect(person.jobTitle).toBe(siteConfig.role);
    expect(person.sameAs).toEqual([siteConfig.social.github, siteConfig.social.linkedin]);
  });
});

describe("webPage()", () => {
  it("anchors the page and links it to the core entities", () => {
    const page = webPage({ path: "/about", title: "About", description: "d" }) as Node;
    expect(page["@id"]).toBe(`${siteConfig.url}/about#webpage`);
    expect(page.url).toBe(`${siteConfig.url}/about`);
    expect(page.isPartOf).toEqual({ "@id": ID.website });
    expect(page.about).toEqual({ "@id": ID.person });
  });

  it("collapses the root path rather than emitting a trailing slash", () => {
    const page = webPage({ path: "/", title: "Home", description: "d" }) as Node;
    expect(page.url).toBe(siteConfig.url);
    expect(page["@id"]).toBe(`${siteConfig.url}#webpage`);
  });

  it("honours the page type", () => {
    const page = webPage({
      path: "/",
      title: "Home",
      description: "d",
      type: "ProfilePage",
    }) as Node;
    expect(page["@type"]).toBe("ProfilePage");
  });

  it("declares a breadcrumb by default and omits it when told to", () => {
    const withCrumb = webPage({ path: "/work", title: "W", description: "d" }) as Node;
    expect(withCrumb.breadcrumb).toEqual({ "@id": `${siteConfig.url}/work#breadcrumb` });

    const without = webPage({
      path: "/",
      title: "H",
      description: "d",
      hasBreadcrumb: false,
    }) as Node;
    expect(without.breadcrumb).toBeUndefined();
  });

  it("absolutises a root-relative primary image", () => {
    const page = webPage({
      path: "/",
      title: "H",
      description: "d",
      primaryImage: "/images/portrait.jpg",
    }) as Node;
    expect(page.primaryImageOfPage).toEqual({
      "@type": "ImageObject",
      url: `${siteConfig.url}/images/portrait.jpg`,
    });
  });
});

describe("breadcrumb()", () => {
  const crumb = breadcrumb(
    [
      { name: "Home", path: "/" },
      { name: "Work", path: "/work" },
    ],
    "/work",
  ) as Node;

  it("anchors at the page it belongs to, matching webPage()'s reference", () => {
    expect(crumb["@id"]).toBe(`${siteConfig.url}/work#breadcrumb`);
    const page = webPage({ path: "/work", title: "W", description: "d" }) as Node;
    expect(page.breadcrumb).toEqual({ "@id": crumb["@id"] });
  });

  it("numbers positions from 1 and absolutises each item", () => {
    const items = crumb.itemListElement as Node[];
    expect(items.map((i) => i.position)).toEqual([1, 2]);
    expect(items[0].item).toBe(siteConfig.url);
    expect(items[1].item).toBe(`${siteConfig.url}/work`);
  });
});

describe("faqPage()", () => {
  const page = faqPage(faqs, "/") as Node;

  it("emits one Question per visible FAQ, in order", () => {
    const entities = page.mainEntity as Node[];
    expect(entities).toHaveLength(faqs.length);
    expect(entities.map((q) => q.name)).toEqual(faqs.map((f) => f.question));
  });

  it("gives every Question an accepted answer", () => {
    for (const q of page.mainEntity as Node[]) {
      const answer = q.acceptedAnswer as Node;
      expect(answer["@type"]).toBe("Answer");
      expect(String(answer.text).length).toBeGreaterThan(0);
    }
  });
});

describe("projectNode()", () => {
  it("anchors each case study and attributes it to the Person", () => {
    for (const project of projects) {
      const node = projectNode(project) as Node;
      const url = `${siteConfig.url}/work/${project.slug}`;
      expect(node["@id"]).toBe(`${url}#project`);
      expect(node.url).toBe(url);
      expect(node.author).toEqual({ "@id": ID.person });
      expect(node.isPartOf).toEqual({ "@id": ID.website });
    }
  });

  it("absolutises the project image", () => {
    for (const project of projects) {
      if (!project.image) continue;
      expect(projectNode(project).image).toBe(`${siteConfig.url}${project.image}`);
    }
  });
});

describe("buildMetadata()", () => {
  it("sets a canonical that matches the page's own url", () => {
    const meta = buildMetadata({ title: "Work", path: "/work" });
    expect(meta.alternates?.canonical).toBe(`${siteConfig.url}/work`);
    expect(meta.openGraph?.url).toBe(`${siteConfig.url}/work`);
  });

  it("collapses the root path so the canonical has no trailing slash", () => {
    expect(buildMetadata({ path: "/" }).alternates?.canonical).toBe(siteConfig.url);
  });

  it("passes a bare title through for the layout's template to brand", () => {
    // Appending the brand here too produced "About | Rinshad | Rinshad".
    expect(buildMetadata({ title: "About" }).title).toBe("About");
  });

  it("opts a title-less route out of the template", () => {
    expect(buildMetadata({}).title).toEqual({
      absolute: `${siteConfig.fullName} — ${siteConfig.role}`,
    });
  });

  it("defaults the description to the site bio", () => {
    expect(buildMetadata({ title: "X" }).description).toBe(siteConfig.bio);
  });

  it("carries article fields only for articles", () => {
    const article = buildMetadata({
      title: "Post",
      path: "/blog/x",
      type: "article",
      publishedTime: "2026-01-01",
      tags: ["next"],
    });
    expect(article.openGraph).toMatchObject({
      type: "article",
      publishedTime: "2026-01-01",
      tags: ["next"],
    });

    const page = buildMetadata({ title: "Work", path: "/work" });
    expect(page.openGraph).not.toHaveProperty("publishedTime");
  });

  it("always sets a large-image twitter card", () => {
    expect(buildMetadata({ title: "X" }).twitter).toMatchObject({
      card: "summary_large_image",
    });
  });
});

describe("jsonLdScript()", () => {
  it("escapes '<' so a payload can't close the script tag", () => {
    const out = jsonLdScript({ name: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("</script>");
  });

  it("round-trips to the same object", () => {
    const data = { "@type": "Thing", name: "x" };
    expect(JSON.parse(jsonLdScript(data).replaceAll("\\u003c", "<"))).toEqual(data);
  });
});

describe("keywords", () => {
  it("has no duplicates", () => {
    expect(new Set(SITE_KEYWORDS).size).toBe(SITE_KEYWORDS.length);
  });

  it("includes the full name", () => {
    expect(SITE_KEYWORDS).toContain(siteConfig.fullName);
  });
});
