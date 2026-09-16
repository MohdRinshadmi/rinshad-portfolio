import { describe, expect, it } from "vitest";
import { projects } from "@/lib/content/projects";
import { CODE_REPOS, DENYLIST, GITHUB_OWNER, REPO_PROJECT_SLUG, isCodeRepo } from "./repos";

describe("code repository registry", () => {
  it("indexes exactly the repositories the case studies link to", () => {
    const registered = CODE_REPOS.map((repo) => `https://github.com/${GITHUB_OWNER}/${repo}`);
    expect([...registered].sort()).toEqual(projects.map((p) => p.githubUrl).sort());
    for (const repo of CODE_REPOS) {
      expect(projects.find((p) => p.slug === REPO_PROJECT_SLUG[repo])?.githubUrl, repo).toBe(
        `https://github.com/${GITHUB_OWNER}/${repo}`,
      );
    }
  });

  it("keeps denylist paths repo-relative and unique", () => {
    for (const repo of CODE_REPOS) {
      const paths = DENYLIST[repo];
      expect(new Set(paths).size, repo).toBe(paths.length);
      for (const path of paths) expect(path, path).toMatch(/^[^/\\.][^\\]*$/);
    }
  });

  it("recognises only registered repositories", () => {
    expect(isCodeRepo("ai-life-assistant")).toBe(true);
    expect(isCodeRepo("some-private-repo")).toBe(false);
    expect(isCodeRepo(42)).toBe(false);
  });
});
