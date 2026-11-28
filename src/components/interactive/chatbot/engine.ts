/**
 * Setuware Assistant: intent matching and answers.
 *
 * Runs entirely in the browser. There is no model behind it: answers are
 * composed from the same site data the pages render (services, plans, FAQs,
 * contact details), so the assistant can never quote a price or a promise the
 * site itself does not make. Everything here is pure, which keeps the matcher
 * unit-testable without rendering the panel.
 */

import { caseStudies, faqs, processSteps, services, type CaseStudy, type Service } from "@/lib/content";
import { industries, type Industry } from "@/lib/industries";
import { projectPackages, carePlans } from "@/lib/plans";
import { founder } from "@/lib/team";
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
  /** Sends the label as the visitor's question, e.g. a "related question" suggestion. */
  | { kind: "ask"; text: string }
  | { kind: "industry"; slug: string };

export interface Chip {
  label: string;
  action: ChipAction;
}

export interface ChatLink {
  label: string;
  href: string;
  external?: boolean;
}

/** Rich content shown under a reply: a service summary or a delivered project. */
export type ReplyCard =
  | {
      kind: "service";
      slug: ServiceKey;
      icon: Service["icon"];
      accent: readonly [string, string];
      title: string;
      summary: string;
      price: string;
      timeline: string;
      href: string;
    }
  | {
      kind: "project";
      client: string;
      sector: string;
      title: string;
      href: string;
      accent: readonly [string, string];
    };

export interface BotReply {
  text: string;
  links?: ChatLink[];
  chips?: Chip[];
  cards?: ReplyCard[];
  /** Asks the panel to show the enquiry form after this reply. */
  startLead?: boolean;
  /** The service this reply is about, so "how much?" next is answered for it. */
  service?: ServiceKey;
}

/** What the conversation is currently about. */
export interface ChatContext {
  service?: ServiceKey;
}

export type Match =
  | { type: "intent"; intent: IntentId }
  | { type: "service"; slug: ServiceKey }
  | { type: "service-price"; slug: ServiceKey }
  | { type: "service-timeline"; slug: ServiceKey }
  | { type: "faq"; index: number }
  | { type: "service-faq"; slug: ServiceKey; index: number }
  | { type: "topic"; id: TopicId }
  | { type: "industry"; slug: string }
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
  { label: "Our work", action: { kind: "ask", text: "Show me your past work" } },
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
  text: "Hello. Ask me anything about our services, pricing, timelines or past projects. I answer instantly, and our team is one tap away whenever you need a person.",
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
  // The company name is not a question about technology.
  return normalise(input)
    .replace(/\bsetuware technologies\b/g, "setuware")
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
    "price", "pricing", "cost", "quote", "quotation", "budget",
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
/* Service and FAQ scoring                                                     */
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

/* -------------------------------------------------------------------------- */
/* Knowledge: industries, topics and service FAQs                              */
/* -------------------------------------------------------------------------- */

/** Words that point at an industry page in `lib/industries.ts`. */
export const INDUSTRY_KEYWORDS: Record<string, readonly string[]> = {
  "retail-ecommerce": ["retail", "boutique", "showroom", "kirana", "fashion", "clothing", "jewellery", "jewelry", "garment"],
  "healthcare-clinics": ["clinic", "hospital", "doctor", "dental", "dentist", "healthcare", "pharmacy", "diagnostic", "patient", "physiotherapy"],
  "education-coaching": ["school", "college", "coaching", "institute", "tuition", "education", "edtech", "academy", "student", "lms"],
  "real-estate-construction": ["real estate", "property", "builder", "construction", "broker", "realtor", "interior"],
  "manufacturing-distribution": ["factory", "manufacturing", "manufacturer", "distributor", "distribution", "wholesale", "dealer", "plant"],
  "logistics-transport": ["logistics", "transport", "fleet", "courier", "trucking", "warehouse", "delivery business"],
  "hospitality-restaurants": ["restaurant", "cafe", "hotel", "resort", "bakery", "cloud kitchen", "food"],
  "professional-services": ["ca firm", "chartered accountant", "law firm", "lawyer", "consultant", "consultancy", "agency", "accountant"],
  "startups-saas": ["startup", "start up", "saas", "mvp", "founder"],
};

function bestIndustry(tokens: string[]): Industry | undefined {
  let best: { industry: Industry; score: number } | undefined;
  for (const industry of industries) {
    const value = score(tokens, INDUSTRY_KEYWORDS[industry.slug] ?? []);
    if (value > 0 && (!best || value > best.score)) best = { industry, score: value };
  }
  return best?.industry;
}

export type TopicId =
  | "about"
  | "founder"
  | "nda"
  | "payments"
  | "stack"
  | "work"
  | "process"
  | "location"
  | "industries"
  | "why-us";

interface Topic {
  id: TopicId;
  /** Shown as a "related question" suggestion. */
  question: string;
  keywords: readonly string[];
}

/** Questions visitors ask that are not a service, a price or an FAQ. */
const TOPICS: readonly Topic[] = [
  {
    id: "nda",
    question: "Do you sign an NDA?",
    keywords: ["nda", "non disclosure", "confidential", "confidentiality", "idea safe", "steal my idea", "copy my idea", "secret"],
  },
  {
    id: "payments",
    question: "How are payments structured?",
    keywords: ["payment", "pay", "instalment", "installment", "emi", "advance", "upfront", "milestone", "part payment", "invoice me"],
  },
  {
    id: "stack",
    question: "Which technologies do you use?",
    keywords: ["tech stack", "stack", "technology", "technologies", "tech", "framework", "programming language", "language do you use", "tools do you use"],
  },
  {
    id: "work",
    question: "Can I see your past work?",
    keywords: ["portfolio", "case study", "past work", "previous work", "your work", "sample", "example", "projects done", "past project", "previous project", "your project", "done before", "built before", "show me", "references", "clients you"],
  },
  {
    id: "process",
    question: "How does a project work with you?",
    keywords: ["process", "how do you work", "how does it work", "how it work", "step", "methodology", "what happens after", "working style", "approach"],
  },
  {
    id: "location",
    question: "Do you work with clients outside Gurugram or India?",
    keywords: ["outside india", "international", "abroad", "overseas", "usa", "uk", "dubai", "uae", "canada", "australia", "other country", "foreign", "remote", "other city", "different city", "visit your office", "where are you", "based"],
  },
  {
    id: "industries",
    question: "Which industries do you work with?",
    keywords: ["industry", "industries", "sector", "niche", "vertical", "business type"],
  },
  {
    id: "why-us",
    question: "Why choose Setuware Technologies?",
    keywords: ["why choose", "why you", "why should", "why setuware", "different from", "better than", "trust you", "advantage", "benefit"],
  },
  {
    id: "founder",
    question: "Who founded Setuware Technologies?",
    keywords: ["founder", "founded", "owner", "ceo", "who run", "who started", "who owns setuware", "satyam", "team size", "your team"],
  },
  {
    id: "about",
    question: "What is Setuware Technologies?",
    keywords: ["setuware", "who are you", "about you", "about your company", "your company", "what do you do", "tell me about"],
  },
];

function bestTopic(tokens: string[]): { topic: Topic; score: number } | null {
  let best: { topic: Topic; score: number } | null = null;
  for (const topic of TOPICS) {
    const value = score(tokens, topic.keywords);
    // A bare "setuware" appears in many questions; let a specific topic win.
    const adjusted = topic.id === "about" ? value - 0.5 : value;
    if (adjusted > 0 && (!best || adjusted > best.score)) best = { topic, score: adjusted };
  }
  return best;
}

/** Every service page's FAQ, prepared once for matching. */
const SERVICE_FAQS = services.flatMap((service) =>
  (service.faqs ?? []).map((faq, index) => ({
    slug: service.slug,
    index,
    question: faq.question,
    tokens: Array.from(new Set(tokenise(faq.question).filter((word) => !STOPWORDS.has(word)))),
  })),
);

interface Overlap {
  overlap: number;
  ratio: number;
}

function overlapWith(meaningful: string[], questionTokens: string[]): Overlap {
  const overlap = questionTokens.filter((keyword) => meaningful.some((word) => wordMatches(word, keyword))).length;
  return { overlap, ratio: questionTokens.length === 0 ? 0 : overlap / questionTokens.length };
}

function bestServiceFaq(tokens: string[], service: ServiceKey | undefined) {
  const meaningful = tokens.filter((word) => !STOPWORDS.has(word));
  if (meaningful.length === 0) return null;
  let best: ((typeof SERVICE_FAQS)[number] & Overlap & { raw: number }) | null = null;
  for (const entry of SERVICE_FAQS) {
    const result = overlapWith(meaningful, entry.tokens);
    // A question about the service already in view counts one word extra.
    const overlap = result.overlap + (service && entry.slug === service && result.overlap > 0 ? 1 : 0);
    if (overlap > 0 && (!best || overlap > best.overlap || (overlap === best.overlap && result.ratio > best.ratio))) {
      best = { ...entry, overlap, raw: result.overlap, ratio: result.ratio };
    }
  }
  return best;
}

const verbatim = (match: Overlap | null): boolean => !!match && match.overlap >= 3 && match.ratio >= 0.8;

const strong = (match: Overlap | null): boolean =>
  !!match && (match.overlap >= 3 || (match.overlap >= 2 && match.ratio >= 0.6));

/* -------------------------------------------------------------------------- */
/* Budget                                                                      */
/* -------------------------------------------------------------------------- */

const COUNT_NOUNS =
  "products?|items?|users?|visitors?|pages?|orders?|customers?|students?|followers?|downloads?|skus?|members?|employees?|views?|branches|stores?|outlets?|patients?|leads?|bookings?|transactions?|subscribers?|clients?|locations?";
/** Numbers followed by one of these are counts, not money ("2k monthly orders"). */
const NOT_MONEY = String.raw`(?!\s*(?:(?:monthly|daily|weekly|yearly|annual|active|unique)\s+)?(?:${COUNT_NOUNS})\b)`;
const RUPEE_MARK = /₹|\brs\b|\binr\b|\brupees?\b/;
const FOREIGN_MARK = /\$|€|£|\b(usd|dollars?|euros?|pounds?|aed|dirhams?)\b/;
const FOREIGN_AMOUNT =
  /(?:\$|€|£|\busd|\baed)\s*\d+(?:\.\d+)?\s*(?:k|m|thousand|million|lakhs?)?(?:\s*(?:-|–|to)\s*\d+(?:\.\d+)?\s*(?:k|m|thousand|million|lakhs?)?)?\b|\d+(?:\.\d+)?\s*(?:k|m|thousand|million|lakhs?)?\s*(?:usd|dollars?|euros?|pounds?|aed|dirhams?)\b/g;
const BUDGET_WORD = /\b(budget|afford|spend)\b/;
const LIMIT_WORD = /\b(under|within|below|upto|up to|around|about|max|maximum)\b/;
const YEAR_CONTEXT = /\b(in|for|by|since|till|until|year|from|around|before|after)\s*$/;
const AMOUNT = new RegExp(
  String.raw`(₹|\brs\.?|\binr|\brupees?)?\s*(\d+(?:\.\d+)?)\s*(k|thousand|l|lac|lakh|lakhs|cr|crore)?\b(\s*(?:₹|rs\b|inr\b|rupees?\b))?${NOT_MONEY}`,
  "g",
);

function budgetValue(amount: string, unit: string | undefined): number {
  const value = Number.parseFloat(amount);
  if (!unit) return Math.round(value);
  const factor = unit === "k" || unit === "thousand" ? 1_000 : unit === "cr" || unit === "crore" ? 10_000_000 : 100_000;
  return Math.round(value * factor);
}

const SENTENCE_BREAK = /[!?;\n]|\.(?!\d)/g;

function sentenceAround(text: string, index: number): { start: number; end: number } {
  let start = 0;
  let end = text.length;
  for (const match of text.matchAll(SENTENCE_BREAK)) {
    if (match.index < index) start = match.index + 1;
    else {
      end = match.index;
      break;
    }
  }
  return { start, end };
}

/**
 * Reads a rupee budget from "under 20k", "₹1.5 lakh", "budget 50,000" or "rs 15000".
 * The amount nearest "budget" wins; counts ("4,000 visitors"), years and
 * amounts in other currencies are ignored.
 */
export function parseBudget(input: string): number | null {
  const text = input.toLowerCase().replace(/(\d),(?=\d)/g, "$1");
  if (FOREIGN_MARK.test(text) && !RUPEE_MARK.test(text)) return null;
  const cleaned = text.replace(FOREIGN_AMOUNT, " ");
  const keyword = cleaned.search(BUDGET_WORD);
  const candidates: { at: number; value: number; marked: boolean; plain: boolean }[] = [];
  for (const match of cleaned.matchAll(AMOUNT)) {
    const marked = Boolean(match[1] || match[4]);
    const unit = match[3];
    const plain = !marked && !unit;
    if (plain && !/^\d{4,9}$/.test(match[2])) continue;
    const yearLike = plain && /^(19|20)\d{2}$/.test(match[2]);
    if (yearLike && (keyword < 0 || YEAR_CONTEXT.test(cleaned.slice(0, match.index)))) continue;
    candidates.push({ at: match.index, value: budgetValue(match[2], unit), marked, plain });
  }
  // "budget" may come before or after its amount: take the nearest one in its sentence.
  const sentence = sentenceAround(cleaned, keyword);
  const nearest =
    keyword >= 0
      ? candidates
          .filter((candidate) => candidate.at >= sentence.start && candidate.at < sentence.end)
          .reduce<(typeof candidates)[number] | undefined>(
          (best, candidate) =>
            !best || Math.abs(candidate.at - keyword) < Math.abs(best.at - keyword) ? candidate : best,
          undefined,
        )
      : undefined;
  const limit = cleaned.search(LIMIT_WORD);
  const afterLimit = limit >= 0 ? candidates.find((candidate) => candidate.at >= limit) : undefined;
  const chosen =
    nearest ?? afterLimit ?? candidates.find((candidate) => candidate.marked) ?? candidates.find((candidate) => !candidate.plain);
  return chosen?.value ?? null;
}

/* -------------------------------------------------------------------------- */
/* Matcher                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Maps free text to the most useful answer. The order of the checks is the
 * priority: a job enquiry first; then a price or timeline question for a named
 * service; then near-verbatim FAQs and named topics; then broader intents.
 * `context` answers follow-ups such as "how much?" for the service in view.
 */
export function matchIntent(input: string, context: ChatContext = {}): Match {
  const text = normalise(input);
  if (text.length === 0) return { type: "none" };
  const tokens = tokenise(input);

  const s = (id: keyof typeof INTENT_KEYWORDS) => score(tokens, INTENT_KEYWORDS[id]);
  const service = bestService(tokens);
  const faq = bestFaq(tokens);
  const serviceFaq = bestServiceFaq(tokens, service?.slug ?? context.service);
  const topic = bestTopic(tokens);
  const pricing = s("pricing") > 0 || parseBudget(input) !== null;
  const timeline = s("timelines") > 0;

  if (s("careers") > 0) return { type: "intent", intent: "careers" };

  // A question picked almost word for word from an FAQ gets that FAQ's answer.
  if (verbatim(serviceFaq) && (!faq || serviceFaq!.raw > faq.overlap)) {
    return { type: "service-faq", slug: serviceFaq!.slug, index: serviceFaq!.index };
  }
  if (verbatim(faq)) return { type: "faq", index: faq!.index };

  if (service && pricing) return { type: "service-price", slug: service.slug };
  if (service && timeline) return { type: "service-timeline", slug: service.slug };

  // A bare follow-up ("how much?") is about the service just discussed.
  if (!service && context.service && (pricing || timeline)) {
    if (strong(serviceFaq) && serviceFaq!.slug === context.service) {
      return { type: "service-faq", slug: serviceFaq!.slug, index: serviceFaq!.index };
    }
    return pricing
      ? { type: "service-price", slug: context.service }
      : { type: "service-timeline", slug: context.service };
  }

  if (strong(faq) && (!serviceFaq || faq!.overlap >= serviceFaq.raw)) return { type: "faq", index: faq!.index };
  if (strong(serviceFaq)) return { type: "service-faq", slug: serviceFaq!.slug, index: serviceFaq!.index };
  if (topic && topic.score >= 1 && !(service && topic.topic.id === "about")) {
    return { type: "topic", id: topic.topic.id };
  }

  if (pricing) {
    return context.service ? { type: "service-price", slug: context.service } : { type: "intent", intent: "pricing" };
  }
  if (timeline) {
    return context.service
      ? { type: "service-timeline", slug: context.service }
      : { type: "intent", intent: "timelines" };
  }
  if (s("whatsapp") > 0) return { type: "intent", intent: "whatsapp" };
  if (s("support") > 0 && service?.slug !== "support-maintenance") {
    return { type: "intent", intent: "support" };
  }
  if (s("book-call") > 0) return { type: "intent", intent: "book-call" };
  if (service) return { type: "service", slug: service.slug };
  const industry = bestIndustry(tokens);
  if (industry) return { type: "industry", slug: industry.slug };
  if (s("contact") > 0) return { type: "intent", intent: "contact" };
  if (faq && faq.overlap >= 2) return { type: "faq", index: faq.index };
  if (s("services") > 0) return { type: "intent", intent: "services" };
  if (s("greeting") > 0) return { type: "intent", intent: "greeting" };
  if (s("thanks") > 0) return { type: "intent", intent: "thanks" };
  // Last resort: a single distinctive word from an FAQ ("payment", "launch").
  if (faq && faq.overlap >= 1) return { type: "faq", index: faq.index };
  if (topic && topic.score > 0) return { type: "topic", id: topic.topic.id };
  return { type: "none" };
}

/**
 * Up to three questions sharing a word with the visitor's message, offered
 * when nothing matched confidently.
 */
export function relatedQuestions(input: string): string[] {
  const meaningful = tokenise(input).filter((word) => !STOPWORDS.has(word));
  if (meaningful.length === 0) return [];
  const pool = [
    ...faqs.map((faq) => faq.question),
    ...SERVICE_FAQS.map((entry) => entry.question),
    ...TOPICS.map((topic) => topic.question),
  ];
  return pool
    .map((question) => {
      const words = Array.from(new Set(tokenise(question).filter((word) => !STOPWORDS.has(word))));
      return { question, ...overlapWith(meaningful, words) };
    })
    .filter((entry) => entry.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap || b.ratio - a.ratio)
    .slice(0, 3)
    .map((entry) => entry.question);
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

function servicePrice(service: Service): string {
  const fullApplication = projectPackages.find((plan) => plan.id === "full-application-build")?.setupFrom;
  if (service.slug === "business-websites" && service.entryPriceFrom) {
    return `Landing pages start at ${formatINR(service.entryPriceFrom)} and complete business websites at ${formatINR(service.priceFrom)}.`;
  }
  if (APPLICATION_SERVICES.has(service.slug) && fullApplication) {
    return `Full application builds start from ${formatINR(fullApplication)}, and a typical ${service.name.toLowerCase()} project is estimated from ${formatINR(startingPrice(service))}.`;
  }
  return `${service.priceLabel ?? `Projects start from ${formatINR(startingPrice(service))}`}.`;
}

/** The lowest published figure a visitor can start this service at. */
function entryPrice(service: Service): number {
  const fullApplication = projectPackages.find((plan) => plan.id === "full-application-build")?.setupFrom;
  if (APPLICATION_SERVICES.has(service.slug) && fullApplication) return fullApplication;
  return startingPrice(service);
}

export function serviceCard(service: Service): ReplyCard {
  return {
    kind: "service",
    slug: service.slug,
    icon: service.icon,
    accent: service.accent,
    title: service.name,
    summary: service.summary,
    price: service.priceLabel ?? `From ${formatINR(entryPrice(service))}`,
    timeline: service.typicalTimeline,
    href: `/services/${service.slug}`,
  };
}

function projectCard(study: CaseStudy): ReplyCard {
  return {
    kind: "project",
    client: study.client,
    sector: study.sector,
    title: study.title,
    href: `/work/${study.slug}`,
    accent: study.accent,
  };
}

function budgetLine(service: Service, budget: number): string {
  const from = entryPrice(service);
  const full = service.priceFrom;
  if (service.entryPriceFrom && budget >= service.entryPriceFrom && budget < full) {
    return `Your budget of ${formatINR(budget)} covers a focused starter build from ${formatINR(service.entryPriceFrom)}; the complete ${service.name.toLowerCase()} package starts at ${formatINR(full)}.`;
  }
  if (budget >= from) {
    return `Your budget of ${formatINR(budget)} is within our published range for ${service.name.toLowerCase()}, which starts at ${formatINR(from)}.`;
  }
  return `Our published starting price for ${service.name.toLowerCase()} is ${formatINR(from)}, above the ${formatINR(budget)} you mentioned. On a free call, our team can suggest a focused first phase that fits your budget.`;
}

export function serviceReply(
  slug: ServiceKey,
  focus: "summary" | "price" | "timeline" = "summary",
  extras: { budget?: number | null; industry?: Industry } = {},
): BotReply {
  const service = getServiceBySlug(slug);
  if (!service) return servicesReply();

  const price = servicePrice(service);
  const timeline = `Typical timeline: ${service.typicalTimeline}.`;
  const stack = service.stack.length > 0 ? ` We commonly work with ${listJoin(service.stack.slice(0, 3))}.` : "";

  const opening =
    focus === "price"
      ? `${service.name}: ${price} ${timeline}`
      : focus === "timeline"
        ? `${service.name}. ${timeline} ${price}`
        : `${service.name}. ${service.summary}${stack} ${price} ${timeline}`;
  const budget = extras.budget ? ` ${budgetLine(service, extras.budget)}` : "";

  const links = [serviceLink(service)];
  if (extras.industry) {
    links.push({ label: `Solutions for ${extras.industry.name.toLowerCase()}`, href: `/industries/${extras.industry.slug}` });
  }
  const studies = caseStudies.filter((study) => study.services.includes(service.slug)).slice(0, 1);

  return {
    text: `${opening}${budget} The final figure is confirmed in a fixed written quote.`,
    cards: [serviceCard(service), ...studies.map(projectCard)],
    links,
    chips: [...FOLLOW_UP_CHIPS],
    service: service.slug,
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

export function fallbackReply(related: readonly string[] = []): BotReply {
  if (related.length > 0) {
    return {
      text: "I do not have a confident answer to that yet. I can connect you with our team, or you may find one of these related questions helpful.",
      chips: [
        ...related.map((question) => ({ label: question, action: { kind: "ask", text: question } as const })),
        { label: "Book a free call", action: { kind: "intent", intent: "book-call" } },
        { label: "Talk on WhatsApp", action: { kind: "intent", intent: "whatsapp" } },
      ],
    };
  }
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
        text: "Our free 30-minute consultation covers your goals, scope and budget, followed by a written proposal. You can pick a time yourself, or leave your details below and we will call you back.",
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

function serviceFaqReply(slug: ServiceKey, index: number): BotReply {
  const service = getServiceBySlug(slug);
  const faq = service?.faqs?.[index];
  if (!service || !faq) return fallbackReply();
  return {
    text: faq.answer,
    links: [serviceLink(service)],
    chips: [...FOLLOW_UP_CHIPS],
    service: slug,
  };
}

export function industryReply(slug: string, budget?: number | null): BotReply {
  const industry = industries.find((entry) => entry.slug === slug);
  if (!industry) return servicesReply();
  const builds = industry.builds.slice(0, 4);
  const lead = builds[0] ? getServiceBySlug(builds[0].service) : undefined;
  const budgetNote = budget && lead ? `\n\n${budgetLine(lead, budget)}` : "";
  return {
    text:
      `${industry.summary.replace(/[.\s]*$/, ".")} For ${industry.sector}, we typically build:\n` +
      builds.map((build) => `• ${build.title}: ${build.body}`).join("\n") +
      budgetNote,
    links: [{ label: `Solutions for ${industry.name.toLowerCase()}`, href: `/industries/${industry.slug}` }],
    chips: [
      ...Array.from(new Set(builds.map((build) => build.service)))
        .slice(0, 2)
        .map((service) => ({
          label: getServiceBySlug(service)?.name ?? service,
          action: { kind: "service", slug: service } as const,
        })),
      { label: "Book a free call", action: { kind: "intent", intent: "book-call" } },
    ],
    service: lead?.slug,
  };
}

function serviceFaqAnswer(fragment: string): string | undefined {
  for (const service of services) {
    const faq = service.faqs?.find((entry) => entry.question.toLowerCase().includes(fragment));
    if (faq) return faq.answer;
  }
  return undefined;
}

export function topicReply(id: TopicId): BotReply {
  switch (id) {
    case "about":
      return {
        text: `${site.name} is a Gurugram-based digital studio. ${site.slogan} We design, build and support websites, e-commerce platforms, mobile apps and custom software for growing businesses.`,
        links: [
          { label: "About us", href: "/about" },
          { label: "Our work", href: "/work" },
        ],
        chips: [
          { label: "Services", action: { kind: "intent", intent: "services" } },
          { label: "Our work", action: { kind: "ask", text: "Show me your past work" } },
          { label: "Book a free call", action: { kind: "intent", intent: "book-call" } },
        ],
      };
    case "founder":
      return {
        text: `${site.name} was founded by ${founder.name}. ${founder.bio}`,
        links: [
          { label: "About us", href: "/about" },
          ...(founder.linkedin ? [{ label: `${founder.name} on LinkedIn`, href: founder.linkedin, external: true }] : []),
        ],
        chips: [...FOLLOW_UP_CHIPS],
      };
    case "nda":
      return {
        text:
          serviceFaqAnswer("non-disclosure") ??
          "Yes. We sign NDAs before detailed discussions, and our standard contract assigns all intellectual property to you.",
        links: [{ label: "Terms of service", href: "/terms" }],
        chips: [
          { label: "Who owns the code?", action: { kind: "ask", text: "Who owns the website and code?" } },
          { label: "Book a free call", action: { kind: "intent", intent: "book-call" } },
        ],
      };
    case "payments": {
      const index = faqs.findIndex((faq) => faq.question.toLowerCase().includes("payment"));
      return index >= 0 ? faqReply(index) : pricingReply();
    }
    case "stack": {
      const rows = (["business-websites", "ecommerce-stores", "web-development", "app-development", "ai-integration", "managed-hosting"] as const)
        .map((slug) => getServiceBySlug(slug))
        .filter((service): service is Service => !!service && service.stack.length > 0)
        .map((service) => `• ${service.name}: ${listJoin(service.stack.slice(0, 4))}`);
      return {
        text: `We choose the stack per project and explain the choice in the proposal. Our usual tools:\n${rows.join("\n")}`,
        links: [{ label: "All services", href: "/services" }],
        chips: [...FOLLOW_UP_CHIPS],
      };
    }
    case "work":
      return {
        text: "Here are projects we have delivered. Each case study covers the brief, our approach and the result.",
        cards: caseStudies.slice(0, 3).map(projectCard),
        links: [{ label: "View all projects", href: "/work" }],
        chips: [...FOLLOW_UP_CHIPS],
      };
    case "process":
      return {
        text: `Every project follows the same six stages:\n${processSteps
          .map((step) => `• ${step.title} (${step.duration}): ${step.description}`)
          .join("\n")}`,
        links: [{ label: "How we work", href: "/process" }],
        chips: [...FOLLOW_UP_CHIPS],
      };
    case "location":
      return {
        text: `Our studio is on ${site.address.street}, ${site.address.city}, and we work with businesses across India. Discovery calls and progress reviews take place online, so you do not need to visit the office. If you are based outside India, share your requirement and our team will confirm the engagement details on a call.`,
        links: [
          { label: "Contact us", href: "/contact" },
          whatsappLink,
        ],
        chips: [
          { label: "Book a free call", action: { kind: "intent", intent: "book-call" } },
          { label: "Main menu", action: { kind: "intent", intent: "menu" } },
        ],
      };
    case "industries":
      return {
        text: `We build for ${listJoin(industries.map((industry) => industry.name.toLowerCase()))}. Choose a sector to see what we typically build for it.`,
        chips: industries.slice(0, 6).map((industry) => ({
          label: industry.name,
          action: { kind: "industry", slug: industry.slug } as const,
        })),
        links: [{ label: "All industries", href: "/industries" }],
      };
    case "why-us":
      return {
        text:
          "What clients receive with every engagement:\n" +
          "• Transparent pricing: a detailed proposal and a fixed quote before any work begins.\n" +
          "• A dedicated project manager: one point of contact and regular progress updates.\n" +
          "• Complete ownership: your code, domains and accounts remain yours.\n" +
          "• Support after launch: three months included, with maintenance plans available.",
        links: [
          { label: "About us", href: "/about" },
          { label: "Our work", href: "/work" },
        ],
        chips: [...FOLLOW_UP_CHIPS],
      };
  }
}

/** Free-text entry point: match, then answer. */
export function replyTo(input: string, context: ChatContext = {}): BotReply {
  const match = matchIntent(input, context);
  const budget = parseBudget(input);
  const tokens = tokenise(input);
  if (match.type === "service" || match.type === "service-price" || match.type === "service-timeline") {
    const focus = match.type === "service-price" ? "price" : match.type === "service-timeline" ? "timeline" : "summary";
    return serviceReply(match.slug, focus, { budget, industry: bestIndustry(tokens) });
  }
  if (match.type === "industry") return industryReply(match.slug, budget);
  if (match.type === "none") return fallbackReply(relatedQuestions(input));
  return replyForMatch(match);
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
    case "service-faq":
      return serviceFaqReply(match.slug, match.index);
    case "topic":
      return topicReply(match.id);
    case "industry":
      return industryReply(match.slug);
    case "none":
      return fallbackReply();
  }
}

/* -------------------------------------------------------------------------- */
/* Enquiry flow                                                                */
/* -------------------------------------------------------------------------- */

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

/** Services offered in the enquiry form, plus "Not sure yet". */
export function leadServiceOptions(): { value: ServiceKey | "other"; label: string }[] {
  return [
    ...services.map((service) => ({ value: service.slug, label: service.name })),
    { value: "other", label: "Not sure yet" },
  ];
}

export type LeadErrors = Partial<Record<"name" | "email" | "phone" | "message", string>>;

/** Mirrors `contactSchema`, so the submit never fails on a fixable field. */
export function validateLead(draft: LeadDraft): LeadErrors {
  const errors: LeadErrors = {};
  const name = draft.name.trim();
  if (name.length < 2 || name.length > 80) errors.name = "Please enter your name.";
  if (!looksLikeEmail(draft.email)) errors.email = "Please enter a valid email address.";
  if (draft.phone.trim() && !looksLikePhone(draft.phone)) errors.phone = "Please enter a valid phone number.";
  if (draft.message.trim().length < 10) errors.message = "A sentence or two about the project helps our team prepare.";
  return errors;
}

/** Shapes the draft for `/api/contact` (see `contactSchema`). */
export function leadPayload(draft: LeadDraft, elapsedMs: number) {
  const need = draft.serviceLabel || "Not specified";
  return {
    name: draft.name.trim(),
    email: draft.email.trim().toLowerCase(),
    phone: draft.phone.trim(),
    service: draft.service && draft.service !== "other" ? draft.service : undefined,
    message: `Enquiry via the website assistant.\nRequirement: ${need}\n\n${draft.message.trim().slice(0, 3500)}`,
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
