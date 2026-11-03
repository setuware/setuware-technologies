import Link from "next/link";

import { cn } from "@/lib/utils";

/** Shared building blocks for admin pages (server-safe). */

export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {back ? (
          <Link href={back.href} className="mb-2 inline-block text-xs font-medium text-muted-foreground hover:text-foreground">
            ← {back.label}
          </Link>
        ) : null}
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-surface shadow-[0_1px_2px_rgb(15_23_42/0.04)]", className)}>
      {children}
    </div>
  );
}

const TONES: Record<string, string> = {
  published: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400",
  open: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400",
  hired: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400",
  won: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400",
  draft: "bg-slate-500/12 text-slate-600 dark:text-slate-300",
  closed: "bg-slate-500/12 text-slate-600 dark:text-slate-300",
  new: "bg-blue-500/12 text-blue-700 dark:text-blue-300",
  scheduled: "bg-violet-500/12 text-violet-700 dark:text-violet-300",
  reviewing: "bg-amber-500/12 text-amber-700 dark:text-amber-300",
  contacted: "bg-amber-500/12 text-amber-700 dark:text-amber-300",
  shortlisted: "bg-cyan-500/12 text-cyan-700 dark:text-cyan-300",
  qualified: "bg-cyan-500/12 text-cyan-700 dark:text-cyan-300",
  interview: "bg-indigo-500/12 text-indigo-700 dark:text-indigo-300",
  proposal: "bg-indigo-500/12 text-indigo-700 dark:text-indigo-300",
  offer: "bg-teal-500/12 text-teal-700 dark:text-teal-300",
  rejected: "bg-red-500/10 text-red-700 dark:text-red-400",
  lost: "bg-red-500/10 text-red-700 dark:text-red-400",
  spam: "bg-red-500/10 text-red-700 dark:text-red-400",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize",
        TONES[status] ?? "bg-slate-500/12 text-slate-600",
      )}
    >
      {status}
    </span>
  );
}

export function Stat({ label, value, hint, href }: { label: string; value: number | string; hint?: string; href?: string }) {
  const body = (
    <Card className="h-full p-5 transition-colors hover:border-foreground/20">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold tabular-nums text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </Card>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export function Empty({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="px-6 py-14 text-center">
      <p className="font-medium text-foreground">{title}</p>
      {children ? <div className="mt-2 text-sm text-muted-foreground">{children}</div> : null}
    </div>
  );
}

export const buttonClass = {
  primary:
    "inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[linear-gradient(100deg,#2f56d8,#1477c0_55%,#0a8ea6)] px-5 text-sm font-semibold text-white transition-[filter] hover:brightness-110 disabled:opacity-60",
  secondary:
    "inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border bg-surface px-5 text-sm font-semibold text-foreground transition-colors hover:border-foreground/30 disabled:opacity-60",
  danger:
    "inline-flex h-10 items-center justify-center gap-2 rounded-full border border-red-500/30 px-5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-500/8 dark:text-red-400",
} as const;

export const inputClass =
  "w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-setu focus:ring-2 focus:ring-setu/20";

export function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(new Date(iso));
}

export function formatDay(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(
    new Date(iso.length === 10 ? `${iso}T00:00:00+05:30` : iso),
  );
}
