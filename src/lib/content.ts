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
  | "globe"
  | "cart"
  | "code"
  | "smartphone"
  | "palette"
  | "megaphone"
  | "boxes"
  | "sparkles"
  | "server"
  | "shield";

export const services: readonly Service[] = [
  {
    slug: "business-websites",
    name: "Business websites",
    shortName: "Website",
    summary: "Company sites and landing pages that load fast, rank and bring in enquiries.",
    description:
      "Most of our work starts here: a website that explains what your business does and turns visitors into calls, WhatsApp messages and enquiry forms. We build on WordPress or Next.js, set up a CMS your team can edit, and launch with SEO basics, analytics and contact tracking already in place.",
    icon: "globe",
    accent: ["#6366f1", "#22d3ee"],
    priceFrom: 20_000,
    typicalTimeline: "3–6 weeks",
    outcomes: [
      "A site that loads in under 2 seconds on a mid-range phone",
      "Your team updates pages, photos and blog posts without a developer",
      "Every form fill, call click and WhatsApp tap tracked from launch",
    ],
    deliverables: [
      "Sitemap, page copy structure and wireframes",
      "Custom design for mobile and desktop",
      "WordPress or Next.js build with an editable CMS",
      "On-page SEO, Google Search Console and Analytics setup",
      "Domain, hosting and business email connected",
    ],
    stack: ["WordPress", "Next.js", "Tailwind", "Sanity", "Google Analytics", "Cloudflare"],
    featured: true,
  },
  {
    slug: "ecommerce-stores",
    name: "E-commerce stores",
    shortName: "Store",
    summary: "Online stores on Shopify, WooCommerce or a custom build, with payments and shipping wired in.",
    description:
      "We set up stores that take orders from day one: product catalogue, cart, checkout, Razorpay or Stripe payments, GST invoices and shipping integration. Shopify or WooCommerce when they fit, a custom Next.js store when your catalogue, pricing or fulfilment needs more than a plugin can give.",
    icon: "cart",
    accent: ["#f97316", "#ec4899"],
    priceFrom: 60_000,
    typicalTimeline: "4–10 weeks",
    outcomes: [
      "Checkout that works on UPI, cards and wallets",
      "Inventory that stays in sync across store and warehouse",
      "Order, shipping and refund flows your team can run without us",
    ],
    deliverables: [
      "Store setup on Shopify, WooCommerce or Next.js",
      "Product catalogue, variants and bulk import",
      "Payment gateway, GST invoices and refunds",
      "Shipping and courier integration",
      "Sales, abandoned-cart and conversion reporting",
    ],
    stack: ["Shopify", "WooCommerce", "Next.js", "Razorpay", "Stripe", "Shiprocket"],
    featured: true,
  },
  {
    slug: "web-development",
    name: "Web application development",
    shortName: "Web app",
    summary: "Customer portals, dashboards and SaaS products built on Next.js and PostgreSQL.",
    description:
      "When a website needs logins, payments, an admin side or real business logic, it becomes a web application. We build those on Next.js, TypeScript and PostgreSQL, with a performance budget enforced in CI, error tracking and separate staging and production environments. Most MVPs ship in 8–12 weeks.",
    icon: "code",
    accent: ["#8b5cf6", "#6366f1"],
    priceFrom: 120_000,
    typicalTimeline: "8–12 weeks",
    outcomes: [
      "A working staging link from the first sprint",
      "Core Web Vitals in the green on mid-range Android over 4G",
      "Code, repository and cloud account in your name from day one",
    ],
    deliverables: [
      "Architecture note and fixed-price scope",
      "Design system and responsive UI",
      "Accounts, roles, payments and admin dashboard",
      "CI/CD pipeline with staging and production",
      "Analytics, Sentry error tracking and uptime alerts",
    ],
    stack: ["Next.js", "TypeScript", "Node.js", "PostgreSQL", "Vercel", "AWS"],
    featured: true,
  },
  {
    slug: "app-development",
    name: "Mobile app development",
    shortName: "Apps",
    summary: "iOS and Android apps from one React Native or Flutter codebase.",
    description:
      "One codebase, both stores, one release pipeline. We build in React Native or Flutter and handle the parts teams underestimate: offline state, push notifications, store review and crash triage. You get an app your own developers can keep shipping, with the store accounts in your name.",
    icon: "smartphone",
    accent: ["#8b5cf6", "#ec4899"],
    priceFrom: 220_000,
    typicalTimeline: "8–16 weeks",
    outcomes: [
      "One codebase for iOS and Android, one team to maintain it",
      "Keeps working offline and syncs when the signal returns",
      "App Store and Play Store submission handled end to end",
    ],
    deliverables: [
      "Native-feel UI for iOS and Android",
      "Push notifications and deep links",
      "Offline sync with conflict handling",
      "Over-the-air updates for quick fixes",
      "App Store and Play Store listings and submission",
    ],
    stack: ["React Native", "Flutter", "Expo", "TypeScript", "Firebase", "Fastlane"],
    featured: true,
  },
  {
    slug: "product-design",
    name: "UI/UX & branding",
    shortName: "Design",
    summary: "Logos, brand identity and product interfaces designed to be built.",
    description:
      "A logo and brand identity for a new business, or the screens and flows for your website and app. Our designers work in Figma alongside the engineers who will build it, so the brand guide and the screens you approve are exactly what ships.",
    icon: "palette",
    accent: ["#ec4899", "#6366f1"],
    priceFrom: 90_000,
    typicalTimeline: "2–6 weeks",
    outcomes: [
      "A brand that looks the same on your site, app, invoices and social posts",
      "A clickable prototype before any code is written",
      "Contrast, focus states and touch targets checked at design time",
    ],
    deliverables: [
      "Logo, colour palette and typography",
      "Brand guidelines and social media templates",
      "User flows and wireframes",
      "High-fidelity UI for every screen and state",
      "Design system and clickable prototype",
    ],
    stack: ["Figma", "Illustrator", "Storybook", "Tailwind"],
    featured: false,
  },
  {
    slug: "seo-marketing",
    name: "SEO & digital marketing",
    shortName: "Marketing",
    summary: "On-page SEO, Google Ads and social campaigns, measured in leads, not likes.",
    description:
      "A good website still needs traffic. We fix technical and on-page SEO, set up Google Business Profile, run Google Ads and Meta campaigns, and report every month on what each rupee brought in. Tracking goes in first, so you can see which channel produces enquiries.",
    icon: "megaphone",
    accent: ["#f59e0b", "#10b981"],
    priceFrom: 15_000,
    typicalTimeline: "Monthly, first report in 30 days",
    outcomes: [
      "Search rankings tracked for the keywords that bring you customers",
      "Ad spend tied to leads and cost per enquiry",
      "A monthly report in plain language, not a screenshot dump",
    ],
    deliverables: [
      "Technical and on-page SEO audit with fixes",
      "Google Business Profile and local SEO",
      "Google Ads and Meta ad campaigns",
      "Social media content calendar",
      "GA4 and conversion tracking with a monthly report",
    ],
    stack: ["Google Search Console", "GA4", "Google Ads", "Meta Ads", "Semrush"],
    featured: false,
  },
  {
    slug: "custom-software",
    name: "Custom software, ERP & CRM",
    shortName: "Software",
    summary: "Internal tools, ERP and CRM systems built around how your business actually runs.",
    description:
      "Spreadsheets, WhatsApp groups and three tools that do not talk to each other. We replace them with one system for orders, inventory, customers, staff and billing, built around your process rather than a template, and connected to the accounting and payment tools you already use.",
    icon: "boxes",
    accent: ["#0ea5e9", "#6366f1"],
    priceFrom: 150_000,
    typicalTimeline: "10–20 weeks",
    outcomes: [
      "One system of record instead of spreadsheets and chat threads",
      "Role-based access for owners, managers and staff",
      "Reports you can pull yourself, without waiting on IT",
    ],
    deliverables: [
      "Process mapping with the people who do the work",
      "Modules for orders, inventory, customers or HR",
      "Role-based access and audit log",
      "Integrations with accounting, payments and WhatsApp",
      "Data migration from your current spreadsheets or tools",
    ],
    stack: ["Node.js", "PostgreSQL", "React", "Redis", "REST APIs"],
    featured: false,
  },
  {
    slug: "ai-integration",
    name: "AI & automation",
    shortName: "AI",
    summary: "Chatbots, workflow automation and integrations that take repetitive work off your team.",
    description:
      "AI and automation that do one specific job: a chatbot that answers customers from your own documents, invoices read into your system automatically, leads routed from your website to the right salesperson. We measure accuracy and cost per request before launch, and hand low-confidence cases to a person.",
    icon: "sparkles",
    accent: ["#f59e0b", "#ef4444"],
    priceFrom: 180_000,
    typicalTimeline: "3–8 weeks",
    outcomes: [
      "Answers grounded in your documents, with citations",
      "Hours of manual data entry removed each week",
      "A per-request cost you can forecast and cap",
    ],
    deliverables: [
      "Workflow review and feasibility assessment",
      "Website or WhatsApp chatbot on your own content",
      "Workflow automation between your existing tools",
      "Evaluation suite with agreed accuracy thresholds",
      "Guardrails, logging, spend caps and human handoff",
    ],
    stack: ["Claude", "OpenAI", "n8n", "pgvector", "Python"],
    featured: false,
  },
  {
    slug: "managed-hosting",
    name: "Hosting & domains",
    shortName: "Hosting",
    summary: "Domains, hosting, SSL, business email and backups, set up and watched for you.",
    description:
      "We register or move your domain, host your site or app, set up SSL and business email, and keep nightly backups. Monitoring runs around the clock, and if something goes down, our engineer gets the alert, not you. It runs in an account in your name, billed at cost.",
    icon: "server",
    accent: ["#06b6d4", "#10b981"],
    priceFrom: 25_000,
    typicalTimeline: "3–7 days to migrate",
    outcomes: [
      "99.95% uptime SLA in writing on Business and Critical plans",
      "Nightly backups, restore-tested every month",
      "Domain, SSL and email renewals that never lapse quietly",
    ],
    deliverables: [
      "Domain registration or transfer",
      "Hosting setup or zero-downtime migration",
      "SSL, CDN and firewall on Cloudflare",
      "Business email and DNS records",
      "Backups, uptime monitoring and incident reports",
    ],
    stack: ["AWS", "Vercel", "Cloudflare", "Docker", "Grafana"],
    featured: false,
  },
  {
    slug: "support-maintenance",
    name: "Maintenance & support",
    shortName: "Support",
    summary: "Updates, fixes and security patches for your site or app, on a fixed monthly fee.",
    description:
      "Plugin and dependency updates, security patches, bug fixes and small content changes, handled by a named team with published response times. Inherited a site or app nobody maintains? We audit it first, fix what is fragile, then keep it current. Fixed monthly fee, no surprise invoices.",
    icon: "shield",
    accent: ["#10b981", "#6366f1"],
    priceFrom: 40_000,
    typicalTimeline: "Onboard in 1 week",
    outcomes: [
      "First response in under 30 minutes",
      "Plugins, dependencies and certificates updated before they expire",
      "A monthly health report you can forward to your board",
    ],
    deliverables: [
      "Site or codebase and security audit",
      "Monthly updates and security patches",
      "Bug fixes and small content changes",
      "Monitoring with alerts routed to our on-call",
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

// TODO(owner): replace with a real, approved client quote
export const testimonials: readonly Testimonial[] = [
  {
    quote:
      "Setuware Technologies changed how our field operations run. Dispatch time is down 75%, and our technicians actually like using the mobile app. Automated invoicing alone saves us $80K a year in admin costs.",
    author: "Michael Chen",
    role: "COO",
    company: "ProClean Services",
    initials: "MC",
    outcomes: ["75% faster dispatch", "$80K annual savings"],
  },
  {
    quote:
      "We evaluated Chargebee, Stripe and Zuora before choosing Setuware Technologies. The difference was getting subscription billing and operations management in one platform. Churn dropped 35%, and we cut $40K a year in integration costs.",
    author: "Sarah Thompson",
    role: "CTO",
    company: "Wellness Bev",
    initials: "ST",
    outcomes: ["35% lower churn", "$40K integration saved"],
  },
  {
    quote:
      "Automated invoicing paid for the build on its own. Our events team went from three spreadsheets and a shared inbox to one system everyone uses, and nobody has asked to go back.",
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
      "We learn how your business wins customers, what the website or app has to do, and the deadline, before proposing anything. If we are not the right team for it, we tell you on the first call.",
    deliverable:
      "30-minute consultation | Goals and competitor review | Sitemap or feature list",
  },
  {
    step: "002",
    title: "Proposal and Scope",
    duration: "1 week",
    description:
      "A fixed-price proposal covering the architecture, the risks we can see and what we are deliberately leaving out of phase one. You know the cost before you commit.",
    deliverable: "Written scope | Timeline and fixed quote",
  },
  {
    step: "003",
    title: "Design",
    duration: "2-3 weeks",
    description:
      "Brand, layout and every key page or screen as a clickable Figma prototype. You approve something you can tap through, not a static picture.",
    deliverable: "Wireframes | Clickable prototype | Approved UI designs",
  },
  {
    step: "004",
    title: "Development",
    duration: "2-4 weeks",
    description:
      "Your website or app on a live staging link from the first week, with a demo every week, so there are no surprises at the end. Each sprint closes with a changelog you can read without us in the room.",
    deliverable: "Weekly demos | Live staging link | Direct access to the engineers",
  },
  {
    step: "005",
    title: "Testing and Launch",
    duration: "1 week",
    description:
      "Real-device testing, SEO and speed checks, an accessibility audit, a security review and a rehearsed rollback plan, all before we go live.",
    deliverable: "Real-device QA | Production release | Rollback plan",
  },
  {
    step: "006",
    title: "Support",
    duration: "As needed",
    description:
      "Hosting, updates, fixes and a monthly report, plus SEO, marketing or new features when you are ready for them. You hold the domain, the code and the hosting account from day one.",
    deliverable: "Monitoring | Bug fixes and patches | Post-launch improvements",
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
    question: "Do you only build websites?",
    answer:
      "Websites are where most clients start, and they are still the bulk of our work. After launch we handle what usually comes next: online stores, web and mobile apps, logos and branding, SEO and Google Ads, custom ERP or CRM software, AI chatbots and automation, and hosting and maintenance. One team, one point of contact, and nothing to re-explain to a new agency.",
  },
  {
    group: "Before you start",
    question: "How do you price a project?",
    answer:
      "Fixed price, agreed before we write any code. We scope the work during discovery, send a written quote with the timeline and payment milestones, and bill against those milestones. A business website starts at ₹20,000 on the Website Build package, and Full Application Build starts at ₹50,000. Anything new you ask for mid-project is quoted separately before we start it, so the number never moves without your sign-off.",
  },
  {
    group: "Before you start",
    question: "How long does a typical build take?",
    answer:
      "A business website takes 3 to 6 weeks. An online store takes 4 to 10. A web application takes 8 to 12, and most MVPs ship in that window. A mobile app takes 8 to 16. Discovery and scoping add 1 to 2 weeks up front. The timeline is written into your quote, and the instant estimator gives you a figure for your scope in about a minute.",
  },
  {
    group: "Before you start",
    question: "Who owns the code and the IP?",
    answer:
      "You do, from day one. The domain is registered in your name, the code sits in your own repository and the hosting runs in your own account. Handover documentation is written for a developer who has never met us. If you stop working with us, there is nothing to transfer and nothing held back.",
  },
  {
    group: "Before you start",
    question: "Will you sign an NDA?",
    answer:
      "Yes. We sign your NDA before the first detailed conversation, or send our mutual NDA if you do not have one. Share as much as you need to once it is signed; it does not slow anything down.",
  },
  {
    group: "Before you start",
    question: "What do you need from us?",
    answer:
      "One person who can make decisions and join a 30-minute demo each week. Access to any existing systems, APIs and accounts we need to integrate with. Your content and brand assets, or a decision to have us produce them. If the build takes payments, your business KYC documents so the gateway can be activated. Feedback on each demo within a few working days keeps the timeline on track.",
  },
  {
    group: "Help & support",
    question: "How do we get started?",
    answer:
      "Book a free 30-minute call. You speak to the engineers who would build it, not a salesperson, about the problem, the constraints and the deadline. Afterwards we send a written summary and a ballpark range. You keep the summary either way, and there is no follow-up sales sequence.",
  },
  {
    group: "Help & support",
    question: "Do you provide post-launch support?",
    answer:
      "Yes. Every build includes a support window: three months on Website Build, six to eight months on Full Application Build, and an agreed term on Enterprise Engagement. After that, care plans start at ₹8,000 a month with published response times. Business and Critical plans add 24×7 on-call cover and a written uptime SLA.",
  },
  {
    group: "Help & support",
    question: "Can you take over or modernise existing software?",
    answer:
      "Usually, yes. We start with a paid audit of the codebase and infrastructure, then tell you in writing whether stabilising it or rebuilding it is cheaper over the next twelve months. If stabilising wins, we move it onto a support plan and work through the fixes in priority order.",
  },
  {
    group: "Performance & quality",
    question: "What tech stack do you use?",
    answer:
      "WordPress or Next.js for business websites, Shopify or WooCommerce for stores, and a custom Next.js build when a store outgrows plugins. React Native or Flutter for mobile apps. Node.js and PostgreSQL behind web apps and custom software. Hosting runs on AWS, Vercel or Cloudflare in your own account, billed to you at cost; we never mark up infrastructure. If your existing stack is sound, we work in it.",
  },
  {
    group: "Performance & quality",
    question: "How do you keep quality up?",
    answer:
      "Every pull request runs automated tests and a performance budget in CI, so a regression fails the build instead of shipping. Before launch we do real-device QA, an accessibility audit, a security review and a load test. You see progress on a live staging link every week, so nothing about the finished product is a surprise.",
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
  // TODO(owner): this says 2018 but site.founded is 2020; confirm which is right.
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
