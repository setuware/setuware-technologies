import { clientKey, fail, looksLikeSpam, ok, rateLimitHeaders, readJson } from "@/lib/api";
import { deliverLead } from "@/lib/leads";
import { estimateProject } from "@/lib/pricing";
import { estimateLimiter } from "@/lib/rate-limit";
import { estimateRequestSchema } from "@/lib/validation";

/**
 * Emails a quote.
 *
 * The price is recomputed here from the validated configuration rather than
 * trusted from the request, so a tampered payload cannot make us record a
 * number we never quoted.
 */
export async function POST(request: Request) {
  const limit = estimateLimiter.consume(clientKey(request, "estimate"));
  const headers = rateLimitHeaders(limit);

  if (!limit.ok) {
    return fail(
      "rate_limited",
      `Too many quote requests. Try again in ${limit.retryAfter}s.`,
      { headers },
    );
  }

  const body = await readJson(request, estimateRequestSchema);
  if (!body.ok) return body.response;

  if (looksLikeSpam(body.value)) {
    return ok(
      { reference: "STW-000000", total: 0 },
      { status: 201, message: "Quote sent." },
    );
  }

  const { honeypot: _honeypot, input, ...contact } = body.value;
  const quote = estimateProject(input);

  const result = await deliverLead("estimate", {
    ...contact,
    configuration: input,
    quote: {
      total: quote.total,
      low: quote.low,
      high: quote.high,
      weeks: quote.weeks,
      teamSize: quote.teamSize,
      monthlyRetainer: quote.monthlyRetainer,
    },
  });

  return ok(
    { reference: result.reference, total: quote.total },
    {
      status: 201,
      message: "Quote on its way to your inbox.",
      headers,
    },
  );
}

export async function GET() {
  return fail("bad_request", "This endpoint only accepts POST.");
}
