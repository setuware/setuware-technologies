import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3100);
const baseURL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${PORT}`;

/**
 * End-to-end suite.
 *
 * Runs against a production build by default — the dev server has different
 * caching, bundling and error behaviour, so testing it would prove the wrong
 * thing. Set `E2E_BASE_URL` to point the suite at a deployed environment.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  // A `.only` left in a spec silently shrinks CI coverage; fail instead.
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  timeout: 30_000,
  expect: { timeout: 7_000 },

  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
      /*
       * Layout, navigation and accessibility are where a phone genuinely
       * differs. Form submission and the API contract are viewport-independent
       * and are covered on desktop; running them twice only doubles the load
       * on the per-IP rate limiter and makes the suite flaky against its own
       * abuse protection.
       */
      testMatch: /(navigation|accessibility|estimator)\.spec\.ts/,
    },
  ],

  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npm run start -- --port ${PORT}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        stdout: "ignore",
        stderr: "pipe",
      },
});
