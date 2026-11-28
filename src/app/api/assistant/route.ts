import { clientKey, fail, ok, rateLimitHeaders, readJson } from "@/lib/api";
import { geminiConfigured, askGemini } from "@/lib/gemini";
import { assistantLimiter } from "@/lib/rate-limit";
import { assistantSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const limit = assistantLimiter.consume(clientKey(request, "assistant"));
  const headers = rateLimitHeaders(limit);

  if (!limit.ok) {
    return fail(
      "rate_limited",
      `Too many questions from this connection. Try again in ${limit.retryAfter}s, or message us on WhatsApp.`,
      { headers },
    );
  }

  const body = await readJson(request, assistantSchema);
  if (!body.ok) return body.response;

  if (!geminiConfigured()) return ok({ answer: null }, { headers });

  return ok({ answer: await askGemini(body.value) }, { headers });
}

export async function GET() {
  return fail("bad_request", "This endpoint only accepts POST.");
}
