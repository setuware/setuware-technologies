import Link from "next/link";
import { Plus } from "lucide-react";

import { can, recentAudit } from "@/lib/cms/auth";
import { requireUser } from "@/lib/cms/session";
import { dashboardCounts, listApplications, listEnquiries } from "@/lib/cms/store";
import { buttonClass, Card, Empty, formatWhen, PageHeader, Stat, StatusBadge } from "@/components/admin/ui";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await requireUser();
  const { denied } = await searchParams;
  const counts = dashboardCounts();
  const showEnquiries = can(user.role, "enquiries");
  const showApplications = can(user.role, "applications");
  const enquiries = showEnquiries ? listEnquiries().slice(0, 6) : [];
  const applications = showApplications ? listApplications().slice(0, 6) : [];
  const activity = user.role === "owner" ? recentAudit(12) : [];
  const hour = Number(new Intl.DateTimeFormat("en-IN", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Kolkata" }).format(new Date()));
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <PageHeader
        title={`${greeting}, ${user.name.split(" ")[0]}`}
        description="Here is what is happening across the website."
        actions={
          <>
            {can(user.role, "posts") ? (
              <Link href="/admin/posts/new" className={buttonClass.primary}>
                <Plus className="size-4" aria-hidden /> New post
              </Link>
            ) : null}
            {can(user.role, "jobs") ? (
              <Link href="/admin/jobs/new" className={buttonClass.secondary}>
                <Plus className="size-4" aria-hidden /> New job
              </Link>
            ) : null}
          </>
        }
      />

      {denied ? (
        <p className="mb-6 rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          Your role does not include that section. Ask the owner if you need access.
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {showEnquiries ? <Stat label="New enquiries" value={counts.enquiriesNew} hint={`${counts.enquiriesWeek} in the last 7 days`} href="/admin/enquiries?status=new" /> : null}
        {showApplications ? <Stat label="New applications" value={counts.applicationsNew} hint={`${counts.applicationsWeek} in the last 7 days`} href="/admin/applications?status=new" /> : null}
        {can(user.role, "posts") ? <Stat label="Published posts" value={counts.postsPublished} hint={`${counts.postsDraft} drafts`} href="/admin/posts" /> : null}
        {can(user.role, "jobs") ? <Stat label="Open jobs" value={counts.jobsOpen} href="/admin/jobs" /> : null}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {showEnquiries ? (
          <Card>
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-semibold text-foreground">Latest enquiries</h2>
              <Link href="/admin/enquiries" className="text-sm font-medium text-setu-dark hover:underline dark:text-[#5fd0ec]">
                View all
              </Link>
            </div>
            {enquiries.length === 0 ? (
              <Empty title="No enquiries yet">They appear here as soon as someone submits a form.</Empty>
            ) : (
              <ul className="divide-y divide-border">
                {enquiries.map((item) => (
                  <li key={item.id}>
                    <Link href={`/admin/enquiries/${item.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-foreground/[0.03]">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">{item.name || item.email}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {item.source} · {formatWhen(item.created_at)}
                        </span>
                      </span>
                      <StatusBadge status={item.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        ) : null}

        {showApplications ? (
          <Card>
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-semibold text-foreground">Latest applications</h2>
              <Link href="/admin/applications" className="text-sm font-medium text-setu-dark hover:underline dark:text-[#5fd0ec]">
                View all
              </Link>
            </div>
            {applications.length === 0 ? (
              <Empty title="No applications yet">Candidates apply from each job page.</Empty>
            ) : (
              <ul className="divide-y divide-border">
                {applications.map((item) => (
                  <li key={item.id}>
                    <Link href={`/admin/applications/${item.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-foreground/[0.03]">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">{item.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {item.job_title} · {formatWhen(item.created_at)}
                        </span>
                      </span>
                      <StatusBadge status={item.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        ) : null}

        {activity.length > 0 ? (
          <Card className="lg:col-span-2">
            <div className="border-b border-border px-5 py-4">
              <h2 className="font-semibold text-foreground">Recent activity</h2>
            </div>
            <ul className="divide-y divide-border">
              {activity.map((entry, index) => (
                <li key={index} className="flex flex-col gap-0.5 px-5 py-3 text-sm sm:flex-row sm:items-center sm:gap-4">
                  <span className="w-40 shrink-0 text-xs text-muted-foreground">{formatWhen(entry.created_at)}</span>
                  <span className="text-foreground">
                    <strong className="font-semibold">{entry.actor}</strong> {entry.action}
                    <span className="text-muted-foreground"> · {entry.summary}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}
      </div>
    </>
  );
}
