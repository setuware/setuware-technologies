import Link from "next/link";

import { localTime, weekday, type DayCell, type DayCode, type RegisterRow } from "@/lib/cms/attendance";
import { cn } from "@/lib/utils";

/** Server-safe attendance displays: personal month calendar and team register. */

export const CODES: Record<Exclude<DayCode, "">, { label: string; style: string }> = {
  P: { label: "Present", style: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  IN: { label: "At work now", style: "bg-emerald-500 text-white" },
  HD: { label: "Half day", style: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
  S: { label: "Short day", style: "bg-orange-500/15 text-orange-700 dark:text-orange-300" },
  MC: { label: "Missed check-out", style: "bg-amber-500/20 text-amber-800 dark:text-amber-300" },
  L: { label: "Leave", style: "bg-violet-500/15 text-violet-700 dark:text-violet-300" },
  HL: { label: "Half-day leave", style: "bg-violet-500/10 text-violet-700 dark:text-violet-300" },
  WFH: { label: "Work from home", style: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300" },
  H: { label: "Holiday", style: "bg-pink-500/12 text-pink-700 dark:text-pink-300" },
  WO: { label: "Weekly off", style: "bg-foreground/[0.05] text-muted-foreground" },
  A: { label: "Absent", style: "bg-red-500/15 text-red-700 dark:text-red-300" },
};

export function Legend({ codes = Object.keys(CODES) as Exclude<DayCode, "">[] }: { codes?: Exclude<DayCode, "">[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
      {codes.map((code) => (
        <li key={code} className="flex items-center gap-1.5">
          <span className={cn("rounded px-1 py-px text-[10px] font-bold", CODES[code].style)}>{code}</span>
          {CODES[code].label}
        </li>
      ))}
      <li className="flex items-center gap-1.5">
        <span className="size-1.5 rounded-full bg-red-500" aria-hidden /> Late
      </li>
    </ul>
  );
}

function tip(cell: DayCell): string {
  const parts = [cell.day];
  if (cell.code) parts.push(CODES[cell.code].label);
  if (cell.record) parts.push(`${localTime(cell.record.check_in_at)}–${cell.record.check_out_at ? localTime(cell.record.check_out_at) : "?"}`);
  if (cell.minutes) parts.push(`${Math.floor(cell.minutes / 60)}h ${cell.minutes % 60}m`);
  if (cell.leave) parts.push(cell.leave);
  if (cell.holiday) parts.push(cell.holiday);
  if (cell.late) parts.push("late");
  if (cell.record?.edited_by) parts.push(`edited by ${cell.record.edited_by}`);
  return parts.join(" · ");
}

/** One person's month as a calendar. */
export function MonthCalendar({ row, today }: { row: RegisterRow; today: string }) {
  const lead = (weekday(row.cells[0].day) + 6) % 7; // Monday first
  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1.5">
        {Array.from({ length: lead }, (_, i) => (
          <span key={`pad${i}`} />
        ))}
        {row.cells.map((cell) => (
          <div
            key={cell.day}
            title={tip(cell)}
            className={cn(
              "relative flex aspect-square flex-col items-center justify-center rounded-xl text-xs sm:aspect-[5/4]",
              cell.code ? CODES[cell.code].style : "bg-foreground/[0.02] text-muted-foreground/60",
              cell.day === today && "ring-2 ring-[#2f56d8] ring-offset-1 ring-offset-surface",
            )}
          >
            <span className="font-semibold tabular-nums">{Number(cell.day.slice(8))}</span>
            {cell.code ? <span className="text-[9px] font-bold opacity-80">{cell.code}</span> : null}
            {cell.late ? <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-red-500" aria-label="Late" /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

/** People × days with codes and monthly totals. */
export function RegisterGrid({ rows, today }: { rows: RegisterRow[]; today: string }) {
  if (!rows.length) return null;
  const days = rows[0].cells.map((cell) => cell.day);
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-0 text-xs">
        <thead>
          <tr className="text-muted-foreground">
            <th className="sticky left-0 z-10 bg-surface px-4 py-2 text-left font-semibold">Person</th>
            {days.map((day) => (
              <th key={day} className={cn("min-w-7 px-0.5 py-2 text-center font-medium tabular-nums", day === today && "text-[#2f56d8]")}>
                <span className="block text-[9px] uppercase">{["S", "M", "T", "W", "T", "F", "S"][weekday(day)]}</span>
                {Number(day.slice(8))}
              </th>
            ))}
            <th className="px-2 py-2 text-center font-semibold" title="Present (incl. WFH)">P</th>
            <th className="px-2 py-2 text-center font-semibold" title="Half / short days">½</th>
            <th className="px-2 py-2 text-center font-semibold" title="Leave">L</th>
            <th className="px-2 py-2 text-center font-semibold" title="Absent">A</th>
            <th className="px-2 py-2 text-center font-semibold" title="Late check-ins">Late</th>
            <th className="px-3 py-2 text-right font-semibold">Hours</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.userId} className="group">
              <td className="sticky left-0 z-10 whitespace-nowrap border-t border-border bg-surface px-4 py-1.5 font-semibold text-foreground">
                <Link href={`/admin/attendance/team?person=${row.userId}`} className="hover:underline">
                  {row.name}
                </Link>
              </td>
              {row.cells.map((cell) => (
                <td key={cell.day} className="border-t border-border px-0.5 py-1.5 text-center">
                  <span
                    title={tip(cell)}
                    className={cn(
                      "relative inline-flex h-6 w-7 items-center justify-center rounded-md text-[10px] font-bold",
                      cell.code ? CODES[cell.code].style : "text-muted-foreground/40",
                    )}
                  >
                    {cell.code || "·"}
                    {cell.late ? <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-red-500" aria-hidden /> : null}
                  </span>
                </td>
              ))}
              <td className="border-t border-border px-2 text-center font-semibold tabular-nums text-foreground">{row.totals.present}</td>
              <td className="border-t border-border px-2 text-center tabular-nums text-muted-foreground">{row.totals.half}</td>
              <td className="border-t border-border px-2 text-center tabular-nums text-muted-foreground">{row.totals.leave}</td>
              <td className={cn("border-t border-border px-2 text-center tabular-nums", row.totals.absent ? "font-semibold text-red-600 dark:text-red-400" : "text-muted-foreground")}>
                {row.totals.absent}
              </td>
              <td className={cn("border-t border-border px-2 text-center tabular-nums", row.totals.late ? "font-semibold text-amber-600 dark:text-amber-400" : "text-muted-foreground")}>
                {row.totals.late}
              </td>
              <td className="border-t border-border px-3 text-right font-semibold tabular-nums text-foreground">{Math.round(row.totals.minutes / 6) / 10}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** "YYYY-MM" from a query value, defaulting to this month. */
export function monthParam(value: string | undefined, today: string): string {
  return value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value) ? value : today.slice(0, 7);
}

export function shiftMonth(month: string, by: number): string {
  const [year, m] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, m - 1 + by, 1));
  return date.toISOString().slice(0, 7);
}

export function monthLabel(month: string): string {
  return new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${month}-01T00:00:00Z`));
}
