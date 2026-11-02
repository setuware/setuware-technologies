/** Single source of truth for brand, contact and navigation data. */

export const site = {
  name: "Setuware Technologies",
  shortName: "Setuware Technologies",
  tagline: "Websites that bring in enquiries",
  description:
    "Business websites, online stores, apps and custom software from a Gurugram team. A fixed quote in writing, weekly previews, and you own the code.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://setuwaresoftware.in",
  locale: "en_IN",
  email: "sales@setuware.in",
  salesEmail: "sales@setuware.in",
  phone: "+91 83027 83900",
  phoneHref: "tel:+918302783900",
  whatsapp: "https://wa.me/918302783900",
  address: {
    street: "MG Road",
    city: "Gurugram",
    region: "Haryana",
    postalCode: "122001",
    country: "IN",
  },
  founded: "2020",
  social: {
    linkedin: "https://www.linkedin.com/company/setuware-technologies/",
    github: "https://github.com/setuware",
    x: "https://x.com/setuware",
    instagram: "https://instagram.com/setuware",
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
