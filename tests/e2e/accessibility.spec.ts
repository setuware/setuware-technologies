import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PAGES = [
  { path: "/", name: "home" },
  { path: "/services", name: "services" },
  { path: "/services/managed-hosting", name: "service detail" },
  { path: "/work", name: "work" },
  { path: "/work/kirana-commerce-platform", name: "case study" },
  { path: "/pricing", name: "pricing" },
  { path: "/estimate", name: "estimator" },
  { path: "/contact", name: "contact" },
  { path: "/blog", name: "blog" },
  { path: "/blog/surviving-a-traffic-spike", name: "article" },
  { path: "/about", name: "about" },
  { path: "/status", name: "status" },
];

test.describe("accessibility", () => {
  for (const { path, name } of PAGES) {
    test(`${name} has no WCAG A/AA violations`, async ({ page }) => {
      await page.goto(path);

      // Walk the page in steps rather than jumping to the bottom: deferred
      // sections only render as they are approached, and scroll-reveal
      // elements the viewport skips over never fire their observer. Auditing
      // mid-fade measures contrast against a partially transparent element,
      // which fails intermittently.
      await page.evaluate(async () => {
        const step = window.innerHeight * 0.8;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((resolve) => setTimeout(resolve, 120));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(900);

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      expect(
        results.violations.map((violation) => ({
          id: violation.id,
          nodes: violation.nodes.map((node) => node.target).slice(0, 3),
        })),
      ).toEqual([]);
    });
  }

  test("every page has exactly one h1", async ({ page }) => {
    for (const { path } of PAGES) {
      await page.goto(path);
      await expect(page.locator("h1"), `${path} should have one h1`).toHaveCount(1);
    }
  });

  test("the skip link is the first focus stop and works", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");

    const skip = page.getByRole("link", { name: /skip to content/i });
    await expect(skip).toBeFocused();

    await skip.press("Enter");
    await expect(page.locator("#main")).toBeVisible();
  });

  test("respects prefers-reduced-motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    // The global reduced-motion rule collapses transitions to ~0. Parse the
    // value: the browser reports it as "1e-06s", which no literal matches.
    const seconds = await page
      .locator("h1")
      .evaluate((node) => Number.parseFloat(getComputedStyle(node).transitionDuration));

    expect(seconds).toBeLessThan(0.01);
  });

  test("theme toggle switches and persists", async ({ page, isMobile }) => {
    await page.goto("/");

    // The toggle exists twice in the DOM — header and drawer — with CSS
    // deciding which is visible. Scope to the one that is actually on screen.
    let scope = page.getByRole("banner");
    if (isMobile) {
      await page.getByRole("button", { name: /open menu/i }).click();
      scope = page.getByRole("dialog", { name: /site menu/i });
    }

    await scope.getByRole("radio", { name: /dark theme/i }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);

    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });
});
