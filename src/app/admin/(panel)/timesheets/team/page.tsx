import Link from "next/link";
import { CheckCircle2, Clock3, Download, Hourglass, UserX } from "lucide-react";

import { listUsers } from "@/lib/cms/auth";
import { addDays, localDay } from "@/lib/cms/attendance";
import { mayApproveFor, teamScope } from "@/lib/cms/notify";
import { requireUser } from "@/lib/cms/session";
import { redirect } from "next/navigation";
import { attendanceByDay, sheetRows, teamSheets, weekDays } from "@/lib/cms/timesheets";
import { SheetDecision, TimesheetGrid } from "@/components/admin/timesheet-grid";
import { Avatar, Card, PageHeader, Stat, theadClass } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

import { STATUS_STYLE, weekLabel, weekParam } from "../week";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

const hm = (minutes: number) => (minutes ? `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m` : "—");

export default async function TeamTimesheetsPage({ searchParams }: { searchParams: Promise<{ week?: string; person?: string }> }) {
  const user = await requireUser();
  const scope = teamScope(user, "timesheets");
  if (!scope.all && !scope.ids.length) redirect("/admin?denied=1");
  const params = await searchParams;
  const today = localDay();
  const monday = weekParam(params.week, today);
  const team = listUsers().filter((member) => member.active && (scope.all || scope.ids.includes(member.id)));
  const sheets = teamSheets(team, monday);
  const person = sheets.find((item) => item.userId === Number(params.person));
  const count = (status: string) => sheets.filter((item) => item.sheet.status === status).length;

  return (
    <>
      <PageHeader title="Team timesheets" description="Check each person's week against attendance, then approve it or send it back." back={{ href: `/admin/timesheets?week=${monday}`, label: "My timesheet" }} />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Waiting for approval" value={count("submitted")} icon={<Hourglass className="size-4" />} tone="amber" />
        <Stat label="Approved" value={count("approved")} icon={<CheckCircle2 className="size-4" />} tone="teal" />
        <Stat label="Not submitted" value={count("draft") + count("rejected")} icon={<UserX className="size-4" />} tone="violet" />
        <Stat label="Team hours logged" value={hm(sheets.reduce((sum, item) => sum + item.logged, 0))} icon={<Clock3 className="size-4" />} tone="blue" />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3">
          <Link href={`/admin/timesheets/team?week=${addDays(monday, -7)}`} className="rounded-full px-2 py-0.5 text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground" aria-label="Previous week">
            ←
          </Link>
          <h2 className="text-sm font-semibold text-foreground">{weekLabel(monday)}</h2>
          <Link href={`/admin/timesheets/team?week=${addDays(monday, 7)}`} className="rounded-full px-2 py-0.5 text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground" aria-label="Next week">
            →
          </Link>
          <a href={`/admin/files/export/timesheets?week=${monday}`} className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[#2f56d8] hover:underline dark:text-[#8fb0ff]">
            <Download className="size-4" aria-hidden /> Export CSV
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className={theadClass}>
              <tr>
                <th className="px-5 py-3 font-medium">Person</th>
                <th className="px-5 py-3 font-medium">Logged</th>
                <th className="px-5 py-3 font-medium">At work</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sheets.map((item) => {
                const status = STATUS_STYLE[item.sheet.status];
                return (
                  <tr key={item.userId} className={cn(person?.userId === item.userId && "bg-[#2f56d8]/[0.04]")}>
                    <td className="px-5 py-3">
                      <Link href={`/admin/timesheets/team?week=${monday}&person=${item.userId}`} className="flex items-center gap-2.5 font-medium text-foreground hover:underline">
                        <Avatar name={item.name} size="sm" /> {item.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 tabular-nums">
                      <span className={cn("font-semibold", item.logged < item.expected * 0.8 ? "text-amber-600 dark:text-amber-400" : "text-foreground")}>{hm(item.logged)}</span>
                      <span className="text-xs text-muted-foreground"> / {hm(item.expected)}</span>
                    </td>
                    <td className="px-5 py-3 tabular-nums text-muted-foreground">{hm(item.atWork)}</td>
                    <td className="px-5 py-3">
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", status.style)}>{status.label}</span>
                      {item.sheet.note ? <p className="mt-1 max-w-56 truncate text-xs text-muted-foreground" title={item.sheet.note}>“{item.sheet.note}”</p> : null}
                    </td>
                    <td className="px-5 py-3">
                      {mayApproveFor(user, item.userId, "timesheets.approve") ? <SheetDecision userId={item.userId} week={monday} status={item.sheet.status} /> : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {person ? (
        <Card className="mt-6 overflow-hidden">
          <h2 className="border-b border-border px-4 py-3 text-sm font-semibold text-foreground">{person.name} · {weekLabel(monday)}</h2>
          <TimesheetGrid
            week={monday}
            days={weekDays(monday)}
            rows={sheetRows(person.userId, monday)}
            atWork={attendanceByDay(person.userId, monday)}
            editable={false}
            openTasks={[]}
            today={today}
          />
        </Card>
      ) : null}
    </>
  );
}
