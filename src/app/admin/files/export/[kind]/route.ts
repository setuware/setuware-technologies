import { can, listUsers, seesAll } from "@/lib/cms/auth";
import { localDay, localTime, register } from "@/lib/cms/attendance";
import { getSheet, sheetRows, weekDays, weekStart } from "@/lib/cms/timesheets";
import { teamScope } from "@/lib/cms/notify";
import { currentVerifiedUser } from "@/lib/cms/session";
import { listSubscribers } from "@/lib/cms/crm";
import { listApplications, listEnquiries } from "@/lib/cms/store";

/** Quotes a CSV cell and defuses spreadsheet formulas (=, +, -, @). */
function cell(value: unknown): string {
  let text = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

function csv(rows: Record<string, unknown>[], columns: string[]): string {
  return [columns.map(cell).join(","), ...rows.map((row) => columns.map((column) => cell(row[column])).join(","))].join("\r\n");
}

export async function GET(request: Request, { params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  const user = await currentVerifiedUser();
  const search = new URL(request.url).searchParams;
  const attendanceScope = user ? teamScope(user, "attendance") : null;
  if (user && attendanceScope && kind === "attendance" && (attendanceScope.all || attendanceScope.ids.length)) {
    const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(search.get("month") ?? "") ? (search.get("month") as string) : localDay().slice(0, 7);
    const role = search.get("role");
    const rows = register(
      month,
      listUsers().filter((member) => member.active && (!role || member.role === role) && (attendanceScope.all || attendanceScope.ids.includes(member.id))),
    ).flatMap((row) =>
      row.cells.map((cell) => ({
        name: row.name,
        date: cell.day,
        code: cell.code,
        check_in: cell.record ? localTime(cell.record.check_in_at) : "",
        check_out: cell.record?.check_out_at ? localTime(cell.record.check_out_at) : "",
        break_minutes: cell.record?.break_minutes ?? "",
        worked_hours: cell.minutes ? (cell.minutes / 60).toFixed(2) : "",
        late: cell.late ? "yes" : "",
        mode: cell.record?.mode ?? "",
        leave: cell.leave ?? "",
        holiday: cell.holiday ?? "",
        summary: cell.record?.summary ?? "",
        edited_by: cell.record?.edited_by ?? "",
      })),
    );
    const body = csv(rows, ["name", "date", "code", "check_in", "check_out", "break_minutes", "worked_hours", "late", "mode", "leave", "holiday", "summary", "edited_by"]);
    return new Response(`\ufeff${body}`, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="setuware-attendance-${month}.csv"`,
        "cache-control": "private, no-store",
      },
    });
  }
  const sheetScope = user ? teamScope(user, "timesheets") : null;
  if (user && sheetScope && kind === "timesheets" && (sheetScope.all || sheetScope.ids.length)) {
    const monday = weekStart(/^\d{4}-\d{2}-\d{2}$/.test(search.get("week") ?? "") ? (search.get("week") as string) : localDay());
    const days = weekDays(monday);
    const rows = listUsers()
      .filter((member) => member.active && (sheetScope.all || sheetScope.ids.includes(member.id)))
      .flatMap((member) => {
        const status = getSheet(member.id, monday).status;
        return sheetRows(member.id, monday).map((row) => ({
          name: member.name,
          week: monday,
          status,
          task: row.title,
          project: row.project,
          ...Object.fromEntries(days.map((day, i) => [day, row.days[i] ? (row.days[i] / 60).toFixed(2) : ""])),
          total_hours: (row.total / 60).toFixed(2),
        }));
      });
    const body = csv(rows, ["name", "week", "status", "task", "project", ...days, "total_hours"]);
    return new Response(`\ufeff${body}`, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="setuware-timesheets-${monday}.csv"`,
        "cache-control": "private, no-store",
      },
    });
  }
  if (!user || !["enquiries", "applications", "subscribers"].includes(kind) || !can(user, `${kind}.export`)) {
    return new Response("Not found", { status: 404 });
  }
  const filter = {
    q: search.get("q") || undefined,
    status: search.get("status") || undefined,
  };
  const body =
    kind === "subscribers"
      ? csv(listSubscribers() as unknown as Record<string, unknown>[], ["email", "source", "created_at"])
      : kind === "enquiries"
      ? csv(listEnquiries({ ...filter, kind: search.get("kind") || undefined, assignee: seesAll(user, "enquiries") ? undefined : user.name }) as unknown as Record<string, unknown>[], [
          "created_at",
          "reference",
          "source",
          "status",
          "name",
          "email",
          "phone",
          "service",
          "message",
          "assignee",
          "follow_up_at",
          "internal_notes",
        ])
      : csv(listApplications({ ...filter, job: search.get("job") || undefined, assignee: seesAll(user, "applications") ? undefined : user.name }) as unknown as Record<string, unknown>[], [
          "created_at",
          "job_title",
          "status",
          "name",
          "email",
          "phone",
          "links",
          "note",
          "rating",
          "interview_at",
          "assignee",
          "internal_notes",
        ]);
  const date = new Date().toISOString().slice(0, 10);
  return new Response(`﻿${body}`, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="setuware-${kind}-${date}.csv"`,
      "cache-control": "private, no-store",
    },
  });
}
