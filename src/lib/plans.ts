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
    tagline: "A fast, SEO-ready website for your business.",
    monthly: null,
    setupFrom: 20_000,
    highlight: false,
    bestFor: "Company sites, landing pages and marketing sites",
    features: [
      "Responsive design for mobile and desktop",
      "SEO-ready structure and metadata",
      "Deployment and domain setup included",
      "3 months of support after launch",
      "Pause or cancel any time",
    ],
    limits: ["Single platform", "Standard timeline"],
  },
  {
    id: "full-application-build",
    name: "Full Application Build",
    tagline: "A complete web or mobile app, built and deployed.",
    monthly: null,
    setupFrom: 50_000,
    highlight: true,
    bestFor: "Web apps, mobile apps and stores with accounts and payments",
    features: [
      "Frontend, backend and database",
      "Cloud infrastructure in your own account",
      "Admin dashboard for your team",
      "6–8 months of support after launch",
      "Pause or cancel any time",
    ],
    limits: ["Two-week sprints, weekly demos"],
  },
  {
    id: "enterprise-engagement",
    name: "Enterprise Engagement",
    tagline: "Large systems, several teams, long-term support.",
    monthly: null,
    setupFrom: 0,
    highlight: false,
    bestFor: "Replatforming programmes and multi-team delivery",
    features: [
      "System architecture and technical design up front",
      "Custom design work on request",
      "SEO-ready structure for public-facing pages",
      "Timeline planned around your release windows",
      "Milestone-based billing",
      "Extended support term",
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
      "Managed deploys and TLS",
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
    tagline: "For applications that carry revenue",
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
    tagline: "For when an hour of downtime costs real money",
    monthly: 65_000,
    highlight: false,
    bestFor: "Exam days, launches, regulated workloads",
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
