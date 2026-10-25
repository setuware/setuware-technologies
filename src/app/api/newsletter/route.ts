import { clientKey, fail, looksLikeSpam, ok, rateLimitHeaders, readJson } from "@/lib/api";
import { deliverLead } from "@/lib/leads";
import { newsletterLimiter } from "@/lib/rate-limit";
import { newsletterSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const limit = newsletterLimiter.consume(clientKey(request, "newsletter"));
  const headers = rateLimitHeaders(limit);

  if (!limit.ok) {
    return fail(
      "rate_limited",
      `Too many attempts. Try again in ${limit.retryAfter}s.`,
      { headers },
    );
  }

  const body = await readJson(request, newsletterSchema);
  if (!body.ok) return body.response;

  if (looksLikeSpam(body.value)) {
    return ok({ email: body.value.email }, { status: 201, message: "You're on the list." });
  }

  const { honeypot: _honeypot, ...lead } = body.value;
  await deliverLead("newsletter", lead);

  // Subscribing twice is not an error worth surfacing — the same confirmation
  // keeps the endpoint from leaking who is already on the list.
  return ok(
    { email: body.value.email },
    {
      status: 201,
      message: "You're on the list. One email a month, unsubscribe any time.",
      headers,
    },
  );
}

export async function GET() {
  return fail("bad_request", "This endpoint only accepts POST.");
}
