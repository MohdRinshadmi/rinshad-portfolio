import { describe, expect, it } from "vitest";
import { MAX_FILE_BYTES, skipReason, type SkipReason } from "./files";
import { CODE_REPOS, DENYLIST } from "./repos";

/* The filter runs before a byte of a file is read, so these are the only
   guarantees that a lockfile, a build artefact or an .env never reaches the
   embedding API — or the public chatbot. */

const repo = "ai-real-time-collaboration" as const;

describe("skipReason", () => {
  it.each([
    "apps/api/src/server.ts",
    "apps/web/src/App.tsx",
    "apps/web/src/legacy/widget.jsx",
    "apps/api/src/app.js",
    "scripts/build.mjs",
    "backend/cmd/api/main.go",
    "services/ingestion/src/chunking.py",
    "db/migrations/0001_init.sql",
    "docs/architecture.md",
    "infrastructure/k8s/base/ingress.yaml",
    ".github/workflows/deploy.yml",
    "packages/db/prisma/schema.prisma",
    "scripts/bootstrap.sh",
    "Dockerfile",
    "apps/api/Dockerfile",
  ])("indexes %s", (path) => {
    expect(skipReason(repo, path, 1_000)).toBeNull();
  });

  const skipped: [string, SkipReason][] = [
    ["node_modules/react/index.js", "excluded-dir"],
    ["apps/web/.next/server/page.js", "excluded-dir"],
    ["dist/index.js", "excluded-dir"],
    ["apps/api/build/app.js", "excluded-dir"],
    ["backend/vendor/github.com/x/y.go", "excluded-dir"],
    ["coverage/lcov-report/prettify.js", "excluded-dir"],
    [".env", "env-file"],
    [".env.example", "env-file"],
    ["apps/api/.env.local", "env-file"],
    ["package-lock.json", "lockfile"],
    ["pnpm-lock.yaml", "lockfile"],
    ["yarn.lock", "lockfile"],
    ["backend/go.sum", "lockfile"],
    ["public/vendor.min.js", "minified"],
    ["styles/app.min.css", "minified"],
    ["logo.png", "unsupported-type"],
    ["package.json", "unsupported-type"],
    ["Dockerfile.dev", "unsupported-type"],
    ["infrastructure/terraform/main.tf", "unsupported-type"],
  ];

  it.each(skipped)("skips %s (%s)", (path, reason) => {
    expect(skipReason(repo, path, 1_000)).toBe(reason);
  });

  it("matches excluded directories as whole path segments only", () => {
    expect(skipReason(repo, "src/builder/index.ts", 1_000)).toBeNull();
    expect(skipReason(repo, "src/distribution/index.ts", 1_000)).toBeNull();
  });

  it("skips files over 100 KB from their size alone", () => {
    expect(MAX_FILE_BYTES).toBe(100 * 1024);
    expect(skipReason(repo, "src/big.ts", MAX_FILE_BYTES)).toBeNull();
    expect(skipReason(repo, "src/big.ts", MAX_FILE_BYTES + 1)).toBe("too-large");
  });

  it("skips every audited denylist entry, and only in its own repository", () => {
    for (const r of CODE_REPOS) {
      for (const path of DENYLIST[r]) expect(skipReason(r, path, 1_000), `${r}/${path}`).toBe("denylisted");
    }
    expect(skipReason("cloud-native-iot-dashboard", "README.md", 1_000)).toBe("denylisted");
    expect(skipReason("ai-life-assistant", "README.md", 1_000)).toBeNull();
  });
});
