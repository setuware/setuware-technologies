import Link from "next/link";
import { AlertTriangle, Settings2, Users } from "lucide-react";

import { cancelRequestAction } from "@/app/admin/work-actions";
import { can } from "@/lib/cms/auth";
import {
  attendanceSettings,
  isLate,
  LEAVE_TYPES,
  leaveBalance,
  listHolidays,
  listRequests,
  localDay,
  localTime,
  missedCheckOuts,
  presence,
  register,
  workedMinutes,
} from "@/lib/cms/attendance";
import { getUser } from "@/lib/cms/auth";
import { requireUser } from "@/lib/cms/session";
import { CorrectionForm, LeaveForm, PunchCard } from "@/components/admin/attendance-tools";
import { Legend, MonthCalendar, monthLabel, monthParam, shiftMonth } from "@/components/admin/attendance-view";
import { buttonClass, Card, formatDay, PageHeader } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

const REQUEST_STYLE: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  approved: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  rejected: "bg-red-500/12 text-red-700 dark:text-red-300",
  cancelled: "bg-foreground/[0.06] text-muted-foreground",
};

export default async function MyAttendancePage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const user = await requireUser();
  const today = localDay();
  const month = monthParam((await searchParams).month, today);
  const settings = attendanceSettings();
  const now = presence(user.id);
  const record = now.record;
  const me = getUser(user.id);
  const [row] = register(month, [{ id: user.id, name: user.name, created_at: me?.created_at }]);
  const requests = listRequests({ userId: user.id }).slice(0, 12);
  const missed = missedCheckOuts(user.id, today);
  const balance = leaveBalance(user.id, today.slice(0, 4));
  const holidays = listHolidays(today.slice(0, 4)).filter((holiday) => holiday.day >= today).slice(0, 5);

  return (
    <>
      <PageHeader
        title="My attendance"
        description={`Office hours start at ${settings.start}. Check in when you start and check out when you finish.`}
        actions={
          <>
            {can(user, "attendance") ? (
              <Link href="/admin/attendance/team" className={buttonClass.secondary}>
                <Users className="size-4" aria-hidden /> Team
              </Link>
            ) : null}
            {can(user, "attendance.manage") ? (
              <Link href="/admin/attendance/settings" className={buttonClass.secondary}>
                <Settings2 className="size-4" aria-hidden /> Settings
              </Link>
            ) : null}
          </>
        }
      />

      <PunchCard
        punch={{
          state: now.state,
          checkInAt: record?.check_in_at ?? null,
          checkOutAt: record?.check_out_at ?? null,
          breakMinutes: record?.break_minutes ?? 0,
          breakStartedAt: record?.break_started_at ?? null,
          workedMinutes: record ? workedMinutes(record) : 0,
          summary: record?.summary ?? "",
          late: Boolean(record && isLate(record, settings)),
          officeSet: Boolean(settings.office),
        }}
        inTime={record ? localTime(record.check_in_at) : null}
        outTime={record?.check_out_at ? localTime(record.check_out_at) : null}
      />

      {missed.length ? (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>
            You didn’t check out on {missed.map((item) => formatDay(item.day)).join(", ")}. Those days count as present but without hours; request a correction
            below so your hours are right.
          </p>
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Link href={`/admin/attendance?month=${shiftMonth(month, -1)}`} className="rounded-full px-3 py-1 text-sm text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground">
              ←
            </Link>
            <h2 className="font-semibold text-foreground">{monthLabel(month)}</h2>
            <Link href={`/admin/attendance?month=${shiftMonth(month, 1)}`} className="rounded-full px-3 py-1 text-sm text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground">
              →
            </Link>
          </div>
          <MonthCalendar row={row} today={today} />
          <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4 text-center sm:grid-cols-5">
            {[
              ["Present", row.totals.present],
              ["Half days", row.totals.half],
              ["Leave", row.totals.leave],
              ["Late", row.totals.late],
              ["Hours", Math.round(row.totals.minutes / 6) / 10],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-[11px] text-muted-foreground">{label}</dt>
                <dd className="font-display text-xl font-semibold tabular-nums text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4">
            <Legend />
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-foreground">Leave balance {today.slice(0, 4)}</h2>
            <ul className="mt-3 flex flex-col gap-3">
              {balance.map((item) => (
                <li key={item.type}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="text-foreground">{item.type}</span>
                    <span className="tabular-nums text-muted-foreground">
                      <strong className="text-foreground">{item.left}</strong> of {item.quota} left
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-foreground/[0.06]">
                    <span className="block h-full rounded-full bg-violet-500" style={{ width: `${item.quota ? Math.min(100, (item.used / item.quota) * 100) : 0}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </Card>
          {holidays.length ? (
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-foreground">Upcoming holidays</h2>
              <ul className="mt-2 flex flex-col divide-y divide-border text-sm">
                {holidays.map((holiday) => (
                  <li key={holiday.day} className="flex justify-between py-2">
                    <span className="text-foreground">{holiday.name}</span>
                    <span className="text-muted-foreground">{formatDay(holiday.day)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Request leave</h2>
          <LeaveForm types={LEAVE_TYPES} today={today} />
        </Card>
        <Card className="p-5 sm:p-6">
          <h2 className="mb-1 text-sm font-semibold text-foreground">Fix a day</h2>
          <p className="mb-4 text-xs text-muted-foreground">Forgot to check in or out? Ask for the right times; your manager approves it.</p>
          <CorrectionForm today={today} day={missed[0]?.day} />
        </Card>
      </div>

      {requests.length ? (
        <Card className="mt-6 overflow-hidden">
          <h2 className="border-b border-border px-5 py-3 text-sm font-semibold text-foreground">My requests</h2>
          <ul className="divide-y divide-border">
            {requests.map((request) => (
              <li key={request.id} className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm">
                <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize", REQUEST_STYLE[request.status])}>{request.status}</span>
                <span className="font-medium text-foreground">
                  {request.kind === "leave"
                    ? `${request.leave_type}${request.half_day ? " (half day)" : ""}`
                    : `Correction ${request.check_in}–${request.check_out}`}
                </span>
                <span className="text-muted-foreground">
                  {formatDay(request.from_day)}
                  {request.to_day !== request.from_day ? ` – ${formatDay(request.to_day)}` : ""}
                </span>
                {request.decided_by ? (
                  <span className="text-xs text-muted-foreground">
                    by {request.decided_by}
                    {request.decision_note ? `: “${request.decision_note}”` : ""}
                  </span>
                ) : null}
                {request.status === "pending" ? (
                  <form action={cancelRequestAction} className="ml-auto">
                    <input type="hidden" name="id" value={request.id} />
                    <button className="text-xs font-semibold text-muted-foreground hover:text-red-600">Cancel</button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </>
  );
}
