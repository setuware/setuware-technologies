"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
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

const NAV = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard, area: null },
  { href: "/admin/enquiries", label: "Enquiries", Icon: Inbox, area: "enquiries" },
  { href: "/admin/posts", label: "Blog posts", Icon: FileText, area: "posts" },
  { href: "/admin/jobs", label: "Jobs", Icon: Briefcase, area: "jobs" },
  { href: "/admin/applications", label: "Applications", Icon: UsersRound, area: "applications" },
  { href: "/admin/users", label: "Team", Icon: Users, area: "users" },
] as const;

export function AdminShell({
  user,
  areas,
  badges,
  children,
}: {
  user: { name: string; email: string; roleLabel: string };
  areas: readonly string[];
  badges: Record<string, number>;
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "/admin";
  const [open, setOpen] = useState(false);
  const items = NAV.filter((item) => item.area === null || areas.includes(item.area));

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {items.map(({ href, label, Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        const count = badges[href];
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
              active ? "bg-white/[0.1] text-white" : "text-white/70 hover:bg-white/[0.06] hover:text-white",
            )}
          >
            <Icon className="size-4" aria-hidden />
            <span className="flex-1">{label}</span>
            {count ? (
              <span className="rounded-full bg-[#2f56d8] px-2 py-0.5 text-[11px] font-bold text-white">{count}</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );

  const sidebar = (
    <div className="dark flex h-full flex-col bg-[#0b1020] py-5 text-white">
      <Link href="/admin" className="mb-6 flex items-center gap-3 px-5">
        <LogoMark className="size-9" />
        <span className="leading-none">
          <span className="block font-[family-name:var(--font-brand)] text-[1.05rem] font-bold tracking-[0.06em]">SETUWARE</span>
          <span className="mt-1 block text-[0.6rem] font-semibold tracking-[0.3em] text-[#5fd0ec]">ADMIN</span>
        </span>
      </Link>
      {nav}
      <div className="mt-4 flex flex-col gap-1 border-t border-white/10 px-3 pt-4">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-white/60 hover:bg-white/[0.06] hover:text-white"
        >
          <ExternalLink className="size-4" aria-hidden />
          View website
        </a>
        <Link
          href="/admin/account"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-white/60 hover:bg-white/[0.06] hover:text-white"
        >
          <UserCircle className="size-4" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-white">{user.name}</span>
            <span className="block truncate text-[11px] text-white/50">{user.roleLabel}</span>
          </span>
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-white/60 hover:bg-white/[0.06] hover:text-white"
          >
            <LogOut className="size-4" aria-hidden />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 lg:block">{sidebar}</aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative h-full w-72">{sidebar}</div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="dark flex items-center justify-between bg-[#0b1020] px-4 py-3 text-white lg:hidden">
          <Link href="/admin" className="flex items-center gap-2">
            <LogoMark className="size-8" />
            <span className="font-[family-name:var(--font-brand)] font-bold tracking-[0.06em]">ADMIN</span>
          </Link>
          <button type="button" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)} className="rounded-lg p-2 hover:bg-white/10">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </header>
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</div>
      </div>
    </div>
  );
}
