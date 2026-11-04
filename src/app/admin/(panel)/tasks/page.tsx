import Link from "next/link";
import { AlertTriangle, CalendarClock, ListChecks, Plus } from "lucide-react";

import { listUsers, seesAll } from "@/lib/cms/auth";
import { addDays, localDay, weekday } from "@/lib/cms/attendance";
import { requireUser } from "@/lib/cms/session";
import { listTasks, STATUS_LABELS, taskCounts, taskProjects, timesheet, type TaskFilter } from "@/lib/cms/tasks";
import { TaskBoard } from "@/components/admin/task-board";
import { hours, PRIORITY_STYLE } from "@/components/admin/task-format";
import { Avatar, buttonClass, Card, Empty, inputClass, PageHeader, Stat, theadClass } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

type Search = { view?: string; who?: string; project?: string; priority?: string; q?: string; week?: string };

export default async function TasksPage({ searchParams }: { searchParams: Promise<Search> }) {
  const user = await requireUser();
  const params = await searchParams;
  const view = params.view === "list" ? "list" : params.view === "time" ? "time" : "board";
  const all = seesAll(user, "tasks");
  const today = localDay();
  const team = listUsers().filter((member) => member.active);
  const who = params.who ?? "mine";

  const filter: TaskFilter = { project: params.project || undefined, priority: params.priority || undefined, q: params.q || undefined };
  if (who === "mine") filter.assigneeId = user.id;
  else if (who === "created") filter.visibleTo = user.id;
  else if (who !== "everyone" && Number(who)) filter.assigneeId = Number(who);
  if (!all) filter.visibleTo = user.id;
  const tasks = listTasks(filter);
  const counts = taskCounts(user.id, today);
  const projects = taskProjects();
  const tab = (key: string) => `/admin/tasks?${new URLSearchParams({ ...params, view: key } as Record<string, string>).toString()}`;

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

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label="My open tasks" value={counts.open} href="/admin/tasks?who=mine" icon={<ListChecks className="size-4" />} tone="blue" />
        <Stat label="Due today" value={counts.dueToday} icon={<CalendarClock className="size-4" />} tone="amber" />
        <Stat label="Overdue" value={counts.overdue} icon={<AlertTriangle className="size-4" />} tone="violet" />
      </div>

      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center">
        <nav className="flex w-fit rounded-full border border-border bg-surface p-1 text-sm" aria-label="View">
          {[
            ["board", "Board"],
            ["list", "List"],
            ["time", "Timesheet"],
          ].map(([key, label]) => (
            <Link
              key={key}
              href={tab(key)}
              className={cn("rounded-full px-4 py-1.5 font-semibold", view === key ? "bg-[#0b1020] text-white dark:bg-white dark:text-[#0b1020]" : "text-muted-foreground hover:text-foreground")}
            >
              {label}
            </Link>
          ))}
        </nav>
        {view !== "time" ? (
          <form className="flex flex-1 flex-col gap-2 sm:flex-row">
            <input type="hidden" name="view" value={view} />
            <select name="who" defaultValue={who} className={`${inputClass} sm:w-48`} aria-label="Whose tasks">
              <option value="mine">Assigned to me</option>
              <option value="created">I created / mine</option>
              {all ? <option value="everyone">Everyone</option> : null}
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
            <input name="q" defaultValue={params.q ?? ""} placeholder="Search tasks…" className={`${inputClass} sm:max-w-56`} />
            <button className={buttonClass.secondary}>Filter</button>
          </form>
        ) : null}
      </div>

      {view === "board" ? <TaskBoard tasks={tasks} today={today} /> : null}

      {view === "list" ? (
        <Card className="overflow-hidden">
          {tasks.length === 0 ? (
            <Empty title="No tasks here">Create one with “New task”, or change the filters.</Empty>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className={theadClass}>
                  <tr>
                    <th className="px-5 py-3 font-medium">Task</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="hidden px-5 py-3 font-medium md:table-cell">Assigned to</th>
                    <th className="px-5 py-3 font-medium">Due</th>
                    <th className="hidden px-5 py-3 font-medium lg:table-cell">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[...tasks]
                    .sort((a, b) => (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999"))
                    .map((task) => (
                      <tr key={task.id} className="hover:bg-foreground/[0.03]">
                        <td className="px-5 py-3">
                          <Link href={`/admin/tasks/${task.id}`} className="font-semibold text-foreground hover:underline">
                            {task.title}
                          </Link>
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", PRIORITY_STYLE[task.priority])}>{task.priority}</span>
                            {task.project ? <span className="text-xs text-muted-foreground">{task.project}</span> : null}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">{STATUS_LABELS[task.status]}</td>
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
                            "px-5 py-3 text-xs font-medium",
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
              </table>
            </div>
          )}
        </Card>
      ) : null}

      {view === "time" ? <Timesheet userId={all ? undefined : user.id} week={params.week} today={today} /> : null}
    </>
  );
}

/** Hours logged on tasks per person per day, Monday to Sunday. */
function Timesheet({ userId, week, today }: { userId?: number; week?: string; today: string }) {
  const base = week && /^\d{4}-\d{2}-\d{2}$/.test(week) ? week : today;
  const monday = addDays(base, -((weekday(base) + 6) % 7));
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const rows = timesheet(new Date(`${monday}T00:00:00+05:30`).toISOString(), new Date(`${addDays(monday, 7)}T00:00:00+05:30`).toISOString(), userId);
  const people = [...new Map(rows.map((row) => [row.user_id, row.name])).entries()];
  const cell = (id: number, day: string) => rows.find((row) => row.user_id === id && row.day === day)?.minutes ?? 0;
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
        <Link href={`/admin/tasks?view=time&week=${addDays(monday, -7)}`} className="text-sm font-medium text-muted-foreground hover:text-foreground">
          ← Previous week
        </Link>
        <p className="text-sm font-semibold text-foreground">Week of {monday}</p>
        <Link href={`/admin/tasks?view=time&week=${addDays(monday, 7)}`} className="text-sm font-medium text-muted-foreground hover:text-foreground">
          Next week →
        </Link>
      </div>
      {people.length === 0 ? (
        <Empty title="No time logged this week">Start a timer or log time on a task.</Empty>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className={theadClass}>
              <tr>
                <th className="px-5 py-3 font-medium">Person</th>
                {days.map((day) => (
                  <th key={day} className="px-3 py-3 text-center font-medium">
                    {new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${day}T00:00:00Z`))}
                  </th>
                ))}
                <th className="px-5 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {people.map(([id, name]) => {
                const total = days.reduce((sum, day) => sum + cell(id, day), 0);
                return (
                  <tr key={id}>
                    <td className="px-5 py-3 font-medium text-foreground">{name}</td>
                    {days.map((day) => (
                      <td key={day} className="px-3 py-3 text-center tabular-nums text-muted-foreground">
                        {cell(id, day) ? hours(cell(id, day)) : "·"}
                      </td>
                    ))}
                    <td className="px-5 py-3 text-right font-semibold tabular-nums text-foreground">{hours(total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
