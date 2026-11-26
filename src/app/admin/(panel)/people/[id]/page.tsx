import Link from "next/link";
import { notFound } from "next/navigation";
import { Briefcase, CalendarDays, CheckCircle2, Clock3, IdCard, Mail, MapPin, MessageSquareText, Phone, Plane, ShieldCheck, Timer, Trash2 } from "lucide-react";

import { deleteUpdateAction } from "@/app/admin/work-actions";
import { can, getUser, listUsers, seesAll } from "@/lib/cms/auth";
import { mayApproveFor } from "@/lib/cms/notify";
import { daysInMonth, formatMinutes, leaveBalance, listRequests, localDay, localTime, register, todayBoard } from "@/lib/cms/attendance";
import { activityFor, listUpdates, monthSummary, type ActivityKind } from "@/lib/cms/people";
import { listProjects } from "@/lib/cms/projects";
import { requireUser } from "@/lib/cms/session";
import { listTasks, STATUS_LABELS, taskCounts } from "@/lib/cms/tasks";
import { ProfileForm, UpdateComposer } from "@/components/admin/work-forms";
import { Avatar, Card, formatDay, PageHeader, StatusBadge, timeAgo } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

const PRESENCE: Record<string, { label: string; dot: string }> = {
  in: { label: "Working now", dot: "bg-emerald-400" },
  break: { label: "On a break", dot: "bg-amber-400" },
  done: { label: "Done for the day", dot: "bg-sky-400" },
  leave: { label: "On leave", dot: "bg-violet-400" },
  off: { label: "Day off", dot: "bg-slate-400" },
  "not-in": { label: "Not in yet", dot: "bg-slate-400" },
};

const ACTIVITY: Record<ActivityKind, { Icon: typeof Clock3; tone: string }> = {
  update: { Icon: MessageSquareText, tone: "bg-[#2f56d8]/12 text-[#2f56d8] dark:text-[#8fb0ff]" },
  attendance: { Icon: Clock3, tone: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400" },
  task: { Icon: CheckCircle2, tone: "bg-cyan-500/12 text-cyan-700 dark:text-cyan-300" },
  time: { Icon: Timer, tone: "bg-amber-500/12 text-amber-700 dark:text-amber-300" },
  leave: { Icon: Plane, tone: "bg-violet-500/12 text-violet-700 dark:text-violet-300" },
};

const CODE_TONE: Record<string, string> = {
  P: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  WFH: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  HD: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  S: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  L: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  HL: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  H: "bg-slate-500/12 text-slate-600 dark:text-slate-300",
  WO: "bg-slate-500/8 text-muted-foreground",
  A: "bg-red-500/12 text-red-700 dark:text-red-400",
  MC: "bg-red-500/12 text-red-700 dark:text-red-400",
  IN: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
};

function tenure(joinedOn: string, today: string): string {
  const months = (Number(today.slice(0, 4)) - Number(joinedOn.slice(0, 4))) * 12 + Number(today.slice(5, 7)) - Number(joinedOn.slice(5, 7)) - (today.slice(8) < joinedOn.slice(8) ? 1 : 0);
  if (months < 1) return "Joined this month";
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return [years ? `${years} yr` : "", rest ? `${rest} mo` : ""].filter(Boolean).join(" ") + " with us";
}

function Fact({ Icon, label, children }: { Icon: typeof Mail; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon aria-hidden className="size-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{label}</dt>
        <dd className="break-words text-sm text-foreground">{children}</dd>
      </div>
    </div>
  );
}

export default async function PersonPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> }) {
  const user = await requireUser();
  const person = getUser(Number((await params).id));
  if (!person) notFound();
  const everyone = listUsers().filter((member) => member.active);
  const manage = can(user, "users.manage");
  const self = person.id === user.id;
  const manager = everyone.find((member) => member.id === person.managerId);
  const reports = everyone.filter((member) => member.managerId === person.id);
  const today = localDay();
  const managerOfThem = person.managerId === user.id;
  const showWork = self || manage || managerOfThem || can(user, "attendance");
  const canEdit = manage || self;
  // Task titles and notes follow the task page: your own, or everyone's with all-task access.
  const viewerId = self || seesAll(user, "tasks") ? null : user.id;
  const seeReasons = self || mayApproveFor(user, person.id, "attendance.manage");

  const tabs = [
    { id: "overview", label: "Overview", show: true },
    { id: "activity", label: "Activity", show: showWork },
    { id: "tasks", label: "Tasks", show: showWork },
    { id: "attendance", label: "Attendance & leave", show: showWork },
    { id: "edit", label: self ? "Edit my profile" : "Edit profile", show: canEdit },
  ].filter((tab) => tab.show);
  const asked = (await searchParams).tab;
  const tab = tabs.some((item) => item.id === asked) ? asked! : "overview";

  const state = person.active ? (todayBoard([person])[0]?.state ?? "not-in") : "off";
  const counts = showWork ? taskCounts(person.id, today) : null;
  const month = showWork ? monthSummary(person.id, today.slice(0, 7)) : null;
  const balance = showWork ? leaveBalance(person.id, today.slice(0, 4)) : [];
  const updates = listUpdates({ userId: person.id, limit: tab === "overview" ? 5 : 30 });
  const base = `/admin/people/${person.id}`;

  return (
    <>
      <PageHeader title={self ? "My profile" : person.name} back={{ href: "/admin/people", label: "Team directory" }} />

      <Card className="overflow-hidden">
        <div className="relative h-28 bg-[linear-gradient(120deg,#0b1020,#1b2f7a_55%,#2f56d8)] sm:h-32">
          <span aria-hidden className="absolute -right-10 -top-16 size-56 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end sm:gap-5 sm:px-7">
          <span className="relative z-10 -mt-10 inline-flex size-20 shrink-0 items-center justify-center rounded-2xl bg-surface p-1 shadow-lg sm:-mt-12 sm:size-24 [&>span]:size-full [&>span]:rounded-xl [&>span]:text-2xl">
            <Avatar name={person.name} size="lg" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h2 className="font-display text-2xl font-semibold text-foreground">{person.name}</h2>
              {person.active ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-foreground">
                  <span aria-hidden className={cn("size-2 rounded-full", PRESENCE[state].dot)} />
                  {PRESENCE[state].label}
                </span>
              ) : (
                <StatusBadge status="disabled" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {[person.designation || person.roleName, person.department, person.employmentType].filter(Boolean).join(" · ")}
            </p>
            {person.joinedOn ? <p className="mt-0.5 text-xs text-muted-foreground">{tenure(person.joinedOn, today)}</p> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={`mailto:${person.email}`} className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm font-semibold text-foreground hover:bg-muted">
              <Mail aria-hidden className="size-4" /> Email
            </a>
            {person.phone ? (
              <a href={`tel:${person.phone.replace(/[^+\d]/g, "")}`} className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm font-semibold text-foreground hover:bg-muted">
                <Phone aria-hidden className="size-4" /> Call
              </a>
            ) : null}
            {self ? (
              <Link href="/admin/account" className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm font-semibold text-foreground hover:bg-muted">
                <ShieldCheck aria-hidden className="size-4" /> Password & security
              </Link>
            ) : null}
            {manage && !self ? (
              <Link href="/admin/users" className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm font-semibold text-foreground hover:bg-muted">
                <ShieldCheck aria-hidden className="size-4" /> Access & sign-in
              </Link>
            ) : null}
          </div>
        </div>
        <nav aria-label="Profile sections" className="flex gap-1 overflow-x-auto border-t border-border px-3 sm:px-5">
          {tabs.map((item) => (
            <Link
              key={item.id}
              href={item.id === "overview" ? base : `${base}?tab=${item.id}`}
              aria-current={tab === item.id ? "page" : undefined}
              className={cn(
                "whitespace-nowrap border-b-2 px-3 py-3 text-sm font-semibold transition-colors",
                tab === item.id ? "border-[#2f56d8] text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </Card>

      {counts && month && tab !== "edit" ? (
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-6">
          {[
            ["Open tasks", counts.open, counts.overdue ? `${counts.overdue} overdue` : "None overdue"],
            ["Done this month", month.tasksDone, `${counts.toReview} to review`],
            ["Days in this month", month.daysPresent, month.lateDays ? `${month.lateDays} late` : "No late days"],
            ["Hours this month", formatMinutes(month.minutes), month.daysPresent ? `${formatMinutes(month.averageMinutes)} a day` : "No days yet"],
            ["Time on tasks", formatMinutes(month.loggedMinutes), "Logged this month"],
            ["Leave left", balance.reduce((sum, item) => sum + item.left, 0), `of ${balance.reduce((sum, item) => sum + item.quota, 0)} days`],
          ].map(([label, value, hint]) => (
            <Card key={label} className="p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-foreground">{value}</p>
              <p className="text-[11px] text-muted-foreground">{hint}</p>
            </Card>
          ))}
        </div>
      ) : null}

      <div className="mt-6">
        {tab === "overview" ? (
          <div className="grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
            <div className="flex flex-col gap-6">
              <Card className="p-6">
                <h3 className="mb-4 text-sm font-semibold text-foreground">Details</h3>
                <dl className="grid gap-4">
                  <Fact Icon={Mail} label="Email">
                    <a href={`mailto:${person.email}`} className="hover:underline">{person.email}</a>
                  </Fact>
                  {person.phone ? <Fact Icon={Phone} label="Phone">{person.phone}</Fact> : null}
                  {person.location ? <Fact Icon={MapPin} label="Works from">{person.location}</Fact> : null}
                  {person.employeeCode ? <Fact Icon={IdCard} label="Employee ID">{person.employeeCode}</Fact> : null}
                  {person.employmentType ? <Fact Icon={Briefcase} label="Employment">{person.employmentType}</Fact> : null}
                  {person.joinedOn ? <Fact Icon={CalendarDays} label="Joined">{formatDay(person.joinedOn)}</Fact> : null}
                  {person.birthday ? (
                    <Fact Icon={CalendarDays} label="Birthday">
                      {new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${person.birthday}T00:00:00Z`))}
                    </Fact>
                  ) : null}
                  <Fact Icon={ShieldCheck} label="Access">{person.roleName}</Fact>
                  {canEdit && person.emergencyContact ? <Fact Icon={Phone} label="Emergency contact">{person.emergencyContact}</Fact> : null}
                </dl>
              </Card>
              <Card className="p-6">
                <h3 className="mb-4 text-sm font-semibold text-foreground">Reporting line</h3>
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Reports to</p>
                {manager ? (
                  <Link href={`/admin/people/${manager.id}`} className="mt-2 flex items-center gap-3 rounded-xl p-2 hover:bg-muted">
                    <Avatar name={manager.name} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-foreground">{manager.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">{manager.designation || manager.roleName}</span>
                    </span>
                  </Link>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">Nobody set.</p>
                )}
                {reports.length ? (
                  <>
                    <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Team ({reports.length})</p>
                    <div className="mt-2 flex flex-col">
                      {reports.map((member) => (
                        <Link key={member.id} href={`/admin/people/${member.id}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-muted">
                          <Avatar name={member.name} size="sm" />
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium text-foreground">{member.name}</span>
                            <span className="block truncate text-xs text-muted-foreground">{member.designation || member.roleName}</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  </>
                ) : null}
              </Card>
            </div>

            <div className="flex flex-col gap-6">
              <Card className="p-6">
                <h3 className="text-sm font-semibold text-foreground">About</h3>
                {person.bio ? (
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground">{person.bio}</p>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">
                    {self ? (
                      <>
                        Add a few lines about yourself in <Link href={`${base}?tab=edit`} className="font-semibold text-[#2f56d8] hover:underline dark:text-[#8fb0ff]">Edit my profile</Link>.
                      </>
                    ) : (
                      "Nothing added yet."
                    )}
                  </p>
                )}
                {person.skills.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {person.skills.map((skill) => (
                      <span key={skill} className="rounded-full bg-[#2f56d8]/10 px-2.5 py-1 text-xs font-semibold text-[#2f56d8] dark:text-[#8fb0ff]">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : null}
              </Card>

              <Card className="p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-foreground">{self ? "My updates" : "Work updates"}</h3>
                  <Link href="/admin/updates" className="text-xs font-semibold text-[#2f56d8] hover:underline dark:text-[#8fb0ff]">
                    Team feed
                  </Link>
                </div>
                {self ? (
                  <div className="mb-5">
                    <UpdateComposer />
                  </div>
                ) : null}
                {updates.length ? (
                  <ul className="flex flex-col divide-y divide-border">
                    {updates.map((update) => (
                      <li key={update.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                        <div className="min-w-0 flex-1">
                          <p className="whitespace-pre-line break-words text-sm text-foreground">{update.body}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{timeAgo(update.created_at)}</p>
                        </div>
                        {self || manage ? (
                          <form action={deleteUpdateAction}>
                            <input type="hidden" name="id" value={update.id} />
                            <button type="submit" aria-label="Delete update" className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-red-600">
                              <Trash2 aria-hidden className="size-4" />
                            </button>
                          </form>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">{self ? "You haven’t posted an update yet." : "No updates posted yet."}</p>
                )}
              </Card>

              {showWork ? <ProjectsCard personId={person.id} name={person.name} today={today} viewerId={viewerId} /> : null}
            </div>
          </div>
        ) : null}

        {tab === "activity" ? <ActivityCard personId={person.id} tasks={viewerId === null} /> : null}
        {tab === "tasks" ? <TasksCard personId={person.id} today={today} viewerId={viewerId} /> : null}
        {tab === "attendance" ? <AttendanceCard person={person} today={today} balance={balance} reasons={seeReasons} /> : null}

        {tab === "edit" ? (
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-foreground">{manage ? "Profile details" : "My profile"}</h3>
            <p className="mb-5 mt-1 text-sm text-muted-foreground">
              {manage ? "Job details, reporting line and personal details." : "You can change your contact details, skills and bio. Job details are set by an admin."}
            </p>
            <ProfileForm
              person={person}
              managers={everyone.map(({ id, name }) => ({ id, name }))}
              departments={[...new Set(everyone.map((member) => member.department).filter(Boolean))]}
              manage={manage}
            />
          </Card>
        ) : null}
      </div>
    </>
  );
}

const visibleTo = (viewerId: number | null) => (task: { created_by: number; reviewer_id: number | null }) => viewerId === null || task.created_by === viewerId || task.reviewer_id === viewerId;

function ProjectsCard({ personId, name, today, viewerId }: { personId: number; name: string; today: string; viewerId: number | null }) {
  const open = listTasks({ assigneeId: personId }).filter((task) => task.status !== "done" && task.project && visibleTo(viewerId)(task));
  const names = new Set(open.map((task) => task.project));
  const projects = listProjects(today).filter((project) => names.has(project.name) || project.owner_id === personId || (viewerId === null && project.people.includes(name)));
  return (
    <Card className="p-6">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Projects</h3>
      {projects.length ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {projects.map((project) => {
            const percent = project.tasks ? Math.round((project.done / project.tasks) * 100) : 0;
            return (
              <li key={project.name}>
                <Link href={`/admin/projects/${encodeURIComponent(project.name)}`} className="block rounded-xl border border-border p-4 hover:border-[#2f56d8]/50">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-foreground">{project.name}</span>
                    {project.owner_id === personId ? <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">Owner</span> : null}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {project.done}/{project.tasks} tasks done{project.deadline ? ` · due ${formatDay(project.deadline)}` : ""}
                  </span>
                  <span className="mt-3 block h-1.5 overflow-hidden rounded-full bg-muted">
                    <span className="block h-full rounded-full bg-[#2f56d8]" style={{ width: `${percent}%` }} />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">Not on any project yet.</p>
      )}
    </Card>
  );
}

function ActivityCard({ personId, tasks }: { personId: number; tasks: boolean }) {
  const items = activityFor(personId, 40, { tasks });
  return (
    <Card className="p-6">
      <h3 className="mb-5 text-sm font-semibold text-foreground">Recent activity</h3>
      {items.length ? (
        <ol className="relative flex flex-col gap-5 before:absolute before:bottom-2 before:left-4 before:top-2 before:w-px before:bg-border">
          {items.map((item, index) => {
            const { Icon, tone } = ACTIVITY[item.kind];
            return (
              <li key={`${item.kind}-${item.at}-${index}`} className="relative flex gap-4">
                <span className={cn("relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full ring-4 ring-surface", tone)}>
                  <Icon aria-hidden className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {item.link ? <Link href={item.link} className="hover:underline">{item.title}</Link> : item.title}
                  </p>
                  {item.body ? <p className="mt-0.5 whitespace-pre-line break-words text-sm text-muted-foreground">{item.body}</p> : null}
                  <p className="mt-0.5 text-xs text-muted-foreground">{timeAgo(item.at)}</p>
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="text-sm text-muted-foreground">Nothing recorded yet. Check-ins, finished tasks, logged time, leave and updates show up here.</p>
      )}
    </Card>
  );
}

function TasksCard({ personId, today, viewerId }: { personId: number; today: string; viewerId: number | null }) {
  const tasks = listTasks({ assigneeId: personId }).filter(visibleTo(viewerId));
  const open = tasks.filter((task) => task.status !== "done");
  const done = tasks
    .filter((task) => task.status === "done")
    .sort((a, b) => (b.completed_at ?? "").localeCompare(a.completed_at ?? ""))
    .slice(0, 10);
  const row = (task: (typeof tasks)[number]) => (
    <li key={task.id}>
      <Link href={`/admin/tasks/${task.id}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl px-3 py-2.5 hover:bg-muted">
        <span className="min-w-0 flex-1 basis-56">
          <span className="block truncate text-sm font-medium text-foreground">{task.title}</span>
          <span className="block truncate text-xs text-muted-foreground">{[task.project, task.logged ? `${formatMinutes(task.logged)} logged` : ""].filter(Boolean).join(" · ") || "No project"}</span>
        </span>
        {task.due_date && task.status !== "done" ? (
          <span className={cn("text-xs font-semibold", task.due_date < today ? "text-red-600 dark:text-red-400" : "text-muted-foreground")}>
            {task.due_date < today ? "Overdue · " : "Due "}
            {formatDay(task.due_date)}
          </span>
        ) : null}
        <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold capitalize text-foreground">{task.priority}</span>
        <span className="rounded-full bg-[#2f56d8]/10 px-2.5 py-1 text-[11px] font-semibold text-[#2f56d8] dark:text-[#8fb0ff]">{STATUS_LABELS[task.status]}</span>
      </Link>
    </li>
  );
  return (
    <div className="flex flex-col gap-6">
      <Card className="p-4 sm:p-6">
        <h3 className="mb-3 px-3 text-sm font-semibold text-foreground sm:px-0">Open tasks ({open.length})</h3>
        {open.length ? <ul className="flex flex-col">{open.map(row)}</ul> : <p className="px-3 text-sm text-muted-foreground sm:px-0">No open tasks.</p>}
      </Card>
      <Card className="p-4 sm:p-6">
        <h3 className="mb-3 px-3 text-sm font-semibold text-foreground sm:px-0">Recently finished</h3>
        {done.length ? <ul className="flex flex-col">{done.map(row)}</ul> : <p className="px-3 text-sm text-muted-foreground sm:px-0">Nothing finished in the last two weeks.</p>}
      </Card>
    </div>
  );
}

function AttendanceCard({
  person,
  today,
  balance,
  reasons,
}: {
  reasons: boolean;
  person: { id: number; name: string; created_at: string };
  today: string;
  balance: { type: string; quota: number; used: number; left: number }[];
}) {
  const month = today.slice(0, 7);
  const row = register(month, [person])[0];
  const days = daysInMonth(month);
  const requests = listRequests({ userId: person.id }).slice(0, 8);
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="flex flex-col gap-6">
        <Card className="p-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            {new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${month}-01T00:00:00Z`))}
          </h3>
          <div className="grid max-w-xl grid-cols-7 gap-1.5 text-center text-[11px] sm:gap-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <span key={day} className="font-semibold text-muted-foreground">{day}</span>
            ))}
            {Array.from({ length: (new Date(`${days[0]}T00:00:00Z`).getUTCDay() + 6) % 7 }, (_, index) => (
              <span key={`pad-${index}`} />
            ))}
            {days.map((day, index) => {
              const cell = row?.cells[index];
              const code = cell?.code ?? "";
              return (
                <span
                  key={day}
                  title={cell?.record ? `${localTime(cell.record.check_in_at)}${cell.record.check_out_at ? ` – ${localTime(cell.record.check_out_at)}` : ""}` : undefined}
                  className={cn("flex aspect-square flex-col items-center justify-center rounded-lg", CODE_TONE[code] ?? "bg-muted/40 text-muted-foreground", day === today && "ring-2 ring-[#2f56d8]")}
                >
                  <span className="text-xs font-semibold tabular-nums">{Number(day.slice(8))}</span>
                  <span className="text-[9px] font-semibold">{code}</span>
                </span>
              );
            })}
          </div>
          <p className="mt-4 text-[11px] text-muted-foreground">P present · IN working now · WFH work from home · HD half day · S short day · L leave · HL half-day leave · H holiday · WO weekly off · A absent · MC missed check-out</p>
        </Card>
        <Card className="p-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Leave and correction requests</h3>
          {requests.length ? (
            <ul className="flex flex-col divide-y divide-border">
              {requests.map((request) => (
                <li key={request.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3 first:pt-0 last:pb-0">
                  <span className="min-w-0 flex-1 basis-56">
                    <span className="block text-sm font-medium text-foreground">
                      {request.kind === "leave" ? request.leave_type || "Leave" : "Attendance correction"} · {formatDay(request.from_day)}
                      {request.to_day !== request.from_day ? ` – ${formatDay(request.to_day)}` : ""}
                    </span>
                    {reasons && request.reason ? <span className="block truncate text-xs text-muted-foreground">{request.reason}</span> : null}
                  </span>
                  <StatusBadge status={request.status} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No requests yet.</p>
          )}
        </Card>
      </div>
      <Card className="h-fit p-6">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Leave balance · {today.slice(0, 4)}</h3>
        {balance.length ? (
          <ul className="flex flex-col gap-4">
            {balance.map((item) => (
              <li key={item.type}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium text-foreground">{item.type}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {item.left} of {item.quota} left
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-[#2f56d8]" style={{ width: `${item.quota ? Math.min(100, (item.used / item.quota) * 100) : 0}%` }} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No leave types set up.</p>
        )}
      </Card>
    </div>
  );
}

