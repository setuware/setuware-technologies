import { clientKey } from "@/lib/api";
import { RateLimiter } from "@/lib/rate-limit";
import { recordView } from "@/lib/cms/crm";

const limiter = new RateLimiter({ limit: 60, windowMs: 60_000 });

/** Counts a view of a blog post or job page (no cookies, no personal data). */
export async function POST(request: Request) {
  if (!limiter.consume(clientKey(request, "views")).ok) return new Response(null, { status: 204 });
  try {
    const { path } = (await request.json()) as { path?: unknown };
    if (typeof path === "string" && /^\/(blog|careers)\/[a-z0-9-]{1,120}$/.test(path)) recordView(path);
  } catch {
    // Ignore malformed beacons.
  }
  return new Response(null, { status: 204 });
}
