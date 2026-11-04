"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { after } from "next/server";

import { audit, can, getUser, listUsers, seesAll, type AdminUser } from "@/lib/cms/auth";
import {
  addHoliday,
  attendanceSettings,
  cancelRequest,
  checkIn,
  checkOut,
  decideRequest,
  deleteAttendance,
  endBreak,
  LEAVE_TYPES,
  MODES,
  removeHoliday,
  requestCorrection,
  requestLeave,
  saveAttendanceSettings,
  setAttendance,
  startBreak,
  toIso,
  type Mode,
} from "@/lib/cms/attendance";
import { addNote } from "@/lib/cms/crm";
import { sendAccountEmail } from "@/lib/cms/mailer";
import { requireUser } from "@/lib/cms/session";
import {
  addTaskItem,
  createTask,
  deleteTask,
  deleteTaskItem,
  deleteTimeEntry,
  getTask,
  logTime,
  moveTask,
  PRIORITIES,
  startTimer,
  STATUS_LABELS,
  stopTimer,
  TASK_STATUSES,
  toggleTaskItem,
  updateTask,
  type LinkedEntity,
  type Priority,
  type Task,
  type TaskStatus,
} from "@/lib/cms/tasks";
import { site } from "@/lib/site";

import type { FormState } from "./actions";

const text = (form: FormData, key: string, max = 2000) => String(form.get(key) ?? "").trim().slice(0, max);
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}$/;

async function clientIp(): Promise<string | undefined> {
  const h = await headers();
  return (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || undefined;
}

/** E-mails a team member after the response is sent (no-op without SMTP). */
function notify(userId: number | null | undefined, subject: string, lines: string[], path: string, label: string): void {
  if (!userId) return;
  after(async () => {
    const person = getUser(userId);
    if (person?.active) await sendAccountEmail(person.email, subject, lines, { url: `${site.url}${path}`, label });
  });
}

/* ---------------------------------- tasks ---------------------------------- */

function canSeeTask(user: AdminUser, task: Task | null): task is Task {
  return Boolean(task) && (seesAll(user, "tasks") || task?.assignee_id === user.id || task?.created_by === user.id);
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
  const status = text(form, "status", 20) as TaskStatus;
  const id = createTask(
    {
      title,
      description: text(form, "description", 10_000),
      status: TASK_STATUSES.includes(status) ? status : "todo",
      priority: (PRIORITIES as readonly string[]).includes(text(form, "priority", 10)) ? (text(form, "priority", 10) as Priority) : "normal",
      assigneeId,
      dueDate: dueDate || null,
      project: text(form, "project", 80),
      entity: linked,
      entityId: linked ? Number(form.get("entity_id")) || null : null,
      estimateMinutes: estimateFrom(form),
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
  const status = (form.has("status") ? text(form, "status", 20) : task.status) as TaskStatus;
  const priority = (form.has("priority") ? text(form, "priority", 10) : task.priority) as Priority;
  const assigneeId = assigneeFrom(user, form, task.assignee_id);

  if (status !== task.status && TASK_STATUSES.includes(status)) changes.push(`Moved from ${STATUS_LABELS[task.status]} to ${STATUS_LABELS[status]}`);
  if (priority !== task.priority && PRIORITIES.includes(priority)) changes.push(`Priority set to ${priority}`);
  if ((dueDate || null) !== task.due_date) changes.push(dueDate ? `Due date set to ${dueDate}` : "Due date removed");
  updateTask(id, {
    title,
    description: form.has("description") ? text(form, "description", 10_000) : task.description,
    status,
    priority,
    assigneeId,
    dueDate: dueDate || null,
    project: form.has("project") ? text(form, "project", 80) : task.project,
    estimateMinutes: form.has("estimate_hours") ? estimateFrom(form) : task.estimate_minutes,
  });
  for (const change of changes) addNote("task", id, "status", user.name, change);
  if (assigneeId !== task.assignee_id) {
    const name = assigneeId ? getUser(assigneeId)?.name : null;
    addNote("task", id, "assign", user.name, name ? `Assigned to ${name}` : "Unassigned");
    if (assigneeId && assigneeId !== user.id) notify(assigneeId, `Task assigned to you: ${title}`, [`${user.name} assigned you: ${title}.`], `/admin/tasks/${id}`, "Open the task");
  }
  if (status === "done" && task.status !== "done" && task.created_by !== user.id) {
    notify(task.created_by, `Done: ${title}`, [`${user.name} marked "${title}" as done.`], `/admin/tasks/${id}`, "Open the task");
  }
  refresh();
  return { ok: "Saved." };
}

/** Drag and drop on the board. */
export async function moveTaskAction(id: number, status: string, beforeId: number | null): Promise<{ error?: string }> {
  const user = await requireUser();
  const task = getTask(id);
  if (!canSeeTask(user, task) || !TASK_STATUSES.includes(status as TaskStatus)) return { error: "Task not found." };
  moveTask(id, status as TaskStatus, beforeId);
  if (status !== task.status) {
    addNote("task", id, "status", user.name, `Moved from ${STATUS_LABELS[task.status]} to ${STATUS_LABELS[status as TaskStatus]}`);
    if (status === "done" && task.created_by !== user.id) {
      notify(task.created_by, `Done: ${task.title}`, [`${user.name} marked "${task.title}" as done.`], `/admin/tasks/${id}`, "Open the task");
    }
  }
  refresh();
  return {};
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
    if (!canSeeTask(user, task)) return;
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
  logTime(task.id, user.id, minutes, text(form, "note", 300), DAY.test(day) ? day : undefined);
  refresh();
  return { ok: "Time logged." };
}

export async function deleteTimeEntryAction(form: FormData): Promise<void> {
  const user = await requireUser();
  deleteTimeEntry(Number(form.get("id")), seesAll(user, "tasks") ? null : user.id);
  refresh();
}

/* -------------------------------- attendance ------------------------------- */

export async function checkInAction(_previous: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const lat = Number(form.get("lat"));
  const lng = Number(form.get("lng"));
  const located = form.get("lat") !== null && form.get("lat") !== "" && Number.isFinite(lat) && Number.isFinite(lng);
  try {
    checkIn(user.id, {
      mode: (MODES as readonly string[]).includes(text(form, "mode", 10)) ? (text(form, "mode", 10) as Mode) : "office",
      ip: await clientIp(),
      lat: located ? lat : null,
      lng: located ? lng : null,
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
    checkOut(user.id, { summary: text(form, "summary", 3000), ip: await clientIp() });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not check out." };
  }
  refresh();
  return { ok: "Checked out. See you tomorrow!" };
}

function managers(except: number): AdminUser[] {
  return listUsers().filter((member) => member.active && member.id !== except && can(member, "attendance.manage"));
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
  for (const manager of managers(user.id)) {
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
  for (const manager of managers(user.id)) {
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
  const user = await requireUser("attendance.manage");
  const approve = form.get("decision") === "approve";
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
