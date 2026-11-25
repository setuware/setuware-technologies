import { addDays, attendanceSettings, listRequests, weekday, workedMinutes, workingDays, type AttendanceRecord } from "./attendance";
import { getDb } from "./db";

/**
 * Weekly timesheets (Monday to Sunday, India time). Time comes from task
 * timers, manual logs and the weekly grid; a submitted or approved week is
 * locked until a manager sends it back.
 */

export type SheetStatus = "draft" | "submitted" | "approved" | "rejected";

export interface Timesheet {
  id: number | null;
  user_id: number;
  week_start: string;
  status: SheetStatus;
  total_minutes: number;
  note: string;
  submitted_at: string | null;
  decided_by: string | null;
  decided_at: string | null;
  decision_note: string;
}

export interface SheetRow {
  task_id: number;
  title: string;
  project: string;
  status: string;
  /** Minutes per day (7 entries, Monday first). */
  days: number[];
  /** Part of each day that came from timers or manual logs (not editable below this). */
  tracked: number[];
  total: number;
}

/** Monday of the week containing `day`. */
export function weekStart(day: string): string {
  return addDays(day, -((weekday(day) + 6) % 7));
}

export function weekDays(monday: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

/** India-time day of an ISO instant, in SQL. */
const DAY_SQL = "substr(datetime(e.started_at, '+330 minutes'), 1, 10)";

export function getSheet(userId: number, monday: string): Timesheet {
  const row = getDb().prepare("SELECT * FROM timesheets WHERE user_id = ? AND week_start = ?").get(userId, monday) as Timesheet | undefined;
  return (
    row ?? {
      id: null,
      user_id: userId,
      week_start: monday,
      status: "draft",
      total_minutes: 0,
      note: "",
      submitted_at: null,
      decided_by: null,
      decided_at: null,
      decision_note: "",
    }
  );
}

/** True when the week containing `day` is submitted or approved. */
export function isLocked(userId: number, day: string): boolean {
  const status = getSheet(userId, weekStart(day)).status;
  return status === "submitted" || status === "approved";
}

/** True when hours logged on the task fall in anyone's submitted or approved week. */
export function hasLockedTime(taskId: number): boolean {
  const rows = getDb()
    .prepare(`SELECT DISTINCT e.user_id AS userId, ${DAY_SQL} AS day FROM time_entries e WHERE e.task_id = ? AND e.ended_at IS NOT NULL`)
    .all(taskId) as { userId: number; day: string }[];
  return rows.some((row) => isLocked(row.userId, row.day));
}

export function sheetRows(userId: number, monday: string, extraTaskIds: number[] = []): SheetRow[] {
  const days = weekDays(monday);
  const entries = getDb()
    .prepare(
      `SELECT e.task_id, ${DAY_SQL} AS day, e.source, SUM(e.minutes) AS minutes
       FROM time_entries e
       WHERE e.user_id = ? AND e.ended_at IS NOT NULL AND ${DAY_SQL} BETWEEN ? AND ?
       GROUP BY e.task_id, day, e.source`,
    )
    .all(userId, days[0], days[6]) as { task_id: number; day: string; source: string; minutes: number }[];
  const ids = [...new Set([...entries.map((entry) => entry.task_id), ...extraTaskIds])];
  if (!ids.length) return [];
  const tasks = getDb()
    .prepare(`SELECT id, title, project, status FROM tasks WHERE id IN (${ids.map(() => "?").join(",")})`)
    .all(...ids) as { id: number; title: string; project: string; status: string }[];
  return tasks
    .map((task) => {
      const mine = entries.filter((entry) => entry.task_id === task.id);
      const total = (day: string, tracked: boolean) =>
        mine.filter((entry) => entry.day === day && (!tracked || entry.source !== "sheet")).reduce((sum, entry) => sum + entry.minutes, 0);
      const row: SheetRow = {
        task_id: task.id,
        title: task.title,
        project: task.project,
        status: task.status,
        days: days.map((day) => total(day, false)),
        tracked: days.map((day) => total(day, true)),
        total: 0,
      };
      row.total = row.days.reduce((sum, minutes) => sum + minutes, 0);
      return row;
    })
    .sort((a, b) => b.total - a.total || a.title.localeCompare(b.title));
}

/**
 * Sets a task's total for one day from the weekly grid. Timer and manual
 * entries stay; the grid adds (or removes) its own adjustment entry.
 */
export function setCell(userId: number, taskId: number, day: string, minutes: number): void {
  if (isLocked(userId, day)) throw new Error("This week is already submitted.");
  const db = getDb();
  const tracked = (
    db
      .prepare(`SELECT COALESCE(SUM(minutes),0) AS n FROM time_entries e WHERE user_id = ? AND task_id = ? AND source != 'sheet' AND ended_at IS NOT NULL AND ${DAY_SQL} = ?`)
      .get(userId, taskId, day) as { n: number }
  ).n;
  if (minutes < tracked) {
    throw new Error(`Timers already recorded ${Math.floor(tracked / 60)}h ${tracked % 60}m on ${day}; remove those entries on the task first.`);
  }
  db.prepare(`DELETE FROM time_entries WHERE user_id = ? AND task_id = ? AND source = 'sheet' AND ${DAY_SQL.replace(/e\./g, "")} = ?`).run(userId, taskId, day);
  if (minutes > tracked) {
    const at = new Date(`${day}T12:00:00+05:30`).toISOString();
    db.prepare("INSERT INTO time_entries (task_id,user_id,started_at,ended_at,minutes,note,source) VALUES (?,?,?,?,?,'','sheet')").run(taskId, userId, at, at, minutes - tracked);
  }
}

/** Minutes at work per day from attendance (for comparison). */
export function attendanceByDay(userId: number, monday: string): number[] {
  const days = weekDays(monday);
  const records = getDb().prepare("SELECT * FROM attendance WHERE user_id = ? AND day BETWEEN ? AND ?").all(userId, days[0], days[6]) as AttendanceRecord[];
  return days.map((day) => {
    const record = records.find((item) => item.day === day);
    return record?.check_out_at ? workedMinutes(record) : 0;
  });
}

export function submitSheet(userId: number, monday: string, note: string, now: Date = new Date()): Timesheet {
  const sheet = getSheet(userId, monday);
  if (sheet.status === "submitted" || sheet.status === "approved") throw new Error("This week is already submitted.");
  const total = sheetRows(userId, monday).reduce((sum, row) => sum + row.total, 0);
  if (!total) throw new Error("Add the hours you worked before submitting.");
  getDb()
    .prepare(
      `INSERT INTO timesheets (user_id,week_start,status,total_minutes,note,submitted_at,decision_note) VALUES (?,?,'submitted',?,?,?,'')
       ON CONFLICT(user_id, week_start) DO UPDATE SET status = 'submitted', total_minutes = excluded.total_minutes, note = excluded.note,
         submitted_at = excluded.submitted_at, decided_by = NULL, decided_at = NULL, decision_note = ''`,
    )
    .run(userId, monday, total, note, now.toISOString());
  return getSheet(userId, monday);
}

/** Approves or sends back a submitted week. */
export function decideSheet(userId: number, monday: string, approve: boolean, by: string, note: string): Timesheet {
  const sheet = getSheet(userId, monday);
  if (sheet.status !== "submitted") throw new Error("Only submitted timesheets can be approved or sent back.");
  if (!approve && !note) throw new Error("Say what needs changing.");
  getDb()
    .prepare("UPDATE timesheets SET status = ?, decided_by = ?, decided_at = ?, decision_note = ? WHERE user_id = ? AND week_start = ?")
    .run(approve ? "approved" : "rejected", by, new Date().toISOString(), note, userId, monday);
  return getSheet(userId, monday);
}

/** Reopens an approved week (managers only), e.g. to correct a mistake. */
export function reopenSheet(userId: number, monday: string, by: string): void {
  getDb()
    .prepare("UPDATE timesheets SET status = 'rejected', decided_by = ?, decided_at = ?, decision_note = 'Reopened for changes' WHERE user_id = ? AND week_start = ?")
    .run(by, new Date().toISOString(), userId, monday);
}

export interface TeamSheet {
  userId: number;
  name: string;
  sheet: Timesheet;
  logged: number;
  atWork: number;
  expected: number;
}

export function teamSheets(users: { id: number; name: string }[], monday: string): TeamSheet[] {
  return users.map((user) => ({
    userId: user.id,
    name: user.name,
    sheet: getSheet(user.id, monday),
    logged: sheetRows(user.id, monday).reduce((sum, row) => sum + row.total, 0),
    atWork: attendanceByDay(user.id, monday).reduce((sum, minutes) => sum + minutes, 0),
    expected: expectedMinutes(monday, user.id),
  }));
}

/** People whose timesheet is waiting for approval (any week). */
export function pendingSheets(): number[] {
  return (getDb().prepare("SELECT user_id FROM timesheets WHERE status = 'submitted'").all() as { user_id: number }[]).map((row) => row.user_id);
}

/** Expected working minutes in a week: working days (no weekly offs, holidays or approved leave) × full-day hours. */
export function expectedMinutes(monday: string, userId?: number): number {
  const settings = attendanceSettings();
  const days = workingDays(monday, addDays(monday, 6), settings);
  let leave = 0;
  if (userId) {
    for (const request of listRequests({ userId, status: "approved", from: monday, to: addDays(monday, 6) })) {
      if (request.kind !== "leave" || request.leave_type === "Work from home") continue;
      leave += days.filter((day) => day >= request.from_day && day <= request.to_day).length * (request.half_day ? 0.5 : 1);
    }
  }
  return Math.round((days.length - leave) * settings.fullDayHours * 60);
}
