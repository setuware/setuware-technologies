import { clientKey } from "@/lib/api";
import { RateLimiter } from "@/lib/rate-limit";
import { recordDailyView, recordView } from "@/lib/cms/crm";

const limiter = new RateLimiter({ limit: 60, windowMs: 60_000 });

/** Counts one anonymous view of any public page (no cookies, no personal data). Admin and API paths never count. */

/** Public page paths: "/" plus lowercase slug segments. */
const PUBLIC_PATH = /^\/(?:[a-z0-9-]{1,80}(?:\/[a-z0-9-]{1,80})*)?\/?$/;
export async function POST(request: Request) {
  if (!limiter.consume(clientKey(request, "views")).ok) return new Response(null, { status: 204 });
  try {
    const { path } = (await request.json()) as { path?: unknown };
    if (typeof path === "string" && PUBLIC_PATH.test(path) && !path.startsWith("/admin") && !path.startsWith("/api")) {
      recordView(path);
      recordDailyView(path);
    }
  } catch {
    // Ignore malformed beacons.
  }
  return new Response(null, { status: 204 });
}
