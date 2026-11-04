import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";

import { can, listUsers, seesAll } from "@/lib/cms/auth";
import { localDay } from "@/lib/cms/attendance";
import { getProject, PROJECT_STATUS_LABELS, projectHours } from "@/lib/cms/projects";
import { requireUser } from "@/lib/cms/session";
import { listTasks, STATUS_LABELS, TASK_STATUSES } from "@/lib/cms/tasks";
import { PRIORITY_STYLE } from "@/components/admin/task-format";
import { ProjectForm } from "@/components/admin/work-forms";
import { buttonClass, Card, formatDay, PageHeader } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

import { STATUS_STYLE } from "../style";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

const h = (minutes: number) => `${Math.round(minutes / 6) / 10}h`;

export default async function ProjectPage({ params }: { params: Promise<{ name: string }> }) {
  const user = await requireUser();
  const name = decodeURIComponent((await params).name);
  const today = localDay();
  const project = getProject(name, today);
  if (!project) notFound();
  const all = seesAll(user, "tasks");
  const tasks = listTasks({ project: project.name, oldDone: true, visibleTo: all ? undefined : user.id });
  const people = projectHours(project.name);
  const canEdit = can(user, "tasks.assign") || all;

  return (
    <>
      <PageHeader
        title={project.name}
        description={[project.client, project.owner_name ? `Managed by ${project.owner_name}` : ""].filter(Boolean).join(" · ") || undefined}
        back={{ href: "/admin/projects", label: "Projects" }}
        actions={
          <Link href={`/admin/tasks?project=${encodeURIComponent(project.name)}&who=${all ? "everyone" : "created"}&view=list`} className={buttonClass.secondary}>
            Open on the board
          </Link>
        }
      />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          ["Status", PROJECT_STATUS_LABELS[project.status]],
          ["Tasks done", `${project.done}/${project.tasks}`],
          ["Overdue", project.overdue],
          ["Hours", `${h(project.logged)}${project.budget_hours ? ` / ${project.budget_hours}h` : ""}`],
          ["Deadline", project.deadline ? formatDay(project.deadline) : "—"],
        ].map(([label, value]) => (
          <Card key={label} className="p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={cn("mt-1 font-display text-xl font-semibold text-foreground", label === "Overdue" && Number(value) > 0 && "text-red-600 dark:text-red-400")}>{value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold text-foreground">Tasks</h2>
            <Link href="/admin/tasks/new" className="inline-flex items-center gap-1 text-xs font-semibold text-[#2f56d8] hover:underline dark:text-[#8fb0ff]">
              <Plus className="size-3.5" aria-hidden /> New task
            </Link>
          </div>
          {TASK_STATUSES.map((status) => {
            const items = tasks.filter((task) => task.status === status);
            if (!items.length) return null;
            return (
              <div key={status} className="border-b border-border last:border-b-0">
                <p className="bg-foreground/[0.025] px-5 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  {STATUS_LABELS[status]} · {items.length}
                </p>
                <ul className="divide-y divide-border">
                  {items.map((task) => (
                    <li key={task.id} className="flex items-center gap-3 px-5 py-2.5 text-sm">
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", PRIORITY_STYLE[task.priority])}>{task.priority}</span>
                      <Link href={`/admin/tasks/${task.id}`} className={cn("min-w-0 flex-1 truncate hover:underline", task.status === "done" ? "text-muted-foreground line-through" : "text-foreground")}>
                        {task.title}
                      </Link>
                      <span className="hidden text-xs text-muted-foreground sm:inline">{task.assignee_name ?? "Unassigned"}</span>
                      {task.due_date && task.status !== "done" ? (
                        <span className={cn("text-xs", task.due_date < today ? "font-semibold text-red-600 dark:text-red-400" : "text-muted-foreground")}>{task.due_date.slice(5)}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          {!tasks.length ? <p className="px-5 py-8 text-center text-sm text-muted-foreground">No tasks yet. Create a task and set its project to “{project.name}”.</p> : null}
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-foreground">Hours by person</h2>
            {people.length ? (
              <ul className="mt-3 flex flex-col gap-2 text-sm">
                {people.map((person) => (
                  <li key={person.name} className="flex justify-between">
                    <span className="text-foreground">{person.name}</span>
                    <span className="tabular-nums text-muted-foreground">{h(person.minutes)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">No time logged yet.</p>
            )}
          </Card>
          {project.description ? (
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-foreground">Scope</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/85">{project.description}</p>
            </Card>
          ) : null}
          <span className={cn("w-fit rounded-full px-2.5 py-1 text-xs font-semibold", STATUS_STYLE[project.status])}>{PROJECT_STATUS_LABELS[project.status]}</span>
        </div>
      </div>

      {canEdit ? (
        <Card className="mt-6 max-w-3xl p-6">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Project details</h2>
          <ProjectForm project={project} team={listUsers().filter((member) => member.active).map(({ id, name }) => ({ id, name }))} />
        </Card>
      ) : null}
    </>
  );
}
