/**
 * Published plan pricing, shared by the homepage, the pricing page and the
 * hosting service page.
 */

export interface Plan {
  id: string;
  name: string;
  tagline: string;
  /** Monthly price in INR; `null` means "quoted per project". */
  monthly: number | null;
  setupFrom?: number;
  highlight: boolean;
  bestFor: string;
  features: readonly string[];
  limits: readonly string[];
}

/** Cheapest published build package: a single-page site. */
export const LANDING_PAGE_FROM = 4_999;
/** The full business website package. The estimator's business-websites base matches it. */
export const WEBSITE_FROM = 14_999;

export const projectPackages: readonly Plan[] = [
  {
    id: "landing-page",
    name: "Landing Page",
    tagline: "A focused single page to launch a campaign or product.",
    monthly: null,
    setupFrom: LANDING_PAGE_FROM,
    highlight: false,
    bestFor: "New businesses, single offers and ad campaigns",
    features: [
      "Hero, services and enquiry form on one page",
      "WhatsApp and call buttons",
      "Mobile-first responsive design",
      "Essential SEO, meta tags and sitemap",
      "3 months of support after launch",
    ],
    limits: ["Single page", "Typically live within a week"],
  },
  {
    id: "website-build",
    name: "Website Build",
    tagline: "A complete multi-page website for your company.",
    monthly: null,
    setupFrom: WEBSITE_FROM,
    highlight: false,
    bestFor: "Company websites with multiple service, product or location pages",
    features: [
      "Custom design for mobile and desktop",
      "On-page SEO, sitemap and analytics from launch",
      "Domain, SSL and go-live management",
      "Content structure and wireframes for every page",
      "3 months of support after launch",
    ],
    limits: ["WordPress or Next.js", "Typically live in 3–6 weeks"],
  },
  {
    id: "full-application-build",
    name: "Full Application Build",
    tagline: "Web apps, portals and mobile apps.",
    monthly: null,
    setupFrom: 9_999,
    highlight: true,
    bestFor: "Portals, SaaS products and mobile apps with accounts and payments",
    features: [
      "Front end, back end and database",
      "Scalable cloud infrastructure",
      "Admin dashboard for your team",
      "Source code and technical documentation",
      "6–8 months of support after launch",
    ],
    limits: ["Two-week sprints with weekly demos"],
  },
  {
    id: "enterprise-engagement",
    name: "Enterprise Engagement",
    tagline: "ERP, CRM and large-scale platforms.",
    monthly: null,
    setupFrom: 0,
    highlight: false,
    bestFor: "ERP roll-outs, replatforming and multi-phase programmes",
    features: [
      "Architecture and technical design agreed in advance",
      "Delivery phased around your release windows",
      "Data migration from your current systems",
      "Milestone billing as each phase goes live",
      "Extended support term set out in the contract",
    ],
    limits: [],
  },
];

export const carePlans: readonly Plan[] = [
  {
    id: "host-essential",
    name: "Essential",
    tagline: "Hosting and maintenance for business websites",
    monthly: 1_999,
    highlight: false,
    bestFor: "Marketing sites and small web apps",
    features: [
      "Managed deployments and SSL",
      "CDN and image optimisation",
      "Nightly backups, 14-day retention",
      "Uptime checks every five minutes",
      "Email support by the next business day",
    ],
    limits: ["Business-hours support", "99.9% uptime target"],
  },
  {
    id: "host-business",
    name: "Business",
    tagline: "For revenue-generating stores, portals and apps",
    monthly: 4_999,
    highlight: true,
    bestFor: "Commerce, portals and customer-facing apps",
    features: [
      "Everything in Essential",
      "Autoscaling validated by load testing",
      "Web application firewall and rate limiting",
      "Nightly backups, 30-day retention, monthly restore test",
      "24×7 monitoring with on-call escalation",
      "First response within 30 minutes",
      "Monthly health report",
    ],
    limits: ["99.95% uptime SLA"],
  },
  {
    id: "host-critical",
    name: "Critical",
    tagline: "For mission-critical systems that require maximum availability",
    monthly: 14_999,
    highlight: false,
    bestFor: "High-traffic events, product launches and regulated workloads",
    features: [
      "Everything in Business",
      "Multi-region failover",
      "A dedicated engineer and shared incident channel",
      "Quarterly load testing and disaster recovery drills",
      "15-minute response, 24×7",
      "Written report after every incident",
    ],
    limits: ["99.99% uptime SLA"],
  },
];
