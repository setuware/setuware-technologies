import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST as contactPost, GET as contactGet } from "@/app/api/contact/route";
import { POST as newsletterPost } from "@/app/api/newsletter/route";
import { POST as estimatePost } from "@/app/api/estimate/route";
import {
  contactLimiter,
  estimateLimiter,
  newsletterLimiter,
} from "@/lib/rate-limit";

/**
 * Route handlers are exercised directly with a `Request`, which is all the
 * App Router passes them. No server is started, so these stay fast enough to
 * run on every save.
 */

let ip = 0;

function post(url: string, body: unknown, headers: Record<string, string> = {}) {
  // A fresh IP per request keeps the shared limiters from bleeding between
  // tests; rate-limit behaviour is asserted explicitly where it matters.
  ip += 1;
  return new Request(`https://setuwaresoftware.in${url}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-real-ip": `203.0.113.${ip % 250}`,
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const validContact = {
  name: "Priya Sharma",
  email: "priya@example.com",
  message: "We need an ordering platform for 14 retail stores.",
  consent: true,
  elapsedMs: 30_000,
};

const validEstimate = {
  name: "Priya Sharma",
  email: "priya@example.com",
  input: {
    service: "web-development",
    scope: 10,
    design: "custom",
    features: ["auth"],
    timeline: "standard",
    platforms: ["web"],
    retainer: true,
  },
};

beforeEach(() => {
  contactLimiter.reset();
  newsletterLimiter.reset();
  estimateLimiter.reset();
  // Lead delivery logs by design; keep the test output readable.
  vi.spyOn(console, "info").mockImplementation(() => {});
  delete process.env.LEAD_WEBHOOK_URL;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST /api/contact", () => {
  it("accepts a valid enquiry and returns a reference", async () => {
    const response = await contactPost(post("/api/contact", validContact));
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.ok).toBe(true);
    expect(payload.data.reference).toMatch(/^STW-[A-Z0-9]{6}$/);
  });

  it("returns field errors for an invalid enquiry", async () => {
    const response = await contactPost(
      post("/api/contact", { ...validContact, email: "nope", message: "hi" }),
    );
    const payload = await response.json();

    expect(response.status).toBe(422);
    expect(payload.error.code).toBe("validation_failed");
    expect(payload.error.fields.email).toBeDefined();
    expect(payload.error.fields.message).toBeDefined();
  });

  it("rejects a body that is not JSON", async () => {
    const response = await contactPost(post("/api/contact", "{broken"));
    expect(response.status).toBe(400);
  });

  it("rejects an oversized body", async () => {
    const response = await contactPost(
      post("/api/contact", { ...validContact, message: "x".repeat(60_000) }),
    );

    expect(response.status).toBe(413);
  });

  it("silently accepts an obvious bot without delivering it", async () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    const response = await contactPost(
      post("/api/contact", { ...validContact, honeypot: "", elapsedMs: 10 }),
    );
    const payload = await response.json();

    // Looks like success to the bot, but nothing was forwarded.
    expect(response.status).toBe(201);
    expect(payload.data.reference).toBe("STW-000000");
    expect(infoSpy).not.toHaveBeenCalled();
  });

  it("rate-limits repeated submissions from one client", async () => {
    const headers = { "x-real-ip": "198.51.100.7" };
    const statuses: number[] = [];

    for (let i = 0; i < 7; i += 1) {
      const response = await contactPost(post("/api/contact", validContact, headers));
      statuses.push(response.status);
    }

    expect(statuses.filter((status) => status === 201)).toHaveLength(5);
    expect(statuses.at(-1)).toBe(429);
  });

  it("sets rate-limit headers, including retry-after when blocked", async () => {
    const headers = { "x-real-ip": "198.51.100.8" };
    let last: Response | undefined;

    for (let i = 0; i < 6; i += 1) {
      last = await contactPost(post("/api/contact", validContact, headers));
    }

    expect(last?.headers.get("x-ratelimit-limit")).toBe("5");
    expect(last?.headers.get("retry-after")).toBeTruthy();
  });

  it("never exposes submissions over GET", async () => {
    const response = await contactGet();
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
    expect(JSON.stringify(payload)).not.toMatch(/priya@example\.com/);
  });

  it("does not log the raw email address", async () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    await contactPost(post("/api/contact", validContact));

    const logged = JSON.stringify(infoSpy.mock.calls);
    expect(logged).not.toContain("priya@example.com");
    expect(logged).toContain("pr***@example.com");
  });
});

describe("POST /api/newsletter", () => {
  it("subscribes a valid address", async () => {
    const response = await newsletterPost(
      post("/api/newsletter", { email: "reader@example.com" }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({ ok: true });
  });

  it("rejects an invalid address", async () => {
    const response = await newsletterPost(post("/api/newsletter", { email: "nope" }));
    expect(response.status).toBe(422);
  });

  it("gives the same answer for a repeat subscribe, leaking no membership", async () => {
    const headers = { "x-real-ip": "198.51.100.20" };
    const first = await newsletterPost(
      post("/api/newsletter", { email: "twice@example.com" }, headers),
    );
    const second = await newsletterPost(
      post("/api/newsletter", { email: "twice@example.com" }, headers),
    );

    expect(first.status).toBe(second.status);
    await expect(first.json()).resolves.toEqual(await second.json());
  });
});

describe("POST /api/estimate", () => {
  it("recomputes the quote server-side rather than trusting the client", async () => {
    const response = await estimatePost(
      post("/api/estimate", {
        ...validEstimate,
        // A tampered client could send anything here; it must be ignored.
        quote: { total: 1 },
        total: 1,
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.data.total).toBeGreaterThan(100_000);
  });

  it("rejects a service that is not on the rate card", async () => {
    const response = await estimatePost(
      post("/api/estimate", {
        ...validEstimate,
        input: { ...validEstimate.input, service: "time-travel" },
      }),
    );

    expect(response.status).toBe(422);
  });

  it("rejects a scope outside the published limits", async () => {
    const response = await estimatePost(
      post("/api/estimate", {
        ...validEstimate,
        input: { ...validEstimate.input, scope: 100_000 },
      }),
    );

    expect(response.status).toBe(422);
  });

  it("requires contact details before sending a quote", async () => {
    const response = await estimatePost(
      post("/api/estimate", { input: validEstimate.input }),
    );

    expect(response.status).toBe(422);
  });
});

describe("lead delivery", () => {
  it("still succeeds for the visitor when the webhook fails", async () => {
    process.env.LEAD_WEBHOOK_URL = "https://hooks.example.com/leads";
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("connect ECONNREFUSED")),
    );

    const response = await contactPost(post("/api/contact", validContact));

    expect(response.status).toBe(201);
    vi.unstubAllGlobals();
  });

  it("posts the lead to the configured webhook", async () => {
    process.env.LEAD_WEBHOOK_URL = "https://hooks.example.com/leads";
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await contactPost(post("/api/contact", validContact));

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://hooks.example.com/leads");
    expect(JSON.parse(init.body as string)).toMatchObject({
      kind: "contact",
      payload: { email: "priya@example.com" },
    });
    vi.unstubAllGlobals();
  });
});
