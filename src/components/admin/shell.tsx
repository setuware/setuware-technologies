"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  CalendarCheck,
  Contact,
  FolderKanban,
  ClipboardCheck,
  Sheet,
  Clock3,
  Download,
  ListChecks,
  Timer,
  ShieldCheck,
  Target,
  CalendarDays,
  Image as ImageIcon,
  Mail,
  MailPlus,
  Search,
  Settings,
  Briefcase,
  ExternalLink,
  FileText,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  UserCircle,
  Users,
  UsersRound,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/layout/logo";
import { logoutAction } from "@/app/admin/actions";

import { Elapsed } from "./live-clock";

export interface ShellPresence {
  state: "out" | "in" | "break" | "done";
  since: string | null;
  breakMinutes: number;
  breakSince: string | null;
  timer: { taskId: number; title: string; startedAt: string } | null;
}

const NAV = [
  { group: "Overview", href: "/admin", label: "Dashboard", Icon: LayoutDashboard, area: null },
  { group: "Overview", href: "/admin/search", label: "Search", Icon: Search, area: null },
  { group: "Overview", href: "/admin/analytics", label: "Analytics", Icon: BarChart3, area: "analytics" },
  { group: "Work", href: "/admin/tasks", label: "Tasks", Icon: ListChecks, area: null },
  { group: "Work", href: "/admin/projects", label: "Projects", Icon: FolderKanban, area: null },
  { group: "Work", href: "/admin/timesheets", label: "My timesheet", Icon: Sheet, area: null },
  { group: "Work", href: "/admin/attendance", label: "My attendance", Icon: Clock3, area: null },
  { group: "Work", href: "/admin/timesheets/team", label: "Team timesheets", Icon: ClipboardCheck, area: "timesheets" },
  { group: "Work", href: "/admin/attendance/team", label: "Team attendance", Icon: CalendarCheck, area: "attendance" },
  { group: "Sales", href: "/admin/leads", label: "CRM leads", Icon: Target, area: "leads" },
  { group: "Sales", href: "/admin/enquiries", label: "Enquiries", Icon: Inbox, area: "enquiries" },
  { group: "Sales", href: "/admin/bookings", label: "Bookings", Icon: CalendarDays, area: "bookings" },
  { group: "Sales", href: "/admin/subscribers", label: "Subscribers", Icon: Mail, area: "subscribers" },
  { group: "Content", href: "/admin/posts", label: "Blog posts", Icon: FileText, area: "posts" },
  { group: "Content", href: "/admin/jobs", label: "Jobs", Icon: Briefcase, area: "jobs" },
  { group: "Content", href: "/admin/media", label: "Media", Icon: ImageIcon, area: "media" },
  { group: "People", href: "/admin/people", label: "Team directory", Icon: Contact, area: null },
  { group: "People", href: "/admin/applications", label: "Applications", Icon: UsersRound, area: "applications" },
  { group: "People", href: "/admin/users", label: "Team", Icon: Users, area: "users" },
  { group: "People", href: "/admin/roles", label: "Roles & access", Icon: ShieldCheck, area: "roles.manage" },
  { group: "Settings", href: "/admin/templates", label: "Email templates", Icon: MailPlus, area: "templates" },
  { group: "Settings", href: "/admin/settings", label: "Site settings", Icon: Settings, area: "settings.manage" },
] as const;

/** Shortcuts in the phone tab bar, when the user can see them. */
const TAB_LABELS: Record<string, string> = {
  "/admin": "Home",
  "/admin/tasks": "Tasks",
  "/admin/enquiries": "Enquiries",
  "/admin/attendance": "Attendance",
};

export function AdminShell({
  user,
  areas,
  badges,
  presence,
  unread,
  children,
}: {
  unread: number;
  presence: ShellPresence;
  user: { name: string; email: string; roleLabel: string };
  areas: readonly string[];
  badges: Record<string, number>;
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "/admin";
  const [open, setOpen] = useState(false);
  const [install, setInstall] = useState<{ prompt: () => Promise<void> } | null>(null);

  // Installable app: register the offline worker and offer "Install app".
  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/admin-sw.js", { scope: "/admin" }).catch(() => undefined);
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstall(event as unknown as { prompt: () => Promise<void> });
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", () => setInstall(null));
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);
  const items = NAV.filter((item) => item.area === null || areas.includes(item.area));

  const groups = [...new Set(items.map((item) => item.group))];
  const tabs = items.filter((item) => item.href in TAB_LABELS);
  // The most specific matching link is the active one (/admin/attendance vs /admin/attendance/team).
  const activeHref = items
    .map((item) => item.href as string)
    .filter((href) => (href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`)))
    .sort((a, b) => b.length - a.length)[0];

  const presenceBar = (
    <div className="flex items-center gap-2">
      <Link
        href="/admin/notifications"
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        className="relative inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
      >
        <Bell className="size-[18px]" aria-hidden />
        {unread ? (
          <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-red-500 px-1 text-center text-[10px] font-bold leading-4 text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </Link>
      {presence.timer ? (
        <Link
          href={`/admin/tasks/${presence.timer.taskId}`}
          title={`Timer running: ${presence.timer.title}`}
          className="hidden max-w-60 items-center gap-1.5 rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-700 hover:bg-violet-500/15 sm:inline-flex dark:text-violet-300"
        >
          <Timer className="size-3.5 shrink-0 animate-pulse" aria-hidden />
          <span className="truncate">{presence.timer.title}</span>
          <Elapsed since={presence.timer.startedAt} />
        </Link>
      ) : null}
      <Link
        href="/admin/attendance"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors",
          presence.state === "in" && "bg-emerald-500/12 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300",
          presence.state === "break" && "bg-amber-500/12 text-amber-700 hover:bg-amber-500/20 dark:text-amber-300",
          presence.state === "out" && "bg-[#2f56d8] text-white hover:brightness-110",
          presence.state === "done" && "bg-foreground/[0.06] text-muted-foreground hover:text-foreground",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "size-2 rounded-full",
            presence.state === "in" && "animate-pulse bg-emerald-500",
            presence.state === "break" && "bg-amber-500",
            presence.state === "out" && "bg-white",
            presence.state === "done" && "bg-slate-400",
          )}
        />
        {presence.state === "in" && presence.since ? (
          <>
            Working <Elapsed since={presence.since} minus={presence.breakMinutes} />
          </>
        ) : presence.state === "break" && presence.breakSince ? (
          <>
            On break <Elapsed since={presence.breakSince} />
          </>
        ) : presence.state === "done" ? (
          "Checked out"
        ) : (
          "Check in"
        )}
      </Link>
    </div>
  );
  const initials = user.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const nav = (
    <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3">
      {groups.map((group) => (
        <div key={group}>
          <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">{group}</p>
          <div className="flex flex-col gap-0.5">
            {items
              .filter((item) => item.group === group)
              .map(({ href, label, Icon }) => {
                const active = href === activeHref;
                const count = badges[href];
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                      active
                        ? "bg-[linear-gradient(90deg,rgba(47,86,216,0.28),rgba(10,142,166,0.10))] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                        : "text-white/65 hover:bg-white/[0.05] hover:text-white",
                    )}
                  >
                    {active ? (
                      <span aria-hidden className="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[linear-gradient(180deg,#4f7cff,#22c3e6)] shadow-[0_0_12px_rgba(79,124,255,0.8)]" />
                    ) : null}
                    <Icon className={cn("size-[18px]", active ? "text-[#8fb0ff]" : "text-white/45 group-hover:text-white/80")} aria-hidden />
                    <span className="flex-1">{label}</span>
                    {count ? (
                      <span className="min-w-5 rounded-full bg-[linear-gradient(100deg,#2f56d8,#0a8ea6)] px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
                        {count}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
          </div>
        </div>
      ))}
    </nav>
  );

  const sidebar = (
    <div className="dark relative flex h-full flex-col overflow-hidden bg-[#0b1020] py-5 text-white">
      <span aria-hidden className="pointer-events-none absolute -left-24 -top-24 size-64 rounded-full bg-[#2f56d8]/25 blur-3xl" />
      <span aria-hidden className="pointer-events-none absolute -bottom-32 -right-24 size-64 rounded-full bg-[#0a8ea6]/15 blur-3xl" />
      <Link href="/admin" className="relative mb-7 flex items-center gap-3 px-5">
        <LogoMark className="size-10" />
        <span className="leading-none">
          <span className="block font-[family-name:var(--font-brand)] text-[1.08rem] font-bold tracking-[0.06em]">SETUWARE</span>
          <span className="mt-1.5 inline-block rounded-full bg-white/[0.08] px-2 py-0.5 text-[0.58rem] font-semibold tracking-[0.24em] text-[#5fd0ec]">
            ADMIN
          </span>
        </span>
      </Link>
      <div className="relative flex flex-1 flex-col">{nav}</div>
      {install ? (
        <button
          type="button"
          onClick={() => {
            void install.prompt();
            setInstall(null);
          }}
          className="relative mx-3 mt-4 flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(100deg,#2f56d8,#0a8ea6)] py-2 text-xs font-semibold text-white hover:brightness-110"
        >
          <Download className="size-3.5" aria-hidden /> Install app
        </button>
      ) : null}
      <div className="relative mx-3 mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
        <Link href="/admin/account" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl p-1 hover:bg-white/[0.04]">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#2f56d8,#0a8ea6)] text-xs font-bold">
            {initials}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-white">{user.name}</span>
            <span className="block truncate text-[11px] text-white/50">{user.roleLabel}</span>
          </span>
          <UserCircle className="size-4 text-white/40" aria-hidden />
        </Link>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <a href="/" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 rounded-lg bg-white/[0.06] py-1.5 text-xs font-medium text-white/70 hover:bg-white/[0.1] hover:text-white">
            <ExternalLink className="size-3.5" aria-hidden /> Website
          </a>
          <form action={logoutAction}>
            <button type="submit" className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-white/[0.06] py-1.5 text-xs font-medium text-white/70 hover:bg-red-500/20 hover:text-white">
              <LogOut className="size-3.5" aria-hidden /> Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="sticky top-0 hidden h-dvh w-[17rem] shrink-0 lg:block">{sidebar}</aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative h-full w-72">{sidebar}</div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="dark sticky top-0 z-40 flex items-center justify-between bg-[#0b1020] px-4 py-3 text-white lg:hidden">
          <Link href="/admin" className="flex items-center gap-2">
            <LogoMark className="size-8" />
            <span className="font-[family-name:var(--font-brand)] font-bold tracking-[0.06em]">ADMIN</span>
          </Link>
          <div className="ml-auto mr-1">{presenceBar}</div>
          <Link href="/admin/search" aria-label="Search the admin" className="rounded-lg p-2 hover:bg-white/10">
            <Search className="size-5" aria-hidden />
          </Link>
          <button type="button" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)} className="rounded-lg p-2 hover:bg-white/10">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </header>
        <div className="relative flex-1 bg-[radial-gradient(60rem_30rem_at_100%_-10%,rgba(47,86,216,0.07),transparent),radial-gradient(40rem_24rem_at_0%_0%,rgba(10,142,166,0.05),transparent)]">
          <div className="hidden items-center justify-between border-b border-border/70 bg-surface/70 px-10 py-3 backdrop-blur lg:flex">
            <form action="/admin/search" className="relative w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                name="q"
                placeholder="Search enquiries, people, posts…"
                aria-label="Search the admin"
                className="h-9 w-full rounded-full border border-border bg-surface pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-setu focus:ring-2 focus:ring-setu/20"
              />
            </form>
            <div className="ml-auto mr-4">{presenceBar}</div>
            <p className="mr-4 text-xs text-muted-foreground">
              {new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Kolkata" }).format(new Date())}
            </p>
            <a href="/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground">
              <ExternalLink className="size-3.5" aria-hidden /> View website
            </a>
          </div>
          <div data-admin-content className="mx-auto w-full max-w-6xl px-4 pb-28 pt-5 sm:px-6 sm:pt-6 lg:px-10 lg:py-9">{children}</div>
        </div>
      </div>

      <nav
        aria-label="Quick links"
        className="fixed inset-x-0 bottom-0 z-40 grid border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
        style={{ gridTemplateColumns: `repeat(${tabs.length + 1}, minmax(0, 1fr))` }}
      >
        {tabs.map(({ href, Icon }) => {
          const active = href === activeHref;
          const count = badges[href];
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn("relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold", active ? "text-[#2f56d8] dark:text-[#8fb0ff]" : "text-muted-foreground")}
            >
              <Icon className="size-5" aria-hidden />
              {TAB_LABELS[href]}
              {count ? (
                <span className="absolute left-1/2 top-1.5 ml-2 min-w-4 rounded-full bg-red-500 px-1 text-center text-[10px] font-bold leading-4 text-white">{count}</span>
              ) : null}
            </Link>
          );
        })}
        <button type="button" onClick={() => setOpen(true)} className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold text-muted-foreground">
          <Menu className="size-5" aria-hidden />
          More
        </button>
      </nav>
    </div>
  );
}
