"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { refresh } from "next/cache";

import { audit, can, getUser, seesAll, updateAbout, updateEmployment, updateProfile, type AdminUser } from "@/lib/cms/auth";
import { deleteUpdate, postUpdate, UPDATE_MAX } from "@/lib/cms/people";
import { markRead } from "@/lib/cms/notifications";
import { PROJECT_STATUSES, saveProject, type ProjectStatus } from "@/lib/cms/projects";
import {
  addHoliday,
  attendanceSettings,
  cancelRequest,
  checkIn,
  checkOut,
  decideRequest,
  localDay,
  deleteAttendance,
  endBreak,
  LEAVE_TYPES,
  MODES,
  getRequest,
  removeHoliday,
  requestCorrection,
  requestLeave,
  saveAttendanceSettings,
  setAttendance,
  startBreak,
  toIso,
  type Location,
  type Mode,
} from "@/lib/cms/attendance";
import { decideSheet, hasLockedTime, isLocked, reopenSheet, setCell, submitSheet, weekDays, weekStart } from "@/lib/cms/timesheets";
import { addNote } from "@/lib/cms/crm";
import { approversFor, mayApproveFor, notify } from "@/lib/cms/notify";
import { requireUser } from "@/lib/cms/session";
import {
  addTaskItem,
  createTask,
  deleteTask,
  deleteTaskItem,
  deleteTimeEntry,
  getTask,
  timeEntries,
  logTime,
  moveTask,
  PRIORITIES,
  REPEATS,
  startTimer,
  STATUS_LABELS,
  stopTimer,
  TASK_STATUSES,
  toggleTaskItem,
  updateTask,
  type LinkedEntity,
  type Priority,
  type Repeat,
  type Task,
  type TaskStatus,
} from "@/lib/cms/tasks";

import type { FormState } from "./actions";

const text = (form: FormData, key: string, max = 2000) => String(form.get(key) ?? "").trim().slice(0, max);
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}$/;

async function clientIp(): Promise<string | undefined> {
  const h = await headers();
  return (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || undefined;
}

/* ---------------------------------- tasks ---------------------------------- */

function canSeeTask(user: AdminUser, task: Task | null): task is Task {
  return Boolean(task) && (seesAll(user, "tasks") || task?.assignee_id === user.id || task?.created_by === user.id || task?.reviewer_id === user.id);
}

/** People who may review work: anyone with "Review & approve work". */
function mayReview(member: AdminUser): boolean {
  return member.active && can(member, "tasks.review");
}

/** Reviewer from the form: only people who assign may set one, and nobody reviews their own task. */
function reviewerFrom(user: AdminUser, form: FormData, fallback: number | null, assigneeId: number | null): number | null {
  const raw = form.get("reviewer_id");
  if (raw === null || !(can(user, "tasks.assign") || seesAll(user, "tasks"))) return fallback === assigneeId ? null : fallback;
  const id = Number(raw) || null;
  if (id === null) return null;
  const member = getUser(id);
  return member && mayReview(member) && id !== assigneeId ? id : null;
}

/** "Done" on a task with a reviewer goes to review unless the reviewer (or a manager) does it. */
function allowedStatus(user: AdminUser, task: Pick<Task, "reviewer_id" | "status">, requested: TaskStatus): TaskStatus {
  if (requested !== "done" || !task.reviewer_id) return requested;
  if (task.reviewer_id === user.id || (seesAll(user, "tasks") && can(user, "tasks.review"))) return "done";
  return "review";
}

function locationFrom(form: FormData): Location | null {
  const lat = Number(form.get("lat"));
  const lng = Number(form.get("lng"));
  if (!form.get("lat") || !form.get("lng") || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  const accuracy = Number(form.get("accuracy"));
  return { lat, lng, accuracy: Number.isFinite(accuracy) && accuracy > 0 ? accuracy : null };
}

/** Who a task may be given to: anyone with "assign", otherwise only yourself. */
function assigneeFrom(user: AdminUser, form: FormData, fallback: number | null): number | null {
  const raw = form.get("assignee_id");
  if (raw === null) return fallback;
  const id = Number(raw) || null;
  if (id === null || id === user.id) return id;
  if (!can(user, "tasks.assign") && !seesAll(user, "tasks")) return fallback;
  return getUser(id)?.active ? id : fallback;
}

function estimateFrom(form: FormData): number | null {
  const hours = Number(text(form, "estimate_hours", 10));
  return Number.isFinite(hours) && hours > 0 ? Math.round(hours * 60) : null;
}

function repeatFrom(form: FormData): Repeat | null {
  const value = text(form, "repeat", 10) as Repeat;
  return REPEATS.includes(value) ? value : null;
}

const LINKS: Record<LinkedEntity, "leads" | "enquiries" | "applications"> = { lead: "leads", enquiry: "enquiries", application: "applications" };

export async function createTaskAction(_previous: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const title = text(form, "title", 200);
  if (title.length < 2) return { error: "Give the task a title." };
  const dueDate = text(form, "due_date", 10);
  if (dueDate && !DAY.test(dueDate)) return { error: "Choose a valid due date." };
  const entity = text(form, "entity", 20) as LinkedEntity;
  const linked = entity in LINKS && can(user, LINKS[entity]) ? entity : null;
  const assigneeId = assigneeFrom(user, form, user.id);
  const reviewerId = reviewerFrom(user, form, null, assigneeId);
  const status = text(form, "status", 20) as TaskStatus;
  const id = createTask(
    {
      title,
      description: text(form, "description", 10_000),
      status: TASK_STATUSES.includes(status) ? status : "todo",
      priority: (PRIORITIES as readonly string[]).includes(text(form, "priority", 10)) ? (text(form, "priority", 10) as Priority) : "normal",
      assigneeId,
      reviewerId,
      dueDate: dueDate || null,
      project: text(form, "project", 80),
      entity: linked,
      entityId: linked ? Number(form.get("entity_id")) || null : null,
      estimateMinutes: estimateFrom(form),
      repeat: repeatFrom(form),
    },
    user.id,
  );
  addNote("task", id, "system", user.name, "Created the task");
  if (assigneeId && assigneeId !== user.id) {
    notify(assigneeId, `New task: ${title}`, [`${user.name} assigned you a task: ${title}.`, dueDate ? `Due ${dueDate}.` : ""].filter(Boolean), `/admin/tasks/${id}`, "Open the task");
  }
  if (form.get("quick")) {
    refresh();
    return { ok: "Task added." };
  }
  redirect(`/admin/tasks/${id}`);
}

export async function updateTaskAction(_previous: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const id = Number(form.get("id"));
  const task = getTask(id);
  if (!canSeeTask(user, task)) return { error: "Task not found." };
  const changes: string[] = [];

  const title = form.has("title") ? text(form, "title", 200) : task.title;
  if (title.length < 2) return { error: "Give the task a title." };
  const dueDate = form.has("due_date") ? text(form, "due_date", 10) : (task.due_date ?? "");
  if (dueDate && !DAY.test(dueDate)) return { error: "Choose a valid due date." };
  const requested = (form.has("status") ? text(form, "status", 20) : task.status) as TaskStatus;
  const status = allowedStatus(user, task, requested);
  const priority = (form.has("priority") ? text(form, "priority", 10) : task.priority) as Priority;
  const assigneeId = assigneeFrom(user, form, task.assignee_id);
  const reviewerId = reviewerFrom(user, form, task.reviewer_id, assigneeId);

  if (status !== task.status && TASK_STATUSES.includes(status)) changes.push(`Moved from ${STATUS_LABELS[task.status]} to ${STATUS_LABELS[status]}`);
  if (priority !== task.priority && PRIORITIES.includes(priority)) changes.push(`Priority set to ${priority}`);
  if ((dueDate || null) !== task.due_date) changes.push(dueDate ? `Due date set to ${dueDate}` : "Due date removed");
  if (form.has("repeat") && repeatFrom(form) !== task.repeat) changes.push(repeatFrom(form) ? `Set to repeat ${repeatFrom(form)}` : "No longer repeats");
  updateTask(id, {
    title,
    description: form.has("description") ? text(form, "description", 10_000) : task.description,
    status,
    priority,
    assigneeId,
    reviewerId,
    dueDate: dueDate || null,
    project: form.has("project") ? text(form, "project", 80) : task.project,
    estimateMinutes: form.has("estimate_hours") ? estimateFrom(form) : task.estimate_minutes,
    repeat: form.has("repeat") ? repeatFrom(form) : task.repeat,
  });
  for (const change of changes) addNote("task", id, "status", user.name, change);
  if (assigneeId !== task.assignee_id) {
    const name = assigneeId ? getUser(assigneeId)?.name : null;
    addNote("task", id, "assign", user.name, name ? `Assigned to ${name}` : "Unassigned");
    if (assigneeId && assigneeId !== user.id) notify(assigneeId, `Task assigned to you: ${title}`, [`${user.name} assigned you: ${title}.`], `/admin/tasks/${id}`, "Open the task");
  }
  if (reviewerId !== task.reviewer_id) {
    addNote("task", id, "assign", user.name, reviewerId ? `Reviewer set to ${getUser(reviewerId)?.name}` : "Reviewer removed");
  }
  if (status === "review" && task.status !== "review") askForReview({ ...task, title, reviewer_id: reviewerId }, user);
  if (status === "done" && task.status !== "done" && task.created_by !== user.id) {
    notify(task.created_by, `Done: ${title}`, [`${user.name} marked "${title}" as done.`], `/admin/tasks/${id}`, "Open the task");
  }
  refresh();
  return { ok: requested === "done" && status === "review" ? "Sent for review. The reviewer marks it done." : "Saved." };
}

function askForReview(task: Pick<Task, "id" | "title" | "reviewer_id" | "created_by">, user: AdminUser): void {
  const to = task.reviewer_id ?? (task.created_by !== user.id ? task.created_by : null);
  if (to && to !== user.id) {
    notify(to, `Ready for review: ${task.title}`, [`${user.name} finished "${task.title}" and asked you to review it.`], `/admin/tasks/${task.id}`, "Review the task");
  }
}

/** Reviewer's decision: approve (done) or send back with what to change. */
export async function reviewTaskAction(_previous: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const task = getTask(Number(form.get("id")));
  if (!canSeeTask(user, task)) return { error: "Task not found." };
  const reviewer = task.reviewer_id === user.id || (can(user, "tasks.review") && (seesAll(user, "tasks") || task.created_by === user.id));
  if (!reviewer) return { error: "Only the reviewer can approve this task." };
  if (task.status !== "review") return { error: "This task is not waiting for review." };
  const comment = text(form, "comment", 3000);
  if (form.get("decision") === "approve") {
    updateTask(task.id, { status: "done" });
    addNote("task", task.id, "status", user.name, comment ? `Approved and marked done\n${comment}` : "Approved and marked done");
    notify(task.assignee_id !== user.id ? task.assignee_id : null, `Approved: ${task.title}`, [`${user.name} approved "${task.title}".`, comment].filter(Boolean), `/admin/tasks/${task.id}`, "Open the task");
    refresh();
    return { ok: "Approved. The task is done." };
  }
  if (comment.length < 3) return { error: "Say what needs to change." };
  updateTask(task.id, { status: "in_progress" });
  addNote("task", task.id, "status", user.name, `Changes requested\n${comment}`);
  notify(task.assignee_id !== user.id ? task.assignee_id : null, `Changes requested: ${task.title}`, [`${user.name} reviewed "${task.title}" and asked for changes:`, comment], `/admin/tasks/${task.id}`, "Open the task");
  refresh();
  return { ok: "Sent back to the assignee with your comments." };
}

/** Drag and drop on the board. */
export async function moveTaskAction(id: number, status: string, beforeId: number | null): Promise<{ error?: string; notice?: string }> {
  const user = await requireUser();
  const task = getTask(id);
  if (!canSeeTask(user, task) || !TASK_STATUSES.includes(status as TaskStatus)) return { error: "Task not found." };
  const target = allowedStatus(user, task, status as TaskStatus);
  moveTask(id, target, target === status ? beforeId : null);
  if (target === "review" && task.status !== "review") askForReview(task, user);
  if (target !== status) {
    addNote("task", id, "status", user.name, `Sent for review (moved from ${STATUS_LABELS[task.status]})`);
    refresh();
    return { notice: `“${task.title}” went to In review: ${task.reviewer_name ?? "the reviewer"} marks it done.` };
  }
  if (status !== task.status) {
    addNote("task", id, "status", user.name, `Moved from ${STATUS_LABELS[task.status]} to ${STATUS_LABELS[status as TaskStatus]}`);
    if (status === "done" && task.created_by !== user.id) {
      notify(task.created_by, `Done: ${task.title}`, [`${user.name} marked "${task.title}" as done.`], `/admin/tasks/${id}`, "Open the task");
    }
  }
  refresh();
  return {};
}

/** List view: apply one change to every ticked task the person may change. */
export async function bulkTaskAction(form: FormData): Promise<void> {
  const user = await requireUser();
  const op = text(form, "bulk_op", 20);
  const value = text(form, "bulk_value", 20);
  const tasks = form
    .getAll("ids")
    .map(Number)
    .filter(Boolean)
    .slice(0, 500)
    .map(getTask)
    .filter((task): task is Task => canSeeTask(user, task));
  const canAssign = can(user, "tasks.assign") || seesAll(user, "tasks");
  let changed = 0;
  for (const task of tasks) {
    if (op === "status" && TASK_STATUSES.includes(value as TaskStatus)) {
      const status = allowedStatus(user, task, value as TaskStatus);
      if (status === task.status) continue;
      updateTask(task.id, { status });
      addNote("task", task.id, "status", user.name, `Moved from ${STATUS_LABELS[task.status]} to ${STATUS_LABELS[status]} (bulk)`);
      if (status === "review") askForReview(task, user);
      if (status === "done" && task.created_by !== user.id) notify(task.created_by, `Done: ${task.title}`, [`${user.name} marked "${task.title}" as done.`], `/admin/tasks/${task.id}`, "Open the task");
    } else if (op === "priority" && (PRIORITIES as readonly string[]).includes(value)) {
      if (value === task.priority) continue;
      updateTask(task.id, { priority: value as Priority });
      addNote("task", task.id, "status", user.name, `Priority set to ${value} (bulk)`);
    } else if (op === "due" && (value === "" || DAY.test(value))) {
      if ((value || null) === task.due_date) continue;
      updateTask(task.id, { dueDate: value || null });
      addNote("task", task.id, "status", user.name, value ? `Due date set to ${value} (bulk)` : "Due date removed (bulk)");
    } else if (op === "assign") {
      const id = Number(value) || null;
      const member = id ? getUser(id) : null;
      if (id === task.assignee_id || (id && !member?.active) || (id !== user.id && id !== null && !canAssign)) continue;
      updateTask(task.id, { assigneeId: id, ...(task.reviewer_id === id ? { reviewerId: null } : {}) });
      addNote("task", task.id, "assign", user.name, member ? `Assigned to ${member.name} (bulk)` : "Unassigned (bulk)");
      if (id && id !== user.id) notify(id, `Task assigned to you: ${task.title}`, [`${user.name} assigned you: ${task.title}.`], `/admin/tasks/${task.id}`, "Open the task");
    } else if (op === "delete") {
      if ((task.created_by !== user.id && !seesAll(user, "tasks")) || hasLockedTime(task.id)) continue;
      deleteTask(task.id);
      audit(user.name, "deleted task", "task", task.title);
    } else continue;
    changed++;
  }
  if (changed) audit(user.name, "bulk update", "task", `${changed} × ${op}${value ? ` → ${value}` : ""}`);
  refresh();
}

export async function deleteTaskAction(form: FormData): Promise<void> {
  const user = await requireUser();
  const task = getTask(Number(form.get("id")));
  if (task && (task.created_by === user.id || seesAll(user, "tasks"))) {
    deleteTask(task.id);
    audit(user.name, "deleted task", "task", task.title);
  }
  redirect("/admin/tasks");
}

export async function taskCommentAction(_previous: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const task = getTask(Number(form.get("id")));
  if (!canSeeTask(user, task)) return { error: "Task not found." };
  const body = text(form, "body", 5000);
  if (body.length < 2) return { error: "Write a comment first." };
  addNote("task", task.id, "note", user.name, body);
  for (const id of new Set([task.assignee_id, task.created_by])) {
    if (id && id !== user.id) notify(id, `Comment on: ${task.title}`, [`${user.name} commented:`, body.slice(0, 500)], `/admin/tasks/${task.id}`, "Reply");
  }
  refresh();
  return { ok: "Comment added." };
}

export async function taskItemAction(form: FormData): Promise<void> {
  const user = await requireUser();
  const task = getTask(Number(form.get("task_id")));
  if (!canSeeTask(user, task)) return;
  const op = text(form, "op", 10);
  if (op === "add" && text(form, "body", 300)) addTaskItem(task.id, text(form, "body", 300));
  if (op === "toggle") toggleTaskItem(task.id, Number(form.get("item_id")));
  if (op === "delete") deleteTaskItem(task.id, Number(form.get("item_id")));
  refresh();
}

export async function timerAction(form: FormData): Promise<void> {
  const user = await requireUser();
  if (text(form, "op", 10) === "stop") {
    stopTimer(user.id);
  } else {
    const task = getTask(Number(form.get("task_id")));
    if (!canSeeTask(user, task) || isLocked(user.id, localDay())) return;
    startTimer(task.id, user.id);
    if (task.status === "todo") updateTask(task.id, { status: "in_progress" });
  }
  refresh();
}

export async function logTimeAction(_previous: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const task = getTask(Number(form.get("task_id")));
  if (!canSeeTask(user, task)) return { error: "Task not found." };
  const raw = text(form, "duration", 10);
  const match = raw.match(/^(\d{1,2}):(\d{2})$/);
  const minutes = match ? Number(match[1]) * 60 + Number(match[2]) : Math.round(Number(raw) * 60);
  if (!Number.isFinite(minutes) || minutes < 1 || minutes > 16 * 60) return { error: "Enter time as 1.5 (hours) or 1:30." };
  const day = text(form, "day", 10);
  if (isLocked(user.id, DAY.test(day) ? day : localDay())) return { error: "That week's timesheet is already submitted." };
  logTime(task.id, user.id, minutes, text(form, "note", 300), DAY.test(day) ? day : undefined);
  refresh();
  return { ok: "Time logged." };
}

export async function deleteTimeEntryAction(form: FormData): Promise<void> {
  const user = await requireUser();
  const id = Number(form.get("id"));
  const task = getTask(Number(form.get("task_id")));
  const entry = task ? timeEntries(task.id).find((item) => item.id === id) : null;
  if (entry && isLocked(entry.user_id, localDay(new Date(entry.started_at)))) return;
  deleteTimeEntry(id, seesAll(user, "tasks") ? null : user.id);
  refresh();
}

/* -------------------------------- attendance ------------------------------- */

export async function checkInAction(_previous: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  try {
    checkIn(user.id, {
      mode: (MODES as readonly string[]).includes(text(form, "mode", 10)) ? (text(form, "mode", 10) as Mode) : "office",
      ip: await clientIp(),
      location: locationFrom(form),
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not check in." };
  }
  refresh();
  return { ok: "Checked in. Have a good day!" };
}

export async function breakAction(form: FormData): Promise<void> {
  const user = await requireUser();
  try {
    if (text(form, "op", 10) === "end") endBreak(user.id);
    else startBreak(user.id);
  } catch {
    // Not checked in; the page shows the current state.
  }
  refresh();
}

export async function checkOutAction(_previous: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  try {
    stopTimer(user.id);
    checkOut(user.id, { summary: text(form, "summary", 3000), ip: await clientIp(), location: locationFrom(form) });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not check out." };
  }
  refresh();
  return { ok: "Checked out. See you tomorrow!" };
}


export async function leaveRequestAction(_previous: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const type = text(form, "leave_type", 40);
  if (!(LEAVE_TYPES as readonly string[]).includes(type)) return { error: "Choose a leave type." };
  const from = text(form, "from_day", 10);
  const to = text(form, "to_day", 10) || from;
  const halfDay = form.get("half_day") === "1";
  const reason = text(form, "reason", 1000);
  try {
    requestLeave(user.id, { type, from, to: halfDay ? from : to, halfDay, reason });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not send the request." };
  }
  const when = from === to || halfDay ? `${from}${halfDay ? " (half day)" : ""}` : `${from} to ${to}`;
  for (const manager of approversFor(user.id, "attendance.manage")) {
    notify(manager.id, `Leave request: ${user.name}`, [`${user.name} asked for ${type} leave on ${when}.`, reason].filter(Boolean), "/admin/attendance/team", "Review the request");
  }
  refresh();
  return { ok: "Leave request sent for approval." };
}

export async function correctionRequestAction(_previous: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const input = { day: text(form, "day", 10), checkIn: text(form, "check_in", 5), checkOut: text(form, "check_out", 5), reason: text(form, "reason", 1000) };
  try {
    requestCorrection(user.id, input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not send the request." };
  }
  for (const manager of approversFor(user.id, "attendance.manage")) {
    notify(manager.id, `Attendance correction: ${user.name}`, [`${user.name} asked to correct ${input.day} to ${input.checkIn}–${input.checkOut}.`, input.reason], "/admin/attendance/team", "Review the request");
  }
  refresh();
  return { ok: "Correction sent for approval." };
}

export async function cancelRequestAction(form: FormData): Promise<void> {
  const user = await requireUser();
  cancelRequest(Number(form.get("id")), user.id);
  refresh();
}

export async function decideRequestAction(form: FormData): Promise<void> {
  const user = await requireUser();
  const approve = form.get("decision") === "approve";
  const pending = getRequest(Number(form.get("id")));
  if (!pending || !mayApproveFor(user, pending.user_id, "attendance.manage")) return;
  try {
    const request = decideRequest(Number(form.get("id")), approve, user.name, text(form, "note", 500));
    audit(user.name, approve ? "approved request" : "rejected request", "attendance", `${request.user_name}: ${request.kind} ${request.from_day}`);
    const what = request.kind === "leave" ? `${request.leave_type} leave (${request.from_day}${request.to_day !== request.from_day ? ` to ${request.to_day}` : ""})` : `attendance correction for ${request.from_day}`;
    notify(request.user_id, `${approve ? "Approved" : "Not approved"}: ${what}`, [`${user.name} ${approve ? "approved" : "did not approve"} your ${what}.`, request.decision_note].filter(Boolean), "/admin/attendance", "Open attendance");
  } catch {
    // Already handled by someone else.
  }
  refresh();
}

export async function fixAttendanceAction(_previous: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser("attendance.manage");
  const member = getUser(Number(form.get("user_id")));
  const day = text(form, "day", 10);
  if (!member || !DAY.test(day)) return { error: "Choose a person and a date." };
  if (form.get("op") === "delete") {
    deleteAttendance(member.id, day);
    audit(user.name, "removed attendance", "attendance", `${member.name} ${day}`);
    refresh();
    return { ok: `Removed ${member.name}'s record for ${day}.` };
  }
  const inTime = text(form, "check_in", 5);
  const outTime = text(form, "check_out", 5);
  if (!TIME.test(inTime) || (outTime && (!TIME.test(outTime) || outTime <= inTime))) return { error: "Check-out must be after check-in." };
  const breakMinutes = Math.max(0, Math.min(600, Number(text(form, "break_minutes", 4)) || 0));
  setAttendance(member.id, day, toIso(day, inTime), outTime ? toIso(day, outTime) : null, user.name, breakMinutes);
  audit(user.name, "edited attendance", "attendance", `${member.name} ${day} ${inTime}–${outTime || "open"}`);
  refresh();
  return { ok: `Saved ${member.name}'s attendance for ${day}.` };
}

export async function attendanceSettingsAction(_previous: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser("attendance.manage");
  const start = text(form, "start", 5);
  if (!TIME.test(start)) return { error: "Enter the office start time." };
  const num = (key: string, min: number, max: number, fallback: number) => {
    const value = Number(text(form, key, 6));
    return Number.isFinite(value) && value >= min && value <= max ? value : fallback;
  };
  const current = attendanceSettings();
  const lat = Number(text(form, "office_lat", 20));
  const lng = Number(text(form, "office_lng", 20));
  const hasOffice = text(form, "office_lat", 20) !== "" && Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
  const quotas: Record<string, number> = {};
  for (const type of ["Casual", "Sick", "Earned"]) quotas[type] = num(`quota_${type}`, 0, 60, current.quotas[type] ?? 0);
  const halfDayHours = num("half_day_hours", 1, 12, current.halfDayHours);
  const fullDayHours = num("full_day_hours", 1, 16, current.fullDayHours);
  if (halfDayHours >= fullDayHours) return { error: "Half-day hours must be less than full-day hours." };
  saveAttendanceSettings({
    start,
    graceMinutes: num("grace_minutes", 0, 180, current.graceMinutes),
    fullDayHours,
    halfDayHours,
    weeklyOff: form.getAll("weekly_off").map(Number).filter((day) => day >= 0 && day <= 6),
    office: hasOffice ? { lat, lng, radius: num("office_radius", 20, 5000, 200) } : null,
    requireLocation: form.get("require_location") === "1",
    quotas,
  });
  audit(user.name, "updated attendance settings", "attendance", `start ${start}`);
  refresh();
  return { ok: "Attendance settings saved." };
}

export async function holidayAction(form: FormData): Promise<void> {
  const user = await requireUser("attendance.manage");
  const day = text(form, "day", 10);
  if (!DAY.test(day)) return;
  if (form.get("op") === "remove") removeHoliday(day);
  else if (text(form, "name", 80)) addHoliday(day, text(form, "name", 80));
  audit(user.name, "updated holidays", "attendance", day);
  refresh();
}

/* -------------------------------- timesheets ------------------------------- */

function parseHours(raw: string): number | null {
  const value = raw.trim();
  if (!value) return 0;
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  const minutes = match ? Number(match[1]) * 60 + Number(match[2]) : Math.round(Number(value) * 60);
  return Number.isFinite(minutes) && minutes >= 0 && minutes <= 24 * 60 ? minutes : null;
}

/** Saves the weekly grid (cells named cell:<taskId>:<day>), optionally submitting it. */
export async function saveSheetAction(_previous: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const monday = text(form, "week", 10);
  if (!DAY.test(monday) || weekStart(monday) !== monday) return { error: "Choose a week." };
  if (isLocked(user.id, monday)) return { error: "This week is already submitted." };
  const days = weekDays(monday);
  const errors: string[] = [];
  for (const [key, value] of form.entries()) {
    const match = key.match(/^cell:(\d+):(\d{4}-\d{2}-\d{2})$/);
    if (!match || !days.includes(match[2])) continue;
    const minutes = parseHours(String(value));
    if (minutes === null) {
      errors.push(`"${value}" on ${match[2]} is not a valid time (use 1.5 or 1:30).`);
      continue;
    }
    const task = getTask(Number(match[1]));
    if (!canSeeTask(user, task)) continue;
    try {
      setCell(user.id, task.id, match[2], minutes);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Could not save a cell.");
    }
  }
  if (errors.length) {
    refresh();
    return { error: errors.slice(0, 3).join(" ") };
  }
  if (form.get("submit") === "1") {
    try {
      submitSheet(user.id, monday, text(form, "note", 1000));
    } catch (error) {
      refresh();
      return { error: error instanceof Error ? error.message : "Could not submit." };
    }
    for (const approver of approversFor(user.id, "timesheets.approve")) {
      notify(approver.id, `Timesheet submitted: ${user.name}`, [`${user.name} submitted the timesheet for the week of ${monday}.`], `/admin/timesheets/team?week=${monday}`, "Review timesheets");
    }
    refresh();
    return { ok: "Timesheet submitted for approval." };
  }
  refresh();
  return { ok: "Saved." };
}

export async function decideSheetAction(_previous: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const member = getUser(Number(form.get("user_id")));
  const monday = text(form, "week", 10);
  if (!member || !DAY.test(monday)) return { error: "Timesheet not found." };
  if (member.id === user.id && user.role !== "owner") return { error: "Someone else must approve your own timesheet." };
  if (!mayApproveFor(user, member.id, "timesheets.approve")) return { error: "Only their manager or a timesheet approver can do this." };
  const decision = text(form, "decision", 10);
  try {
    if (decision === "reopen") {
      reopenSheet(member.id, monday, user.name);
    } else {
      const approve = decision === "approve";
      decideSheet(member.id, monday, approve, user.name, text(form, "note", 1000));
      notify(
        member.id,
        approve ? `Timesheet approved (week of ${monday})` : `Timesheet sent back (week of ${monday})`,
        [approve ? `${user.name} approved your timesheet.` : `${user.name} sent your timesheet back:`, text(form, "note", 1000)].filter(Boolean),
        `/admin/timesheets?week=${monday}`,
        "Open timesheet",
      );
    }
    audit(user.name, `timesheet ${decision}`, "timesheet", `${member.name} ${monday}`);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not update the timesheet." };
  }
  refresh();
  return { ok: decision === "approve" ? `Approved ${member.name}'s week.` : decision === "reopen" ? "Reopened for changes." : `Sent back to ${member.name}.` };
}

/* ------------------------------ notifications ------------------------------ */

/** Opens a notification: marks it read and goes to its page. */
export async function openNotificationAction(form: FormData): Promise<void> {
  const user = await requireUser();
  const id = Number(form.get("id"));
  markRead(user.id, id);
  const link = text(form, "link", 300);
  // The shell (and its bell) is a shared layout; refresh it along with the move.
  refresh();
  redirect(link.startsWith("/admin") ? link : "/admin/notifications");
}

export async function markAllReadAction(): Promise<void> {
  const user = await requireUser();
  markRead(user.id);
  refresh();
}

/* --------------------------------- people ---------------------------------- */

export async function saveProfileAction(_previous: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const member = getUser(Number(form.get("user_id")));
  if (!member) return { error: "Person not found." };
  const manage = can(user, "users.manage");
  if (!manage && member.id !== user.id) return { error: "Only an owner can change someone else's profile." };
  const date = (key: string) => {
    const value = text(form, key, 10);
    return DAY.test(value) ? value : null;
  };
  const phone = text(form, "phone", 30);
  if (phone && !/^[+\d][\d\s()-]{5,}$/.test(phone)) return { error: "Enter a valid phone number." };
  updateProfile(member.id, {
    // People can update their own phone and birthday; job details are set by an owner.
    designation: manage ? text(form, "designation", 80) : member.designation,
    department: manage ? text(form, "department", 60) : member.department,
    joinedOn: manage ? date("joined_on") : member.joinedOn,
    managerId: manage ? Number(form.get("manager_id")) || null : member.managerId,
    phone,
    birthday: date("birthday"),
  });
  updateAbout(member.id, {
    bio: text(form, "bio", 600),
    skills: text(form, "skills", 400).split(","),
    location: text(form, "location", 80),
    emergencyContact: text(form, "emergency_contact", 120),
  });
  if (manage) {
    updateEmployment(member.id, { employeeCode: text(form, "employee_code", 30), employmentType: text(form, "employment_type", 20) });
  }
  if (manage && member.id !== user.id) audit(user.name, "updated profile", "user", member.name);
  refresh();
  return { ok: "Profile saved." };
}

/** Posts a work update to the author's profile and the team feed. */
export async function postUpdateAction(_previous: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const body = text(form, "body", UPDATE_MAX);
  if (body.length < 3) return { error: "Write a line about what you worked on." };
  postUpdate(user.id, body);
  refresh();
  return { ok: "Update posted." };
}

/** Authors delete their own updates; team managers can delete anyone's. */
export async function deleteUpdateAction(form: FormData): Promise<void> {
  const user = await requireUser();
  deleteUpdate(Number(form.get("id")), can(user, "users.manage") ? null : user.id);
  refresh();
}

/* -------------------------------- projects --------------------------------- */

export async function saveProjectAction(_previous: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  if (!can(user, "tasks.assign") && !seesAll(user, "tasks")) return { error: "Only people who assign tasks can edit projects." };
  const status = text(form, "status", 20) as ProjectStatus;
  const budget = Number(text(form, "budget_hours", 8));
  const date = (key: string) => (DAY.test(text(form, key, 10)) ? text(form, key, 10) : null);
  const previous = text(form, "previous_name", 80) || undefined;
  const name = text(form, "name", 80);
  try {
    saveProject(
      {
        name,
        client: text(form, "client", 120),
        status: PROJECT_STATUSES.includes(status) ? status : "active",
        ownerId: Number(form.get("owner_id")) || null,
        startDate: date("start_date"),
        deadline: date("deadline"),
        budgetHours: Number.isFinite(budget) && budget > 0 ? budget : null,
        description: text(form, "description", 4000),
      },
      previous,
    );
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save the project." };
  }
  audit(user.name, previous ? "updated project" : "created project", "project", name);
  if (!previous || previous !== name) redirect(`/admin/projects/${encodeURIComponent(name)}`);
  refresh();
  return { ok: "Project saved." };
}
