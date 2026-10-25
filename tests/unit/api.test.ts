import { describe, expect, it } from "vitest";
import { z } from "zod";

import { MAX_BODY_BYTES, clientKey, fail, looksLikeSpam, ok, readJson } from "@/lib/api";

const schema = z.object({ name: z.string().min(2) });

function jsonRequest(body: string, headers: Record<string, string> = {}) {
  return new Request("https://example.com/api/test", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body,
  });
}

describe("ok / fail envelopes", () => {
  it("returns a success envelope that is never cached", async () => {
    const response = ok({ id: 1 }, { status: 201, message: "Created" });

    expect(response.status).toBe(201);
    expect(response.headers.get("cache-control")).toContain("no-store");
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: { id: 1 },
      message: "Created",
    });
  });

  it("maps each error code to its HTTP status", async () => {
    expect(fail("validation_failed", "x").status).toBe(422);
    expect(fail("rate_limited", "x").status).toBe(429);
    expect(fail("payload_too_large", "x").status).toBe(413);
    expect(fail("unsupported_media_type", "x").status).toBe(415);
    expect(fail("invalid_json", "x").status).toBe(400);
    expect(fail("server_error", "x").status).toBe(500);
  });

  it("includes field errors when supplied", async () => {
    const response = fail("validation_failed", "Check fields", {
      fields: { name: "Too short" },
    });

    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: {
        code: "validation_failed",
        message: "Check fields",
        fields: { name: "Too short" },
      },
    });
  });
});

describe("readJson", () => {
  it("parses and validates a good body", async () => {
    const result = await readJson(jsonRequest('{"name":"Priya"}'), schema);

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.name).toBe("Priya");
  });

  it("rejects a non-JSON content type", async () => {
    const request = new Request("https://example.com/api/test", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: "name=Priya",
    });

    const result = await readJson(request, schema);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(415);
  });

  it("rejects an empty body with a distinct message", async () => {
    const result = await readJson(jsonRequest("   "), schema);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(400);
      const payload = await result.response.json();
      expect(payload.error.code).toBe("bad_request");
    }
  });

  it("distinguishes malformed JSON from a validation failure", async () => {
    const malformed = await readJson(jsonRequest("{nope"), schema);
    const invalid = await readJson(jsonRequest('{"name":"a"}'), schema);

    expect(malformed.ok).toBe(false);
    expect(invalid.ok).toBe(false);
    if (!malformed.ok) {
      expect((await malformed.response.json()).error.code).toBe("invalid_json");
    }
    if (!invalid.ok) {
      const payload = await invalid.response.json();
      expect(payload.error.code).toBe("validation_failed");
      expect(payload.error.fields.name).toBeDefined();
    }
  });

  it("rejects an oversized body declared in content-length", async () => {
    const result = await readJson(jsonRequest('{"name":"Priya"}', {
      "content-length": String(MAX_BODY_BYTES + 1),
    }), schema);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(413);
  });

  it("rejects an oversized body even when content-length lies", async () => {
    const huge = JSON.stringify({ name: "x".repeat(MAX_BODY_BYTES + 100) });
    const result = await readJson(jsonRequest(huge, { "content-length": "10" }), schema);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(413);
  });

  it("honours a custom byte cap", async () => {
    const result = await readJson(jsonRequest('{"name":"Priya"}'), schema, {
      maxBytes: 4,
    });

    expect(result.ok).toBe(false);
  });

  it("accepts a content type with a charset parameter", async () => {
    const result = await readJson(
      jsonRequest('{"name":"Priya"}', {
        "content-type": "application/json; charset=utf-8",
      }),
      schema,
    );

    expect(result.ok).toBe(true);
  });
});

describe("clientKey", () => {
  const make = (headers: Record<string, string>) =>
    new Request("https://example.com", { headers });

  it("prefers the CDN-provided client IP", () => {
    const key = clientKey(
      make({ "cf-connecting-ip": "1.1.1.1", "x-forwarded-for": "2.2.2.2" }),
      "contact",
    );

    expect(key).toBe("contact:1.1.1.1");
  });

  it("takes the first hop from x-forwarded-for", () => {
    const key = clientKey(
      make({ "x-forwarded-for": "3.3.3.3, 10.0.0.1, 10.0.0.2" }),
      "contact",
    );

    expect(key).toBe("contact:3.3.3.3");
  });

  it("falls back to a user-agent fingerprint rather than one shared bucket", () => {
    const key = clientKey(make({ "user-agent": "curl/8" }), "contact");
    expect(key).toBe("contact:ua:curl/8");
  });

  it("namespaces by scope so endpoints do not share a budget", () => {
    const request = make({ "x-real-ip": "9.9.9.9" });
    expect(clientKey(request, "contact")).not.toBe(clientKey(request, "newsletter"));
  });
});

describe("looksLikeSpam", () => {
  it("flags a filled honeypot", () => {
    expect(looksLikeSpam({ honeypot: "http://spam" })).toBe(true);
  });

  it("flags an implausibly fast submission", () => {
    expect(looksLikeSpam({ elapsedMs: 200 })).toBe(true);
  });

  it("passes a normal human submission", () => {
    expect(looksLikeSpam({ honeypot: "", elapsedMs: 14_000 })).toBe(false);
    expect(looksLikeSpam({})).toBe(false);
  });
});
