import Link from "next/link";
import { ArrowRight, Briefcase, FileText, Inbox, Plus, UsersRound } from "lucide-react";

import { can, recentAudit } from "@/lib/cms/auth";
import { getDb } from "@/lib/cms/db";
import { requireUser } from "@/lib/cms/session";
import { dashboardCounts, ENQUIRY_STATUSES, listApplications, listEnquiries } from "@/lib/cms/store";
import { LogoMark } from "@/components/layout/logo";
import { Avatar, Card, Empty, PageHeader, Stat, StatusBadge, timeAgo } from "@/components/admin/ui";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

const PIPELINE_COLOURS: Record<string, string> = {
  new: "#2f56d8",
  contacted: "#f59e0b",
  qualified: "#06b6d4",
  proposal: "#7c3aed",
  won: "#10b981",
  lost: "#ef4444",
  spam: "#94a3b8",
};

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await requireUser();
  const { denied } = await searchParams;
  const counts = dashboardCounts();
  const showEnquiries = can(user.role, "enquiries");
  const showApplications = can(user.role, "applications");
  const enquiries = showEnquiries ? listEnquiries().slice(0, 6) : [];
  const applications = showApplications ? listApplications().slice(0, 6) : [];
  // Content changes only; sign-ins stay in the log but would drown them out.
  const activity = user.role === "owner" ? recentAudit(40).filter((entry) => entry.action !== "signed in").slice(0, 8) : [];
  const hour = Number(new Intl.DateTimeFormat("en-IN", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Kolkata" }).format(new Date()));
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const pipeline = showEnquiries
    ? (getDb().prepare("SELECT status, COUNT(*) AS n FROM enquiries GROUP BY status").all() as { status: string; n: number }[])
    : [];
  const pipelineTotal = pipeline.reduce((sum, row) => sum + row.n, 0);
  const won = pipeline.find((row) => row.status === "won")?.n ?? 0;

  return (
    <>
      {/* Welcome banner */}
      <section className="dark relative mb-7 overflow-hidden rounded-3xl bg-[#0b1020] p-6 text-white shadow-[0_24px_60px_-28px_rgba(11,16,32,0.8)] sm:p-8">
        <span aria-hidden className="pointer-events-none absolute -right-16 -top-24 size-80 rounded-full bg-[#2f56d8]/40 blur-3xl" />
        <span aria-hidden className="pointer-events-none absolute -bottom-28 left-1/3 size-72 rounded-full bg-[#0a8ea6]/25 blur-3xl" />
        <span aria-hidden className="pointer-events-none absolute -right-6 bottom-[-3.5rem] opacity-[0.08]">
          <LogoMark className="size-64" />
        </span>
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5fd0ec]">Setuware Admin</p>
            <h1 className="mt-2 font-display text-[1.9rem] font-semibold leading-tight tracking-[-0.02em] sm:text-[2.2rem]">
              {greeting}, {user.name.split(" ")[0]}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-white/65">
              {showEnquiries && counts.enquiriesNew
                ? `${counts.enquiriesNew} new ${counts.enquiriesNew === 1 ? "enquiry needs" : "enquiries need"} a reply.`
                : "Everything is up to date."}
              {showApplications && counts.applicationsNew
                ? ` ${counts.applicationsNew} new ${counts.applicationsNew === 1 ? "application" : "applications"} to review.`
                : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {can(user.role, "posts") ? (
              <Link
                href="/admin/posts/new"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#0b1020] transition-opacity hover:opacity-90"
              >
                <Plus className="size-4" aria-hidden /> Write a post
              </Link>
            ) : null}
            {can(user.role, "jobs") ? (
              <Link
                href="/admin/jobs/new"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-5 text-sm font-semibold text-white transition-colors hover:bg-white/[0.12]"
              >
                <Plus className="size-4" aria-hidden /> Post a job
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {denied ? (
        <p className="mb-6 rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          Your role does not include that section. Ask the owner if you need access.
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {showEnquiries ? (
          <Stat
            label="New enquiries"
            value={counts.enquiriesNew}
            hint={`${counts.enquiriesWeek} in the last 7 days`}
            href="/admin/enquiries?status=new"
            icon={<Inbox className="size-4" />}
            tone="blue"
          />
        ) : null}
        {showApplications ? (
          <Stat
            label="New applications"
            value={counts.applicationsNew}
            hint={`${counts.applicationsWeek} in the last 7 days`}
            href="/admin/applications?status=new"
            icon={<UsersRound className="size-4" />}
            tone="violet"
          />
        ) : null}
        {can(user.role, "posts") ? (
          <Stat
            label="Published posts"
            value={counts.postsPublished}
            hint={`${counts.postsDraft} ${counts.postsDraft === 1 ? "draft" : "drafts"} in progress`}
            href="/admin/posts"
            icon={<FileText className="size-4" />}
            tone="teal"
          />
        ) : null}
        {can(user.role, "jobs") ? (
          <Stat label="Open jobs" value={counts.jobsOpen} hint="Live on the careers page" href="/admin/jobs" icon={<Briefcase className="size-4" />} tone="amber" />
        ) : null}
      </div>

      {showEnquiries ? (
        <Card className="mt-6 p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-semibold text-foreground">Enquiry pipeline</h2>
              <p className="text-xs text-muted-foreground">
                {pipelineTotal} total · {pipelineTotal ? Math.round((won / pipelineTotal) * 100) : 0}% won
              </p>
            </div>
            <Link href="/admin/enquiries" className="inline-flex items-center gap-1 text-sm font-medium text-setu-dark hover:underline dark:text-[#5fd0ec]">
              Open inbox <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
          <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-foreground/[0.06]">
            {pipelineTotal
              ? ENQUIRY_STATUSES.map((status) => {
                  const n = pipeline.find((row) => row.status === status)?.n ?? 0;
                  return n ? (
                    <span key={status} title={`${status}: ${n}`} style={{ width: `${(n / pipelineTotal) * 100}%`, background: PIPELINE_COLOURS[status] }} />
                  ) : null;
                })
              : null}
          </div>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {ENQUIRY_STATUSES.map((status) => (
              <li key={status}>
                <Link href={`/admin/enquiries?status=${status}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
                  <span className="size-2 rounded-full" style={{ background: PIPELINE_COLOURS[status] }} aria-hidden />
                  <span className="capitalize">{status}</span>
                  <span className="font-semibold tabular-nums text-foreground">{pipeline.find((row) => row.status === status)?.n ?? 0}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {showEnquiries ? (
          <ListCard title="Latest enquiries" href="/admin/enquiries" empty="No enquiries yet" emptyHint="They appear here as soon as someone submits a form.">
            {enquiries.map((item) => (
              <Row
                key={item.id}
                href={`/admin/enquiries/${item.id}`}
                name={item.name || item.email || "Visitor"}
                sub={`${item.service || item.source}`}
                when={timeAgo(item.created_at)}
                status={item.status}
              />
            ))}
          </ListCard>
        ) : null}
        {showApplications ? (
          <ListCard title="Latest applications" href="/admin/applications" empty="No applications yet" emptyHint="Candidates apply from each job page.">
            {applications.map((item) => (
              <Row
                key={item.id}
                href={`/admin/applications/${item.id}`}
                name={item.name}
                sub={item.job_title}
                when={timeAgo(item.created_at)}
                status={item.status}
              />
            ))}
          </ListCard>
        ) : null}

        {activity.length > 0 ? (
          <Card className="p-5 sm:p-6 lg:col-span-2">
            <h2 className="mb-4 font-semibold text-foreground">Recent activity</h2>
            <ol className="relative ml-1.5 border-l border-border">
              {activity.map((entry, index) => (
                <li key={index} className="relative mb-4 pl-6 last:mb-0">
                  <span aria-hidden className="absolute -left-[5px] top-1.5 size-2.5 rounded-full border-2 border-surface bg-[linear-gradient(135deg,#2f56d8,#0a8ea6)]" />
                  <p className="text-sm text-foreground">
                    <strong className="font-semibold">{entry.actor}</strong> {entry.action}
                    <span className="text-muted-foreground"> · {entry.summary}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{timeAgo(entry.created_at)}</p>
                </li>
              ))}
            </ol>
          </Card>
        ) : null}
      </div>

      {/* Keeps the page title for assistive tech; the banner is the visual one. */}
      <div className="sr-only">
        <PageHeader title="Dashboard" />
      </div>
    </>
  );
}

function ListCard({
  title,
  href,
  empty,
  emptyHint,
  children,
}: {
  title: string;
  href: string;
  empty: string;
  emptyHint: string;
  children: React.ReactNode[];
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between px-5 pb-2 pt-5">
        <h2 className="font-semibold text-foreground">{title}</h2>
        <Link href={href} className="inline-flex items-center gap-1 text-sm font-medium text-setu-dark hover:underline dark:text-[#5fd0ec]">
          View all <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>
      {children.length === 0 ? <Empty title={empty}>{emptyHint}</Empty> : <ul className="px-2 pb-2">{children}</ul>}
    </Card>
  );
}

function Row({ href, name, sub, when, status }: { href: string; name: string; sub: string; when: string; status: string }) {
  return (
    <li>
      <Link href={href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-foreground/[0.04]">
        <Avatar name={name} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-foreground">{name}</span>
          <span className="block truncate text-xs text-muted-foreground">{sub}</span>
        </span>
        <span className="flex flex-col items-end gap-1">
          <StatusBadge status={status} />
          <span className="text-[11px] text-muted-foreground">{when}</span>
        </span>
      </Link>
    </li>
  );
}
