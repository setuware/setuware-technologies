import { describe, expect, it } from "vitest";

import { getService, services } from "@/lib/content";
import { industries } from "@/lib/industries";
import {
  companyMenu,
  industriesMenu,
  menuItems,
  navLinks,
  servicesMenu,
} from "@/components/layout/nav-menu-data";

describe("header menus", () => {
  it("lists every service exactly once in the Services menu", () => {
    const hrefs = menuItems(servicesMenu).map((item) => item.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect(hrefs.sort()).toEqual(services.map((service) => `/services/${service.slug}`).sort());
  });

  it("lists every industry exactly once in the Industries menu", () => {
    const hrefs = menuItems(industriesMenu).map((item) => item.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect(hrefs.sort()).toEqual(industries.map((industry) => `/industries/${industry.slug}`).sort());
  });

  it("gives every menu item an icon and a one-line description", () => {
    for (const menu of [servicesMenu, industriesMenu, companyMenu]) {
      for (const item of menuItems(menu)) {
        expect(item.icon, item.label).toBeDefined();
        expect(item.description?.length ?? 0, item.label).toBeGreaterThan(0);
        expect(item.description?.length ?? 0, item.label).toBeLessThanOrEqual(80);
      }
    }
  });

  it("keeps Pricing and Contact as plain links, with unique menu ids", () => {
    const plain = navLinks.filter((entry) => entry.kind === "link").map((entry) => entry.href);
    expect(plain).toEqual(expect.arrayContaining(["/pricing", "/contact"]));

    const ids = navLinks.flatMap((entry) => (entry.kind === "menu" ? [entry.id] : []));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("links the Company menu to the company pages", () => {
    expect(menuItems(companyMenu).map((item) => item.href)).toEqual(
      expect.arrayContaining(["/about", "/process", "/work", "/careers", "/blog", "/contact"]),
    );
  });
});

describe("industries", () => {
  it("has unique slugs and only references services we offer", () => {
    const slugs = industries.map((industry) => industry.slug);
    expect(new Set(slugs).size).toBe(slugs.length);

    for (const industry of industries) {
      expect(industry.problems.length).toBeGreaterThanOrEqual(3);
      expect(industry.features.length).toBeGreaterThanOrEqual(6);
      for (const build of industry.builds) {
        expect(getService(build.service), `${industry.slug} → ${build.service}`).toBeDefined();
      }
    }
  });
});
