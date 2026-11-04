import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { checkIn, DEFAULT_ATTENDANCE, requestLeave, decideRequest, saveAttendanceSettings, addDays, localDay } from "@/lib/cms/attendance";
import { createUser, getUser, reportIds, updateProfile } from "@/lib/cms/auth";
import { resetDb } from "@/lib/cms/db";
import { addNotification, listNotifications, markRead, once, unreadCount } from "@/lib/cms/notifications";
import { mayApproveFor } from "@/lib/cms/notify";
import { activeProjectNames, getProject, listProjects, saveProject } from "@/lib/cms/projects";
import { runReminders } from "@/lib/cms/reminders";
import { createTask, getTask, listTasks, MAX_TIMER_MINUTES, runningTimer, startTimer } from "@/lib/cms/tasks";
import { expectedMinutes } from "@/lib/cms/timesheets";

const at = (iso: string) => new Date(iso);
const profile = { designation: "", department: "", phone: "", joinedOn: null, birthday: null, managerId: null };
let lead: number;
let dev: number;
let qa: number;

beforeEach(async () => {
  resetDb();
  lead = (await createUser({ email: "lead@example.com", name: "Lead", role: "tech_lead", password: "LeadPass12345" })).id;
  dev = (await createUser({ email: "dev@example.com", name: "Dev", role: "developer", password: "DevPass123456" })).id;
  qa = (await createUser({ email: "qa@example.com", name: "Qa", role: "qa", password: "QaPass1234567" })).id;
});
afterEach(() => resetDb());

describe("notifications", () => {
  it("counts unread, marks read and sends a reminder only once", () => {
    addNotification(dev, "Task assigned", "Build login", "/admin/tasks/1");
    addNotification(dev, "Review", "", "/admin/tasks/2");
    expect(unreadCount(dev)).toBe(2);
    markRead(dev, listNotifications(dev)[0].id);
    expect(unreadCount(dev)).toBe(1);
    markRead(dev);
    expect(unreadCount(dev)).toBe(0);
    expect(once("test:1")).toBe(true);
    expect(once("test:1")).toBe(false);
  });
});

describe("reporting lines and approvals", () => {
  it("routes approvals to the manager chain and blocks loops and self-approval", () => {
    updateProfile(dev, { ...profile, managerId: qa });
    updateProfile(qa, { ...profile, managerId: lead });
    expect(reportIds(lead).sort()).toEqual([dev, qa].sort());
    // Lead can't report to someone below them.
    updateProfile(lead, { ...profile, managerId: dev });
    expect(getUser(lead)?.managerId).toBeNull();
    const qaUser = getUser(qa)!;
    expect(mayApproveFor(qaUser, dev, "attendance.manage")).toBe(true);
    expect(mayApproveFor(qaUser, lead, "attendance.manage")).toBe(false);
    expect(mayApproveFor(getUser(dev)!, dev, "attendance.manage")).toBe(false);
  });

  it("limits backdated leave and lowers expected hours for approved leave", () => {
    const old = addDays(localDay(), -70);
    expect(() => requestLeave(dev, { type: "Sick", from: old, to: old, halfDay: false, reason: "" })).toThrow(/60 days/);
    saveAttendanceSettings({ ...DEFAULT_ATTENDANCE, weeklyOff: [0, 6] });
    expect(expectedMinutes("2026-11-02", dev)).toBe(5 * 8 * 60);
    const id = requestLeave(dev, { type: "Casual", from: "2026-11-03", to: "2026-11-04", halfDay: false, reason: "" });
    decideRequest(id, true, "Lead");
    expect(expectedMinutes("2026-11-02", dev)).toBe(3 * 8 * 60);
  });
});

describe("projects", () => {
  it("lists projects from tasks and saved details, and renames safely", () => {
    createTask({ title: "Homepage", project: "Acme site", assigneeId: dev, dueDate: "2026-11-01" }, lead);
    createTask({ title: "Logo", project: "acme SITE", assigneeId: qa }, lead);
    expect(listProjects("2026-11-04")).toHaveLength(1);
    expect(getProject("acme site", "2026-11-04")).toMatchObject({ tasks: 2, overdue: 1, client: "" });
    saveProject({ name: "Acme website", client: "Acme", status: "active", ownerId: lead, startDate: null, deadline: "2026-12-01", budgetHours: 80, description: "" }, "Acme site");
    expect(listTasks({ project: "Acme website", oldDone: true })).toHaveLength(2);
    expect(getProject("Acme website", "2026-11-04")).toMatchObject({ client: "Acme", budget_hours: 80 });
    saveProject({ name: "Old", client: "", status: "completed", ownerId: null, startDate: null, deadline: null, budgetHours: null, description: "" });
    expect(activeProjectNames()).toEqual(["Acme website"]);
    expect(() => saveProject({ name: "Old", client: "", status: "active", ownerId: null, startDate: null, deadline: null, budgetHours: null, description: "" }, "Acme website")).toThrow(/already/);
  });
});

describe("reminders and clean-up", () => {
  it("nudges people who haven't checked in, once, and caps runaway timers", () => {
    saveAttendanceSettings({ ...DEFAULT_ATTENDANCE, start: "10:00", weeklyOff: [0] });
    const sent: { id: number; subject: string }[] = [];
    const send = (id: number, subject: string) => sent.push({ id, subject });
    checkIn(lead, { mode: "office" }, at("2026-11-04T04:00:00Z")); // 09:30 IST
    const task = createTask({ title: "Long one", assigneeId: dev }, dev);
    startTimer(task, dev, at("2026-11-03T04:00:00Z")); // left running for a day

    runReminders(send, at("2026-11-04T05:45:00Z")); // 11:15 IST, a Wednesday
    const checkins = sent.filter((item) => item.subject.includes("checked in")).map((item) => item.id);
    expect(checkins.sort()).toEqual([dev, qa].sort());
    expect(runningTimer(dev)).toBeNull();
    expect(getTask(task)?.logged).toBe(MAX_TIMER_MINUTES);

    sent.length = 0;
    runReminders(send, at("2026-11-04T06:00:00Z"));
    expect(sent.filter((item) => item.subject.includes("checked in"))).toHaveLength(0);
  });

  it("reminds about overdue tasks and celebrates birthdays", () => {
    createTask({ title: "Late", assigneeId: qa, dueDate: "2026-11-01" }, lead);
    updateProfile(dev, { ...profile, birthday: "1998-11-04" });
    const sent: { id: number; subject: string }[] = [];
    runReminders((id, subject) => sent.push({ id, subject }), at("2026-11-04T04:30:00Z")); // 10:00 IST
    expect(sent.some((item) => item.id === qa && item.subject.includes("overdue"))).toBe(true);
    const birthday = sent.filter((item) => item.subject.includes("birthday"));
    expect(birthday.map((item) => item.id).sort()).toEqual([lead, qa].sort());
  });
});
