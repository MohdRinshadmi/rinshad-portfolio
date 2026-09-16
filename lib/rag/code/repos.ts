/* ============================================================================
   CODE CORPUS REGISTRY — which public repositories the assistant may search,
   and which files inside them it must never index.

   Server-only, and imported by scripts/*.mts through Node's type stripping,
   so every relative import in lib/rag/code carries its `.ts` extension.
   ========================================================================== */

export const GITHUB_OWNER = "MohdRinshadmi";

/** Public repositories only. Adding one means re-running the public-code audit first. */
export const CODE_REPOS = [
  "cloud-native-iot-dashboard",
  "ai-life-assistant",
  "ai-real-time-collaboration",
] as const;

export type CodeRepo = (typeof CODE_REPOS)[number];

export function isCodeRepo(value: unknown): value is CodeRepo {
  return typeof value === "string" && (CODE_REPOS as readonly string[]).includes(value);
}

/** The portfolio case study each repository backs (lib/content/projects.ts). */
export const REPO_PROJECT_SLUG: Readonly<Record<CodeRepo, string>> = {
  "cloud-native-iot-dashboard": "iot-analytics-dashboard",
  "ai-life-assistant": "ai-life-assistant",
  "ai-real-time-collaboration": "realtime-collab-platform",
};

/**
 * Files excluded by the public-code audit of 2026-09-11 (HEADs 7ece279,
 * c9b43a4, fbd5ad7). The secret guard (./secrets.ts) is the automatic
 * backstop; this list covers what a pattern cannot see or should not decide.
 * Paths are repo-relative. Remove an entry only once the file is fixed
 * upstream and re-audited — never just to win back search coverage.
 */
export const DENYLIST: Readonly<Record<CodeRepo, readonly string[]>> = {
  // One plaintext dev-seed password for the demo admin/operator/viewer
  // accounts, repeated across the README, seed data, simulator, login page,
  // smoke test and a unit test. seed.go carries it in a comment, which no
  // assignment pattern matches.
  "cloud-native-iot-dashboard": [
    "README.md",
    "backend/cmd/simulator/main.go",
    "backend/internal/application/auth/service_test.go",
    "backend/internal/infrastructure/persistence/seed.go",
    "frontend/src/features/auth/login-page.tsx",
    "scripts/smoke-test.sh",
  ],
  // A self-audit listing unfixed weaknesses. Not a secret, but not something a
  // public assistant should recite to visitors either.
  "ai-life-assistant": ["docs/CODEBASE_AUDIT.md"],
  // The hardcoded CI and docker-compose credentials here are left to the
  // secret guard, which skips those files whole.
  "ai-real-time-collaboration": [],
};
