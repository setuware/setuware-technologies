/** Published plan pricing, shared by the pricing page and the hosting service page. */

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

export const projectPackages: readonly Plan[] = [
  {
    id: "website-build",
    name: "Website Build",
    tagline: "A fast company website that brings in enquiries.",
    monthly: null,
    setupFrom: 20_000,
    highlight: false,
    bestFor: "Company sites, service pages and campaign landing pages",
    features: [
      "Custom design for mobile and desktop",
      "On-page SEO, sitemap and analytics from launch",
      "Domain, SSL and go-live handled for you",
      "Copy structure and wireframes for every page",
      "3 months of support after launch",
    ],
    limits: ["WordPress or Next.js", "Typically live in 3–6 weeks"],
  },
  {
    id: "full-application-build",
    name: "Full Application Build",
    tagline: "A web or mobile app, built, launched and handed over.",
    monthly: null,
    setupFrom: 50_000,
    highlight: true,
    bestFor: "Portals, SaaS products, mobile apps and stores with logins and payments",
    features: [
      "Front end, back end and database",
      "Cloud infrastructure in your own account",
      "Admin dashboard for your team",
      "Code and repository in your name",
      "6–8 months of support after launch",
    ],
    limits: ["Two-week sprints, a demo every week"],
  },
  {
    id: "enterprise-engagement",
    name: "Enterprise Engagement",
    tagline: "Large systems, phased delivery and long-term support.",
    monthly: null,
    setupFrom: 0,
    highlight: false,
    bestFor: "ERP roll-outs, replatforming and multi-phase programmes",
    features: [
      "Architecture and technical design agreed up front",
      "Delivery phased around your release windows",
      "Data migration from your current systems",
      "Billing by milestone as each phase goes live",
      "Extended support term, agreed in the contract",
    ],
    limits: [],
  },
];

export const carePlans: readonly Plan[] = [
  {
    id: "host-essential",
    name: "Essential",
    tagline: "Hosting and upkeep for business websites",
    monthly: 8_000,
    highlight: false,
    bestFor: "Marketing sites and small web apps",
    features: [
      "Managed deploys and SSL",
      "CDN and image optimisation",
      "Nightly backups, 14-day retention",
      "Uptime checks every 5 minutes",
      "Email support, next business day",
    ],
    limits: ["Business-hours support", "99.9% uptime target"],
  },
  {
    id: "host-business",
    name: "Business",
    tagline: "For stores, portals and apps that carry revenue",
    monthly: 25_000,
    highlight: true,
    bestFor: "Commerce, portals and customer-facing apps",
    features: [
      "Everything in Essential",
      "Autoscaling, proven by a load test",
      "WAF and rate limiting",
      "Nightly backups, 30-day retention, monthly restore test",
      "24×7 monitoring with on-call escalation",
      "First response under 30 minutes",
      "Monthly health report",
    ],
    limits: ["99.95% uptime SLA"],
  },
  {
    id: "host-critical",
    name: "Critical",
    tagline: "For systems where an hour offline costs money",
    monthly: 65_000,
    highlight: false,
    bestFor: "Exam days, product launches and regulated workloads",
    features: [
      "Everything in Business",
      "Multi-region failover",
      "A named engineer and a shared incident channel",
      "Quarterly load test and DR rehearsal",
      "15-minute response, 24×7",
      "Written report after every incident",
    ],
    limits: ["99.99% uptime SLA"],
  },
];
