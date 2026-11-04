import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Link2, Play, Square, Trash2, X } from "lucide-react";

import { deleteTaskAction, deleteTimeEntryAction, taskItemAction, timerAction } from "@/app/admin/work-actions";
import { can, listUsers, seesAll } from "@/lib/cms/auth";
import { localDay } from "@/lib/cms/attendance";
import { timeline } from "@/lib/cms/crm";
import { requireUser } from "@/lib/cms/session";
import { getTask, runningTimer, STATUS_LABELS, taskItems, taskProjects, timeEntries } from "@/lib/cms/tasks";
import { Elapsed } from "@/components/admin/live-clock";
import { hours, PRIORITY_STYLE } from "@/components/admin/task-format";
import { LogTimeForm, TaskCommentForm, TaskPanel, TaskText } from "@/components/admin/task-tools";
import { Timeline } from "@/components/admin/timeline";
import { buttonClass, Card, formatDay, formatWhen, inputClass, PageHeader } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

import { linkedRecord } from "../links";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const task = getTask(Number(id));
  if (!task || !(seesAll(user, "tasks") || task.assignee_id === user.id || task.created_by === user.id)) notFound();
  const today = localDay();
  const items = taskItems(task.id);
  const entries = timeEntries(task.id);
  const timer = runningTimer(user.id);
  const timingThis = timer?.task_id === task.id;
  const link = linkedRecord(user, task.entity, task.entity_id);
  const team = listUsers()
    .filter((member) => member.active)
    .map(({ id: memberId, name }) => ({ id: memberId, name }));
  const canDelete = task.created_by === user.id || seesAll(user, "tasks");
  const overdue = task.due_date && task.status !== "done" && task.due_date < today;
  const progress = task.estimate_minutes ? Math.min(100, Math.round((task.logged / task.estimate_minutes) * 100)) : null;

  return (
    <>
      <PageHeader
        title="Task"
        back={{ href: "/admin/tasks", label: "Tasks" }}
        actions={
          canDelete ? (
            <form action={deleteTaskAction}>
              <input type="hidden" name="id" value={task.id} />
              <button className={buttonClass.danger}>
                <Trash2 className="size-4" aria-hidden /> Delete
              </button>
            </form>
          ) : null
        }
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card className="p-6">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
              <span className={cn("rounded-full px-2 py-0.5 font-bold uppercase tracking-wide", PRIORITY_STYLE[task.priority])}>{task.priority}</span>
              <span className="rounded-full bg-foreground/[0.06] px-2 py-0.5 font-semibold text-foreground">{STATUS_LABELS[task.status]}</span>
              {task.project ? <span className="rounded-full bg-foreground/[0.05] px-2 py-0.5 text-muted-foreground">{task.project}</span> : null}
              {task.due_date ? (
                <span className={cn("font-semibold", overdue ? "text-red-600 dark:text-red-400" : "text-muted-foreground")}>
                  {overdue ? "Overdue · " : "Due "}
                  {formatDay(task.due_date)}
                </span>
              ) : null}
            </div>
            <TaskText id={task.id} title={task.title} description={task.description} editable />
            <p className="mt-4 text-xs text-muted-foreground">
              Created by {task.creator_name ?? "a former member"} · {formatWhen(task.created_at)}
              {task.completed_at ? ` · done ${formatWhen(task.completed_at)}` : ""}
            </p>
            {link ? (
              <Link href={link.href} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#2f56d8]/10 px-3 py-1 text-xs font-semibold text-[#2f56d8] hover:underline dark:text-[#8fb0ff]">
                <Link2 className="size-3.5" aria-hidden /> {link.label}
              </Link>
            ) : null}
          </Card>

          <Card className="p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Checklist</h2>
              {items.length ? (
                <span className="text-xs text-muted-foreground">
                  {items.filter((item) => item.done).length} of {items.length} done
                </span>
              ) : null}
            </div>
            {items.length ? (
              <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-foreground/[0.06]">
                <span
                  className="block h-full rounded-full bg-[linear-gradient(90deg,#2f56d8,#0a8ea6)]"
                  style={{ width: `${(items.filter((item) => item.done).length / items.length) * 100}%` }}
                />
              </div>
            ) : null}
            <ul className="flex flex-col">
              {items.map((item) => (
                <li key={item.id} className="group flex items-center gap-3 rounded-lg px-1 py-1.5 hover:bg-foreground/[0.03]">
                  <form action={taskItemAction}>
                    <input type="hidden" name="task_id" value={task.id} />
                    <input type="hidden" name="item_id" value={item.id} />
                    <input type="hidden" name="op" value="toggle" />
                    <button
                      aria-label={item.done ? `Mark "${item.body}" not done` : `Mark "${item.body}" done`}
                      className={cn(
                        "flex size-5 items-center justify-center rounded-md border transition-colors",
                        item.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-border hover:border-foreground/40",
                      )}
                    >
                      {item.done ? <Check className="size-3.5" aria-hidden /> : null}
                    </button>
                  </form>
                  <span className={cn("flex-1 text-sm", item.done ? "text-muted-foreground line-through" : "text-foreground")}>{item.body}</span>
                  <form action={taskItemAction}>
                    <input type="hidden" name="task_id" value={task.id} />
                    <input type="hidden" name="item_id" value={item.id} />
                    <input type="hidden" name="op" value="delete" />
                    <button aria-label={`Remove "${item.body}"`} className="rounded p-1 text-muted-foreground opacity-0 hover:text-red-600 group-hover:opacity-100 focus:opacity-100">
                      <X className="size-3.5" aria-hidden />
                    </button>
                  </form>
                </li>
              ))}
            </ul>
            <form action={taskItemAction} className="mt-2 flex gap-2">
              <input type="hidden" name="task_id" value={task.id} />
              <input type="hidden" name="op" value="add" />
              <input name="body" required maxLength={300} placeholder="Add a step…" aria-label="New checklist step" className={inputClass} />
              <button className={buttonClass.secondary}>Add</button>
            </form>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Comments & activity</h2>
            <TaskCommentForm id={task.id} />
            <div className="mt-6">
              <Timeline notes={timeline("task", task.id)} received={task.created_at} />
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="h-fit p-5">
            <TaskPanel
              key={`${task.status}:${task.assignee_id}:${task.priority}:${task.due_date}:${task.updated_at}`}
              task={task}
              team={team}
              me={{ id: user.id, name: user.name }}
              canAssign={can(user, "tasks.assign") || seesAll(user, "tasks")}
              projects={taskProjects()}
            />
          </Card>

          <Card className="h-fit p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Time</h2>
              <span className="text-xs font-semibold tabular-nums text-foreground">
                {hours(task.logged)}
                {task.estimate_minutes ? <span className="font-normal text-muted-foreground"> of {hours(task.estimate_minutes)}</span> : null}
              </span>
            </div>
            {progress !== null ? (
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-foreground/[0.06]">
                <span className={cn("block h-full rounded-full", task.logged > (task.estimate_minutes ?? 0) ? "bg-red-500" : "bg-[#2f56d8]")} style={{ width: `${progress}%` }} />
              </div>
            ) : null}
            <form action={timerAction} className="mt-4">
              <input type="hidden" name="task_id" value={task.id} />
              <input type="hidden" name="op" value={timingThis ? "stop" : "start"} />
              <button
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-[filter] hover:brightness-110",
                  timingThis ? "bg-red-500" : "bg-[linear-gradient(100deg,#2f56d8,#0a8ea6)]",
                )}
              >
                {timingThis && timer ? (
                  <>
                    <Square className="size-4" aria-hidden /> Stop · <Elapsed since={timer.started_at} />
                  </>
                ) : (
                  <>
                    <Play className="size-4" aria-hidden /> Start timer
                  </>
                )}
              </button>
              {timer && !timingThis ? <p className="mt-1.5 text-[11px] text-muted-foreground">This stops your timer on “{timer.title}”.</p> : null}
            </form>
            <details className="mt-4">
              <summary className="cursor-pointer text-xs font-semibold text-muted-foreground hover:text-foreground">Log time manually</summary>
              <div className="mt-3">
                <LogTimeForm taskId={task.id} today={today} />
              </div>
            </details>
            {entries.filter((entry) => entry.ended_at).length ? (
              <ul className="mt-4 flex flex-col divide-y divide-border border-t border-border text-xs">
                {entries
                  .filter((entry) => entry.ended_at)
                  .slice(0, 12)
                  .map((entry) => (
                    <li key={entry.id} className="group flex items-center gap-2 py-2">
                      <span className="font-semibold tabular-nums text-foreground">{hours(entry.minutes)}</span>
                      <span className="min-w-0 flex-1 truncate text-muted-foreground" title={entry.note}>
                        {entry.user_name ?? "Former member"} · {formatDay(entry.started_at)}
                        {entry.note ? ` · ${entry.note}` : ""}
                      </span>
                      {entry.user_id === user.id || seesAll(user, "tasks") ? (
                        <form action={deleteTimeEntryAction}>
                          <input type="hidden" name="id" value={entry.id} />
                          <button aria-label="Delete time entry" className="rounded p-0.5 text-muted-foreground opacity-0 hover:text-red-600 group-hover:opacity-100 focus:opacity-100">
                            <X className="size-3.5" aria-hidden />
                          </button>
                        </form>
                      ) : null}
                    </li>
                  ))}
              </ul>
            ) : null}
          </Card>
        </div>
      </div>
    </>
  );
}
