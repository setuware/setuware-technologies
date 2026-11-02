import type { Metadata } from "next";

import { site } from "./site";

/**
 * Metadata helpers.
 *
 * One place that knows how titles, canonicals and social cards are built, so a
 * new page cannot accidentally ship without them.
 */

export interface PageMetaOptions {
  title: string;
  description: string;
  path: string;
  /** Overrides the default social card. */
  image?: string;
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
  const url = new URL(path, site.url).toString();
  // When no override is given we deliberately omit `images` so Next's
  // `opengraph-image` file convention supplies the card for every route.
  const images = image ? [{ url: image, width: 1200, height: 630, alt: title }] : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type,
      siteName: site.name,
      locale: site.locale,
      ...(images ? { images } : {}),
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

/** `site.hours` (Mon–Sat, 10:00–19:00 IST) as schema.org opening hours. */
const OFFICE_HOURS_SPEC = {
  "@type": "OpeningHoursSpecification",
  dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  opens: "10:00",
  closes: "19:00",
} as const;

/** Organisation schema, emitted once in the root layout. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${site.url}#organization`,
    name: site.name,
    url: site.url,
    email: site.email,
    telephone: site.phone,
    description: site.description,
    foundingDate: site.founded,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
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
    areaServed: ["IN", "Worldwide"],
    knowsAbout: [
      "Business website design and development",
      "E-commerce store development",
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
}

export function serviceJsonLd(options: {
  name: string;
  description: string;
  path: string;
  priceFrom: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: options.name,
    description: options.description,
    url: new URL(options.path, site.url).toString(),
    provider: { "@id": `${site.url}#organization` },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: options.priceFrom,
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: "INR",
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

export function articleJsonLd(options: {
  title: string;
  description: string;
  path: string;
  date: string;
  author: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: options.title,
    description: options.description,
    datePublished: options.date,
    dateModified: options.date,
    author: { "@type": "Person", name: options.author },
    publisher: { "@id": `${site.url}#organization` },
    mainEntityOfPage: new URL(options.path, site.url).toString(),
  };
}

export function breadcrumbJsonLd(trail: readonly { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: new URL(item.path, site.url).toString(),
    })),
  };
}
