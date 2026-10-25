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
    tagline: "Neat, SEO-ready business website.",
    monthly: null,
    setupFrom: 20_000,
    highlight: false,
    bestFor: "Marketing sites and brochure builds",
    features: [
      "Responsive design",
      "SEO-ready structure",
      "Deployment included",
      "3 months support",
      "Pause or cancel anytime",
    ],
    limits: ["Single platform", "Standard timeline"],
  },
  {
    id: "full-application-build",
    name: "Full Application Build",
    tagline: "Complete web or mobile app.",
    monthly: null,
    setupFrom: 50_000,
    highlight: true,
    bestFor: "Products with accounts, payments and an admin side",
    features: [
      "Full-stack development",
      "Cloud infrastructure",
      "Admin dashboard",
      "6 – 8 months support",
      "Pause or cancel any time",
    ],
    limits: ["Two-week sprint cadence"],
  },
  {
    id: "enterprise-engagement",
    name: "Enterprise Engagement",
    tagline: "Large-scale systems and support.",
    monthly: null,
    setupFrom: 0,
    highlight: false,
    bestFor: "Replatforming programmes and multi-team delivery",
    features: [
      "System architecture",
      "Custom one-off design requests",
      "SEO-ready structure",
      "Custom timeline",
      "Custom timeline and milestones",
      "Extended support",
    ],
    limits: [],
  },
];

export const carePlans: readonly Plan[] = [
  {
    id: "host-essential",
    name: "Essential",
    tagline: "Hosting that looks after itself",
    monthly: 8_000,
    highlight: false,
    bestFor: "Marketing sites and small web apps",
    features: [
      "Managed deploys and TLS",
      "CDN and image optimisation",
      "Nightly backups, 14-day retention",
      "Uptime monitoring, 5-minute checks",
      "Email support, next business day",
    ],
    limits: ["Business-hours support", "99.9% uptime target"],
  },
  {
    id: "host-business",
    name: "Business",
    tagline: "For revenue-carrying applications",
    monthly: 25_000,
    highlight: true,
    bestFor: "Commerce, portals and customer-facing apps",
    features: [
      "Everything in Essential",
      "Autoscaling, verified by load test",
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
    tagline: "When downtime costs real money",
    monthly: 65_000,
    highlight: false,
    bestFor: "Exam days, launches, regulated workloads",
    features: [
      "Everything in Business",
      "Multi-region failover",
      "Named engineer and shared incident channel",
      "Quarterly load test and DR rehearsal",
      "15-minute response, 24×7",
      "Written incident reports",
    ],
    limits: ["99.99% uptime SLA"],
  },
];
