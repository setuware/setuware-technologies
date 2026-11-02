import type { ServiceKey } from "./pricing";

/**
 * The capability ticker under the hero.
 *
 * Every service we sell, plus the platforms people search for by name
 * (WordPress, Shopify), each linking to the service page that covers it.
 * Targets are typed as service slugs, so a renamed or removed service fails
 * the type check instead of leaving a dead link in the band.
 */
const items: readonly { label: string; service: ServiceKey }[] = [
  { label: "Business websites", service: "business-websites" },
  { label: "E-commerce stores", service: "ecommerce-stores" },
  { label: "Web applications", service: "web-development" },
  { label: "Mobile apps", service: "app-development" },
  { label: "UI/UX & branding", service: "product-design" },
  { label: "SEO & digital marketing", service: "seo-marketing" },
  { label: "Custom software & ERP", service: "custom-software" },
  { label: "AI & automation", service: "ai-integration" },
  { label: "Hosting & domains", service: "managed-hosting" },
  { label: "Maintenance & support", service: "support-maintenance" },
  { label: "WordPress", service: "business-websites" },
  { label: "Shopify", service: "ecommerce-stores" },
  { label: "WooCommerce", service: "ecommerce-stores" },
  { label: "Landing pages", service: "business-websites" },
  { label: "Google Ads", service: "seo-marketing" },
  { label: "CRM systems", service: "custom-software" },
];

export const capabilities: readonly { label: string; href: string }[] = items.map(
  ({ label, service }) => ({ label, href: `/services/${service}` }),
);
