"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Send } from "lucide-react";

import { decideSheetAction, saveSheetAction } from "@/app/admin/work-actions";
import type { FormState } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

import { FormMessage, SubmitButton } from "./form-bits";
import { inputClass } from "./ui";

export interface GridRow {
  task_id: number;
  title: string;
  project: string;
  days: number[];
  tracked: number[];
}

function fmt(minutes: number): string {
  if (!minutes) return "";
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;
}

function parse(value: string): number {
  const text = value.trim();
  if (!text) return 0;
  const match = text.match(/^(\d{1,2}):(\d{2})$/);
  const minutes = match ? Number(match[1]) * 60 + Number(match[2]) : Math.round(Number(text) * 60);
  return Number.isFinite(minutes) && minutes > 0 ? minutes : 0;
}

const total = (minutes: number) => (minutes ? `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m` : "—");

/** Weekly grid: one row per task, one column per day. */
export function TimesheetGrid({
  week,
  days,
  rows: initial,
  atWork,
  editable,
  openTasks,
  today,
}: {
  week: string;
  days: string[];
  rows: GridRow[];
  atWork: number[];
  editable: boolean;
  openTasks: { id: number; title: string }[];
  today: string;
}) {
  const [state, action] = useActionState<FormState, FormData>(saveSheetAction, {});
  const [rows, setRows] = useState(initial);
  const [source, setSource] = useState(initial);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(initial.flatMap((row) => row.days.map((minutes, i) => [`${row.task_id}:${days[i]}`, fmt(minutes)]))),
  );
  if (initial !== source) {
    setSource(initial);
    setRows(initial);
    setValues(Object.fromEntries(initial.flatMap((row) => row.days.map((minutes, i) => [`${row.task_id}:${days[i]}`, fmt(minutes)]))));
  }
  const available = openTasks.filter((task) => !rows.some((row) => row.task_id === task.id));
  const dayTotals = useMemo(() => days.map((day) => rows.reduce((sum, row) => sum + parse(values[`${row.task_id}:${day}`] ?? ""), 0)), [days, rows, values]);
  const weekTotal = dayTotals.reduce((sum, minutes) => sum + minutes, 0);

  return (
    <form action={action}>
      <input type="hidden" name="week" value={week} />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[46rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              <th className="px-4 py-3">Task</th>
              {days.map((day) => (
                <th key={day} className={cn("w-[4.6rem] px-1 py-3 text-center", day === today && "text-[#2f56d8]")}>
                  {new Intl.DateTimeFormat("en-IN", { weekday: "short", timeZone: "UTC" }).format(new Date(`${day}T00:00:00Z`))}
                  <span className="block text-[10px] font-medium normal-case tracking-normal">{Number(day.slice(8))}</span>
                </th>
              ))}
              <th className="w-24 px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => {
              const rowTotal = days.reduce((sum, day) => sum + parse(values[`${row.task_id}:${day}`] ?? ""), 0);
              return (
                <tr key={row.task_id}>
                  <td className="max-w-64 px-4 py-2">
                    <Link href={`/admin/tasks/${row.task_id}`} className="block truncate font-medium text-foreground hover:underline">
                      {row.title}
                    </Link>
                    {row.project ? <span className="text-xs text-muted-foreground">{row.project}</span> : null}
                  </td>
                  {days.map((day, i) => {
                    const key = `${row.task_id}:${day}`;
                    return (
                      <td key={day} className="px-1 py-2 text-center">
                        {editable ? (
                          <input
                            name={`cell:${key}`}
                            value={values[key] ?? ""}
                            onChange={(event) => setValues({ ...values, [key]: event.target.value })}
                            inputMode="decimal"
                            placeholder="·"
                            aria-label={`${row.title} on ${day}`}
                            title={row.tracked[i] ? `Timers recorded ${fmt(row.tracked[i])}; you can only add to this.` : "Hours, e.g. 1.5 or 1:30"}
                            className={cn(
                              "h-9 w-[4.2rem] rounded-lg border border-border bg-surface text-center text-sm tabular-nums text-foreground outline-none focus:border-setu focus:ring-2 focus:ring-setu/20",
                              row.tracked[i] ? "border-[#2f56d8]/40 bg-[#2f56d8]/[0.04]" : "",
                            )}
                          />
                        ) : (
                          <span className="tabular-nums text-foreground">{fmt(row.days[i]) || <span className="text-muted-foreground/40">·</span>}</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-2 text-right font-semibold tabular-nums text-foreground">{total(rowTotal)}</td>
                </tr>
              );
            })}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No time this week yet. {editable ? "Add a task below, or start a timer on a task." : ""}
                </td>
              </tr>
            ) : null}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border font-semibold">
              <td className="px-4 py-2.5 text-foreground">Logged</td>
              {dayTotals.map((minutes, i) => (
                <td key={days[i]} className="px-1 py-2.5 text-center tabular-nums text-foreground">
                  {fmt(minutes) || "·"}
                </td>
              ))}
              <td className="px-4 py-2.5 text-right tabular-nums text-foreground">{total(weekTotal)}</td>
            </tr>
            <tr className="text-xs text-muted-foreground">
              <td className="px-4 pb-3">At work (attendance)</td>
              {atWork.map((minutes, i) => (
                <td
                  key={days[i]}
                  className={cn("px-1 pb-3 text-center tabular-nums", minutes && dayTotals[i] > minutes + 15 && "font-semibold text-amber-600 dark:text-amber-400")}
                  title={minutes && dayTotals[i] > minutes + 15 ? "More time logged than time at work" : undefined}
                >
                  {fmt(minutes) || "·"}
                </td>
              ))}
              <td className="px-4 pb-3 text-right tabular-nums">{total(atWork.reduce((sum, minutes) => sum + minutes, 0))}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {editable ? (
        <div className="flex flex-col gap-4 border-t border-border px-4 py-4">
          {available.length ? (
            <div className="flex flex-wrap items-center gap-2">
              <Plus className="size-4 text-muted-foreground" aria-hidden />
              <select
                aria-label="Add a task to this week"
                value=""
                onChange={(event) => {
                  const task = openTasks.find((item) => item.id === Number(event.target.value));
                  if (task) setRows([...rows, { task_id: task.id, title: task.title, project: "", days: days.map(() => 0), tracked: days.map(() => 0) }]);
                }}
                className={`${inputClass} max-w-sm`}
              >
                <option value="">Add a task row…</option>
                {available.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <textarea name="note" rows={2} placeholder="Note for your approver (optional)" aria-label="Note" className={inputClass} />
          <div className="flex flex-wrap items-center gap-2">
            <SubmitButton variant="secondary">Save draft</SubmitButton>
            <SubmitButton name="submit" value="1" pendingLabel="Submitting…">
              <Send className="size-4" aria-hidden /> Submit week
            </SubmitButton>
            <FormMessage state={state} />
          </div>
          <p className="text-xs text-muted-foreground">
            Enter hours as 1.5 or 1:30. Blue cells already include timer time. After you submit, the week is locked until it is approved or sent back.
          </p>
        </div>
      ) : null}
    </form>
  );
}

/** Approver's buttons for one person's week. */
export function SheetDecision({ userId, week, status }: { userId: number; week: string; status: string }) {
  const [state, action] = useActionState<FormState, FormData>(decideSheetAction, {});
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="user_id" value={userId} />
      <input type="hidden" name="week" value={week} />
      {status === "submitted" ? (
        <>
          <input name="note" placeholder="Comment (needed to send back)" aria-label="Comment" className={`${inputClass} h-9 w-52 py-1.5`} />
          <SubmitButton name="decision" value="approve" pendingLabel="…" className="h-9 bg-none bg-emerald-600 px-4">
            Approve
          </SubmitButton>
          <SubmitButton name="decision" value="reject" variant="secondary" pendingLabel="…" className="h-9 px-4">
            Send back
          </SubmitButton>
        </>
      ) : status === "approved" ? (
        <SubmitButton name="decision" value="reopen" variant="secondary" pendingLabel="…" className="h-9 px-4">
          Reopen
        </SubmitButton>
      ) : null}
      <FormMessage state={state} />
    </form>
  );
}
