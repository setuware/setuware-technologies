import Link from "next/link";
import { CalendarRange, Clock3, Target, Users } from "lucide-react";

import { can } from "@/lib/cms/auth";
import { addDays, localDay } from "@/lib/cms/attendance";
import { requireUser } from "@/lib/cms/session";
import { listTasks } from "@/lib/cms/tasks";
import { attendanceByDay, expectedMinutes, getSheet, sheetRows, weekDays } from "@/lib/cms/timesheets";
import { TimesheetGrid } from "@/components/admin/timesheet-grid";
import { buttonClass, Card, formatWhen, PageHeader, Stat } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

import { STATUS_STYLE, weekLabel, weekParam } from "./week";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

const hm = (minutes: number) => `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;

export default async function MyTimesheetPage({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
  const user = await requireUser();
  const today = localDay();
  const monday = weekParam((await searchParams).week, today);
  const days = weekDays(monday);
  const sheet = getSheet(user.id, monday);
  const rows = sheetRows(user.id, monday);
  const atWork = attendanceByDay(user.id, monday);
  const logged = rows.reduce((sum, row) => sum + row.total, 0);
  const editable = sheet.status === "draft" || sheet.status === "rejected";
  const openTasks = listTasks({ visibleTo: user.id })
    .filter((task) => task.status !== "done" || task.completed_at?.slice(0, 10) && task.completed_at.slice(0, 10) >= monday)
    .map(({ id, title }) => ({ id, title }));
  const status = STATUS_STYLE[sheet.status];

  return (
    <>
      <PageHeader
        title="My timesheet"
        description="Fill in the hours you spent on each task, then submit the week for approval."
        actions={
          can(user, "timesheets") ? (
            <Link href={`/admin/timesheets/team?week=${monday}`} className={buttonClass.secondary}>
              <Users className="size-4" aria-hidden /> Team timesheets
            </Link>
          ) : null
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label="Logged on tasks" value={hm(logged)} icon={<Clock3 className="size-4" />} tone="blue" />
        <Stat label="At work (attendance)" value={hm(atWork.reduce((sum, minutes) => sum + minutes, 0))} icon={<CalendarRange className="size-4" />} tone="teal" />
        <Stat label="Expected" value={hm(expectedMinutes(monday))} hint="Working days × full-day hours" icon={<Target className="size-4" />} tone="violet" />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
          <Link href={`/admin/timesheets?week=${addDays(monday, -7)}`} className="rounded-full px-2 py-0.5 text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground" aria-label="Previous week">
            ←
          </Link>
          <h2 className="text-sm font-semibold text-foreground">{weekLabel(monday)}</h2>
          <Link href={`/admin/timesheets?week=${addDays(monday, 7)}`} className="rounded-full px-2 py-0.5 text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground" aria-label="Next week">
            →
          </Link>
          <span className={cn("ml-auto rounded-full px-2.5 py-1 text-xs font-semibold", status.style)}>{status.label}</span>
        </div>
        {sheet.status === "rejected" && sheet.decision_note ? (
          <p className="border-b border-border bg-red-500/[0.06] px-4 py-3 text-sm text-red-800 dark:text-red-200">
            <strong>{sheet.decided_by}</strong> sent this back: “{sheet.decision_note}”. Fix it and submit again.
          </p>
        ) : null}
        {sheet.status === "submitted" ? (
          <p className="border-b border-border bg-amber-500/[0.06] px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
            Submitted {sheet.submitted_at ? formatWhen(sheet.submitted_at) : ""}. It’s locked while your approver checks it.
          </p>
        ) : null}
        {sheet.status === "approved" ? (
          <p className="border-b border-border bg-emerald-500/[0.06] px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200">
            Approved by {sheet.decided_by}
            {sheet.decided_at ? ` on ${formatWhen(sheet.decided_at)}` : ""}
            {sheet.decision_note ? `: “${sheet.decision_note}”` : "."}
          </p>
        ) : null}
        <TimesheetGrid week={monday} days={days} rows={rows} atWork={atWork} editable={editable} openTasks={openTasks} today={today} />
      </Card>
    </>
  );
}
