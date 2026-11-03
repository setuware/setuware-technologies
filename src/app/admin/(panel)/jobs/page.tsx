import Link from "next/link";
import { Plus } from "lucide-react";

import { getDb } from "@/lib/cms/db";
import { requireUser } from "@/lib/cms/session";
import { listJobRecords } from "@/lib/cms/store";
import { buttonClass, Card, Empty, formatDay, PageHeader, StatusBadge } from "@/components/admin/ui";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

export default async function JobsPage() {
  await requireUser("jobs");
  const jobs = listJobRecords();
  const counts = new Map(
    (getDb().prepare("SELECT job_slug, COUNT(*) AS n FROM applications GROUP BY job_slug").all() as { job_slug: string; n: number }[]).map(
      (row) => [row.job_slug, row.n],
    ),
  );

  return (
    <>
      <PageHeader
        title="Jobs"
        description="Open roles appear on /careers instantly; closing a role hides it and stops applications."
        actions={
          <Link href="/admin/jobs/new" className={buttonClass.primary}>
            <Plus className="size-4" aria-hidden /> New job
          </Link>
        }
      />
      <Card className="overflow-hidden">
        {jobs.length === 0 ? (
          <Empty title="No jobs yet">Post your first role.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-xs uppercase tracking-[0.08em] text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="hidden px-5 py-3 font-medium md:table-cell">Team</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Applications</th>
                  <th className="hidden px-5 py-3 font-medium sm:table-cell">Posted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-foreground/[0.03]">
                    <td className="px-5 py-3">
                      <Link href={`/admin/jobs/${job.id}`} className="font-medium text-foreground hover:underline">
                        {job.title}
                      </Link>
                      <span className="block text-xs text-muted-foreground">
                        {job.location} · {job.type}
                      </span>
                    </td>
                    <td className="hidden px-5 py-3 text-muted-foreground md:table-cell">{job.team}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-5 py-3">
                      <Link href={`/admin/applications?job=${job.slug}`} className="font-medium text-setu-dark hover:underline dark:text-[#5fd0ec]">
                        {counts.get(job.slug) ?? 0}
                      </Link>
                    </td>
                    <td className="hidden px-5 py-3 text-muted-foreground sm:table-cell">{formatDay(job.posted_at)}</td>
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
