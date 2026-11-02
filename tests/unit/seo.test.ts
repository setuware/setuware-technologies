import { describe, expect, it } from "vitest";

import {
  articleJsonLd,
  breadcrumbJsonLd,
  DEFAULT_OG_IMAGE,
  faqJsonLd,
  fitTitle,
  HOME_DESCRIPTION,
  HOME_TITLE,
  MAX_TITLE_LENGTH,
  ORGANIZATION_ID,
  organizationJsonLd,
  pageMetadata,
  serviceJsonLd,
} from "@/lib/seo";
import { caseStudies, faqs, services } from "@/lib/content";
import { industries } from "@/lib/industries";
import { jobMetaDescription, jobMetaTitle, jobs } from "@/lib/careers";
import { posts } from "@/lib/posts";
import { site } from "@/lib/site";

/** Every value in a JSON-LD tree, so tests can assert none is missing. */
function leaves(value: unknown): unknown[] {
  if (Array.isArray(value)) return value.flatMap(leaves);
  if (value && typeof value === "object") return Object.values(value).flatMap(leaves);
  return [value];
}

describe("fitTitle", () => {
  it("keeps the full brand when it fits", () => {
    expect(fitTitle("Pricing")).toBe("Pricing | Setuware Technologies");
  });

  it("falls back to the short brand, then trims, never exceeding 60", () => {
    expect(fitTitle("Website Development Company in Gurugram")).toBe(
      "Website Development Company in Gurugram | Setuware",
    );
    const long = fitTitle(
      "A very long article title that goes on well past what a search result can show",
    );
    expect(long.length).toBeLessThanOrEqual(MAX_TITLE_LENGTH);
    expect(long).toMatch(/… \| Setuware$/);
  });
});

describe("pageMetadata", () => {
  it("builds an absolute canonical URL from a relative path", () => {
    const meta = pageMetadata({ title: "Pricing", description: "Plans", path: "/pricing" });

    expect(meta.alternates?.canonical).toBe(`${site.url}/pricing`);
    expect(meta.openGraph?.url).toBe(`${site.url}/pricing`);
    expect(meta.title).toEqual({ absolute: "Pricing | Setuware Technologies" });
  });

  it("names the site-wide social card explicitly, for Open Graph and Twitter", () => {
    const meta = pageMetadata({ title: "A", description: "B", path: "/a" });
    expect(meta.openGraph?.images).toEqual([DEFAULT_OG_IMAGE]);
    expect(meta.twitter).toMatchObject({ card: "summary_large_image", images: ["/opengraph-image"] });
    expect(meta.openGraph).toMatchObject({ locale: "en_IN", siteName: site.name });
  });

  it("uses an explicit image when one is given", () => {
    const image = { url: "/custom.jpg", width: 1200, height: 800, alt: "Alt" };
    const meta = pageMetadata({ title: "A", description: "B", path: "/a", image });

    expect(meta.openGraph?.images).toEqual([image]);
  });

  it("marks a page noindex only when asked, keeping links followable", () => {
    expect(pageMetadata({ title: "A", description: "B", path: "/a" }).robots).toBeUndefined();
    expect(
      pageMetadata({ title: "A", description: "B", path: "/a", noIndex: true }).robots,
    ).toEqual({ index: false, follow: true });
  });

  it("carries a published time for articles", () => {
    const meta = pageMetadata({
      title: "Post",
      description: "B",
      path: "/blog/x",
      type: "article",
      publishedTime: "2026-01-01",
    });

    expect(meta.openGraph).toMatchObject({ type: "article", publishedTime: "2026-01-01" });
  });
});

describe("content SEO fields stay inside search-snippet limits", () => {
  const pages = [
    { path: "/", title: HOME_TITLE, description: HOME_DESCRIPTION },
    ...services.map((s) => ({
      path: s.slug,
      title: fitTitle(s.seoTitle ?? s.name),
      description: s.seoDescription ?? s.description,
    })),
    ...industries.map((i) => ({
      path: i.slug,
      title: fitTitle(i.seoTitle),
      description: i.seoDescription,
    })),
    ...caseStudies.map((c) => ({
      path: c.slug,
      title: fitTitle(c.seoTitle ?? c.title),
      description: c.seoDescription ?? c.summary,
    })),
    ...posts.map((p) => ({
      path: p.slug,
      title: fitTitle(p.seoTitle ?? p.title),
      description: p.seoDescription ?? p.excerpt,
    })),
    ...jobs.map((j) => ({
      path: j.slug,
      title: fitTitle(jobMetaTitle(j)),
      description: jobMetaDescription(j),
    })),
  ];

  it.each(pages)("$path", ({ title, description }) => {
    expect(title.length).toBeLessThanOrEqual(MAX_TITLE_LENGTH);
    expect(title).not.toMatch(/…/);
    expect(description.length).toBeGreaterThanOrEqual(100);
    expect(description.length).toBeLessThanOrEqual(160);
  });
});

describe("structured data", () => {
  const [organization, website] = organizationJsonLd()["@graph"];

  it("describes the business once, as a local professional service with a stable @id", () => {
    expect(organization["@type"]).toBe("ProfessionalService");
    expect(organization["@id"]).toBe(ORGANIZATION_ID);
    expect(organization.sameAs).toEqual(Object.values(site.social));
    expect(website).toMatchObject({ "@type": "WebSite", publisher: { "@id": ORGANIZATION_ID } });
    expect(website).not.toHaveProperty("potentialAction");
  });

  it("carries NAP, map position, hours and price range for local search", () => {
    expect(organization.address).toMatchObject({
      addressLocality: "Gurugram",
      addressRegion: "Haryana",
      postalCode: "122001",
      addressCountry: "IN",
    });
    expect(organization.telephone).toBe(site.phone);
    expect(organization.geo).toMatchObject({ latitude: 28.4795, longitude: 77.0806 });
    expect(organization.openingHoursSpecification[0]).toMatchObject({ opens: "10:00", closes: "19:00" });
    expect(organization.priceRange).toBe("₹₹");
  });

  it("names the founder with his public profiles", () => {
    expect(organization.founder).toMatchObject({
      "@type": "Person",
      name: "Satyam Raj",
      jobTitle: "Founder",
      email: "satyam.raj@setuware.in",
    });
    expect(organization.founder.sameAs).toHaveLength(3);
  });

  it("lists separate sales and customer support contact points", () => {
    const points = organization.contactPoint;

    expect(points.find((point) => point.contactType === "sales")?.email).toBe(site.salesEmail);
    expect(points.find((point) => point.contactType === "customer support")?.email).toBe(
      site.supportEmail,
    );
  });

  it("has no undefined or null values anywhere in the site graph", () => {
    const values = leaves(organizationJsonLd());
    expect(values).not.toContain(undefined);
    expect(values).not.toContain(null);
  });

  it("links a service offer back to the organisation, priced in INR", () => {
    const data = serviceJsonLd({
      name: "Web development",
      description: "x",
      path: "/services/web-development",
      priceFrom: 120_000,
    });

    expect(data.provider).toEqual({ "@id": ORGANIZATION_ID });
    expect(data.offers).toMatchObject({ priceCurrency: "INR", price: 120_000 });
    expect(data.offers.priceSpecification).toMatchObject({ priceCurrency: "INR", minPrice: 120_000 });
    expect(data.url).toBe(`${site.url}/services/web-development`);
  });

  it("emits one FAQPage entity per question", () => {
    const data = faqJsonLd(faqs);
    expect(data.mainEntity).toHaveLength(faqs.length);
    expect(data.mainEntity[0]).toMatchObject({ "@type": "Question" });
  });

  it("starts every breadcrumb trail at Home and numbers positions from one", () => {
    const data = breadcrumbJsonLd([
      { name: "Work", path: "/work" },
      { name: "Vanik", path: "/work/kirana-commerce-platform" },
    ]);

    expect(data.itemListElement.map((item) => item.position)).toEqual([1, 2, 3]);
    expect(data.itemListElement[0]).toMatchObject({ name: "Home", item: `${site.url}/` });
    expect(data.itemListElement[2].item).toBe(`${site.url}/work/kirana-commerce-platform`);
  });

  it("produces article data with author, publisher, image and dates", () => {
    const data = articleJsonLd({
      title: "T",
      description: "D",
      path: "/blog/t",
      date: "2026-09-18",
      author: "Harsh Jain",
      image: "/images/blog/t.jpg",
    });

    expect(data).toMatchObject({
      "@type": "BlogPosting",
      headline: "T",
      datePublished: "2026-09-18",
      author: { "@type": "Person", name: "Harsh Jain", worksFor: { "@id": ORGANIZATION_ID } },
      publisher: { "@id": ORGANIZATION_ID },
      image: [`${site.url}/images/blog/t.jpg`],
    });
  });
});
