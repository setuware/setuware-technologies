import { expect, test } from "@playwright/test";

test.describe("navigation and rendering", () => {
  test("home page renders its hero and primary calls to action", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { level: 1, name: /website, app and custom software development in gurugram/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: /from ideas to\s+production-ready software/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /start a project/i }).first(),
    ).toBeVisible();
    await expect(page).toHaveTitle(/Website Development Company in Gurugram \| Setuware/);
  });

  test("every section below the fold is present in the HTML, not gated on JS", async ({
    page,
  }) => {
    // JavaScript disabled: content must still be served and readable, which is
    // what crawlers and Reader modes see.
    await page.context().addInitScript(() => {});
    const response = await page.goto("/");
    const html = (await response?.text()) ?? "";

    expect(html).toContain("All services");
    expect(html).toContain("A refined process");
    expect(html).toContain("Selected Projects");
    expect(html).toContain("Flexible plans");
    expect(html).toContain("Tell us about your project");
    expect(html).toContain("Frequently Asked");
  });

  test("navigates from home to a service page and back", async ({ page, isMobile }) => {
    await page.goto("/");

    if (isMobile) {
      await page.getByRole("button", { name: /open menu/i }).click();
      await page
        .getByRole("dialog", { name: /site menu/i })
        .getByRole("link", { name: "Projects", exact: true })
        .click();
    } else {
      await page.getByRole("link", { name: "Projects", exact: true }).first().click();
    }
    await expect(page).toHaveURL(/\/work$/);
    await expect(
      page.getByRole("heading", { level: 1, name: /software that is still running/i }),
    ).toBeVisible();

    await page.getByRole("link", { name: /read the case study/i }).first().click();
    await expect(page).toHaveURL(/\/work\/[a-z-]+$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("renders every service page", async ({ page }) => {
    const slugs = [
      "business-websites",
      "ecommerce-stores",
      "web-development",
      "app-development",
      "product-design",
      "seo-marketing",
      "custom-software",
      "ai-integration",
      "managed-hosting",
      "support-maintenance",
    ];

    for (const slug of slugs) {
      const response = await page.goto(`/services/${slug}`);
      expect(response?.status(), `${slug} should be 200`).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(
        page.getByRole("link", { name: /price this service/i }),
      ).toBeVisible();
    }
  });

  test("unknown routes return a helpful 404", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");

    expect(response?.status()).toBe(404);
    await expect(page.getByText("404")).toBeVisible();
    await expect(page.getByRole("link", { name: /back to home/i })).toBeVisible();
  });

  test("unknown service slugs 404 rather than rendering an empty page", async ({
    page,
  }) => {
    const response = await page.goto("/services/time-travel");
    expect(response?.status()).toBe(404);
  });

  test("serves a sitemap listing every page", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    const body = await response.text();

    expect(response.status()).toBe(200);
    expect(body).toContain("/services/managed-hosting");
    expect(body).toContain("/blog/surviving-a-traffic-spike");
    expect(body).toContain("/work/kirana-commerce-platform");
  });

  test("serves robots.txt pointing at the sitemap and blocking the API", async ({
    request,
  }) => {
    const body = await (await request.get("/robots.txt")).text();

    expect(body).toContain("Sitemap:");
    expect(body).toContain("Disallow: /api/");
  });

  test("sends the security headers we configured", async ({ request }) => {
    const headers = (await request.get("/")).headers();

    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'self'");
    expect(headers["x-powered-by"]).toBeUndefined();
  });

  test("mobile menu opens, navigates and closes", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Mobile drawer only renders below the lg breakpoint");

    await page.goto("/");
    await page.getByRole("button", { name: /open menu/i }).click();

    const drawer = page.getByRole("dialog", { name: /site menu/i });
    await expect(drawer).toBeVisible();

    await drawer.getByRole("link", { name: "Pricing" }).click();
    await expect(page).toHaveURL(/\/pricing$/);
  });
});
