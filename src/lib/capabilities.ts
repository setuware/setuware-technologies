import type { ServiceKey } from "./pricing";

/**
 * The capability ticker under the hero.
 *
 * Every service we sell, each linking to the service page that covers it.
 * Targets are typed as service slugs, so a renamed or removed service fails
 * the type check instead of leaving a dead link in the band.
 */
const items: readonly { label: string; service: ServiceKey }[] = [
  { label: "Business websites", service: "business-websites" },
  { label: "E-commerce", service: "ecommerce-stores" },
  { label: "Web applications", service: "web-development" },
  { label: "Mobile apps", service: "app-development" },
  { label: "UI/UX & branding", service: "product-design" },
  { label: "SEO & digital marketing", service: "seo-marketing" },
  { label: "Custom software & ERP", service: "custom-software" },
  { label: "AI & automation", service: "ai-integration" },
  { label: "Cloud hosting", service: "managed-hosting" },
  { label: "Maintenance & support", service: "support-maintenance" },
];

export const capabilities: readonly { label: string; href: string }[] = items.map(
  ({ label, service }) => ({ label, href: `/services/${service}` }),
);
