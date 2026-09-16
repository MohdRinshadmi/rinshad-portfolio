import { createHash } from "node:crypto";
import { GITHUB_OWNER, isCodeRepo } from "./repos.ts";

/* ============================================================================
   CODE CITATIONS — the one place a GitHub URL is built.

   Every link is pinned to the commit that was indexed, never to a branch: a
   `blob/main/...#L42-L101` link silently starts pointing at different code the
   next time someone pushes. The model never sees or writes these URLs — it
   cites an opaque id, and the server resolves the id against results it
   actually retrieved.
   ========================================================================== */

export interface CodeLocation {
  repo: string;
  path: string;
  sha: string;
  startLine: number;
  endLine: number;
}

const PINNED_SHA = /^[0-9a-f]{40}$/;

export function githubBlobUrl({ repo, path, sha, startLine, endLine }: CodeLocation): string {
  if (!isCodeRepo(repo)) throw new Error(`Unknown code repository: ${repo}`);
  if (!PINNED_SHA.test(sha)) throw new Error("Citations must pin a full 40-character commit SHA");
  if (!Number.isInteger(startLine) || !Number.isInteger(endLine) || startLine < 1 || endLine < startLine) {
    throw new Error(`Invalid line range L${startLine}-L${endLine}`);
  }
  const segments = path.split("/");
  if (path.includes("\\") || segments.some((segment) => segment === "" || segment === "." || segment === "..")) {
    throw new Error(`Invalid repository path: ${path}`);
  }
  return `https://github.com/${GITHUB_OWNER}/${repo}/blob/${sha}/${segments.map(encodeURIComponent).join("/")}#L${startLine}-L${endLine}`;
}

/** The marker that opens each result in a searchCode tool response. */
export const codeMarker = ({ repo, path, startLine, endLine }: Omit<CodeLocation, "sha">) =>
  `[[${repo}/${path}#L${startLine}-L${endLine}]]`;

/** What the source chip shows. */
export const codeSourceTitle = ({ repo, path, startLine, endLine }: Omit<CodeLocation, "sha">) =>
  `${repo}/${path} · L${startLine}–${endLine}`;

/** The id the model cites as `[cite:code/…]` — same syntax as site citations,
    and opaque, so there is nothing in it to edit into a different file. */
export const codeCitationId = (chunkId: string) =>
  `code/${createHash("sha256").update(chunkId).digest("hex").slice(0, 12)}`;
