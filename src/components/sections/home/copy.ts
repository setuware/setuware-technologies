import type { IconName } from "@/lib/content";
import type { ServiceKey } from "@/lib/pricing";

/** Homepage service cards (copy deck wording; no prices on cards). */
export const SERVICE_CARDS: readonly {
  slug: ServiceKey;
  title: string;
  body: string;
  icon: IconName;
}[] = [
  { slug: "business-websites", title: "Business websites", icon: "globe", body: "Fast, responsive company websites that build credibility and generate qualified leads." },
  { slug: "ecommerce-stores", title: "E-commerce stores", icon: "cart", body: "Scalable online stores with secure payments, inventory and order management." },
  { slug: "web-development", title: "Web applications", icon: "code", body: "Custom portals, dashboards and SaaS platforms engineered for scale." },
  { slug: "app-development", title: "Mobile apps", icon: "smartphone", body: "High-performance iOS and Android apps built on modern cross-platform frameworks." },
  { slug: "custom-software", title: "Custom software, ERP & CRM", icon: "boxes", body: "Bespoke business systems that streamline operations and reporting." },
  { slug: "ai-integration", title: "AI & automation", icon: "sparkles", body: "Intelligent assistants and workflow automation that improve efficiency." },
  { slug: "product-design", title: "UI/UX & branding", icon: "palette", body: "Brand identities and user experiences that are clear, consistent and memorable." },
  { slug: "seo-marketing", title: "SEO & digital marketing", icon: "megaphone", body: "Search, paid media and content strategies focused on measurable growth." },
  { slug: "managed-hosting", title: "Hosting & domains", icon: "server", body: "Secure managed hosting, domains and business email with proactive monitoring." },
];

export const BENEFITS = [
  { title: "Transparent pricing", body: "A detailed proposal and a fixed quote before any work begins." },
  { title: "Dedicated project manager", body: "One point of contact and regular progress updates." },
  { title: "Complete ownership", body: "Your code, domains and accounts remain yours." },
  { title: "Performance and security", body: "Fast, secure builds that follow industry best practices." },
  { title: "Built for search", body: "Technical SEO and analytics configured before launch." },
  { title: "Support after launch", body: "Three months of support included, with maintenance plans available." },
] as const;

export const PROCESS_PHOTOS = [
  "/images/team/client-meeting.jpg",
  "/images/photos/case-study-feature.jpg",
  "/images/services/product-design.jpg",
  "/images/services/web-development.jpg",
  "/images/photos/service-cloud.jpg",
  "/images/services/support-maintenance.jpg",
] as const;
