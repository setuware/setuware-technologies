import { expect, test } from "@playwright/test";

test.describe("contact and newsletter", () => {
  test("rejects an incomplete brief with inline errors", async ({ page }) => {
    await page.goto("/contact");

    await page.getByLabel(/your name/i).fill("A");
    await page.getByLabel(/work email/i).fill("not-an-email");
    await page.getByLabel(/about the project/i).fill("hi");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: /send project brief/i }).click();

    await expect(page.getByRole("alert").first()).toBeVisible();
  });

  test("requires consent before the brief can be sent", async ({ page }) => {
    await page.goto("/contact");

    await page.getByLabel(/your name/i).fill("Priya Sharma");
    await page.getByLabel(/work email/i).fill("priya@example.com");
    await page
      .getByLabel(/about the project/i)
      .fill("We run 14 retail stores and need an ordering platform.");
    await page.getByRole("button", { name: /send project brief/i }).click();

    await expect(page.getByText(/accept the privacy policy/i)).toBeVisible();
  });

  test("submits a complete brief and shows a reference", async ({ page }) => {
    await page.goto("/contact");

    await page.getByLabel(/your name/i).fill("Priya Sharma");
    await page.getByLabel(/work email/i).fill(`e2e-${Date.now()}@example.com`);
    await page
      .getByLabel(/about the project/i)
      .fill("We run 14 retail stores and need an ordering platform by March.");
    await page.getByRole("checkbox").check();

    // The server rejects submissions faster than 1.2s as automated.
    await page.waitForTimeout(1_500);
    await page.getByRole("button", { name: /send project brief/i }).click();

    await expect(page.getByText(/your brief is with us/i)).toBeVisible();
    await expect(page.getByText(/^STW-[A-Z0-9]{6}$/)).toBeVisible();
  });

  test("keeps an unsent draft across a reload", async ({ page }) => {
    await page.goto("/contact");
    await page.getByLabel(/your name/i).fill("Draft Survivor");

    await page.reload();

    await expect(page.getByLabel(/your name/i)).toHaveValue("Draft Survivor");
  });

  test("prefills the service when arriving from a service page", async ({ page }) => {
    await page.goto("/services/managed-hosting");
    await page.getByRole("link", { name: /talk to an engineer/i }).click();

    await expect(page).toHaveURL(/service=managed-hosting/);
    await expect(page.getByLabel(/what do you need/i)).toHaveValue("managed-hosting");
  });

  test("subscribes to the newsletter from the footer", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("contentinfo").scrollIntoViewIfNeeded();

    const email = page.getByLabel("Email address");
    await email.fill(`e2e-${Date.now()}@example.com`);
    await page.getByRole("button", { name: /subscribe/i }).click();

    await expect(page.getByRole("status")).toContainText(/on the list/i);
  });

  test("shows a readable error for an invalid newsletter address", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("contentinfo").scrollIntoViewIfNeeded();

    await page.getByLabel("Email address").fill("broken@");
    await page.getByRole("button", { name: /subscribe/i }).click();

    await expect(page.getByText(/looks incomplete|valid/i).first()).toBeVisible();
  });
});

test.describe("API contract", () => {
  test("never exposes submitted enquiries over GET", async ({ request }) => {
    const response = await request.get("/api/contact");

    expect(response.status()).toBe(400);
    expect(await response.text()).not.toContain("@");
  });

  test("validates and rejects a malformed enquiry", async ({ request }) => {
    const response = await request.post("/api/contact", {
      data: { name: "x", email: "nope", message: "hi", consent: false },
    });

    expect(response.status()).toBe(422);
    const body = await response.json();
    expect(body.error.code).toBe("validation_failed");
    expect(body.error.fields).toBeTruthy();
  });

  test("rejects a non-JSON content type", async ({ request }) => {
    const response = await request.post("/api/newsletter", {
      headers: { "content-type": "text/plain" },
      data: "email=a@b.com",
    });

    expect(response.status()).toBe(415);
  });

  test("rate-limits a flood of submissions", async ({ request }) => {
    const statuses: number[] = [];

    for (let i = 0; i < 9; i += 1) {
      const response = await request.post("/api/newsletter", {
        // A dedicated client identity: without it this test burns the shared
        // per-IP budget and the browser-driven form tests start getting 429s.
        headers: { "x-real-ip": "198.51.100.99" },
        data: { email: `flood-${i}@example.com` },
      });
      statuses.push(response.status());
    }

    expect(statuses).toContain(429);
  });

  test("health endpoint reports liveness without caching", async ({ request }) => {
    const response = await request.get("/api/health");
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.status).toBe("healthy");
    expect(response.headers()["cache-control"]).toContain("no-store");
  });
});
