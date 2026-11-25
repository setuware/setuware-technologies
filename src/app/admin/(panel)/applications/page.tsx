import Link from "next/link";
import { Download } from "lucide-react";

import { bulkStatusAction } from "@/app/admin/actions";
import { can, seesAll } from "@/lib/cms/auth";
import { requireUser } from "@/lib/cms/session";
import { BulkBar } from "@/components/admin/bulk-bar";
import { APPLICATION_STATUSES, listApplications, listJobRecords } from "@/lib/cms/store";
import { Avatar, buttonClass, Card, Empty, formatWhen, inputClass, PageHeader, StatusBadge, theadClass, timeAgo } from "@/components/admin/ui";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; job?: string }>;
}) {
  const user = await requireUser("applications");
  const { q = "", status = "", job = "" } = await searchParams;
  const items = listApplications({
    q: q || undefined,
    status: status || undefined,
    job: job || undefined,
    assignee: seesAll(user, "applications") ? undefined : user.name,
  });
  const jobs = listJobRecords();
  const query = new URLSearchParams({ ...(q ? { q } : {}), ...(status ? { status } : {}), ...(job ? { job } : {}) }).toString();

  return (
    <>
      <PageHeader
        title="Applications"
        description="Candidates who applied from the careers pages. CVs are stored privately."
        actions={
          can(user, "applications.export") ? (
            <a href={`/admin/files/export/applications${query ? `?${query}` : ""}`} className={buttonClass.secondary}>
              <Download className="size-4" aria-hidden /> Export CSV
            </a>
          ) : null
        }
      />
      <form className="mb-4 grid grid-cols-2 gap-2 sm:flex sm:flex-row">
        <input name="q" defaultValue={q} placeholder="Search name, email, phone…" className={`${inputClass} col-span-2 sm:max-w-xs`} />
        <select name="job" defaultValue={job} className={`${inputClass} sm:w-56`}>
          <option value="">All roles</option>
          {jobs.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.title}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={status} className={`${inputClass} capitalize sm:w-40`}>
          <option value="">All statuses</option>
          {APPLICATION_STATUSES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <button className={`${buttonClass.secondary} col-span-2`}>Filter</button>
      </form>
      <Card className="overflow-hidden">
        {items.length === 0 ? (
          <Empty title="No applications">{q || status || job ? "Nothing matches these filters." : "Applications from job pages appear here."}</Empty>
        ) : (
          <form action={bulkStatusAction}>
            <input type="hidden" name="entity" value="application" />
            <BulkBar statuses={APPLICATION_STATUSES} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={theadClass}>
                <tr>
                  <th className="w-10 py-3 pl-5" aria-label="Select" />
                  <th className="px-5 py-3 font-medium">Candidate</th>
                  <th className="hidden px-5 py-3 font-medium md:table-cell">Role</th>
                  <th className="hidden px-5 py-3 font-medium lg:table-cell">Rating</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="hidden px-5 py-3 font-medium sm:table-cell">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-foreground/[0.03]">
                    <td className="py-3 pl-5">
                      <input type="checkbox" name="ids" value={item.id} aria-label={`Select ${item.name}`} className="size-4 accent-[#2f56d8]" />
                    </td>
                    <td className="px-5 py-3">
                      <Link href={`/admin/applications/${item.id}`} className="flex items-center gap-3">
                        <Avatar name={item.name} />
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-foreground hover:underline">{item.name}</span>
                          <span className="block truncate text-xs text-muted-foreground">{item.email}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="hidden px-5 py-3 text-muted-foreground md:table-cell">{item.job_title}</td>
                    <td className="hidden px-5 py-3 text-amber-400 lg:table-cell" aria-label={item.rating ? `${item.rating} of 5` : "Not rated"}>
                      {item.rating ? "★".repeat(item.rating) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={item.status} />
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
