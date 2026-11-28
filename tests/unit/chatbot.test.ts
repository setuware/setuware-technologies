import { describe, expect, it } from "vitest";

import {
  editDistance,
  EMPTY_LEAD,
  faqReply,
  leadPayload,
  parseBudget,
  validateLead,
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
    expect(text).toContain("₹9,999");
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

describe("enquiry form", () => {
  const valid = {
    name: "Priya Sharma",
    email: "priya@example.com",
    phone: "+91 98765 43210",
    service: "business-websites" as const,
    serviceLabel: "Business websites",
    message: "A new website for our clinic",
  };

  it("accepts a complete draft", () => {
    expect(validateLead(valid)).toEqual({});
  });

  it("flags each fixable field", () => {
    const errors = validateLead({ ...EMPTY_LEAD, name: "P", email: "priya@example.con", phone: "abc", message: "hi" });
    expect(Object.keys(errors).sort()).toEqual(["email", "message", "name", "phone"]);
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

describe("knowledge topics", () => {
  it.each([
    ["Do you sign an NDA?", "nda"],
    ["what tech stack do you use", "stack"],
    ["show me your past work", "work"],
    ["can i pay in installments", "payments"],
    ["Who are you?", "about"],
    ["who is the founder", "founder"],
    ["Do you work with clients outside India?", "location"],
  ])("routes %s to %s", (question, id) => {
    expect(matchIntent(question)).toEqual({ type: "topic", id });
  });

  it("answers an NDA question from the service FAQs", () => {
    expect(replyTo("Will you sign an NDA?").text).toContain("NDA");
  });

  it("shows case-study cards for past work", () => {
    const cards = replyTo("show me your past work").cards ?? [];
    expect(cards.length).toBeGreaterThan(0);
    expect(cards.every((card) => card.kind === "project")).toBe(true);
  });

  it("answers industry questions", () => {
    expect(matchIntent("I run a clinic")).toEqual({ type: "industry", slug: "healthcare-clinics" });
  });

  it("gives a mobile app timeline, not a website one", () => {
    const reply = replyTo("How long does a mobile app take?");
    expect(reply.service).toBe("app-development");
    expect(reply.cards?.[0]).toMatchObject({ kind: "service", slug: "app-development" });
  });
});

describe("conversation context", () => {
  it("answers a follow-up about the service just discussed", () => {
    expect(matchIntent("how much?", { service: "app-development" })).toEqual({
      type: "service-price",
      slug: "app-development",
    });
    expect(matchIntent("how long will it take", { service: "app-development" })).toEqual({
      type: "service-timeline",
      slug: "app-development",
    });
    // A service's own FAQ answers the follow-up when it has one.
    expect(matchIntent("how long will it take", { service: "ecommerce-stores" })).toMatchObject({
      type: "service-faq",
      slug: "ecommerce-stores",
    });
  });

  it("falls back to general pricing without context", () => {
    expect(matchIntent("how much?")).toEqual({ type: "intent", intent: "pricing" });
  });
});

describe("parseBudget", () => {
  it.each([
    ["under 20k", 20_000],
    ["₹1.5 lakh", 150_000],
    ["budget 50,000", 50_000],
    ["Rs 75000", 75_000],
    ["2 crore", 20_000_000],
  ])("reads %s", (input, expected) => {
    expect(parseBudget(input)).toBe(expected);
  });

  it("ignores other currencies and counts", () => {
    expect(parseBudget("$5k budget")).toBeNull();
    expect(parseBudget("store with 2k products")).toBeNull();
    expect(parseBudget("SEO budget ₹15k per month and 4,000 visitors")).toBe(15_000);
    expect(parseBudget("we spent $3k last year, budget now ₹50k")).toBe(50_000);
    expect(parseBudget("store handling 2k monthly orders")).toBeNull();
    expect(parseBudget("$20k–25k")).toBeNull();
    expect(parseBudget("10 lakh AED")).toBeNull();
    expect(parseBudget("we spent ₹2 lakh last time, budget now 50k")).toBe(50_000);
    expect(parseBudget("website budget $5k for 2026")).toBeNull();
    expect(parseBudget("website for 2026 under ₹30k")).toBe(30_000);
    expect(parseBudget("about 5,000 subscribers, my budget is ₹50k")).toBe(50_000);
    expect(parseBudget("50,000 is my website budget")).toBe(50_000);
    expect(parseBudget("business website budget 2000")).toBe(2_000);
    expect(parseBudget("my budget is ₹50k, clients need to book online")).toBe(50_000);
    expect(parseBudget("how long to launch a website around 2027?")).toBeNull();
    expect(parseBudget("Last year we paid ₹10,000 for a site. This time my budget is ₹50,000.")).toBe(50_000);
    expect(parseBudget("We paid ₹10,000 last time. Our budget: ₹50,000")).toBe(50_000);
    expect(parseBudget("How much can I spend? My website budget is 8000")).toBe(8_000);
    expect(parseBudget("website under 2000")).toBe(2_000);
    expect(parseBudget("website budget around 2000")).toBe(2_000);
  });

  it("ignores text without a budget", () => {
    expect(parseBudget("I need a website for 3 branches")).toBeNull();
  });
});

describe("review fixes", () => {
  it("answers a verbatim service FAQ instead of a generic quote", () => {
    expect(matchIntent("Is advertising spend included in your fee?")).toMatchObject({
      type: "service-faq",
      slug: "seo-marketing",
    });
    expect(matchIntent("How long does SEO take to show results?")).toMatchObject({
      type: "service-faq",
      slug: "seo-marketing",
    });
  });

  it("says when a budget only covers the starter build", () => {
    const text = replyTo("business website budget 8000").text;
    expect(text).toContain("starter build");
    expect(text).toContain("₹9,999");
  });

  it("opens industry answers from the industries chips", () => {
    const chips = replyTo("which industries do you work with").chips ?? [];
    expect(chips[0]?.action.kind).toBe("industry");
  });

  it("treats the company name as a name, not a technology question", () => {
    expect(matchIntent("Who founded Setuware Technologies?")).toEqual({ type: "topic", id: "founder" });
  });

  it("does not tie gyms to hospitality", () => {
    const links = replyTo("app for my gym under 20k").links ?? [];
    expect(links.some((link) => link.href.includes("hospitality"))).toBe(false);
  });
});

describe("mobile app pricing", () => {
  it("quotes mobile apps from ₹29,999, not the web-app package price", () => {
    const reply = replyTo("mobile app under 25k");
    expect(reply.text).toContain("₹29,999");
    expect(reply.text).not.toContain("₹19,999");
    expect(reply.cards?.[0]).toMatchObject({ kind: "service", price: "From ₹29,999" });
  });
});
