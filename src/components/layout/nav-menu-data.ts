import { services } from "@/lib/content";
import type { IconName } from "@/lib/content";

/**
 * Header navigation.
 *
 * Flat by design: every item goes straight to its page on one click. An
 * earlier version previewed Services and Work in hover panels, which added a
 * hover target between the visitor and the page they had already decided to
 * open — the service and case-study lists live on those pages, where someone
 * looking for them is going anyway.
 */

export interface NavLink {
  label: string;
  href: string;
}

export const navLinks: readonly NavLink[] = [
  { label: "Projects", href: "/work" },
  { label: "Services", href: "/services" },
  { label: "How It Works", href: "/process" },
  { label: "About", href: "/about" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
];

export interface MobileService {
  slug: string;
  name: string;
  icon: IconName;
  accent: readonly [string, string];
}

/**
 * Service shortcuts for the mobile drawer, where there is room to list them
 * without a hover interaction.
 */
export const mobileServices: readonly MobileService[] = services.map((service) => ({
  slug: service.slug,
  name: service.name,
  icon: service.icon,
  accent: service.accent,
}));
