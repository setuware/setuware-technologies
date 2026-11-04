import Link from "next/link";
import { Check, Coffee, Download, LogOut, MapPin, Plane, Settings2, UserCheck, UserX, X } from "lucide-react";

import { decideRequestAction } from "@/app/admin/work-actions";
import { can, listUsers } from "@/lib/cms/auth";
import { attendanceSettings, formatMinutes, listRequests, localDay, localTime, register, todayBoard, type AttendanceRecord, type BoardRow } from "@/lib/cms/attendance";
import { listRoles } from "@/lib/cms/rbac";
import { requireUser } from "@/lib/cms/session";
import { FixAttendanceForm } from "@/components/admin/attendance-tools";
import { Legend, monthLabel, monthParam, RegisterGrid, shiftMonth } from "@/components/admin/attendance-view";
import { Avatar, buttonClass, Card, Empty, formatDay, inputClass, PageHeader, Stat, theadClass } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

const STATE: Record<BoardRow["state"], { label: string; style: string }> = {
  in: { label: "Working", style: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  break: { label: "On break", style: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  done: { label: "Checked out", style: "bg-sky-500/12 text-sky-700 dark:text-sky-300" },
  leave: { label: "On leave", style: "bg-violet-500/15 text-violet-700 dark:text-violet-300" },
  off: { label: "Day off", style: "bg-foreground/[0.06] text-muted-foreground" },
  "not-in": { label: "Not in yet", style: "bg-red-500/10 text-red-700 dark:text-red-300" },
};

function Spot({ label, lat, lng, distance, accuracy, radius }: { label: string; lat: number | null; lng: number | null; distance: number | null; accuracy: number | null; radius: number | null }) {
  if (lat === null || lng === null) return <span className="text-muted-foreground/70">{label}: no location</span>;
  const far = distance !== null && radius !== null && distance > radius;
  const where =
    distance === null || radius === null
      ? "view on map"
      : distance <= radius
        ? "at office"
        : `${distance >= 1000 ? `${(distance / 1000).toFixed(1)} km` : `${distance} m`} away`;
  return (
    <a
      href={`https://www.google.com/maps?q=${lat},${lng}`}
      target="_blank"
      rel="noreferrer"
      title={accuracy ? `Accurate to about ${accuracy} m` : undefined}
      className={cn("inline-flex items-center gap-1 hover:underline", far ? "font-semibold text-amber-600 dark:text-amber-400" : "text-[#2f56d8] dark:text-[#8fb0ff]")}
    >
      <MapPin className="size-3" aria-hidden /> {label}: {where}
    </a>
  );
}

function Where({ record, radius }: { record: AttendanceRecord; radius: number | null }) {
  const mode = record.mode === "field" ? "On-site" : record.mode === "remote" ? "Remote" : "Office";
  return (
    <div className="flex flex-col gap-0.5 text-xs">
      <span className="font-medium text-foreground">{mode}</span>
      <Spot label="In" lat={record.in_lat} lng={record.in_lng} distance={record.in_distance} accuracy={record.in_accuracy} radius={radius} />
      {record.check_out_at ? <Spot label="Out" lat={record.out_lat} lng={record.out_lng} distance={record.out_distance} accuracy={record.out_accuracy} radius={radius} /> : null}
    </div>
  );
}

export default async function TeamAttendancePage({ searchParams }: { searchParams: Promise<{ month?: string; person?: string; role?: string }> }) {
  const user = await requireUser("attendance");
  const params = await searchParams;
  const today = localDay();
  const month = monthParam(params.month, today);
  const settings = attendanceSettings();
  const manage = can(user, "attendance.manage");
  const everyone = listUsers().filter((member) => member.active);
  const roles = listRoles().filter((role) => everyone.some((member) => member.role === role.key));
  const role = roles.some((item) => item.key === params.role) ? (params.role as string) : "";
  const team = role ? everyone.filter((member) => member.role === role) : everyone;
  const board = todayBoard(team);
  const rows = register(month, team);
  const keep = (extra: Record<string, string>) => `/admin/attendance/team?${new URLSearchParams({ ...(role ? { role } : {}), month, ...extra }).toString()}`;
  const pending = manage ? listRequests({ status: "pending" }) : [];
  const person = rows.find((row) => row.userId === Number(params.person));
  const count = (state: BoardRow["state"]) => board.filter((row) => row.state === state).length;
  const summaries = board.filter((row) => row.record?.summary);

  return (
    <>
      <PageHeader
        title="Team attendance"
        description="Who is in today, leave approvals and the monthly register."
        actions={
          manage ? (
            <Link href="/admin/attendance/settings" className={buttonClass.secondary}>
              <Settings2 className="size-4" aria-hidden /> Settings & holidays
            </Link>
          ) : null
        }
      />

      {roles.length > 1 ? (
        <nav className="mb-5 flex flex-wrap gap-2" aria-label="Filter by role">
          {[{ key: "", name: "Everyone" }, ...roles].map((item) => (
            <Link
              key={item.key || "all"}
              href={item.key ? `/admin/attendance/team?role=${item.key}&month=${month}` : `/admin/attendance/team?month=${month}`}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                role === item.key ? "border-[#0b1020] bg-[#0b1020] text-white dark:border-white dark:bg-white dark:text-[#0b1020]" : "border-border bg-surface text-muted-foreground hover:text-foreground",
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      ) : null}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Working now" value={count("in") + count("break")} hint={`${count("break")} on break`} icon={<UserCheck className="size-4" />} tone="teal" />
        <Stat label="Late today" value={board.filter((row) => row.late).length} hint={`After ${settings.start} + ${settings.graceMinutes} min`} icon={<Coffee className="size-4" />} tone="amber" />
        <Stat label="On leave" value={count("leave")} icon={<Plane className="size-4" />} tone="violet" />
        <Stat label="Not in yet" value={count("not-in")} hint={`${count("done")} checked out`} icon={<UserX className="size-4" />} tone="blue" />
      </div>

      {pending.length ? (
        <Card className="mt-6 overflow-hidden border-amber-500/40">
          <h2 className="border-b border-border bg-amber-500/[0.06] px-5 py-3 text-sm font-semibold text-foreground">Waiting for approval ({pending.length})</h2>
          <ul className="divide-y divide-border">
            {pending.map((request) => (
              <li key={request.id} className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar name={request.user_name} />
                  <div className="min-w-0 text-sm">
                    <p className="font-semibold text-foreground">
                      {request.user_name} ·{" "}
                      {request.kind === "leave"
                        ? `${request.leave_type} leave${request.half_day ? " (half day)" : ""}`
                        : `Correction to ${request.check_in}–${request.check_out}`}
                    </p>
                    <p className="text-muted-foreground">
                      {formatDay(request.from_day)}
                      {request.to_day !== request.from_day ? ` – ${formatDay(request.to_day)}` : ""}
                      {request.reason ? ` · “${request.reason}”` : ""}
                    </p>
                  </div>
                </div>
                <form action={decideRequestAction} className="flex flex-wrap items-center gap-2">
                  <input type="hidden" name="id" value={request.id} />
                  <input name="note" placeholder="Note (optional)" aria-label="Note" className={`${inputClass} h-9 w-44 py-1.5`} />
                  <button name="decision" value="approve" className="inline-flex h-9 items-center gap-1.5 rounded-full bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700">
                    <Check className="size-4" aria-hidden /> Approve
                  </button>
                  <button name="decision" value="reject" className="inline-flex h-9 items-center gap-1.5 rounded-full border border-red-500/30 px-4 text-sm font-semibold text-red-600 hover:bg-red-500/8 dark:text-red-400">
                    <X className="size-4" aria-hidden /> Reject
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card className="mt-6 overflow-hidden">
        <h2 className="border-b border-border px-5 py-3 text-sm font-semibold text-foreground">Today · {formatDay(today)}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className={theadClass}>
              <tr>
                <th className="px-5 py-3 font-medium">Person</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">In</th>
                <th className="px-5 py-3 font-medium">Out</th>
                <th className="px-5 py-3 font-medium">Worked</th>
                <th className="hidden px-5 py-3 font-medium md:table-cell">Where</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {board.map((row) => (
                <tr key={row.userId}>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-2.5 font-medium text-foreground">
                      <Avatar name={row.name} size="sm" /> {row.name}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", STATE[row.state].style)}>
                      {row.state === "leave" && row.leave ? row.leave : STATE[row.state].label}
                    </span>
                  </td>
                  <td className="px-5 py-3 tabular-nums text-foreground">
                    {row.record ? localTime(row.record.check_in_at) : "—"}
                    {row.late ? <span className="ml-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">late</span> : null}
                  </td>
                  <td className="px-5 py-3 tabular-nums text-muted-foreground">{row.record?.check_out_at ? localTime(row.record.check_out_at) : "—"}</td>
                  <td className="px-5 py-3 tabular-nums text-foreground">{row.record ? formatMinutes(row.minutes) : "—"}</td>
                  <td className="hidden px-5 py-3 md:table-cell">{row.record ? <Where record={row.record} radius={settings.office?.radius ?? null} /> : null}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {summaries.length ? (
        <Card className="mt-6 p-5 sm:p-6">
          <h2 className="mb-3 text-sm font-semibold text-foreground">What the team did today</h2>
          <ul className="flex flex-col gap-3">
            {summaries.map((row) => (
              <li key={row.userId} className="flex gap-3">
                <Avatar name={row.name} size="sm" />
                <p className="min-w-0 flex-1 whitespace-pre-wrap text-sm text-foreground/85">
                  <strong className="text-foreground">{row.name}</strong>
                  <span className="text-muted-foreground"> · {formatMinutes(row.minutes)}</span>
                  {"\n"}
                  {row.record?.summary}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card className="mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <Link href={keep({ month: shiftMonth(month, -1) })} className="rounded-full px-2 py-0.5 text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground" aria-label="Previous month">
              ←
            </Link>
            <h2 className="text-sm font-semibold text-foreground">Register · {monthLabel(month)}</h2>
            <Link href={keep({ month: shiftMonth(month, 1) })} className="rounded-full px-2 py-0.5 text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground" aria-label="Next month">
              →
            </Link>
          </div>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- CSV download from a route handler */}
          <a href={`/admin/files/export/attendance?month=${month}${role ? `&role=${role}` : ""}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2f56d8] hover:underline dark:text-[#8fb0ff]">
            <Download className="size-4" aria-hidden /> Export CSV
          </a>
        </div>
        {rows.length ? <RegisterGrid rows={rows} today={today} query={new URLSearchParams({ ...(role ? { role } : {}), month }).toString()} /> : <Empty title="No team members yet" />}
        <div className="border-t border-border px-5 py-3">
          <Legend />
        </div>
      </Card>

      {person ? (
        <Card className="mt-6 overflow-hidden">
          <h2 className="border-b border-border px-5 py-3 text-sm font-semibold text-foreground">
            {person.name} · daily log, {monthLabel(month)}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={theadClass}>
                <tr>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">In – out</th>
                  <th className="px-5 py-3 font-medium">Break</th>
                  <th className="px-5 py-3 font-medium">Worked</th>
                  <th className="px-5 py-3 font-medium">Where</th>
                  <th className="px-5 py-3 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {person.cells
                  .filter((cell) => cell.record || cell.leave)
                  .map((cell) => (
                    <tr key={cell.day}>
                      <td className="whitespace-nowrap px-5 py-2.5 text-foreground">{formatDay(cell.day)}</td>
                      <td className="whitespace-nowrap px-5 py-2.5 tabular-nums">
                        {cell.record ? `${localTime(cell.record.check_in_at)} – ${cell.record.check_out_at ? localTime(cell.record.check_out_at) : "?"}` : cell.leave}
                        {cell.late ? <span className="ml-1.5 text-[11px] font-semibold text-amber-600">late</span> : null}
                      </td>
                      <td className="px-5 py-2.5 tabular-nums text-muted-foreground">{cell.record?.break_minutes ? `${cell.record.break_minutes}m` : "—"}</td>
                      <td className="px-5 py-2.5 tabular-nums text-foreground">{cell.minutes ? formatMinutes(cell.minutes) : "—"}</td>
                      <td className="px-5 py-2.5">{cell.record ? <Where record={cell.record} radius={settings.office?.radius ?? null} /> : null}</td>
                      <td className="px-5 py-2.5 text-xs text-muted-foreground">
                        {cell.record?.summary}
                        {cell.record?.edited_by ? ` (edited by ${cell.record.edited_by})` : ""}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {manage ? (
        <Card className="mt-6 max-w-2xl p-5 sm:p-6">
          <h2 className="mb-1 text-sm font-semibold text-foreground">Fix a record</h2>
          <p className="mb-4 text-xs text-muted-foreground">Set someone’s times for a day (it is marked as edited by you), or remove a wrong check-in.</p>
          <FixAttendanceForm team={everyone.map(({ id, name }) => ({ id, name }))} today={today} />
        </Card>
      ) : null}
      <p className="mt-6 flex items-center gap-1.5 text-xs text-muted-foreground">
        <LogOut className="size-3.5" aria-hidden /> People who forget to check out show as MC (missed check-out) until they ask for a correction.
      </p>
    </>
  );
}
