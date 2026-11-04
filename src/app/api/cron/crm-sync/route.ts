import { timingSafeEqual } from "node:crypto";

import { syncLeads } from "@/lib/cms/crm-leads";

/**
 * Scheduled Zoho CRM sync. Call every few minutes from the server's crontab:
 *
 *   *\/5 * * * * curl -fsS "http://127.0.0.1:3000/api/cron/crm-sync?key=$CRON_SECRET" >/dev/null
 *
 * Requires CRON_SECRET; without it the endpoint is disabled.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET ?? "";
  const key = new URL(request.url).searchParams.get("key") ?? request.headers.get("x-cron-key") ?? "";
  const ok = secret.length >= 16 && key.length === secret.length && timingSafeEqual(Buffer.from(key), Buffer.from(secret));
  if (!ok) return new Response("Not found", { status: 404 });
  const result = await syncLeads({ full: new URL(request.url).searchParams.get("full") === "1" });
  return Response.json(result, { status: result.error ? 502 : 200 });
}
