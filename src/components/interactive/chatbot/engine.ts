/**
 * Setuware Assistant: intent matching and answers.
 *
 * Runs entirely in the browser. There is no model behind it: answers are
 * composed from the same site data the pages render (services, plans, FAQs,
 * contact details), so the assistant can never quote a price or a promise the
 * site itself does not make. Everything here is pure, which keeps the matcher
 * unit-testable without rendering the panel.
 */

import { faqs, services, type Service } from "@/lib/content";
import { projectPackages, carePlans } from "@/lib/plans";
import type { ServiceKey } from "@/lib/pricing";
import { site } from "@/lib/site";
import { formatINR } from "@/lib/utils";

import { ASSISTANT_NAME, WHATSAPP_MESSAGE, isWithinHours, whatsappHref } from "./constants";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export type IntentId =
  | "menu"
  | "services"
  | "pricing"
  | "timelines"
  | "book-call"
  | "whatsapp"
  | "support"
  | "careers"
  | "contact"
  | "greeting"
  | "thanks";

/** What a chip does when pressed. */
export type ChipAction =
  | { kind: "intent"; intent: IntentId }
  | { kind: "service"; slug: ServiceKey }
  | { kind: "lead-service"; slug: ServiceKey | "other"; label: string }
  | { kind: "lead-skip" }
  | { kind: "lead-retry" }
  | { kind: "lead-cancel" };

export interface Chip {
  label: string;
  action: ChipAction;
}

export interface ChatLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface BotReply {
  text: string;
  links?: ChatLink[];
  chips?: Chip[];
  /** Asks the panel to begin the enquiry flow after this reply. */
  startLead?: boolean;
}

export type Match =
  | { type: "intent"; intent: IntentId }
  | { type: "service"; slug: ServiceKey }
  | { type: "service-price"; slug: ServiceKey }
  | { type: "service-timeline"; slug: ServiceKey }
  | { type: "faq"; index: number }
  | { type: "none" };

/* -------------------------------------------------------------------------- */
/* Constants                                                                   */
/* -------------------------------------------------------------------------- */

export { ASSISTANT_NAME, WHATSAPP_MESSAGE, whatsappHref, isWithinHours };

const whatsappLink: ChatLink = {
  label: "Chat on WhatsApp",
  href: whatsappHref,
  external: true,
};

export const MENU_CHIPS: readonly Chip[] = [
  { label: "Services", action: { kind: "intent", intent: "services" } },
  { label: "Pricing", action: { kind: "intent", intent: "pricing" } },
  { label: "Timelines", action: { kind: "intent", intent: "timelines" } },
  { label: "Book a free call", action: { kind: "intent", intent: "book-call" } },
  { label: "Talk on WhatsApp", action: { kind: "intent", intent: "whatsapp" } },
  { label: "Support for existing clients", action: { kind: "intent", intent: "support" } },
  { label: "Careers", action: { kind: "intent", intent: "careers" } },
];

const FOLLOW_UP_CHIPS: readonly Chip[] = [
  { label: "Book a free call", action: { kind: "intent", intent: "book-call" } },
  { label: "Pricing", action: { kind: "intent", intent: "pricing" } },
  { label: "Main menu", action: { kind: "intent", intent: "menu" } },
];

export const GREETING: BotReply = {
  text: "Hi there. Ask me about our services, prices or timelines, or book a free 30-minute call with our team.",
  chips: [...MENU_CHIPS],
};

/* -------------------------------------------------------------------------- */
/* Text normalisation and fuzzy matching                                       */
/* -------------------------------------------------------------------------- */

const STOPWORDS = new Set(
  (
    "a an the and or of to for in on at by is are am be do does did can could " +
    "will would should i me my we our us you your it its this that what which " +
    "who whom how much many any some with from about have has had get there " +
    "their them they please tell know want need like just also if so as up"
  )
    .split(" ")
    // Stemmed like the visitor's words, so "does" and "this" still match.
    .map(stem),
);

/** Lowercases, strips punctuation (keeping ₹) and collapses whitespace. */
export function normalise(input: string): string {
  return input
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/₹/g, " ₹ ")
    .replace(/[^a-z0-9₹\s/+-]/g, " ")
    .replace(/[/+-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Crude singularisation: enough for "apps", "prices", "websites". */
function stem(word: string): string {
  if (word.length > 4 && word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

export function tokenise(input: string): string[] {
  return normalise(input)
    .split(" ")
    .filter(Boolean)
    .map(stem);
}

/**
 * Optimal-string-alignment distance (Levenshtein plus adjacent swaps, so
 * "webiste" is one edit from "website"), bailing out once it exceeds `max`.
 */
export function editDistance(a: string, b: string, max = 2): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const rows: number[][] = [Array.from({ length: b.length + 1 }, (_, j) => j)];
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let value = Math.min(rows[i - 1][j] + 1, row[j - 1] + 1, rows[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        value = Math.min(value, rows[i - 2][j - 2] + 1);
      }
      row.push(value);
      if (value < rowMin) rowMin = value;
    }
    if (rowMin > max) return max + 1;
    rows.push(row);
  }
  return rows[a.length][b.length];
}

/**
 * Does a visitor's word match a keyword? Exact match, a shared prefix for
 * longer keywords ("pric" in "pricing"), or one typo for words of five letters
 * or more ("webiste", "shopfy").
 */
export function wordMatches(word: string, keyword: string): boolean {
  const key = stem(keyword);
  if (word === key) return true;
  if (key.length >= 4 && word.startsWith(key)) return true;
  // Typos are usually the same length or one letter short; a much shorter
  // word ("serve" for "server") is more often a different word.
  if (key.length >= 5 && word.length >= key.length - 1 && editDistance(word, key, 1) <= 1) {
    return true;
  }
  return false;
}

/**
 * Scores a list of keywords against a message. Multi-word keywords are
 * matched as phrases and weigh double, so "web app" beats a bare "app".
 */
function score(tokens: string[], keywords: readonly string[]): number {
  const text = ` ${tokens.join(" ")} `;
  let total = 0;
  for (const keyword of keywords) {
    if (keyword.includes(" ")) {
      if (text.includes(` ${tokenise(keyword).join(" ")} `)) total += 2;
    } else if (tokens.some((token) => wordMatches(token, keyword))) {
      total += 1;
    }
  }
  return total;
}

/* -------------------------------------------------------------------------- */
/* Keyword tables                                                              */
/* -------------------------------------------------------------------------- */

const INTENT_KEYWORDS = {
  careers: [
    "job", "career", "hiring", "hire me", "vacancy", "internship", "intern",
    "opening", "resume", "cv", "fresher", "employment", "join your team",
  ],
  pricing: [
    "price", "pricing", "cost", "costing", "quote", "quotation", "budget",
    "rate", "charge", "fee", "₹", "rupee", "inr", "how much", "expensive",
    "cheap", "affordable", "package",
  ],
  timelines: [
    "timeline", "how long", "duration", "deadline", "turnaround", "week",
    "deliver", "delivery time", "how soon", "how quickly", "take to build",
  ],
  support: [
    "support", "existing client", "existing customer", "bug", "broken",
    "issue", "problem", "not working", "site down", "outage", "ticket", "help desk",
  ],
  whatsapp: ["whatsapp", "whats app", "wa"],
  "book-call": [
    "call", "consultation", "consult", "meeting", "book", "schedule",
    "appointment", "discuss", "talk to", "speak to", "contact me", "call back",
    "callback", "get started", "start a project", "enquiry", "enquire",
  ],
  contact: [
    "email", "phone", "number", "address", "office", "location", "hour",
    "timing", "open", "reach you", "contact",
  ],
  services: [
    "service", "offer", "what do you do", "what you do", "capabilities",
    "solution",
  ],
  greeting: ["hi", "hello", "hey", "namaste", "good morning", "good afternoon", "good evening"],
  thanks: ["thank", "thanks", "thx", "great", "perfect", "ok thanks"],
} as const satisfies Partial<Record<IntentId, readonly string[]>>;

/** Words that point at a particular service. */
export const SERVICE_KEYWORDS: Record<ServiceKey, readonly string[]> = {
  "business-websites": [
    "website", "site", "landing page", "landing", "wordpress", "web page",
    "webpage", "company website", "business website", "redesign",
  ],
  "ecommerce-stores": [
    "ecommerce", "e commerce", "shopify", "woocommerce", "store", "shop",
    "online store", "cart", "catalogue", "catalog", "sell online",
  ],
  "web-development": [
    "web app", "web application", "portal", "dashboard", "saas", "platform",
    "next js", "nextjs", "react js",
  ],
  "app-development": [
    "app", "mobile", "android", "ios", "iphone", "mobile app", "play store",
    "app store", "flutter", "react native",
  ],
  "product-design": ["design", "logo", "brand", "branding", "ui", "ux", "figma", "identity"],
  "seo-marketing": [
    "seo", "marketing", "google ranking", "rank", "ranking", "ads", "advert",
    "social media", "lead generation", "traffic", "digital marketing",
  ],
  "custom-software": ["erp", "crm", "software", "inventory", "billing", "custom software", "automate operations"],
  "ai-integration": ["ai", "chatbot", "automation", "gpt", "llm", "machine learning", "artificial intelligence"],
  "managed-hosting": ["hosting", "domain", "server", "ssl", "business email", "cloud", "migration", "migrate"],
  "support-maintenance": ["maintenance", "maintain", "amc", "care plan", "update my site", "security patch"],
};

/* -------------------------------------------------------------------------- */
/* Matcher                                                                     */
/* -------------------------------------------------------------------------- */

interface ScoredService {
  slug: ServiceKey;
  score: number;
}

function bestService(tokens: string[]): ScoredService | null {
  let best: ScoredService | null = null;
  for (const [slug, keywords] of Object.entries(SERVICE_KEYWORDS) as [ServiceKey, readonly string[]][]) {
    const value = score(tokens, keywords);
    if (value > 0 && (!best || value > best.score)) best = { slug, score: value };
  }
  // "web app" scores 2 for web development and 1 for the bare "app"; ties go
  // to the earlier, broader entry, which is the safer answer.
  return best;
}

/** Meaningful words of each FAQ question, prepared once. */
const FAQ_TOKENS = faqs.map((faq) =>
  Array.from(new Set(tokenise(faq.question).filter((word) => !STOPWORDS.has(word)))),
);

function bestFaq(tokens: string[]): { index: number; overlap: number; ratio: number } | null {
  const meaningful = tokens.filter((word) => !STOPWORDS.has(word));
  if (meaningful.length === 0) return null;
  let best: { index: number; overlap: number; ratio: number } | null = null;
  FAQ_TOKENS.forEach((questionTokens, index) => {
    const overlap = questionTokens.filter((keyword) =>
      meaningful.some((word) => wordMatches(word, keyword)),
    ).length;
    const ratio = questionTokens.length === 0 ? 0 : overlap / questionTokens.length;
    if (overlap > 0 && (!best || overlap > best.overlap || (overlap === best.overlap && ratio > best.ratio))) {
      best = { index, overlap, ratio };
    }
  });
  return best;
}

/**
 * Maps free text to the most useful answer. The order of the checks is the
 * priority: an explicit job enquiry or a near-verbatim FAQ beats everything;
 * a price or timeline question is answered for the service it mentions.
 */
export function matchIntent(input: string): Match {
  const text = normalise(input);
  if (text.length === 0) return { type: "none" };
  const tokens = tokenise(input);

  const s = (id: keyof typeof INTENT_KEYWORDS) => score(tokens, INTENT_KEYWORDS[id]);
  const service = bestService(tokens);
  const faq = bestFaq(tokens);

  if (s("careers") > 0) return { type: "intent", intent: "careers" };

  if (faq && (faq.overlap >= 3 || (faq.overlap >= 2 && faq.ratio >= 0.6))) {
    return { type: "faq", index: faq.index };
  }

  if (s("pricing") > 0) {
    return service ? { type: "service-price", slug: service.slug } : { type: "intent", intent: "pricing" };
  }
  if (s("timelines") > 0) {
    return service ? { type: "service-timeline", slug: service.slug } : { type: "intent", intent: "timelines" };
  }
  if (s("whatsapp") > 0) return { type: "intent", intent: "whatsapp" };
  if (s("support") > 0 && service?.slug !== "support-maintenance") {
    return { type: "intent", intent: "support" };
  }
  if (s("book-call") > 0) return { type: "intent", intent: "book-call" };
  if (service) return { type: "service", slug: service.slug };
  if (s("contact") > 0) return { type: "intent", intent: "contact" };
  if (faq && faq.overlap >= 2) return { type: "faq", index: faq.index };
  if (s("services") > 0) return { type: "intent", intent: "services" };
  if (s("greeting") > 0) return { type: "intent", intent: "greeting" };
  if (s("thanks") > 0) return { type: "intent", intent: "thanks" };
  // Last resort: a single distinctive word from an FAQ ("payment", "launch").
  if (faq && faq.overlap >= 1) return { type: "faq", index: faq.index };
  return { type: "none" };
}

/* -------------------------------------------------------------------------- */
/* Answers                                                                     */
/* -------------------------------------------------------------------------- */

function getServiceBySlug(slug: ServiceKey): Service | undefined {
  return services.find((service) => service.slug === slug);
}

function startingPrice(service: Service): number {
  return service.entryPriceFrom ?? service.priceFrom;
}

/** Services sold under the Full Application Build package. */
const APPLICATION_SERVICES = new Set<ServiceKey>(["web-development", "app-development", "custom-software"]);

function listJoin(items: readonly string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function serviceLink(service: Service): ChatLink {
  return { label: "Learn more about this service", href: `/services/${service.slug}` };
}

function packageLine(id: string, fallback: string): string {
  const plan = projectPackages.find((entry) => entry.id === id);
  if (!plan) return fallback;
  if (!plan.setupFrom) return `${plan.name}: quoted per project`;
  return `${plan.name}: from ${formatINR(plan.setupFrom)}`;
}

export function pricingReply(): BotReply {
  const lines = [
    packageLine("landing-page", "Landing Page"),
    packageLine("website-build", "Business Website"),
    packageLine("full-application-build", "Full Application"),
    packageLine("enterprise-engagement", "Enterprise"),
  ];
  const care = carePlans[0];
  return {
    text:
      `Our published project packages are:\n${lines.map((line) => `• ${line}`).join("\n")}\n\n` +
      (care ? `Managed hosting and care plans start at ${formatINR(care.monthly ?? 0)} per month. ` : "") +
      "Every project receives a fixed written quote after a free discovery call.",
    links: [
      { label: "View pricing", href: "/pricing" },
      { label: "Get an instant estimate", href: "/estimate" },
    ],
    chips: [
      { label: "Book a free call", action: { kind: "intent", intent: "book-call" } },
      { label: "Timelines", action: { kind: "intent", intent: "timelines" } },
      { label: "Services", action: { kind: "intent", intent: "services" } },
    ],
  };
}

export function servicesReply(): BotReply {
  return {
    text: "We design, build and run digital products for growing businesses. Choose a service to see a short summary, starting price and typical timeline.",
    chips: services.map((service) => ({
      label: service.name,
      action: { kind: "service", slug: service.slug } as const,
    })),
    links: [{ label: "View all services", href: "/services" }],
  };
}

export function serviceReply(slug: ServiceKey, focus: "summary" | "price" | "timeline" = "summary"): BotReply {
  const service = getServiceBySlug(slug);
  if (!service) return servicesReply();

  const fullApplication = projectPackages.find((plan) => plan.id === "full-application-build")?.setupFrom;
  const price =
    service.slug === "business-websites" && service.entryPriceFrom
      ? `Landing pages start at ${formatINR(service.entryPriceFrom)} and complete business websites at ${formatINR(service.priceFrom)}.`
      : APPLICATION_SERVICES.has(service.slug) && fullApplication
        ? `Full application builds start from ${formatINR(fullApplication)}, and a typical ${service.name.toLowerCase()} project is estimated from ${formatINR(startingPrice(service))}.`
        : `${service.priceLabel ?? `Projects start from ${formatINR(startingPrice(service))}`}.`;
  const timeline = `Typical timeline: ${service.typicalTimeline}.`;
  const stack = service.stack.length > 0 ? ` We commonly work with ${listJoin(service.stack.slice(0, 3))}.` : "";

  const opening =
    focus === "price"
      ? `${service.name}: ${price} ${timeline}`
      : focus === "timeline"
        ? `${service.name}. ${timeline} ${price}`
        : `${service.name}. ${service.summary}${stack} ${price} ${timeline}`;

  return {
    text: `${opening} The final figure is confirmed in a fixed written quote.`,
    links: [serviceLink(service)],
    chips: [...FOLLOW_UP_CHIPS],
  };
}

export function timelinesReply(): BotReply {
  const landing = projectPackages.find((plan) => plan.id === "landing-page");
  const rows = services
    .filter((service) =>
      ["business-websites", "ecommerce-stores", "web-development", "app-development", "custom-software"].includes(
        service.slug,
      ),
    )
    .map((service) => `• ${service.name}: ${service.typicalTimeline}`);
  return {
    text:
      `Typical timelines:\n` +
      (landing ? `• Landing page: about a week\n` : "") +
      `${rows.join("\n")}\n\nThe exact schedule, with weekly demos and milestones, is set out in your proposal.`,
    links: [{ label: "How we work", href: "/process" }],
    chips: [...FOLLOW_UP_CHIPS],
  };
}

export function faqReply(index: number): BotReply {
  const faq = faqs[index];
  if (!faq) return fallbackReply();
  return {
    text: faq.answer,
    links: [{ label: "Read all FAQs", href: "/#faq" }],
    chips: [...FOLLOW_UP_CHIPS],
  };
}

export function fallbackReply(): BotReply {
  return {
    text: "I am not certain I have understood that correctly. I can connect you with our team, who will be glad to help, or you can choose one of the topics below.",
    chips: [
      { label: "Book a free call", action: { kind: "intent", intent: "book-call" } },
      { label: "Talk on WhatsApp", action: { kind: "intent", intent: "whatsapp" } },
      { label: "Services", action: { kind: "intent", intent: "services" } },
      { label: "Pricing", action: { kind: "intent", intent: "pricing" } },
    ],
  };
}

export function intentReply(intent: IntentId): BotReply {
  switch (intent) {
    case "menu":
      return { text: "How else may I help you?", chips: [...MENU_CHIPS] };
    case "greeting":
      return { text: "Hello. How may I help you today?", chips: [...MENU_CHIPS] };
    case "thanks":
      return {
        text: "You are welcome. Is there anything else I can help you with?",
        chips: [...MENU_CHIPS],
      };
    case "services":
      return servicesReply();
    case "pricing":
      return pricingReply();
    case "timelines":
      return timelinesReply();
    case "book-call":
      return {
        text: "Our free 30-minute consultation covers your goals, scope and budget, followed by a written proposal. You can pick a time yourself, or leave a few details here and we will call you.",
        links: [{ label: "Pick a time slot", href: "/book" }],
        startLead: true,
      };
    case "whatsapp":
      return {
        text: `You can message our team on WhatsApp at ${site.phone}. We reply during business hours (${site.hours}).`,
        links: [whatsappLink],
        chips: [
          { label: "Book a free call", action: { kind: "intent", intent: "book-call" } },
          { label: "Main menu", action: { kind: "intent", intent: "menu" } },
        ],
      };
    case "support":
      return {
        text: `Existing clients can raise support requests by email at ${site.supportEmail}. Please include your project name and a short description of the issue. Clients on a care plan receive a first response in ${site.sla.firstResponse.replace(/\bmin\b/, "minutes")}.`,
        links: [
          { label: `Email ${site.supportEmail}`, href: `mailto:${site.supportEmail}`, external: true },
          { label: "Service status", href: "/status" },
          { label: "Maintenance plans", href: "/services/support-maintenance" },
        ],
        chips: [
          { label: "Talk on WhatsApp", action: { kind: "intent", intent: "whatsapp" } },
          { label: "Main menu", action: { kind: "intent", intent: "menu" } },
        ],
      };
    case "careers":
      return {
        text: `Thank you for your interest in joining Setuware Technologies. Current openings are listed on our careers page. You may also send your CV to ${site.hrEmail}.`,
        links: [
          { label: "View careers", href: "/careers" },
          { label: `Email ${site.hrEmail}`, href: `mailto:${site.hrEmail}`, external: true },
        ],
        chips: [{ label: "Main menu", action: { kind: "intent", intent: "menu" } }],
      };
    case "contact":
      return {
        text: `You can reach us on ${site.phone} (${site.hours}). New projects: ${site.salesEmail}. Existing clients: ${site.supportEmail}. Partnerships and general enquiries: ${site.generalEmail}. Our office is on ${site.address.street}, ${site.address.city}.`,
        links: [
          { label: "Call us", href: site.phoneHref, external: true },
          { label: `Email ${site.salesEmail}`, href: `mailto:${site.salesEmail}`, external: true },
          whatsappLink,
        ],
        chips: [
          { label: "Book a free call", action: { kind: "intent", intent: "book-call" } },
          { label: "Main menu", action: { kind: "intent", intent: "menu" } },
        ],
      };
  }
}

/** Free-text entry point: match, then answer. */
export function replyTo(input: string): BotReply {
  return replyForMatch(matchIntent(input));
}

export function replyForMatch(match: Match): BotReply {
  switch (match.type) {
    case "intent":
      return intentReply(match.intent);
    case "service":
      return serviceReply(match.slug);
    case "service-price":
      return serviceReply(match.slug, "price");
    case "service-timeline":
      return serviceReply(match.slug, "timeline");
    case "faq":
      return faqReply(match.index);
    case "none":
      return fallbackReply();
  }
}

/* -------------------------------------------------------------------------- */
/* Enquiry flow                                                                */
/* -------------------------------------------------------------------------- */

export type LeadStep = "name" | "contact" | "email" | "phone" | "service" | "message";

export interface LeadDraft {
  name: string;
  email: string;
  phone: string;
  service: ServiceKey | "other" | "";
  serviceLabel: string;
  message: string;
}

export const EMPTY_LEAD: LeadDraft = {
  name: "",
  email: "",
  phone: "",
  service: "",
  serviceLabel: "",
  message: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+]?[\d\s()-]{7,24}$/;

export function looksLikeEmail(value: string): boolean {
  const trimmed = value.trim();
  return EMAIL_RE.test(trimmed) && !trimmed.toLowerCase().endsWith(".con");
}

export function looksLikePhone(value: string): boolean {
  const trimmed = value.trim();
  return PHONE_RE.test(trimmed) && trimmed.replace(/\D/g, "").length >= 8;
}

/** First name, tidily capitalised, for a friendly confirmation. */
export function firstName(name: string): string {
  const first = name.trim().split(/\s+/)[0] ?? "";
  return first.charAt(0).toUpperCase() + first.slice(1);
}

export const SKIP_CHIP: Chip = { label: "Skip", action: { kind: "lead-skip" } };
export const CANCEL_CHIP: Chip = { label: "Cancel", action: { kind: "lead-cancel" } };

export function leadServiceChips(): Chip[] {
  return [
    ...services.map((service) => ({
      label: service.name,
      action: { kind: "lead-service", slug: service.slug, label: service.name } as const,
    })),
    { label: "Not sure yet", action: { kind: "lead-service", slug: "other", label: "Not sure yet" } },
  ];
}

export function leadPrompt(step: LeadStep, draft: LeadDraft): BotReply {
  switch (step) {
    case "name":
      return { text: "May I have your full name?", chips: [CANCEL_CHIP] };
    case "contact":
      return {
        text: `Thank you, ${firstName(draft.name)}. What is the best email address or phone number to reach you on?`,
        chips: [CANCEL_CHIP],
      };
    case "email":
      return {
        text: "Thank you. Please also share an email address so that we can send you a written proposal.",
        chips: [CANCEL_CHIP],
      };
    case "phone":
      return {
        text: "Would you like to add a phone number for a call back? You may skip this step.",
        chips: [SKIP_CHIP, CANCEL_CHIP],
      };
    case "service":
      return { text: "What do you need help with?", chips: leadServiceChips() };
    case "message":
      return {
        text: "Finally, please describe your project or requirement in a sentence or two. By sending it, you agree to our privacy policy.",
        links: [{ label: "Privacy policy", href: "/privacy" }],
        chips: [CANCEL_CHIP],
      };
  }
}

export interface LeadAdvance {
  /** The step to ask next, or `"submit"` when the draft is complete. */
  next: LeadStep | "submit";
  draft: LeadDraft;
  /** Set when the answer was not accepted; the step stays the same. */
  error?: string;
}

/**
 * Applies a typed answer to the current step. Validation mirrors
 * `contactSchema` so the final submit does not fail on a field the visitor
 * could have corrected in the conversation.
 */
export function advanceLead(step: LeadStep, answer: string, draft: LeadDraft): LeadAdvance {
  const value = answer.trim();
  switch (step) {
    case "name":
      if (value.length < 2 || value.length > 80) {
        return { next: step, draft, error: "Please enter your name (at least two characters)." };
      }
      return { next: "contact", draft: { ...draft, name: value } };
    case "contact":
      if (looksLikeEmail(value)) return { next: "phone", draft: { ...draft, email: value.toLowerCase() } };
      if (looksLikePhone(value)) return { next: "email", draft: { ...draft, phone: value } };
      return {
        next: step,
        draft,
        error: "That does not look like a valid email address or phone number. Please try again.",
      };
    case "email":
      if (!looksLikeEmail(value)) {
        return { next: step, draft, error: "Please enter a valid email address, for example name@company.com." };
      }
      return { next: "service", draft: { ...draft, email: value.toLowerCase() } };
    case "phone":
      if (!looksLikePhone(value)) {
        return { next: step, draft, error: "Please enter a valid phone number, or choose Skip." };
      }
      return { next: "service", draft: { ...draft, phone: value } };
    case "service":
      return { next: "message", draft: { ...draft, service: "other", serviceLabel: value.slice(0, 60) } };
    case "message":
      if (value.length < 5) {
        return { next: step, draft, error: "A little more detail would help our team prepare. Please add a sentence." };
      }
      return { next: "submit", draft: { ...draft, message: value.slice(0, 3500) } };
  }
}

/** Shapes the draft for `/api/contact` (see `contactSchema`). */
export function leadPayload(draft: LeadDraft, elapsedMs: number) {
  const need = draft.serviceLabel || "Not specified";
  return {
    name: draft.name,
    email: draft.email,
    phone: draft.phone,
    service: draft.service && draft.service !== "other" ? draft.service : undefined,
    message: `Enquiry via the website assistant.\nRequirement: ${need}\n\n${draft.message}`,
    consent: true as const,
    honeypot: "",
    elapsedMs,
  };
}

export function confirmationReply(draft: LeadDraft): BotReply {
  return {
    text: `Thank you, ${firstName(draft.name)}. Our team will contact you within one business day.`,
    links: [whatsappLink],
    chips: [{ label: "Main menu", action: { kind: "intent", intent: "menu" } }],
  };
}
