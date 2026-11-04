import Link from "next/link";
import { Download } from "lucide-react";

import { bulkStatusAction } from "@/app/admin/actions";
import { can, seesAll } from "@/lib/cms/auth";
import { requireUser } from "@/lib/cms/session";
import { BulkBar } from "@/components/admin/bulk-bar";
import { ENQUIRY_STATUSES, listEnquiries } from "@/lib/cms/store";
import { Avatar, buttonClass, Card, Empty, formatWhen, inputClass, PageHeader, StatusBadge, theadClass, timeAgo } from "@/components/admin/ui";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

const KINDS = { contact: "Contact / pop-up / chat", estimate: "Estimator", booking: "Consultation booking" } as const;

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; kind?: string; mine?: string }>;
}) {
  const user = await requireUser("enquiries");
  const { q = "", status = "", kind = "", mine = "" } = await searchParams;
  const items = listEnquiries({
    q: q || undefined,
    status: status || undefined,
    kind: kind || undefined,
    assignee: mine || !seesAll(user, "enquiries") ? user.name : undefined,
  });
  const today = new Date().toISOString().slice(0, 10);
  const query = new URLSearchParams({ ...(q ? { q } : {}), ...(status ? { status } : {}), ...(kind ? { kind } : {}) }).toString();

  return (
    <>
      <PageHeader
        title="Enquiries"
        description="Every form, chat, estimate and booking from the website. Also sent by email and to Zoho CRM."
        actions={
          can(user, "enquiries.export") ? (
            <a href={`/admin/files/export/enquiries${query ? `?${query}` : ""}`} className={buttonClass.secondary}>
              <Download className="size-4" aria-hidden /> Export CSV
            </a>
          ) : null
        }
      />
      <form className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input name="q" defaultValue={q} placeholder="Search name, email, phone, message…" className={`${inputClass} sm:max-w-xs`} />
        <select name="kind" defaultValue={kind} className={`${inputClass} sm:w-56`}>
          <option value="">All sources</option>
          {Object.entries(KINDS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={status} className={`${inputClass} capitalize sm:w-40`}>
          <option value="">All statuses</option>
          {ENQUIRY_STATUSES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 whitespace-nowrap px-1 text-sm text-foreground">
          <input type="checkbox" name="mine" value="1" defaultChecked={Boolean(mine)} className="size-4 accent-[#2f56d8]" /> Assigned to me
        </label>
        <button className={buttonClass.secondary}>Filter</button>
      </form>
      <Card className="overflow-hidden">
        {items.length === 0 ? (
          <Empty title="No enquiries">{q || status || kind ? "Nothing matches these filters." : "Website enquiries appear here as they arrive."}</Empty>
        ) : (
          <form action={bulkStatusAction}>
            <input type="hidden" name="entity" value="enquiry" />
            <BulkBar statuses={ENQUIRY_STATUSES} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={theadClass}>
                <tr>
                  <th className="w-10 py-3 pl-5" aria-label="Select" />
                  <th className="px-5 py-3 font-medium">Contact</th>
                  <th className="hidden px-5 py-3 font-medium md:table-cell">Source</th>
                  <th className="hidden px-5 py-3 font-medium lg:table-cell">Service</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="hidden px-5 py-3 font-medium xl:table-cell">Owner</th>
                  <th className="hidden px-5 py-3 font-medium sm:table-cell">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-foreground/[0.03]">
                    <td className="py-3 pl-5">
                      <input type="checkbox" name="ids" value={item.id} aria-label={`Select ${item.name || item.email}`} className="size-4 accent-[#2f56d8]" />
                    </td>
                    <td className="px-5 py-3">
                      <Link href={`/admin/enquiries/${item.id}`} className="flex items-center gap-3">
                        <Avatar name={item.name || item.email || "Visitor"} />
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-foreground hover:underline">{item.name || item.email || "Visitor"}</span>
                          <span className="block truncate text-xs text-muted-foreground">{item.email || item.phone}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="hidden px-5 py-3 text-muted-foreground md:table-cell">{item.source}</td>
                    <td className="hidden px-5 py-3 text-muted-foreground lg:table-cell">{item.service || "—"}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col items-start gap-1">
                        <StatusBadge status={item.status} />
                        {item.follow_up_at && item.follow_up_at <= today && !["won", "lost", "spam"].includes(item.status) ? (
                          <span className="text-[11px] font-semibold text-red-600 dark:text-red-400">Follow-up due</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="hidden px-5 py-3 xl:table-cell">
                      {item.assignee ? (
                        <span className="flex items-center gap-2 text-xs text-foreground">
                          <Avatar name={item.assignee} size="sm" />
                          {item.assignee.split(" ")[0]}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="hidden px-5 py-3 text-muted-foreground sm:table-cell" title={formatWhen(item.created_at)}>{timeAgo(item.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </form>
        )}
      </Card>
    </>
  );
}
