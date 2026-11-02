import type { Metadata } from "next";

import { site } from "./site";
import { founder } from "./team";

/**
 * Metadata helpers.
 *
 * One place that knows how titles, canonicals and social cards are built, so a
 * new page cannot accidentally ship without them.
 */

/** Google truncates titles at roughly 60 characters. */
export const MAX_TITLE_LENGTH = 60;

/** Brand suffix used when the full company name would push a title past 60. */
export const SHORT_BRAND = "Setuware";

/** Stable node ids, so every page's structured data points at the same entities. */
export const ORGANIZATION_ID = `${site.url}/#organization`;
export const WEBSITE_ID = `${site.url}/#website`;

const absolute = (path: string) => new URL(path, site.url).toString();

/**
 * The site-wide social card (`app/opengraph-image.tsx`). Child segments that
 * set `openGraph` replace the root's object wholesale (metadata merges are
 * shallow), so every page names the card explicitly instead of relying on
 * inheritance.
 */
export const DEFAULT_OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  type: "image/png",
  alt: `${site.name} — website, app and software development in Gurugram`,
} as const;

/** Home page title and description; also the site-wide defaults. */
export const HOME_KEYWORD_TITLE = "Website Development Company in Gurugram";
export const HOME_TITLE = fitTitle(HOME_KEYWORD_TITLE);
export const HOME_DESCRIPTION =
  "Setuware Technologies is a website development company in Gurugram building business websites, e-commerce stores, mobile apps and custom software in India.";

/** Square brand mark (`app/apple-icon.tsx`), used as the schema.org logo. */
export const LOGO_URL = absolute("/apple-icon");

/**
 * Appends the brand to a page title while keeping it inside 60 characters:
 * the full company name when it fits, the short brand when that fits, and
 * otherwise the title trimmed at a word boundary.
 */
export function fitTitle(title: string): string {
  const full = `${title} | ${site.name}`;
  if (full.length <= MAX_TITLE_LENGTH) return full;

  const short = `${title} | ${SHORT_BRAND}`;
  if (short.length <= MAX_TITLE_LENGTH) return short;

  const room = MAX_TITLE_LENGTH - ` | ${SHORT_BRAND}`.length - 1;
  const cut = title.slice(0, room);
  const trimmed = cut.slice(0, Math.max(cut.lastIndexOf(" "), 1)).replace(/[\s,:;–—-]+$/, "");
  return `${trimmed}… | ${SHORT_BRAND}`;
}

export interface PageMetaOptions {
  /** Page-specific part of the title; the brand is appended by `fitTitle`. */
  title: string;
  description: string;
  path: string;
  /** Overrides the default social card (a path or absolute URL plus its size). */
  image?: { url: string; width: number; height: number; alt: string };
  type?: "website" | "article";
  publishedTime?: string;
  noIndex?: boolean;
}

export function pageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  publishedTime,
  noIndex = false,
}: PageMetaOptions): Metadata {
  const url = absolute(path);
  const fullTitle = fitTitle(title);
  const ogImage = image ?? DEFAULT_OG_IMAGE;

  return {
    // `absolute` so the root layout's template cannot push it past 60.
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      type,
      siteName: site.name,
      locale: site.locale,
      images: [ogImage],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage.url],
    },
    // Links on a noindex page still lead somewhere useful, so keep `follow`.
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}

/**
 * Founder's public profiles, as confirmed by the owner. Inlined here because
 * `team.ts` does not carry GitHub or X links; move them there if it grows them.
 */
const FOUNDER_PROFILES = [
  "https://www.linkedin.com/in/satyamraj1/",
  "https://github.com/stymrj",
  "https://x.com/ersatyamraj",
] as const;

/** `site.hours` (Mon–Sat, 10:00–19:00 IST) as schema.org opening hours. */
const OFFICE_HOURS_SPEC = {
  "@type": "OpeningHoursSpecification",
  dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  opens: "10:00",
  closes: "19:00",
} as const;

const POSTAL_ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: site.address.street,
  addressLocality: site.address.city,
  addressRegion: site.address.region,
  postalCode: site.address.postalCode,
  addressCountry: site.address.country,
} as const;

/**
 * Site-wide structured data, emitted once in the root layout.
 *
 * One graph, two nodes: the business itself — a `ProfessionalService`, which
 * schema.org defines as both an `Organization` and a `LocalBusiness`, so a
 * single entity carries the logo, NAP, map position and opening hours — and
 * the `WebSite` it publishes. There is no URL-addressable site search, so the
 * WebSite node deliberately has no `SearchAction`.
 */
export function organizationJsonLd() {
  const organization = {
    "@type": "ProfessionalService",
    "@id": ORGANIZATION_ID,
    name: site.name,
    alternateName: SHORT_BRAND,
    url: site.url,
    logo: { "@type": "ImageObject", url: LOGO_URL, width: 180, height: 180 },
    image: absolute(DEFAULT_OG_IMAGE.url),
    email: site.email,
    telephone: site.phone,
    description: site.description,
    foundingDate: site.founded,
    founder: {
      "@type": "Person",
      "@id": `${site.url}/#founder`,
      name: founder.name,
      jobTitle: "Founder",
      email: founder.email,
      url: absolute("/about"),
      sameAs: [...FOUNDER_PROFILES],
      worksFor: { "@id": ORGANIZATION_ID },
    },
    priceRange: "₹₹",
    currenciesAccepted: "INR",
    address: POSTAL_ADDRESS,
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.geo.latitude,
      longitude: site.geo.longitude,
    },
    hasMap: `https://www.google.com/maps/search/?api=1&query=${site.geo.latitude},${site.geo.longitude}`,
    openingHoursSpecification: [OFFICE_HOURS_SPEC],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        email: site.salesEmail,
        telephone: site.phone,
        areaServed: "IN",
        availableLanguage: ["English", "Hindi"],
        hoursAvailable: OFFICE_HOURS_SPEC,
      },
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: site.supportEmail,
        telephone: site.phone,
        areaServed: "IN",
        availableLanguage: ["English", "Hindi"],
        hoursAvailable: OFFICE_HOURS_SPEC,
      },
    ],
    sameAs: Object.values(site.social),
    areaServed: { "@type": "Country", name: "India" },
    knowsAbout: [
      "Business website design and development",
      "E-commerce website development",
      "Web application development",
      "Mobile app development",
      "UI/UX design and branding",
      "SEO and digital marketing",
      "Custom software, ERP and CRM",
      "AI and automation",
      "Website hosting and domains",
      "Website maintenance and support",
    ],
  };

  const website = {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: site.url,
    name: site.name,
    description: site.description,
    inLanguage: "en-IN",
    publisher: { "@id": ORGANIZATION_ID },
  };

  return {
    "@context": "https://schema.org",
    "@graph": [organization, website] as const,
  };
}

export function serviceJsonLd(options: {
  name: string;
  description: string;
  path: string;
  priceFrom: number;
}) {
  const url = absolute(options.path);

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name: options.name,
    serviceType: options.name,
    description: options.description,
    url,
    image: absolute(DEFAULT_OG_IMAGE.url),
    provider: { "@id": ORGANIZATION_ID },
    areaServed: { "@type": "Country", name: "India" },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "INR",
      price: options.priceFrom,
      availability: "https://schema.org/InStock",
      seller: { "@id": ORGANIZATION_ID },
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: "INR",
        price: options.priceFrom,
        minPrice: options.priceFrom,
      },
    },
  };
}

export function faqJsonLd(items: readonly { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/**
 * BlogPosting for an article. The author is the person in the visible byline
 * (Google matches the two), credited as working for the organisation, which
 * is also the publisher.
 */
export function articleJsonLd(options: {
  title: string;
  description: string;
  path: string;
  date: string;
  author: string;
  image?: string;
}) {
  const url = absolute(options.path);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: options.title,
    description: options.description,
    image: [absolute(options.image ?? DEFAULT_OG_IMAGE.url)],
    datePublished: options.date,
    dateModified: options.date,
    inLanguage: "en-IN",
    author: {
      "@type": "Person",
      name: options.author,
      worksFor: { "@id": ORGANIZATION_ID },
    },
    publisher: { "@id": ORGANIZATION_ID },
    isPartOf: { "@id": WEBSITE_ID },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
}

/** BreadcrumbList for an inner page. "Home" is prepended automatically. */
export function breadcrumbJsonLd(trail: readonly { name: string; path: string }[]) {
  const items = trail[0]?.path === "/" ? trail : [{ name: "Home", path: "/" }, ...trail];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absolute(item.path),
    })),
  };
}
