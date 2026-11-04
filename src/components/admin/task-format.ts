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
