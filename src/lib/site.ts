/** Single source of truth for brand, contact and navigation data. */

export const site = {
  name: "Setuware Technologies",
  shortName: "Setuware Technologies",
  tagline: "Websites, apps and custom software",
  /** Company slogan: the homepage title in Google and the LinkedIn tagline. */
  slogan: "We act as a bridge between your business idea and a working digital product.",
  description:
    "We act as a bridge between your business idea and a working digital product: websites, e-commerce platforms, mobile apps and custom software for growing businesses.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://setuware.in",
  /** Admin and employee portal: sign-in and dashboards only, no website pages. */
  portalUrl: process.env.NEXT_PUBLIC_PORTAL_URL ?? "https://core.setuware.in",
  locale: "en_IN",
  /** Primary address on CTAs: new projects and quotes. */
  email: "sales@setuware.in",
  salesEmail: "sales@setuware.in",
  /** Existing clients: bugs, changes, hosting and care plans. */
  supportEmail: "support@setuware.in",
  /** Partnerships, press and anything that isn't sales or support. */
  generalEmail: "satyam.raj@setuware.in",
  /** Job applications. */
  hrEmail: "hr@setuware.in",
  hours: "Mon–Sat, 10:00–19:00 IST",
  phone: "+91 70912 98828",
  phoneHref: "tel:+917091298828",
  whatsapp: "https://wa.me/917091298828",
  address: {
    street: "MG Road",
    city: "Gurugram",
    region: "Haryana",
    postalCode: "122001",
    country: "IN",
  },
  /** Approximate map position of the MG Road, Gurugram office (structured data). */
  geo: { latitude: 28.4795, longitude: 77.0806 },
  founded: "2026-08-04",
  /** Company profiles (confirmed by the owner). Founder links live in src/lib/team.ts. */
  social: {
    linkedin: "https://www.linkedin.com/company/setuware-technologies/",
    github: "https://github.com/setuware",
  },
  /** Used by the SLA strip and hosting pages. */
  sla: {
    uptime: "99.95%",
    firstResponse: "under 30 min",
    support: "24 × 7",
  },
} as const;

/**
 * Top-level pages, as listed by the command menu. The header's menus are built
 * from `components/layout/nav-menu-data.ts`.
 */
export const mainNav = [
  { label: "Projects", href: "/work" },
  { label: "Services", href: "/services" },
  { label: "Industries", href: "/industries" },
  { label: "How It Works", href: "/process" },
  { label: "About", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Blog & insights", href: "/blog" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
] as const;

export const footerNav = [
  {
    title: "Explore",
    links: [
      { label: "Home", href: "/" },
      { label: "All Services", href: "/services" },
      { label: "Industries", href: "/industries" },
      { label: "Projects", href: "/work" },
      { label: "How It Works", href: "/process" },
      { label: "Pricing", href: "/pricing" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Articles & insights", href: "/blog" },
      { label: "Testimonials", href: "/#testimonials" },
      { label: "FAQs", href: "/#faq" },
      { label: "Service status", href: "/status" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Instant quote", href: "/estimate" },
    ],
  },
] as const;
