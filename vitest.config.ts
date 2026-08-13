import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // tsconfig sets jsx: "preserve" for Next's own compiler, which leaves the
  // test runner unable to parse .tsx. Transform it here instead.
  oxc: { jsx: { runtime: "automatic" } },
  resolve: {
    // Mirror the "@/*" path alias from tsconfig.json
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    // Widened past lib/ for the route-param contract test — Next 15's async
    // params is the one breakage neither typecheck nor lint can see.
    include: ["{app,components,hooks,lib}/**/*.test.{ts,tsx}"],
  },
});
