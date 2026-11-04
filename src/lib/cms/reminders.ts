import { can, listUsers } from "./auth";
import { addDays, attendanceSettings, listHolidays, listRequests, localDay, localTime, recordFor, weekday } from "./attendance";
import { getDb } from "./db";
import { once, pruneNotifications, pruneReminderMarks } from "./notifications";
import { stopStaleTimers } from "./tasks";
import { getSheet, sheetRows, weekStart } from "./timesheets";

/**
 * Scheduled nudges. Safe to run every few minutes: each reminder is sent at
 * most once (per person, per day or week). Times are India time.
 */

export type Send = (userId: number, subject: string, lines: string[], path: string, label: string, kind?: string) => void;

const minutesOf = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));

export function runReminders(send: Send, now: Date = new Date()): Record<string, number> {
  const sent: Record<string, number> = { timers: stopStaleTimers(now) };
  const bump = (key: string) => (sent[key] = (sent[key] ?? 0) + 1);
  const today = localDay(now);
  const clock = minutesOf(localTime(now.toISOString()));
  const settings = attendanceSettings();
  const holiday = listHolidays(today.slice(0, 4)).find((item) => item.day === today);
  const workingDay = !settings.weeklyOff.includes(weekday(today)) && !holiday;
  const people = listUsers().filter((member) => member.active);
  const onLeave = new Set(
    listRequests({ status: "approved", from: today, to: today })
      .filter((request) => request.kind === "leave")
      .map((request) => request.user_id),
  );

  // 1. Not checked in an hour after office start.
  if (workingDay && clock >= minutesOf(settings.start) + 60 && clock < 16 * 60) {
    for (const member of people) {
      if (onLeave.has(member.id) || recordFor(member.id, today)) continue;
      if (once(`checkin:${today}:${member.id}`)) {
        send(member.id, "You haven't checked in today", [`Office started at ${settings.start}. Check in when you start, or request leave if you're off.`], "/admin/attendance", "Check in");
        bump("checkin");
      }
    }
  }

  // 2. Still checked in late in the evening.
  if (clock >= 21 * 60) {
    for (const member of people) {
      const record = recordFor(member.id, today);
      if (record && !record.check_out_at && once(`checkout:${today}:${member.id}`)) {
        send(member.id, "You're still checked in", ["Check out so today's hours are right, or ask for a correction tomorrow."], "/admin/attendance", "Check out");
        bump("checkout");
      }
    }
  }

  // 3. Overdue tasks, once a morning.
  if (clock >= 9 * 60 + 30) {
    const overdue = getDb()
      .prepare("SELECT assignee_id AS id, COUNT(*) AS n FROM tasks WHERE status != 'done' AND due_date < ? AND assignee_id IS NOT NULL GROUP BY assignee_id")
      .all(today) as { id: number; n: number }[];
    for (const row of overdue) {
      if (people.some((member) => member.id === row.id) && once(`overdue:${today}:${row.id}`)) {
        send(row.id, `${row.n} overdue ${row.n === 1 ? "task" : "tasks"}`, ["Update the due date or finish them today."], "/admin/tasks?who=mine", "Open my tasks");
        bump("overdue");
      }
    }
  }

  // 4. Timesheets: Friday evening for this week, Monday morning for last week.
  const day = weekday(today);
  const sheetWeek = day === 5 && clock >= 17 * 60 ? weekStart(today) : day === 1 && clock >= 10 * 60 ? addDays(weekStart(today), -7) : null;
  if (sheetWeek) {
    for (const member of people) {
      const status = getSheet(member.id, sheetWeek).status;
      if ((status === "draft" || status === "rejected") && once(`timesheet:${sheetWeek}:${day}:${member.id}`)) {
        const logged = sheetRows(member.id, sheetWeek).reduce((sum, row) => sum + row.total, 0);
        send(
          member.id,
          `Submit your timesheet for the week of ${sheetWeek}`,
          [logged ? `${Math.round(logged / 6) / 10} hours logged so far.` : "No hours logged yet.", "Fill in the grid and submit it for approval."],
          `/admin/timesheets?week=${sheetWeek}`,
          "Open timesheet",
        );
        bump("timesheet");
      }
    }
  }

  // 5. Approvals waiting, once a morning for approvers.
  if (clock >= 10 * 60) {
    const leave = listRequests({ status: "pending" });
    const sheets = getDb().prepare("SELECT user_id FROM timesheets WHERE status = 'submitted'").all() as { user_id: number }[];
    for (const member of people) {
      const mine = (ids: number[]) => ids.filter((id) => id !== member.id && (people.find((person) => person.id === id)?.managerId === member.id)).length;
      const leaveCount = can(member, "attendance.manage") ? leave.filter((request) => request.user_id !== member.id).length : mine(leave.map((request) => request.user_id));
      const sheetCount = can(member, "timesheets.approve") ? sheets.filter((row) => row.user_id !== member.id).length : mine(sheets.map((row) => row.user_id));
      if ((leaveCount || sheetCount) && once(`approvals:${today}:${member.id}`)) {
        const parts = [leaveCount ? `${leaveCount} leave/attendance ${leaveCount === 1 ? "request" : "requests"}` : "", sheetCount ? `${sheetCount} ${sheetCount === 1 ? "timesheet" : "timesheets"}` : ""].filter(Boolean);
        send(member.id, `Waiting for your approval: ${parts.join(" and ")}`, ["Approve or send them back so the team isn't blocked."], leaveCount ? "/admin/attendance/team" : "/admin/timesheets/team", "Review now");
        bump("approvals");
      }
    }
  }

  // 6. Birthdays and work anniversaries, shared with the team in the morning.
  if (clock >= 9 * 60) {
    const monthDay = today.slice(5);
    for (const member of people) {
      const birthday = member.birthday && member.birthday.slice(-5) === monthDay;
      const years = member.joinedOn && member.joinedOn.slice(5) === monthDay ? Number(today.slice(0, 4)) - Number(member.joinedOn.slice(0, 4)) : 0;
      if (!birthday && years < 1) continue;
      if (!once(`celebrate:${today}:${member.id}`)) continue;
      const title = birthday ? `It's ${member.name}'s birthday today` : `${member.name} completes ${years} ${years === 1 ? "year" : "years"} at Setuware today`;
      for (const colleague of people) {
        if (colleague.id !== member.id) send(colleague.id, title, ["Say hello!"], "/admin/people", "Open the team directory", "celebration");
      }
      bump("celebrations");
    }
  }

  pruneNotifications();
  pruneReminderMarks();
  return sent;
}
