import { site } from "./site";

/**
 * Open roles for the careers pages, the role detail pages, the sitemap and the
 * JobPosting structured data. Add or remove a role here and every one of
 * those follows.
 */

// TODO(owner): confirm roles, locations and experience before publishing

export const jobTeams = ["Engineering", "Design", "Marketing", "Sales & Ops"] as const;
export type JobTeam = (typeof jobTeams)[number];

export type JobType = "Full-time" | "Internship";
export type JobLocation = "Gurugram (on-site)" | "Gurugram · Hybrid";

export interface Job {
  slug: string;
  title: string;
  /** Shorter name for the browser tab when `title` would push it past 60 chars. */
  shortTitle?: string;
  team: JobTeam;
  location: JobLocation;
  type: JobType;
  /** Shown as written, e.g. "2–4 years". */
  experience: string;
  /** One or two sentences; doubles as the meta description (≤ 155 chars). */
  summary: string;
  /** Tools and skills shown as tags on the role card. */
  skills: readonly string[];
  responsibilities: readonly string[];
  requirements: readonly string[];
  niceToHaves: readonly string[];
}

/** Date the current listings went up; JobPosting `datePosted`. */
export const JOBS_POSTED_ON = "2026-11-02";
/** Listings expire after this many days unless renewed; JobPosting `validThrough`. */
export const JOBS_VALID_DAYS = 60;

/** What every role gets. Kept modest on purpose: only what we can stand behind. */
export const whatWeOffer = [
  "Real ownership of client projects, from the first scoping call to launch and support.",
  "Weekly demos where your work is shown to the client and the team.",
  "Mentorship and code or design review from senior engineers and designers.",
  "A modern stack: Next.js, TypeScript, Node.js, React Native, Figma and current tooling.",
  "Time set aside for learning, and a team that shares what it picks up.",
  "Direct access to clients, so you hear the problem first-hand rather than through a ticket.",
] as const;

export const compensationNote = "Compensation: discussed at interview, based on experience.";

export const jobs: readonly Job[] = [
  {
    slug: "full-stack-developer",
    title: "Full-Stack Developer (Next.js/Node.js)",
    shortTitle: "Full-Stack Developer",
    team: "Engineering",
    location: "Gurugram · Hybrid",
    type: "Full-time",
    experience: "2–4 years",
    summary:
      "Build business websites, customer portals and internal tools in Next.js and Node.js, from database schema to deployed page.",
    skills: ["Next.js", "TypeScript", "Node.js", "PostgreSQL"],
    responsibilities: [
      "Build client websites and web apps in Next.js and TypeScript, from first commit to production.",
      "Design APIs and database schemas in Node.js and PostgreSQL for portals, dashboards and admin panels.",
      "Integrate payment gateways, CRMs, WhatsApp and email providers that Indian businesses already use.",
      "Join client calls to clarify scope, demo progress and agree on changes.",
      "Review pull requests from teammates and keep tests and documentation current.",
      "Look after deployments, monitoring and fixes for projects after launch.",
    ],
    requirements: [
      "2–4 years building and shipping production web applications.",
      "Strong TypeScript and React, with working knowledge of the Next.js App Router.",
      "Experience building REST or GraphQL APIs in Node.js.",
      "Comfort with SQL and relational data modelling, ideally PostgreSQL.",
      "Git, pull requests and code review as part of your daily routine.",
      "Clear written and spoken English for client communication.",
    ],
    niceToHaves: [
      "Experience with Tailwind CSS and accessible, responsive UI.",
      "Hands-on deployment work on Vercel, AWS or a VPS.",
      "Exposure to ERP, CRM or inventory workflows.",
    ],
  },
  {
    slug: "wordpress-shopify-developer",
    title: "WordPress & Shopify Developer",
    team: "Engineering",
    location: "Gurugram (on-site)",
    type: "Full-time",
    experience: "1–3 years",
    summary:
      "Build and maintain business websites on WordPress and online stores on Shopify, with custom themes, integrations and fast pages.",
    skills: ["WordPress", "Shopify", "PHP", "Liquid"],
    responsibilities: [
      "Build custom WordPress themes and blocks from Figma designs, without page-builder bloat.",
      "Set up and customise Shopify stores: themes in Liquid, apps, payments and shipping.",
      "Migrate content and products from older sites without losing URLs or search rankings.",
      "Improve page speed and Core Web Vitals on new and existing sites.",
      "Handle updates, backups and security fixes for sites on our care plans.",
      "Write short handover notes so clients can manage their own content.",
    ],
    requirements: [
      "1–3 years building WordPress or Shopify sites for clients.",
      "Good HTML, CSS and JavaScript, plus working PHP for WordPress.",
      "Experience with Shopify Liquid and the theme editor.",
      "Understanding of on-page SEO basics: titles, redirects, schema and sitemaps.",
      "Comfort turning a Figma file into a pixel-accurate, responsive build.",
      "A portfolio of live sites you built or worked on.",
    ],
    niceToHaves: [
      "WooCommerce experience, including payment gateways used in India.",
      "Familiarity with headless setups or the Shopify Storefront API.",
    ],
  },
  {
    slug: "mobile-app-developer",
    title: "React Native / Flutter Developer",
    team: "Engineering",
    location: "Gurugram · Hybrid",
    type: "Full-time",
    experience: "2–4 years",
    summary:
      "Build Android and iOS apps for businesses in React Native or Flutter, and take them from first build through store release.",
    skills: ["React Native", "Flutter", "TypeScript", "Firebase"],
    responsibilities: [
      "Build cross-platform apps in React Native or Flutter from Figma designs.",
      "Connect apps to REST APIs, authentication, push notifications and payments.",
      "Handle builds, signing and releases on Google Play and the App Store.",
      "Track crashes and performance after release and fix what the data shows.",
      "Work with the web team when an app shares a backend with a website or portal.",
      "Demo progress to clients each week on test builds.",
    ],
    requirements: [
      "2–4 years building mobile apps, with at least one app live in a store.",
      "Strong React Native with TypeScript, or Flutter with Dart.",
      "Experience with state management, offline storage and API integration.",
      "Understanding of Android and iOS release processes and store guidelines.",
      "Git, pull requests and code review as part of your daily routine.",
      "Ability to explain technical trade-offs to non-technical clients.",
    ],
    niceToHaves: [
      "Native module work in Kotlin or Swift.",
      "Experience with Firebase, Supabase or a Node.js backend.",
      "Familiarity with Expo and over-the-air updates.",
    ],
  },
  {
    slug: "ui-ux-designer",
    title: "UI/UX Designer",
    team: "Design",
    location: "Gurugram · Hybrid",
    type: "Full-time",
    experience: "2–4 years",
    summary:
      "Design websites, app screens and brand identities for Indian businesses, in Figma files that developers can build without guessing.",
    skills: ["Figma", "Design systems", "Prototyping", "Branding"],
    responsibilities: [
      "Run short discovery sessions with clients to understand their customers and goals.",
      "Produce wireframes, high-fidelity screens and clickable prototypes in Figma.",
      "Build and maintain component libraries and design tokens for each project.",
      "Create logos, colour systems and brand guidelines for smaller businesses.",
      "Work alongside developers during the build and review what ships.",
      "Present design decisions to clients and adjust based on their feedback.",
    ],
    requirements: [
      "2–4 years designing websites or apps that went live.",
      "Advanced Figma: auto layout, components, variables and prototyping.",
      "A portfolio that shows the problem, the options you tried and why you chose one.",
      "Solid grasp of typography, layout, accessibility and responsive design.",
      "Comfort presenting your work and taking feedback from clients.",
    ],
    niceToHaves: [
      "Basic HTML and CSS, enough to talk constraints with developers.",
      "Motion or micro-interaction work in Figma, Framer or After Effects.",
      "Experience designing for Indian-language or multilingual audiences.",
    ],
  },
  {
    slug: "seo-performance-marketing-executive",
    title: "SEO & Performance Marketing Executive",
    shortTitle: "SEO & Performance Marketing",
    team: "Marketing",
    location: "Gurugram (on-site)",
    type: "Full-time",
    experience: "1–3 years",
    summary:
      "Run SEO, Google Ads and Meta campaigns for client businesses, and report clearly on the leads and sales they bring in.",
    skills: ["Google Ads", "Search Console", "GA4", "Meta Ads"],
    responsibilities: [
      "Plan and run Google Search, Performance Max and Meta campaigns within client budgets.",
      "Carry out keyword research, on-page fixes and technical SEO audits.",
      "Set up GA4, Google Tag Manager and conversion tracking on client sites.",
      "Manage Google Business Profiles and local SEO for businesses with physical locations.",
      "Prepare monthly reports that tie spend and rankings to leads and sales.",
      "Brief designers and writers on landing pages and ad creatives.",
    ],
    requirements: [
      "1–3 years running paid campaigns or SEO for businesses or an agency.",
      "Hands-on Google Ads and Meta Ads Manager experience with real budgets.",
      "Working knowledge of Search Console, GA4 and Tag Manager.",
      "Comfort with spreadsheets and turning data into clear recommendations.",
      "Good written English for ad copy, briefs and client reports.",
    ],
    niceToHaves: [
      "Google Ads or GA4 certification.",
      "Experience with e-commerce campaigns, Shopify or WooCommerce.",
    ],
  },
  {
    slug: "business-development-executive",
    title: "Business Development Executive",
    team: "Sales & Ops",
    location: "Gurugram (on-site)",
    type: "Full-time",
    experience: "1–3 years",
    summary:
      "Sell websites, apps and custom software to Indian businesses: qualify enquiries, run discovery calls and turn scopes into signed proposals.",
    skills: ["Website sales", "Software sales", "CRM", "Proposals"],
    responsibilities: [
      "Respond to inbound enquiries from the website, WhatsApp and referrals.",
      "Run discovery calls to understand what a business needs and what it can spend.",
      "Work with the project team to scope work and prepare written proposals and quotes.",
      "Follow up with prospects and keep every conversation logged in the CRM.",
      "Build relationships with business owners in Gurugram and Delhi NCR.",
      "Hand signed clients over to the project coordinator with complete notes.",
    ],
    requirements: [
      "1–3 years in B2B sales, ideally selling websites, software or digital marketing services.",
      "Clear spoken and written English and Hindi.",
      "Comfort explaining technical services in plain language.",
      "Organised follow-up habits and experience using a CRM.",
      "Willingness to meet clients in person around Gurugram and Delhi NCR.",
    ],
    niceToHaves: [
      "An existing network of small and mid-sized business owners.",
      "Basic understanding of how websites, hosting and SEO work.",
    ],
  },
  {
    slug: "project-coordinator",
    title: "Project Coordinator",
    team: "Sales & Ops",
    location: "Gurugram (on-site)",
    type: "Full-time",
    experience: "1–3 years",
    summary:
      "Keep client projects on schedule: plan sprints, run weekly demos, track feedback and make sure everyone knows what happens next.",
    skills: ["Planning", "Client communication", "Jira or Linear", "Documentation"],
    responsibilities: [
      "Turn signed scopes into project plans with milestones and owners.",
      "Schedule and run weekly client demos, and share notes the same day.",
      "Track feedback, change requests and approvals in one place.",
      "Flag risks to scope, budget or timeline early, with options to resolve them.",
      "Coordinate content, assets and access that clients need to provide.",
      "Prepare launch checklists and handover documents.",
    ],
    requirements: [
      "1–3 years coordinating projects at a digital agency, software company or similar.",
      "Strong written English: clear updates, meeting notes and summaries.",
      "Experience with a project tool such as Jira, Linear, Trello or ClickUp.",
      "Comfort with technical conversations, even if you do not write code.",
      "Calm, organised follow-through when several projects run at once.",
    ],
    niceToHaves: [
      "Familiarity with Agile or Scrum ceremonies.",
      "Experience writing scopes of work or software requirement documents.",
    ],
  },
  {
    slug: "web-development-intern",
    title: "Web Development Intern",
    team: "Engineering",
    location: "Gurugram (on-site)",
    type: "Internship",
    experience: "0–1 year",
    summary:
      "Learn to build production websites alongside senior developers, with real tasks on client projects and review on every pull request.",
    skills: ["HTML & CSS", "JavaScript", "React", "Git"],
    responsibilities: [
      "Build pages and components for client websites under guidance from a senior developer.",
      "Fix bugs and small feature requests on live projects.",
      "Write tests and documentation for the code you change.",
      "Take part in code review, both receiving and giving feedback.",
      "Sit in on client demos to see how projects are scoped and delivered.",
    ],
    requirements: [
      "A degree or course in computer science or a related field, completed or in progress.",
      "Good fundamentals in HTML, CSS and JavaScript.",
      "Some experience with React, through coursework or personal projects.",
      "Basic Git: branches, commits and pull requests.",
      "At least one project you built that you can walk us through.",
      "Availability to work from our Gurugram office during office hours.",
    ],
    niceToHaves: [
      "Exposure to TypeScript, Next.js or Node.js.",
      "Contributions to open-source projects or a public GitHub profile.",
    ],
  },
];

export function getJob(slug: string): Job | undefined {
  return jobs.find((job) => job.slug === slug);
}

export function jobsForTeam(team: JobTeam): readonly Job[] {
  return jobs.filter((job) => job.team === team);
}

/**
 * Page title before the root layout appends " | Setuware Technologies"
 * (24 chars), kept so the full tab title stays within 60 characters.
 */
export const JOB_TITLE_SUFFIX_LENGTH = ` | ${site.name}`.length;
export function jobMetaTitle(job: Job): string {
  const base = job.shortTitle ?? job.title;
  const withCity = `${base} Job, Gurugram`;
  return withCity.length + JOB_TITLE_SUFFIX_LENGTH <= 60 ? withCity : base;
}

/** `validThrough` for the current listings, as YYYY-MM-DD. */
export function jobsValidThrough(): string {
  const date = new Date(`${JOBS_POSTED_ON}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + JOBS_VALID_DAYS);
  return date.toISOString().slice(0, 10);
}

/** Pre-filled application email for a role (or an open application). */
export function applyHref(job?: Pick<Job, "title">): string {
  const subject = job ? `Application: ${job.title}` : "Open application";
  const body = [
    "Hi Setuware team,",
    "",
    `I'd like to apply${job ? ` for the ${job.title} role` : ""}.`,
    "",
    "CV: (attached)",
    "Portfolio / GitHub / LinkedIn:",
    "Current location:",
    "Notice period:",
    "",
    "Thanks,",
  ].join("\n");
  return `mailto:${site.hrEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Schema.org `employmentType` for a role. */
export function employmentType(type: JobType): "FULL_TIME" | "INTERN" {
  return type === "Internship" ? "INTERN" : "FULL_TIME";
}

/** JobPosting structured data for a role detail page. */
export function jobPostingJsonLd(job: Job) {
  const description = [
    `<p>${job.summary}</p>`,
    `<h3>Responsibilities</h3><ul>${job.responsibilities.map((item) => `<li>${item}</li>`).join("")}</ul>`,
    `<h3>Requirements</h3><ul>${job.requirements.map((item) => `<li>${item}</li>`).join("")}</ul>`,
    `<h3>Nice to have</h3><ul>${job.niceToHaves.map((item) => `<li>${item}</li>`).join("")}</ul>`,
    `<h3>What we offer</h3><ul>${whatWeOffer.map((item) => `<li>${item}</li>`).join("")}</ul>`,
    `<p>${compensationNote}</p>`,
  ].join("");

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description,
    identifier: { "@type": "PropertyValue", name: site.name, value: job.slug },
    datePosted: JOBS_POSTED_ON,
    validThrough: jobsValidThrough(),
    employmentType: employmentType(job.type),
    directApply: false,
    hiringOrganization: {
      "@type": "Organization",
      name: site.name,
      sameAs: site.url,
      url: site.url,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        streetAddress: site.address.street,
        addressLocality: site.address.city,
        addressRegion: site.address.region,
        postalCode: site.address.postalCode,
        addressCountry: site.address.country,
      },
    },
    url: new URL(`/careers/${job.slug}`, site.url).toString(),
  };
}
