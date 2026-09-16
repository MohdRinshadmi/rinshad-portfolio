import { DENYLIST, type CodeRepo } from "./repos.ts";

/* ============================================================================
   WHICH FILES ARE INDEXED — decided from the path and `stat` size alone, so a
   file that will be skipped is never read into memory.
   ========================================================================== */

export const MAX_FILE_BYTES = 100 * 1024;

const EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".go", ".py", ".sql", ".md", ".yml", ".yaml", ".prisma", ".sh",
]);
/** Matched as whole filenames: `Dockerfile` yes, `Dockerfile.dev` no. */
const FILENAMES = new Set(["Dockerfile"]);
const EXCLUDED_DIRS = new Set(["node_modules", "dist", "build", ".next", "vendor", "coverage"]);
const LOCKFILES = new Set([
  "package-lock.json", "npm-shrinkwrap.json", "yarn.lock", "pnpm-lock.yaml", "bun.lock", "bun.lockb",
  "go.sum", "poetry.lock", "Pipfile.lock", "uv.lock", "Cargo.lock", "composer.lock", "Gemfile.lock",
]);

export type SkipReason =
  | "excluded-dir"
  | "env-file"
  | "lockfile"
  | "minified"
  | "unsupported-type"
  | "denylisted"
  | "too-large";

/** Why `path` is not indexed, or `null` when it is. */
export function skipReason(repo: CodeRepo, path: string, sizeBytes: number): SkipReason | null {
  const segments = path.split("/");
  const name = segments[segments.length - 1];

  if (segments.slice(0, -1).some((segment) => EXCLUDED_DIRS.has(segment))) return "excluded-dir";
  if (name.startsWith(".env")) return "env-file";
  if (LOCKFILES.has(name)) return "lockfile";
  if (name.includes(".min.")) return "minified";
  if (!FILENAMES.has(name) && !EXTENSIONS.has(extensionOf(name))) return "unsupported-type";
  if (DENYLIST[repo].includes(path)) return "denylisted";
  if (sizeBytes > MAX_FILE_BYTES) return "too-large";
  return null;
}

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot).toLowerCase() : "";
}
