import { defineConfig } from "vitest/config";

/* `.mts` so Vite loads this as ESM natively — a `.ts` config is read as CJS
   and warns on the import syntax. Path aliases come from tsconfig's `paths`
   via Vite's built-in resolution, so tests import exactly the way app code
   does ("@/lib/…") with no extra plugin. */
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    // The parked 3D journey is excluded from TypeScript and ESLint; keep the
    // test runner's view of the project consistent with those.
    exclude: ["node_modules/**", ".next/**", "components/experience/**", "lib/experience/**"],
  },
});
