/**
 * The capability ticker under the hero.
 *
 * Separate from `services` because these are the eight things we say we do,
 * while `services` are the six we have dedicated pages and pricing for. The
 * ticker links each capability to the service page that covers it.
 */
export const capabilities: readonly { label: string; href: string }[] = [
  { label: "Website development", href: "/services/web-development" },
  { label: "Web application development", href: "/services/web-development" },
  { label: "SaaS product development", href: "/services/web-development" },
  { label: "API & backend development", href: "/services/web-development" },
  { label: "Cloud & DevOps", href: "/services/managed-hosting" },
  { label: "Automation", href: "/services/ai-integration" },
  { label: "MVP development", href: "/services/app-development" },
  { label: "Maintenance and tech support", href: "/services/support-maintenance" },
];
