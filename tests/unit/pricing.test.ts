import { describe, expect, it } from "vitest";

import {
  DEFAULT_ESTIMATE_INPUT,
  DESIGN_TIERS,
  FEATURE_RATES,
  SCOPE_LIMITS,
  SERVICE_RATES,
  TIMELINES,
  estimateProject,
  type EstimateInput,
  type FeatureKey,
  type ServiceKey,
} from "@/lib/pricing";
import { carePlans } from "@/lib/plans";

const base: EstimateInput = {
  service: "web-development",
  scope: 10,
  design: "starter",
  features: [],
  timeline: "standard",
  platforms: ["web"],
  retainer: false,
};

describe("estimateProject", () => {
  it("prices the base service plus its per-unit scope", () => {
    const result = estimateProject(base);
    const rate = SERVICE_RATES["web-development"];

    expect(result.breakdown.base).toBe(rate.base);
    expect(result.breakdown.scope).toBe(10 * rate.perScope);
    // Totals are rounded to the nearest ₹1,000; bases such as ₹49,999 are not.
    expect(result.total).toBe(Math.round((rate.base + 10 * rate.perScope) / 1_000) * 1_000);
    expect(result.currency).toBe("INR");
  });

  it("adds each selected feature exactly once", () => {
    const features: FeatureKey[] = ["auth", "payments"];
    const result = estimateProject({ ...base, features });

    const expected = FEATURE_RATES.auth.cost + FEATURE_RATES.payments.cost;
    expect(result.breakdown.features).toBe(expected);
  });

  it("ignores duplicate and unknown feature keys", () => {
    const tampered = {
      ...base,
      features: ["auth", "auth", "not-a-feature"] as unknown as FeatureKey[],
    };

    expect(estimateProject(tampered).breakdown.features).toBe(
      FEATURE_RATES.auth.cost,
    );
  });

  it("applies the design multiplier on top of build cost", () => {
    const starter = estimateProject(base);
    const premium = estimateProject({ ...base, design: "premium" });

    expect(premium.total).toBeGreaterThan(starter.total);
    // Both totals are rounded to the nearest ₹1,000, so compare against the
    // unrounded build cost and allow one rounding step.
    const rate = SERVICE_RATES[base.service];
    const buildCost = rate.base + base.scope * rate.perScope;
    expect(
      Math.abs(premium.total - buildCost * DESIGN_TIERS.premium.multiplier),
    ).toBeLessThanOrEqual(500);
  });

  it("charges more and delivers sooner on an accelerated timeline", () => {
    const standard = estimateProject(base);
    const fast = estimateProject({ ...base, timeline: "accelerated" });

    expect(fast.total).toBeGreaterThan(standard.total);
    expect(fast.weeks).toBeLessThan(standard.weeks);
    expect(TIMELINES.accelerated.multiplier).toBeGreaterThan(1);
  });

  it("discounts a flexible timeline", () => {
    const relaxed = estimateProject({ ...base, timeline: "relaxed" });
    expect(relaxed.total).toBeLessThan(estimateProject(base).total);
  });

  it("adds a platform uplift only for services that support platforms", () => {
    const webOnly = estimateProject({ ...base, service: "app-development" });
    const multi = estimateProject({
      ...base,
      service: "app-development",
      platforms: ["ios", "android"],
    });

    expect(multi.breakdown.platformUplift).toBeGreaterThan(0);
    expect(multi.total).toBeGreaterThan(webOnly.total);
  });

  it("ignores platforms for services that do not support them", () => {
    const result = estimateProject({
      ...base,
      service: "managed-hosting",
      platforms: ["ios", "android", "web"],
    });

    expect(result.breakdown.platformUplift).toBe(0);
  });

  it("falls back to a single platform when none are selected", () => {
    const result = estimateProject({
      ...base,
      service: "app-development",
      platforms: [],
    });

    expect(result.breakdown.platformUplift).toBe(0);
  });

  it("clamps scope to the published limits", () => {
    const tooSmall = estimateProject({ ...base, scope: -50 });
    const tooLarge = estimateProject({ ...base, scope: 9_999 });
    const rate = SERVICE_RATES["web-development"];

    expect(tooSmall.breakdown.scope).toBe(SCOPE_LIMITS.min * rate.perScope);
    expect(tooLarge.breakdown.scope).toBe(SCOPE_LIMITS.max * rate.perScope);
  });

  it("survives NaN scope rather than producing NaN money", () => {
    const result = estimateProject({ ...base, scope: Number.NaN });

    expect(Number.isFinite(result.total)).toBe(true);
    expect(result.total).toBeGreaterThan(0);
  });

  it("falls back to known defaults for unrecognised enum values", () => {
    const result = estimateProject({
      ...base,
      service: "mind-reading" as unknown as ServiceKey,
      design: "platinum" as unknown as EstimateInput["design"],
      timeline: "yesterday" as unknown as EstimateInput["timeline"],
    });

    expect(result.breakdown.base).toBe(SERVICE_RATES["web-development"].base);
    expect(Number.isFinite(result.total)).toBe(true);
  });

  it("produces a confidence band that brackets the mid-point", () => {
    const result = estimateProject(base);

    expect(result.low).toBeLessThan(result.total);
    expect(result.high).toBeGreaterThan(result.total);
  });

  it("splits milestones to roughly the total", () => {
    const result = estimateProject({ ...base, features: ["auth", "cms"] });
    const sum = result.milestones.reduce((total, m) => total + m.amount, 0);

    expect(result.milestones).toHaveLength(4);
    // Each milestone rounds to ₹500, so allow for accumulated rounding.
    expect(Math.abs(sum - result.total)).toBeLessThanOrEqual(2_000);
  });

  it("charges a retainer only when asked, never below the floor", () => {
    expect(estimateProject(base).monthlyRetainer).toBe(0);

    const cheapest = estimateProject({
      ...base,
      service: "managed-hosting",
      scope: 1,
      retainer: true,
    });
    expect(cheapest.monthlyRetainer).toBeGreaterThanOrEqual(carePlans[0].monthly ?? 0);
  });

  it("keeps the team size within a staffable range", () => {
    const tiny = estimateProject({ ...base, scope: 1 });
    const huge = estimateProject({
      ...base,
      scope: SCOPE_LIMITS.max,
      timeline: "accelerated",
      features: Object.keys(FEATURE_RATES) as FeatureKey[],
    });

    expect(tiny.teamSize).toBeGreaterThanOrEqual(2);
    expect(huge.teamSize).toBeLessThanOrEqual(9);
  });

  it("never quotes under a week", () => {
    const result = estimateProject({
      ...base,
      service: "support-maintenance",
      scope: 1,
      timeline: "accelerated",
    });

    expect(result.weeks).toBeGreaterThanOrEqual(1);
  });

  it("is deterministic for identical input", () => {
    expect(estimateProject(base)).toEqual(estimateProject({ ...base }));
  });

  it("rounds the headline figure to the nearest thousand", () => {
    for (const service of Object.keys(SERVICE_RATES) as ServiceKey[]) {
      const result = estimateProject({ ...base, service, design: "premium" });
      expect(result.total % 1_000).toBe(0);
    }
  });

  it("surfaces a note when payments are selected", () => {
    const result = estimateProject({ ...base, features: ["payments"] });
    expect(result.notes.join(" ")).toMatch(/KYC/i);
  });

  it("prices the shipped default configuration sensibly", () => {
    const result = estimateProject(DEFAULT_ESTIMATE_INPUT);

    expect(result.total).toBeGreaterThan(100_000);
    expect(result.weeks).toBeGreaterThan(1);
    expect(result.monthlyRetainer).toBeGreaterThan(0);
  });
});
