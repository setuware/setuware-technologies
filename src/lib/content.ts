import { LANDING_PAGE_FROM, WEBSITE_FROM } from "./plans";
import type { ServiceKey } from "./pricing";
import { site } from "./site";

/**
 * Editorial content for the marketing site.
 *
 * Kept as typed data rather than a CMS so every page prerenders to static HTML
 * at build time — the cheapest possible thing to serve under a traffic spike.
 * Swapping this module for a CMS fetch later only needs the exported readers
 * below to become async.
 */

/** Where a service sits on the services index: what it does for the business. */
export type ServiceGroup = "build" | "grow" | "scale" | "run";

export interface ServiceGroupInfo {
  id: ServiceGroup;
  label: string;
  title: string;
  description: string;
}

export const serviceGroups: readonly ServiceGroupInfo[] = [
  {
    id: "build",
    label: "Build",
    title: "Websites, stores and apps",
    description: "Company websites, online stores, customer portals and mobile apps that present your business and serve your customers.",
  },
  {
    id: "grow",
    label: "Grow",
    title: "Brand, design and marketing",
    description: "Brand identity, interface design, SEO and paid campaigns that attract the right customers and turn visits into enquiries.",
  },
  {
    id: "scale",
    label: "Scale",
    title: "Systems and automation",
    description: "ERP, CRM and AI automation that replace spreadsheets and manual data entry with one dependable system.",
  },
  {
    id: "run",
    label: "Run",
    title: "Hosting and support",
    description: "Managed hosting, domains and maintenance plans that keep your platforms secure, current and available.",
  },
];

export interface ServiceAudience {
  title: string;
  body: string;
}

export interface ServiceProblem {
  /** What the client is living with today. */
  problem: string;
  /** What Setuware Technologies does about it. */
  solution: string;
}

export interface ServiceFeature {
  title: string;
  body: string;
}

export interface ServiceStep {
  title: string;
  body: string;
  /** When it happens, e.g. "Week 1–2". */
  duration: string;
}

export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface Service {
  slug: ServiceKey;
  name: string;
  shortName: string;
  /** One line used on cards and in the nav. */
  summary: string;
  /** Positioning paragraph: homepage carousel, JSON-LD and fallbacks. */
  description: string;
  icon: IconName;
  accent: readonly [string, string];
  /** Matches `SERVICE_RATES[slug].base` in pricing.ts. */
  priceFrom: number;
  /**
   * A fixed entry package priced below the estimator base, such as the
   * single-page landing page under business websites. Cards, the pricing grid
   * and structured data quote this; the estimator keeps quoting `priceFrom`.
   */
  entryPriceFrom?: number;
  typicalTimeline: string;
  outcomes: readonly string[];
  /** What the client holds at handover. */
  deliverables: readonly string[];
  stack: readonly string[];
  featured: boolean;

  /* Landing-page copy. Optional so a new service can ship with the basics. */
  group?: ServiceGroup;
  /** Hero H1. Falls back to `name`. */
  headline?: string;
  /** Hero paragraph under the H1. Falls back to `description`. */
  subheadline?: string;
  /** `<title>` for the service page (the site name is appended). */
  seoTitle?: string;
  seoDescription?: string;
  audience?: readonly ServiceAudience[];
  problems?: readonly ServiceProblem[];
  /** "What's included" grid. */
  features?: readonly ServiceFeature[];
  process?: readonly ServiceStep[];
  /** Overrides the "From ₹X" label when the price needs a unit. */
  priceLabel?: string;
  /** Small print under the price: what it covers, what is billed separately. */
  priceNote?: string;
  /** Promises we put in writing for this service. */
  commitments?: readonly string[];
  faqs?: readonly ServiceFaq[];
  related?: readonly ServiceKey[];
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
    summary: "Fast, responsive company websites that build credibility and generate qualified leads.",
    description:
      "Professionally designed company websites that present your business clearly and convert visitors into enquiries. Each site is built on WordPress or Next.js, with a content management system, technical SEO and analytics configured before launch.",
    icon: "globe",
    accent: ["#6366f1", "#22d3ee"],
    priceFrom: WEBSITE_FROM,
    entryPriceFrom: LANDING_PAGE_FROM,
    typicalTimeline: "1–6 weeks",
    outcomes: [
      "Fast loading on every device",
      "Content your team can update",
      "Enquiries tracked from launch",
    ],
    deliverables: [
      "Sitemap and wireframes",
      "Responsive designs for mobile and desktop",
      "Live website with SSL",
      "Content management system and training",
      "Analytics and enquiry tracking",
      "Three months of post-launch support",
    ],
    stack: [
      "WordPress",
      "Next.js",
      "Tailwind CSS",
      "Sanity",
      "Figma",
      "Google Analytics 4",
      "Search Console",
      "Cloudflare",
    ],
    featured: true,
    group: "build",
    headline: "Business websites that build credibility and generate leads",
    subheadline:
      "We design and develop fast, responsive company websites on WordPress or Next.js. Each site is structured to convert visitors into enquiries and is simple for your team to manage.",
    seoTitle: "Business Website Development in Gurugram",
    seoDescription:
      "Responsive business websites and landing pages on WordPress or Next.js, with technical SEO, analytics and an easy-to-use CMS. Based in Gurugram.",
    audience: [
      {
        title: "Established businesses",
        body: "Companies whose current website is outdated, difficult to update or not optimised for mobile.",
      },
      {
        title: "Startups and new ventures",
        body: "Founders who need a credible online presence ahead of a launch, pitch or campaign.",
      },
      {
        title: "Professional firms",
        body: "Clinics, consultancies, manufacturers and schools whose clients research them online before making contact.",
      },
    ],
    problems: [
      {
        problem: "Slow page loads",
        solution: "Performance-optimised builds, tested with Lighthouse on mobile before launch.",
      },
      {
        problem: "Limited insight into lead sources",
        solution:
          "Analytics and conversion tracking configured for every form, call and WhatsApp enquiry.",
      },
      {
        problem: "Reliance on developers for updates",
        solution:
          "A content management system that lets your team edit pages, images and articles independently.",
      },
      {
        problem: "Low visibility in search",
        solution:
          "Technical and on-page SEO, structured data and Search Console configuration as standard.",
      },
    ],
    features: [
      {
        title: "Custom design",
        body: "Bespoke layouts designed in Figma around your brand and content, approved before development.",
      },
      {
        title: "Mobile-first development",
        body: "Responsive builds that are designed and tested on mobile devices first.",
      },
      {
        title: "Content management",
        body: "A WordPress or Sanity CMS with clearly labelled fields and a recorded training session.",
      },
      {
        title: "Technical SEO",
        body: "Optimised titles, meta descriptions, schema markup, XML sitemaps and redirects.",
      },
      {
        title: "Lead capture",
        body: "Enquiry forms, click-to-call and WhatsApp buttons, with optional CRM integration.",
      },
      {
        title: "Domain, SSL and email",
        body: "Domain connection, SSL certificates and business email on Google Workspace or Zoho Mail.",
      },
    ],
    process: [
      {
        title: "Discovery and sitemap",
        body: "We review your business, audience and goals, then agree the site structure and the primary action for each page.",
        duration: "Week 1",
      },
      {
        title: "Content and wireframes",
        body: "We structure the content for each page and prepare wireframes. Copywriting is available as an option.",
        duration: "Weeks 1–2",
      },
      {
        title: "Design",
        body: "Visual designs for the home page and inner pages on mobile and desktop, with two rounds of revisions.",
        duration: "Weeks 2–3",
      },
      {
        title: "Development and CMS",
        body: "We build the site, configure the CMS and load your content for review on a staging link.",
        duration: "Weeks 3–5",
      },
      {
        title: "Launch",
        body: "Performance and SEO checks, redirects, analytics configuration and domain go-live.",
        duration: "Weeks 5–6",
      },
      {
        title: "Post-launch support",
        body: "Fixes and minor changes for three months after launch, followed by an optional maintenance plan.",
        duration: "3 months",
      },
    ],
    priceNote:
      "Landing pages start at ₹5,000 and are typically live within a week. Complete business websites start at ₹25,000 and take three to six weeks, with the final price set by page count, copywriting and additional features.",
    commitments: [
      "Lighthouse score of 90+ on mobile at launch",
      "Enquiry tracking from day one",
      "Two rounds of design revisions",
      "Three months of support included",
    ],
    faqs: [
      {
        question: "How much does a business website cost?",
        answer:
          "Landing pages start at ₹5,000 and complete business websites at ₹25,000. The final price depends on page count, copywriting and features such as online booking or multilingual content.",
      },
      {
        question: "Should I choose WordPress or Next.js?",
        answer:
          "WordPress suits teams that want to manage content and add plugins themselves. Next.js is recommended where performance, security and custom functionality are the priority.",
      },
      {
        question: "Do you provide copywriting?",
        answer:
          "Yes. We can write the copy for every page from a short briefing session or refine your existing content.",
      },
      {
        question: "Can I update the website myself?",
        answer:
          "Yes. Every website includes a content management system and a recorded training session for your team.",
      },
      {
        question: "Will a new website affect my search rankings?",
        answer:
          "We map existing URLs to the new pages with permanent redirects and resubmit the sitemap at launch to protect your rankings.",
      },
      {
        question: "Who owns the website?",
        answer:
          "You do. The domain, hosting account and source code are registered to your business.",
      },
    ],
    related: ["seo-marketing", "product-design", "managed-hosting"],
  },
  {
    slug: "ecommerce-stores",
    name: "E-commerce stores",
    shortName: "Store",
    summary: "Scalable online stores with secure payments, inventory and order management.",
    description:
      "Online stores on Shopify, WooCommerce or a custom Next.js build, with secure payments, GST invoicing and shipping integration. Each store is configured to take orders from launch and to scale with your catalogue.",
    icon: "cart",
    accent: ["#f97316", "#ec4899"],
    priceFrom: 60_000,
    typicalTimeline: "4–10 weeks",
    outcomes: [
      "Secure UPI, card and wallet payments",
      "Inventory synchronised across channels",
      "Streamlined order and returns management",
    ],
    deliverables: [
      "Store design for mobile and desktop",
      "Product catalogue and variants",
      "Payment gateway integration",
      "GST invoicing and courier integration",
      "Analytics, ad pixels and sales reporting",
      "Admin training for your team",
    ],
    stack: [
      "Shopify",
      "WooCommerce",
      "Next.js",
      "Razorpay",
      "Cashfree",
      "Shiprocket",
      "Google Merchant Center",
      "Meta Pixel",
    ],
    featured: true,
    group: "build",
    headline: "E-commerce stores built to sell and scale",
    subheadline:
      "We build online stores on Shopify, WooCommerce or Next.js. Secure payments, GST invoicing and courier integration are configured and tested before launch.",
    seoTitle: "E-commerce Website Development in India",
    seoDescription:
      "E-commerce website development in India: Shopify, WooCommerce and custom stores with secure payments, GST invoicing, shipping and inventory sync.",
    audience: [
      {
        title: "Marketplace sellers",
        body: "Brands selling on Amazon, Flipkart or Instagram that want their own store, customer data and margins.",
      },
      {
        title: "Retailers moving online",
        body: "Businesses with physical stores and stock that need online ordering, payments and delivery.",
      },
      {
        title: "Direct-to-consumer brands",
        body: "Growing brands that need a mobile-optimised store capable of scaling with their catalogue.",
      },
    ],
    problems: [
      {
        problem: "Checkout abandonment",
        solution:
          "A streamlined checkout with UPI, cards, wallets and cash on delivery, tested across devices.",
      },
      {
        problem: "Inaccurate stock levels",
        solution: "Inventory synchronised with your POS, Tally or warehouse system.",
      },
      {
        problem: "Manual order fulfilment",
        solution:
          "Courier integration with Shiprocket or Delhivery, automated shipping labels and order notifications.",
      },
      {
        problem: "Limited sales insight",
        solution:
          "E-commerce analytics, advertising pixels and reporting by product, channel and campaign.",
      },
    ],
    features: [
      {
        title: "Platform selection",
        body: "Shopify, WooCommerce or Next.js, recommended according to your catalogue, budget and growth plans.",
      },
      {
        title: "Catalogue management",
        body: "Product variants, bundles, bulk import and intuitive filters.",
      },
      {
        title: "Payment integration",
        body: "UPI, cards, net banking, wallets and cash on delivery through Razorpay, Cashfree or PayU.",
      },
      {
        title: "GST invoicing",
        body: "Tax invoices generated for every order with your GSTIN and HSN codes.",
      },
      {
        title: "Shipping and returns",
        body: "Courier integration, pin-code serviceability checks and returns management.",
      },
      {
        title: "Marketing tools",
        body: "Discount codes, abandoned-cart recovery, product reviews and feeds for Google and Meta.",
      },
    ],
    process: [
      {
        title: "Store planning",
        body: "We review your catalogue, confirm payment and courier partners and recommend a platform.",
        duration: "Week 1",
      },
      {
        title: "Design",
        body: "Home, category, product, cart and checkout pages, designed for mobile first.",
        duration: "Weeks 1–3",
      },
      {
        title: "Development and integrations",
        body: "Store development with payment, courier, invoicing and inventory integrations.",
        duration: "Weeks 3–7",
      },
      {
        title: "Catalogue and testing",
        body: "Product import, followed by test orders across every payment method and courier.",
        duration: "Weeks 7–9",
      },
      {
        title: "Launch and optimisation",
        body: "Go-live, monitoring of the first orders and checkout optimisation over the following two weeks.",
        duration: "Weeks 9–10",
      },
    ],
    priceNote:
      "Platform subscriptions, payment gateway fees and courier charges are billed directly by the respective providers.",
    commitments: [
      "Test orders on every payment method",
      "Checkout tested on a range of devices",
      "Admin training for your order team",
      "Two weeks of post-launch monitoring",
    ],
    faqs: [
      {
        question: "Should I choose Shopify or WooCommerce?",
        answer:
          "Shopify offers the fastest route to launch for a monthly subscription. WooCommerce provides greater control and lower running costs on managed hosting.",
      },
      {
        question: "Which payment gateways do you integrate?",
        answer:
          "We integrate Razorpay, Cashfree, PayU and PhonePe for domestic payments and Stripe for international cards.",
      },
      {
        question: "Can the store integrate with our accounting or warehouse software?",
        answer:
          "Yes. We integrate with Tally, Zoho Inventory, Unicommerce and custom ERP systems through APIs or scheduled imports.",
      },
      {
        question: "How long does it take to launch a store?",
        answer:
          "A Shopify or WooCommerce store typically takes four to six weeks. Custom builds and complex integrations take eight to ten weeks.",
      },
      {
        question: "How much does an e-commerce store cost?",
        answer:
          "E-commerce stores start at ₹60,000. The final price depends on the platform, catalogue size and integrations required.",
      },
      {
        question: "Do you offer marketing after launch?",
        answer:
          "Yes. Our SEO and digital marketing service covers Google Shopping, Meta catalogue advertising and abandoned-cart campaigns.",
      },
    ],
    related: ["seo-marketing", "product-design", "support-maintenance"],
  },
  {
    slug: "web-development",
    name: "Web application development",
    shortName: "Web app",
    summary: "Custom portals, dashboards and SaaS platforms engineered for scale.",
    description:
      "Custom web applications, including customer portals, dashboards and SaaS products, built on Next.js, TypeScript and PostgreSQL. Each application is developed in structured sprints with dedicated staging and production environments.",
    icon: "code",
    accent: ["#8b5cf6", "#6366f1"],
    priceFrom: 120_000,
    typicalTimeline: "8–12 weeks",
    outcomes: [
      "Working software from the first sprint",
      "Secure, scalable architecture",
      "Full visibility through weekly demos",
    ],
    deliverables: [
      "Technical architecture and scope",
      "Clickable prototype",
      "Staging environment from week two",
      "Production deployment on AWS or Vercel",
      "Source code and technical documentation",
      "Error tracking, analytics and uptime monitoring",
    ],
    stack: [
      "Next.js",
      "React",
      "TypeScript",
      "Node.js",
      "PostgreSQL",
      "Prisma",
      "AWS",
      "Vercel",
      "Sentry",
    ],
    featured: true,
    group: "build",
    headline: "Web applications engineered for scale",
    subheadline:
      "We build customer portals, dashboards, booking systems and SaaS platforms on Next.js, TypeScript and PostgreSQL, with weekly demonstrations of working software.",
    seoTitle: "Custom Web Application Development",
    seoDescription:
      "Custom web applications, customer portals, dashboards and SaaS platforms on Next.js and PostgreSQL, with fixed scope, weekly demos and secure deployment.",
    audience: [
      {
        title: "SaaS founders",
        body: "Founders with a validated idea who need a product that customers can subscribe to and use.",
      },
      {
        title: "Businesses digitising processes",
        body: "Organisations replacing email, phone and spreadsheet workflows with a self-service portal.",
      },
      {
        title: "Teams with unfinished projects",
        body: "Companies with an incomplete codebase that needs an independent audit and a dependable team to complete it.",
      },
    ],
    problems: [
      {
        problem: "Scope creep and delays",
        solution:
          "A fixed scope agreed before development, two-week sprints and change requests priced before they are built.",
      },
      {
        problem: "Poor performance under load",
        solution: "Performance budgets, load testing before launch and production monitoring.",
      },
      {
        problem: "Limited project visibility",
        solution:
          "Access to the code repository, a staging environment from week two and weekly demonstrations.",
      },
      {
        problem: "Vendor dependency",
        solution: "Documented, conventional code that any qualified developer can maintain.",
      },
    ],
    features: [
      {
        title: "User accounts and roles",
        body: "Email, OTP and Google sign-in, with role-based access for administrators, staff and customers.",
      },
      {
        title: "Payments and subscriptions",
        body: "One-time payments, recurring plans, invoicing and GST through Razorpay or Stripe.",
      },
      {
        title: "Admin dashboard",
        body: "Secure management of users, orders, content and reports.",
      },
      {
        title: "Integrations",
        body: "Connections to your CRM, ERP, accounting software, WhatsApp Business and email platforms.",
      },
      {
        title: "Notifications",
        body: "Email, SMS and WhatsApp alerts for sign-ups, payments and status updates.",
      },
      {
        title: "Production infrastructure",
        body: "CI/CD pipelines, separate staging and production environments, error tracking and uptime alerts.",
      },
    ],
    process: [
      {
        title: "Scoping workshop",
        body: "We map users, workflows and essential features, then confirm a fixed scope and price.",
        duration: "Week 1",
      },
      {
        title: "UX and prototype",
        body: "Wireframes and a clickable Figma prototype, reviewed with you before development begins.",
        duration: "Weeks 1–3",
      },
      {
        title: "Sprint development",
        body: "Two-week sprints with a weekly demonstration on a live staging environment.",
        duration: "Weeks 3–10",
      },
      {
        title: "Quality assurance",
        body: "Automated tests, manual testing on real devices, security checks and load testing.",
        duration: "Weeks 10–11",
      },
      {
        title: "Launch and handover",
        body: "Production deployment, monitoring and a handover session with your team.",
        duration: "Week 12",
      },
      {
        title: "Post-launch support",
        body: "Bug fixes and minor changes after launch, followed by an optional maintenance plan.",
        duration: "6–8 months",
      },
    ],
    priceNote:
      "Starting price for a focused MVP. The final quote depends on user roles, payments, integrations and the number of screens.",
    commitments: [
      "Staging environment from week two",
      "Weekly demonstrations of progress",
      "Core Web Vitals targets met at launch",
      "Six to eight months of post-launch support",
    ],
    faqs: [
      {
        question: "How much does a web application cost?",
        answer:
          "Web applications start at ₹1,20,000 for a focused MVP. A fixed quote is provided after a scoping call.",
      },
      {
        question: "Do you work on a fixed-price or hourly basis?",
        answer:
          "We work on a fixed price for a defined scope. Additional requirements are priced and approved before development.",
      },
      {
        question: "Why do you use Next.js and PostgreSQL?",
        answer:
          "Both are widely adopted, well documented and supported by a large developer community, which keeps long-term maintenance straightforward.",
      },
      {
        question: "Can you take over an existing application?",
        answer:
          "Yes. We begin with a code audit of one to two weeks, then provide a recommendation and a quote to complete the work.",
      },
      {
        question: "Will you sign a non-disclosure agreement?",
        answer:
          "Yes. We sign NDAs before detailed discussions, and our standard contract assigns all intellectual property to you.",
      },
      {
        question: "Can the application be extended to mobile?",
        answer:
          "Yes. We build the backend as an API, so a mobile app can share the same accounts, data and payments.",
      },
    ],
    related: ["product-design", "app-development", "managed-hosting"],
  },
  {
    slug: "app-development",
    name: "Mobile app development",
    shortName: "Apps",
    summary: "High-performance iOS and Android apps built on modern cross-platform frameworks.",
    description:
      "iOS and Android apps built from a single React Native or Flutter codebase. We manage the complete lifecycle, from design and development to offline support, push notifications and app store submission.",
    icon: "smartphone",
    accent: ["#8b5cf6", "#ec4899"],
    priceFrom: 220_000,
    typicalTimeline: "8–16 weeks",
    outcomes: [
      "One codebase for iOS and Android",
      "Reliable offline performance",
      "Managed app store submission",
    ],
    deliverables: [
      "User flows and interface designs",
      "iOS and Android apps from one codebase",
      "API backend and admin panel",
      "App Store and Play Store listings",
      "Crash reporting and analytics",
      "Source code and documentation",
    ],
    stack: [
      "React Native",
      "Flutter",
      "Expo",
      "TypeScript",
      "Firebase",
      "Node.js",
      "Sentry",
      "Fastlane",
    ],
    featured: true,
    group: "build",
    headline: "Mobile apps for iOS and Android from a single codebase",
    subheadline:
      "We develop high-performance cross-platform apps in React Native or Flutter, with offline support, push notifications, crash monitoring and app store submission.",
    seoTitle: "Mobile App Development Company in Gurugram",
    seoDescription:
      "Mobile app development in Gurugram: cross-platform iOS and Android apps in React Native or Flutter, with offline sync, payments and app store launch.",
    audience: [
      {
        title: "Customer-facing businesses",
        body: "Companies offering ordering, booking, loyalty or service experiences that customers use regularly.",
      },
      {
        title: "Field-based teams",
        body: "Sales, service and delivery teams that need dependable apps on variable mobile networks.",
      },
      {
        title: "Mobile-first startups",
        body: "Consumer and marketplace products in which the app is central to the business.",
      },
    ],
    problems: [
      {
        problem: "High cost of separate native apps",
        solution:
          "A single cross-platform codebase that releases features to iOS and Android at the same time.",
      },
      {
        problem: "Unreliable connectivity",
        solution: "Offline-first data storage with automatic synchronisation when the connection returns.",
      },
      {
        problem: "App store review delays",
        solution:
          "Complete preparation of listings, privacy declarations and review notes ahead of submission.",
      },
      {
        problem: "Undetected crashes",
        solution: "Crash reporting with device-level detail and prioritised fixes in every release.",
      },
    ],
    features: [
      {
        title: "Cross-platform interface",
        body: "Native-quality screens for iOS and Android from a single codebase.",
      },
      {
        title: "Authentication",
        body: "Phone OTP, Google and Apple sign-in with secure session management.",
      },
      {
        title: "Push notifications",
        body: "Order updates and reminders through Firebase Cloud Messaging, with deep linking.",
      },
      {
        title: "In-app payments",
        body: "Razorpay and UPI payments, with in-app purchases where store policies require them.",
      },
      {
        title: "Offline support",
        body: "Forms, photos and data captured offline and synchronised automatically.",
      },
      {
        title: "Over-the-air updates",
        body: "Minor fixes delivered through Expo EAS Update without a full store review.",
      },
    ],
    process: [
      {
        title: "Product scoping",
        body: "We define users, core workflows and device features, and recommend React Native or Flutter.",
        duration: "Weeks 1–2",
      },
      {
        title: "Design and prototype",
        body: "Interface designs for both platforms and a clickable prototype to review on your own device.",
        duration: "Weeks 2–4",
      },
      {
        title: "Development sprints",
        body: "Two-week sprints with test builds distributed through TestFlight and Google Play internal testing.",
        duration: "Weeks 4–12",
      },
      {
        title: "Beta and quality assurance",
        body: "Testing across a range of iOS and Android devices, followed by a beta with real users.",
        duration: "Weeks 12–14",
      },
      {
        title: "Store submission",
        body: "Preparation and submission of store listings, screenshots and privacy declarations.",
        duration: "Weeks 14–16",
      },
    ],
    priceNote:
      "Apple Developer Program (US$99 per year) and Google Play (US$25 one-time) fees are paid directly by your company.",
    commitments: [
      "Test builds every sprint",
      "Testing on a wide range of devices",
      "Crash reporting from the first beta",
      "Store submission managed by our team",
    ],
    faqs: [
      {
        question: "Should we choose React Native or Flutter?",
        answer:
          "Both produce high-quality apps. We recommend React Native where you have a React web product and Flutter for interfaces with extensive custom animation.",
      },
      {
        question: "How much does a mobile app cost?",
        answer:
          "Mobile apps start at ₹2,20,000. The final price depends on the number of screens, integrations, offline requirements and the admin backend.",
      },
      {
        question: "Does the app need a backend?",
        answer:
          "In most cases, yes. We develop the backend and an admin panel alongside the app.",
      },
      {
        question: "Who publishes the app to the stores?",
        answer:
          "We manage submission through developer accounts registered to your company, so the listings remain yours.",
      },
      {
        question: "What support is available after launch?",
        answer:
          "Our maintenance plans cover operating system updates, library upgrades, crash fixes and minor enhancements.",
      },
      {
        question: "Can you improve an existing app?",
        answer:
          "Yes. We audit the codebase and store configuration, then recommend whether to optimise, upgrade or rebuild.",
      },
    ],
    related: ["product-design", "web-development", "support-maintenance"],
  },
  {
    slug: "product-design",
    name: "UI/UX & branding",
    shortName: "Design",
    summary: "Brand identities and user experiences that are clear, consistent and memorable.",
    description:
      "Brand identities, logos and digital product interfaces designed in Figma. Our designers work alongside our engineers, so every approved design translates accurately into the finished product.",
    icon: "palette",
    accent: ["#ec4899", "#6366f1"],
    priceFrom: 90_000,
    typicalTimeline: "2–6 weeks",
    outcomes: [
      "A consistent brand across every channel",
      "Validated prototypes before development",
      "Accessibility built into every design",
    ],
    deliverables: [
      "Logo files in SVG, PNG and PDF",
      "Brand guidelines",
      "Social media and stationery templates",
      "User flows and wireframes",
      "High-fidelity interface designs",
      "Design system and clickable prototype",
    ],
    stack: ["Figma", "FigJam", "Illustrator", "Photoshop", "Canva", "Storybook"],
    featured: false,
    group: "grow",
    headline: "Brand identities and digital experiences that build trust",
    subheadline:
      "We create logos, brand identities and website and app interfaces in Figma, working closely with the engineers who build them.",
    seoTitle: "UI/UX Design & Branding Agency in Gurugram",
    seoDescription:
      "Logo design, brand identity and UI/UX design for websites and apps, with brand guidelines, design systems and prototypes ready for development.",
    audience: [
      {
        title: "New businesses",
        body: "Companies that need a professional logo, colour palette, typography and brand assets.",
      },
      {
        title: "Growing brands",
        body: "Businesses whose visual identity has become inconsistent across channels.",
      },
      {
        title: "Product teams",
        body: "Teams that need user flows and interface designs for a web or mobile application.",
      },
    ],
    problems: [
      {
        problem: "Inconsistent branding",
        solution:
          "Brand guidelines covering logo usage, colours and typography, with ready-to-use templates.",
      },
      {
        problem: "Confusing user flows",
        solution: "Mapped user flows and prototypes tested with real users before development.",
      },
      {
        problem: "Gaps between design and development",
        solution: "A Figma design system with components that correspond directly to the code.",
      },
      {
        problem: "Accessibility gaps",
        solution:
          "Contrast, text size, focus states and touch targets reviewed against WCAG 2.2 AA.",
      },
    ],
    features: [
      {
        title: "Logo and visual identity",
        body: "Logo concepts, primary and secondary marks, a colour palette and typography.",
      },
      {
        title: "Brand guidelines",
        body: "A concise guide to logo usage, colours and typography.",
      },
      {
        title: "Marketing templates",
        body: "Social media, business card, letterhead and presentation templates in Canva or Figma.",
      },
      {
        title: "UX research and wireframes",
        body: "User interviews, task flows and wireframes for every key screen.",
      },
      {
        title: "Interface design",
        body: "High-fidelity mobile and desktop screens, including empty, loading and error states.",
      },
      {
        title: "Design system and prototype",
        body: "Reusable Figma components and a clickable prototype for user testing and stakeholder reviews.",
      },
    ],
    process: [
      {
        title: "Discovery",
        body: "We study your customers, your competitors and the core message the brand or product must convey.",
        duration: "Week 1",
      },
      {
        title: "Concepts",
        body: "Two or three creative directions, each presented with its rationale.",
        duration: "Weeks 1–2",
      },
      {
        title: "Refinement",
        body: "The selected direction is developed across your website, app, packaging and social channels.",
        duration: "Weeks 2–4",
      },
      {
        title: "Prototype and testing",
        body: "For digital products, a clickable prototype is tested with five users and refined.",
        duration: "Weeks 3–5",
      },
      {
        title: "Handover",
        body: "Final files, brand guidelines, a Figma library and a walkthrough with your developers.",
        duration: "Weeks 5–6",
      },
    ],
    priceNote:
      "Brand identity, website design and app design projects are priced separately according to scope.",
    commitments: [
      "Two rounds of revisions at each stage",
      "Accessibility reviewed against WCAG 2.2 AA",
      "Designs reviewed by our engineers",
      "Complete Figma library at handover",
    ],
    faqs: [
      {
        question: "How many logo concepts will we receive?",
        answer:
          "You will receive two or three distinct concepts. We then refine your preferred direction with two rounds of revisions.",
      },
      {
        question: "Do we own the final designs?",
        answer:
          "Yes. Copyright in the final logo, brand assets and design files transfers to you on final payment.",
      },
      {
        question: "Can you design for an app that another team will build?",
        answer:
          "Yes. We provide a Figma library, specifications and assets, and remain available to your developers during the build.",
      },
      {
        question: "How much does UI/UX design cost?",
        answer:
          "Design projects start at ₹90,000. The price depends on the number of screens, the research required and whether branding is included.",
      },
      {
        question: "Do you test designs with users?",
        answer:
          "Yes. For digital products, we run usability sessions on a clickable prototype and refine the design before development.",
      },
    ],
    related: ["business-websites", "app-development", "web-development"],
  },
  {
    slug: "seo-marketing",
    name: "SEO & digital marketing",
    shortName: "Marketing",
    summary: "Search, paid media and content strategies focused on measurable growth.",
    description:
      "Search engine optimisation, Google Ads and social media campaigns managed by one team. Conversion tracking is configured first, so every channel is measured against the enquiries it generates.",
    icon: "megaphone",
    accent: ["#f59e0b", "#10b981"],
    priceFrom: 15_000,
    typicalTimeline: "Ongoing, with monthly reporting",
    outcomes: [
      "Higher rankings for priority keywords",
      "Ad spend measured against leads",
      "Clear monthly performance reports",
    ],
    deliverables: [
      "SEO audit and prioritised action plan",
      "Keyword strategy for key pages",
      "Optimised Google Business Profile",
      "Ad campaigns with conversion tracking",
      "Looker Studio dashboard",
      "Monthly report and planning call",
    ],
    stack: [
      "Google Search Console",
      "GA4",
      "Google Tag Manager",
      "Google Ads",
      "Meta Ads Manager",
      "Semrush",
      "Screaming Frog",
      "Looker Studio",
    ],
    featured: false,
    group: "grow",
    headline: "Search and paid campaigns that generate qualified enquiries",
    subheadline:
      "We bring technical SEO, local search, Google Ads and Meta campaigns together under one team, with conversion tracking in place before any budget is spent.",
    seoTitle: "SEO Services in Gurugram & Digital Marketing",
    seoDescription:
      "SEO services in Gurugram: SEO audits, local SEO, Google Ads and Meta campaigns with conversion tracking and monthly reports on leads and rankings.",
    audience: [
      {
        title: "Local businesses",
        body: "Clinics, showrooms, institutes and service providers that need visibility in local and map searches.",
      },
      {
        title: "Businesses with low website traffic",
        body: "Companies with a well-designed website that is not yet attracting enough visitors.",
      },
      {
        title: "Advertisers seeking clarity",
        body: "Teams running Google or Meta campaigns without clear attribution to enquiries.",
      },
    ],
    problems: [
      {
        problem: "Low search rankings",
        solution:
          "Keyword research based on real search demand, with pages optimised for priority terms.",
      },
      {
        problem: "Incomplete Google Business Profile",
        solution:
          "A fully optimised profile with categories, services, photos and a review collection process.",
      },
      {
        problem: "Low return on ad spend",
        solution:
          "Conversion tracking, campaigns structured by service and location, and weekly bid management.",
      },
      {
        problem: "Unclear reporting",
        solution:
          "Monthly reports on enquiries, cost per lead and rankings, with a plan for the following month.",
      },
    ],
    features: [
      {
        title: "Technical SEO",
        body: "Resolution of crawl errors, indexing issues, page speed, schema and Core Web Vitals.",
      },
      {
        title: "On-page and content SEO",
        body: "Target keywords for each page, optimised titles and headings, and a content plan based on search demand.",
      },
      {
        title: "Local SEO",
        body: "Google Business Profile optimisation, local citations, location pages and review generation.",
      },
      {
        title: "Google Ads",
        body: "Search, Performance Max and Shopping campaigns with conversion and call tracking.",
      },
      {
        title: "Meta advertising",
        body: "Facebook and Instagram campaigns, lead forms and a monthly content calendar.",
      },
      {
        title: "Analytics and reporting",
        body: "GA4, Google Tag Manager and a Looker Studio dashboard linked to enquiries.",
      },
    ],
    process: [
      {
        title: "Audit and tracking",
        body: "We audit your website, campaigns and Business Profile, then configure GA4, Tag Manager and call tracking.",
        duration: "Weeks 1–2",
      },
      {
        title: "Strategy",
        body: "We agree keywords, channels, budget allocation and a target cost per enquiry.",
        duration: "Week 2",
      },
      {
        title: "Implementation",
        body: "Technical fixes, on-page improvements and the launch of the first campaigns.",
        duration: "Weeks 3–4",
      },
      {
        title: "Optimisation",
        body: "Weekly bid and keyword management, with new content and pages each month.",
        duration: "Ongoing",
      },
      {
        title: "Reporting and planning",
        body: "A monthly report on leads, spend and rankings, followed by a planning call.",
        duration: "Monthly",
      },
    ],
    priceNote:
      "Advertising spend is paid directly to Google and Meta from your own ad accounts and is not included in our fee.",
    commitments: [
      "Conversion tracking before any ad spend",
      "First report within 30 days",
      "Reporting on leads and cost per enquiry",
      "Weekly campaign optimisation",
    ],
    faqs: [
      {
        question: "How long does SEO take to show results?",
        answer:
          "Technical improvements can show results within weeks, while competitive rankings typically take three to six months. Paid campaigns generate traffic from launch.",
      },
      {
        question: "Do you guarantee first-page rankings?",
        answer:
          "No agency can guarantee rankings on Google. We commit to a clear strategy, consistent execution and transparent monthly reporting.",
      },
      {
        question: "Is advertising spend included in your fee?",
        answer:
          "No. Ad spend is paid directly to Google or Meta, and our fee covers strategy, set-up, campaign management and reporting.",
      },
      {
        question: "Who owns the ad accounts and data?",
        answer:
          "Your business does. All advertising and analytics accounts are registered to you, with our team added as managers.",
      },
      {
        question: "Do we need a new website before starting?",
        answer:
          "Not necessarily. We begin with an audit and recommend any improvements needed before investing in paid campaigns.",
      },
      {
        question: "How much do SEO and marketing services cost?",
        answer:
          "Monthly retainers start at ₹15,000, excluding advertising spend. The fee depends on the channels and the scope of work.",
      },
    ],
    related: ["business-websites", "ecommerce-stores", "product-design"],
  },
  {
    slug: "custom-software",
    name: "Custom software, ERP & CRM",
    shortName: "Software",
    summary: "Bespoke business systems that streamline operations and reporting.",
    description:
      "Custom ERP, CRM and internal systems that bring orders, inventory, customers, staff and billing into one platform. Each system is designed around your processes and integrated with the accounting and payment tools you already use.",
    icon: "boxes",
    accent: ["#0ea5e9", "#6366f1"],
    priceFrom: 150_000,
    typicalTimeline: "10–20 weeks",
    outcomes: [
      "A single source of truth for operations",
      "Role-based access for every team",
      "Real-time reporting on demand",
    ],
    deliverables: [
      "Documented process map",
      "Modules delivered in phases",
      "Role-based access and audit log",
      "Integrations with existing tools",
      "Data migration",
      "User manuals and team training",
    ],
    stack: [
      "React",
      "Next.js",
      "Node.js",
      "PostgreSQL",
      "Redis",
      "Tally Prime",
      "Zoho Books",
      "Odoo",
      "WhatsApp Business API",
      "AWS",
    ],
    featured: false,
    group: "scale",
    headline: "Custom ERP and CRM software that streamlines operations",
    subheadline:
      "We build ERP, CRM and internal tools around the way your business operates, integrated with Tally, Zoho, Razorpay and WhatsApp.",
    seoTitle: "Custom Software Development: ERP & CRM",
    seoDescription:
      "Custom ERP, CRM and internal business software designed around your processes and integrated with Tally, Zoho and WhatsApp, with full data migration.",
    audience: [
      {
        title: "Spreadsheet-driven businesses",
        body: "SMEs managing orders, stock and billing across spreadsheets and messaging groups.",
      },
      {
        title: "Manufacturers and distributors",
        body: "Organisations that need dispatch, inventory, dealer orders and collections in one system.",
      },
      {
        title: "Teams outgrowing packaged software",
        body: "Businesses whose processes no longer fit off-the-shelf tools such as Zoho, Odoo or Salesforce.",
      },
    ],
    problems: [
      {
        problem: "Fragmented data",
        solution:
          "A single database for orders, customers, inventory and staff, with search and a complete history.",
      },
      {
        problem: "Limited management visibility",
        solution:
          "Live dashboards for sales, stock, receivables and team performance on desktop and mobile.",
      },
      {
        problem: "Uncontrolled data access",
        solution:
          "Role-based permissions by branch, department and job role, with a complete audit trail.",
      },
      {
        problem: "Disconnected tools",
        solution:
          "Integrations with Tally, Zoho Books, Odoo, Razorpay, the WhatsApp Business API and your website.",
      },
    ],
    features: [
      {
        title: "Tailored modules",
        body: "Orders, inventory, purchasing, CRM, HR, attendance and service management, selected to suit your operations.",
      },
      {
        title: "Workflows and approvals",
        body: "Multi-step approvals, reminders and status updates aligned with your processes.",
      },
      {
        title: "Dashboards and reports",
        body: "Live reports with Excel export, filtered by branch, product or salesperson.",
      },
      {
        title: "Two-way integrations",
        body: "Synchronisation with your accounting software, payment gateway, WhatsApp and online store.",
      },
      {
        title: "Mobile access",
        body: "Responsive access on any device, with an optional Android app for field and warehouse staff.",
      },
      {
        title: "Migration and training",
        body: "Migration of existing data and role-specific training for each team.",
      },
    ],
    process: [
      {
        title: "Process mapping",
        body: "We work with your team to document each process as it operates today.",
        duration: "Weeks 1–2",
      },
      {
        title: "System design",
        body: "We agree modules, roles, reports and integrations, with key screens prototyped in Figma.",
        duration: "Weeks 2–4",
      },
      {
        title: "Phased development",
        body: "The highest-priority module is released first, followed by the remaining modules in two-week sprints.",
        duration: "Weeks 4–16",
      },
      {
        title: "Migration and training",
        body: "Existing data is imported and reconciled, followed by hands-on training for each team.",
        duration: "Weeks 16–18",
      },
      {
        title: "Go-live",
        body: "A parallel run alongside existing processes, followed by a supported cut-over.",
        duration: "Weeks 18–20",
      },
    ],
    priceNote:
      "Starting price for one or two modules. Larger systems are delivered in phases and billed by milestone.",
    commitments: [
      "First module live before full completion",
      "Complete audit trail of every change",
      "No per-user licence fees",
      "Hands-on training for every team",
    ],
    faqs: [
      {
        question: "Why choose custom software over Zoho or Odoo?",
        answer:
          "Packaged software works well when your processes match its design. We first assess whether a configured off-the-shelf tool is sufficient and recommend custom development only where it adds clear value.",
      },
      {
        question: "Does it integrate with Tally?",
        answer:
          "Yes. We synchronise vouchers, ledgers and stock with Tally Prime, so accounting remains in Tally while operations move to the new system.",
      },
      {
        question: "How much does custom software cost?",
        answer:
          "Projects start at ₹1,50,000 for one or two modules. Larger ERP and CRM systems are delivered in phases and billed by milestone.",
      },
      {
        question: "What happens to our existing data?",
        answer:
          "We clean and import data from Excel, Google Sheets or legacy software, and reconcile it with your team before go-live.",
      },
      {
        question: "Can staff use the system on mobile?",
        answer:
          "Yes. The system works in any mobile browser, and an Android app can be added for offline access or barcode scanning.",
      },
      {
        question: "Who owns the software?",
        answer:
          "You do. The source code, database and cloud account are registered to your business.",
      },
    ],
    related: ["web-development", "ai-integration", "support-maintenance"],
  },
  {
    slug: "ai-integration",
    name: "AI & automation",
    shortName: "AI",
    summary: "Intelligent assistants and workflow automation that improve efficiency.",
    description:
      "AI assistants and workflow automation designed for specific business tasks, from answering customer queries to processing documents and routing leads. Each automation is tested for accuracy and cost before launch.",
    icon: "sparkles",
    accent: ["#f59e0b", "#ef4444"],
    priceFrom: 180_000,
    typicalTimeline: "3–8 weeks",
    outcomes: [
      "Accurate answers from your own documents",
      "Less time spent on manual data entry",
      "Predictable, capped running costs",
    ],
    deliverables: [
      "Workflow review and feasibility report",
      "Evaluation set based on your data",
      "Production assistant or automation",
      "Admin dashboard with conversation logs",
      "Spending limits and usage reports",
      "Operations runbook",
    ],
    stack: [
      "OpenAI API",
      "Claude API",
      "n8n",
      "Make",
      "WhatsApp Business API",
      "pgvector",
      "Python",
      "FastAPI",
    ],
    featured: false,
    group: "scale",
    headline: "AI assistants and automation that reduce manual work",
    subheadline:
      "We build assistants that answer from your own documents, automate data entry and route leads instantly. Each one is tested for accuracy and cost before it goes live.",
    seoTitle: "AI Chatbots & Business Automation Services",
    seoDescription:
      "AI chatbots trained on your documents, WhatsApp assistants, document extraction and workflow automation, tested for accuracy and cost before launch.",
    audience: [
      {
        title: "Customer support teams",
        body: "Teams answering recurring questions about pricing, orders and policies across the website and WhatsApp.",
      },
      {
        title: "Operations teams",
        body: "Staff re-entering invoices, purchase orders and forms from PDFs and emails.",
      },
      {
        title: "Sales teams",
        body: "Teams receiving enquiries from websites, advertising and marketplaces that need faster follow-up.",
      },
    ],
    problems: [
      {
        problem: "Slow customer response times",
        solution:
          "Website and WhatsApp assistants that answer from your documents, cite their sources and escalate to your team when required.",
      },
      {
        problem: "Manual data entry",
        solution:
          "Document extraction that captures invoices, purchase orders and forms in your ERP, with a review queue for exceptions.",
      },
      {
        problem: "Delayed lead follow-up",
        solution:
          "Automated capture, scoring and assignment of every lead, with instant WhatsApp alerts to your sales team.",
      },
      {
        problem: "AI pilots that stall",
        solution:
          "Accuracy targets, test sets from your data, spending limits and logging, agreed before development begins.",
      },
    ],
    features: [
      {
        title: "Knowledge-base assistant",
        body: "Answers drawn from your PDFs, website and FAQs, with source citations.",
      },
      {
        title: "WhatsApp assistant",
        body: "Order status, bookings and FAQs on the WhatsApp Business API, with handoff to your team.",
      },
      {
        title: "Document extraction",
        body: "Invoices, receipts and forms converted into structured data and validated against your rules.",
      },
      {
        title: "Workflow automation",
        body: "n8n, Make or Zapier workflows connecting your CRM, spreadsheets, email and accounting.",
      },
      {
        title: "Lead routing",
        body: "Enquiries from every channel captured, scored and assigned automatically.",
      },
      {
        title: "Governance and monitoring",
        body: "Logging, spending limits, personal data masking and human review for uncertain cases.",
      },
    ],
    process: [
      {
        title: "Workflow review",
        body: "We identify one high-value task, measure current performance and agree an accuracy target.",
        duration: "Week 1",
      },
      {
        title: "Proof of concept",
        body: "A working prototype tested on your own documents and questions.",
        duration: "Weeks 2–3",
      },
      {
        title: "Build and integration",
        body: "Integration with your website, WhatsApp, CRM or ERP, with safeguards and logging.",
        duration: "Weeks 3–6",
      },
      {
        title: "Evaluation",
        body: "We test against the evaluation set, review the results with your team and refine until the target is met.",
        duration: "Weeks 6–7",
      },
      {
        title: "Launch and monitoring",
        body: "Go-live with spending limits and weekly accuracy reviews during the first month.",
        duration: "Weeks 7–8",
      },
    ],
    priceNote:
      "AI model usage is billed per request by the provider. We estimate monthly running costs before launch and set a spending limit.",
    commitments: [
      "Accuracy target agreed before development",
      "Monthly AI spend capped and reported",
      "Human handoff for uncertain cases",
      "Your data excluded from model training",
    ],
    faqs: [
      {
        question: "How do you prevent inaccurate answers?",
        answer:
          "The assistant answers only from approved documents and cites its sources. When confidence is low, it transfers the conversation to your team.",
      },
      {
        question: "What does it cost to build and run?",
        answer:
          "Builds start at ₹1,80,000. Running costs depend on usage and are estimated and capped before launch.",
      },
      {
        question: "Is our data secure?",
        answer:
          "Yes. Data remains in a secure cloud account under contract, and we use business API terms that exclude your data from model training.",
      },
      {
        question: "Which AI models do you use?",
        answer:
          "We select from OpenAI, Anthropic Claude and open-source models based on accuracy and cost for your use case.",
      },
      {
        question: "Can the assistant work on WhatsApp?",
        answer:
          "Yes. We integrate through the official WhatsApp Business API, either directly or through a provider such as Gupshup or Interakt.",
      },
      {
        question: "Do we need AI or rule-based automation?",
        answer:
          "Many workflows only require rule-based automation, which costs less to build and run. We recommend the most suitable option during the workflow review.",
      },
    ],
    related: ["custom-software", "web-development", "support-maintenance"],
  },
  {
    slug: "managed-hosting",
    name: "Hosting & domains",
    shortName: "Hosting",
    summary: "Secure managed hosting, domains and business email with proactive monitoring.",
    description:
      "Managed hosting, domain management, SSL, business email and backups for websites and applications. Our team monitors your infrastructure around the clock and responds promptly to any incident.",
    icon: "server",
    accent: ["#06b6d4", "#10b981"],
    priceFrom: 25_000,
    typicalTimeline: "3–7 days to migrate",
    outcomes: [
      "Uptime backed by a written SLA",
      "Nightly backups with monthly restore tests",
      "Renewals tracked and managed",
    ],
    deliverables: [
      "Domain and DNS configuration",
      "Hosting set-up or migration",
      "SSL, CDN and firewall",
      "Business email configuration",
      "Backups and monitoring",
      "Access register with renewal dates",
    ],
    stack: [
      "AWS",
      "Vercel",
      "Cloudflare",
      "Docker",
      "Grafana",
      "Google Workspace",
      "Zoho Mail",
    ],
    featured: false,
    group: "run",
    headline: "Secure, monitored hosting for your websites and applications",
    subheadline:
      "We manage your domains, hosting, SSL and business email, with 24×7 monitoring and infrastructure billed at cost.",
    seoTitle: "Managed Website Hosting, Domains & Email",
    seoDescription:
      "Managed hosting on AWS, Vercel and Cloudflare with SSL, nightly backups and 24×7 monitoring, plus domain registration and business email set-up.",
    audience: [
      {
        title: "Websites with frequent downtime",
        body: "Businesses on low-cost shared hosting that need reliable performance and responsive support.",
      },
      {
        title: "Businesses with unclear access",
        body: "Organisations unsure who holds domain credentials, when certificates expire or where backups are stored.",
      },
      {
        title: "Revenue-critical applications",
        body: "Stores, portals and SaaS products where downtime has a direct commercial impact.",
      },
    ],
    problems: [
      {
        problem: "Undetected downtime",
        solution:
          "Uptime checks every five minutes, with alerts to our on-call engineer and status updates to your team.",
      },
      {
        problem: "Expired domains or certificates",
        solution: "Renewals tracked and automated, with reminders well in advance.",
      },
      {
        problem: "Untested backups",
        solution:
          "Nightly backups retained for 14–30 days, with monthly restore tests on Business plans.",
      },
      {
        problem: "Slow performance for Indian visitors",
        solution:
          "Cloudflare CDN, image optimisation and hosting in Indian regions such as AWS Mumbai.",
      },
    ],
    features: [
      {
        title: "Domains and DNS",
        body: "Domain registration and transfers, DNS on Cloudflare and fully documented records.",
      },
      {
        title: "Hosting and migration",
        body: "AWS, Vercel or managed WordPress hosting, with zero-downtime migration.",
      },
      {
        title: "SSL, CDN and firewall",
        body: "SSL on every domain, Cloudflare CDN, a web application firewall and bot protection.",
      },
      {
        title: "Business email",
        body: "Google Workspace or Zoho Mail with SPF, DKIM and DMARC for reliable delivery.",
      },
      {
        title: "Backups and restores",
        body: "Nightly backups with 14–30 day retention and regular restore testing.",
      },
      {
        title: "24×7 monitoring",
        body: "Uptime, error and performance monitoring with on-call escalation on Business plans.",
      },
    ],
    process: [
      {
        title: "Audit",
        body: "We document every domain, server, login and renewal date in your current set-up.",
        duration: "Days 1–2",
      },
      {
        title: "Planning",
        body: "We recommend the right plan and hosting, and schedule the migration for a low-traffic period.",
        duration: "Days 2–3",
      },
      {
        title: "Migration",
        body: "Your site is copied and tested on a staging URL before DNS is switched without downtime.",
        duration: "Days 3–6",
      },
      {
        title: "Monitoring",
        body: "Uptime checks, backups and alerts are activated, and you receive a complete access register.",
        duration: "Day 7",
      },
      {
        title: "Ongoing management",
        body: "Security patches, renewals and a monthly health report, managed by our team.",
        duration: "Ongoing",
      },
    ],
    priceLabel: "Set-up from ₹25,000",
    priceNote:
      "Monthly plans: Essential ₹8,000, Business ₹25,000 and Critical ₹65,000. Cloud, domain and email fees are billed at cost.",
    commitments: [
      "99.95% uptime SLA on Business, 99.99% on Critical",
      "Infrastructure billed at cost",
      "Monthly restore test on Business and Critical",
      "First response within 30 minutes on Business",
    ],
    faqs: [
      {
        question: "Why choose managed hosting over shared hosting?",
        answer:
          "Shared hosting can suit a small brochure site. Once your business depends on its website, managed hosting provides tested backups, monitoring and a responsive support team.",
      },
      {
        question: "Will the migration cause downtime?",
        answer:
          "No. We test a full copy on a staging URL and switch DNS during a low-traffic period. Email continues without interruption.",
      },
      {
        question: "Who owns the domain and hosting?",
        answer:
          "Your business does. Domains and cloud accounts are registered to you, and we operate as an authorised user.",
      },
      {
        question: "Can you host a website you did not build?",
        answer:
          "Yes. We host WordPress, Next.js, Laravel, Node.js and static sites after an initial audit.",
      },
      {
        question: "What do the monthly plans include?",
        answer: `Essential (₹8,000 per month) covers managed deployments, CDN, nightly backups and uptime checks. Business (₹25,000) adds 24×7 on-call support, a web application firewall and a 99.95% SLA, while Critical (₹65,000) adds multi-region failover and a 15-minute response. Plan clients can email ${site.supportEmail} with any request.`,
      },
      {
        question: "Do you set up business email?",
        answer:
          "Yes. We configure Google Workspace or Zoho Mail on your domain, with SPF, DKIM and DMARC for reliable delivery.",
      },
    ],
    related: ["support-maintenance", "business-websites", "web-development"],
  },
  {
    slug: "support-maintenance",
    name: "Maintenance & support",
    shortName: "Support",
    summary: "Ongoing updates, security patches and technical support for your platforms.",
    description:
      "Ongoing maintenance for websites and applications, including updates, security patches, bug fixes and content changes. A dedicated team works to published response times for a fixed monthly fee.",
    icon: "shield",
    accent: ["#10b981", "#6366f1"],
    priceFrom: 40_000,
    typicalTimeline: "One-week onboarding",
    outcomes: [
      "Fast response to critical issues",
      "Software kept current and secure",
      "Monthly health reporting",
    ],
    deliverables: [
      "Onboarding audit report",
      "Staging environment for safe updates",
      "Monthly updates and security patches",
      "Bug fixes and minor changes",
      "Monitoring and alerting",
      "Monthly health report",
    ],
    stack: [
      "Sentry",
      "GitHub Actions",
      "Dependabot",
      "Wordfence",
      "Cloudflare",
      "Grafana",
      "PagerDuty",
    ],
    featured: false,
    group: "run",
    headline: "Maintenance and support that keep your platforms secure",
    subheadline:
      "We manage updates, security patches, bug fixes and minor enhancements every month, with a dedicated team and published response times.",
    seoTitle: "Website & App Maintenance Services",
    seoDescription:
      "Website and app maintenance plans covering security patches, plugin and dependency updates, bug fixes, monitoring and monthly health reports.",
    audience: [
      {
        title: "Businesses without a developer",
        body: "Companies whose original developer or agency is no longer available.",
      },
      {
        title: "WordPress websites",
        body: "Sites with many plugins, where updates have been postponed because of the risk involved.",
      },
      {
        title: "Business-critical applications",
        body: "Applications in daily use that require prompt and dependable fixes.",
      },
    ],
    problems: [
      {
        problem: "Risky updates",
        solution: "Updates applied to a staging copy and tested before release to production.",
      },
      {
        problem: "Unpatched vulnerabilities",
        solution: "Monthly patching, malware scanning and automated dependency alerts.",
      },
      {
        problem: "Slow bug resolution",
        solution: "A ticketing system with published response times and a dedicated engineer.",
      },
      {
        problem: "Limited visibility",
        solution:
          "A monthly health report covering updates, uptime, performance and resolved issues.",
      },
    ],
    features: [
      {
        title: "Code and security audit",
        body: "A review of code, plugins, hosting and access before we assume responsibility.",
      },
      {
        title: "Monthly updates",
        body: "Core, plugin, library and operating system updates, tested on staging first.",
      },
      {
        title: "Bug fixes",
        body: "Pages, forms and features repaired in order of business impact.",
      },
      {
        title: "Minor enhancements",
        body: "Content edits, new sections and small features within your monthly allowance.",
      },
      {
        title: "Monitoring",
        body: "Uptime checks, error tracking and alerts routed to our on-call team.",
      },
      {
        title: "Monthly health report",
        body: "A one-page summary for management covering changes, issues and next steps.",
      },
    ],
    process: [
      {
        title: "Onboarding",
        body: "We gather access to code, hosting, domains and accounts, and document everything.",
        duration: "Days 1–3",
      },
      {
        title: "Audit",
        body: "A review of code, plugins, security and performance, with risks ranked by priority.",
        duration: "Days 3–7",
      },
      {
        title: "Stabilisation",
        body: "Urgent issues are resolved, and staging, backups and monitoring are configured.",
        duration: "Week 2",
      },
      {
        title: "Monthly maintenance",
        body: "Updates, patches, fixes and minor changes, managed through your ticket queue.",
        duration: "Monthly",
      },
      {
        title: "Review",
        body: "The monthly health report, followed by a short call to plan improvements.",
        duration: "Monthly",
      },
    ],
    priceNote:
      "Includes the onboarding audit, stabilisation and the first month. A fixed monthly fee, based on the size of your platform, applies thereafter.",
    commitments: [
      "First response within 30 minutes on critical issues",
      "Every update tested on staging",
      "A dedicated engineer for your account",
      "Pause or cancel at any time",
    ],
    faqs: [
      {
        question: "Can you maintain a site or app built by another team?",
        answer:
          "Yes. We begin with an audit to understand the code and its risks before taking responsibility for it.",
      },
      {
        question: "What counts as a minor change?",
        answer:
          "Text and image edits, new sections on existing pages, form updates and small features. Larger requests are quoted separately.",
      },
      {
        question: "How quickly do you respond?",
        answer: `Critical issues receive a response within 30 minutes on the Business plan and by the next business day on Essential. Email ${site.supportEmail} to raise a request, or call ${site.phone} for critical issues.`,
      },
      {
        question: "Do you manage WordPress plugin updates?",
        answer:
          "Yes. We update core, themes and plugins on a staging copy and test key pages before release. Unsupported plugins are replaced.",
      },
      {
        question: "Is there a minimum contract period?",
        answer: "No. You can pause or cancel your plan at any time.",
      },
      {
        question: "How much does maintenance cost?",
        answer:
          "Onboarding starts at ₹40,000, including the audit, stabilisation and the first month. A fixed monthly fee applies thereafter.",
      },
    ],
    related: ["managed-hosting", "business-websites", "app-development"],
  },
];

/** The lowest price a service is sold at: its entry package if it has one. */
export function serviceStartingPrice(
  service: Pick<Service, "priceFrom" | "entryPriceFrom">,
): number {
  return service.entryPriceFrom ?? service.priceFrom;
}

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
  /** Search title (brand is appended; keep it short) when `title` is too long. */
  seoTitle?: string;
  /** Meta description, 120–155 characters, when `summary` is too short. */
  seoDescription?: string;
}

export const caseStudies: readonly CaseStudy[] = [
  {
    slug: "kirana-commerce-platform",
    seoTitle: "Grocery E-commerce Platform Case Study",
    seoDescription:
      "How we built one e-commerce platform for a 14-store grocery chain, handling 40,000 orders a month and launched in nine weeks. Read the case study.",
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
      "Mapped the actual fulfilment process with store managers before design began",
      "Built a Next.js storefront with per-store catalogues and slot-based delivery",
      "Created a single inventory model synchronised with the existing billing software",
      "Load-tested the platform to four times the forecast peak before launch",
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
    seoTitle: "Offline-First Field Service App Case Study",
    seoDescription:
      "A React Native field service app for 400 engineers that works offline in basements and tunnels, then syncs cleanly when the signal returns.",
    client: "Arcline Utilities",
    sector: "Field services",
    title: "An offline-first field service app for 400 engineers",
    summary:
      "A React Native app that works without connectivity in basements and tunnels, and synchronises job data when the connection returns.",
    year: "2025",
    services: ["app-development", "product-design"],
    accent: ["#8b5cf6", "#ec4899"],
    challenge:
      "Engineers filled paper job cards because the old app lost data whenever connectivity dropped. Back-office re-entry added two days to every billing cycle.",
    approach: [
      "Observed field engineers on site to identify where connectivity failed",
      "Designed an offline-first data model with deterministic conflict rules",
      "Built one React Native codebase for the mixed iOS and Android fleet",
      "Enabled over-the-air updates so fixes reach engineers without an app store review",
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
    seoTitle: "AI Patient Support Assistant Case Study",
    seoDescription:
      "An AI support assistant for a clinic chain that answers 68% of patient questions from its own policies, with citations, and escalates the rest to staff.",
    client: "Medinest Clinics",
    sector: "Healthcare",
    title: "An AI assistant that answers patients from approved clinic policies",
    summary:
      "A retrieval-based support assistant that resolves 68% of inbound questions with citations and escalates the rest to staff.",
    year: "2026",
    services: ["ai-integration", "web-development"],
    accent: ["#f59e0b", "#ef4444"],
    challenge:
      "Front-desk staff answered the same forty questions throughout the day. An earlier generic chatbot had damaged patient trust by inventing appointment policies.",
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
    seoTitle: "Fintech Dashboard Performance Case Study",
    seoDescription:
      "How we re-architected queries and caching for a fintech reporting dashboard, taking its heaviest report from 48 seconds to under one second.",
    client: "Ledgerloop",
    sector: "Fintech / SaaS",
    title: "A fintech reporting dashboard rebuilt for month-end volumes",
    summary:
      "Re-architected queries and caching to reduce the heaviest report from 48 seconds to under one second.",
    year: "2025",
    services: ["web-development", "support-maintenance"],
    accent: ["#06b6d4", "#10b981"],
    challenge:
      "Month-end reporting ran unindexed aggregates over four years of ledger rows. Reports timed out, and customers had begun exporting data to Excel instead.",
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
    seoTitle: "Exam Platform Hosting & Load Testing Case Study",
    seoDescription:
      "Migrating an online exam platform to managed hosting and load-testing it to four times its worst day: 1,200 concurrent students, no incident.",
    client: "Shiksha Bridge",
    sector: "Education",
    title: "An exam platform scaled for 1,200 concurrent students",
    summary:
      "Migrated an online exam platform to managed infrastructure and load-tested it to four times its previous peak.",
    year: "2026",
    services: ["managed-hosting", "support-maintenance"],
    accent: ["#10b981", "#6366f1"],
    challenge:
      "Every exam window produced a partial outage, and the platform's actual capacity had never been measured.",
    approach: [
      "Measured actual capacity with a staged load test to 5,000 virtual users",
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
    seoTitle: "Logistics Design System Case Study",
    seoDescription:
      "One token-driven design system for a logistics company's website, customer portal and driver app, replacing three visual languages across three teams.",
    client: "Pathway Freight",
    sector: "Logistics",
    title: "One design system across a website, portal and driver app",
    summary:
      "Replaced three inconsistent visual languages with a single token-driven design system shared by three teams.",
    year: "2025",
    services: ["product-design", "web-development"],
    accent: ["#ec4899", "#6366f1"],
    challenge:
      "The website, customer portal and driver app had diverged so far that they no longer appeared to come from the same company.",
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
    duration: "30 minutes",
    description: "Understanding your business, goals and audience.",
    deliverable: "Free 30-minute call | Goals and competitor notes | Draft page list",
  },
  {
    step: "002",
    title: "Strategy & proposal",
    duration: "2–5 days",
    description: "Defining scope, timeline and investment.",
    deliverable: "Written scope | Fixed price | Dated milestones",
  },
  {
    step: "003",
    title: "Design",
    duration: "1–2 weeks",
    description: "Wireframes, visual design and interactive prototypes.",
    deliverable: "Mobile and desktop designs | Clickable prototype | Your sign-off",
  },
  {
    step: "004",
    title: "Development",
    duration: "2–3 weeks",
    description: "Engineering, integrations and quality assurance.",
    deliverable: "Live preview link | Weekly update | Content and images loaded",
  },
  {
    step: "005",
    title: "Launch",
    duration: "2–3 days",
    description: "Deployment, testing and go-live support.",
    deliverable: "Device and browser testing | Domain and go-live | Editing walkthrough",
  },
  {
    step: "006",
    title: "Support & growth",
    duration: "3 months included",
    description: "Maintenance, optimisation and continuous improvement.",
    deliverable: "Bug fixes | Small changes | Backups and updates",
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
    question: "How much does a website cost?",
    answer:
      "Landing pages start at ₹5,000 and complete business websites at ₹25,000. Larger projects are quoted after a short discovery call.",
  },
  {
    group: "Before you start",
    question: "How long does a project take?",
    answer:
      "A business website typically takes three to six weeks. Applications and custom software are scheduled in the proposal.",
  },
  {
    group: "Before you start",
    question: "What is included in the discovery call?",
    answer:
      "A free 30-minute consultation to understand your goals, followed by a written proposal.",
  },
  {
    group: "Before you start",
    question: "How are payments structured?",
    answer:
      "Payments are milestone-based and set out in the proposal before work begins.",
  },
  {
    group: "Before you start",
    question: "Who owns the website and code?",
    answer:
      "You do. All code, domains and accounts are transferred to your business.",
  },
  {
    group: "Before you start",
    question: "Do you provide hosting and domains?",
    answer:
      "Yes. We can register domains and provide managed hosting, or work with your existing provider.",
  },
  {
    group: "Help & support",
    question: "Can I update the website myself?",
    answer:
      "Yes. We build on easy-to-use content management systems and provide a training session at handover.",
  },
  {
    group: "Help & support",
    question: "What support do I get after launch?",
    answer:
      `Every project includes three months of support. Ongoing maintenance plans are available. Support requests go to ${site.supportEmail}.`,
  },
  {
    group: "Performance & quality",
    question: "Will my website rank on Google?",
    answer:
      "Every site is built with technical SEO best practices. Ongoing SEO campaigns are available as a separate service.",
  },
  {
    group: "Performance & quality",
    question: "Can you redesign an existing website?",
    answer:
      "Yes. We audit your current site, preserve what works and plan a migration that protects your search rankings.",
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

/** Working-model facts only: no client counts or track-record figures until verified. */
export const stats: readonly Stat[] = [
  { value: 30, suffix: " min", label: "Free consultation", hint: "Followed by a written proposal" },
  { value: 1, suffix: "", label: "Fixed-price proposal", hint: "Agreed before work begins" },
  { value: 3, suffix: " months", label: "Post-launch support", hint: "Included with every project" },
  { value: 100, suffix: "%", label: "Complete ownership", hint: "Code, domains and accounts" },
];

export const techStack: readonly { name: string; category: string }[] = [
  { name: "WordPress", category: "Websites" },
  { name: "Next.js", category: "Websites and web apps" },
  { name: "Shopify", category: "Online stores" },
  { name: "WooCommerce", category: "Online stores" },
  { name: "React", category: "Web apps" },
  { name: "React Native", category: "Mobile apps" },
  { name: "Flutter", category: "Mobile apps" },
  { name: "Figma", category: "Design" },
  { name: "Node.js", category: "Backend" },
  { name: "Laravel", category: "Backend" },
  { name: "AWS", category: "Hosting" },
  { name: "Google Analytics", category: "Tracking" },
];
