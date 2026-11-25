import Link from "next/link";
import { AlertTriangle, ArrowRight, Briefcase, CalendarClock, Clock3, FileText, Globe, Inbox, Mail, Plus, Target, Trophy, UsersRound } from "lucide-react";

import { can, listUsers, recentAudit, seesAll } from "@/lib/cms/auth";
import { followUpsDue, upcomingInterviews } from "@/lib/cms/crm";
import { leadCounts } from "@/lib/cms/crm-leads";
import { getDb } from "@/lib/cms/db";
import { formatMinutes, listRequests, localDay, localTime, presence, todayBoard, workedMinutes, type BoardRow } from "@/lib/cms/attendance";
import { attention, enquiryFunnel, overdueByPerson, parseRange, periodMetrics, projectsAtRisk, type Range } from "@/lib/cms/insights";
import { mayApproveFor, teamScope } from "@/lib/cms/notify";
import { pendingSheets } from "@/lib/cms/timesheets";
import { listTasks, taskCounts } from "@/lib/cms/tasks";
import { requireUser } from "@/lib/cms/session";
import { dashboardCounts, ENQUIRY_STATUSES, listApplications, listEnquiries } from "@/lib/cms/store";
import { LogoMark } from "@/components/layout/logo";
import { Funnel, RangeTabs, TrendChart } from "@/components/admin/charts";
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

const BOARD_LABELS: Record<BoardRow["state"], string> = {
  in: "In",
  break: "On break",
  done: "Checked out",
  leave: "On leave",
  off: "Day off",
  "not-in": "Not in yet",
};

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denied?: string; range?: string }> }) {
  const user = await requireUser();
  const { denied, range: rangeParam } = await searchParams;
  const range = parseRange(rangeParam);
  const counts = dashboardCounts();
  const showEnquiries = can(user, "enquiries");
  const showApplications = can(user, "applications");
  const enquiries = showEnquiries ? listEnquiries(seesAll(user, "enquiries") ? {} : { assignee: user.name }).slice(0, 6) : [];
  const applications = showApplications ? listApplications(seesAll(user, "applications") ? {} : { assignee: user.name }).slice(0, 6) : [];
  // Content changes only; sign-ins stay in the log but would drown them out.
  const activity = user.role === "owner" ? recentAudit(40).filter((entry) => entry.action !== "signed in").slice(0, 8) : [];
  const hour = Number(new Intl.DateTimeFormat("en-IN", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Kolkata" }).format(new Date()));
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const dueFollowUps = showEnquiries ? followUpsDue(seesAll(user, "enquiries") ? undefined : user.name) : [];
  const interviews = showApplications ? upcomingInterviews() : [];

  const today = localDay();
  const punch = presence(user.id);
  const myTasks = listTasks({ assigneeId: user.id })
    .filter((task) => task.status !== "done")
    .sort((a, b) => (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999"))
    .slice(0, 5);
  const taskStats = taskCounts(user.id, today);
  const pendingApprovals = can(user, "attendance.manage") ? listRequests({ status: "pending" }).length : 0;

  const showAnalytics = can(user, "analytics");
  const metrics = periodMetrics(range);
  // Org-wide trends only for people who see every enquiry / application.
  const teamEnquiries = showEnquiries && seesAll(user, "enquiries");
  const teamApplications = showApplications && seesAll(user, "applications");
  const funnel = showAnalytics && teamEnquiries ? enquiryFunnel(range) : [];
  const queue = attention({
    enquiries: showEnquiries && !seesAll(user, "enquiries") ? user.name : null,
    applications: showApplications && !seesAll(user, "applications") ? user.name : null,
  });
  const leaveWaiting = listRequests({ status: "pending" }).filter((request) => mayApproveFor(user, request.user_id, "attendance.manage")).length;
  const sheetsWaiting = pendingSheets().filter((id) => mayApproveFor(user, id, "timesheets.approve")).length;
  const attentionItems = [
    showEnquiries && { n: queue.unanswered, label: "new enquiries waiting over 24 h", href: "/admin/enquiries?status=new", urgent: true },
    showEnquiries && { n: queue.overdueFollowUps, label: "overdue follow-ups", href: "/admin/enquiries", urgent: true },
    showEnquiries && { n: queue.unassignedEnquiries, label: "open enquiries with no owner", href: "/admin/enquiries", urgent: false },
    showApplications && { n: queue.staleApplications, label: "applications untouched for 7+ days", href: "/admin/applications?status=new", urgent: false },
    showApplications && { n: queue.unassignedApplications, label: "applications with no owner", href: "/admin/applications", urgent: false },
    { n: taskStats.toReview, label: "tasks waiting for your review", href: "/admin/tasks?who=review", urgent: false },
    { n: leaveWaiting, label: "leave or correction requests to approve", href: "/admin/attendance/team", urgent: false },
    { n: sheetsWaiting, label: "timesheets to approve", href: "/admin/timesheets/team", urgent: false },
  ].filter((item): item is { n: number; label: string; href: string; urgent: boolean } => Boolean(item && item.n > 0));

  const scope = teamScope(user, "attendance");
  const teamMembers = scope.all || scope.ids.length ? listUsers().filter((member) => member.active && (scope.all || scope.ids.includes(member.id))) : [];
  const board = teamMembers.length ? todayBoard(teamMembers) : [];
  const boardCount = (...states: BoardRow["state"][]) => board.filter((row) => states.includes(row.state)).length;
  const lateToday = board.filter((row) => row.late);
  const seesTeamWork = seesAll(user, "tasks");
  const risks = seesTeamWork ? projectsAtRisk(today).slice(0, 5) : [];
  // Only people who see every task; managers can't open their reports' tasks from here.
  const overdueTeam = seesTeamWork ? overdueByPerson(today).slice(0, 5) : [];
  const rangeHref = (next: Range) => (next === 30 ? "/admin" : `/admin?range=${next}`);

  const pipeline = showEnquiries
    ? (getDb().prepare("SELECT status, COUNT(*) AS n FROM enquiries GROUP BY status").all() as { status: string; n: number }[])
    : [];
  const pipelineTotal = pipeline.reduce((sum, row) => sum + row.n, 0);
  const won = pipeline.find((row) => row.status === "won")?.n ?? 0;

  // Blank cells so the last row of the attention grid isn't left with a gap.
  const fillSm = (2 - (attentionItems.length % 2)) % 2;
  const fillXl = (3 - (attentionItems.length % 3)) % 3;

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
            {can(user, "posts") ? (
              <Link
                href="/admin/posts/new"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#0b1020] transition-opacity hover:opacity-90"
              >
                <Plus className="size-4" aria-hidden /> Write a post
              </Link>
            ) : null}
            {can(user, "jobs") ? (
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

      <Card className="mb-6 grid overflow-hidden md:grid-cols-[18rem_1fr]">
        <Link href="/admin/attendance" className="flex flex-col justify-between gap-4 border-b border-border p-5 transition-colors hover:bg-foreground/[0.02] md:border-b-0 md:border-r">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <Clock3 className="size-3.5" aria-hidden /> My day
            </p>
            <p className="mt-2 font-display text-2xl font-semibold text-foreground">
              {punch.state === "out" ? "Not checked in" : punch.state === "done" ? "Checked out" : punch.state === "break" ? "On a break" : "Working"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {punch.record
                ? `In at ${localTime(punch.record.check_in_at)}${punch.record.check_out_at ? ` · out at ${localTime(punch.record.check_out_at)}` : ""} · ${formatMinutes(workedMinutes(punch.record))} worked`
                : "Check in to start your day."}
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-[#2f56d8] dark:text-[#8fb0ff]">
            {punch.state === "out" ? "Check in now" : "Open attendance"} <ArrowRight className="size-3.5" aria-hidden />
          </span>
          {pendingApprovals ? (
            <span className="w-fit rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
              {pendingApprovals} leave {pendingApprovals === 1 ? "request" : "requests"} to approve
            </span>
          ) : null}
        </Link>
        <div className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">
              My tasks <span className="font-normal text-muted-foreground">· {taskStats.open} open{taskStats.overdue ? `, ${taskStats.overdue} overdue` : ""}</span>
              {taskStats.toReview ? (
                <Link href="/admin/tasks?who=review" className="ml-2 rounded-full bg-violet-500/12 px-2 py-0.5 text-xs font-semibold text-violet-700 hover:underline dark:text-violet-300">
                  {taskStats.toReview} to review
                </Link>
              ) : null}
            </p>
            <Link href="/admin/tasks" className="inline-flex items-center gap-1 text-sm font-medium text-setu-dark hover:underline dark:text-[#5fd0ec]">
              Board <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
          {myTasks.length ? (
            <ul className="mt-3 flex flex-col divide-y divide-border">
              {myTasks.map((task) => (
                <li key={task.id} className="flex items-center gap-3 py-2 text-sm">
                  <span
                    aria-hidden
                    className={`size-2 shrink-0 rounded-full ${task.priority === "urgent" ? "bg-red-500" : task.priority === "high" ? "bg-amber-500" : task.priority === "low" ? "bg-slate-400" : "bg-[#2f56d8]"}`}
                  />
                  <Link href={`/admin/tasks/${task.id}`} className="min-w-0 flex-1 truncate font-medium text-foreground hover:underline">
                    {task.title}
                  </Link>
                  {task.due_date ? (
                    <span
                      className={`inline-flex shrink-0 items-center gap-1 text-xs font-semibold ${task.due_date < today ? "text-red-600 dark:text-red-400" : task.due_date === today ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}
                    >
                      <CalendarClock className="size-3" aria-hidden />
                      {task.due_date < today ? "Overdue" : task.due_date === today ? "Today" : task.due_date.slice(5)}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Nothing assigned to you.{" "}
              <Link href="/admin/tasks/new" className="font-medium text-setu-dark hover:underline dark:text-[#5fd0ec]">
                Add a task
              </Link>
            </p>
          )}
        </div>
      </Card>

      {attentionItems.length ? (
        <Card className="mb-6 overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border px-5 py-3">
            <AlertTriangle className="size-4 text-amber-500" aria-hidden />
            <h2 className="text-sm font-semibold text-foreground">Needs attention</h2>
            <span className="text-xs text-muted-foreground">· {attentionItems.reduce((sum, item) => sum + item.n, 0)} items</span>
          </div>
          <ul className="grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-3">
            {attentionItems.map((item) => (
              <li key={item.label} className="bg-surface">
                <Link href={item.href} className="flex items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-foreground/[0.03]">
                  <span
                    className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs font-bold tabular-nums ${item.urgent ? "bg-red-500/12 text-red-700 dark:text-red-300" : "bg-amber-500/12 text-amber-700 dark:text-amber-300"}`}
                  >
                    {item.n}
                  </span>
                  <span className="min-w-0 flex-1 text-foreground">{item.label}</span>
                  <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                </Link>
              </li>
            ))}
            {Array.from({ length: Math.max(fillSm, fillXl) }, (_, n) => (
              <li
                key={`filler-${n}`}
                aria-hidden
                className={`hidden bg-surface ${n < fillSm ? "sm:block" : ""} ${n < fillXl ? "xl:block" : "xl:hidden"}`}
              />
            ))}
          </ul>
        </Card>
      ) : null}

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-semibold text-foreground">Performance</h2>
          <p className="text-xs text-muted-foreground">Last {range} days compared with the {range} days before</p>
        </div>
        <RangeTabs value={range} href={rangeHref} />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {showAnalytics ? (
          <Stat
            label="Website visits"
            value={metrics.visits.current.toLocaleString("en-IN")}
            change={metrics.visits.change}
            spark={metrics.visits.series}
            hint={`${metrics.visits.previous.toLocaleString("en-IN")} before`}
            href={`/admin/analytics?range=${range}`}
            icon={<Globe className="size-4" />}
            tone="violet"
          />
        ) : null}
        {teamEnquiries ? (
          <Stat
            label="Enquiries"
            value={metrics.enquiries.current}
            change={metrics.enquiries.change}
            spark={metrics.enquiries.series}
            hint={`${counts.enquiriesNew} new, unanswered`}
            href="/admin/enquiries"
            icon={<Inbox className="size-4" />}
            tone="blue"
          />
        ) : null}
        {teamEnquiries ? (
          <Stat
            label="Won deals"
            value={metrics.won.current}
            change={metrics.won.change}
            spark={metrics.won.series}
            hint={metrics.enquiries.current ? `${Math.round((metrics.won.current / metrics.enquiries.current) * 100)}% of enquiries` : "From enquiries in this period"}
            href="/admin/enquiries?status=won"
            icon={<Trophy className="size-4" />}
            tone="teal"
          />
        ) : null}
        {teamApplications ? (
          <Stat
            label="Job applications"
            value={metrics.applications.current}
            change={metrics.applications.change}
            spark={metrics.applications.series}
            hint={`${counts.applicationsNew} new to review`}
            href="/admin/applications"
            icon={<UsersRound className="size-4" />}
            tone="amber"
          />
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {can(user, "leads") ? (
          <MiniStat
            label={seesAll(user, "leads") ? "Open CRM leads" : "My open leads"}
            value={leadCounts(seesAll(user, "leads") ? undefined : user.name).open}
            hint={`${leadCounts(seesAll(user, "leads") ? undefined : user.name).due} follow-ups due`}
            href="/admin/leads"
            icon={<Target className="size-3.5" />}
          />
        ) : null}
        {can(user, "subscribers") ? (
          <MiniStat
            label="New subscribers"
            value={metrics.subscribers.current}
            hint={`in ${range} days`}
            href="/admin/subscribers"
            icon={<Mail className="size-3.5" />}
          />
        ) : null}
        {can(user, "posts") ? (
          <MiniStat
            label="Published posts"
            value={counts.postsPublished}
            hint={`${counts.postsDraft} ${counts.postsDraft === 1 ? "draft" : "drafts"}`}
            href="/admin/posts"
            icon={<FileText className="size-3.5" />}
          />
        ) : null}
        {can(user, "jobs") ? (
          <MiniStat label="Open jobs" value={counts.jobsOpen} hint="on the careers page" href="/admin/jobs" icon={<Briefcase className="size-3.5" />} />
        ) : null}
      </div>

      {showAnalytics || teamEnquiries ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Card className={`p-5 sm:p-6 ${funnel.length ? "lg:col-span-2" : "lg:col-span-3"}`}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Traffic and enquiries</h2>
              {showAnalytics ? (
                <Link href={`/admin/analytics?range=${range}`} className="inline-flex items-center gap-1 text-sm font-medium text-setu-dark hover:underline dark:text-[#5fd0ec]">
                  Analytics <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              ) : null}
            </div>
            <TrendChart
              labels={metrics.labels}
              series={[
                ...(showAnalytics ? [{ label: "Visits", values: metrics.visits.series, colour: "#7c3aed" }] : []),
                ...(teamEnquiries ? [{ label: "Enquiries", values: metrics.enquiries.series, colour: "#2f56d8" }] : []),
                ...(teamApplications ? [{ label: "Applications", values: metrics.applications.series, colour: "#f59e0b" }] : []),
              ]}
            />
          </Card>
          {funnel.length ? (
            <Card className="p-5 sm:p-6">
              <h2 className="font-semibold text-foreground">Conversion funnel</h2>
              <p className="mb-4 text-xs text-muted-foreground">Enquiries received in the last {range} days and how far they got</p>
              <Funnel steps={funnel} />
            </Card>
          ) : null}
        </div>
      ) : null}

      {board.length || risks.length || overdueTeam.length ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {board.length ? (
            <Card className="p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Team today</h2>
                <Link href="/admin/attendance/team" className="inline-flex items-center gap-1 text-sm font-medium text-setu-dark hover:underline dark:text-[#5fd0ec]">
                  Attendance <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              </div>
              <dl className="mt-4 grid grid-cols-4 gap-2 text-center">
                {[
                  { label: "In", n: boardCount("in", "break"), tone: "text-emerald-600 dark:text-emerald-400" },
                  { label: "Late", n: lateToday.length, tone: "text-amber-600 dark:text-amber-400" },
                  { label: "On leave", n: boardCount("leave"), tone: "text-violet-600 dark:text-violet-300" },
                  { label: "Not in", n: boardCount("not-in"), tone: "text-red-600 dark:text-red-400" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-foreground/[0.03] px-2 py-3">
                    <dd className={`font-display text-2xl font-semibold tabular-nums ${item.tone}`}>{item.n}</dd>
                    <dt className="text-[11px] text-muted-foreground">{item.label}</dt>
                  </div>
                ))}
              </dl>
              <ul className="mt-4 flex flex-col divide-y divide-border">
                {board.slice(0, 8).map((row) => (
                  <li key={row.userId} className="flex items-center gap-3 py-2 text-sm">
                    <Avatar name={row.name} size="sm" />
                    <span className="min-w-0 flex-1 truncate text-foreground">{row.name}</span>
                    {row.late ? <span className="rounded-full bg-amber-500/12 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">Late</span> : null}
                    <span className="text-xs text-muted-foreground">
                      {BOARD_LABELS[row.state]}
                      {row.record ? ` · ${localTime(row.record.check_in_at)}` : row.leave ? ` · ${row.leave}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
              {board.length > 8 ? <p className="mt-2 text-xs text-muted-foreground">and {board.length - 8} more</p> : null}
            </Card>
          ) : null}
          {risks.length || overdueTeam.length ? (
            <Card className="p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Delivery risks</h2>
                <Link href="/admin/projects" className="inline-flex items-center gap-1 text-sm font-medium text-setu-dark hover:underline dark:text-[#5fd0ec]">
                  Projects <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              </div>
              {risks.length ? (
                <ul className="mt-3 flex flex-col divide-y divide-border">
                  {risks.map(({ project, reasons }) => (
                    <li key={project.name}>
                      <Link href={`/admin/projects/${encodeURIComponent(project.name)}`} className="flex flex-col gap-1 py-2.5 hover:opacity-80">
                        <span className="flex items-center justify-between gap-3 text-sm">
                          <span className="truncate font-semibold text-foreground">{project.name}</span>
                          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                            {project.done}/{project.tasks} tasks done
                          </span>
                        </span>
                        <span className="flex flex-wrap gap-1.5">
                          {reasons.map((reason) => (
                            <span key={reason} className="rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-semibold text-red-700 dark:text-red-300">
                              {reason}
                            </span>
                          ))}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">No active project is late or over budget.</p>
              )}
              {overdueTeam.length ? (
                <>
                  <h3 className="mb-2 mt-5 text-sm font-semibold text-foreground">Overdue tasks by person</h3>
                  <ul className="flex flex-wrap gap-2">
                    {overdueTeam.map((row) => (
                      <li key={row.userId}>
                        <Link
                          href={`/admin/tasks?who=${row.userId}`}
                          className="inline-flex items-center gap-2 rounded-full border border-border px-2.5 py-1 text-xs text-foreground hover:bg-foreground/[0.04]"
                        >
                          {row.name} <span className="font-bold tabular-nums text-red-600 dark:text-red-400">{row.n}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </Card>
          ) : null}
        </div>
      ) : null}

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

      {dueFollowUps.length || interviews.length ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {dueFollowUps.length ? (
            <ListCard title={`Follow-ups due (${dueFollowUps.length})`} href="/admin/enquiries" empty="" emptyHint="">
              {dueFollowUps.slice(0, 6).map((item) => (
                <Row
                  key={item.id}
                  href={`/admin/enquiries/${item.id}`}
                  name={item.name || item.email || "Visitor"}
                  sub={`${item.assignee ? `${item.assignee} · ` : ""}due ${item.follow_up_at}`}
                  when={item.follow_up_at && item.follow_up_at < new Date().toISOString().slice(0, 10) ? "Overdue" : "Today"}
                  status={item.status}
                />
              ))}
            </ListCard>
          ) : null}
          {interviews.length ? (
            <ListCard title="Upcoming interviews" href="/admin/applications?status=interview" empty="" emptyHint="">
              {interviews.slice(0, 6).map((item) => (
                <Row
                  key={item.id}
                  href={`/admin/applications/${item.id}`}
                  name={item.name}
                  sub={item.job_title}
                  when={(item.interview_at ?? "").replace("T", " ")}
                  status={item.status}
                />
              ))}
            </ListCard>
          ) : null}
        </div>
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

function MiniStat({ label, value, hint, href, icon }: { label: string; value: number; hint: string; href: string; icon: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-xl border border-border/80 bg-surface px-3 py-3 sm:px-4 transition-colors hover:border-foreground/15">
      <span className="inline-flex size-8 items-center justify-center rounded-lg bg-foreground/[0.05] text-muted-foreground">{icon}</span>
      <span className="min-w-0">
        <span className="block text-xs text-muted-foreground">{label}</span>
        <span className="block text-sm leading-snug">
          <strong className="font-semibold tabular-nums text-foreground">{value}</strong> <span className="text-xs text-muted-foreground">{hint}</span>
        </span>
      </span>
    </Link>
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
