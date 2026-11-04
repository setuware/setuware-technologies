import { timingSafeEqual } from "node:crypto";

/** True when the request carries CRON_SECRET (?key= or the x-cron-key header). Disabled without a 16+ character secret. */
export function cronAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET ?? "";
  const key = new URL(request.url).searchParams.get("key") ?? request.headers.get("x-cron-key") ?? "";
  return secret.length >= 16 && key.length === secret.length && timingSafeEqual(Buffer.from(key), Buffer.from(secret));
}
