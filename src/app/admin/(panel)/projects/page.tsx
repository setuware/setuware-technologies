import Link from "next/link";
import { AlertTriangle, Plus } from "lucide-react";

import { can, seesAll } from "@/lib/cms/auth";
import { localDay } from "@/lib/cms/attendance";
import { listProjects, PROJECT_STATUS_LABELS } from "@/lib/cms/projects";
import { requireUser } from "@/lib/cms/session";
import { buttonClass, Card, Empty, formatDay, PageHeader } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

import { STATUS_STYLE } from "./style";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

const hours = (minutes: number) => Math.round(minutes / 6) / 10;

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const user = await requireUser();
  const { status = "" } = await searchParams;
  const today = localDay();
  const all = listProjects(today);
  const projects = all.filter((project) => (status ? project.status === status : project.status === "active" || project.status === "on_hold"));
  const canEdit = can(user, "tasks.assign") || seesAll(user, "tasks");

  return (
    <>
      <PageHeader
        title="Projects"
        description="Client projects with progress, hours against budget and deadlines. Tasks join a project by its name."
        actions={
          canEdit ? (
            <Link href="/admin/projects/new" className={buttonClass.primary}>
              <Plus className="size-4" aria-hidden /> New project
            </Link>
          ) : null
        }
      />
      <nav className="mb-5 flex flex-wrap gap-2" aria-label="Filter projects">
        {[["", "Open"], ["completed", "Completed"], ["cancelled", "Cancelled"]].map(([key, label]) => (
          <Link
            key={key || "open"}
            href={key ? `/admin/projects?status=${key}` : "/admin/projects"}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold",
              status === key ? "border-[#0b1020] bg-[#0b1020] text-white dark:border-white dark:bg-white dark:text-[#0b1020]" : "border-border bg-surface text-muted-foreground hover:text-foreground",
            )}
          >
            {label} ({all.filter((project) => (key ? project.status === key : project.status === "active" || project.status === "on_hold")).length})
          </Link>
        ))}
      </nav>
      {projects.length === 0 ? (
        <Card>
          <Empty title="No projects here">{canEdit ? "Create one, or give tasks a project name and it appears here." : "Projects appear when tasks are given a project name."}</Empty>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => {
            const progress = project.tasks ? Math.round((project.done / project.tasks) * 100) : 0;
            const budget = project.budget_hours ? Math.min(100, Math.round((project.logged / 60 / project.budget_hours) * 100)) : null;
            const late = project.deadline && project.deadline < today && project.status === "active";
            return (
              <Link key={project.name} href={`/admin/projects/${encodeURIComponent(project.name)}`}>
                <Card className="h-full p-5 transition-[border-color,box-shadow] hover:border-foreground/20 hover:shadow-[0_18px_40px_-22px_rgb(15_23_42/0.35)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate font-semibold text-foreground">{project.name}</h2>
                      <p className="truncate text-xs text-muted-foreground">{project.client || "No client set"}</p>
                    </div>
                    <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold", STATUS_STYLE[project.status])}>{PROJECT_STATUS_LABELS[project.status]}</span>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {project.done}/{project.tasks} tasks done
                      </span>
                      <span className="font-semibold text-foreground">{progress}%</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-foreground/[0.06]">
                      <span className="block h-full rounded-full bg-[linear-gradient(90deg,#2f56d8,#0a8ea6)]" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {hours(project.logged)}h logged{project.budget_hours ? ` of ${project.budget_hours}h` : ""}
                      </span>
                      {budget !== null ? <span className={cn("font-semibold", budget >= 90 ? "text-red-600 dark:text-red-400" : "text-foreground")}>{budget}%</span> : null}
                    </div>
                    {budget !== null ? (
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-foreground/[0.06]">
                        <span className={cn("block h-full rounded-full", budget >= 90 ? "bg-red-500" : "bg-violet-500")} style={{ width: `${budget}%` }} />
                      </div>
                    ) : null}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {project.deadline ? (
                      <span className={cn(late && "font-semibold text-red-600 dark:text-red-400")}>
                        {late ? "Past deadline · " : "Due "}
                        {formatDay(project.deadline)}
                      </span>
                    ) : null}
                    {project.overdue ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-red-600 dark:text-red-400">
                        <AlertTriangle className="size-3" aria-hidden /> {project.overdue} overdue
                      </span>
                    ) : null}
                    {project.inReview ? <span>{project.inReview} in review</span> : null}
                    {project.people.length ? <span>{project.people.length === 1 ? "1 person" : `${project.people.length} people`}</span> : null}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
