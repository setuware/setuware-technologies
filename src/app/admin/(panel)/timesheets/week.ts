import { addDays } from "@/lib/cms/attendance";
import { weekStart } from "@/lib/cms/timesheets";

/** Monday of the requested week (defaults to this week). */
export function weekParam(value: string | undefined, today: string): string {
  return weekStart(value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : today);
}

export function weekLabel(monday: string): string {
  const format = (day: string) => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${day}T00:00:00Z`));
  return `${format(monday)} – ${format(addDays(monday, 6))} ${monday.slice(0, 4)}`;
}

export const STATUS_STYLE: Record<string, { label: string; style: string }> = {
  draft: { label: "Not submitted", style: "bg-foreground/[0.06] text-muted-foreground" },
  submitted: { label: "Waiting for approval", style: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  approved: { label: "Approved", style: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  rejected: { label: "Sent back", style: "bg-red-500/12 text-red-700 dark:text-red-300" },
};
