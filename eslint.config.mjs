import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Parked 3D journey — kept on disk, out of the build graph, and its
    // three.js / gsap deps are uninstalled, so it can no longer be linted.
    // See tsconfig.json's matching exclude and docs/3D-EXPERIENCE.md.
    "components/experience/**",
  ]),
]);

export default eslintConfig;
