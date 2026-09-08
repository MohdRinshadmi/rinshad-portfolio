import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { projects, getProject, workDisclaimer } from "./projects";
import { experience, education, proofStats, skillGroups, workProcess, about } from "./profile";
import { chapterWork, chapterBuilder, chapterSystems, chapterPrinciples, prologue } from "./story";
import { faqs } from "./faq";
import { siteConfig, navLinks, footerLinks } from "../config/site";

/* ============================================================================
   CONTENT INTEGRITY

   The site is entirely data-driven, and the same résumé claims are duplicated
   across profile.ts, story.ts, faq.ts and site.ts. Drift between those files is
   the failure mode this codebase actually has — a slug renamed in projects.ts
   silently drops a homepage feature, a public/ image renamed 404s a card. These
   assertions are the guard rail for editing content.
   ========================================================================== */

const PUBLIC_DIR = join(process.cwd(), "public");
const localAsset = (p: string) => join(PUBLIC_DIR, p.replace(/^\//, ""));

/** Intrinsic dimensions straight from the file: the PNG IHDR chunk, or an
    SVG's viewBox. Avoids pulling an image library into the test run. */
function imageSize(path: string): { width: number; height: number } | null {
  const buf = readFileSync(path);
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  const viewBox = /viewBox="[\d.]+ [\d.]+ ([\d.]+) ([\d.]+)"/.exec(buf.toString("utf8", 0, 2000));
  if (viewBox) return { width: Number(viewBox[1]), height: Number(viewBox[2]) };
  return null;
}

describe("projects", () => {
  it("has at least one project", () => {
    expect(projects.length).toBeGreaterThan(0);
  });

  it("has unique, url-safe slugs", () => {
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug, `${slug} should be lowercase kebab-case`).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it("fills every field the case-study page renders", () => {
    for (const p of projects) {
      const where = `project "${p.slug}"`;
      expect(p.title, where).toBeTruthy();
      expect(p.tagline, where).toBeTruthy();
      expect(p.description, where).toBeTruthy();
      expect(p.overview, where).toBeTruthy();
      expect(p.problem, where).toBeTruthy();
      expect(p.approach, where).toBeTruthy();
      expect(p.solution, where).toBeTruthy();
      expect(p.architecture.summary, where).toBeTruthy();
      expect(p.architecture.nodes.length, where).toBeGreaterThan(1);
      expect(p.challenges.length, where).toBeGreaterThan(0);
      expect(p.results.length, where).toBeGreaterThan(0);
      expect(p.lessons.length, where).toBeGreaterThan(0);
      expect(p.tags.length, where).toBeGreaterThan(0);
      expect(p.stack.length, where).toBeGreaterThan(0);
      expect(p.metrics.length, where).toBeGreaterThan(0);
      expect(p.categories.length, where).toBeGreaterThan(0);
    }
  });

  it("gives every architecture diagram unique node ids", () => {
    for (const p of projects) {
      const ids = p.architecture.nodes.map((n) => n.id);
      expect(new Set(ids).size, `project "${p.slug}" has duplicate node ids`).toBe(ids.length);
    }
  });

  it("marks a critical path on every architecture diagram", () => {
    // The canvas strokes a terracotta "current" along `critical` nodes; a
    // diagram with none renders inert.
    for (const p of projects) {
      expect(
        p.architecture.nodes.some((n) => n.critical),
        `project "${p.slug}" has no critical-path node`,
      ).toBe(true);
    }
  });

  it("gives every project a reachable source link", () => {
    for (const p of projects) {
      expect(p.githubUrl, `project "${p.slug}" has no githubUrl`).toBeTruthy();
      expect(p.githubUrl).toMatch(/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/);
    }
  });

  it("points every project image at a file that exists in public/", () => {
    for (const p of projects) {
      if (!p.image) continue;
      expect(p.image.startsWith("/"), `project "${p.slug}" image should be a root path`).toBe(true);
      expect(existsSync(localAsset(p.image)), `missing asset: ${p.image}`).toBe(true);
    }
  });

  it("ships every project shot pre-cropped to the DeviceFrame's 4:3", () => {
    // ProjectCard / CaseStudyHero / ProjectArchitectureCanvas render each shot
    // in a 16:12 frame with object-cover, and their `sizes` hints request
    // exactly the displayed width. That is only correct while the sources are
    // themselves 4:3 — a wider one gets silently cropped AND renders soft.
    for (const p of projects) {
      if (!p.image) continue;
      const size = imageSize(localAsset(p.image));
      expect(size, `could not read dimensions of ${p.image}`).not.toBeNull();
      const ratio = size!.width / size!.height;
      expect(
        Math.abs(ratio - 4 / 3),
        `${p.image} is ${ratio.toFixed(3)}:1 — crop it to 4:3 before adding it, ` +
          `or the frame will cut it and the sizes hints will under-request`,
      ).toBeLessThan(0.005);
    }
  });

  it("keeps the honesty disclaimer that makes the claims credible", () => {
    expect(workDisclaimer).toMatch(/no commercial users/i);
  });

  describe("getProject", () => {
    it("resolves every real slug", () => {
      for (const p of projects) {
        expect(getProject(p.slug)?.slug).toBe(p.slug);
      }
    });

    it("returns undefined for an unknown slug", () => {
      expect(getProject("does-not-exist")).toBeUndefined();
    });
  });
});

describe("homepage story ↔ projects coupling", () => {
  const featured = projects.filter((p) => p.featured);

  it("features at least one project on the homepage", () => {
    expect(featured.length).toBeGreaterThan(0);
  });

  it("has editorial framing for every featured project", () => {
    // WorkStories renders `chapterWork.features[slug]`; a missing key silently
    // falls back to the generic tagline and loses the chapter's voice.
    for (const p of featured) {
      expect(
        chapterWork.features[p.slug],
        `chapterWork.features is missing "${p.slug}"`,
      ).toBeDefined();
    }
  });

  it("has no orphaned framing for a project that no longer exists", () => {
    const slugs = new Set(projects.map((p) => p.slug));
    for (const slug of Object.keys(chapterWork.features)) {
      expect(slugs.has(slug), `chapterWork.features has stale key "${slug}"`).toBe(true);
    }
  });

  it("fills every framing field the card renders", () => {
    for (const [slug, f] of Object.entries(chapterWork.features)) {
      expect(f.kicker, slug).toBeTruthy();
      expect(f.hook, slug).toBeTruthy();
      expect(f.difficulty, slug).toBeTruthy();
      expect(f.outcome, slug).toBeTruthy();
    }
  });

  it("numbers the chapters consecutively from 01", () => {
    // The Prologue's scroll cue promises "Chapter 01" next. A parked chapter
    // used to break this into 01 → 02.
    const numbers = [chapterBuilder, { number: "02" }, chapterSystems, chapterWork, chapterPrinciples]
      .map((c) => c.number);
    expect(numbers).toEqual(["01", "02", "03", "04", "05"]);
  });

  it("points the prologue reel at files that exist", () => {
    for (const item of prologue.reel.items) {
      expect(existsSync(localAsset(item.src)), `missing reel asset: ${item.src}`).toBe(true);
    }
  });

  it("declares reel dimensions that match the files on disk", () => {
    // next/image reserves the box from these numbers. Swapping a screenshot
    // without updating them is a silent aspect-ratio/CLS bug.
    for (const item of prologue.reel.items) {
      const actual = imageSize(localAsset(item.src));
      expect(actual, `could not read dimensions of ${item.src}`).not.toBeNull();
      expect({ src: item.src, ...actual }).toEqual({
        src: item.src,
        width: item.width,
        height: item.height,
      });
    }
  });

  it("gives the prologue portrait real alt text", () => {
    expect(prologue.portrait.alt.length).toBeGreaterThan(10);
    expect(existsSync(localAsset(prologue.portrait.src))).toBe(true);
  });
});

describe("profile", () => {
  it("has an experience entry with achievements", () => {
    expect(experience.length).toBeGreaterThan(0);
    for (const role of experience) {
      expect(role.role, role.id).toBeTruthy();
      expect(role.company, role.id).toBeTruthy();
      expect(role.period, role.id).toBeTruthy();
      expect(role.achievements.length, role.id).toBeGreaterThan(0);
      expect(role.technologies.length, role.id).toBeGreaterThan(0);
    }
  });

  it("marks exactly one role current", () => {
    expect(experience.filter((r) => r.current)).toHaveLength(1);
  });

  it("gives experience and education unique ids", () => {
    const ids = [...experience.map((e) => e.id), ...education.map((e) => e.id)];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every proof stat something to render", () => {
    // CountUp needs `to`; static stats need `value`. Neither means a blank cell.
    for (const stat of proofStats) {
      expect(
        typeof stat.to === "number" || Boolean(stat.value),
        `proof stat "${stat.label}" has neither \`to\` nor \`value\``,
      ).toBe(true);
      expect(stat.label).toBeTruthy();
    }
  });

  it("has no duplicate skills inside a group", () => {
    for (const group of skillGroups) {
      expect(new Set(group.items).size, `duplicate item in "${group.label}"`).toBe(
        group.items.length,
      );
      expect(group.items.length).toBeGreaterThan(0);
    }
  });

  it("numbers the work process consecutively from 1", () => {
    expect(workProcess.map((s) => s.step)).toEqual(
      Array.from({ length: workProcess.length }, (_, i) => i + 1),
    );
  });

  it("has a complete about story", () => {
    expect(about.intro).toBeTruthy();
    expect(about.paragraphs.length).toBeGreaterThan(0);
    expect(about.closing).toBeTruthy();
  });
});

describe("site config", () => {
  it("has an absolute https site url with no trailing slash", () => {
    expect(() => new URL(siteConfig.url)).not.toThrow();
    expect(siteConfig.url.startsWith("https://")).toBe(true);
    expect(siteConfig.url.endsWith("/")).toBe(false);
  });

  it("has absolute https social links", () => {
    for (const [name, url] of Object.entries(siteConfig.social)) {
      expect(url, name).toMatch(/^https:\/\//);
    }
  });

  it("ships the résumé the whole site links to", () => {
    expect(siteConfig.resumeUrl.startsWith("/")).toBe(true);
    expect(
      existsSync(localAsset(siteConfig.resumeUrl)),
      `résumé missing from public/: ${siteConfig.resumeUrl}`,
    ).toBe(true);
  });

  it("ships the portrait used for the Person schema image", () => {
    expect(existsSync(localAsset(siteConfig.portrait.src))).toBe(true);
  });

  it("has a plausible email and geo position", () => {
    expect(siteConfig.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
    expect(siteConfig.geo.lat).toBeGreaterThan(-90);
    expect(siteConfig.geo.lat).toBeLessThan(90);
    expect(siteConfig.geo.lng).toBeGreaterThan(-180);
    expect(siteConfig.geo.lng).toBeLessThan(180);
  });

  it("keeps navigation internal, unique and root-relative", () => {
    for (const link of navLinks) {
      expect(link.href.startsWith("/"), link.href).toBe(true);
      expect(link.label).toBeTruthy();
    }
    const hrefs = navLinks.map((l) => l.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("keeps the footer a superset of the navbar", () => {
    const footerHrefs = new Set(footerLinks.map((l) => l.href));
    for (const link of navLinks) {
      expect(footerHrefs.has(link.href), `footer is missing ${link.href}`).toBe(true);
    }
  });
});

describe("faq", () => {
  it("asks unique questions and answers all of them", () => {
    const questions = faqs.map((f) => f.question);
    expect(new Set(questions).size).toBe(questions.length);

    for (const faq of faqs) {
      expect(faq.question.endsWith("?"), `"${faq.question}" should end in a question mark`).toBe(
        true,
      );
      // FAQPage rich results need substance, not a one-liner.
      expect(faq.answer.length, faq.question).toBeGreaterThan(80);
    }
  });

  it("states the contact email consistently with site config", () => {
    const mentions = faqs.filter((f) => f.answer.includes("@"));
    for (const faq of mentions) {
      expect(faq.answer, faq.question).toContain(siteConfig.email);
    }
  });
});

describe("positioning consistency", () => {
  // The site was repositioned from "web & mobile" to backend-heavy full-stack.
  // /contact kept the old copy for a while; this stops it recurring in content.
  const corpus = [
    siteConfig.tagline,
    siteConfig.bio,
    siteConfig.availability,
    about.intro,
    ...about.paragraphs,
    about.closing,
    prologue.byline,
    prologue.availability,
    ...faqs.map((f) => f.answer),
  ].join("\n");

  it("does not lead with the retired 'web & mobile' framing", () => {
    expect(corpus).not.toMatch(/web (&|and) mobile/i);
  });

  it("states the role consistently in config", () => {
    expect(siteConfig.role).toBe("Full-Stack Software Engineer");
    expect(siteConfig.bio).toContain(siteConfig.role);
  });

  it("keeps the availability line pointed at backend/full-stack roles", () => {
    expect(siteConfig.availability).toMatch(/backend/i);
  });
});
