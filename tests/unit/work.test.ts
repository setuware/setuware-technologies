import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  checkIn,
  checkOut,
  decideRequest,
  endBreak,
  isLate,
  leaveBalance,
  localDay,
  presence,
  recordFor,
  register,
  requestCorrection,
  requestLeave,
  saveAttendanceSettings,
  DEFAULT_ATTENDANCE,
  startBreak,
  todayBoard,
  workedMinutes,
} from "@/lib/cms/attendance";
import { createUser } from "@/lib/cms/auth";
import { resetDb } from "@/lib/cms/db";
import { createTask, getTask, listTasks, logTime, moveTask, runningTimer, startTimer, stopTimer, taskCounts } from "@/lib/cms/tasks";
import { decideSheet, isLocked, setCell, sheetRows, submitSheet, weekStart } from "@/lib/cms/timesheets";

const at = (iso: string) => new Date(iso);
let asha: number;
let ravi: number;

beforeEach(async () => {
  resetDb();
  asha = (await createUser({ email: "asha@example.com", name: "Asha", role: "sales_exec", password: "AshaPass12345" })).id;
  ravi = (await createUser({ email: "ravi@example.com", name: "Ravi", role: "hr", password: "RaviPass12345" })).id;
});
afterEach(() => resetDb());

describe("attendance", () => {
  it("tracks a day with a break in India time", () => {
    // 09:50 IST check-in, 13:00–13:45 break, 18:30 out.
    checkIn(asha, { mode: "office" }, at("2026-11-04T04:20:00Z"));
    expect(presence(asha, at("2026-11-04T05:00:00Z")).state).toBe("in");
    startBreak(asha, at("2026-11-04T07:30:00Z"));
    expect(presence(asha, at("2026-11-04T07:40:00Z")).state).toBe("break");
    endBreak(asha, at("2026-11-04T08:15:00Z"));
    const record = checkOut(asha, { summary: "Called 5 leads" }, at("2026-11-04T13:00:00Z"));
    expect(record.day).toBe("2026-11-04");
    expect(record.break_minutes).toBe(45);
    expect(workedMinutes(record)).toBe(8 * 60 + 40 - 45);
    expect(isLate(record)).toBe(false);
    expect(() => checkOut(asha, {}, at("2026-11-04T13:05:00Z"))).toThrow(/not checked in/);
  });

  it("uses the India date near midnight and flags late check-ins", () => {
    // 00:30 IST on 5 Nov is still 4 Nov in UTC.
    expect(localDay(at("2026-11-04T19:00:00Z"))).toBe("2026-11-05");
    const record = checkIn(ravi, { mode: "remote" }, at("2026-11-05T05:00:00Z")); // 10:30 IST
    expect(isLate(record)).toBe(true);
    expect(() => checkIn(ravi, { mode: "remote" }, at("2026-11-05T05:01:00Z"))).toThrow(/already/);
  });

  it("resumes the day after checking out, counting the gap as a break", () => {
    checkIn(asha, { mode: "office" }, at("2026-11-04T04:30:00Z"));
    checkOut(asha, {}, at("2026-11-04T08:00:00Z"));
    checkIn(asha, { mode: "office" }, at("2026-11-04T09:00:00Z"));
    expect(recordFor(asha, "2026-11-04")).toMatchObject({ check_out_at: null, break_minutes: 60 });
  });

  it("builds the month register with present, absent, off and missed check-out", () => {
    saveAttendanceSettings({ ...DEFAULT_ATTENDANCE, weeklyOff: [0] });
    checkIn(asha, { mode: "office" }, at("2026-11-02T04:30:00Z")); // Mon 10:00
    checkOut(asha, {}, at("2026-11-02T13:00:00Z")); // 8h30
    checkIn(asha, { mode: "office" }, at("2026-11-03T04:30:00Z")); // Tue, forgot to check out
    const [row] = register("2026-11", [{ id: asha, name: "Asha" }], at("2026-11-05T06:00:00Z"));
    const code = (day: string) => row.cells.find((cell) => cell.day === day)?.code;
    expect(code("2026-11-01")).toBe("WO"); // Sunday
    expect(code("2026-11-02")).toBe("P");
    expect(code("2026-11-03")).toBe("MC");
    expect(code("2026-11-04")).toBe("A");
    expect(code("2026-11-06")).toBe(""); // future
  });

  it("approves leave, counts the balance and shows it on the board", () => {
    const id = requestLeave(asha, { type: "Casual", from: "2026-11-09", to: "2026-11-11", halfDay: false, reason: "Family" });
    expect(() => requestLeave(asha, { type: "Sick", from: "2026-11-10", to: "2026-11-10", halfDay: false, reason: "" })).toThrow(/already/);
    decideRequest(id, true, "Ravi");
    expect(() => decideRequest(id, false, "Ravi")).toThrow(/already/);
    const casual = leaveBalance(asha, "2026").find((item) => item.type === "Casual");
    expect(casual).toMatchObject({ used: 3, left: 9 });
    const board = todayBoard([{ id: asha, name: "Asha" }], at("2026-11-10T06:00:00Z"));
    expect(board[0]).toMatchObject({ state: "leave", leave: "Casual" });
  });

  it("applies an approved correction to the day", () => {
    const id = requestCorrection(asha, { day: "2026-11-03", checkIn: "09:45", checkOut: "18:15", reason: "Forgot" }, "2026-11-05");
    decideRequest(id, true, "Ravi");
    const record = recordFor(asha, "2026-11-03");
    expect(record?.edited_by).toBe("Ravi");
    expect(record && workedMinutes(record)).toBe(8 * 60 + 30);
  });
});

describe("tasks", () => {
  it("shows people only their own tasks and moves them on the board", () => {
    const mine = createTask({ title: "Call Acme", assigneeId: asha, dueDate: "2026-11-01", priority: "high" }, ravi);
    createTask({ title: "Ravi's own", assigneeId: ravi }, ravi);
    expect(listTasks({ visibleTo: asha }).map((task) => task.title)).toEqual(["Call Acme"]);
    expect(taskCounts(asha, "2026-11-04")).toEqual({ open: 1, dueToday: 0, overdue: 1, toReview: 0 });
    moveTask(mine, "done", null);
    expect(getTask(mine)).toMatchObject({ status: "done" });
    expect(getTask(mine)?.completed_at).toBeTruthy();
    expect(taskCounts(asha, "2026-11-04").open).toBe(0);
  });

  it("runs one timer at a time and adds up logged time", () => {
    const a = createTask({ title: "Design", assigneeId: asha, estimateMinutes: 120 }, asha);
    const b = createTask({ title: "Build", assigneeId: asha }, asha);
    startTimer(a, asha, at("2026-11-04T05:00:00Z"));
    startTimer(b, asha, at("2026-11-04T05:30:00Z")); // stops the first after 30 min
    expect(runningTimer(asha)?.task_id).toBe(b);
    stopTimer(asha, at("2026-11-04T06:00:00Z"));
    logTime(a, asha, 45, "Wireframes");
    expect(getTask(a)?.logged).toBe(75);
    expect(getTask(b)?.logged).toBe(30);
    expect(runningTimer(asha)).toBeNull();
  });
});

describe("reviews, timesheets and location", () => {
  it("records check-in and check-out locations and can require them", () => {
    saveAttendanceSettings({ ...DEFAULT_ATTENDANCE, office: { lat: 28.4595, lng: 77.0266, radius: 200 } });
    const record = checkIn(asha, { mode: "office", location: { lat: 28.4596, lng: 77.0267, accuracy: 12 } }, at("2026-11-04T04:30:00Z"));
    expect(record).toMatchObject({ in_accuracy: 12 });
    expect(record.in_distance).toBeLessThan(50);
    const out = checkOut(asha, { location: { lat: 28.6139, lng: 77.209 } }, at("2026-11-04T13:00:00Z"));
    expect(out.out_distance).toBeGreaterThan(20_000);
    saveAttendanceSettings({ ...DEFAULT_ATTENDANCE, requireLocation: true });
    expect(() => checkIn(ravi, { mode: "office" }, at("2026-11-04T04:30:00Z"))).toThrow(/location/i);
  });

  it("fills, submits, locks and approves a weekly timesheet", () => {
    const task = createTask({ title: "API", assigneeId: asha }, ravi);
    logTime(task, asha, 60, "", "2026-11-03");
    setCell(asha, task, "2026-11-03", 150); // 1h logged + 1h30 from the grid
    setCell(asha, task, "2026-11-04", 90);
    expect(() => setCell(asha, task, "2026-11-03", 30)).toThrow(/Timers already recorded/);
    const [row] = sheetRows(asha, "2026-11-02");
    expect(row.days.slice(0, 3)).toEqual([0, 150, 90]);
    expect(row.total).toBe(240);
    submitSheet(asha, "2026-11-02", "");
    expect(isLocked(asha, "2026-11-05")).toBe(true);
    expect(() => setCell(asha, task, "2026-11-05", 60)).toThrow(/submitted/);
    expect(() => decideSheet(asha, "2026-11-02", false, "Ravi", "")).toThrow(/needs changing/);
    decideSheet(asha, "2026-11-02", false, "Ravi", "Split API work by endpoint");
    expect(isLocked(asha, "2026-11-05")).toBe(false);
    submitSheet(asha, "2026-11-02", "Split now");
    expect(decideSheet(asha, "2026-11-02", true, "Ravi", "").status).toBe("approved");
    expect(weekStart("2026-11-08")).toBe("2026-11-02"); // Sunday belongs to the week starting Monday
  });

  it("lets reviewers see the tasks they review", () => {
    const id = createTask({ title: "Checkout page", assigneeId: asha, reviewerId: ravi }, asha);
    expect(listTasks({ visibleTo: ravi }).map((task) => task.id)).toContain(id);
    moveTask(id, "review", null);
    expect(taskCounts(ravi, "2026-11-04").toReview).toBe(1);
  });
});
