import { services } from "@/lib/content";
import type { IconName } from "@/lib/content";
import { industries, type IndustryIconName } from "@/lib/industries";

/**
 * Header navigation.
 *
 * Three entries open a menu (Services, Industries, Company); the rest are plain
 * links. The same data drives the desktop mega menus and the accordion
 * sections in the mobile drawer, so the two can never list different pages.
 *
 * Everything here is plain serialisable data: the root layout (a Server
 * Component) passes it to the client `Navbar`, and icons are referenced by
 * name rather than as components.
 */

export type PageIconName = "info" | "workflow" | "folder" | "users" | "newspaper" | "mail";

export type NavIcon =
  | { kind: "service"; name: IconName; accent: readonly [string, string] }
  | { kind: "industry"; name: IndustryIconName }
  | { kind: "page"; name: PageIconName };

export interface NavItem {
  label: string;
  href: string;
  /** One line under the label in the desktop menu. */
  description?: string;
  icon?: NavIcon;
}

export interface NavGroup {
  title: string;
  /** Short line under the group title. */
  caption?: string;
  items: readonly NavItem[];
}

/** A vertical column of groups in a menu panel. */
export interface NavColumn {
  groups: readonly NavGroup[];
}

/** Side panel with a call to action, shown beside the columns. */
export interface NavFeature {
  eyebrow: string;
  title: string;
  body: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
}

export interface NavMenu {
  kind: "menu";
  /** Stable id used for `aria-controls` and the open state. */
  id: string;
  label: string;
  /** The section's index page; also decides the active state. */
  href: string;
  /** `mega` spans the bar's width; `compact` is a card under its trigger. */
  layout: "mega" | "compact";
  columns: readonly NavColumn[];
  feature?: NavFeature;
  /** Link along the bottom edge of the panel, e.g. "All services". */
  footer?: { label: string; href: string; hint?: string };
}

export interface NavPlainLink {
  kind: "link";
  label: string;
  href: string;
}

export type NavEntry = NavMenu | NavPlainLink;

/* -------------------------------------------------------------------------- */
/* Services                                                                    */
/* -------------------------------------------------------------------------- */

/** Shorter labels than the service page titles, where those run long. */
const SERVICE_LABELS: Partial<Record<string, string>> = {
  "web-development": "Web applications",
  "app-development": "Mobile apps",
};

/** One-liners sized for a menu column; falls back to the service summary. */
const SERVICE_BLURBS: Partial<Record<string, string>> = {
  "business-websites": "Responsive company websites",
  "ecommerce-stores": "Online stores and marketplaces",
  "web-development": "Portals, dashboards and SaaS platforms",
  "app-development": "Cross-platform iOS and Android apps",
  "product-design": "Brand identity and interface design",
  "seo-marketing": "Search, paid media and content",
  "custom-software": "Bespoke business systems",
  "ai-integration": "Intelligent assistants and automation",
  "managed-hosting": "Managed hosting and business email",
  "support-maintenance": "Updates, security and technical support",
};

const SERVICE_GROUPS: readonly { title: string; caption: string; slugs: readonly string[] }[] = [
  {
    title: "Build",
    caption: "Digital platforms",
    slugs: ["business-websites", "ecommerce-stores", "web-development", "app-development"],
  },
  {
    title: "Grow",
    caption: "Brand and visibility",
    slugs: ["product-design", "seo-marketing"],
  },
  {
    title: "Scale",
    caption: "Systems and automation",
    slugs: ["custom-software", "ai-integration"],
  },
  {
    title: "Run",
    caption: "Hosting and support",
    slugs: ["managed-hosting", "support-maintenance"],
  },
];

function serviceItem(service: (typeof services)[number]): NavItem {
  return {
    label: SERVICE_LABELS[service.slug] ?? service.name,
    href: `/services/${service.slug}`,
    description: SERVICE_BLURBS[service.slug] ?? service.summary,
    icon: { kind: "service", name: service.icon, accent: service.accent },
  };
}

function serviceGroup(title: string, caption: string, slugs: readonly string[]): NavGroup {
  return {
    title,
    caption,
    items: slugs
      .map((slug) => services.find((service) => service.slug === slug))
      .filter((service) => service !== undefined)
      .map(serviceItem),
  };
}

const [build, grow, scale, run] = SERVICE_GROUPS.map((group) =>
  serviceGroup(group.title, group.caption, group.slugs),
);

// A service added to `content.ts` but not yet placed in a group still shows up.
const groupedSlugs = new Set(SERVICE_GROUPS.flatMap((group) => group.slugs));
const ungrouped = services.filter((service) => !groupedSlugs.has(service.slug));
const runWithExtras: NavGroup = ungrouped.length
  ? { ...run, items: [...run.items, ...ungrouped.map(serviceItem)] }
  : run;

export const servicesMenu: NavMenu = {
  kind: "menu",
  id: "services",
  label: "Services",
  href: "/services",
  layout: "mega",
  columns: [{ groups: [build] }, { groups: [grow, scale] }, { groups: [runWithExtras] }],
  feature: {
    eyebrow: "Free consultation",
    title: "Find the right service for your goals",
    body: "Book a 30-minute consultation and our team will recommend the most effective approach for your business.",
    primary: { label: "Book a consultation", href: "/contact" },
    secondary: { label: "Get an instant estimate", href: "/estimate" },
  },
  footer: {
    label: "All services",
    href: "/services",
    hint: "End-to-end digital services from one team",
  },
};

/* -------------------------------------------------------------------------- */
/* Industries                                                                  */
/* -------------------------------------------------------------------------- */

const INDUSTRY_COLUMNS: readonly { title: string; slugs: readonly string[] }[] = [
  {
    title: "Customer-facing",
    slugs: ["retail-ecommerce", "hospitality-restaurants", "healthcare-clinics"],
  },
  {
    title: "Operations-heavy",
    slugs: ["manufacturing-distribution", "logistics-transport", "real-estate-construction"],
  },
  {
    title: "Knowledge & product",
    slugs: ["education-coaching", "professional-services", "startups-saas"],
  },
];

function industryItem(industry: (typeof industries)[number]): NavItem {
  return {
    label: industry.name,
    href: `/industries/${industry.slug}`,
    description: industry.summary,
    icon: { kind: "industry", name: industry.icon },
  };
}

const placedIndustries = new Set(INDUSTRY_COLUMNS.flatMap((column) => column.slugs));

export const industriesMenu: NavMenu = {
  kind: "menu",
  id: "industries",
  label: "Industries",
  href: "/industries",
  layout: "mega",
  columns: INDUSTRY_COLUMNS.map((column, index) => ({
    groups: [
      {
        title: column.title,
        items: [
          ...column.slugs
            .map((slug) => industries.find((industry) => industry.slug === slug))
            .filter((industry) => industry !== undefined)
            .map(industryItem),
          // Unplaced industries land in the last column rather than vanishing.
          ...(index === INDUSTRY_COLUMNS.length - 1
            ? industries.filter((industry) => !placedIndustries.has(industry.slug)).map(industryItem)
            : []),
        ],
      },
    ],
  })),
  feature: {
    eyebrow: "Other sectors",
    title: "Expertise that extends across industries",
    body: "Our team builds websites and business software for organisations in many other sectors.",
    primary: { label: "Discuss your project", href: "/contact" },
    secondary: { label: "View our work", href: "/work" },
  },
  footer: {
    label: "All industries",
    href: "/industries",
    hint: "Websites and software for growing businesses across India",
  },
};

/* -------------------------------------------------------------------------- */
/* Company                                                                     */
/* -------------------------------------------------------------------------- */

export const companyMenu: NavMenu = {
  kind: "menu",
  id: "company",
  label: "Company",
  href: "/about",
  layout: "compact",
  columns: [
    {
      groups: [
        {
          title: "Company",
          items: [
            {
              label: "About us",
              href: "/about",
              description: "Our studio, mission and values",
              icon: { kind: "page", name: "info" },
            },
            {
              label: "How we work",
              href: "/process",
              description: "Our delivery process",
              icon: { kind: "page", name: "workflow" },
            },
            {
              label: "Careers",
              href: "/careers",
              description: "Open roles and applications",
              icon: { kind: "page", name: "users" },
            },
          ],
        },
      ],
    },
    {
      groups: [
        {
          title: "Resources",
          items: [
            {
              label: "Projects",
              href: "/work",
              description: "Selected case studies",
              icon: { kind: "page", name: "folder" },
            },
            {
              label: "Blog & insights",
              href: "/blog",
              description: "Articles and insights",
              icon: { kind: "page", name: "newspaper" },
            },
            {
              label: "Contact",
              href: "/contact",
              description: "Contact our team in Gurugram",
              icon: { kind: "page", name: "mail" },
            },
          ],
        },
      ],
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* The bar                                                                     */
/* -------------------------------------------------------------------------- */

export const navLinks: readonly NavEntry[] = [
  servicesMenu,
  industriesMenu,
  { kind: "link", label: "Projects", href: "/work" },
  companyMenu,
  { kind: "link", label: "Pricing", href: "/pricing" },
  { kind: "link", label: "Contact", href: "/contact" },
];

/** Every item a menu lists, flattened. */
export function menuItems(menu: NavMenu): NavItem[] {
  return menu.columns.flatMap((column) => column.groups.flatMap((group) => group.items));
}

/** Every href reachable from the header, including menu items and CTAs. */
export function allNavHrefs(entries: readonly NavEntry[] = navLinks): string[] {
  return entries.flatMap((entry) =>
    entry.kind === "link"
      ? [entry.href]
      : [
          entry.href,
          ...menuItems(entry).map((item) => item.href),
          ...(entry.footer ? [entry.footer.href] : []),
          ...(entry.feature
            ? [entry.feature.primary.href, ...(entry.feature.secondary ? [entry.feature.secondary.href] : [])]
            : []),
        ],
  );
}
