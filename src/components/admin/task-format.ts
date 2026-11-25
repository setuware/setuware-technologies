/** Task display helpers, usable from server and client components. */

export const PRIORITY_STYLE: Record<string, string> = {
  urgent: "bg-red-500/12 text-red-700 dark:text-red-300",
  high: "bg-amber-500/14 text-amber-700 dark:text-amber-300",
  normal: "bg-[#2f56d8]/10 text-[#2f56d8] dark:text-[#8fb0ff]",
  low: "bg-slate-500/12 text-slate-600 dark:text-slate-300",
};

export function hours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h${m ? ` ${m}m` : ""}` : `${m}m`;
}

export const DUE_GROUPS = [
  ["overdue", "Overdue"],
  ["today", "Due today"],
  ["week", "Next 7 days"],
  ["later", "Later"],
  ["none", "No due date"],
  ["done", "Done"],
] as const;
export type DueGroup = (typeof DUE_GROUPS)[number][0];

/** Which due-date bucket a task falls in, for the grouped list. */
export function dueGroup(task: { status: string; due_date: string | null }, today: string): DueGroup {
  if (task.status === "done") return "done";
  if (!task.due_date) return "none";
  if (task.due_date < today) return "overdue";
  if (task.due_date === today) return "today";
  const week = new Date(`${today}T12:00:00Z`);
  week.setUTCDate(week.getUTCDate() + 6);
  return task.due_date <= week.toISOString().slice(0, 10) ? "week" : "later";
}
