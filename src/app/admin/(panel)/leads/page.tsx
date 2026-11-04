import Link from "next/link";
import { after } from "next/server";
import { RefreshCw, Target } from "lucide-react";

import { bulkStatusAction, syncLeadsAction } from "@/app/admin/actions";
import { can, seesAll } from "@/lib/cms/auth";
import { lastSync, leadSources, leadStatuses, listLeads, syncIfStale } from "@/lib/cms/crm-leads";
import { requireUser } from "@/lib/cms/session";
import { zohoConfigured } from "@/lib/zoho-crm";
import { BulkBar } from "@/components/admin/bulk-bar";
import { SubmitButton } from "@/components/admin/form-bits";
import { LeadStatus } from "@/components/admin/lead-status";
import { Avatar, buttonClass, Card, Empty, formatWhen, inputClass, PageHeader, theadClass, timeAgo } from "@/components/admin/ui";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; source?: string; mine?: string }>;
}) {
  const user = await requireUser("leads");
  const { q = "", status = "", source = "", mine = "" } = await searchParams;
  const all = seesAll(user, "leads");
  const leads = listLeads({
    q: q || undefined,
    status: status || undefined,
    source: source || undefined,
    assignee: mine || !all ? user.name : undefined,
  });
  const sync = lastSync();
  const connected = zohoConfigured();
  if (connected) after(() => syncIfStale(10));
  const today = new Date().toISOString().slice(0, 10);
  const statuses = leadStatuses();

  return (
    <>
      <PageHeader
        title="CRM leads"
        description={all ? "Every lead from Zoho CRM. Changes here are written back to Zoho." : "Leads assigned to you in Zoho CRM. Changes here are written back to Zoho."}
        actions={
          connected && can(user, "leads.sync") ? (
            <form action={syncLeadsAction}>
              <SubmitButton variant="secondary" pendingLabel="Syncing…">
                <RefreshCw className="size-4" aria-hidden /> Sync now
              </SubmitButton>
            </form>
          ) : null
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className={`size-2 rounded-full ${!connected ? "bg-slate-400" : sync.error ? "bg-red-500" : "bg-emerald-500"}`} aria-hidden />
        {!connected
          ? "Zoho CRM is not connected yet (see docs/zoho-crm.md)."
          : sync.error
            ? `Last sync failed: ${sync.error}`
            : sync.at
              ? `Synced ${timeAgo(sync.at)} · ${sync.count} leads · syncs automatically`
              : "Not synced yet; the first sync starts in the background."}
      </div>

      <form className="mb-4 flex flex-col gap-2 lg:flex-row">
        <input name="q" defaultValue={q} placeholder="Search name, email, phone, company…" className={`${inputClass} lg:max-w-xs`} />
        <select name="status" defaultValue={status} className={`${inputClass} lg:w-52`}>
          <option value="">All statuses</option>
          {statuses.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <select name="source" defaultValue={source} className={`${inputClass} lg:w-48`}>
          <option value="">All sources</option>
          {leadSources().map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        {all ? (
          <label className="flex items-center gap-2 whitespace-nowrap px-1 text-sm text-foreground">
            <input type="checkbox" name="mine" value="1" defaultChecked={Boolean(mine)} className="size-4 accent-[#2f56d8]" /> My leads
          </label>
        ) : null}
        <button className={buttonClass.secondary}>Filter</button>
      </form>

      <Card className="overflow-hidden">
        {leads.length === 0 ? (
          <Empty title={sync.count ? "No leads match" : "No leads yet"}>
            {sync.count ? "Try other filters." : connected ? "They appear after the first sync with Zoho CRM." : "Connect Zoho CRM to work on leads here."}
          </Empty>
        ) : (
          <form action={bulkStatusAction}>
            <input type="hidden" name="entity" value="lead" />
            {can(user, "leads.edit") ? <BulkBar statuses={statuses} /> : null}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className={theadClass}>
                  <tr>
                    <th className="w-10 py-3 pl-5" aria-label="Select" />
                    <th className="px-5 py-3 font-medium">Lead</th>
                    <th className="hidden px-5 py-3 font-medium lg:table-cell">Source</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="hidden px-5 py-3 font-medium md:table-cell">Owner</th>
                    <th className="hidden px-5 py-3 font-medium sm:table-cell">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="transition-colors hover:bg-foreground/[0.03]">
                      <td className="py-3 pl-5">
                        <input type="checkbox" name="ids" value={lead.id} aria-label={`Select ${lead.name}`} className="size-4 accent-[#2f56d8]" />
                      </td>
                      <td className="px-5 py-3">
                        <Link href={`/admin/leads/${lead.id}`} className="flex items-center gap-3">
                          <Avatar name={lead.name} />
                          <span className="min-w-0">
                            <span className="block truncate font-semibold text-foreground hover:underline">{lead.name}</span>
                            <span className="block truncate text-xs text-muted-foreground">{lead.company || lead.email || lead.phone}</span>
                          </span>
                        </Link>
                      </td>
                      <td className="hidden px-5 py-3 text-muted-foreground lg:table-cell">{lead.source || "—"}</td>
                      <td className="px-5 py-3">
                        <div className="flex flex-col items-start gap-1">
                          <LeadStatus status={lead.status} />
                          {lead.follow_up_at && lead.follow_up_at <= today ? (
                            <span className="text-[11px] font-semibold text-red-600 dark:text-red-400">Follow-up due</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="hidden px-5 py-3 md:table-cell">
                        {lead.assignee || lead.zoho_owner ? (
                          <span className="flex items-center gap-2 text-xs text-foreground">
                            <Avatar name={lead.assignee || lead.zoho_owner} size="sm" />
                            {(lead.assignee || lead.zoho_owner).split(" ")[0]}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="hidden px-5 py-3 text-muted-foreground sm:table-cell" title={formatWhen(lead.modified_time)}>
                        {timeAgo(lead.modified_time)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </form>
        )}
      </Card>
      {leads.length ? (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Target className="size-3.5" aria-hidden /> {leads.length} {leads.length === 1 ? "lead" : "leads"}
        </p>
      ) : null}
    </>
  );
}
