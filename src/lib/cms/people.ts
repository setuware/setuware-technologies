import {
  attendanceSettings,
  isLate,
  localDay,
  workedMinutes,
  type AttendanceRecord,
} from "./attendance";
import { getDb } from "./db";

/* ------------------------------ work updates ------------------------------- */

export interface WorkUpdate {
  id: number;
  user_id: number;
  name: string;
  designation: string;
  body: string;
  created_at: string;
}

export const UPDATE_MAX = 1000;

/** A short note on what someone is working on, shown on their profile and the team feed. */
export function postUpdate(
  userId: number,
  body: string,
  now: Date = new Date(),
): number {
  const clean = body.trim().slice(0, UPDATE_MAX);
  if (!clean) throw new Error("Write something before posting.");
  const result = getDb()
    .prepare(
      "INSERT INTO work_updates (user_id, body, created_at) VALUES (?,?,?)",
    )
    .run(userId, clean, now.toISOString());
  return Number(result.lastInsertRowid);
}

/** Removes an update; pass `userId` to only allow the author. */
export function deleteUpdate(id: number, userId: number | null): void {
  if (userId === null)
    getDb().prepare("DELETE FROM work_updates WHERE id = ?").run(id);
  else
    getDb()
      .prepare("DELETE FROM work_updates WHERE id = ? AND user_id = ?")
      .run(id, userId);
}

export function listUpdates(
  filter: { userId?: number; limit?: number } = {},
): WorkUpdate[] {
  const where = filter.userId ? "WHERE w.user_id = ?" : "";
  const args = filter.userId ? [filter.userId] : [];
  return getDb()
    .prepare(
      `SELECT w.id, w.user_id, u.name, COALESCE(u.designation, '') AS designation, w.body, w.created_at
       FROM work_updates w JOIN users u ON u.id = w.user_id ${where}
       ORDER BY w.created_at DESC, w.id DESC LIMIT ?`,
    )
    .all(...args, filter.limit ?? 50) as unknown as WorkUpdate[];
}

/* ----------------------------- activity timeline --------------------------- */

export type ActivityKind = "update" | "attendance" | "task" | "time" | "leave";

export interface Activity {
  kind: ActivityKind;
  at: string;
  title: string;
  body: string;
  link: string;
}

/** Everything one person did recently, newest first: updates, days worked, finished tasks, time logged and leave. */
export function activityFor(
  userId: number,
  limit = 30,
  options: { tasks?: boolean } = {},
): Activity[] {
  const withTasks = options.tasks ?? true;
  const db = getDb();
  const items: Activity[] = [];
  for (const update of listUpdates({ userId, limit })) {
    items.push({
      kind: "update",
      at: update.created_at,
      title: "Posted an update",
      body: update.body,
      link: "",
    });
  }
  const days = db
    .prepare(
      "SELECT * FROM attendance WHERE user_id = ? ORDER BY day DESC LIMIT ?",
    )
    .all(userId, limit) as unknown as AttendanceRecord[];
  for (const day of days) {
    items.push({
      kind: "attendance",
      at: day.check_out_at ?? day.check_in_at,
      title: day.check_out_at
        ? `Worked ${hours(workedMinutes(day))} · ${day.mode}`
        : `Checked in · ${day.mode}`,
      body: day.summary,
      link: "",
    });
  }
  const done = !withTasks
    ? []
    : (db
        .prepare(
          "SELECT id, title, project, completed_at FROM tasks WHERE assignee_id = ? AND completed_at IS NOT NULL ORDER BY completed_at DESC LIMIT ?",
        )
        .all(userId, limit) as {
        id: number;
        title: string;
        project: string;
        completed_at: string;
      }[]);
  for (const task of done) {
    items.push({
      kind: "task",
      at: task.completed_at,
      title: `Completed “${task.title}”`,
      body: task.project,
      link: `/admin/tasks/${task.id}`,
    });
  }
  const time = !withTasks
    ? []
    : (db
        .prepare(
          `SELECT e.task_id, e.minutes, e.note, e.ended_at, t.title FROM time_entries e JOIN tasks t ON t.id = e.task_id
       WHERE e.user_id = ? AND e.ended_at IS NOT NULL AND e.minutes > 0 ORDER BY e.ended_at DESC LIMIT ?`,
        )
        .all(userId, limit) as {
        task_id: number;
        minutes: number;
        note: string;
        ended_at: string;
        title: string;
      }[]);
  for (const entry of time) {
    items.push({
      kind: "time",
      at: entry.ended_at,
      title: `Logged ${hours(entry.minutes)} on “${entry.title}”`,
      body: entry.note,
      link: `/admin/tasks/${entry.task_id}`,
    });
  }
  const leave = db
    .prepare(
      "SELECT kind, leave_type, from_day, to_day, status, created_at FROM leave_requests WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
    )
    .all(userId, limit) as {
    kind: string;
    leave_type: string;
    from_day: string;
    to_day: string;
    status: string;
    created_at: string;
  }[];
  for (const request of leave) {
    const range =
      request.from_day === request.to_day
        ? request.from_day
        : `${request.from_day} to ${request.to_day}`;
    items.push({
      kind: "leave",
      at: request.created_at,
      title:
        request.kind === "leave"
          ? `Requested ${request.leave_type.toLowerCase() || "leave"} · ${range}`
          : `Asked for an attendance correction · ${range}`,
      body:
        request.status === "pending"
          ? "Waiting for approval"
          : request.status[0].toUpperCase() + request.status.slice(1),
      link: "",
    });
  }
  return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
}

function hours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? (m ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
}

/* ------------------------------ month summary ------------------------------ */

export interface MonthSummary {
  month: string;
  daysPresent: number;
  lateDays: number;
  minutes: number;
  averageMinutes: number;
  tasksDone: number;
  loggedMinutes: number;
}

/** One person's month so far: days in, late arrivals, hours, finished tasks and time logged on tasks. */
export function monthSummary(
  userId: number,
  month: string = localDay().slice(0, 7),
  now: Date = new Date(),
): MonthSummary {
  const db = getDb();
  const settings = attendanceSettings();
  const days = db
    .prepare("SELECT * FROM attendance WHERE user_id = ? AND day LIKE ?")
    .all(userId, `${month}-%`) as unknown as AttendanceRecord[];
  // A missed check-out on an earlier day counts as zero, as in the attendance register.
  const today = localDay(now);
  const minutes = days.reduce(
    (sum, day) =>
      sum +
      (day.check_out_at || day.day === today ? workedMinutes(day, now) : 0),
    0,
  );
  const tasksDone = (
    db
      .prepare(
        "SELECT COUNT(*) AS n FROM tasks WHERE assignee_id = ? AND completed_at LIKE ?",
      )
      .get(userId, `${month}-%`) as { n: number }
  ).n;
  const logged = (
    db
      .prepare(
        "SELECT COALESCE(SUM(minutes), 0) AS n FROM time_entries WHERE user_id = ? AND started_at LIKE ?",
      )
      .get(userId, `${month}-%`) as { n: number }
  ).n;
  return {
    month,
    daysPresent: days.length,
    lateDays: days.filter((day) => isLate(day, settings)).length,
    minutes,
    averageMinutes: days.length ? Math.round(minutes / days.length) : 0,
    tasksDone,
    loggedMinutes: logged,
  };
}

/* ------------------------------- team moments ------------------------------ */

export interface Moment {
  userId: number;
  name: string;
  kind: "birthday" | "anniversary";
  day: string;
  years: number;
}

/** Birthdays and work anniversaries in the next `days` days, soonest first. */
export function upcomingMoments(
  users: {
    id: number;
    name: string;
    birthday: string | null;
    joinedOn: string | null;
  }[],
  today: string = localDay(),
  days = 30,
): Moment[] {
  const year = Number(today.slice(0, 4));
  const start = Date.parse(`${today}T00:00:00Z`);
  const out: Moment[] = [];
  const next = (date: string) => {
    for (const y of [year, year + 1]) {
      const day = `${y}-${date.slice(5)}`;
      const diff = (Date.parse(`${day}T00:00:00Z`) - start) / 86_400_000;
      if (diff >= 0 && diff <= days) return { day, y };
    }
    return null;
  };
  for (const user of users) {
    if (user.birthday) {
      const hit = next(user.birthday);
      if (hit)
        out.push({
          userId: user.id,
          name: user.name,
          kind: "birthday",
          day: hit.day,
          years: 0,
        });
    }
    if (user.joinedOn) {
      const hit = next(user.joinedOn);
      const years = hit ? hit.y - Number(user.joinedOn.slice(0, 4)) : 0;
      if (hit && years > 0)
        out.push({
          userId: user.id,
          name: user.name,
          kind: "anniversary",
          day: hit.day,
          years,
        });
    }
  }
  return out.sort((a, b) => a.day.localeCompare(b.day));
}
