import { clientKey, fail, looksLikeSpam, ok, rateLimitHeaders, readJson } from "@/lib/api";
import { deliverLead } from "@/lib/leads";
import { contactLimiter } from "@/lib/rate-limit";
import { contactSchema } from "@/lib/validation";

/**
 * Project enquiries.
 *
 * There is deliberately no GET: submissions are forwarded, never stored and
 * read back. Rate limiting comes before parsing so a flood costs us a map
 * lookup rather than a JSON parse.
 */
export async function POST(request: Request) {
  const limit = contactLimiter.consume(clientKey(request, "contact"));
  const headers = rateLimitHeaders(limit);

  if (!limit.ok) {
    return fail(
      "rate_limited",
      `Too many enquiries from this connection. Try again in ${limit.retryAfter}s, or email us directly.`,
      { headers },
    );
  }

  const body = await readJson(request, contactSchema);
  if (!body.ok) return body.response;

  // Silent success for obvious bots: telling a script it was detected only
  // helps it adapt, and a real visitor can never reach this branch.
  if (looksLikeSpam(body.value)) {
    return ok({ reference: "STW-000000" }, { status: 201, message: "Thanks — we'll be in touch." });
  }

  const { honeypot: _honeypot, elapsedMs: _elapsedMs, ...lead } = body.value;
  const result = await deliverLead("contact", lead);

  return ok(
    { reference: result.reference },
    {
      status: 201,
      message: "Thanks — your brief is with us.",
      headers,
    },
  );
}

/** Explicit, so a stray GET returns a clear error instead of a 405 from nowhere. */
export async function GET() {
  return fail("bad_request", "This endpoint only accepts POST.");
}
