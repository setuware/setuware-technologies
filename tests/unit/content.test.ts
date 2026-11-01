import { describe, expect, it } from "vitest";

import {
  caseStudies,
  faqGroups,
  faqs,
  getCaseStudy,
  getService,
  processSteps,
  services,
  stats,
  testimonials,
} from "@/lib/content";
import { carePlans, projectPackages } from "@/lib/plans";
import { getPost, posts, postsByDate, relatedPosts } from "@/lib/posts";
import { getPostBody, postBodies } from "@/lib/post-bodies";
import { SERVICE_RATES } from "@/lib/pricing";
import { footerNav, mainNav } from "@/lib/site";
import { industries } from "@/lib/industries";
import { allNavHrefs } from "@/components/layout/nav-menu-data";

/**
 * Content integrity.
 *
 * These guard the kinds of mistake that produce a broken production page but
 * compile perfectly: a duplicate slug, a nav link to a route that does not
 * exist, a case study tagged with a service we do not offer.
 */

const routes = new Set<string>([
  "/",
  "/services",
  "/work",
  "/pricing",
  "/process",
  "/about",
  "/blog",
  "/contact",
  "/estimate",
  "/status",
  "/privacy",
  "/terms",
  "/industries",
  "/careers",
  ...industries.map((industry) => `/industries/${industry.slug}`),
  ...services.map((service) => `/services/${service.slug}`),
  ...caseStudies.map((study) => `/work/${study.slug}`),
  ...posts.map((post) => `/blog/${post.slug}`),
]);

describe("services", () => {
  it("has a unique slug per service", () => {
    const slugs = services.map((service) => service.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("matches the pricing rate card exactly", () => {
    expect(services.map((service) => service.slug).sort()).toEqual(
      Object.keys(SERVICE_RATES).sort(),
    );
  });

  it("quotes a starting price consistent with the rate card base", () => {
    for (const service of services) {
      expect(service.priceFrom).toBe(SERVICE_RATES[service.slug].base);
    }
  });

  it("gives every service copy a page can render", () => {
    for (const service of services) {
      expect(service.summary.length).toBeGreaterThan(20);
      expect(service.description.length).toBeGreaterThan(80);
      expect(service.outcomes.length).toBeGreaterThanOrEqual(2);
      expect(service.deliverables.length).toBeGreaterThanOrEqual(3);
      expect(service.stack.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("gives every service a full landing page", () => {
    const offered = new Set(services.map((service) => service.slug));
    for (const service of services) {
      expect(service.group, service.slug).toBeDefined();
      expect(service.headline?.length, service.slug).toBeGreaterThan(20);
      expect(service.subheadline?.length, service.slug).toBeGreaterThan(60);
      expect(service.seoTitle, service.slug).toBeDefined();
      expect(service.seoDescription?.length ?? 0, service.slug).toBeLessThanOrEqual(170);
      expect(service.problems?.length ?? 0).toBeGreaterThanOrEqual(3);
      expect(service.features?.length ?? 0).toBeGreaterThanOrEqual(4);
      expect(service.process?.length ?? 0).toBeGreaterThanOrEqual(4);
      expect(service.process?.length ?? 0).toBeLessThanOrEqual(6);
      expect(service.faqs?.length ?? 0).toBeGreaterThanOrEqual(4);
      expect(service.faqs?.length ?? 0).toBeLessThanOrEqual(6);
      for (const slug of service.related ?? []) {
        expect(offered.has(slug)).toBe(true);
        expect(slug).not.toBe(service.slug);
      }
    }
  });

  it("keeps banned filler words out of service copy", () => {
    const banned =
      /\b(seamless|cutting-edge|leverag\w*|robust|innovative|empower\w*|unlock\w*|elevat\w*|world-class|synergy|revolutioni[sz]e|journey|delve|game-changer|holistic|best-in-class)\b/i;
    for (const service of services) {
      expect(JSON.stringify(service)).not.toMatch(banned);
    }
  });

  it("looks a service up by slug and returns undefined otherwise", () => {
    expect(getService("web-development")?.name).toBe("Web application development");
    expect(getService("nope")).toBeUndefined();
  });
});

describe("case studies", () => {
  it("has unique slugs", () => {
    const slugs = caseStudies.map((study) => study.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("only references services we actually offer", () => {
    const offered = new Set(services.map((service) => service.slug));
    for (const study of caseStudies) {
      for (const slug of study.services) {
        expect(offered.has(slug)).toBe(true);
      }
    }
  });

  it("carries exactly four headline metrics for the results grid", () => {
    for (const study of caseStudies) {
      expect(study.results).toHaveLength(4);
      for (const metric of study.results) {
        expect(metric.value.length).toBeGreaterThan(0);
        expect(metric.label.length).toBeGreaterThan(0);
      }
    }
  });

  it("has at least one featured study for the home page", () => {
    expect(caseStudies.filter((study) => study.featured).length).toBeGreaterThanOrEqual(3);
  });

  it("looks a study up by slug", () => {
    expect(getCaseStudy("kirana-commerce-platform")?.client).toBe("Vanik Retail");
    expect(getCaseStudy("nope")).toBeUndefined();
  });
});

describe("posts", () => {
  it("has unique slugs and parseable dates", () => {
    const slugs = posts.map((post) => post.slug);
    expect(new Set(slugs).size).toBe(slugs.length);

    for (const post of posts) {
      expect(Number.isNaN(new Date(post.date).getTime())).toBe(false);
    }
  });

  it("sorts newest first without mutating the source order", () => {
    const dates = postsByDate.map((post) => post.date);
    expect([...dates].sort((a, b) => b.localeCompare(a))).toEqual(dates);
    expect(posts[0].slug).toBe("surviving-a-traffic-spike");
  });

  it("gives every post a non-empty body", () => {
    for (const post of posts) {
      expect(getPostBody(post.slug).length).toBeGreaterThan(3);
      expect(post.readingMinutes).toBeGreaterThan(0);
    }
  });

  it("has a body for every post and no orphaned bodies", () => {
    const slugs = posts.map((post) => post.slug).sort();
    expect(Object.keys(postBodies).sort()).toEqual(slugs);
  });

  it("returns an empty body rather than throwing for an unknown slug", () => {
    expect(getPostBody("does-not-exist")).toEqual([]);
  });

  it("never returns the current post as related", () => {
    for (const post of posts) {
      const related = relatedPosts(post.slug, 3);
      expect(related.map((item) => item.slug)).not.toContain(post.slug);
    }
  });

  it("falls back to recent posts for an unknown slug", () => {
    expect(relatedPosts("does-not-exist", 2)).toHaveLength(2);
    expect(getPost("does-not-exist")).toBeUndefined();
  });
});

describe("navigation", () => {
  it("only links to routes that exist", () => {
    // Footer links may target an on-page anchor (e.g. "/#faq"); check the
    // path component against the route list and ignore the fragment.
    const pathOf = (href: string) => href.split("#")[0] || "/";

    for (const item of mainNav) {
      expect(routes.has(pathOf(item.href)), `${item.href} should resolve`).toBe(true);
    }

    for (const group of footerNav) {
      for (const link of group.links) {
        expect(routes.has(pathOf(link.href)), `${link.href} should resolve`).toBe(true);
      }
    }
  });

  it("only links to routes that exist from the header menus", () => {
    for (const href of allNavHrefs()) {
      expect(routes.has(href.split("?")[0]), `${href} should resolve`).toBe(true);
    }
  });

  it("reaches every main destination from the footer", () => {
    // Widened to a plain array: `footerNav` is a readonly tuple of groups with
    // differing literal shapes, which `flatMap` cannot unify on its own.
    const hrefs = new Set<string>(
      footerNav.flatMap((group) => group.links.map((link) => link.href)),
    );

    for (const destination of ["/", "/services", "/work", "/pricing", "/contact", "/about"]) {
      expect(hrefs.has(destination), `footer should link to ${destination}`).toBe(true);
    }
  });
});

describe("plans", () => {
  it("highlights exactly one plan per group", () => {
    expect(projectPackages.filter((plan) => plan.highlight)).toHaveLength(1);
    expect(carePlans.filter((plan) => plan.highlight)).toHaveLength(1);
  });

  it("prices care plans monthly and packages per project", () => {
    for (const plan of carePlans) expect(plan.monthly).toBeGreaterThan(0);
    for (const plan of projectPackages) expect(plan.monthly).toBeNull();
  });

  it("gives every package a price except the quoted enterprise tier", () => {
    const priced = projectPackages.filter((plan) => (plan.setupFrom ?? 0) > 0);
    const quoted = projectPackages.filter((plan) => !plan.setupFrom);

    expect(priced.length).toBeGreaterThanOrEqual(2);
    // Exactly one "contact us" tier: two would read as evasive pricing.
    expect(quoted).toHaveLength(1);
  });

  it("orders care plans by increasing price", () => {
    const prices = carePlans.map((plan) => plan.monthly ?? 0);
    expect([...prices].sort((a, b) => a - b)).toEqual(prices);
  });
});

describe("supporting content", () => {
  it("has enough FAQs, testimonials, steps and stats to fill their sections", () => {
    expect(faqs.length).toBeGreaterThanOrEqual(6);
    expect(testimonials.length).toBeGreaterThanOrEqual(3);
    expect(processSteps.length).toBeGreaterThanOrEqual(5);
    expect(stats).toHaveLength(4);
  });

  it("files every FAQ under a known group", () => {
    for (const faq of faqs) {
      expect(faqGroups).toContain(faq.group);
    }
    // Every group must have at least one question, or it renders as an
    // empty heading.
    for (const group of faqGroups) {
      expect(faqs.some((faq) => faq.group === group)).toBe(true);
    }
  });

  it("gives every testimonial measurable outcomes", () => {
    for (const testimonial of testimonials) {
      expect(testimonial.outcomes.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("numbers process steps in order", () => {
    processSteps.forEach((step, index) => {
      expect(step.step).toBe(String(index + 1).padStart(3, "0"));
    });
  });

  it("gives every process step pipe-separated deliverables the UI can split", () => {
    for (const step of processSteps) {
      const parts = step.deliverable.split("|").map((part) => part.trim());
      expect(parts.length).toBeGreaterThanOrEqual(1);
      for (const part of parts) expect(part.length).toBeGreaterThan(0);
    }
  });

  it("gives every FAQ a substantive answer", () => {
    for (const faq of faqs) {
      expect(faq.question.endsWith("?")).toBe(true);
      expect(faq.answer.length).toBeGreaterThan(60);
    }
  });
});
