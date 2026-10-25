import { expect, test } from "@playwright/test";

/**
 * Performance budgets, enforced as tests.
 *
 * A regression here fails CI rather than quietly shipping — which is the only
 * way a budget survives contact with a deadline.
 */

/**
 * Compressed over the wire — what a visitor actually downloads.
 *
 * Re-based from 170KB when the services carousel was added: it is a genuinely
 * interactive component the design calls for, and it costs real client code.
 * This is a ceiling, not a target — if a change pushes past it, reduce the
 * change rather than the budget.
 */
const JS_BUDGET_KB = 185;
const LCP_BUDGET_MS = 2_500;
const CLS_BUDGET = 0.1;

test.describe("performance budgets", () => {
  test("ships less than the JavaScript budget on first load", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });

    // `encodedBodySize` is the compressed size, so this measures bandwidth
    // rather than the much larger uncompressed bundle.
    const bytes = await page.evaluate(() =>
      performance
        .getEntriesByType("resource")
        .filter(
          (entry): entry is PerformanceResourceTiming =>
            entry.name.includes("/_next/static/") && entry.name.endsWith(".js"),
        )
        .reduce((total, entry) => total + entry.encodedBodySize, 0),
    );

    const kilobytes = bytes / 1024;
    expect(
      kilobytes,
      `first-load JS was ${kilobytes.toFixed(1)}KB compressed (budget ${JS_BUDGET_KB}KB)`,
    ).toBeLessThan(JS_BUDGET_KB);
  });

  test("paints its largest element within budget", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });

    const lcp = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let latest = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) latest = entry.startTime;
          }).observe({ type: "largest-contentful-paint", buffered: true });

          // Give the observer a beat to report, then settle.
          setTimeout(() => resolve(latest), 1_500);
        }),
    );

    expect(lcp, `LCP was ${lcp.toFixed(0)}ms`).toBeLessThan(LCP_BUDGET_MS);
  });

  test("does not shift layout while the page settles", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });

    const cls = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let total = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              const shift = entry as PerformanceEntry & {
                value: number;
                hadRecentInput: boolean;
              };
              if (!shift.hadRecentInput) total += shift.value;
            }
          }).observe({ type: "layout-shift", buffered: true });

          // Scroll the whole page: deferred sections must not jump.
          window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" });
          setTimeout(() => resolve(total), 1_500);
        }),
    );

    expect(cls, `CLS was ${cls.toFixed(3)}`).toBeLessThan(CLS_BUDGET);
  });

  test("defers the command palette until it is summoned", async ({ page }) => {
    const chunks: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/_next/static/")) chunks.push(request.url());
    });

    await page.goto("/", { waitUntil: "load" });
    const beforeCount = chunks.length;

    await page.keyboard.press("ControlOrMeta+k");
    await expect(page.getByRole("dialog", { name: /search/i })).toBeVisible();

    expect(chunks.length).toBeGreaterThan(beforeCount);
  });

  test("marketing pages are served as prerendered static HTML", async ({ request }) => {
    for (const path of ["/", "/pricing", "/services/web-development"]) {
      const response = await request.get(path);
      const body = await response.text();

      expect(response.status()).toBe(200);
      // Content present in the first byte of HTML, not injected later.
      expect(body).toContain("<h1");
    }
  });

  test("the hero backdrop fetches no video bytes when none is configured", async ({
    page,
  }) => {
    const media: string[] = [];
    page.on("request", (request) => {
      if (request.resourceType() === "media") media.push(request.url());
    });

    await page.goto("/", { waitUntil: "load" });

    expect(media).toEqual([]);
  });
});
