import { Trash2 } from "lucide-react";

import { holidayAction } from "@/app/admin/work-actions";
import { attendanceSettings, listHolidays, localDay } from "@/lib/cms/attendance";
import { requireUser } from "@/lib/cms/session";
import { AttendanceSettingsForm } from "@/components/admin/attendance-tools";
import { buttonClass, Card, formatDay, inputClass, PageHeader } from "@/components/admin/ui";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

export default async function AttendanceSettingsPage() {
  await requireUser("attendance.manage");
  const year = localDay().slice(0, 4);
  const holidays = listHolidays().filter((holiday) => holiday.day >= `${year}-01-01`);
  return (
    <>
      <PageHeader title="Attendance settings" description="Office hours, days off, office location, leave allowance and holidays." back={{ href: "/admin/attendance/team", label: "Team attendance" }} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="p-6">
          <AttendanceSettingsForm settings={attendanceSettings()} />
        </Card>
        <Card className="h-fit p-5">
          <h2 className="text-sm font-semibold text-foreground">Holidays</h2>
          <form action={holidayAction} className="mt-3 grid gap-2">
            <input type="hidden" name="op" value="add" />
            <input name="day" type="date" required aria-label="Date" className={inputClass} />
            <input name="name" required maxLength={80} placeholder="e.g. Diwali" aria-label="Holiday name" className={inputClass} />
            <button className={buttonClass.secondary}>Add holiday</button>
          </form>
          {holidays.length ? (
            <ul className="mt-4 flex flex-col divide-y divide-border border-t border-border text-sm">
              {holidays.map((holiday) => (
                <li key={holiday.day} className="flex items-center gap-2 py-2">
                  <span className="flex-1 text-foreground">{holiday.name}</span>
                  <span className="text-xs text-muted-foreground">{formatDay(holiday.day)}</span>
                  <form action={holidayAction}>
                    <input type="hidden" name="op" value="remove" />
                    <input type="hidden" name="day" value={holiday.day} />
                    <button aria-label={`Remove ${holiday.name}`} className="rounded p-1 text-muted-foreground hover:text-red-600">
                      <Trash2 className="size-3.5" aria-hidden />
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-xs text-muted-foreground">No holidays added for {year} yet.</p>
          )}
        </Card>
      </div>
    </>
  );
}
