import { describe, expect, it } from "vitest";

import {
  contactSchema,
  estimateRequestSchema,
  fieldErrors,
  newsletterSchema,
} from "@/lib/validation";

const validContact = {
  name: "Priya Sharma",
  email: "priya@example.com",
  message: "We run 14 retail stores and need an ordering platform.",
  consent: true as const,
};

describe("contactSchema", () => {
  it("accepts a minimal valid enquiry", () => {
    expect(contactSchema.safeParse(validContact).success).toBe(true);
  });

  it("requires explicit consent", () => {
    const result = contactSchema.safeParse({ ...validContact, consent: false });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(fieldErrors(result.error).consent).toMatch(/privacy policy/i);
    }
  });

  it("rejects a message that is too short to act on", () => {
    const result = contactSchema.safeParse({ ...validContact, message: "hi" });
    expect(result.success).toBe(false);
  });

  it("trims and lowercases the email", () => {
    const result = contactSchema.parse({
      ...validContact,
      email: "  Priya@Example.COM  ",
    });

    expect(result.email).toBe("priya@example.com");
  });

  it("catches the .con typo specifically", () => {
    const result = contactSchema.safeParse({
      ...validContact,
      email: "priya@example.con",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(fieldErrors(result.error).email).toMatch(/\.com/);
    }
  });

  it("rejects an oversized message instead of accepting unbounded input", () => {
    const result = contactSchema.safeParse({
      ...validContact,
      message: "x".repeat(5_000),
    });

    expect(result.success).toBe(false);
  });

  it("allows an empty optional phone but rejects a malformed one", () => {
    expect(contactSchema.safeParse({ ...validContact, phone: "" }).success).toBe(true);
    expect(
      contactSchema.safeParse({ ...validContact, phone: "+91 98765 43210" }).success,
    ).toBe(true);
    expect(
      contactSchema.safeParse({ ...validContact, phone: "not a phone" }).success,
    ).toBe(false);
  });

  it("rejects a filled honeypot", () => {
    const result = contactSchema.safeParse({ ...validContact, honeypot: "bot" });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown budget bucket", () => {
    const result = contactSchema.safeParse({ ...validContact, budget: "infinite" });
    expect(result.success).toBe(false);
  });
});

describe("newsletterSchema", () => {
  it("accepts a plain email", () => {
    expect(newsletterSchema.safeParse({ email: "a@b.com" }).success).toBe(true);
  });

  it("rejects a missing or malformed email", () => {
    expect(newsletterSchema.safeParse({}).success).toBe(false);
    expect(newsletterSchema.safeParse({ email: "nope" }).success).toBe(false);
  });
});

describe("estimateRequestSchema", () => {
  const validEstimate = {
    input: {
      service: "web-development",
      scope: 8,
      design: "custom",
      features: ["auth"],
      timeline: "standard",
      platforms: ["web"],
      retainer: true,
    },
    name: "Priya",
    email: "priya@example.com",
  };

  it("accepts a well-formed quote request", () => {
    expect(estimateRequestSchema.safeParse(validEstimate).success).toBe(true);
  });

  it("rejects a service that is not on the rate card", () => {
    const result = estimateRequestSchema.safeParse({
      ...validEstimate,
      input: { ...validEstimate.input, service: "time-travel" },
    });

    expect(result.success).toBe(false);
  });

  it("rejects a scope outside the published limits", () => {
    const result = estimateRequestSchema.safeParse({
      ...validEstimate,
      input: { ...validEstimate.input, scope: 10_000 },
    });

    expect(result.success).toBe(false);
  });

  it("coerces a numeric string scope", () => {
    const result = estimateRequestSchema.parse({
      ...validEstimate,
      input: { ...validEstimate.input, scope: "12" },
    });

    expect(result.input.scope).toBe(12);
  });

  it("defaults features and platforms when omitted", () => {
    const result = estimateRequestSchema.parse({
      ...validEstimate,
      input: {
        service: "web-development",
        scope: 5,
        design: "starter",
        timeline: "standard",
      },
    });

    expect(result.input.features).toEqual([]);
    expect(result.input.platforms).toEqual(["web"]);
    expect(result.input.retainer).toBe(false);
  });
});

describe("fieldErrors", () => {
  it("maps the first issue per field", () => {
    const result = contactSchema.safeParse({ name: "a", email: "x", consent: false });

    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = fieldErrors(result.error);
      expect(Object.keys(errors)).toEqual(
        expect.arrayContaining(["name", "email", "consent"]),
      );
    }
  });
});
