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
  /** A concrete solution for the sector, e.g. "Online appointment booking". */
  title: string;
  body: string;
}

export interface IndustryImage {
  /** Path under /public, cropped to 3:2 (1200 × 800). */
  src: string;
  alt: string;
}

export interface Industry {
  slug: string;
  name: string;
  /** Plural noun for the people we build for, used in headings ("Solutions for clinics"). */
  sector: string;
  /** One line used on cards and in the nav. */
  summary: string;
  /** Hero H1: what we build for the sector. The name sits above it as the eyebrow. */
  headline: string;
  /** Opening paragraph for the industry page hero: outcome first, then how. */
  intro: string;
  /** `<title>` for the industry page (the site name is appended). */
  seoTitle: string;
  seoDescription: string;
  icon: IndustryIconName;
  /** Photograph shown beside the overview and on industry cards. */
  image: IndustryImage;
  /** Overview beside the photograph: what we change for the sector. */
  overview: { title: string; body: string };
  /** Three outcomes the client can expect, listed under the overview. */
  outcomes: readonly string[];
  problems: readonly IndustryProblem[];
  builds: readonly IndustryBuild[];
  features: readonly string[];
  cta: { title: string; body: string };
}

export const industries: readonly Industry[] = [
  {
    slug: "retail-ecommerce",
    name: "Retail & e-commerce",
    sector: "retailers and D2C brands",
    summary: "Online stores and order management for retailers and D2C brands",
    headline: "Websites and software for retail and e-commerce",
    intro:
      "We help retailers and direct-to-consumer brands sell online through their own stores, with inventory synchronised across shops, websites and marketplaces. Each store is built for secure mobile checkout and the demands of peak sale periods.",
    seoTitle: "Retail and e-commerce websites",
    seoDescription:
      "Online stores, inventory synchronisation and order management for retailers and D2C brands, with UPI checkout, GST invoicing and courier integration.",
    icon: "store",
    image: {
      src: "/images/industries/retail-ecommerce.jpg",
      alt: "Two colleagues packing customer orders into cardboard boxes",
    },
    overview: {
      title: "One stock record across every sales channel",
      body: "Most retailers sell through a shop, a website and at least one marketplace, with stock and orders tracked separately for each. We connect these channels to one inventory and order system, so every sale updates stock everywhere and every order follows the same fulfilment process.",
    },
    outcomes: [
      "Fewer cancellations caused by overselling",
      "Less dependence on marketplace commissions",
      "A checkout that stays fast during festive sales",
    ],
    problems: [
      {
        title: "Orders across multiple channels",
        body: "Orders from WhatsApp, Instagram, marketplaces and walk-in customers are recorded separately and reconciled manually.",
      },
      {
        title: "Inaccurate stock levels",
        body: "Products that sell out in store remain available online, which leads to cancellations and refunds.",
      },
      {
        title: "High marketplace costs",
        body: "Commissions, advertising and returns on marketplaces reduce margins, with no direct sales channel in place.",
      },
      {
        title: "Performance during peak demand",
        body: "Shared hosting struggles during festive campaigns and promotional launches.",
      },
    ],
    builds: [
      {
        service: "ecommerce-stores",
        title: "Online store",
        body: "A Shopify, WooCommerce or custom Next.js store with UPI, card and cash-on-delivery checkout.",
      },
      {
        service: "custom-software",
        title: "Inventory and order management",
        body: "One stock record for your shops, website and marketplaces, with low-stock alerts and daily sales reports.",
      },
      {
        service: "ecommerce-stores",
        title: "GST invoicing and courier integration",
        body: "Tax invoices for every order and shipping labels through Shiprocket or Delhivery, generated automatically.",
      },
      {
        service: "ai-integration",
        title: "WhatsApp order updates",
        body: "Order confirmations, dispatch notifications and abandoned-cart reminders sent on WhatsApp.",
      },
      {
        service: "seo-marketing",
        title: "Google Shopping and Meta campaigns",
        body: "Product feeds, product page SEO and catalogue campaigns measured against completed orders.",
      },
      {
        service: "managed-hosting",
        title: "Hosting for peak sales",
        body: "Caching, a CDN and load testing ahead of major campaigns, so the store stays available.",
      },
    ],
    features: [
      "UPI, card, wallet and cash-on-delivery checkout",
      "GST-compliant invoices with HSN codes",
      "Shiprocket, Delhivery or custom courier integration",
      "WhatsApp order and delivery notifications",
      "Coupon, bundle and seasonal offer rules",
      "Stock synchronisation with Amazon and Flipkart",
      "Abandoned-cart reminders by email and WhatsApp",
      "Sales, returns and margin reports",
    ],
    cta: {
      title: "Planning a new online store",
      body: "Share your current set-up and catalogue size, and we will recommend a platform with a fixed-price proposal.",
    },
  },
  {
    slug: "healthcare-clinics",
    name: "Healthcare & clinics",
    sector: "clinics and diagnostic centres",
    summary: "Clinic websites, appointment booking and patient records",
    headline: "Websites and software for healthcare and clinics",
    intro:
      "We build websites, online appointment booking and patient record systems for clinics, diagnostic laboratories and specialist practices. Every system is designed to improve the patient experience and keep medical data secure.",
    seoTitle: "Clinic websites and booking software",
    seoDescription:
      "Clinic websites, online appointment booking, WhatsApp reminders and patient record systems for clinics, diagnostic laboratories and specialist practices.",
    icon: "stethoscope",
    image: {
      src: "/images/industries/healthcare-clinics.jpg",
      alt: "A doctor reviewing notes on a tablet with a patient at a clinic desk",
    },
    overview: {
      title: "Online booking and records for busy practices",
      body: "Clinics usually come to us when reception spends most of the day on calls and patient records sit in paper registers. We move booking, reminders and records online, with access controlled by role and data encrypted at rest.",
    },
    outcomes: [
      "Appointments booked online at any hour",
      "Fewer missed appointments through automated reminders",
      "Patient records stored securely and backed up daily",
    ],
    problems: [
      {
        title: "Telephone-only booking",
        body: "Reception teams spend much of the day on calls, and patients cannot book outside clinic hours.",
      },
      {
        title: "Missed appointments",
        body: "Without automated reminders, missed appointments leave unused slots in the schedule.",
      },
      {
        title: "Paper-based records",
        body: "Patient histories and prescriptions are stored in registers and folders, without secure backups.",
      },
      {
        title: "Limited local visibility",
        body: "An outdated website and an incomplete Google Business Profile make it harder for new patients to find the practice.",
      },
    ],
    builds: [
      {
        service: "business-websites",
        title: "Clinic website",
        body: "Doctor profiles, treatments, timings and directions, presented clearly and optimised for mobile.",
      },
      {
        service: "custom-software",
        title: "Online appointment booking",
        body: "Booking by doctor, branch and time slot, with advance payment for online consultations.",
      },
      {
        service: "ai-integration",
        title: "WhatsApp appointment reminders",
        body: "Automated reminders, follow-up messages and a front-desk assistant that answers questions on timings and fees.",
      },
      {
        service: "custom-software",
        title: "Patient records portal",
        body: "Digital prescriptions, visit history and lab reports, with role-based access for doctors and reception.",
      },
      {
        service: "seo-marketing",
        title: "Google Business Profile optimisation",
        body: "A complete profile, local landing pages and review requests that help nearby patients find the practice.",
      },
    ],
    features: [
      "Online booking by doctor, branch and time slot",
      "WhatsApp and SMS appointment reminders",
      "Digital prescriptions and visit history",
      "Lab report upload and patient download",
      "Role-based access for doctors and reception",
      "Encrypted storage and daily backups",
      "Online consultations with advance payment",
      "Multi-branch calendars and reports",
    ],
    cta: {
      title: "Modernise your patient booking",
      body: "Tell us how appointments are managed at your clinic today, and we will propose an online booking workflow to suit it.",
    },
  },
  {
    slug: "education-coaching",
    name: "Education & coaching",
    sector: "schools and coaching institutes",
    summary: "Admissions websites, learning portals and fee management",
    headline: "Websites and software for education and coaching",
    intro:
      "We build admissions websites, learning portals and fee management systems for schools, coaching institutes and online educators. Each platform is designed to increase enquiries during admissions and reduce administration throughout the year.",
    seoTitle: "School and coaching websites",
    seoDescription:
      "Admissions websites, learning portals, online fee collection and parent apps for schools, coaching institutes and online educators across India.",
    icon: "graduation",
    image: {
      src: "/images/industries/education-coaching.jpg",
      alt: "A tutor and a student working through an assignment with a laptop",
    },
    overview: {
      title: "Admissions, fees and learning in one place",
      body: "Schools and institutes often manage enquiries, fee instalments and study material across phone calls, spreadsheets and messaging groups. We bring them into one website and portal, organised around your academic calendar.",
    },
    outcomes: [
      "Every admission enquiry assigned and followed up",
      "Fees collected online, with receipts issued automatically",
      "Course content available only to enrolled students",
    ],
    problems: [
      {
        title: "Unmanaged admission enquiries",
        body: "Admission season brings a high volume of calls and forms, and many enquiries do not receive a timely follow-up.",
      },
      {
        title: "Manual fee collection",
        body: "Staff track instalments in spreadsheets, follow up by phone and issue receipts by hand.",
      },
      {
        title: "Unsecured course content",
        body: "Recorded classes and notes shared through messaging groups are easily lost or forwarded.",
      },
      {
        title: "Repetitive parent communication",
        body: "Attendance, results and timetable updates are sent to parents individually.",
      },
    ],
    builds: [
      {
        service: "business-websites",
        title: "Admissions website",
        body: "Courses, faculty, results and fees on one fast website, with enquiry forms linked to your counsellors.",
      },
      {
        service: "custom-software",
        title: "Enquiry and counselling CRM",
        body: "Every admission enquiry captured, assigned to a counsellor and tracked through to enrolment.",
      },
      {
        service: "web-development",
        title: "Online fee collection",
        body: "Instalment plans, UPI and card payments, automatic receipts and reminders for overdue fees.",
      },
      {
        service: "web-development",
        title: "Learning portal",
        body: "Recorded lectures, notes and online tests with automatic scoring, behind a secure student login.",
      },
      {
        service: "app-development",
        title: "Student and parent app",
        body: "Timetables, attendance, results and announcements on Android and iOS.",
      },
      {
        service: "seo-marketing",
        title: "Admission campaigns",
        body: "Search and social campaigns timed to your intake, with leads routed directly to counsellors.",
      },
    ],
    features: [
      "Enquiry capture with counsellor assignment",
      "Online fee payment with instalment plans",
      "Batch and timetable management",
      "Protected video lectures and downloadable notes",
      "Online tests with automatic scoring",
      "Attendance and progress reports for parents",
      "Certificates issued on course completion",
      "Hindi and regional language support",
    ],
    cta: {
      title: "Prepare for your next intake",
      body: "Share your courses and current admissions process, and we will plan a website and portal around your academic calendar.",
    },
  },
  {
    slug: "real-estate-construction",
    name: "Real estate & construction",
    sector: "developers, brokers and contractors",
    summary: "Project websites, lead management and CRM for developers",
    headline: "Websites and software for real estate and construction",
    intro:
      "We build project websites, lead management systems and site-tracking tools for developers, brokers and contractors. Each project launches quickly online, and every enquiry is captured and followed up promptly.",
    seoTitle: "Real estate websites and CRM",
    seoDescription:
      "Project websites, lead capture and sales CRM for developers and brokers, with site-progress tools for contractors and RERA details on every listing.",
    icon: "building",
    image: {
      src: "/images/industries/real-estate-construction.jpg",
      alt: "An agent showing a couple around an apartment under construction",
    },
    overview: {
      title: "From project launch to buyer handover",
      body: "Developers and brokers need each project online quickly and every lead contacted promptly, while contractors need daily visibility of every site. We build the websites, CRM and site tools that support each stage, from launch to handover.",
    },
    outcomes: [
      "Project websites ready for launch day",
      "Every lead contacted and tracked to a site visit",
      "Daily progress reports from every site",
    ],
    problems: [
      {
        title: "Delayed lead follow-up",
        body: "Leads from property portals and advertising arrive in separate inboxes and are often contacted late.",
      },
      {
        title: "Slow project launches",
        body: "Each new project needs floor plans, pricing, approvals and brochures online within a short timeframe.",
      },
      {
        title: "Limited site visibility",
        body: "Owners learn of delays, material shortages and labour issues only during site visits.",
      },
      {
        title: "Manual buyer updates",
        body: "Payment schedules, construction photographs and documents are shared with each buyer individually.",
      },
    ],
    builds: [
      {
        service: "business-websites",
        title: "Project launch websites",
        body: "Floor plans, price sheets, RERA details, maps and brochure downloads on a fast landing page.",
      },
      {
        service: "custom-software",
        title: "Sales CRM",
        body: "Leads from property portals, advertising and WhatsApp in one pipeline, with call reminders and site-visit scheduling.",
      },
      {
        service: "custom-software",
        title: "Site progress tracking",
        body: "Daily progress, material and labour logs with photographs, submitted from each site.",
      },
      {
        service: "app-development",
        title: "Buyer app",
        body: "Construction updates, payment schedules and documents shared with each buyer in one place.",
      },
      {
        service: "seo-marketing",
        title: "Site-visit campaigns",
        body: "Location-targeted advertising and landing pages measured on site visits booked.",
      },
    ],
    features: [
      "Project pages with floor plans and price sheets",
      "RERA and approval details on every listing",
      "Lead capture from portals, ads and WhatsApp",
      "Site-visit booking with follow-up reminders",
      "Payment schedules and demand letters for buyers",
      "Daily site reports with photographs",
      "Material and labour logs for each site",
      "Virtual tours and walkthrough videos",
    ],
    cta: {
      title: "Launching a new project",
      body: "Share the project details and launch date, and we will confirm what can be delivered within your timeline.",
    },
  },
  {
    slug: "manufacturing-distribution",
    name: "Manufacturing & distribution",
    sector: "manufacturers and distributors",
    summary: "Catalogue websites, dealer portals and ERP systems",
    headline: "Websites and software for manufacturing and distribution",
    intro:
      "We build catalogue websites, dealer ordering portals and ERP modules for manufacturers and distributors. Each system connects production, inventory and dispatch, with reporting available every morning.",
    seoTitle: "Manufacturing ERP and dealer portals",
    seoDescription:
      "Catalogue websites, dealer ordering portals and ERP modules for manufacturers and distributors, integrated with Tally and GST e-invoicing.",
    icon: "factory",
    image: {
      src: "/images/industries/manufacturing-distribution.jpg",
      alt: "A technician checking a CNC machine with a handheld controller",
    },
    overview: {
      title: "Orders, inventory and dispatch in one system",
      body: "Manufacturers and distributors often run dealer orders, stock and production across separate spreadsheets and messaging threads. We replace them with one system integrated with Tally, so management sees orders, stock and receivables in a single daily report.",
    },
    outcomes: [
      "Dealer orders placed and approved online",
      "One inventory record from raw material to dispatch",
      "Daily management reports without manual compilation",
    ],
    problems: [
      {
        title: "Informal dealer ordering",
        body: "Orders and price lists are shared across messaging threads, which leads to errors at dispatch.",
      },
      {
        title: "Unclear stock positions",
        body: "Raw materials, work in progress and finished goods are tracked in separate spreadsheets that rarely reconcile.",
      },
      {
        title: "Outdated online presence",
        body: "Buyers searching for your product category find competitors with clearer catalogues and enquiry forms.",
      },
      {
        title: "Time-consuming reporting",
        body: "Sales by dealer, outstanding payments and production output are compiled manually at month end.",
      },
    ],
    builds: [
      {
        service: "business-websites",
        title: "Product catalogue website",
        body: "Product ranges, specifications, certifications and enquiry forms designed for B2B buyers.",
      },
      {
        service: "web-development",
        title: "Dealer ordering portal",
        body: "Dealers log in to view tiered prices, place orders and track dispatch and outstanding payments.",
      },
      {
        service: "custom-software",
        title: "ERP with Tally integration",
        body: "Inventory, production planning and dispatch in one system, synchronised with Tally and GST e-invoicing.",
      },
      {
        service: "ai-integration",
        title: "Automated reports and alerts",
        body: "Daily stock, order and payment summaries for management, with alerts when targets are missed.",
      },
      {
        service: "support-maintenance",
        title: "Ongoing support",
        body: "Fixes, enhancements and new reports on a monthly plan, delivered by the team that built the system.",
      },
    ],
    features: [
      "Product catalogue with specifications and PDFs",
      "Dealer login with tiered price lists",
      "Order booking, approval and dispatch tracking",
      "Raw material and finished goods inventory",
      "Tally and GST e-invoice integration",
      "Outstanding payment reminders",
      "Production planning and batch records",
      "Management dashboard with daily summaries",
    ],
    cta: {
      title: "Move beyond spreadsheets",
      body: "Walk us through how an order moves from enquiry to dispatch, and we will outline a system to support it.",
    },
  },
  {
    slug: "logistics-transport",
    name: "Logistics & transport",
    sector: "transporters, couriers and warehouses",
    summary: "Shipment tracking, dispatch and driver apps",
    headline: "Websites and software for logistics and transport",
    intro:
      "We build booking portals, dispatch systems and driver apps for transporters, couriers and warehouse operators. Customers track shipments independently, drivers record proof of delivery on site and invoices are generated for every completed trip.",
    seoTitle: "Logistics tracking and driver apps",
    seoDescription:
      "Shipment tracking portals, dispatch tools and offline-ready driver apps for transporters, couriers and 3PLs, with proof of delivery and trip billing.",
    icon: "truck",
    image: {
      src: "/images/industries/logistics-transport.jpg",
      alt: "Two warehouse workers carrying boxes between stocked shelves",
    },
    overview: {
      title: "Every shipment recorded from booking to invoice",
      body: "Logistics teams lose hours to status calls, paper delivery slips and manual freight calculations. We build the customer portal, driver app and dispatch system that record each shipment from booking to invoice.",
    },
    outcomes: [
      "Customers track shipments without calling",
      "Proof of delivery captured on site",
      "Invoices raised for every completed trip",
    ],
    problems: [
      {
        title: "High volume of tracking enquiries",
        body: "Without self-service tracking, operations teams spend much of the day answering status calls.",
      },
      {
        title: "Paper-based proof of delivery",
        body: "Signed delivery slips are lost or reach the office days later, which delays billing.",
      },
      {
        title: "Informal dispatch planning",
        body: "Vehicle allocation, routes and driver availability are managed by phone and memory.",
      },
      {
        title: "Billing discrepancies",
        body: "Freight, detention and fuel charges are calculated manually, which leads to disputes.",
      },
    ],
    builds: [
      {
        service: "web-development",
        title: "Shipment tracking portal",
        body: "Customers book shipments, track them by AWB or LR number and download invoices and proof of delivery.",
      },
      {
        service: "app-development",
        title: "Driver app",
        body: "Trip assignments, navigation and proof of delivery by photo or e-signature, with offline synchronisation.",
      },
      {
        service: "custom-software",
        title: "Dispatch and fleet management",
        body: "Vehicle allocation, trip sheets, fuel logs and maintenance schedules on one dispatch board.",
      },
      {
        service: "custom-software",
        title: "Freight billing",
        body: "Freight, detention and toll charges calculated for each trip, with invoices generated on delivery.",
      },
      {
        service: "ai-integration",
        title: "WhatsApp status updates",
        body: "Pickup, transit and delivery updates sent automatically to consignees by WhatsApp and SMS.",
      },
      {
        service: "business-websites",
        title: "Corporate website",
        body: "Routes, fleet, warehouse capacity and a quotation form for B2B shippers.",
      },
    ],
    features: [
      "Live shipment tracking by AWB or LR number",
      "Driver app with offline mode",
      "Photo and e-signature proof of delivery",
      "Vehicle and driver allocation board",
      "Trip sheets, fuel and toll logs",
      "Automatic freight invoices for completed trips",
      "SMS and WhatsApp status updates for consignees",
      "Customer portal with invoice downloads",
    ],
    cta: {
      title: "Streamline your operations",
      body: "Share the size of your fleet and shipment volumes, and we will identify where tracking and a driver app would add the most value.",
    },
  },
  {
    slug: "hospitality-restaurants",
    name: "Hospitality & restaurants",
    sector: "hotels, cafés and restaurants",
    summary: "Websites, direct booking and online ordering",
    headline: "Websites and software for hospitality and restaurants",
    intro:
      "We build fast, visually rich websites with direct booking and online ordering for hotels, cafés and restaurants. Each platform integrates with your front-desk and kitchen systems and reduces reliance on third-party commissions.",
    seoTitle: "Hotel and restaurant websites",
    seoDescription:
      "Hotel and restaurant websites with direct booking, online ordering and QR menus that increase direct revenue and reduce aggregator commissions.",
    icon: "utensils",
    image: {
      src: "/images/industries/hospitality-restaurants.jpg",
      alt: "A waiter serving drinks to guests at a restaurant table",
    },
    overview: {
      title: "Direct bookings and orders, without aggregator commissions",
      body: "Hotels and restaurants pay commission on many bookings and orders that begin with a search for their own name. We build direct booking and ordering channels, and keep menus, photographs and reviews current on your website and Google listing.",
    },
    outcomes: [
      "A direct channel for bookings and orders",
      "Menus and prices updated in one place",
      "Guest reviews requested and answered consistently",
    ],
    problems: [
      {
        title: "Rising platform commissions",
        body: "Bookings and delivery orders placed through aggregators carry a significant commission on every bill.",
      },
      {
        title: "Outdated menus online",
        body: "Prices and dishes change, but the menu on the website and Google listing is not updated.",
      },
      {
        title: "No direct booking channel",
        body: "Without a booking engine, guests who find you on Google continue to book through third-party platforms.",
      },
      {
        title: "Unmanaged guest reviews",
        body: "Feedback arrives across several platforms and often goes unanswered.",
      },
    ],
    builds: [
      {
        service: "business-websites",
        title: "Hospitality website",
        body: "Rooms or menus, photography, location and offers on a website that performs well on mobile.",
      },
      {
        service: "ecommerce-stores",
        title: "Direct booking engine",
        body: "Room bookings and table reservations with online payment, free of per-booking commission.",
      },
      {
        service: "ecommerce-stores",
        title: "Online ordering",
        body: "Takeaway and delivery orders with UPI and card payments, sent directly to your kitchen.",
      },
      {
        service: "web-development",
        title: "QR code menus",
        body: "Digital menus managed from one dashboard and updated instantly on every table.",
      },
      {
        service: "seo-marketing",
        title: "Google Business Profile and reviews",
        body: "Profile management and regular menu and photo updates, with review requests sent after each visit or stay.",
      },
      {
        service: "product-design",
        title: "Brand and menu design",
        body: "Logo, menu cards, signage and social media templates that reflect your property.",
      },
    ],
    features: [
      "Room booking engine or table reservations",
      "Online ordering with UPI and card payments",
      "QR code menus managed from one place",
      "Offers and loyalty codes for repeat guests",
      "Google Business Profile management",
      "Review requests after each visit or stay",
      "Event and banquet enquiry forms",
      "Image galleries optimised for mobile",
    ],
    cta: {
      title: "Increase your direct bookings",
      body: "Share details of your property or restaurant and your current booking channels, and we will propose a direct booking solution.",
    },
  },
  {
    slug: "professional-services",
    name: "Professional services",
    sector: "CA firms, law practices and consultancies",
    summary: "Practice websites and secure client portals",
    headline: "Websites and software for professional services",
    intro:
      "We build practice websites and secure client portals for chartered accountancy firms, law practices and consultancies. Documents, deadlines and invoices are managed through a single secure login.",
    seoTitle: "Websites for CA and law firms",
    seoDescription:
      "Practice websites and secure client portals for CA firms, law practices and consultancies, with document collection, compliance calendars and invoicing.",
    icon: "briefcase",
    image: {
      src: "/images/industries/professional-services.jpg",
      alt: "Advisers and clients shaking hands across a meeting table",
    },
    overview: {
      title: "A credible practice website and a secure client portal",
      body: "Firms often collect client documents by email and messaging apps and track filing deadlines in spreadsheets. We build a practice website that reflects your expertise and a secure portal where clients upload documents, follow progress and pay invoices.",
    },
    outcomes: [
      "Client documents collected in one secure place",
      "Filing deadlines tracked with automated reminders",
      "Enquiries routed promptly to the right partner",
    ],
    problems: [
      {
        title: "An online presence that undersells expertise",
        body: "The firm's experience and capabilities are not reflected on its current website.",
      },
      {
        title: "Scattered client documents",
        body: "Clients send statements, notices and invoices by email and messaging apps, and staff file them manually.",
      },
      {
        title: "Manual deadline tracking",
        body: "GST, TDS and ROC filing dates are tracked in spreadsheets, and client documents often arrive late.",
      },
      {
        title: "Slow enquiry response",
        body: "Website enquiries arrive in a shared inbox and are not always followed up promptly.",
      },
    ],
    builds: [
      {
        service: "business-websites",
        title: "Practice website",
        body: "Services, partner profiles, industries served and articles on a clear, fast website.",
      },
      {
        service: "custom-software",
        title: "Secure client portal",
        body: "Document upload, task status and invoices behind one login, with access controlled for each client.",
      },
      {
        service: "custom-software",
        title: "Compliance calendar",
        body: "GST, TDS and ROC deadlines tracked for each client, with automated document requests.",
      },
      {
        service: "ai-integration",
        title: "Document classification",
        body: "Uploaded statements, notices and invoices sorted and tagged automatically for review.",
      },
      {
        service: "seo-marketing",
        title: "Practice-area search visibility",
        body: "Practice-area pages and articles that answer the questions clients search for.",
      },
    ],
    features: [
      "Partner and team profile pages",
      "Practice-area pages with enquiry forms",
      "Secure client document upload",
      "Compliance calendar with automated reminders",
      "Task status visible to clients",
      "Invoices and payment links",
      "Consultation booking",
      "Articles and updates section",
    ],
    cta: {
      title: "Simplify client document collection",
      body: "Tell us how your firm collects documents today, and we will outline a client portal that fits your workflow.",
    },
  },
  {
    slug: "startups-saas",
    name: "Startups & SaaS",
    sector: "founders and SaaS companies",
    summary: "MVPs, SaaS products and launch websites",
    headline: "Product development for startups and SaaS companies",
    intro:
      "We help founders bring a working product to market by a fixed date, on a codebase designed to scale. Each MVP is scoped to its core objectives, built on Next.js and PostgreSQL and supported as the product grows.",
    seoTitle: "MVP and SaaS development",
    seoDescription:
      "MVP and SaaS development for founders, with sign-up, billing, dashboards and mobile apps on Next.js and PostgreSQL, at a fixed price and launch date.",
    icon: "rocket",
    image: {
      src: "/images/industries/startups-saas.jpg",
      alt: "A product team planning at a whiteboard in a bright office",
    },
    overview: {
      title: "A focused first release on a codebase built to grow",
      body: "Founders need a product in users' hands by a fixed date, on a codebase that will not need rebuilding as usage grows. We agree a focused scope, build on Next.js and PostgreSQL and continue to support the product after launch.",
    },
    outcomes: [
      "A launch date agreed in the proposal",
      "Architecture that supports growth without a rebuild",
      "Hosting, monitoring and backups configured from the start",
    ],
    problems: [
      {
        title: "Expanding scope",
        body: "Feature requests from investors and early users continually delay the launch.",
      },
      {
        title: "Prototypes that do not scale",
        body: "An early prototype cannot support real users, and the product must be rebuilt.",
      },
      {
        title: "Neglected infrastructure",
        body: "Hosting, backups, monitoring and security are configured once and not maintained.",
      },
      {
        title: "Low sign-up conversion",
        body: "Visitors arrive from launches and campaigns but leave without creating an account.",
      },
    ],
    builds: [
      {
        service: "web-development",
        title: "MVP development",
        body: "Sign-up, core workflows and an admin panel, scoped to a fixed launch date.",
      },
      {
        service: "web-development",
        title: "SaaS platform",
        body: "Team accounts, subscription billing with Razorpay or Stripe, usage dashboards and a public API.",
      },
      {
        service: "app-development",
        title: "Mobile app",
        body: "iOS and Android from one codebase, sharing logic and APIs with your web product.",
      },
      {
        service: "product-design",
        title: "Product and brand design",
        body: "User flows, interface design and a brand identity that builds credibility with users and investors.",
      },
      {
        service: "business-websites",
        title: "Launch website",
        body: "A marketing website with pricing, documentation and sign-up pages, built to convert visitors.",
      },
      {
        service: "managed-hosting",
        title: "Managed infrastructure",
        body: "Cloud hosting, CI/CD, backups and monitoring configured correctly from the outset.",
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
      "Launch website with pricing and documentation pages",
    ],
    cta: {
      title: "Bring your product to market",
      body: "Send us a short brief, and we will recommend what belongs in the first release and what can follow later.",
    },
  },
];

export function getIndustry(slug: string): Industry | undefined {
  return industries.find((industry) => industry.slug === slug);
}
