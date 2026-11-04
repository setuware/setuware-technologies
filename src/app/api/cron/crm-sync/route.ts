import { syncLeads } from "@/lib/cms/crm-leads";
import { cronAuthorized } from "@/lib/cron-auth";

/**
 * Scheduled Zoho CRM sync. Call every few minutes from the server's crontab:
 *
 *   *\/5 * * * * curl -fsS "http://127.0.0.1:3000/api/cron/crm-sync?key=$CRON_SECRET" >/dev/null
 *
 * Requires CRON_SECRET; without it the endpoint is disabled.
 */
export async function GET(request: Request) {
  if (!cronAuthorized(request)) return new Response("Not found", { status: 404 });
  const result = await syncLeads({ full: new URL(request.url).searchParams.get("full") === "1" });
  return Response.json(result, { status: result.error ? 502 : 200 });
}
