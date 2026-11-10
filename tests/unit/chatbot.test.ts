import { describe, expect, it } from "vitest";

import {
  advanceLead,
  editDistance,
  EMPTY_LEAD,
  faqReply,
  leadPayload,
  matchIntent,
  normalise,
  pricingReply,
  replyTo,
  serviceReply,
  whatsappHref,
  wordMatches,
} from "@/components/interactive/chatbot/engine";
import { isWithinHours } from "@/components/interactive/chatbot/constants";
import { faqs } from "@/lib/content";
import { contactSchema } from "@/lib/validation";

describe("chatbot text helpers", () => {
  it("normalises case, punctuation and the rupee sign", () => {
    expect(normalise("  What's the PRICE?? ₹5000 ")).toBe("whats the price ₹ 5000");
  });

  it("measures typos, counting a swap as one edit", () => {
    expect(editDistance("webiste", "website")).toBe(1);
    expect(editDistance("shopfy", "shopify")).toBe(1);
    expect(editDistance("abc", "xyzuvw", 1)).toBeGreaterThan(1);
  });

  it("matches prefixes and single typos but not unrelated short words", () => {
    expect(wordMatches("pricing", "pricing")).toBe(true);
    expect(wordMatches("costing", "cost")).toBe(true);
    expect(wordMatches("webiste", "website")).toBe(true);
    expect(wordMatches("cat", "cart")).toBe(false);
    expect(wordMatches("ap", "app")).toBe(false);
  });
});

describe("matchIntent", () => {
  it.each([
    ["price", { type: "intent", intent: "pricing" }],
    ["What does it cost?", { type: "intent", intent: "pricing" }],
    ["pricing please", { type: "intent", intent: "pricing" }],
    ["Do you have any jobs?", { type: "intent", intent: "careers" }],
    ["job", { type: "intent", intent: "careers" }],
    ["internship openings", { type: "intent", intent: "careers" }],
    ["support", { type: "intent", intent: "support" }],
    ["I am an existing client and found a bug", { type: "intent", intent: "support" }],
    ["timeline", { type: "intent", intent: "timelines" }],
    ["Can I talk on WhatsApp", { type: "intent", intent: "whatsapp" }],
    ["I would like to book a consultation", { type: "intent", intent: "book-call" }],
    ["What are your office hours?", { type: "intent", intent: "contact" }],
    ["hello", { type: "intent", intent: "greeting" }],
  ] as const)("%s", (input, expected) => {
    expect(matchIntent(input)).toEqual(expected);
  });

  it.each([
    ["website", "business-websites"],
    ["I need a webiste", "business-websites"],
    ["app", "app-development"],
    ["Android and iOS apps", "app-development"],
    ["a web app for my clients", "web-development"],
    ["seo", "seo-marketing"],
    ["shopify", "ecommerce-stores"],
    ["Shopfy store", "ecommerce-stores"],
    ["ERP for my factory", "custom-software"],
    ["AI chatbot", "ai-integration"],
    ["SSL for our server", "managed-hosting"],
    ["logo and branding", "product-design"],
  ] as const)("routes %s to a service", (input, slug) => {
    expect(matchIntent(input)).toEqual({ type: "service", slug });
  });

  it("answers a price question for the service it mentions", () => {
    expect(matchIntent("app cost")).toEqual({ type: "service-price", slug: "app-development" });
    expect(matchIntent("price of a shopify store")).toEqual({
      type: "service-price",
      slug: "ecommerce-stores",
    });
  });

  it("answers a timeline question for the service it mentions", () => {
    expect(matchIntent("how long for a mobile app")).toEqual({
      type: "service-timeline",
      slug: "app-development",
    });
  });

  it("prefers a near-verbatim FAQ", () => {
    expect(matchIntent("domain and hosting")).toEqual({
      type: "faq",
      index: faqs.findIndex((faq) => faq.question.includes("hosting")),
    });
    const index = (fragment: string) => faqs.findIndex((faq) => faq.question.includes(fragment));
    expect(matchIntent("Who owns the code?")).toEqual({ type: "faq", index: index("own") });
    expect(matchIntent("can I update the website myself")).toEqual({
      type: "faq",
      index: index("update"),
    });
    expect(matchIntent("will my site rank on google")).toEqual({ type: "faq", index: index("rank") });
  });

  it("falls back politely when nothing matches", () => {
    expect(matchIntent("qwerty zxcv")).toEqual({ type: "none" });
    expect(matchIntent("   ")).toEqual({ type: "none" });
    const reply = replyTo("qwerty zxcv");
    expect(reply.text).toMatch(/connect you with our team/);
    expect(reply.chips?.map((chip) => chip.label)).toContain("Book a free call");
  });
});

describe("answers", () => {
  it("quotes the published package prices in rupees", () => {
    const { text } = pricingReply();
    expect(text).toContain("₹4,999");
    expect(text).toContain("₹14,999");
    expect(text).toContain("₹34,999");
    expect(text).toMatch(/Enterprise[^\n]*quoted/);
  });

  it("links a service answer to its page", () => {
    const reply = serviceReply("seo-marketing");
    expect(reply.links?.[0]?.href).toBe("/services/seo-marketing");
    expect(reply.text).toMatch(/₹/);
  });

  it("returns FAQ answers verbatim", () => {
    expect(faqReply(0).text).toBe(faqs[0].answer);
  });

  it("never uses exclamation marks", () => {
    for (const input of ["price", "job", "support", "hello", "website", "timeline", "zzz", "whatsapp", "book a call", "contact"]) {
      expect(replyTo(input).text).not.toContain("!");
    }
  });

  it("prefills the WhatsApp message", () => {
    expect(whatsappHref).toBe(
      "https://wa.me/917091298828?text=Hello%20Setuware%20Technologies%2C%20I'd%20like%20to%20discuss%20a%20project.",
    );
  });
});

describe("enquiry flow", () => {
  it("accepts a phone number first, then asks for an email", () => {
    let step = advanceLead("name", "Priya Sharma", EMPTY_LEAD);
    expect(step.next).toBe("contact");
    step = advanceLead("contact", "+91 98765 43210", step.draft);
    expect(step.next).toBe("email");
    expect(step.draft.phone).toBe("+91 98765 43210");
    step = advanceLead("email", "Priya@Example.com", step.draft);
    expect(step.next).toBe("service");
    expect(step.draft.email).toBe("priya@example.com");
  });

  it("goes from an email to the optional phone step", () => {
    const step = advanceLead("contact", "priya@example.com", { ...EMPTY_LEAD, name: "Priya" });
    expect(step.next).toBe("phone");
  });

  it("rejects invalid answers without moving on", () => {
    expect(advanceLead("name", "P", EMPTY_LEAD).error).toBeDefined();
    expect(advanceLead("contact", "not sure", EMPTY_LEAD).error).toBeDefined();
    expect(advanceLead("email", "priya@example.con", EMPTY_LEAD).error).toBeDefined();
    expect(advanceLead("message", "hi", EMPTY_LEAD).next).toBe("message");
  });

  it("builds a payload the contact API accepts", () => {
    const payload = leadPayload(
      {
        name: "Priya Sharma",
        email: "priya@example.com",
        phone: "",
        service: "business-websites",
        serviceLabel: "Business websites",
        message: "A new site",
      },
      5_000,
    );
    const parsed = contactSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
    expect(payload.message).toContain("Business websites");
  });
});

describe("isWithinHours", () => {
  it("follows Mon–Sat, 10:00–19:00 IST", () => {
    expect(isWithinHours(new Date("2026-11-02T06:00:00Z"))).toBe(true); // Mon 11:30 IST
    expect(isWithinHours(new Date("2026-11-02T14:00:00Z"))).toBe(false); // Mon 19:30 IST
    expect(isWithinHours(new Date("2026-11-01T06:00:00Z"))).toBe(false); // Sunday
  });
});
