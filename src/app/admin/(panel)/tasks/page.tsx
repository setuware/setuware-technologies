import Link from "next/link";
import { AlertTriangle, CalendarClock, ListChecks, Plus, Repeat2, SearchCheck } from "lucide-react";

import { bulkTaskAction } from "@/app/admin/work-actions";

import { can, listUsers, seesAll } from "@/lib/cms/auth";
import { localDay } from "@/lib/cms/attendance";
import { requireUser } from "@/lib/cms/session";
import { DUE_FILTERS, listTasks, STATUS_LABELS, TASK_STATUSES, taskCounts, taskProjects, workload, type DueFilter, type TaskFilter, type TaskStatus } from "@/lib/cms/tasks";
import { TaskBoard } from "@/components/admin/task-board";
import { TaskBulkBar } from "@/components/admin/task-bulk";
import { DUE_GROUPS, dueGroup, hours, PRIORITY_STYLE } from "@/components/admin/task-format";
import { Avatar, buttonClass, Card, Empty, inputClass, PageHeader, Stat, theadClass } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

type Search = { view?: string; who?: string; project?: string; priority?: string; q?: string; week?: string; due?: string; status?: string; done?: string };

const CHIPS: [key: "due" | "status" | "who", value: string, label: string][] = [
  ["due", "overdue", "Overdue"],
  ["due", "today", "Due today"],
  ["due", "week", "Next 7 days"],
  ["due", "none", "No due date"],
  ["status", "review", "In review"],
];

export default async function TasksPage({ searchParams }: { searchParams: Promise<Search> }) {
  const user = await requireUser();
  const params = await searchParams;
  const all = seesAll(user, "tasks");
  const view = params.view === "list" ? "list" : params.view === "team" && all ? "team" : "board";
  const today = localDay();
  const team = listUsers().filter((member) => member.active);
  const who = params.who ?? "mine";

  const due = DUE_FILTERS.includes(params.due as DueFilter) ? (params.due as DueFilter) : undefined;
  const status = TASK_STATUSES.includes(params.status as TaskStatus) ? params.status : undefined;
  const filter: TaskFilter = {
    project: params.project || undefined,
    priority: params.priority || undefined,
    q: params.q || undefined,
    status,
    due,
    today,
    oldDone: params.done === "1",
  };
  if (who === "mine") filter.assigneeId = user.id;
  else if (who === "unassigned") filter.unassigned = true;
  else if (who === "review") filter.reviewerId = user.id;
  else if (who === "created") filter.visibleTo = user.id;
  else if (who !== "everyone" && Number(who)) filter.assigneeId = Number(who);
  if (!all) filter.visibleTo = user.id;
  const tasks = listTasks(filter);
  const counts = taskCounts(user.id, today);
  const projects = taskProjects();
  const link = (patch: Partial<Search>) => {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries({ ...params, ...patch })) if (value) next.set(key, value);
    return `/admin/tasks?${next.toString()}`;
  };
  const tab = (key: string) => link({ view: key });
  const loads = view === "team" ? workload(today) : [];
  const canAssign = can(user, "tasks.assign") || all;
  const groups = DUE_GROUPS.map(([key, label]) => ({ key, label, tasks: tasks.filter((task) => dueGroup(task, today) === key) })).filter((group) => group.tasks.length);
  const active = (key: "due" | "status" | "who", value: string) => (key === "due" ? due : key === "status" ? status : who) === value;

  return (
    <>
      <PageHeader
        title="Tasks"
        description="Plan, assign and track the team's work. Drag cards between columns."
        actions={
          <Link href="/admin/tasks/new" className={buttonClass.primary}>
            <Plus className="size-4" aria-hidden /> New task
          </Link>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="My open tasks" value={counts.open} href="/admin/tasks?who=mine" icon={<ListChecks className="size-4" />} tone="blue" />
        <Stat label="Due today" value={counts.dueToday} icon={<CalendarClock className="size-4" />} tone="amber" />
        <Stat label="Overdue" value={counts.overdue} icon={<AlertTriangle className="size-4" />} tone="violet" />
        <Stat label="Waiting for my review" value={counts.toReview} href="/admin/tasks?who=review" icon={<SearchCheck className="size-4" />} tone="teal" />
      </div>

      <div className="mb-3 flex flex-col gap-3">
        <nav className="flex w-fit rounded-full border border-border bg-surface p-1 text-sm" aria-label="View">
          {[
            ["board", "Board"],
            ["list", "List"],
            ...(all ? [["team", "Team"]] : []),
            ["time", "Timesheet"],
          ].map(([key, label]) => (
            <Link
              key={key}
              href={key === "time" ? "/admin/timesheets" : tab(key)}
              className={cn("rounded-full px-4 py-1.5 font-semibold", view === key ? "bg-[#0b1020] text-white dark:bg-white dark:text-[#0b1020]" : "text-muted-foreground hover:text-foreground")}
            >
              {label}
            </Link>
          ))}
        </nav>
        {view !== "team" ? (
        <form className="grid flex-1 grid-cols-2 gap-2 sm:flex sm:flex-row sm:flex-wrap">
            <input type="hidden" name="view" value={view} />
            <select name="who" defaultValue={who} className={`${inputClass} col-span-2 sm:w-48`} aria-label="Whose tasks">
              <option value="mine">Assigned to me</option>
              <option value="review">Waiting for my review</option>
              <option value="created">I created / mine</option>
              {all ? <option value="everyone">Everyone</option> : null}
              {all ? <option value="unassigned">Unassigned</option> : null}
              {all
                ? team
                    .filter((member) => member.id !== user.id)
                    .map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))
                : null}
            </select>
            <select name="project" defaultValue={params.project ?? ""} className={`${inputClass} sm:w-44`} aria-label="Project">
              <option value="">All projects</option>
              {projects.map((project) => (
                <option key={project}>{project}</option>
              ))}
            </select>
            <select name="priority" defaultValue={params.priority ?? ""} className={`${inputClass} sm:w-36`} aria-label="Priority">
              <option value="">Any priority</option>
              {["urgent", "high", "normal", "low"].map((priority) => (
                <option key={priority} value={priority} className="capitalize">
                  {priority}
                </option>
              ))}
            </select>
            <select name="status" defaultValue={status ?? ""} className={`${inputClass} sm:w-36`} aria-label="Status">
              <option value="">Any status</option>
              {TASK_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {STATUS_LABELS[value]}
                </option>
              ))}
            </select>
            {due ? <input type="hidden" name="due" value={due} /> : null}
            <input name="q" defaultValue={params.q ?? ""} placeholder="Search tasks…" className={`${inputClass} col-span-2 sm:w-auto sm:min-w-40 sm:flex-1`} />
            <button className={`${buttonClass.secondary} col-span-2`}>Filter</button>
          </form>
        ) : null}
      </div>

      {view !== "team" ? (
        <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Quick filters">
          {[...CHIPS, ...(all ? ([["who", "unassigned", "Unassigned"]] as typeof CHIPS) : [])].map(([key, value, label]) => {
            const on = active(key, value);
            return (
              <Link
                key={`${key}-${value}`}
                href={link({ [key]: on ? (key === "who" ? "everyone" : undefined) : value })}
                aria-current={on ? "true" : undefined}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                  on ? "border-[#2f56d8] bg-[#2f56d8] text-white" : "border-border bg-surface text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                )}
              >
                {label}
              </Link>
            );
          })}
          <Link
            href={link({ done: params.done === "1" ? undefined : "1" })}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
              params.done === "1" ? "border-emerald-600 bg-emerald-600 text-white" : "border-dashed border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {params.done === "1" ? "Showing older done" : "Show older done"}
          </Link>
          {due || status || params.priority || params.project || params.q ? (
            <Link href={link({ due: undefined, status: undefined, priority: undefined, project: undefined, q: undefined })} className="shrink-0 px-2 py-1 text-xs font-semibold text-[#2f56d8] hover:underline dark:text-[#8fb0ff]">
              Clear filters
            </Link>
          ) : null}
        </div>
      ) : null}

      {view === "team" ? (
        <Card className="overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">Team workload</h2>
            <p className="text-xs text-muted-foreground">Open tasks per person, most overdue first. Hours left are estimates minus time logged.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={theadClass}>
                <tr>
                  <th className="px-5 py-3 font-medium">Person</th>
                  <th className="px-5 py-3 text-right font-medium">Open</th>
                  <th className="px-5 py-3 text-right font-medium">Overdue</th>
                  <th className="hidden px-5 py-3 text-right font-medium sm:table-cell">Next 7 days</th>
                  <th className="hidden px-5 py-3 text-right font-medium md:table-cell">In review</th>
                  <th className="hidden px-5 py-3 text-right font-medium md:table-cell">Hours left</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loads.map((row) => {
                  const whoKey = row.userId === null ? "unassigned" : row.userId === user.id ? "mine" : String(row.userId);
                  const max = Math.max(1, ...loads.map((item) => item.open));
                  return (
                    <tr key={row.userId ?? "none"} className="hover:bg-foreground/[0.03]">
                      <td className="px-5 py-3">
                        <Link href={link({ view: "list", who: whoKey, due: undefined, status: undefined })} className="flex items-center gap-2 font-semibold text-foreground hover:underline">
                          {row.userId === null ? <span className="inline-flex size-7 items-center justify-center rounded-full border border-dashed border-border text-xs text-muted-foreground">?</span> : <Avatar name={row.name} size="sm" />}
                          <span className="min-w-0">
                            {row.name}
                            <span className="mt-1 block h-1 w-24 overflow-hidden rounded-full bg-foreground/[0.06] sm:w-32">
                              <span className={cn("block h-full rounded-full", row.overdue ? "bg-red-500" : "bg-[#2f56d8]")} style={{ width: `${(row.open / max) * 100}%` }} />
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold tabular-nums text-foreground">{row.open}</td>
                      <td className="px-5 py-3 text-right tabular-nums">
                        {row.overdue ? (
                          <Link href={link({ view: "list", who: whoKey, due: "overdue" })} className="font-semibold text-red-600 hover:underline dark:text-red-400">
                            {row.overdue}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </td>
                      <td className="hidden px-5 py-3 text-right tabular-nums text-muted-foreground sm:table-cell">{row.dueWeek}</td>
                      <td className="hidden px-5 py-3 text-right tabular-nums text-muted-foreground md:table-cell">{row.inReview}</td>
                      <td className="hidden px-5 py-3 text-right text-xs tabular-nums text-muted-foreground md:table-cell">
                        {row.remaining ? hours(row.remaining) : "—"}
                        {row.unestimated ? <span className="block text-[11px]">{row.unestimated} not estimated</span> : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {view === "board" ? <TaskBoard tasks={tasks} today={today} /> : null}

      {view === "list" ? (
        <Card className="overflow-hidden">
          {tasks.length === 0 ? (
            <Empty title="No tasks here">Create one with “New task”, or change the filters.</Empty>
          ) : (
            <form action={bulkTaskAction}>
              <TaskBulkBar team={team.map(({ id, name }) => ({ id, name }))} canAssign={canAssign} me={user.id} />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className={theadClass}>
                    <tr>
                      <th className="w-10 py-3 pl-5 pr-0 font-medium">
                        <span className="sr-only">Select</span>
                      </th>
                      <th className="px-5 py-3 font-medium">Task</th>
                      <th className="hidden px-5 py-3 font-medium sm:table-cell">Status</th>
                      <th className="hidden px-5 py-3 font-medium md:table-cell">Assigned to</th>
                      <th className="px-5 py-3 font-medium">Due</th>
                      <th className="hidden px-5 py-3 font-medium lg:table-cell">Time</th>
                    </tr>
                  </thead>
                  {groups.map((group) => (
                    <tbody key={group.key} className="divide-y divide-border border-t border-border">
                      <tr className="bg-foreground/[0.025]">
                        <th colSpan={6} scope="colgroup" className={cn("px-5 py-2 text-left text-[11px] font-bold uppercase tracking-[0.12em]", group.key === "overdue" ? "text-red-600 dark:text-red-400" : "text-muted-foreground")}>
                          {group.label} · {group.tasks.length}
                        </th>
                      </tr>
                      {[...group.tasks]
                        .sort((a, b) => (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999"))
                        .map((task) => (
                          <tr key={task.id} className="hover:bg-foreground/[0.03]">
                            <td className="w-10 py-3 pl-5 pr-0 align-top">
                              <input type="checkbox" name="ids" value={task.id} aria-label={`Select ${task.title}`} className="mt-0.5 size-4 accent-[#2f56d8]" />
                            </td>
                            <td className="px-5 py-3">
                              <Link href={`/admin/tasks/${task.id}`} className="font-semibold text-foreground hover:underline">
                                {task.title}
                              </Link>
                              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", PRIORITY_STYLE[task.priority])}>{task.priority}</span>
                                <span className="text-xs text-muted-foreground sm:hidden">{STATUS_LABELS[task.status]}</span>
                                {task.project ? <span className="text-xs text-muted-foreground">{task.project}</span> : null}
                                {task.repeat ? (
                                  <span className="inline-flex items-center gap-1 text-xs capitalize text-muted-foreground">
                                    <Repeat2 className="size-3" aria-hidden /> {task.repeat}
                                  </span>
                                ) : null}
                              </div>
                            </td>
                            <td className="hidden px-5 py-3 text-muted-foreground sm:table-cell">{STATUS_LABELS[task.status]}</td>
                            <td className="hidden px-5 py-3 md:table-cell">
                              {task.assignee_name ? (
                                <span className="flex items-center gap-2 text-xs">
                                  <Avatar name={task.assignee_name} size="sm" /> {task.assignee_name}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">Unassigned</span>
                              )}
                            </td>
                            <td
                              className={cn(
                                "whitespace-nowrap px-5 py-3 text-xs font-medium",
                                task.due_date && task.status !== "done" && task.due_date < today ? "text-red-600 dark:text-red-400" : "text-muted-foreground",
                              )}
                            >
                              {task.due_date ?? "—"}
                            </td>
                            <td className="hidden px-5 py-3 text-xs text-muted-foreground lg:table-cell">
                              {hours(task.logged)}
                              {task.estimate_minutes ? ` / ${hours(task.estimate_minutes)}` : ""}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  ))}
                </table>
              </div>
            </form>
          )}
        </Card>
      ) : null}
    </>
  );
}
