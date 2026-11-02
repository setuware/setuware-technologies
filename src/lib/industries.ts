import type { ServiceKey } from "./pricing";

/**
 * Industries we build for.
 *
 * Typed data, like `content.ts`, so `/industries` and every
 * `/industries/[slug]` page prerender to static HTML. Each entry describes the
 * problems we hear on first calls and what we usually build in response. It
 * names no clients and quotes no numbers: the case studies on /work do that.
 */

export type IndustryIconName =
  | "store"
  | "stethoscope"
  | "graduation"
  | "building"
  | "factory"
  | "truck"
  | "utensils"
  | "briefcase"
  | "rocket";

export interface IndustryProblem {
  title: string;
  body: string;
}

export interface IndustryBuild {
  /** Links the card to `/services/[service]`. */
  service: ServiceKey;
  title: string;
  body: string;
}

export interface Industry {
  slug: string;
  name: string;
  /** One line used on cards and in the nav. */
  summary: string;
  /** Hero H1: the outcome, in a few words. The name sits above it as the eyebrow. */
  headline: string;
  /** Opening paragraph for the industry page hero: outcome first, then how. */
  intro: string;
  /** `<title>` for the industry page (the site name is appended). */
  seoTitle: string;
  seoDescription: string;
  icon: IndustryIconName;
  problems: readonly IndustryProblem[];
  builds: readonly IndustryBuild[];
  features: readonly string[];
  cta: { title: string; body: string };
}

export const industries: readonly Industry[] = [
  {
    slug: "retail-ecommerce",
    name: "Retail & e-commerce",
    summary: "Online stores, catalogues and order tools for shops and D2C brands.",
    headline: "Sell direct, with stock that matches",
    intro:
      "Sell directly to your customers, with one stock count across shop, website and marketplace. Most retailers already sell on WhatsApp, Instagram or Amazon; what they lack is a store they own and a checkout that works on a budget phone over 4G. We build that store, then keep it running through sale season.",
    seoTitle: "Retail & E-commerce Websites",
    seoDescription:
      "Online stores, stock sync and order tools for Indian retailers and D2C brands. UPI checkout, GST invoices and courier integration, at a fixed price.",
    icon: "store",
    problems: [
      {
        title: "Orders arrive in five places",
        body: "WhatsApp, Instagram DMs, Amazon and walk-ins each keep their own list, and someone reconciles them by hand every evening.",
      },
      {
        title: "Stock is never quite right",
        body: "An item sells out in the shop but stays live online, and the refund costs more than the sale was worth.",
      },
      {
        title: "Marketplace fees eat the margin",
        body: "Commission, ads and returns on marketplaces leave little profit, but there is no direct channel to move customers to.",
      },
      {
        title: "The site slows down on sale day",
        body: "Shared hosting that copes on a Tuesday falls over when a festival offer goes out to the whole customer list.",
      },
    ],
    builds: [
      {
        service: "ecommerce-stores",
        title: "An online store you own",
        body: "Shopify, WooCommerce or a custom build, with UPI and card payments, GST invoices and courier integration.",
      },
      {
        service: "custom-software",
        title: "Inventory and order management",
        body: "One stock count across your shop, website and marketplaces, with low-stock alerts and daily sales reports.",
      },
      {
        service: "seo-marketing",
        title: "Search and ads that sell",
        body: "Product page SEO, Google Shopping feeds and Meta ads measured against orders, not clicks.",
      },
      {
        service: "managed-hosting",
        title: "Hosting sized for sale days",
        body: "Caching, a CDN and load checks before big campaigns, so the store stays up when traffic jumps.",
      },
    ],
    features: [
      "UPI, card, wallet and cash-on-delivery checkout",
      "GST-ready invoices and HSN codes",
      "Shiprocket, Delhivery or custom courier integration",
      "WhatsApp order and delivery notifications",
      "Coupon, combo and festival-offer rules",
      "Stock sync with Amazon and Flipkart listings",
      "Abandoned-cart reminders by email and WhatsApp",
      "Sales, returns and margin reports",
    ],
    cta: {
      title: "Planning a new store or moving off a marketplace?",
      body: "Send us your current setup and product count. We will reply with a platform recommendation and a fixed price.",
    },
  },
  {
    slug: "healthcare-clinics",
    name: "Healthcare & clinics",
    summary: "Clinic websites, appointment booking and patient record tools.",
    headline: "Fewer phone bookings, fewer no-shows",
    intro:
      "Patients book online at any hour, get a reminder before the visit, and their records are a search away. Clinics, diagnostic labs and specialist practices come to us when phone bookings, paper files and missed follow-ups cost them patients. We build the website, the booking flow and the record system, with patient data kept private.",
    seoTitle: "Clinic Websites & Booking Software",
    seoDescription:
      "Clinic websites, online appointment booking, WhatsApp reminders and patient record systems for clinics, diagnostic labs and specialist practices.",
    icon: "stethoscope",
    problems: [
      {
        title: "The phone is the only way to book",
        body: "Reception spends the morning on calls, and patients who ring after hours go to the clinic down the road.",
      },
      {
        title: "No-shows leave gaps in the day",
        body: "Without reminders, patients forget appointments and slots that could have gone to someone else sit empty.",
      },
      {
        title: "Records live in registers and folders",
        body: "Finding a patient's last prescription means searching a cupboard, and nothing is backed up.",
      },
      {
        title: "Patients cannot find you on Google",
        body: "An outdated site and an unclaimed Maps listing mean new patients see competitors first.",
      },
    ],
    builds: [
      {
        service: "business-websites",
        title: "A clinic website patients trust",
        body: "Doctor profiles, treatments, timings and directions, written clearly and fast on mobile.",
      },
      {
        service: "custom-software",
        title: "Appointments and patient records",
        body: "Online booking by doctor and slot, digital prescriptions and visit history, with role-based access.",
      },
      {
        service: "ai-integration",
        title: "Reminders and a front-desk assistant",
        body: "WhatsApp reminders, follow-up nudges and an assistant that answers timing and fee questions.",
      },
      {
        service: "seo-marketing",
        title: "Local search for your area",
        body: "Google Business Profile, local pages and review requests aimed at patients near your clinic.",
      },
    ],
    features: [
      "Online booking by doctor, branch and time slot",
      "WhatsApp and SMS appointment reminders",
      "Digital prescriptions and visit history",
      "Lab report upload and patient download",
      "Role-based access for doctors and front desk",
      "Encrypted storage and daily backups",
      "Online consultation with payment up front",
      "Multi-branch calendars and reports",
    ],
    cta: {
      title: "Want fewer calls and fewer no-shows?",
      body: "Tell us how bookings work at your clinic today. We will show you what an online flow would look like for it.",
    },
  },
  {
    slug: "education-coaching",
    name: "Education & coaching",
    summary: "Admissions sites, learning portals and fee tools for schools and institutes.",
    headline: "More admissions, less admin",
    intro:
      "More enquiries in admission season, and less admin for the rest of the year. Schools, coaching institutes and online educators need both from their software. We build the website that brings students in and the portal that runs batches, fees, tests and parent updates.",
    seoTitle: "School & Coaching Institute Websites",
    seoDescription:
      "Admissions websites, learning portals, online fee collection and parent apps for schools, coaching institutes and online educators across India.",
    icon: "graduation",
    problems: [
      {
        title: "Enquiries peak, then get lost",
        body: "Admission season brings hundreds of calls and form fills, and many never get a follow-up.",
      },
      {
        title: "Fee collection is manual",
        body: "Staff chase instalments by phone, track them in a spreadsheet and issue receipts by hand.",
      },
      {
        title: "Recorded classes live on WhatsApp",
        body: "Videos and notes are shared in groups where they get lost, copied and forwarded to non-students.",
      },
      {
        title: "Parents ask the same questions",
        body: "Attendance, test scores and timetable changes go out one message at a time.",
      },
    ],
    builds: [
      {
        service: "business-websites",
        title: "An admissions website",
        body: "Courses, faculty, results and fees on one fast site, with enquiry forms that feed a lead list.",
      },
      {
        service: "web-development",
        title: "A learning portal",
        body: "Batches, recorded lectures, notes, online tests and progress reports behind a student login.",
      },
      {
        service: "app-development",
        title: "A student and parent app",
        body: "Timetables, attendance, fee reminders and announcements on Android and iOS.",
      },
      {
        service: "seo-marketing",
        title: "Admission-season campaigns",
        body: "Search and social campaigns timed to your intake, with leads routed straight to counsellors.",
      },
    ],
    features: [
      "Enquiry capture with counsellor assignment",
      "Online fee payment with instalment plans",
      "Batch and timetable management",
      "Protected video lectures and downloadable notes",
      "Online tests with automatic scoring",
      "Attendance and progress reports for parents",
      "Certificates generated on course completion",
      "Hindi and regional language support",
    ],
    cta: {
      title: "Getting ready for the next intake?",
      body: "Share your courses and how admissions run today. We will plan a site and portal around your calendar.",
    },
  },
  {
    slug: "real-estate-construction",
    name: "Real estate & construction",
    summary: "Project sites, lead capture and CRM for builders, brokers and contractors.",
    headline: "Turn ad spend into site visits",
    intro:
      "Every portal lead followed up the same day, and every new launch online in days. Builders and brokers spend heavily on portals and ads, then lose leads in a spreadsheet; contractors run sites on phone calls and paper. We build project websites that turn ad spend into site visits, and the CRM and site-tracking tools that follow through.",
    seoTitle: "Real Estate Websites & CRM",
    seoDescription:
      "Project websites, lead capture and sales CRM for builders and brokers, plus site-progress tools for contractors. RERA details, floor plans, follow-ups.",
    icon: "building",
    problems: [
      {
        title: "Portal leads go cold",
        body: "Leads from portals and ads land in different inboxes, and the first call happens a day too late.",
      },
      {
        title: "Every project needs its own page",
        body: "A new launch needs floor plans, pricing, approvals and a brochure online in days, not weeks.",
      },
      {
        title: "Site progress is reported by phone",
        body: "Owners hear about delays, material shortages and labour issues only when they visit.",
      },
      {
        title: "Buyers want updates after booking",
        body: "Payment schedules, construction photos and documents are sent one buyer at a time.",
      },
    ],
    builds: [
      {
        service: "business-websites",
        title: "Project and listing websites",
        body: "Launch pages with floor plans, price sheets, RERA details, maps and brochure downloads.",
      },
      {
        service: "custom-software",
        title: "Sales CRM and site tracking",
        body: "Every lead in one pipeline with call reminders, plus daily progress and material logs from site.",
      },
      {
        service: "app-development",
        title: "A buyer and site-team app",
        body: "Construction updates and payment schedules for buyers, photo reports for supervisors.",
      },
      {
        service: "seo-marketing",
        title: "Campaigns that book site visits",
        body: "Location-targeted ads and landing pages measured on site visits booked, not form fills.",
      },
    ],
    features: [
      "Project pages with floor plans and price sheets",
      "RERA number and approval details on every listing",
      "Lead capture from portals, ads and WhatsApp",
      "Site-visit booking with sales follow-up reminders",
      "Payment schedules and demand letters for buyers",
      "Daily site reports with photos",
      "Material and labour logs per site",
      "360° tours and walkthrough video embeds",
    ],
    cta: {
      title: "Launching a project soon?",
      body: "Send us the project details and launch date. We will tell you what can be live by then.",
    },
  },
  {
    slug: "manufacturing-distribution",
    name: "Manufacturing & distribution",
    summary: "Catalogue sites, dealer portals and ERP for manufacturers and traders.",
    headline: "Dealer orders and stock in one place",
    intro:
      "Dealer orders, stock and dispatch in one system, with the numbers ready each morning. Manufacturers and distributors often run on Tally, spreadsheets and a WhatsApp group per dealer, which holds until volume grows. We build catalogue sites that bring in trade enquiries, dealer portals for repeat orders, and ERP modules that connect production, stock and dispatch.",
    seoTitle: "Manufacturing ERP & Dealer Portals",
    seoDescription:
      "Catalogue websites, dealer ordering portals and ERP modules for Indian manufacturers and distributors, synced with Tally and GST e-invoicing.",
    icon: "factory",
    problems: [
      {
        title: "Dealers order over WhatsApp",
        body: "Orders, price lists and photos are scattered across chats, and mistakes show up at dispatch.",
      },
      {
        title: "Nobody knows today's stock",
        body: "Raw material, work in progress and finished goods are counted in different sheets that rarely agree.",
      },
      {
        title: "The website is a brochure from years ago",
        body: "Buyers searching for your product category find competitors with a clear catalogue and contact form.",
      },
      {
        title: "Reports take a day to build",
        body: "Sales by dealer, outstanding payments and production output are compiled by hand at month end.",
      },
    ],
    builds: [
      {
        service: "business-websites",
        title: "A product catalogue site",
        body: "Product ranges, specifications, certifications and enquiry forms built for B2B buyers.",
      },
      {
        service: "custom-software",
        title: "ERP and dealer portal",
        body: "Dealer orders, price tiers, stock, production and dispatch in one system that syncs with Tally.",
      },
      {
        service: "ai-integration",
        title: "Automated reports and alerts",
        body: "Daily stock, order and payment summaries sent to owners, with alerts when numbers slip.",
      },
      {
        service: "support-maintenance",
        title: "Support after go-live",
        body: "Fixes, small changes and new reports on a monthly plan, from the team that built the system.",
      },
    ],
    features: [
      "Product catalogue with specifications and PDFs",
      "Dealer login with tiered price lists",
      "Order booking, approval and dispatch tracking",
      "Raw material and finished goods stock",
      "Tally and GST e-invoice integration",
      "Outstanding payment reminders",
      "Production planning and batch records",
      "Owner dashboard with daily summaries",
    ],
    cta: {
      title: "Outgrowing spreadsheets and Tally?",
      body: "Walk us through how an order moves from enquiry to dispatch. We will map what a system for it would cover.",
    },
  },
  {
    slug: "logistics-transport",
    name: "Logistics & transport",
    summary: "Tracking, dispatch and driver apps for fleets, couriers and 3PLs.",
    headline: "Fewer where-is-my-shipment calls",
    intro:
      "Customers track their own shipments, drivers record proof of delivery on the spot, and invoices follow each completed trip. Transporters, couriers and warehouse operators come to us when tracking calls fill the operations team's day. We build the booking portal, the dispatch board and a driver app that works on patchy networks.",
    seoTitle: "Logistics Tracking & Driver Apps",
    seoDescription:
      "Shipment tracking portals, dispatch tools and offline-ready driver apps for transporters, couriers and 3PLs, with proof of delivery and trip billing.",
    icon: "truck",
    problems: [
      {
        title: "Customers call for every update",
        body: "Without self-serve tracking, the operations team spends its day answering where-is-my-shipment calls.",
      },
      {
        title: "Proof of delivery is a paper slip",
        body: "Signed slips get lost or arrive at the office days later, which delays billing.",
      },
      {
        title: "Dispatch runs on memory",
        body: "Vehicle allocation, routes and driver availability sit in one person's head and a phone.",
      },
      {
        title: "Billing does not match trips",
        body: "Freight, detention and fuel charges are worked out by hand and disputes drag on.",
      },
    ],
    builds: [
      {
        service: "web-development",
        title: "Booking and tracking portal",
        body: "Customers book shipments, track them live and download invoices and proof of delivery.",
      },
      {
        service: "app-development",
        title: "A driver app",
        body: "Trip assignments, navigation, photo and signature proof of delivery, and offline sync.",
      },
      {
        service: "custom-software",
        title: "Dispatch and fleet management",
        body: "Vehicle allocation, trip sheets, fuel logs, maintenance schedules and trip-based billing.",
      },
      {
        service: "business-websites",
        title: "A company website that wins contracts",
        body: "Routes, fleet, warehouse capacity and a quote form for B2B shippers.",
      },
    ],
    features: [
      "Live shipment tracking by AWB or LR number",
      "Driver app with offline mode",
      "Photo and e-signature proof of delivery",
      "Vehicle and driver allocation board",
      "Trip sheets, fuel and toll logs",
      "Automatic freight invoices from completed trips",
      "SMS and WhatsApp status updates to consignees",
      "Customer portal with invoice downloads",
    ],
    cta: {
      title: "Spending the day on tracking calls?",
      body: "Tell us how many vehicles and shipments you run. We will suggest where tracking and a driver app would save the most time.",
    },
  },
  {
    slug: "hospitality-restaurants",
    name: "Hospitality & restaurants",
    summary: "Websites, direct booking and ordering for hotels, cafés and restaurants.",
    headline: "More direct bookings, less commission",
    intro:
      "More guests booking and ordering with you directly, and less paid away in platform commission. Hotels, cafés and restaurants already have guests who would book direct if it were easy. We build fast, photo-led websites with booking and ordering, connected to the tools at your front desk and in your kitchen.",
    seoTitle: "Hotel & Restaurant Websites",
    seoDescription:
      "Fast hotel and restaurant websites with direct booking, online ordering and QR menus, so more guests book with you instead of through aggregators.",
    icon: "utensils",
    problems: [
      {
        title: "Platform commissions keep rising",
        body: "Every booking and delivery order through an aggregator gives away a large share of the bill.",
      },
      {
        title: "The menu online is out of date",
        body: "Prices and dishes change, but the PDF on the website and the Google listing do not.",
      },
      {
        title: "Guests cannot book direct",
        body: "Without a booking engine, guests who find you on Google still book through a platform.",
      },
      {
        title: "Reviews go unanswered",
        body: "Feedback arrives on four platforms and nobody has time to read, let alone reply.",
      },
    ],
    builds: [
      {
        service: "business-websites",
        title: "A website that sells the experience",
        body: "Rooms or menus, photos, location and offers on a site that loads fast on any phone.",
      },
      {
        service: "ecommerce-stores",
        title: "Direct ordering and booking",
        body: "Table reservations, room booking or online ordering with payment, without per-order commission.",
      },
      {
        service: "seo-marketing",
        title: "Local search and reviews",
        body: "Google Business Profile, menu and photo updates, and a steady flow of review requests.",
      },
      {
        service: "product-design",
        title: "Brand and menu design",
        body: "Logo, menu cards, signage and social templates that match the place.",
      },
    ],
    features: [
      "Room booking engine or table reservations",
      "Online ordering with UPI and card payment",
      "QR code menus that update from one place",
      "Offers and loyalty codes for repeat guests",
      "Google Business Profile management",
      "Review requests after each visit or stay",
      "Event and banquet enquiry forms",
      "Photo galleries that stay fast on mobile",
    ],
    cta: {
      title: "Want more direct bookings?",
      body: "Share your property or restaurant and where your bookings come from today. We will show you what direct booking would look like.",
    },
  },
  {
    slug: "professional-services",
    name: "Professional services",
    summary: "Websites and client portals for CA firms, law practices and consultants.",
    headline: "A website that matches your reputation",
    intro:
      "A website that reflects the firm's experience, and a portal that ends the chase for client documents. CA firms, law practices and consultancies win work on reputation, but clients still check the website before they call. We build both, so documents, deadlines and invoices sit behind one secure login instead of in email chains.",
    seoTitle: "Websites for CA & Law Firms",
    seoDescription:
      "Practice websites and secure client portals for CA firms, law practices and consultancies. Document collection, compliance calendars and invoices.",
    icon: "briefcase",
    problems: [
      {
        title: "The website undersells the firm",
        body: "Partners have decades of experience, but the site is a single page with a phone number.",
      },
      {
        title: "Documents arrive by email and WhatsApp",
        body: "Clients send bank statements, notices and invoices in every format, and staff file them by hand.",
      },
      {
        title: "Deadlines depend on reminders",
        body: "GST, TDS and ROC filing dates are tracked in spreadsheets, and clients send documents late.",
      },
      {
        title: "Enquiries are not followed up",
        body: "Website enquiries land in a shared inbox and wait until someone has a free afternoon.",
      },
    ],
    builds: [
      {
        service: "business-websites",
        title: "A practice website",
        body: "Services, partner profiles, industries served and articles, written plainly and fast to load.",
      },
      {
        service: "custom-software",
        title: "A client portal",
        body: "Secure document upload, task status, compliance calendars and invoices in one login.",
      },
      {
        service: "ai-integration",
        title: "Reminders and document sorting",
        body: "Automatic deadline reminders to clients and first-pass sorting of uploaded documents.",
      },
      {
        service: "seo-marketing",
        title: "Search for your practice areas",
        body: "Practice-area pages and articles that answer the questions clients search for.",
      },
    ],
    features: [
      "Partner and team profile pages",
      "Practice-area pages with enquiry forms",
      "Secure client document upload",
      "Compliance calendar with automatic reminders",
      "Task status visible to clients",
      "Invoices and payment links",
      "Appointment booking for consultations",
      "Articles and updates section",
    ],
    cta: {
      title: "Spending too long chasing client documents?",
      body: "Tell us how your firm collects documents today. We will outline a portal that fits your workflow.",
    },
  },
  {
    slug: "startups-saas",
    name: "Startups & SaaS",
    summary: "MVPs, SaaS products and launch sites for founders.",
    headline: "Launch an MVP you will not rebuild",
    intro:
      "A working product in front of users by a fixed date, on code that survives the first funding round. We scope the MVP to what you need to learn, build it on Next.js and PostgreSQL, and stay on to run and extend it. The repository and cloud accounts are yours from day one.",
    seoTitle: "MVP & SaaS Development for Startups",
    seoDescription:
      "MVP and SaaS development for founders: sign-up, billing, dashboards and mobile apps on Next.js and PostgreSQL, at a fixed price and launch date.",
    icon: "rocket",
    problems: [
      {
        title: "The scope keeps growing",
        body: "Every investor and early user adds a feature, and launch moves further away.",
      },
      {
        title: "The first build was thrown away",
        body: "A cheap prototype could not handle real users, so the product is being rebuilt from scratch.",
      },
      {
        title: "No one owns the infrastructure",
        body: "Hosting, backups, monitoring and security are set up once and never checked again.",
      },
      {
        title: "The landing page does not convert",
        body: "Traffic arrives from launches and ads, but visitors leave without signing up.",
      },
    ],
    builds: [
      {
        service: "web-development",
        title: "An MVP or SaaS product",
        body: "Auth, billing, dashboards and admin on Next.js and PostgreSQL, scoped to a fixed launch date.",
      },
      {
        service: "app-development",
        title: "A mobile app",
        body: "iOS and Android from one codebase, sharing logic and APIs with your web product.",
      },
      {
        service: "product-design",
        title: "Product and brand design",
        body: "User flows, interface design and a brand that looks credible to users and investors.",
      },
      {
        service: "managed-hosting",
        title: "Infrastructure that is watched",
        body: "Cloud hosting, CI/CD, backups and monitoring set up properly from day one.",
      },
    ],
    features: [
      "Sign-up, login and team accounts",
      "Subscription billing with Razorpay or Stripe",
      "Admin panel and usage dashboards",
      "Product analytics and event tracking",
      "Public API and webhooks",
      "Automated tests and CI/CD",
      "Error tracking and uptime monitoring",
      "Launch site with pricing and docs pages",
    ],
    cta: {
      title: "Have an idea and a launch date?",
      body: "Send us a short brief. We will reply with what fits in a first version and what can wait.",
    },
  },
];

export function getIndustry(slug: string): Industry | undefined {
  return industries.find((industry) => industry.slug === slug);
}
