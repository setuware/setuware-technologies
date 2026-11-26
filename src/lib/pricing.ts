/**
 * Quote engine behind the instant estimator.
 *
 * Deliberately pure and synchronous: the same function runs in the browser for
 * live price updates and on the server when a quote is emailed, so both sides
 * can never disagree. All money is in paise-free whole INR.
 */

import { APP_BUILD_FROM, carePlans, LANDING_PAGE_FROM, WEBSITE_FROM } from "./plans";
import { formatINR } from "./utils";

export type ServiceKey =
  | "business-websites"
  | "ecommerce-stores"
  | "web-development"
  | "app-development"
  | "product-design"
  | "seo-marketing"
  | "custom-software"
  | "ai-integration"
  | "managed-hosting"
  | "support-maintenance";

export type DesignTier = "starter" | "custom" | "premium";
export type TimelineKey = "relaxed" | "standard" | "accelerated";
export type PlatformKey = "web" | "ios" | "android";

export type FeatureKey =
  | "auth"
  | "payments"
  | "cms"
  | "dashboard"
  | "chat"
  | "ai"
  | "i18n"
  | "integrations"
  | "seo"
  | "pwa";

export interface EstimateInput {
  service: ServiceKey;
  /** Pages for web, screens for mobile, sites for hosting. */
  scope: number;
  design: DesignTier;
  features: FeatureKey[];
  timeline: TimelineKey;
  platforms: PlatformKey[];
  /** Add a monthly care plan after launch. */
  retainer: boolean;
}

export interface Milestone {
  name: string;
  share: number;
  amount: number;
}

export interface EstimateResult {
  currency: "INR";
  /** Mid-point estimate, rounded to the nearest ₹1,000. */
  total: number;
  /** Confidence band around `total`. */
  low: number;
  high: number;
  breakdown: {
    base: number;
    scope: number;
    features: number;
    designUplift: number;
    platformUplift: number;
    timelineUplift: number;
  };
  weeks: number;
  teamSize: number;
  milestones: Milestone[];
  monthlyRetainer: number;
  /** Human-readable notes surfaced next to the number. */
  notes: string[];
}

export const SCOPE_LIMITS = { min: 1, max: 60 } as const;

interface ServiceRate {
  label: string;
  base: number;
  perScope: number;
  scopeNoun: string;
  baseWeeks: number;
  /** Scope units a squad clears per week. */
  throughput: number;
  supportsPlatforms: boolean;
}

// TODO(owner): confirm the per-page rate for business-websites and the base and
// per-unit rates for ecommerce-stores, seo-marketing and custom-software.
// Business websites is anchored to the published Website Build package (from
// ₹9,999) and web-development to the Full Application Build (from ₹19,999);
// the single-page Landing Page package (from ₹4,999) is a fixed
// package outside the estimator. The other three are placeholders, not
// published prices.
export const SERVICE_RATES: Record<ServiceKey, ServiceRate> = {
  "business-websites": {
    label: "Business websites",
    base: WEBSITE_FROM,
    perScope: 2_000,
    scopeNoun: "pages",
    baseWeeks: 2,
    throughput: 4,
    supportsPlatforms: false,
  },
  "ecommerce-stores": {
    label: "E-commerce stores",
    base: 29_999,
    perScope: 2_000,
    scopeNoun: "product categories",
    baseWeeks: 3,
    throughput: 3,
    supportsPlatforms: false,
  },
  "web-development": {
    label: "Web application development",
    base: APP_BUILD_FROM,
    perScope: 7_500,
    scopeNoun: "pages",
    baseWeeks: 3,
    throughput: 2.5,
    supportsPlatforms: false,
  },
  "app-development": {
    label: "Mobile app development",
    base: 29_999,
    perScope: 9_000,
    scopeNoun: "screens",
    baseWeeks: 4,
    throughput: 2,
    supportsPlatforms: true,
  },
  "managed-hosting": {
    label: "Hosting & domains",
    base: 2_999,
    perScope: 500,
    scopeNoun: "environments",
    baseWeeks: 1,
    throughput: 6,
    supportsPlatforms: false,
  },
  "seo-marketing": {
    label: "SEO & digital marketing",
    base: 9_999,
    perScope: 1_000,
    scopeNoun: "pages",
    baseWeeks: 1,
    throughput: 8,
    supportsPlatforms: false,
  },
  "custom-software": {
    label: "Custom software, ERP & CRM",
    base: 79_999,
    perScope: 10_000,
    scopeNoun: "modules",
    baseWeeks: 4,
    throughput: 1,
    supportsPlatforms: false,
  },
  "ai-integration": {
    label: "AI & automation",
    base: 39_999,
    perScope: 4_000,
    scopeNoun: "workflows",
    baseWeeks: 3,
    throughput: 1.5,
    supportsPlatforms: false,
  },
  "product-design": {
    label: "UI/UX & branding",
    base: 12_999,
    perScope: 1_500,
    scopeNoun: "screens",
    baseWeeks: 2,
    throughput: 3.5,
    supportsPlatforms: false,
  },
  "support-maintenance": {
    label: "Maintenance & support",
    base: 9_999,
    perScope: 1_000,
    scopeNoun: "applications",
    baseWeeks: 1,
    throughput: 5,
    supportsPlatforms: false,
  },
};

export const FEATURE_RATES: Record<
  FeatureKey,
  { label: string; cost: number; weeks: number; hint: string }
> = {
  auth: {
    label: "Accounts & authentication",
    cost: 14_000,
    weeks: 0.8,
    hint: "Email, OTP and social sign-in, with roles",
  },
  payments: {
    label: "Payments & billing",
    cost: 22_000,
    weeks: 1.2,
    hint: "Razorpay or Stripe, invoices and refunds",
  },
  cms: {
    label: "Content management",
    cost: 16_000,
    weeks: 0.8,
    hint: "Content editing for your team without a developer",
  },
  dashboard: {
    label: "Admin dashboard",
    cost: 28_000,
    weeks: 1.5,
    hint: "Reports, CSV exports and user management",
  },
  chat: {
    label: "Realtime chat / notifications",
    cost: 18_000,
    weeks: 1,
    hint: "WebSockets, push and email notifications",
  },
  ai: {
    label: "AI assistant / automation",
    cost: 36_000,
    weeks: 1.8,
    hint: "Document assistants, data extraction and workflows",
  },
  i18n: {
    label: "Multi-language",
    cost: 12_000,
    weeks: 0.6,
    hint: "Translated pages, local currency and dates",
  },
  integrations: {
    label: "Third-party integrations",
    cost: 20_000,
    weeks: 1,
    hint: "CRM, ERP, logistics APIs and WhatsApp Business",
  },
  seo: {
    label: "Technical SEO & analytics",
    cost: 10_000,
    weeks: 0.5,
    hint: "Schema markup, sitemaps and an analytics dashboard",
  },
  pwa: {
    label: "Offline / installable PWA",
    cost: 14_000,
    weeks: 0.7,
    hint: "Installable and reliable on unstable networks",
  },
};

export const DESIGN_TIERS: Record<
  DesignTier,
  { label: string; multiplier: number; hint: string }
> = {
  starter: {
    label: "Clean & conventional",
    multiplier: 1,
    hint: "Proven layouts from our component library",
  },
  custom: {
    label: "Custom branded",
    multiplier: 1.25,
    hint: "Your own design system and illustrations",
  },
  premium: {
    label: "Signature & animated",
    multiplier: 1.5,
    hint: "Motion design, 3D and micro-interactions",
  },
};

export const TIMELINES: Record<
  TimelineKey,
  { label: string; multiplier: number; speed: number; hint: string }
> = {
  relaxed: {
    label: "Flexible",
    multiplier: 0.92,
    speed: 0.8,
    hint: "Flexible scheduling at the lowest price",
  },
  standard: {
    label: "Standard",
    multiplier: 1,
    speed: 1,
    hint: "A dedicated team in two-week sprints",
  },
  accelerated: {
    label: "Accelerated",
    multiplier: 1.35,
    speed: 1.45,
    hint: "A larger team working in parallel",
  },
};

const MILESTONE_PLAN = [
  { name: "Discovery & architecture", share: 0.15 },
  { name: "Design & prototype", share: 0.2 },
  { name: "Build & integrate", share: 0.45 },
  { name: "QA, launch & handover", share: 0.2 },
] as const;

const CONFIDENCE_BAND = 0.12;
/** The retainer never quotes below the cheapest published maintenance plan. */
const MIN_RETAINER = Math.min(
  ...carePlans.map((plan) => plan.monthly ?? Number.POSITIVE_INFINITY),
);
const RETAINER_RATE = 0.08;

function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/** Drops unknown keys and duplicates so a tampered payload cannot inflate a quote. */
function normaliseFeatures(features: readonly FeatureKey[]): FeatureKey[] {
  const seen = new Set<FeatureKey>();
  for (const feature of features) {
    if (feature in FEATURE_RATES) seen.add(feature);
  }
  return [...seen];
}

function normalisePlatforms(
  platforms: readonly PlatformKey[],
  supportsPlatforms: boolean,
): PlatformKey[] {
  if (!supportsPlatforms) return ["web"];
  const valid = platforms.filter(
    (platform): platform is PlatformKey =>
      platform === "web" || platform === "ios" || platform === "android",
  );
  const unique = [...new Set(valid)];
  return unique.length > 0 ? unique : ["web"];
}

/**
 * Turns estimator answers into a quote. Inputs are normalised rather than
 * rejected so a slider at an odd value or a stale feature key still returns a
 * usable number instead of throwing in the middle of a drag.
 */
export function estimateProject(input: EstimateInput): EstimateResult {
  const rate = SERVICE_RATES[input.service] ?? SERVICE_RATES["web-development"];
  const scope = Math.round(clamp(input.scope, SCOPE_LIMITS.min, SCOPE_LIMITS.max));
  const features = normaliseFeatures(input.features ?? []);
  const platforms = normalisePlatforms(input.platforms ?? [], rate.supportsPlatforms);
  const design = DESIGN_TIERS[input.design] ?? DESIGN_TIERS.starter;
  const timeline = TIMELINES[input.timeline] ?? TIMELINES.standard;

  const scopeCost = scope * rate.perScope;
  const featureCost = features.reduce(
    (sum, feature) => sum + FEATURE_RATES[feature].cost,
    0,
  );

  const buildCost = rate.base + scopeCost + featureCost;

  // Each extra mobile platform adds integration and QA surface, not a full rebuild.
  const platformMultiplier = 1 + 0.35 * (platforms.length - 1);
  const platformUplift = buildCost * (platformMultiplier - 1);

  const afterPlatform = buildCost + platformUplift;
  const designUplift = afterPlatform * (design.multiplier - 1);

  const afterDesign = afterPlatform + designUplift;
  const timelineUplift = afterDesign * (timeline.multiplier - 1);

  const total = roundTo(afterDesign + timelineUplift, 1_000);

  const featureWeeks = features.reduce(
    (sum, feature) => sum + FEATURE_RATES[feature].weeks,
    0,
  );
  const rawWeeks =
    (rate.baseWeeks + scope / rate.throughput + featureWeeks) / timeline.speed;
  const weeks = Math.max(1, Math.round(rawWeeks));

  const teamSize = clamp(
    Math.ceil((scope / 8 + features.length / 3) * (timeline.speed > 1 ? 1.6 : 1)) + 1,
    2,
    9,
  );

  const milestones: Milestone[] = MILESTONE_PLAN.map((milestone) => ({
    name: milestone.name,
    share: milestone.share,
    amount: roundTo(total * milestone.share, 500),
  }));

  const notes: string[] = [];
  if (timeline.multiplier > 1) {
    notes.push("Accelerated delivery adds engineering and testing capacity.");
  }
  if (features.includes("payments")) {
    notes.push("Payment gateway activation requires your business KYC documents.");
  }
  if (features.includes("ai")) {
    notes.push("AI model usage is billed at cost, in addition to the build price.");
  }
  if (platforms.length > 1) {
    notes.push(
      `A shared codebase across ${platforms.length} platforms limits the uplift to ${Math.round(
        (platformMultiplier - 1) * 100,
      )}%.`,
    );
  }
  if (input.service === "business-websites" && scope <= 1) {
    notes.push(
      `For a single page, the Landing Page package starts at ${formatINR(
        LANDING_PAGE_FROM,
      )} and is typically live within a week.`,
    );
  }
  if (input.service === "managed-hosting") {
    notes.push(
      "Hosting includes monitoring, a web application firewall and nightly backups. The uptime SLA depends on your maintenance plan.",
    );
  }

  return {
    currency: "INR",
    total,
    low: roundTo(total * (1 - CONFIDENCE_BAND), 1_000),
    high: roundTo(total * (1 + CONFIDENCE_BAND), 1_000),
    breakdown: {
      base: rate.base,
      scope: scopeCost,
      features: featureCost,
      designUplift: Math.round(designUplift),
      platformUplift: Math.round(platformUplift),
      timelineUplift: Math.round(timelineUplift),
    },
    weeks,
    teamSize,
    milestones,
    monthlyRetainer: input.retainer
      ? Math.max(MIN_RETAINER, roundTo(total * RETAINER_RATE, 500))
      : 0,
    notes,
  };
}

export const DEFAULT_ESTIMATE_INPUT: EstimateInput = {
  service: "web-development",
  scope: 8,
  design: "custom",
  features: ["auth", "seo"],
  timeline: "standard",
  platforms: ["web"],
  retainer: true,
};
