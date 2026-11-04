/** Zoho Lead Status as a coloured pill. */
const STATUS_TONE: Record<string, string> = {
  "Not Contacted": "bg-blue-500/12 text-blue-700 dark:text-blue-300",
  "Attempted to Contact": "bg-amber-500/12 text-amber-700 dark:text-amber-300",
  Contacted: "bg-cyan-500/12 text-cyan-700 dark:text-cyan-300",
  "Contact in Future": "bg-violet-500/12 text-violet-700 dark:text-violet-300",
  "Pre-Qualified": "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400",
  "Not Qualified": "bg-slate-500/12 text-slate-600 dark:text-slate-300",
  "Junk Lead": "bg-red-500/10 text-red-700 dark:text-red-400",
  "Lost Lead": "bg-red-500/10 text-red-700 dark:text-red-400",
};

export function LeadStatus({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_TONE[status] ?? "bg-slate-500/12 text-slate-600 dark:text-slate-300"}`}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {status || "No status"}
    </span>
  );
}
