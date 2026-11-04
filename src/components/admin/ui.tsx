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
          <Link
            href={back.href}
            className="mb-3 inline-flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            ← {back.label}
          </Link>
        ) : null}
        <h1 className="font-display text-[1.7rem] font-semibold tracking-[-0.02em] text-foreground">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/80 bg-surface shadow-[0_1px_2px_rgb(15_23_42/0.04),0_8px_24px_-12px_rgb(15_23_42/0.10)]",
        className,
      )}
    >
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
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ring-1 ring-inset ring-current/10",
        TONES[status] ?? "bg-slate-500/12 text-slate-600",
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

const AVATAR_GRADIENTS = [
  "from-[#2f56d8] to-[#0a8ea6]",
  "from-[#7c3aed] to-[#2f56d8]",
  "from-[#0ea5e9] to-[#14b8a6]",
  "from-[#f97316] to-[#e11d48]",
  "from-[#059669] to-[#0ea5e9]",
  "from-[#db2777] to-[#7c3aed]",
];

/** Initials on a gradient chosen from the name, so a person keeps one colour. */
export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials =
    name
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?";
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25)]",
        AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length],
        size === "sm" ? "size-7 text-[10px]" : size === "lg" ? "size-12 text-base" : "size-9 text-xs",
      )}
    >
      {initials}
    </span>
  );
}

/** "just now", "5m ago", "3h ago", "2d ago", then the date. */
export function timeAgo(iso: string, now = Date.now()): string {
  const seconds = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDay(iso);
}

const STAT_TONES = {
  blue: { tile: "from-[#2f56d8] to-[#4f7cff]", glow: "bg-[#2f56d8]/10" },
  teal: { tile: "from-[#0a8ea6] to-[#22c3e6]", glow: "bg-[#0a8ea6]/10" },
  violet: { tile: "from-[#7c3aed] to-[#a78bfa]", glow: "bg-[#7c3aed]/10" },
  amber: { tile: "from-[#f59e0b] to-[#fb923c]", glow: "bg-[#f59e0b]/10" },
} as const;

export function Stat({
  label,
  value,
  hint,
  href,
  icon,
  tone = "blue",
}: {
  label: string;
  value: number | string;
  hint?: string;
  href?: string;
  icon?: React.ReactNode;
  tone?: keyof typeof STAT_TONES;
}) {
  const t = STAT_TONES[tone];
  const body = (
    <Card className="group relative h-full overflow-hidden p-5 transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-[0_18px_40px_-20px_rgb(15_23_42/0.35)]">
      <span aria-hidden className={cn("pointer-events-none absolute -right-8 -top-8 size-28 rounded-full blur-2xl", t.glow)} />
      <div className="relative flex items-start justify-between gap-3">
        <p className="text-[0.8rem] font-medium text-muted-foreground">{label}</p>
        {icon ? (
          <span className={cn("inline-flex size-9 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-[0_8px_16px_-8px_rgb(15_23_42/0.5)]", t.tile)}>
            {icon}
          </span>
        ) : null}
      </div>
      <p className="relative mt-3 font-display text-[2.1rem] font-semibold leading-none tabular-nums tracking-tight text-foreground">{value}</p>
      {hint ? <p className="relative mt-2 text-xs text-muted-foreground">{hint}</p> : null}
    </Card>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export function Empty({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="px-6 py-14 text-center">
      <span aria-hidden className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2f56d8]/12 to-[#0a8ea6]/12 text-xl">
        ✦
      </span>
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

/** Table header row styling shared by admin lists. */
export const theadClass =
  "border-b border-border bg-foreground/[0.025] text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground";
