import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createUser, deleteUser, getUser, updateAbout, updateEmployment } from "@/lib/cms/auth";
import { resetDb } from "@/lib/cms/db";
import { activityFor, deleteUpdate, listUpdates, monthSummary, postUpdate, upcomingMoments } from "@/lib/cms/people";
import { createTask, logTime, updateTask } from "@/lib/cms/tasks";

let asha: number;
let ravi: number;

beforeEach(async () => {
  resetDb();
  asha = (await createUser({ email: "asha@example.com", name: "Asha", role: "sales_exec", password: "AshaPass12345" })).id;
  ravi = (await createUser({ email: "ravi@example.com", name: "Ravi", role: "hr", password: "RaviPass12345" })).id;
});
afterEach(() => resetDb());

describe("work updates", () => {
  it("lists newest first and filters by person", () => {
    postUpdate(asha, "Sent two proposals", new Date("2026-11-25T10:00:00Z"));
    postUpdate(ravi, "Screened five CVs", new Date("2026-11-25T11:00:00Z"));
    expect(listUpdates().map((update) => update.name)).toEqual(["Ravi", "Asha"]);
    expect(listUpdates({ userId: asha }).map((update) => update.body)).toEqual(["Sent two proposals"]);
  });

  it("rejects empty updates", () => {
    expect(() => postUpdate(asha, "   ")).toThrow();
  });

  it("lets only the author delete unless an admin does it", () => {
    const id = postUpdate(asha, "Draft");
    deleteUpdate(id, ravi);
    expect(listUpdates()).toHaveLength(1);
    deleteUpdate(id, null);
    expect(listUpdates()).toHaveLength(0);
  });

  it("removes a person's updates with their account", () => {
    postUpdate(asha, "Last day");
    deleteUser(asha);
    expect(listUpdates()).toHaveLength(0);
  });
});

describe("profile details", () => {
  it("stores bio, de-duplicated skills and employment details", () => {
    updateAbout(asha, { bio: "Sells websites.", skills: ["CRM", " Cold calls ", "CRM", ""], location: "Remote", emergencyContact: "Meera 98765" });
    updateEmployment(asha, { employeeCode: "SW-001", employmentType: "Intern" });
    const person = getUser(asha)!;
    expect(person.skills).toEqual(["CRM", "Cold calls"]);
    expect([person.bio, person.location, person.emergencyContact, person.employeeCode, person.employmentType]).toEqual(["Sells websites.", "Remote", "Meera 98765", "SW-001", "Intern"]);
    updateEmployment(asha, { employeeCode: "SW-001", employmentType: "Wizard" });
    expect(getUser(asha)!.employmentType).toBe("");
  });
});

describe("activity and month summary", () => {
  it("merges updates, finished tasks and logged time", () => {
    postUpdate(asha, "Kick-off call done");
    const task = createTask({ title: "Proposal", assigneeId: asha }, asha);
    logTime(task, asha, 90, "Wrote scope");
    updateTask(task, { status: "done" });
    const kinds = activityFor(asha).map((item) => item.kind).sort();
    expect(kinds).toEqual(["task", "time", "update"]);
    expect(activityFor(ravi)).toEqual([]);
    const summary = monthSummary(asha, new Date().toISOString().slice(0, 7));
    expect(summary.tasksDone).toBe(1);
    expect(summary.loggedMinutes).toBe(90);
    expect(summary.daysPresent).toBe(0);
  });
});

describe("upcoming moments", () => {
  it("finds birthdays and anniversaries in the window, across the year end", () => {
    const users = [
      { id: 1, name: "A", birthday: "1998-12-05", joinedOn: "2026-08-04" },
      { id: 2, name: "B", birthday: "1995-01-03", joinedOn: "2025-12-20" },
      { id: 3, name: "C", birthday: "1990-06-01", joinedOn: null },
    ];
    expect(upcomingMoments(users, "2026-12-10", 30).map((moment) => [moment.name, moment.kind, moment.day, moment.years])).toEqual([
      ["B", "anniversary", "2026-12-20", 1],
      ["B", "birthday", "2027-01-03", 0],
    ]);
  });
});
