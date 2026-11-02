import type { ServiceKey } from "./pricing";

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
    description: "The things your customers see, use and pay through.",
  },
  {
    id: "grow",
    label: "Grow",
    title: "Brand, design and marketing",
    description: "How people find you, and why they trust you once they do.",
  },
  {
    id: "scale",
    label: "Scale",
    title: "Systems and automation",
    description: "Software that runs the business behind the website.",
  },
  {
    id: "run",
    label: "Run",
    title: "Hosting and support",
    description: "Keeping it all online, secure and up to date after launch.",
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
      "Sitemap and wireframes for every page",
      "Figma designs for mobile and desktop",
      "Live website on your domain, with SSL",
      "CMS login and a recorded walkthrough",
      "GA4, Search Console and enquiry tracking",
      "3 months of support after launch",
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
    headline: "A website that brings in enquiries",
    subheadline:
      "Fast company websites on WordPress or Next.js, designed around the one action each page should drive. Calls, WhatsApp taps and form fills are tracked from launch, and your team edits every page without us.",
    seoTitle: "Business Website Development",
    seoDescription:
      "Business websites on WordPress or Next.js from ₹20,000. Mobile-first design, on-page SEO and enquiry tracking, live in 3–6 weeks. Gurugram team.",
    audience: [
      {
        title: "Businesses with a dated site",
        body: "It was built years ago, looks broken on phones, and nobody on the team can change a line of it.",
      },
      {
        title: "New companies and startups",
        body: "You need a credible site live before the first pitch, trade show or ad campaign.",
      },
      {
        title: "Firms that sell on trust",
        body: "Clinics, consultants, manufacturers, schools and agencies whose buyers check the website before they call.",
      },
    ],
    problems: [
      {
        problem: "Visitors leave before the page loads.",
        solution:
          "We build to a performance budget: under 2 seconds on a mid-range Android phone over 4G, checked with Lighthouse before launch.",
      },
      {
        problem: "You can't tell where enquiries come from.",
        solution:
          "GA4, Search Console and event tracking go in before launch. Every call click, WhatsApp tap and form submit is counted.",
      },
      {
        problem: "Changing one sentence needs a developer.",
        solution:
          "A CMS set up around your pages. Your team edits text, photos, team profiles and blog posts on their own.",
      },
      {
        problem: "The site doesn't show up on Google.",
        solution:
          "Each page gets a target search phrase, clean headings, meta tags and schema markup, and the sitemap goes to Search Console on launch day.",
      },
    ],
    features: [
      {
        title: "Custom design, not a stock theme",
        body: "Layouts designed in Figma around your content and brand. You approve them before we build.",
      },
      {
        title: "Mobile-first build",
        body: "Most of your visitors are on phones, so we design, build and test there first.",
      },
      {
        title: "A CMS your team can use",
        body: "WordPress or Sanity, with fields named in plain English and a recorded walkthrough.",
      },
      {
        title: "On-page SEO from day one",
        body: "Titles, meta descriptions, schema, an XML sitemap and 301 redirects from your old URLs.",
      },
      {
        title: "Lead capture that reaches you",
        body: "Forms to email and WhatsApp, click-to-call buttons, and optional sync to Zoho CRM or HubSpot.",
      },
      {
        title: "Domain, SSL and business email",
        body: "We connect your domain, switch on SSL and set up Google Workspace or Zoho Mail, all in your name.",
      },
    ],
    process: [
      {
        title: "Discovery and sitemap",
        body: "We learn what you sell and who buys it, then agree the pages and the one action each page should drive.",
        duration: "Week 1",
      },
      {
        title: "Content and wireframes",
        body: "We structure the copy for each page and sketch the layouts. We can write the copy too.",
        duration: "Week 1–2",
      },
      {
        title: "Design",
        body: "Home page first, then inner pages, for mobile and desktop. Two rounds of revisions included.",
        duration: "Week 2–3",
      },
      {
        title: "Build and CMS",
        body: "We build the site, connect the CMS and load your content. You review it on a staging link.",
        duration: "Week 3–5",
      },
      {
        title: "Launch and tracking",
        body: "Speed and SEO checks, redirects from the old site, analytics live, then we switch the domain.",
        duration: "Week 5–6",
      },
      {
        title: "Aftercare",
        body: "Fixes and small changes for three months after launch, then an optional care plan.",
        duration: "3 months",
      },
    ],
    priceNote:
      "Our Website Build package. Page count, copywriting and features such as booking or multiple languages set the final price.",
    commitments: [
      "Lighthouse 90+ on mobile at launch",
      "You own the domain, hosting account and code",
      "Every enquiry source tracked from day one",
      "3 months of support included",
    ],
    faqs: [
      {
        question: "How much does a business website cost?",
        answer:
          "Our Website Build package starts at ₹20,000 for a focused site of a few pages. The price rises with page count, copywriting and features like booking or multiple languages. The instant estimator gives you a range in two minutes.",
      },
      {
        question: "Should I choose WordPress or Next.js?",
        answer:
          "WordPress if your team wants to edit everything and add plugins later. Next.js if speed, security and custom features matter more. We recommend one on the first call and explain why.",
      },
      {
        question: "Do you write the content?",
        answer:
          "We can. We structure every page and write the copy from a short interview, or polish what you already have. You approve every word before launch.",
      },
      {
        question: "Can I update the website myself?",
        answer:
          "Yes. You get a CMS login and a recorded walkthrough. Text, images, team profiles, blog posts and job openings are all editable without code.",
      },
      {
        question: "Will I lose my Google rankings when the new site goes live?",
        answer:
          "We map every old URL to its new page with 301 redirects, keep the pages that already rank, and resubmit the sitemap in Search Console on launch day.",
      },
      {
        question: "Who owns the website?",
        answer:
          "You do. The domain, hosting account and code are in your name. If you move on from us, nothing is held back.",
      },
    ],
    related: ["seo-marketing", "product-design", "managed-hosting"],
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
      "Store design for mobile and desktop",
      "Products, categories and variants loaded",
      "Payment gateway live and tested",
      "GST invoices and courier integration",
      "Analytics, ad pixels and a sales dashboard",
      "Admin training for your order team",
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
    headline: "A store that takes orders from day one",
    subheadline:
      "Shopify, WooCommerce or a custom Next.js store, with UPI and card payments, GST invoices and courier pickups wired in before launch.",
    seoTitle: "E-commerce Store Development",
    seoDescription:
      "Shopify, WooCommerce and custom stores from ₹60,000. UPI and card payments, GST invoices, Shiprocket shipping and stock sync, live in 4–10 weeks.",
    audience: [
      {
        title: "Brands moving off marketplaces",
        body: "You sell on Amazon, Flipkart or Instagram and want your own store, your own customer data and better margins.",
      },
      {
        title: "Retailers going online",
        body: "You already have shops and stock. You need a catalogue, online payments and delivery your staff can run.",
      },
      {
        title: "D2C startups",
        body: "You need a store that converts on mobile, carries ad landing pages and grows with the catalogue.",
      },
    ],
    problems: [
      {
        problem: "Customers drop off at checkout.",
        solution:
          "A short checkout with UPI, cards, wallets and cash on delivery through Razorpay or Cashfree, tested on real phones.",
      },
      {
        problem: "Online stock doesn't match the shelf.",
        solution:
          "Inventory syncs with your POS, Tally or warehouse sheet, so what sells online is what you have.",
      },
      {
        problem: "Packing and shipping is all manual.",
        solution:
          "Orders flow to Shiprocket or Delhivery, labels print in one click, and customers get tracking on WhatsApp and email.",
      },
      {
        problem: "You can't see which products or ads make money.",
        solution:
          "GA4 e-commerce tracking, Google and Meta pixels, and a sales dashboard by product, channel and campaign.",
      },
    ],
    features: [
      {
        title: "The right platform for you",
        body: "Shopify for speed to launch, WooCommerce for full control, Next.js for B2B pricing, custom flows or heavy traffic.",
      },
      {
        title: "Catalogue and variants",
        body: "Sizes, colours, bundles and bulk CSV import, with filters customers actually use.",
      },
      {
        title: "Indian payments",
        body: "UPI, cards, netbanking, wallets and COD via Razorpay, Cashfree or PayU, with refunds from the admin.",
      },
      {
        title: "GST-ready invoices",
        body: "Tax invoices generated per order with your GSTIN and HSN codes, ready for your accountant.",
      },
      {
        title: "Shipping and returns",
        body: "Courier integration, pin-code checks, return requests and order-status messages.",
      },
      {
        title: "Selling tools built in",
        body: "Discount codes, abandoned-cart reminders, reviews, and product feeds for Google Shopping and Meta.",
      },
    ],
    process: [
      {
        title: "Store planning",
        body: "Catalogue size, payment and courier partners, and the platform choice, agreed in writing.",
        duration: "Week 1",
      },
      {
        title: "Design",
        body: "Home, category, product, cart and checkout pages, designed for mobile first.",
        duration: "Week 1–3",
      },
      {
        title: "Build and integrations",
        body: "Store build, payment gateway, courier, invoicing and inventory sync.",
        duration: "Week 3–7",
      },
      {
        title: "Catalogue and test orders",
        body: "Products imported, then real test orders through every payment method and courier.",
        duration: "Week 7–9",
      },
      {
        title: "Launch and tuning",
        body: "Go live, watch the first orders, and remove checkout friction over the first two weeks.",
        duration: "Week 9–10",
      },
    ],
    priceNote:
      "Shopify subscription, gateway fees and courier charges are paid by you directly to those providers.",
    commitments: [
      "Test orders on every payment method before launch",
      "Store, gateway and courier accounts in your name",
      "Checkout tested on budget Android phones",
      "Your team trained to run orders without us",
    ],
    faqs: [
      {
        question: "Shopify or WooCommerce: which is right for me?",
        answer:
          "Shopify if you want to launch fast and never think about hosting; you pay Shopify a monthly fee. WooCommerce if you want full control and lower running costs, on hosting we manage. We compare both against your catalogue on the first call.",
      },
      {
        question: "Which payment gateways do you integrate?",
        answer:
          "Razorpay, Cashfree, PayU and PhonePe for India, and Stripe for international cards. Most stores launch with UPI, cards, netbanking, wallets and cash on delivery.",
      },
      {
        question: "Can the store connect to my billing software or warehouse?",
        answer:
          "Yes. We connect stores to Tally, Zoho Inventory, Unicommerce or your own ERP through their APIs or scheduled file imports. We confirm it works before we quote.",
      },
      {
        question: "Will you upload all my products?",
        answer:
          "Yes. Send a spreadsheet and photos and we import them with variants, prices and stock. Large catalogues are imported by script, not by hand.",
      },
      {
        question: "How long until my store is live?",
        answer:
          "Four to six weeks for a Shopify or WooCommerce store with a standard catalogue. Eight to ten weeks for a custom build or heavy integrations.",
      },
      {
        question: "Do you help with sales after launch?",
        answer:
          "Yes, through our SEO and digital marketing service: Google Shopping, Meta catalogue ads and abandoned-cart flows. Tracking is in place at launch, so campaigns can start straight away.",
      },
    ],
    related: ["seo-marketing", "product-design", "support-maintenance"],
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
      "Clickable prototype before development",
      "Working app on staging from week two",
      "Production deployment on AWS or Vercel",
      "Source code, documentation and admin guide",
      "Error tracking, analytics and uptime alerts",
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
    headline: "Customer portals and SaaS, built for production",
    subheadline:
      "Customer portals, dashboards, booking systems and SaaS MVPs on Next.js, TypeScript and PostgreSQL. A staging link from week two and a demo every week.",
    seoTitle: "Web App & SaaS Development",
    seoDescription:
      "Customer portals, dashboards and SaaS MVPs on Next.js and PostgreSQL from ₹1.2 lakh. Fixed scope, weekly demos, code in your name.",
    audience: [
      {
        title: "Founders building a SaaS MVP",
        body: "You have a tested idea and need a product customers can sign up to and pay for.",
      },
      {
        title: "Businesses replacing a manual process",
        body: "Customers email, call or fill Google Forms today. You want a portal where they log in and do it themselves.",
      },
      {
        title: "Teams with a stalled codebase",
        body: "A previous vendor left a half-built app. We audit it, keep what is sound and finish the job.",
      },
    ],
    problems: [
      {
        problem: "Scope keeps growing and launch keeps slipping.",
        solution:
          "Fixed scope and price before code. Two-week sprints, a demo every week, and every change priced before it is built.",
      },
      {
        problem: "The app is slow and falls over under load.",
        solution:
          "A performance budget enforced in CI, a load test before launch, and Core Web Vitals monitored in production.",
      },
      {
        problem: "You can't see what the developers are doing.",
        solution:
          "Your own GitHub repository, a staging link from week two and a weekly demo of working software.",
      },
      {
        problem: "You're locked in to a vendor.",
        solution:
          "Code, repository, domain and cloud accounts in your name from day one, documented for the next developer.",
      },
    ],
    features: [
      {
        title: "Accounts and roles",
        body: "Email, OTP and Google sign-in, with separate roles for admins, staff and customers.",
      },
      {
        title: "Payments and subscriptions",
        body: "Razorpay or Stripe for one-time payments, recurring plans, invoices and GST.",
      },
      {
        title: "Admin dashboard",
        body: "Manage users, orders, content and reports without touching the database.",
      },
      {
        title: "Integrations",
        body: "APIs to your CRM, ERP, accounting software, WhatsApp Business and email tools.",
      },
      {
        title: "Notifications",
        body: "Email, SMS and WhatsApp alerts for sign-ups, payments and status changes.",
      },
      {
        title: "Production setup",
        body: "CI/CD, separate staging and production, Sentry error tracking and uptime alerts.",
      },
    ],
    process: [
      {
        title: "Scoping workshop",
        body: "We map users, flows and must-have features, then write a fixed scope and price.",
        duration: "Week 1",
      },
      {
        title: "UX and prototype",
        body: "Wireframes and a clickable Figma prototype, reviewed with you before any code.",
        duration: "Week 1–3",
      },
      {
        title: "Sprint build",
        body: "Two-week sprints with a demo every week on a live staging link.",
        duration: "Week 3–10",
      },
      {
        title: "QA and load test",
        body: "Automated tests, manual QA on real devices, security checks and a load test.",
        duration: "Week 10–11",
      },
      {
        title: "Launch and handover",
        body: "Production deploy, monitoring switched on and a handover session with your team.",
        duration: "Week 12",
      },
      {
        title: "Post-launch support",
        body: "Bug fixes and small changes after launch, then an optional care plan.",
        duration: "6–8 months",
      },
    ],
    priceNote:
      "Starting price for a focused MVP. Logins, payments, integrations and screen count set the final fixed quote.",
    commitments: [
      "Staging link from week two",
      "Code, repo and cloud accounts in your name",
      "Core Web Vitals in the green at launch",
      "6–8 months of support after launch",
    ],
    faqs: [
      {
        question: "What does a web application cost?",
        answer:
          "Web apps start at ₹1.2 lakh for a focused MVP. Logins, payments, integrations and the number of screens drive the final price. You get a fixed quote after a scoping call; the estimator gives you a range now.",
      },
      {
        question: "Fixed price or hourly billing?",
        answer:
          "Fixed price for a defined scope. If you want to add something mid-project, we price the change before we build it. No open-ended hourly billing.",
      },
      {
        question: "Why Next.js and PostgreSQL?",
        answer:
          "Both are widely used, well documented and easy to hire for. Your next developer won't have to learn something obscure to keep the product running.",
      },
      {
        question: "Can you take over an app another team started?",
        answer:
          "Yes. We run a one-to-two week code audit, tell you what is sound and what needs rework, then quote to finish it.",
      },
      {
        question: "Will you sign an NDA?",
        answer:
          "Yes, before the first detailed conversation if you need one. Assignment of IP to you is part of our standard contract.",
      },
      {
        question: "Can it become a mobile app later?",
        answer:
          "Yes. We build the backend as an API, so a React Native app can use the same accounts, data and payments.",
      },
    ],
    related: ["product-design", "app-development", "managed-hosting"],
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
      "User flows and Figma designs",
      "iOS and Android apps from one codebase",
      "API backend and admin panel",
      "App Store and Play Store listings",
      "Crash reporting and analytics",
      "Store accounts and source code in your name",
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
    headline: "One codebase, live on both app stores",
    subheadline:
      "We build in React Native or Flutter and handle the parts that sink app projects: offline mode, push notifications, store review and crash tracking.",
    seoTitle: "iOS & Android App Development",
    seoDescription:
      "iOS and Android apps in React Native or Flutter from ₹2.2 lakh. Offline sync, push alerts, payments and store submission, in 8–16 weeks.",
    audience: [
      {
        title: "Businesses with repeat customers",
        body: "Ordering, booking, loyalty or service apps that customers keep on their home screen.",
      },
      {
        title: "Teams with field staff",
        body: "Sales reps, technicians and delivery staff who need an app that works on patchy networks.",
      },
      {
        title: "Mobile-first startups",
        body: "A consumer or marketplace product where the app is the business.",
      },
    ],
    problems: [
      {
        problem: "Two native apps double the cost.",
        solution:
          "One React Native or Flutter codebase ships to both stores, so features land on iOS and Android the same day.",
      },
      {
        problem: "The app breaks when the signal drops.",
        solution:
          "Offline-first data with local storage, and sync that resolves conflicts when the connection returns.",
      },
      {
        problem: "Store rejections delay the launch.",
        solution:
          "We prepare listings, privacy forms, test accounts and review notes, and turn round any rejection fast.",
      },
      {
        problem: "Users report crashes before your tools do.",
        solution:
          "Crashlytics or Sentry logs every crash with the device and screen, and each release fixes the top ones.",
      },
    ],
    features: [
      {
        title: "Cross-platform UI",
        body: "Screens that feel native on iOS and Android, built from one codebase.",
      },
      {
        title: "Logins and profiles",
        body: "Phone OTP, Google and Apple sign-in, with secure session handling.",
      },
      {
        title: "Push notifications",
        body: "Firebase Cloud Messaging for order updates and reminders, with deep links to the right screen.",
      },
      {
        title: "Payments",
        body: "Razorpay and UPI intent, plus in-app purchases where store rules require them.",
      },
      {
        title: "Offline mode",
        body: "Forms, photos and data captured without signal and synced later.",
      },
      {
        title: "Over-the-air updates",
        body: "Small fixes ship through Expo EAS Update without waiting for store review.",
      },
    ],
    process: [
      {
        title: "Product scoping",
        body: "Users, core flows and device features agreed. We pick React Native or Flutter with you.",
        duration: "Week 1–2",
      },
      {
        title: "Design and prototype",
        body: "Screens for both platforms and a clickable prototype you can try on your own phone.",
        duration: "Week 2–4",
      },
      {
        title: "Build sprints",
        body: "Two-week sprints, with test builds on your phone through TestFlight and Play internal testing.",
        duration: "Week 4–12",
      },
      {
        title: "Beta and QA",
        body: "Testing across a spread of Android and iOS devices, plus a beta with real users.",
        duration: "Week 12–14",
      },
      {
        title: "Store submission",
        body: "Listings, screenshots, privacy forms and review handled by us.",
        duration: "Week 14–16",
      },
    ],
    priceNote:
      "Apple's developer programme ($99 a year) and Google Play's one-time $25 fee are paid by you, in your company's name.",
    commitments: [
      "Test builds on your phone every sprint",
      "Store accounts in your company's name",
      "Tested on budget Android phones, not just flagships",
      "Crash reporting live from the first beta",
    ],
    faqs: [
      {
        question: "React Native or Flutter?",
        answer:
          "Both ship good apps. We lean to React Native when you also have a React web app or plan to hire JavaScript developers, and to Flutter for heavy custom UI and animation. We recommend one for your case.",
      },
      {
        question: "How much does a mobile app cost?",
        answer:
          "Apps start at ₹2.2 lakh. Screen count, logins, payments, offline sync and the admin backend drive the final number. The estimator gives you a range; a scoping call gives you a fixed quote.",
      },
      {
        question: "Do I need a backend?",
        answer:
          "Almost always. Logins, data and notifications need a server. We build it with the app, plus an admin panel for your team.",
      },
      {
        question: "Who publishes the app to the stores?",
        answer:
          "We handle submission under developer accounts in your company's name, so the apps and their reviews always belong to you.",
      },
      {
        question: "What happens after launch?",
        answer:
          "iOS and Android release major updates every year, and some of them break apps. Our maintenance plans cover OS and library upgrades, crash fixes and small features.",
      },
      {
        question: "Can you improve an app we already have?",
        answer:
          "Yes. We audit the codebase and store setup first, then fix, upgrade or rebuild depending on what we find.",
      },
    ],
    related: ["product-design", "web-development", "support-maintenance"],
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
      "Logo files in SVG, PNG and PDF",
      "Brand guidelines document",
      "Social and stationery templates",
      "User flows and wireframes",
      "High-fidelity UI in Figma",
      "Design system and clickable prototype",
    ],
    stack: ["Figma", "FigJam", "Illustrator", "Photoshop", "Canva", "Storybook"],
    featured: false,
    group: "grow",
    headline: "A brand people trust at first glance",
    subheadline:
      "Logos, brand identity and app and website screens, designed in Figma by designers who sit with the engineers who build them.",
    seoTitle: "UI/UX Design, Logo & Branding",
    seoDescription:
      "Logo, brand identity and website and app UI design in Figma from ₹90,000. Brand guides, design systems and prototypes developers build from.",
    audience: [
      {
        title: "New businesses",
        body: "You need to look like a company: a logo, colours, type, and the files to use them everywhere.",
      },
      {
        title: "Businesses that outgrew their look",
        body: "The brand was made in a hurry and now looks different on every card, post and page.",
      },
      {
        title: "Product teams",
        body: "You need UX flows and screens for a web or mobile app, ready for developers to build.",
      },
    ],
    problems: [
      {
        problem: "Your brand looks different everywhere.",
        solution:
          "A brand guide with logo rules, colours and fonts, plus templates for social posts, letterheads and decks.",
      },
      {
        problem: "Users get lost in your app.",
        solution:
          "We map the flows, test a prototype with real users and fix confusing steps before code is written.",
      },
      {
        problem: "Developers rebuild what the designer drew.",
        solution:
          "A Figma design system whose components match the code, with specs and assets for every state.",
      },
      {
        problem: "Accessibility is an afterthought.",
        solution:
          "Contrast, text size, focus states and touch targets checked in Figma before handover.",
      },
    ],
    features: [
      {
        title: "Logo and identity",
        body: "Logo concepts, primary and secondary marks, a colour palette and typography.",
      },
      {
        title: "Brand guidelines",
        body: "A short, usable guide to the logo, colours and type, with clear dos and don'ts.",
      },
      {
        title: "Marketing templates",
        body: "Social posts, business cards, letterhead and pitch-deck templates in Canva or Figma.",
      },
      {
        title: "UX flows and wireframes",
        body: "User interviews, task flows and wireframes for every key screen.",
      },
      {
        title: "UI design",
        body: "High-fidelity screens for mobile and desktop, including empty, loading and error states.",
      },
      {
        title: "Design system and prototype",
        body: "Reusable Figma components and a clickable prototype for user tests and investor demos.",
      },
    ],
    process: [
      {
        title: "Discovery",
        body: "Your customers, your competitors, and what the brand or product must say.",
        duration: "Week 1",
      },
      {
        title: "Concepts",
        body: "Two or three directions for the logo or interface, with the reasoning behind each.",
        duration: "Week 1–2",
      },
      {
        title: "Refine",
        body: "We develop the chosen direction across real uses: website, app, packaging, social.",
        duration: "Week 2–4",
      },
      {
        title: "Prototype and test",
        body: "For products, a clickable prototype tested with five users, then fixes.",
        duration: "Week 3–5",
      },
      {
        title: "Handover",
        body: "Final files, the brand guide, a Figma library and a walkthrough with your developers.",
        duration: "Week 5–6",
      },
    ],
    priceNote:
      "A logo-and-identity project, a website design and a full app design are priced separately, by scope.",
    commitments: [
      "Full ownership of logo and design files",
      "Two rounds of revisions at each stage",
      "Contrast and touch targets checked against WCAG 2.2 AA",
      "Designs reviewed by the engineers who will build them",
    ],
    faqs: [
      {
        question: "How many logo concepts do I get?",
        answer:
          "Two or three distinct directions, each shown on real uses. We then refine the one you pick, with two rounds of revisions.",
      },
      {
        question: "Do I own the logo and designs?",
        answer:
          "Yes. Copyright in the final logo, brand assets and Figma files transfers to you on final payment.",
      },
      {
        question: "Can you design screens if another team builds the app?",
        answer:
          "Yes. We hand over a Figma library, specs and assets, and stay available for developer questions during the build.",
      },
      {
        question: "What does UI/UX design cost?",
        answer:
          "Design projects start at ₹90,000. The price depends on the number of screens, how much research is needed and whether branding is included.",
      },
      {
        question: "Do you test designs with real users?",
        answer:
          "For products, yes. We run short usability sessions on a clickable prototype and fix what confuses people before any code.",
      },
    ],
    related: ["business-websites", "app-development", "web-development"],
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
      "SEO audit with a prioritised fix list",
      "Keyword map for every key page",
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
    headline: "More enquiries from search and ads",
    subheadline:
      "Technical SEO, local search, Google Ads and Meta campaigns run by one team. Tracking goes in first, so every rupee can be traced to a lead.",
    seoTitle: "SEO & Digital Marketing Services",
    seoDescription:
      "SEO audits, local SEO, Google Ads and Meta ads from ₹15,000. Conversion tracking first, then monthly reports on leads and cost per enquiry.",
    audience: [
      {
        title: "Local businesses",
        body: "Clinics, showrooms, institutes and service firms that need to show up on Google Maps and in 'near me' searches.",
      },
      {
        title: "Companies with a site but no traffic",
        body: "The website is live and looks good. Nobody visits it.",
      },
      {
        title: "Teams spending on ads blind",
        body: "You run Google or Meta ads but can't say which campaign brings customers.",
      },
    ],
    problems: [
      {
        problem: "You don't rank for what customers search.",
        solution:
          "Keyword research on real search volume, then pages built or rewritten to target those terms.",
      },
      {
        problem: "Your Google Business Profile is half-finished.",
        solution:
          "Categories, services, photos and posts filled in, plus a simple routine for collecting reviews.",
      },
      {
        problem: "Ad money goes out and leads don't come in.",
        solution:
          "Conversion tracking first, then campaigns split by service and location, with negative keywords and weekly bid checks.",
      },
      {
        problem: "Reports are screenshots of impressions.",
        solution:
          "A monthly report on enquiries, cost per lead and rankings in plain language, with next month's plan.",
      },
    ],
    features: [
      {
        title: "Technical SEO audit",
        body: "Crawl errors, page speed, indexing, schema and Core Web Vitals, fixed rather than just listed.",
      },
      {
        title: "On-page and content SEO",
        body: "A target keyword per page, rewritten titles and headings, and blog topics people actually search.",
      },
      {
        title: "Local SEO",
        body: "Google Business Profile, local citations, location pages and review requests.",
      },
      {
        title: "Google Ads",
        body: "Search, Performance Max and Shopping campaigns with conversion and call tracking.",
      },
      {
        title: "Meta ads and social",
        body: "Facebook and Instagram campaigns, lead forms and a monthly content calendar.",
      },
      {
        title: "Tracking and reporting",
        body: "GA4, Google Tag Manager and a Looker Studio dashboard tied to real enquiries.",
      },
    ],
    process: [
      {
        title: "Audit and tracking",
        body: "We audit your site, ads and Business Profile, and set up GA4, Tag Manager and call tracking.",
        duration: "Week 1–2",
      },
      {
        title: "Strategy",
        body: "Keywords, channels and budget split agreed, with a target cost per enquiry.",
        duration: "Week 2",
      },
      {
        title: "Fix and launch",
        body: "Technical fixes, on-page updates and the first campaigns go live.",
        duration: "Week 3–4",
      },
      {
        title: "Optimise",
        body: "Weekly bid and keyword checks, plus new content and pages each month.",
        duration: "Ongoing",
      },
      {
        title: "Report and plan",
        body: "A monthly report on leads, spend and rankings, and a call to plan the next month.",
        duration: "Monthly",
      },
    ],
    priceNote:
      "Ad spend is not included. You pay Google and Meta directly from your own ad accounts.",
    commitments: [
      "Conversion tracking live before any ad spend",
      "Ad and analytics accounts in your name",
      "First report within 30 days",
      "Reports on leads and cost per enquiry, not impressions",
    ],
    faqs: [
      {
        question: "How long does SEO take to work?",
        answer:
          "Technical fixes and Business Profile changes often show results within weeks. Ranking for competitive terms usually takes three to six months. Ads bring traffic from day one, which is why many businesses run both.",
      },
      {
        question: "Do you guarantee first-page rankings?",
        answer:
          "No. Nobody controls Google's results, and anyone who promises the top spot is guessing. We commit to the work, the tracking and an honest monthly report.",
      },
      {
        question: "Is ad spend included in your fee?",
        answer:
          "No. You pay ad spend straight to Google or Meta. Our fee covers strategy, setup, campaign management and reporting.",
      },
      {
        question: "Who owns the ad accounts and data?",
        answer:
          "You do. Google Ads, Meta Business Manager, GA4 and Search Console sit under your business, with us added as managers.",
      },
      {
        question: "Do I need a new website before marketing?",
        answer:
          "Not always. We start with an audit. If the site is too slow or can't turn visitors into enquiries, we tell you and fix the worst issues before spending on ads.",
      },
    ],
    related: ["business-websites", "ecommerce-stores", "product-design"],
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
      "Process map signed off by your team",
      "Working modules released in phases",
      "Role-based access and audit log",
      "Integrations with your current tools",
      "Data migrated from sheets or old software",
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
    headline: "One system for orders, stock and staff",
    subheadline:
      "Custom ERP, CRM and internal tools built around how your business runs, and connected to Tally, Zoho, Razorpay and WhatsApp.",
    seoTitle: "Custom ERP & CRM Development",
    seoDescription:
      "Custom ERP, CRM and internal tools from ₹1.5 lakh, built around your process. Connected to Tally, Zoho and WhatsApp, with your data migrated.",
    audience: [
      {
        title: "SMBs running on Excel",
        body: "Orders, stock and billing live in spreadsheets that only one person fully understands.",
      },
      {
        title: "Manufacturers and distributors",
        body: "You need dispatch, inventory, dealer orders and collections in one place.",
      },
      {
        title: "Teams outgrowing off-the-shelf tools",
        body: "You bent your process to fit Zoho, Odoo or Salesforce and still need three workarounds.",
      },
    ],
    problems: [
      {
        problem: "Data is spread across sheets and WhatsApp groups.",
        solution:
          "One database for orders, customers, inventory and staff, with search and full history.",
      },
      {
        problem: "Owners can't see the numbers without asking.",
        solution:
          "Live dashboards for sales, stock, dues and team performance, on desktop and phone.",
      },
      {
        problem: "Staff can see things they shouldn't.",
        solution:
          "Role-based access by branch, department and job, with an audit log of every change.",
      },
      {
        problem: "Your tools don't talk to each other.",
        solution:
          "Integrations with Tally, Zoho Books, Odoo, Razorpay, the WhatsApp Business API and your website.",
      },
    ],
    features: [
      {
        title: "Modules you actually need",
        body: "Orders, inventory, purchase, CRM, HR, attendance or service tickets. Nothing you won't use.",
      },
      {
        title: "Workflows and approvals",
        body: "Multi-step approvals, reminders and status changes that match how your team works.",
      },
      {
        title: "Dashboards and reports",
        body: "Live reports with Excel export, filtered by branch, product or salesperson.",
      },
      {
        title: "Two-way integrations",
        body: "Sync with accounting, payments, WhatsApp and your online store.",
      },
      {
        title: "Mobile access",
        body: "Works in any phone browser, with an optional Android app for field and warehouse staff.",
      },
      {
        title: "Migration and training",
        body: "We move your existing data and train each team on their part of the system.",
      },
    ],
    process: [
      {
        title: "Process mapping",
        body: "We sit with the people who do the work and map each process as it really runs.",
        duration: "Week 1–2",
      },
      {
        title: "Solution design",
        body: "Modules, roles, reports and integrations agreed, with key screens prototyped in Figma.",
        duration: "Week 2–4",
      },
      {
        title: "Phased build",
        body: "The most painful module goes live first. The rest follow in two-week sprints.",
        duration: "Week 4–16",
      },
      {
        title: "Migration and training",
        body: "Old data imported and reconciled, then hands-on training for each team.",
        duration: "Week 16–18",
      },
      {
        title: "Go-live",
        body: "A parallel run alongside the old process, then cut-over with us on call.",
        duration: "Week 18–20",
      },
    ],
    priceNote:
      "Starting price for one or two modules. Larger systems are phased and billed by milestone as each module goes live.",
    commitments: [
      "First module in use before the full system is finished",
      "Your data in a database you own",
      "Every change logged with who made it and when",
      "No per-user licence fees to us",
    ],
    faqs: [
      {
        question: "Why custom software instead of Zoho or Odoo?",
        answer:
          "Off-the-shelf tools work well when your process matches theirs. When it doesn't, you pay for licences and still run workarounds. We first check whether Zoho or Odoo with light customisation is enough, and only build custom when it isn't.",
      },
      {
        question: "Can it work with Tally?",
        answer:
          "Yes. We sync vouchers, ledgers and stock with Tally Prime through its XML interface, so accounts stay in Tally and operations move to the new system.",
      },
      {
        question: "How much does custom software cost?",
        answer:
          "Projects start at ₹1.5 lakh for one or two modules. Bigger ERP and CRM builds are phased, and billed by milestone as each module goes live.",
      },
      {
        question: "What happens to our existing data?",
        answer:
          "We clean and import it from Excel, Google Sheets or your old software, then reconcile totals with you before go-live.",
      },
      {
        question: "Can staff use it on their phones?",
        answer:
          "Yes. Everything works in a mobile browser, and we can add an Android app for field staff who need offline access or barcode scanning.",
      },
      {
        question: "Who owns the software?",
        answer:
          "You do. Code, database and cloud account are in your name, and there are no per-user licence fees to us.",
      },
    ],
    related: ["web-development", "ai-integration", "support-maintenance"],
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
      "Workflow review and feasibility report",
      "Evaluation set built from your real data",
      "Production chatbot or automation",
      "Admin view of conversations and logs",
      "Spend caps and usage reports",
      "Runbook for your team",
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
    headline: "Less data entry, faster customer replies",
    subheadline:
      "Chatbots that answer from your own documents, invoices read into your system, leads routed in seconds. Each one tested for accuracy and cost before it goes live.",
    seoTitle: "AI Chatbots & Workflow Automation",
    seoDescription:
      "AI chatbots on your documents, WhatsApp assistants, invoice extraction and workflow automation from ₹1.8 lakh. Accuracy tested before launch.",
    audience: [
      {
        title: "Support teams answering the same questions",
        body: "Customers ask about prices, order status and policies all day, on your site and on WhatsApp.",
      },
      {
        title: "Operations teams doing data entry",
        body: "Staff retype invoices, purchase orders and forms from PDFs and emails.",
      },
      {
        title: "Sales teams losing leads",
        body: "Enquiries from your website, ads and IndiaMART sit in inboxes until someone notices.",
      },
    ],
    problems: [
      {
        problem: "Customers wait hours for simple answers.",
        solution:
          "A website or WhatsApp assistant that answers from your documents, shows its source, and hands off to a person when unsure.",
      },
      {
        problem: "Hours lost copying data between systems.",
        solution:
          "Document extraction that reads invoices, POs and forms into your ERP or sheet, with a review queue for unclear fields.",
      },
      {
        problem: "Leads go cold before anyone calls.",
        solution:
          "Automations that capture, score and assign every lead, then alert the right salesperson on WhatsApp.",
      },
      {
        problem: "AI pilots never reach production.",
        solution:
          "An accuracy target, a test set from your real data, spend caps and logging, all agreed before we build.",
      },
    ],
    features: [
      {
        title: "Knowledge-base chatbot",
        body: "Answers from your PDFs, website and FAQs using retrieval, with citations.",
      },
      {
        title: "WhatsApp assistant",
        body: "Order status, bookings and FAQs on the WhatsApp Business API, with handoff to your team.",
      },
      {
        title: "Document extraction",
        body: "Invoices, receipts and forms turned into structured data and checked against your rules.",
      },
      {
        title: "Workflow automation",
        body: "n8n, Make or Zapier flows connecting your CRM, sheets, email and accounting.",
      },
      {
        title: "Lead routing",
        body: "Enquiries captured from every source, scored and assigned automatically.",
      },
      {
        title: "Guardrails and monitoring",
        body: "Logs, spend caps, masking of personal data, and a person in the loop for uncertain cases.",
      },
    ],
    process: [
      {
        title: "Workflow review",
        body: "We pick one job worth automating, measure how it's done today and set an accuracy target.",
        duration: "Week 1",
      },
      {
        title: "Proof of concept",
        body: "A working prototype tested on your real documents and questions.",
        duration: "Week 2–3",
      },
      {
        title: "Build and integrate",
        body: "Connected to your website, WhatsApp, CRM or ERP, with guardrails and logging.",
        duration: "Week 3–6",
      },
      {
        title: "Evaluate",
        body: "We run the test set, review failures with you and tune until the target is met.",
        duration: "Week 6–7",
      },
      {
        title: "Launch and monitor",
        body: "Live with spend caps, and a weekly accuracy review for the first month.",
        duration: "Week 7–8",
      },
    ],
    priceNote:
      "Model usage is billed per request by the AI provider. We estimate the monthly running cost before launch and cap it.",
    commitments: [
      "Accuracy target agreed before build",
      "Monthly AI spend capped and reported",
      "Unclear cases handed to a person",
      "API settings that keep your data out of model training",
    ],
    faqs: [
      {
        question: "Will the chatbot make things up?",
        answer:
          "It answers only from the documents you give it and shows its source. When it isn't confident, it says so and hands the chat to a person. We test this on your real questions before launch.",
      },
      {
        question: "What does it cost to build and run?",
        answer:
          "Builds start at ₹1.8 lakh. Running cost depends on volume, because model usage is billed per request. We estimate it before launch and cap monthly spend.",
      },
      {
        question: "Is our data safe?",
        answer:
          "Data stays in your cloud account or ours under contract. We use the providers' business API terms, which exclude your data from model training, and mask personal details where we can.",
      },
      {
        question: "Which AI models do you use?",
        answer:
          "OpenAI, Anthropic's Claude or open-source models, chosen on accuracy and cost for your task. You aren't locked to one provider.",
      },
      {
        question: "Can it work on WhatsApp?",
        answer:
          "Yes, through the official WhatsApp Business API, either via Meta's Cloud API or a provider such as Gupshup or Interakt.",
      },
      {
        question: "Do we need AI, or just automation?",
        answer:
          "Often just automation. Routing leads or syncing orders needs rules, not a model. We tell you which, and the rules-only version costs less.",
      },
    ],
    related: ["custom-software", "web-development", "support-maintenance"],
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
      "Domain and DNS in your name",
      "Hosting set up or migrated",
      "SSL, CDN and firewall live",
      "Business email configured",
      "Backups and monitoring switched on",
      "Access sheet with every login and renewal date",
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
    headline: "Hosting and email that someone watches",
    subheadline:
      "We register your domain, host your site or app, set up SSL and business email, and monitor it around the clock. Accounts in your name, billed at cost.",
    seoTitle: "Managed Hosting, Domains & Email",
    seoDescription:
      "Managed hosting on AWS, Vercel and Cloudflare with SSL, nightly backups and monitoring. Domains and business email set up. Plans from ₹8,000/month.",
    audience: [
      {
        title: "Sites that keep going down",
        body: "Cheap shared hosting, slow pages, and nobody to call when it breaks.",
      },
      {
        title: "Teams that inherited a mess",
        body: "Nobody knows who holds the domain login, when SSL expires or where the backups are.",
      },
      {
        title: "Apps that carry revenue",
        body: "Stores, portals and SaaS products where an hour offline costs real money.",
      },
    ],
    problems: [
      {
        problem: "You hear about downtime from a customer.",
        solution:
          "Uptime checks every 5 minutes, alerts to our on-call engineer, and a status update to you.",
      },
      {
        problem: "The domain or SSL lapses without warning.",
        solution: "Renewals tracked and set to auto-renew, with reminders well before anything expires.",
      },
      {
        problem: "Nobody has tested the backups.",
        solution:
          "Nightly backups kept for 14 to 30 days, with a restore test every month on Business plans.",
      },
      {
        problem: "Pages load slowly for Indian visitors.",
        solution:
          "Cloudflare CDN, image optimisation and hosting in Indian regions such as AWS Mumbai.",
      },
    ],
    features: [
      {
        title: "Domains and DNS",
        body: "New domains or transfers, DNS on Cloudflare, every record documented.",
      },
      {
        title: "Hosting or migration",
        body: "AWS, Vercel or managed WordPress hosting, moved over with no downtime.",
      },
      {
        title: "SSL, CDN and firewall",
        body: "SSL on every domain, Cloudflare CDN, WAF and rate limiting against bots.",
      },
      {
        title: "Business email",
        body: "Google Workspace or Zoho Mail with SPF, DKIM and DMARC, so mail lands in inboxes.",
      },
      {
        title: "Backups and restores",
        body: "Nightly backups with 14–30 day retention, and restores we actually test.",
      },
      {
        title: "24×7 monitoring",
        body: "Uptime, error and performance monitoring with on-call escalation on Business plans.",
      },
    ],
    process: [
      {
        title: "Audit",
        body: "We list every domain, server, login and renewal date you have today.",
        duration: "Day 1–2",
      },
      {
        title: "Plan",
        body: "Pick the plan and hosting that fit, and schedule the move for a quiet hour.",
        duration: "Day 2–3",
      },
      {
        title: "Migrate",
        body: "Copy, test on a staging URL, then switch DNS with no downtime.",
        duration: "Day 3–6",
      },
      {
        title: "Monitor",
        body: "Uptime checks, backups and alerts go live, and you get the access sheet.",
        duration: "Day 7",
      },
      {
        title: "Run",
        body: "Patches, renewals and a monthly health report, handled by us.",
        duration: "Ongoing",
      },
    ],
    priceLabel: "Setup from ₹25,000",
    priceNote:
      "Monthly care plans: Essential ₹8,000, Business ₹25,000, Critical ₹65,000. Cloud, domain and email fees are billed at cost.",
    commitments: [
      "99.95% uptime SLA on Business, 99.99% on Critical",
      "Accounts in your name, infrastructure billed at cost",
      "Monthly restore test on Business and Critical",
      "First response under 30 minutes on Business",
    ],
    faqs: [
      {
        question: "Why not just buy cheap shared hosting?",
        answer:
          "For a small brochure site it can be enough. Once leads or sales depend on the site, you need backups that restore, monitoring, and someone who responds when it fails. That is what you pay us for.",
      },
      {
        question: "Will the migration take my site offline?",
        answer:
          "No. We build and test a copy on a staging URL, lower DNS TTLs in advance and switch over in a quiet hour. Email keeps flowing throughout.",
      },
      {
        question: "Who owns the domain and hosting?",
        answer:
          "You do. Domains and cloud accounts are registered to your business. We work as an authorised user and bill infrastructure at cost.",
      },
      {
        question: "Can you host a site you didn't build?",
        answer:
          "Yes: WordPress, Next.js, Laravel, Node.js or static sites. We audit it first and flag anything risky.",
      },
      {
        question: "What do the care plans include?",
        answer:
          "Essential (₹8,000/month) covers managed deploys, CDN, nightly backups and 5-minute uptime checks. Business (₹25,000) adds 24×7 on-call, a WAF and a 99.95% SLA. Critical (₹65,000) adds multi-region failover and a 15-minute response.",
      },
      {
        question: "Do you set up business email?",
        answer:
          "Yes. Google Workspace or Zoho Mail on your domain, with SPF, DKIM and DMARC so your emails don't land in spam.",
      },
    ],
    related: ["support-maintenance", "business-websites", "web-development"],
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
      "Critical issues answered within 30 minutes on the Business plan",
      "Plugins, dependencies and certificates updated before they expire",
      "A monthly health report you can forward to your board",
    ],
    deliverables: [
      "Onboarding audit report",
      "Staging copy for safe updates",
      "Monthly updates and security patches",
      "Bug fixes and small changes",
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
    headline: "Sites and apps kept secure and current",
    subheadline:
      "Updates, security patches, bug fixes and small changes, handled every month by a named team with published response times. One fixed monthly fee.",
    seoTitle: "Website & App Maintenance Plans",
    seoDescription:
      "Website and app maintenance from ₹40,000. Security patches, plugin and dependency updates, bug fixes, monitoring and a monthly health report.",
    audience: [
      {
        title: "Businesses whose developer moved on",
        body: "The freelancer or agency that built it is gone, and nobody wants to touch the code.",
      },
      {
        title: "WordPress sites with 30 plugins",
        body: "Every update feels risky, so nothing has been updated in a year.",
      },
      {
        title: "Apps in daily use",
        body: "Customers depend on it, and you need fixes the same day, not next sprint.",
      },
    ],
    problems: [
      {
        problem: "Updates break things, so nobody updates.",
        solution: "We update a staging copy first, test key pages and flows, then push to live.",
      },
      {
        problem: "Security holes go unpatched.",
        solution: "Monthly patching, malware scans and dependency alerts through Dependabot.",
      },
      {
        problem: "Bugs wait weeks for a fix.",
        solution:
          "A ticket queue with published response times, and a named engineer who knows your code.",
      },
      {
        problem: "Nobody knows the state of the site.",
        solution:
          "A monthly health report: updates done, uptime, speed, issues fixed and what's next.",
      },
    ],
    features: [
      {
        title: "Code and security audit",
        body: "We review the code, plugins, hosting and access before we take responsibility.",
      },
      {
        title: "Monthly updates",
        body: "Core, plugin, library and OS updates, tested on staging first.",
      },
      {
        title: "Bug fixes",
        body: "Broken pages, forms and features fixed, in order of business impact.",
      },
      {
        title: "Small changes",
        body: "Content edits, new sections and minor features within your monthly hours.",
      },
      {
        title: "Monitoring",
        body: "Uptime checks, Sentry error tracking and alerts routed to our on-call.",
      },
      {
        title: "Monthly health report",
        body: "One page you can forward to management: what changed, what broke, what's next.",
      },
    ],
    process: [
      {
        title: "Handover",
        body: "We collect access to code, hosting, domains and accounts, and document all of it.",
        duration: "Day 1–3",
      },
      {
        title: "Audit",
        body: "Code, plugins, security and performance reviewed, with risks listed by priority.",
        duration: "Day 3–7",
      },
      {
        title: "Stabilise",
        body: "Urgent issues fixed, and staging, backups and monitoring set up.",
        duration: "Week 2",
      },
      {
        title: "Monthly care",
        body: "Updates, patches, fixes and small changes worked from your ticket queue.",
        duration: "Monthly",
      },
      {
        title: "Review",
        body: "The monthly health report, and a short call on what to improve next.",
        duration: "Monthly",
      },
    ],
    priceNote:
      "Covers the onboarding audit, stabilisation and first month. After that, a fixed monthly fee set by the size of your site or app.",
    commitments: [
      "First response under 30 minutes on critical issues",
      "Every update tested on staging first",
      "A named engineer who knows your code",
      "Pause or cancel any time",
    ],
    faqs: [
      {
        question: "Can you maintain a site or app someone else built?",
        answer:
          "Yes. We start with an audit, so we understand the code and its risks before we take responsibility for it.",
      },
      {
        question: "What counts as a small change?",
        answer:
          "Text and image edits, new sections on existing pages, form changes and minor features. Anything larger is quoted separately before we start.",
      },
      {
        question: "How fast do you respond?",
        answer:
          "Under 30 minutes for critical issues on our Business plan, and next business day on Essential. Every ticket shows its status.",
      },
      {
        question: "Do you handle WordPress plugin updates?",
        answer:
          "Yes. We update core, themes and plugins on a staging copy, test key pages and forms, then roll out. Abandoned plugins get replaced.",
      },
      {
        question: "Is there a lock-in period?",
        answer:
          "No. You can pause or cancel any time, and you keep every login, document and line of code.",
      },
      {
        question: "What does maintenance cost?",
        answer:
          "Onboarding starts at ₹40,000, covering the audit, stabilisation and first month. After that you pay a fixed monthly fee based on the size of your site or app and the response time you need.",
      },
    ],
    related: ["managed-hosting", "business-websites", "app-development"],
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
    title: "Discovery call",
    duration: "30 minutes",
    description:
      "A free call about your business, your customers and what the site has to achieve. We review your current site and two or three competitors, and say so plainly if we are not the right team.",
    deliverable: "Free 30-minute call | Goals and competitor notes | Draft page list",
  },
  {
    step: "002",
    title: "Scope & fixed quote",
    duration: "2–5 days",
    description:
      "A written proposal with the pages, features, timeline, payment milestones and one fixed price. You know the full cost before you pay anything.",
    deliverable: "Written scope | Fixed price | Dated milestones",
  },
  {
    step: "003",
    title: "Design",
    duration: "1–2 weeks",
    description:
      "Key pages designed in Figma for mobile and desktop, in your brand. You click through the prototype and request changes before any code is written.",
    deliverable: "Mobile and desktop designs | Clickable prototype | Your sign-off",
  },
  {
    step: "004",
    title: "Build",
    duration: "2–3 weeks",
    description:
      "We build the approved design on WordPress, Shopify or custom code. You follow progress on a live preview link, with a written update every week.",
    deliverable: "Live preview link | Weekly update | Content and images loaded",
  },
  {
    step: "005",
    title: "Launch",
    duration: "2–3 days",
    description:
      "We test on real phones and browsers, check speed and SEO, and connect forms and analytics. Then we point your domain, go live and train your team to edit the site.",
    deliverable: "Device and browser testing | Domain and go-live | Editing walkthrough",
  },
  {
    step: "006",
    title: "Support",
    duration: "3 months included",
    description:
      "Bug fixes and small changes at no extra cost for three months after launch. After that, an optional monthly care plan covers updates, backups and security patches.",
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
      "Business websites start at ₹20,000 for up to 8 pages, with SEO setup and 3 months of support included. Online stores, web apps and mobile apps start at ₹50,000. Your final price is fixed in a written quote before work starts, and all prices exclude GST.",
  },
  {
    group: "Before you start",
    question: "How long does a project take?",
    answer:
      "A business website typically takes 3 to 6 weeks from the first call to launch, and an online store 4 to 10 weeks. Web apps take 8 to 12 weeks and mobile apps 8 to 16. Your quote sets a date for every milestone.",
  },
  {
    group: "Before you start",
    question: "What happens on the discovery call?",
    answer:
      "It is a free 30-minute call about your business, your customers and what the project has to achieve. You leave with a rough scope, a realistic timeline and a price range. If you want to proceed, a written fixed quote follows within 2 to 5 days.",
  },
  {
    group: "Before you start",
    question: "How do payments work?",
    // TODO(owner): confirm the standard milestone split before publishing exact percentages.
    answer:
      "You pay in milestones set out in your quote: an advance to book the work, a payment on design approval and the balance at launch. We accept UPI, bank transfer and cards, with a GST invoice for every payment. Anything outside the agreed scope is quoted separately and starts only after you approve it.",
  },
  {
    group: "Before you start",
    question: "Who owns the website and the code?",
    answer:
      "You do, from day one. The domain, hosting and code accounts are registered in your name, and you receive every login. If you move to another developer, there is nothing to hand back and nothing held back.",
  },
  {
    group: "Before you start",
    question: "Do I need a domain and hosting before we start?",
    answer:
      "No. We connect your existing domain or help you register one in your name, then set up hosting and SSL in your own account. Domain and hosting fees are paid directly to the providers, at cost.",
  },
  {
    group: "Help & support",
    question: "Can I update the website myself?",
    answer:
      "Yes. We build on WordPress or a simple content editor, so you can change text, photos, prices and blog posts without a developer. Before launch we train your team on a call and leave a short written guide.",
  },
  {
    group: "Help & support",
    question: "What support do I get after launch?",
    answer:
      "Website builds include 3 months of support and application builds 6 to 8 months, covering bug fixes and small changes at no extra cost. After that, care plans start at ₹8,000 a month for updates, backups, security patches and uptime checks. You reach the same team by phone, WhatsApp or email during IST working hours.",
  },
  {
    group: "Performance & quality",
    question: "Will my website show up on Google?",
    answer:
      "Every site launches with page titles, a sitemap, Google Search Console, Google Analytics and your Google Business Profile connected, so customers can find you by name. Ranking for competitive searches takes months of content and links, which our SEO and marketing service covers.",
  },
  {
    group: "Performance & quality",
    question: "Can you redesign my existing website?",
    answer:
      "Yes. We first review what your current site does well, where it is slow and which pages bring in enquiries. The redesign carries over your content and web addresses, with redirects for anything that moves, to protect your existing Google rankings.",
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
  { value: 30, suffix: " min", label: "Free discovery call", hint: "No obligation" },
  { value: 1, suffix: "", label: "Fixed written quote", hint: "Before work starts" },
  { value: 3, suffix: " months", label: "Support after launch", hint: "Included in every website build" },
  { value: 100, suffix: "%", label: "Yours to keep", hint: "Domain, code and hosting" },
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
