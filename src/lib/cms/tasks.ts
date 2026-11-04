import { getDb } from "./db";

/** Team tasks: board, checklist, time tracking and links to CRM records. */

export const TASK_STATUSES = ["todo", "in_progress", "review", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];
export const STATUS_LABELS: Record<TaskStatus, string> = { todo: "To do", in_progress: "In progress", review: "In review", done: "Done" };

export const PRIORITIES = ["urgent", "high", "normal", "low"] as const;
export type Priority = (typeof PRIORITIES)[number];

export type LinkedEntity = "lead" | "enquiry" | "application";

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assignee_id: number | null;
  assignee_name: string | null;
  created_by: number;
  creator_name: string | null;
  reviewer_id: number | null;
  reviewer_name: string | null;
  due_date: string | null;
  project: string;
  entity: LinkedEntity | null;
  entity_id: number | null;
  estimate_minutes: number | null;
  position: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  /** Logged minutes (finished timers and manual entries). */
  logged: number;
  items_total: number;
  items_done: number;
}

const SELECT = `SELECT t.*, a.name AS assignee_name, c.name AS creator_name, r.name AS reviewer_name,
  (SELECT COALESCE(SUM(minutes),0) FROM time_entries e WHERE e.task_id = t.id) AS logged,
  (SELECT COUNT(*) FROM task_items i WHERE i.task_id = t.id) AS items_total,
  (SELECT COUNT(*) FROM task_items i WHERE i.task_id = t.id AND i.done = 1) AS items_done
  FROM tasks t LEFT JOIN users a ON a.id = t.assignee_id LEFT JOIN users c ON c.id = t.created_by LEFT JOIN users r ON r.id = t.reviewer_id`;

export interface TaskFilter {
  /** Limit to tasks assigned to, created by or reviewed by this person. */
  visibleTo?: number;
  assigneeId?: number;
  reviewerId?: number;
  status?: string;
  priority?: string;
  project?: string;
  q?: string;
  entity?: LinkedEntity;
  entityId?: number;
  /** Include tasks finished more than 14 days ago. */
  oldDone?: boolean;
}

export function listTasks(filter: TaskFilter = {}): Task[] {
  const where: string[] = [];
  const params: unknown[] = [];
  if (filter.visibleTo) {
    where.push("(t.assignee_id = ? OR t.created_by = ? OR t.reviewer_id = ?)");
    params.push(filter.visibleTo, filter.visibleTo, filter.visibleTo);
  }
  if (filter.reviewerId) {
    where.push("t.reviewer_id = ?");
    params.push(filter.reviewerId);
  }
  if (filter.assigneeId) {
    where.push("t.assignee_id = ?");
    params.push(filter.assigneeId);
  }
  for (const key of ["status", "priority", "project"] as const) {
    if (filter[key]) {
      where.push(`t.${key} = ?`);
      params.push(filter[key]);
    }
  }
  if (filter.entity && filter.entityId) {
    where.push("t.entity = ? AND t.entity_id = ?");
    params.push(filter.entity, filter.entityId);
  }
  if (filter.q) {
    where.push("(t.title LIKE ? OR t.description LIKE ? OR t.project LIKE ?)");
    params.push(`%${filter.q}%`, `%${filter.q}%`, `%${filter.q}%`);
  }
  if (!filter.oldDone && !filter.status) {
    where.push("(t.status != 'done' OR t.completed_at >= ?)");
    params.push(new Date(Date.now() - 14 * 86_400_000).toISOString());
  }
  const order = "CASE t.priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'normal' THEN 2 ELSE 3 END";
  return getDb()
    .prepare(`${SELECT} ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY t.position, ${order}, COALESCE(t.due_date,'9999'), t.id DESC LIMIT 500`)
    .all(...params) as Task[];
}

export function getTask(id: number): Task | null {
  return (getDb().prepare(`${SELECT} WHERE t.id = ?`).get(id) as Task | undefined) ?? null;
}

export interface TaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  assigneeId?: number | null;
  reviewerId?: number | null;
  dueDate?: string | null;
  project?: string;
  entity?: LinkedEntity | null;
  entityId?: number | null;
  estimateMinutes?: number | null;
}

export function createTask(input: TaskInput, createdBy: number): number {
  const now = new Date().toISOString();
  const status = input.status && TASK_STATUSES.includes(input.status) ? input.status : "todo";
  const result = getDb()
    .prepare(
      `INSERT INTO tasks (title,description,status,priority,assignee_id,reviewer_id,created_by,due_date,project,entity,entity_id,estimate_minutes,position,created_at,updated_at,completed_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,0,?,?,?)`,
    )
    .run(
      input.title,
      input.description ?? "",
      status,
      input.priority && PRIORITIES.includes(input.priority) ? input.priority : "normal",
      input.assigneeId ?? null,
      input.reviewerId ?? null,
      createdBy,
      input.dueDate || null,
      input.project ?? "",
      input.entity && input.entityId ? input.entity : null,
      input.entity && input.entityId ? input.entityId : null,
      input.estimateMinutes ?? null,
      now,
      now,
      status === "done" ? now : null,
    );
  return Number(result.lastInsertRowid);
}

export function updateTask(id: number, input: Partial<TaskInput>): void {
  const sets: string[] = [];
  const params: unknown[] = [];
  const set = (column: string, value: unknown) => {
    sets.push(`${column} = ?`);
    params.push(value);
  };
  if (input.title !== undefined) set("title", input.title);
  if (input.description !== undefined) set("description", input.description);
  if (input.priority && PRIORITIES.includes(input.priority)) set("priority", input.priority);
  if (input.assigneeId !== undefined) set("assignee_id", input.assigneeId);
  if (input.reviewerId !== undefined) set("reviewer_id", input.reviewerId);
  if (input.dueDate !== undefined) set("due_date", input.dueDate || null);
  if (input.project !== undefined) set("project", input.project);
  if (input.estimateMinutes !== undefined) set("estimate_minutes", input.estimateMinutes);
  if (input.status && TASK_STATUSES.includes(input.status)) {
    set("status", input.status);
    sets.push("completed_at = CASE WHEN ? = 'done' THEN COALESCE(completed_at, ?) ELSE NULL END");
    params.push(input.status, new Date().toISOString());
  }
  if (!sets.length) return;
  set("updated_at", new Date().toISOString());
  getDb()
    .prepare(`UPDATE tasks SET ${sets.join(", ")} WHERE id = ?`)
    .run(...params, id);
}

/** Moves a task to a column, placed before `beforeId` (or at the end). */
export function moveTask(id: number, status: TaskStatus, beforeId?: number | null): void {
  const db = getDb();
  const column = db.prepare("SELECT id, position FROM tasks WHERE status = ? AND id != ? ORDER BY position, id").all(status, id) as { id: number; position: number }[];
  const index = beforeId ? column.findIndex((task) => task.id === beforeId) : -1;
  let position: number;
  if (index === -1) position = (column.at(-1)?.position ?? 0) + 1;
  else if (index === 0) position = column[0].position - 1;
  else position = (column[index - 1].position + column[index].position) / 2;
  updateTask(id, { status });
  db.prepare("UPDATE tasks SET position = ? WHERE id = ?").run(position, id);
}

export function deleteTask(id: number): void {
  getDb().prepare("DELETE FROM tasks WHERE id = ?").run(id);
  getDb().prepare("DELETE FROM notes WHERE entity = 'task' AND entity_id = ?").run(id);
}

export function taskProjects(): string[] {
  return (getDb().prepare("SELECT DISTINCT project FROM tasks WHERE project != '' ORDER BY project").all() as { project: string }[]).map((row) => row.project);
}

/** Open, due today and overdue tasks for one person. */
export function taskCounts(userId: number, today: string): { open: number; dueToday: number; overdue: number; toReview: number } {
  const row = getDb()
    .prepare(
      `SELECT COUNT(*) AS open,
        SUM(CASE WHEN due_date = ? THEN 1 ELSE 0 END) AS dueToday,
        SUM(CASE WHEN due_date < ? THEN 1 ELSE 0 END) AS overdue
       FROM tasks WHERE assignee_id = ? AND status != 'done'`,
    )
    .get(today, today, userId) as { open: number; dueToday: number | null; overdue: number | null };
  const toReview = (getDb().prepare("SELECT COUNT(*) AS n FROM tasks WHERE reviewer_id = ? AND status = 'review'").get(userId) as { n: number }).n;
  return { open: row.open, dueToday: row.dueToday ?? 0, overdue: row.overdue ?? 0, toReview };
}

/* -------------------------------- checklist -------------------------------- */

export interface TaskItem {
  id: number;
  task_id: number;
  body: string;
  done: number;
}

export function taskItems(taskId: number): TaskItem[] {
  return getDb().prepare("SELECT * FROM task_items WHERE task_id = ? ORDER BY position, id").all(taskId) as TaskItem[];
}

export function addTaskItem(taskId: number, body: string): void {
  const next = (getDb().prepare("SELECT COALESCE(MAX(position),0) + 1 AS n FROM task_items WHERE task_id = ?").get(taskId) as { n: number }).n;
  getDb().prepare("INSERT INTO task_items (task_id,body,position) VALUES (?,?,?)").run(taskId, body, next);
}

export function toggleTaskItem(taskId: number, itemId: number): void {
  getDb().prepare("UPDATE task_items SET done = 1 - done WHERE id = ? AND task_id = ?").run(itemId, taskId);
}

export function deleteTaskItem(taskId: number, itemId: number): void {
  getDb().prepare("DELETE FROM task_items WHERE id = ? AND task_id = ?").run(itemId, taskId);
}

/* ------------------------------- time tracking ------------------------------ */

export interface TimeEntry {
  id: number;
  source: "timer" | "manual" | "sheet";
  task_id: number;
  user_id: number;
  user_name: string | null;
  started_at: string;
  ended_at: string | null;
  minutes: number;
  note: string;
}

export interface RunningTimer {
  id: number;
  task_id: number;
  title: string;
  started_at: string;
}

/** Longest a single timer run can count. */
export const MAX_TIMER_MINUTES = 10 * 60;

/** Stops every timer running longer than the cap (scheduled clean-up). */
export function stopStaleTimers(now: Date = new Date()): number {
  const stale = getDb()
    .prepare("SELECT DISTINCT user_id FROM time_entries WHERE ended_at IS NULL AND started_at < ?")
    .all(new Date(now.getTime() - MAX_TIMER_MINUTES * 60_000).toISOString()) as { user_id: number }[];
  for (const row of stale) stopTimer(row.user_id, now);
  return stale.length;
}

export function runningTimer(userId: number): RunningTimer | null {
  return (
    (getDb()
      .prepare("SELECT e.id, e.task_id, t.title, e.started_at FROM time_entries e JOIN tasks t ON t.id = e.task_id WHERE e.user_id = ? AND e.ended_at IS NULL LIMIT 1")
      .get(userId) as RunningTimer | undefined) ?? null
  );
}

export function stopTimer(userId: number, now: Date = new Date()): void {
  const timer = runningTimer(userId);
  if (!timer) return;
  const elapsed = Math.max(1, Math.round((now.getTime() - Date.parse(timer.started_at)) / 60_000));
  // A timer left running overnight is capped so it can't inflate the timesheet.
  const minutes = Math.min(elapsed, MAX_TIMER_MINUTES);
  getDb()
    .prepare("UPDATE time_entries SET ended_at = ?, minutes = ?, note = CASE WHEN ? THEN 'Timer stopped automatically after 10 hours' ELSE note END WHERE id = ?")
    .run(now.toISOString(), minutes, elapsed > MAX_TIMER_MINUTES ? 1 : 0, timer.id);
}

/** Starts a timer on a task, stopping any other running timer first. */
export function startTimer(taskId: number, userId: number, now: Date = new Date()): void {
  stopTimer(userId, now);
  getDb().prepare("INSERT INTO time_entries (task_id,user_id,started_at) VALUES (?,?,?)").run(taskId, userId, now.toISOString());
}

export function logTime(taskId: number, userId: number, minutes: number, note: string, day?: string): void {
  const startedAt = day ? new Date(`${day}T12:00:00+05:30`).toISOString() : new Date().toISOString();
  getDb()
    .prepare("INSERT INTO time_entries (task_id,user_id,started_at,ended_at,minutes,note,source) VALUES (?,?,?,?,?,?,'manual')")
    .run(taskId, userId, startedAt, startedAt, minutes, note);
}

export function deleteTimeEntry(id: number, userId: number | null): void {
  if (userId === null) getDb().prepare("DELETE FROM time_entries WHERE id = ?").run(id);
  else getDb().prepare("DELETE FROM time_entries WHERE id = ? AND user_id = ?").run(id, userId);
}

export function timeEntries(taskId: number): TimeEntry[] {
  return getDb()
    .prepare("SELECT e.*, u.name AS user_name FROM time_entries e LEFT JOIN users u ON u.id = e.user_id WHERE e.task_id = ? ORDER BY e.started_at DESC")
    .all(taskId) as TimeEntry[];
}

/** Minutes logged per person between two ISO instants (timesheet). */
export function timesheet(from: string, to: string, userId?: number): { user_id: number; name: string; day: string; minutes: number }[] {
  return getDb()
    .prepare(
      `SELECT e.user_id, u.name, substr(datetime(e.started_at, '+330 minutes'), 1, 10) AS day, SUM(e.minutes) AS minutes
       FROM time_entries e JOIN users u ON u.id = e.user_id
       WHERE e.ended_at IS NOT NULL AND e.started_at >= ? AND e.started_at < ? ${userId ? "AND e.user_id = ?" : ""}
       GROUP BY e.user_id, day ORDER BY u.name, day`,
    )
    .all(from, to, ...(userId ? [userId] : [])) as { user_id: number; name: string; day: string; minutes: number }[];
}
