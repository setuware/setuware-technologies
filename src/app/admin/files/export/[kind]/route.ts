import { can } from "@/lib/cms/auth";
import { currentUser } from "@/lib/cms/session";
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
  const user = await currentUser();
  if (!user || (kind !== "enquiries" && kind !== "applications") || !can(user.role, kind)) {
    return new Response("Not found", { status: 404 });
  }
  const search = new URL(request.url).searchParams;
  const filter = {
    q: search.get("q") || undefined,
    status: search.get("status") || undefined,
  };
  const body =
    kind === "enquiries"
      ? csv(listEnquiries({ ...filter, kind: search.get("kind") || undefined }) as unknown as Record<string, unknown>[], [
          "created_at",
          "reference",
          "source",
          "status",
          "name",
          "email",
          "phone",
          "service",
          "message",
          "internal_notes",
        ])
      : csv(listApplications({ ...filter, job: search.get("job") || undefined }) as unknown as Record<string, unknown>[], [
          "created_at",
          "job_title",
          "status",
          "name",
          "email",
          "phone",
          "links",
          "note",
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
