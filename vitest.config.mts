import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Native resolution of the `@/*` alias from tsconfig.json.
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    // Playwright specs live in tests/e2e and run under `npm run test:e2e`.
    exclude: ["tests/e2e/**", "node_modules/**", ".next/**"],
    restoreMocks: true,
    clearMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "coverage",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/app/**/layout.tsx",
        "src/app/**/loading.tsx",
        "src/app/**/error.tsx",
        "src/app/**/global-error.tsx",
        "src/app/opengraph-image.tsx",
        "src/**/*.d.ts",
      ],
      // The domain layer is where correctness lives, so it is held to a much
      // higher bar than presentational components.
      thresholds: {
        lines: 55,
        functions: 60,
        branches: 70,
        statements: 55,
        "src/lib/pricing.ts": {
          lines: 95,
          functions: 100,
          branches: 90,
          statements: 95,
        },
        "src/lib/rate-limit.ts": {
          lines: 95,
          functions: 90,
          branches: 85,
          statements: 95,
        },
        "src/lib/api.ts": {
          lines: 90,
          functions: 90,
          branches: 85,
          statements: 90,
        },
      },
    },
  },
});
