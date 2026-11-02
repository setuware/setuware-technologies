import { describe, expect, it, vi } from "vitest";

// `currentDateIso` uses `"use cache"`, which only exists inside Next.
vi.mock("@/lib/time", () => ({
  currentDateIso: async () => "2026-11-02T00:00:00.000Z",
}));

import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { jobs } from "@/lib/careers";
import { caseStudies, services } from "@/lib/content";
import { industries } from "@/lib/industries";
import { posts } from "@/lib/posts";
import { site } from "@/lib/site";

describe("sitemap.xml", () => {
  it("lists every public page, and only on the canonical domain", async () => {
    const entries = await sitemap();
    const paths = entries.map((entry) => new URL(entry.url).pathname);

    for (const entry of entries) {
      expect(entry.url.startsWith(site.url)).toBe(true);
      expect(entry.lastModified).toBeDefined();
      expect(entry.priority).toBeGreaterThan(0);
    }

    expect(paths).toEqual(expect.arrayContaining(["/", "/services", "/pricing", "/contact"]));
    for (const slug of services.map((s) => s.slug)) expect(paths).toContain(`/services/${slug}`);
    for (const slug of industries.map((i) => i.slug)) expect(paths).toContain(`/industries/${slug}`);
    for (const slug of caseStudies.map((c) => c.slug)) expect(paths).toContain(`/work/${slug}`);
    for (const slug of jobs.map((j) => j.slug)) expect(paths).toContain(`/careers/${slug}`);
    for (const slug of posts.map((p) => p.slug)) expect(paths).toContain(`/blog/${slug}`);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("leaves out noindex pages", async () => {
    const paths = (await sitemap()).map((entry) => new URL(entry.url).pathname);
    expect(paths).not.toContain("/status");
    expect(paths).not.toContain("/not-found");
  });
});

describe("robots.txt", () => {
  it("allows everything but the API and points at the sitemap", () => {
    const result = robots();
    expect(result.rules).toEqual([{ userAgent: "*", allow: "/", disallow: ["/api/"] }]);
    expect(result.sitemap).toBe(`${site.url}/sitemap.xml`);
    expect(result.host).toBe(site.url);
  });
});
