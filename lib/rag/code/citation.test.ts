import { describe, expect, it } from "vitest";
import { CITATION_ID } from "@/lib/chat/protocol";
import { codeCitationId, codeMarker, codeSourceTitle, githubBlobUrl } from "./citation";

const SHA = "c9b43a48eef6dc472d82efabbfbc1d3cfba0456a";
const base = {
  repo: "ai-life-assistant",
  path: "apps/server/src/modules/auth/auth.service.ts",
  sha: SHA,
  startLine: 42,
  endLine: 101,
};

describe("githubBlobUrl", () => {
  it("pins the exact commit, path and line range", () => {
    expect(githubBlobUrl(base)).toBe(
      `https://github.com/MohdRinshadmi/ai-life-assistant/blob/${SHA}/apps/server/src/modules/auth/auth.service.ts#L42-L101`,
    );
  });

  it("percent-encodes path segments that need it and keeps the slashes", () => {
    expect(githubBlobUrl({ ...base, path: "apps/web/src/app/(main)/[slug]/page #1.tsx" })).toBe(
      `https://github.com/MohdRinshadmi/ai-life-assistant/blob/${SHA}/apps/web/src/app/(main)/%5Bslug%5D/page%20%231.tsx#L42-L101`,
    );
  });

  it.each(["main", "master", "HEAD", "latest", "c9b43a4", SHA.toUpperCase()])("refuses the unpinned ref %s", (sha) => {
    expect(() => githubBlobUrl({ ...base, sha })).toThrow(/40-character/);
  });

  it("refuses unknown repositories, path traversal and impossible line ranges", () => {
    expect(() => githubBlobUrl({ ...base, repo: "some-private-repo" })).toThrow(/Unknown/);
    expect(() => githubBlobUrl({ ...base, path: "../secrets.ts" })).toThrow(/path/);
    expect(() => githubBlobUrl({ ...base, path: "/etc/hosts" })).toThrow(/path/);
    expect(() => githubBlobUrl({ ...base, startLine: 0 })).toThrow(/line range/);
    expect(() => githubBlobUrl({ ...base, startLine: 50, endLine: 40 })).toThrow(/line range/);
  });
});

describe("markers and ids", () => {
  it("formats the tool-result marker and the source title", () => {
    expect(codeMarker(base)).toBe("[[ai-life-assistant/apps/server/src/modules/auth/auth.service.ts#L42-L101]]");
    expect(codeSourceTitle(base)).toBe("ai-life-assistant/apps/server/src/modules/auth/auth.service.ts · L42–101");
  });

  it("derives a stable, opaque citation id the answer syntax can carry", () => {
    const id = codeCitationId("ai-life-assistant/a.ts#L1-L60");
    expect(id).toMatch(/^code\/[0-9a-f]{12}$/);
    expect(id).toMatch(CITATION_ID);
    expect(codeCitationId("ai-life-assistant/a.ts#L1-L60")).toBe(id);
    expect(codeCitationId("ai-life-assistant/a.ts#L51-L110")).not.toBe(id);
  });
});
