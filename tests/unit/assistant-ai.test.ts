import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET as assistantGet, POST as assistantPost } from "@/app/api/assistant/route";
import { assistantKnowledge } from "@/lib/assistant-knowledge";
import { askGemini, geminiConfigured } from "@/lib/gemini";
import { assistantLimiter } from "@/lib/rate-limit";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function post(body: unknown, headers: Record<string, string> = {}) {
  return new Request("https://setuware.in/api/assistant", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  assistantLimiter.reset();
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("assistantKnowledge", () => {
  it("contains facts from the existing company and service data", () => {
    const knowledge = assistantKnowledge();

    expect(knowledge).toContain("₹29,999");
    expect(knowledge).toContain("Satyam Raj");
    expect(knowledge).toContain("MG Road");
    expect(knowledge).toContain("NDA");
    expect(knowledge).not.toContain("₹0");
  });
});

describe("askGemini", () => {
  it("uses the default model and maps two-turn history for Gemini", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse({
        candidates: [{ content: { parts: [{ text: "**Yes**\n* a" }] } }],
      }),
    );
    const answer = await askGemini(
      {
        question: "Can you help?",
        history: [
          { role: "user", text: "Hello" },
          { role: "bot", text: "Hi" },
        ],
      },
      { env: { GEMINI_API_KEY: "test-key" }, fetchImpl },
    );

    expect(String(fetchImpl.mock.calls[0]?.[0])).toContain(
      "gemini-2.5-flash:generateContent",
    );
    expect(new Headers(fetchImpl.mock.calls[0]?.[1]?.headers).get("x-goog-api-key")).toBe(
      "test-key",
    );
    const body = JSON.parse(String(fetchImpl.mock.calls[0]?.[1]?.body));
    expect(body.contents.map((turn: { role: string }) => turn.role)).toEqual([
      "user",
      "model",
      "user",
    ]);
    expect(body.systemInstruction.parts[0].text).toContain("KNOWLEDGE");
    expect(body.systemInstruction.parts[0].text).toContain("₹29,999");
    expect(answer).toBe("Yes\n• a");
  });

  it("uses the configured model override", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse({ candidates: [{ content: { parts: [{ text: "Answer" }] } }] }),
    );

    await askGemini(
      { question: "Hi" },
      { env: { GEMINI_API_KEY: "test-key", GEMINI_MODEL: "gemini-test" }, fetchImpl },
    );

    expect(String(fetchImpl.mock.calls[0]?.[0])).toContain("gemini-test:generateContent");
  });

  it("returns null for non-ok responses, fetch failures, and empty candidates", async () => {
    const failedResponse = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({}, 500));
    const failedFetch = vi.fn<typeof fetch>().mockRejectedValue(new Error("network failure"));
    const emptyResponse = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ candidates: [] }));

    await expect(
      askGemini({ question: "Hi" }, { env: { GEMINI_API_KEY: "test-key" }, fetchImpl: failedResponse }),
    ).resolves.toBeNull();
    await expect(
      askGemini({ question: "Hi" }, { env: { GEMINI_API_KEY: "test-key" }, fetchImpl: failedFetch }),
    ).resolves.toBeNull();
    await expect(
      askGemini({ question: "Hi" }, { env: { GEMINI_API_KEY: "test-key" }, fetchImpl: emptyResponse }),
    ).resolves.toBeNull();
  });

  it("requires a non-empty API key", () => {
    expect(geminiConfigured({ GEMINI_API_KEY: "  " })).toBe(false);
    expect(geminiConfigured({ GEMINI_API_KEY: " key " })).toBe(true);
  });
});

describe("POST /api/assistant", () => {
  it("returns a null answer when Gemini is not configured", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");

    const response = await assistantPost(post({ question: "What do you build?" }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      data: { answer: null },
    });
  });

  it("rate-limits the 31st question from the same connection", async () => {
    const headers = { "x-forwarded-for": "198.51.100.25" };
    const responses = [];

    for (let request = 0; request < 31; request += 1) {
      responses.push(await assistantPost(post({ question: "Question?" }, headers)));
    }

    expect(responses[30]?.status).toBe(429);
    expect(responses[30]?.headers.get("retry-after")).toBeTruthy();
  });

  it("rejects invalid request bodies", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");

    const response = await assistantPost(post({ question: "   " }));

    expect(response.status).toBe(422);
  });

  it("rejects GET requests", async () => {
    expect((await assistantGet()).status).toBe(400);
  });
});
