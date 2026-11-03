import { expect, test } from "@playwright/test";

test.describe("instant quote estimator", () => {
  test("prices a project and reflects each change", async ({ page }) => {
    await page.goto("/estimate");

    const headline = page.locator("p.font-display").first();
    await expect(headline).toContainText("₹");

    const before = await headline.textContent();

    await page.getByLabel("Service").selectOption("app-development");
    await expect(headline).not.toHaveText(before ?? "");
  });

  test("shows a timeline, squad size and payment milestones", async ({ page }) => {
    await page.goto("/estimate");

    await expect(page.getByText(/~\d+ weeks/)).toBeVisible();
    // Scoped: "N people" also appears in the squad copy elsewhere on the page.
    await expect(page.getByText(/^\d+ people$/).first()).toBeVisible();
    await expect(page.getByText("Discovery & architecture")).toBeVisible();
  });

  test("puts the configuration in the URL so a quote can be shared", async ({
    page,
    context,
  }) => {
    await page.goto("/estimate");
    await page.getByLabel("Service").selectOption("managed-hosting");
    await expect(page).toHaveURL(/s=managed-hosting/);

    // Open the same URL in a fresh tab: the configuration must survive.
    const shared = await context.newPage();
    await shared.goto(page.url());
    await expect(shared.getByLabel("Service")).toHaveValue("managed-hosting");
    await shared.close();
  });

  test("survives a reload with the configuration intact", async ({ page }) => {
    await page.goto("/estimate");
    await page.getByLabel("Features").click();
    await page.getByText("Realtime chat / notifications").click();

    await page.reload();

    await expect(page.getByLabel(/Realtime chat/i)).toBeChecked();
  });

  test("validates the quote form before sending", async ({ page }) => {
    await page.goto("/estimate");

    await page.getByRole("button", { name: /send me this quote/i }).click();

    // Nothing was sent, so the form is still on screen.
    await expect(page.getByRole("button", { name: /send me this quote/i })).toBeVisible();
  });

  test("emails a quote and confirms it was sent", async ({ page }) => {
    await page.goto("/estimate");

    await page.getByLabel(/^Name/).fill("Priya Sharma");
    await page.getByLabel(/work email/i).fill(`e2e-${Date.now()}@example.com`);
    await page.getByRole("button", { name: /send me this quote/i }).click();

    await expect(page.getByText(/quote on its way/i)).toBeVisible();
  });

  test("the slider is operable from the keyboard", async ({ page }) => {
    await page.goto("/estimate");

    const slider = page.getByRole("slider");
    await slider.focus();
    const before = await slider.inputValue();
    await slider.press("ArrowRight");

    expect(await slider.inputValue()).not.toBe(before);
  });
});
