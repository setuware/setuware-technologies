import Link from "next/link";
import { Download } from "lucide-react";

import { requireUser } from "@/lib/cms/session";
import { APPLICATION_STATUSES, listApplications, listJobRecords } from "@/lib/cms/store";
import { buttonClass, Card, Empty, formatWhen, inputClass, PageHeader, StatusBadge } from "@/components/admin/ui";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; job?: string }>;
}) {
  await requireUser("applications");
  const { q = "", status = "", job = "" } = await searchParams;
  const items = listApplications({ q: q || undefined, status: status || undefined, job: job || undefined });
  const jobs = listJobRecords();
  const query = new URLSearchParams({ ...(q ? { q } : {}), ...(status ? { status } : {}), ...(job ? { job } : {}) }).toString();

  return (
    <>
      <PageHeader
        title="Applications"
        description="Candidates who applied from the careers pages. CVs are stored privately."
        actions={
          <a href={`/admin/files/export/applications${query ? `?${query}` : ""}`} className={buttonClass.secondary}>
            <Download className="size-4" aria-hidden /> Export CSV
          </a>
        }
      />
      <form className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input name="q" defaultValue={q} placeholder="Search name, email, phone…" className={`${inputClass} sm:max-w-xs`} />
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
        <button className={buttonClass.secondary}>Filter</button>
      </form>
      <Card className="overflow-hidden">
        {items.length === 0 ? (
          <Empty title="No applications">{q || status || job ? "Nothing matches these filters." : "Applications from job pages appear here."}</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-xs uppercase tracking-[0.08em] text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Candidate</th>
                  <th className="hidden px-5 py-3 font-medium md:table-cell">Role</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="hidden px-5 py-3 font-medium sm:table-cell">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-foreground/[0.03]">
                    <td className="px-5 py-3">
                      <Link href={`/admin/applications/${item.id}`} className="font-medium text-foreground hover:underline">
                        {item.name}
                      </Link>
                      <span className="block text-xs text-muted-foreground">{item.email}</span>
                    </td>
                    <td className="hidden px-5 py-3 text-muted-foreground md:table-cell">{item.job_title}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="hidden px-5 py-3 text-muted-foreground sm:table-cell">{formatWhen(item.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
