import type { IconName } from "@/lib/content";
import type { ServiceKey } from "@/lib/pricing";

/** Homepage service cards (copy deck wording; no prices on cards). */
export const SERVICE_CARDS: readonly {
  slug: ServiceKey;
  title: string;
  body: string;
  icon: IconName;
}[] = [
  { slug: "business-websites", title: "Business websites", icon: "globe", body: "Company websites that load fast, rank well and turn visitors into enquiries." },
  { slug: "ecommerce-stores", title: "E-commerce stores", icon: "cart", body: "Online stores with UPI and card payments, inventory and order management." },
  { slug: "web-development", title: "Web applications", icon: "code", body: "Customer portals, dashboards and SaaS products built to your requirements." },
  { slug: "app-development", title: "Mobile apps", icon: "smartphone", body: "iOS and Android apps from a single codebase, published to both stores." },
  { slug: "custom-software", title: "Custom software, ERP & CRM", icon: "boxes", body: "ERP and CRM systems that replace spreadsheets and manual reporting." },
  { slug: "ai-integration", title: "AI & automation", icon: "sparkles", body: "AI assistants and workflow automation for support, sales and operations." },
  { slug: "product-design", title: "UI/UX & branding", icon: "palette", body: "Brand identity, interface design and prototypes tested before development." },
  { slug: "seo-marketing", title: "SEO & digital marketing", icon: "megaphone", body: "Technical SEO, Google Ads and content, reported against leads and sales." },
  { slug: "managed-hosting", title: "Hosting & domains", icon: "server", body: "Managed hosting, domains and business email, monitored around the clock." },
];

export const BENEFITS = [
  { title: "Transparent pricing", body: "A detailed proposal and a fixed quote before any work begins." },
  { title: "Dedicated project manager", body: "One point of contact and regular progress updates." },
  { title: "Complete ownership", body: "Your code, domains and accounts remain yours." },
  { title: "Performance and security", body: "SSL, backups and performance checks on every release." },
  { title: "Built for search", body: "Technical SEO and analytics configured before launch." },
  { title: "Support after launch", body: "Three months of support included, with maintenance plans available." },
] as const;
