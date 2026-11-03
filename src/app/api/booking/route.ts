import { clientKey, fail, looksLikeSpam, ok, rateLimitHeaders, readJson } from "@/lib/api";
import { deliverLead } from "@/lib/leads";
import { contactLimiter } from "@/lib/rate-limit";
import { bookingSchema } from "@/lib/validation";

/**
 * Consultation bookings. The slot is re-validated here (business hours, notice
 * period, booking window), then e-mailed to the team and the visitor with a
 * calendar invite. Nothing is stored.
 */
export async function POST(request: Request) {
  const limit = contactLimiter.consume(clientKey(request, "booking"));
  const headers = rateLimitHeaders(limit);

  if (!limit.ok) {
    return fail(
      "rate_limited",
      `Too many requests from this connection. Try again in ${limit.retryAfter}s, or call us directly.`,
      { headers },
    );
  }

  const body = await readJson(request, bookingSchema);
  if (!body.ok) return body.response;

  if (looksLikeSpam(body.value)) {
    return ok({ reference: "STW-000000" }, { status: 201, message: "Your consultation is booked." });
  }

  const { honeypot: _honeypot, elapsedMs: _elapsedMs, ...booking } = body.value;
  const result = await deliverLead("booking", booking);

  return ok(
    { reference: result.reference },
    { status: 201, message: "Your consultation is booked.", headers },
  );
}

export async function GET() {
  return fail("bad_request", "This endpoint only accepts POST.");
}
