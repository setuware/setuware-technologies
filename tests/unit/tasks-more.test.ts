import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createUser } from "@/lib/cms/auth";
import { resetDb } from "@/lib/cms/db";
import { addTaskItem, createTask, getTask, listTasks, moveTask, nextDue, taskItems, toggleTaskItem, updateTask, workload } from "@/lib/cms/tasks";
import { dueGroup } from "@/components/admin/task-format";

let asha: number;
let ravi: number;
const today = "2026-11-25";

beforeEach(async () => {
  resetDb();
  asha = (await createUser({ email: "asha@example.com", name: "Asha", role: "sales_exec", password: "AshaPass12345" })).id;
  ravi = (await createUser({ email: "ravi@example.com", name: "Ravi", role: "hr", password: "RaviPass12345" })).id;
});
afterEach(() => resetDb());

describe("due filters", () => {
  beforeEach(() => {
    createTask({ title: "Late", assigneeId: asha, dueDate: "2026-11-20" }, asha);
    createTask({ title: "Now", assigneeId: asha, dueDate: today }, asha);
    createTask({ title: "Soon", assigneeId: ravi, dueDate: "2026-11-30" }, asha);
    createTask({ title: "Far", dueDate: "2026-12-20" }, asha);
    createTask({ title: "Someday" }, asha);
    createTask({ title: "Finished late", dueDate: "2026-11-01", status: "done" }, asha);
  });
  const titles = (filter: Parameters<typeof listTasks>[0]) => listTasks({ today, ...filter }).map((task) => task.title).sort();

  it("buckets open tasks by due date", () => {
    expect(titles({ due: "overdue" })).toEqual(["Late"]);
    expect(titles({ due: "today" })).toEqual(["Now"]);
    expect(titles({ due: "week" })).toEqual(["Now", "Soon"]);
    expect(titles({ due: "none" })).toEqual(["Someday"]);
    expect(titles({ unassigned: true })).toEqual(["Far", "Finished late", "Someday"]);
  });

  it("groups tasks for the list view", () => {
    const groups = listTasks({}).map((task) => [task.title, dueGroup(task, today)]);
    expect(Object.fromEntries(groups)).toEqual({ Late: "overdue", Now: "today", Soon: "week", Far: "later", Someday: "none", "Finished late": "done" });
  });
});

describe("workload", () => {
  it("counts each person's open work and the unassigned queue", () => {
    createTask({ title: "A1", assigneeId: asha, dueDate: "2026-11-20", estimateMinutes: 120 }, asha);
    createTask({ title: "A2", assigneeId: asha, status: "review" }, asha);
    createTask({ title: "A3", assigneeId: asha, status: "done" }, asha);
    createTask({ title: "R1", assigneeId: ravi, dueDate: "2026-11-27", estimateMinutes: 60 }, asha);
    createTask({ title: "Nobody" }, asha);
    const rows = workload(today);
    const byName = Object.fromEntries(rows.map((row) => [row.name, row]));
    expect(byName.Asha).toMatchObject({ open: 2, overdue: 1, dueWeek: 0, inReview: 1, remaining: 120, unestimated: 1 });
    expect(byName.Ravi).toMatchObject({ open: 1, overdue: 0, dueWeek: 1, inReview: 0, remaining: 60 });
    expect(rows.find((row) => row.userId === null)).toMatchObject({ open: 1 });
    expect(rows[0].name).toBe("Asha");
  });
});

describe("repeating tasks", () => {
  it("moves the due date on by the repeat interval", () => {
    expect(nextDue("2026-11-25", "daily", today)).toBe("2026-11-26");
    expect(nextDue("2026-11-25", "weekly", today)).toBe("2026-12-02");
    expect(nextDue("2026-11-25", "monthly", today)).toBe("2026-12-25");
    expect(nextDue("2026-12-15", "monthly", "2026-12-01")).toBe("2027-01-15");
    expect(nextDue("2027-01-31", "monthly", "2027-01-01")).toBe("2027-02-28");
    // A late finish skips ahead to the first date that isn't already past.
    expect(nextDue("2026-11-01", "weekly", today)).toBe("2026-11-29");
  });

  it("creates the next copy once, with a fresh checklist", () => {
    const id = createTask({ title: "Weekly report", assigneeId: asha, dueDate: today, repeat: "weekly", priority: "high", estimateMinutes: 30 }, ravi);
    addTaskItem(id, "Collect numbers");
    toggleTaskItem(id, taskItems(id)[0].id);
    moveTask(id, "done");
    const done = getTask(id)!;
    expect(done.next_id).toBeTruthy();
    const next = getTask(done.next_id!)!;
    expect(next).toMatchObject({ title: "Weekly report", status: "todo", assignee_id: asha, priority: "high", due_date: "2026-12-02", repeat: "weekly", estimate_minutes: 30, created_by: ravi });
    expect(taskItems(next.id).map((item) => [item.body, Boolean(item.done)])).toEqual([["Collect numbers", false]]);

    // Reopening and finishing again doesn't make a second copy.
    updateTask(id, { status: "in_progress" });
    updateTask(id, { status: "done" });
    expect(listTasks({ q: "Weekly report" })).toHaveLength(2);
  });

  it("leaves one-off tasks alone", () => {
    const id = createTask({ title: "One-off" }, asha);
    moveTask(id, "done");
    expect(getTask(id)!.next_id).toBeNull();
    expect(listTasks({})).toHaveLength(1);
  });
});
