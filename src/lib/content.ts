import type { ServiceKey } from "./pricing";

/**
 * Editorial content for the marketing site.
 *
 * Kept as typed data rather than a CMS so every page prerenders to static HTML
 * at build time — the cheapest possible thing to serve under a traffic spike.
 * Swapping this module for a CMS fetch later only needs the exported readers
 * below to become async.
 */

export interface Service {
  slug: ServiceKey;
  name: string;
  shortName: string;
  /** One line used on cards and in the nav. */
  summary: string;
  /** Longer positioning paragraph for the service page hero. */
  description: string;
  icon: IconName;
  accent: readonly [string, string];
  priceFrom: number;
  typicalTimeline: string;
  outcomes: readonly string[];
  deliverables: readonly string[];
  stack: readonly string[];
  featured: boolean;
}

export type IconName =
  | "code"
  | "smartphone"
  | "server"
  | "sparkles"
  | "palette"
  | "shield";

export const services: readonly Service[] = [
  {
    slug: "web-development",
    name: "Web development",
    shortName: "Web",
    summary: "Fast, SEO-ready web apps and marketing sites that convert.",
    description:
      "We build web products on Next.js and TypeScript — commerce, dashboards, portals and marketing sites. Every build ships with performance budgets, analytics and a CI pipeline, so the site you launch stays fast a year later.",
    icon: "code",
    accent: ["#6366f1", "#22d3ee"],
    priceFrom: 120_000,
    typicalTimeline: "4–10 weeks",
    outcomes: [
      "Core Web Vitals in the green on real mobile networks",
      "Content your team can edit without a developer",
      "Conversion tracking wired from day one",
    ],
    deliverables: [
      "Technical discovery and architecture note",
      "Design system and responsive UI",
      "Headless CMS integration",
      "CI/CD, staging and production environments",
      "Analytics, error tracking and uptime alerts",
    ],
    stack: ["Next.js", "TypeScript", "Tailwind", "PostgreSQL", "Vercel", "Sanity"],
    featured: true,
  },
  {
    slug: "app-development",
    name: "App development",
    shortName: "Apps",
    summary: "Cross-platform iOS and Android apps from one codebase.",
    description:
      "One React Native codebase, two stores, one release pipeline. We handle the parts teams underestimate — offline state, push notifications, store review, crash triage — and hand over an app your own developers can keep shipping.",
    icon: "smartphone",
    accent: ["#8b5cf6", "#ec4899"],
    priceFrom: 220_000,
    typicalTimeline: "8–16 weeks",
    outcomes: [
      "Single codebase for iOS and Android",
      "Offline-first behaviour on weak networks",
      "Store submission handled end to end",
    ],
    deliverables: [
      "Native-feel UI for both platforms",
      "Push notifications and deep links",
      "Offline sync and conflict handling",
      "Over-the-air update channel",
      "App Store and Play Store listings",
    ],
    stack: ["React Native", "Expo", "TypeScript", "Firebase", "Fastlane"],
    featured: true,
  },
  {
    slug: "managed-hosting",
    name: "Managed hosting",
    shortName: "Hosting",
    summary: "We run your infrastructure, so an outage is our pager, not yours.",
    description:
      "Deployment, scaling, backups, certificates, WAF and monitoring on a single monthly invoice. We size infrastructure to your traffic, load-test it before launch, and keep a restore-tested backup of everything that matters.",
    icon: "server",
    accent: ["#06b6d4", "#10b981"],
    priceFrom: 25_000,
    typicalTimeline: "3–7 days to migrate",
    outcomes: [
      "99.95% uptime backed by an SLA",
      "Nightly backups, restore-tested monthly",
      "Autoscaling verified by load test, not hope",
    ],
    deliverables: [
      "Zero-downtime migration plan",
      "CDN, caching and WAF configuration",
      "Autoscaling and health checks",
      "Backup, restore and disaster-recovery runbook",
      "On-call rotation and incident reports",
    ],
    stack: ["Vercel", "AWS", "Cloudflare", "Docker", "Terraform", "Grafana"],
    featured: true,
  },
  {
    slug: "ai-integration",
    name: "AI integration",
    shortName: "AI",
    summary: "Assistants, search and automation wired into your real data.",
    description:
      "AI that does a specific job: answer customer questions from your own documents, extract fields from invoices, draft replies, score leads. We start from the workflow and the cost per request, not the demo.",
    icon: "sparkles",
    accent: ["#f59e0b", "#ef4444"],
    priceFrom: 180_000,
    typicalTimeline: "3–8 weeks",
    outcomes: [
      "Answers grounded in your documents, with citations",
      "Measured accuracy before launch, not after",
      "Per-request cost you can forecast",
    ],
    deliverables: [
      "Use-case and feasibility assessment",
      "Retrieval pipeline over your content",
      "Evaluation suite with accuracy thresholds",
      "Guardrails, logging and cost caps",
      "Human-handoff path for low confidence",
    ],
    stack: ["Claude", "OpenAI", "pgvector", "LangGraph", "Python"],
    featured: false,
  },
  {
    slug: "product-design",
    name: "Product design",
    shortName: "Design",
    summary: "Interfaces designed to be built, not just presented.",
    description:
      "Research, flows, UI and a component library handed over as production-ready tokens. Our designers sit with the engineers building it, so what gets approved is what ships.",
    icon: "palette",
    accent: ["#ec4899", "#6366f1"],
    priceFrom: 90_000,
    typicalTimeline: "2–6 weeks",
    outcomes: [
      "Clickable prototype before a line of code",
      "Design system your developers can consume",
      "Accessibility checked at design time",
    ],
    deliverables: [
      "User research synthesis",
      "Information architecture and flows",
      "High-fidelity UI for every state",
      "Design tokens and component library",
      "Interactive prototype for testing",
    ],
    stack: ["Figma", "Framer Motion", "Storybook", "Tailwind"],
    featured: false,
  },
  {
    slug: "support-maintenance",
    name: "Support & maintenance",
    shortName: "Support",
    summary: "A named team on call for the software you already own.",
    description:
      "Inherited a codebase nobody maintains? We audit it, stabilise it, patch the dependencies and stay on call. Fixed monthly fee, published response times, no surprise invoices.",
    icon: "shield",
    accent: ["#10b981", "#6366f1"],
    priceFrom: 40_000,
    typicalTimeline: "Onboard in 1 week",
    outcomes: [
      "First response in under 30 minutes",
      "Dependencies and certificates never expire quietly",
      "A monthly report you can forward to your board",
    ],
    deliverables: [
      "Codebase and security audit",
      "Prioritised stabilisation backlog",
      "Patch and dependency cadence",
      "Monitoring and alert routing",
      "Monthly health report",
    ],
    stack: ["Sentry", "GitHub Actions", "Dependabot", "Grafana", "PagerDuty"],
    featured: false,
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}

export const featuredServices = services.filter((service) => service.featured);

export interface Metric {
  label: string;
  value: string;
}

export interface CaseStudy {
  slug: string;
  client: string;
  sector: string;
  title: string;
  summary: string;
  year: string;
  services: readonly ServiceKey[];
  accent: readonly [string, string];
  challenge: string;
  approach: readonly string[];
  results: readonly Metric[];
  stack: readonly string[];
  quote?: { text: string; author: string; role: string };
  featured: boolean;
}

export const caseStudies: readonly CaseStudy[] = [
  {
    slug: "kirana-commerce-platform",
    client: "Vanik Retail",
    sector: "Retail / D2C",
    title: "A grocery chain's 14-store network, online in nine weeks",
    summary:
      "Replaced three disconnected tools with one commerce platform handling 40,000 orders a month across 14 stores.",
    year: "2026",
    services: ["web-development", "managed-hosting"],
    accent: ["#6366f1", "#22d3ee"],
    challenge:
      "Orders arrived by WhatsApp, inventory lived in spreadsheets, and every store quoted different prices. Peak evening traffic took the old site down roughly twice a week.",
    approach: [
      "Mapped the real fulfilment flow with store managers before designing anything",
      "Built a Next.js storefront with per-store catalogues and slot-based delivery",
      "Modelled inventory once, synced to the existing billing software",
      "Load-tested to 4× the forecast peak before going live",
    ],
    results: [
      { label: "Orders / month", value: "40k" },
      { label: "Checkout completion", value: "+31%" },
      { label: "Page load (p75)", value: "1.1s" },
      { label: "Downtime since launch", value: "0" },
    ],
    stack: ["Next.js", "PostgreSQL", "Redis", "Razorpay", "Cloudflare"],
    quote: {
      text: "The first Saturday rush used to be the scariest hour of our week. Now nobody mentions the website at all.",
      author: "Rhea Vanik",
      role: "Director, Vanik Retail",
    },
    featured: true,
  },
  {
    slug: "field-service-mobile-app",
    client: "Arcline Utilities",
    sector: "Field services",
    title: "400 field engineers working offline, syncing when they surface",
    summary:
      "A React Native app that keeps working in basements and tunnels, then reconciles cleanly when the signal returns.",
    year: "2025",
    services: ["app-development", "product-design"],
    accent: ["#8b5cf6", "#ec4899"],
    challenge:
      "Engineers filled paper job cards because the old app lost data whenever connectivity dropped. Back-office re-entry added two days to every billing cycle.",
    approach: [
      "Shadowed engineers on site to find where connectivity actually failed",
      "Designed an offline-first data model with deterministic conflict rules",
      "Built one React Native codebase for the mixed iOS and Android fleet",
      "Shipped over-the-air updates so fixes land without a store review",
    ],
    results: [
      { label: "Paper job cards", value: "0" },
      { label: "Billing cycle", value: "−2 days" },
      { label: "Crash-free sessions", value: "99.8%" },
      { label: "Engineers onboarded", value: "400+" },
    ],
    stack: ["React Native", "Expo", "SQLite", "Node.js", "AWS"],
    quote: {
      text: "It is the first tool our engineers have not asked us to replace.",
      author: "Sandeep Rao",
      role: "Head of Operations, Arcline",
    },
    featured: true,
  },
  {
    slug: "clinic-support-desk-ai",
    client: "Medinest Clinics",
    sector: "Healthcare",
    title: "An assistant that answers patients from the clinic's own policies",
    summary:
      "Retrieval-based support assistant handling 68% of inbound questions with citations, escalating the rest to staff.",
    year: "2026",
    services: ["ai-integration", "web-development"],
    accent: ["#f59e0b", "#ef4444"],
    challenge:
      "Front-desk staff answered the same forty questions all day, and a generic chatbot had already lost the clinic trust by inventing appointment policies.",
    approach: [
      "Grounded every answer in the clinic's own approved documents",
      "Built an evaluation set of 300 real questions with staff-written answers",
      "Blocked responses below a confidence threshold and routed them to a human",
      "Capped per-conversation cost and logged every citation for audit",
    ],
    results: [
      { label: "Questions auto-resolved", value: "68%" },
      { label: "Answer accuracy", value: "96%" },
      { label: "Front-desk calls", value: "−44%" },
      { label: "Cost / conversation", value: "₹2.10" },
    ],
    stack: ["Claude", "pgvector", "Next.js", "Python"],
    featured: true,
  },
  {
    slug: "fintech-dashboard-rebuild",
    client: "Ledgerloop",
    sector: "Fintech / SaaS",
    title: "A reporting dashboard that stopped timing out at month end",
    summary:
      "Re-architected queries and caching so the heaviest report went from 48 seconds to under a second.",
    year: "2025",
    services: ["web-development", "support-maintenance"],
    accent: ["#06b6d4", "#10b981"],
    challenge:
      "Month-end reporting ran unindexed aggregates over four years of ledger rows. Customers learned to export to Excel instead.",
    approach: [
      "Profiled the slowest ten queries against a production-sized dataset",
      "Introduced materialised rollups with incremental refresh",
      "Moved exports to a background worker with progress reporting",
      "Added query budgets to CI so a regression fails the build",
    ],
    results: [
      { label: "Heaviest report", value: "48s → 0.9s" },
      { label: "Server cost", value: "−38%" },
      { label: "Support tickets", value: "−61%" },
      { label: "Month-end incidents", value: "0" },
    ],
    stack: ["Next.js", "PostgreSQL", "ClickHouse", "BullMQ"],
    featured: false,
  },
  {
    slug: "education-platform-hosting",
    client: "Shiksha Bridge",
    sector: "Education",
    title: "Exam day traffic: 1,200 concurrent students, no incident",
    summary:
      "Migrated an exam platform onto managed infrastructure and load-tested it to four times its worst day.",
    year: "2026",
    services: ["managed-hosting", "support-maintenance"],
    accent: ["#10b981", "#6366f1"],
    challenge:
      "Every exam window produced a partial outage. Nobody could say what the platform's actual ceiling was.",
    approach: [
      "Established the real ceiling with a staged load test to 5,000 virtual users",
      "Moved static and cacheable responses to the CDN edge",
      "Separated the exam write path onto its own autoscaling pool",
      "Wrote an incident runbook and rehearsed it with the client's team",
    ],
    results: [
      { label: "Concurrent students", value: "1,200" },
      { label: "Error rate at peak", value: "0.02%" },
      { label: "p95 response", value: "180ms" },
      { label: "Exam-day incidents", value: "0" },
    ],
    stack: ["AWS", "Terraform", "Cloudflare", "Grafana", "k6"],
    featured: false,
  },
  {
    slug: "logistics-brand-design-system",
    client: "Pathway Freight",
    sector: "Logistics",
    title: "One design system across a website, portal and driver app",
    summary:
      "Replaced three visual languages with a single token-driven system three teams now share.",
    year: "2025",
    services: ["product-design", "web-development"],
    accent: ["#ec4899", "#6366f1"],
    challenge:
      "Website, customer portal and driver app had drifted so far apart that customers did not believe they came from the same company.",
    approach: [
      "Audited every existing screen and catalogued the real component set",
      "Defined tokens for colour, type, spacing and motion",
      "Shipped the library as code with Storybook documentation",
      "Migrated the website first to prove the system in production",
    ],
    results: [
      { label: "Components unified", value: "142 → 38" },
      { label: "New page build time", value: "−55%" },
      { label: "Accessibility issues", value: "−90%" },
      { label: "Teams on the system", value: "3" },
    ],
    stack: ["Figma", "Tailwind", "Storybook", "Next.js"],
    featured: false,
  },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((study) => study.slug === slug);
}

export const featuredCaseStudies = caseStudies.filter((study) => study.featured);

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  initials: string;
  /** Outcome chips rendered under the quote. */
  outcomes: readonly string[];
}

export const testimonials: readonly Testimonial[] = [
  {
    quote:
      "Setuware transformed our field operations completely. We reduced dispatch time by 75% and our technicians love the mobile app. The automated invoicing alone saved us $80K annually in admin costs.",
    author: "Michael Chen",
    role: "COO",
    company: "ProClean Services",
    initials: "MC",
    outcomes: ["75% faster dispatch", "$80K annual savings"],
  },
  {
    quote:
      "We evaluated Chargebee, Stripe, and Zuora before choosing Setuware. The difference? Setuware gave us subscription billing plus operations management in one platform. Our churn dropped 35% and we eliminated $40K a year in integration costs.",
    author: "Sarah Thompson",
    role: "CTO",
    company: "Wellness Bev",
    initials: "ST",
    outcomes: ["35% lower churn", "$40K integration saved"],
  },
  {
    quote:
      "The automated invoicing alone paid for the build. Our events team went from three spreadsheets and a shared inbox to one system that everybody actually uses, and nobody has asked to go back.",
    author: "David Rodriguez",
    role: "Founder & CEO",
    company: "TechHub Events",
    initials: "DR",
    outcomes: ["3 tools replaced", "100% team adoption"],
  },
];

export interface ProcessStep {
  step: string;
  title: string;
  duration: string;
  description: string;
  deliverable: string;
}

export const processSteps: readonly ProcessStep[] = [
  {
    step: "001",
    title: "Discovery",
    duration: "1-2 weeks",
    description:
      "We dig into the problem, the constraints and the deadline before proposing anything. If we are not the right team for it, we say so on this call.",
    deliverable:
      "30-minute consultation | Stakeholder interviews & briefing | User & market research",
  },
  {
    step: "002",
    title: "Proposal and Scope",
    duration: "1 week",
    description:
      "A fixed-price proposal with the architecture, the risks we can see, and what we will deliberately leave out of phase one.",
    deliverable: "Written scope | Timeline and fixed quote",
  },
  {
    step: "003",
    title: "Design",
    duration: "2-3 weeks",
    description:
      "Clickable prototype of the real flows. You approve something you can use, not a static picture.",
    deliverable: "Creative & strategic exploration | Wireframes & Approved UI designs",
  },
  {
    step: "004",
    title: "Development",
    duration: "2-4 weeks",
    description:
      "A working staging URL from sprint one, a demo every fortnight, and a changelog you can read without us in the room.",
    deliverable: "Weekly demos | Direct team access",
  },
  {
    step: "005",
    title: "Testing and Launch",
    duration: "1 week",
    description:
      "Load testing, accessibility audit, security review and a rehearsed rollback plan before we touch production.",
    deliverable: "Real-device QA | Production release | Rollout & support",
  },
  {
    step: "006",
    title: "Support",
    duration: "As needed",
    description:
      "Monitoring, patches and a monthly health report. Your team gets the keys and the documentation on day one.",
    deliverable: "Monitoring | Ongoing improvements | Post-launch optimisations",
  },
];

export interface Faq {
  question: string;
  answer: string;
  /** Heading the question sits under in the FAQ list. */
  group: "Before you start" | "Help & support" | "Performance & quality";
}

export const faqs: readonly Faq[] = [
  {
    group: "Before you start",
    question: "What makes Setuware different?",
    answer:
      "We stay after launch. Hosting and support are quoted alongside the build, the documentation is written before handover, and our own on-call rota sits behind everything we run — which makes us far more careful during the build, because we are the ones who get paged.",
  },
  {
    group: "Before you start",
    question: "Do you handle cloud and deployment?",
    answer:
      "Yes. We size the infrastructure to your traffic, set up CDN, caching, WAF and monitoring, and load-test it before launch. It runs in your own cloud accounts, billed to you at cost — we never mark up infrastructure.",
  },
  {
    group: "Before you start",
    question: "What is a typical timeline?",
    answer:
      "A website is usually 4 to 6 weeks, a full web application 8 to 12, and a mobile app 8 to 16. Discovery takes 1 to 2 weeks before that. The instant estimator gives you a timeline for your actual scope in about a minute.",
  },
  {
    group: "Before you start",
    question: "Do you provide post-launch support?",
    answer:
      "Every build includes a support window — one month on Website Build, three on Full Application Build, twelve on Enterprise. After that, monthly care plans start at ₹8,000 and carry a published SLA rather than a best-effort promise.",
  },
  {
    group: "Before you start",
    question: "Can you customize software for our business?",
    answer:
      "That is the whole premise. We map how your business actually runs before designing anything, then build around your processes instead of asking your team to work around a template.",
  },
  {
    group: "Help & support",
    question: "How do we get started?",
    answer:
      "Book a free consultation. We spend 45 minutes on the problem, the constraints and the deadline, then send a written summary and a ballpark range — no obligation and no sales sequence.",
  },
  {
    group: "Help & support",
    question: "Can you upgrade or modernize existing software?",
    answer:
      "Often, yes. We start with a paid audit of the codebase and infrastructure, then tell you honestly whether stabilising it or rebuilding it is cheaper over twelve months.",
  },
  {
    group: "Help & support",
    question: "What happens after the project is delivered?",
    answer:
      "You get the repository, the infrastructure and documentation written for a developer who has never met us. Most clients then move onto a care plan, but leaving should be painless — that is deliberate.",
  },
  {
    group: "Performance & quality",
    question: "Do you offer a free consultation?",
    answer:
      "Yes, and it is a real technical conversation rather than a sales call. You speak to the engineers who would build it, and you keep the written summary either way.",
  },
  {
    group: "Performance & quality",
    question: "How do you ensure software quality?",
    answer:
      "Performance budgets enforced in CI, automated test suites, real-device QA, an accessibility audit and a security review before launch. A regression fails the build rather than quietly shipping.",
  },
];

/** FAQ group order, used to render the list under headings. */
export const faqGroups = [
  "Before you start",
  "Help & support",
  "Performance & quality",
] as const;

export interface Stat {
  value: number;
  suffix: string;
  label: string;
  hint: string;
}

export const stats: readonly Stat[] = [
  { value: 120, suffix: "+", label: "Products shipped", hint: "Since 2018" },
  { value: 99.95, suffix: "%", label: "Hosting uptime", hint: "Last 12 months" },
  { value: 30, suffix: " min", label: "First response", hint: "Support SLA" },
  { value: 14, suffix: "", label: "Countries served", hint: "Across 3 continents" },
];

export const techStack: readonly { name: string; category: string }[] = [
  { name: "Next.js", category: "Framework" },
  { name: "TypeScript", category: "Language" },
  { name: "React Native", category: "Mobile" },
  { name: "Tailwind CSS", category: "Styling" },
  { name: "PostgreSQL", category: "Database" },
  { name: "Redis", category: "Cache" },
  { name: "AWS", category: "Cloud" },
  { name: "Cloudflare", category: "Edge" },
  { name: "Terraform", category: "Infrastructure" },
  { name: "Docker", category: "Containers" },
  { name: "Playwright", category: "Testing" },
  { name: "Grafana", category: "Observability" },
];
