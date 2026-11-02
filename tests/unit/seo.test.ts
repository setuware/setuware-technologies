import { describe, expect, it } from "vitest";

import {
  articleJsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
  organizationJsonLd,
  pageMetadata,
  serviceJsonLd,
} from "@/lib/seo";
import { faqs } from "@/lib/content";
import { site } from "@/lib/site";

describe("pageMetadata", () => {
  it("builds an absolute canonical URL from a relative path", () => {
    const meta = pageMetadata({
      title: "Pricing",
      description: "Plans",
      path: "/pricing",
    });

    expect(meta.alternates?.canonical).toBe(`${site.url}/pricing`);
    expect(meta.openGraph?.url).toBe(`${site.url}/pricing`);
  });

  it("omits images so the opengraph-image convention supplies the card", () => {
    const meta = pageMetadata({ title: "A", description: "B", path: "/a" });
    expect(meta.openGraph && "images" in meta.openGraph).toBe(false);
  });

  it("uses an explicit image when one is given", () => {
    const meta = pageMetadata({
      title: "A",
      description: "B",
      path: "/a",
      image: "/custom.png",
    });

    expect(meta.openGraph?.images).toEqual([
      { url: "/custom.png", width: 1200, height: 630, alt: "A" },
    ]);
  });

  it("marks a page noindex only when asked", () => {
    expect(pageMetadata({ title: "A", description: "B", path: "/a" }).robots).toBeUndefined();
    expect(
      pageMetadata({ title: "A", description: "B", path: "/a", noIndex: true }).robots,
    ).toEqual({ index: false, follow: false });
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

describe("structured data", () => {
  it("describes the organisation with a stable @id", () => {
    const data = organizationJsonLd();

    expect(data["@type"]).toBe("ProfessionalService");
    expect(data["@id"]).toBe(`${site.url}#organization`);
    expect(data.sameAs).toContain(site.social.linkedin);
  });

  it("lists separate sales and customer support contact points", () => {
    const points = organizationJsonLd().contactPoint;

    expect(points.find((point) => point.contactType === "sales")?.email).toBe(site.salesEmail);
    expect(points.find((point) => point.contactType === "customer support")?.email).toBe(
      site.supportEmail,
    );
  });

  it("links a service offer back to the organisation", () => {
    const data = serviceJsonLd({
      name: "Web development",
      description: "x",
      path: "/services/web-development",
      priceFrom: 120_000,
    });

    expect(data.provider).toEqual({ "@id": `${site.url}#organization` });
    expect(data.offers.priceCurrency).toBe("INR");
    expect(data.url).toBe(`${site.url}/services/web-development`);
  });

  it("emits one FAQPage entity per question", () => {
    const data = faqJsonLd(faqs);
    expect(data.mainEntity).toHaveLength(faqs.length);
    expect(data.mainEntity[0]).toMatchObject({ "@type": "Question" });
  });

  it("numbers breadcrumb positions from one", () => {
    const data = breadcrumbJsonLd([
      { name: "Work", path: "/work" },
      { name: "Vanik", path: "/work/kirana-commerce-platform" },
    ]);

    expect(data.itemListElement.map((item) => item.position)).toEqual([1, 2]);
    expect(data.itemListElement[1].item).toBe(
      `${site.url}/work/kirana-commerce-platform`,
    );
  });

  it("produces article data with author and dates", () => {
    const data = articleJsonLd({
      title: "T",
      description: "D",
      path: "/blog/t",
      date: "2026-09-18",
      author: "Harsh Jain",
    });

    expect(data).toMatchObject({
      "@type": "BlogPosting",
      headline: "T",
      datePublished: "2026-09-18",
      author: { "@type": "Person", name: "Harsh Jain" },
    });
  });

  it("serialises to JSON without throwing", () => {
    expect(() => JSON.stringify(organizationJsonLd())).not.toThrow();
  });
});
