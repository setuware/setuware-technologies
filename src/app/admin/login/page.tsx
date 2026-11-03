import { Suspense } from "react";

import { LogoMark } from "@/components/layout/logo";

import { LoginForm } from "./login-form";

export default function LoginPage({ searchParams }: { searchParams: Promise<{ changed?: string }> }) {
  return (
    <div className="dark relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#0b1020] px-4 py-16 text-foreground">
      <div aria-hidden className="pointer-events-none absolute -right-32 -top-32 size-[28rem] rounded-full bg-[#2f56d8]/25 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-24 size-[26rem] rounded-full bg-[#0a8ea6]/20 blur-3xl" />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <LogoMark className="size-14" />
          <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight text-white">Sign in to Setuware Admin</h1>
          <p className="mt-1.5 text-sm text-white/60">Blog, jobs, applications and enquiries.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur">
          <Suspense fallback={<div className="h-56" />}>
            <ChangedNotice searchParams={searchParams} />
            <LoginForm />
          </Suspense>
        </div>
        <p className="mt-6 text-center text-xs text-white/40">Authorised staff only. Sign-ins are logged.</p>
      </div>
    </div>
  );
}

async function ChangedNotice({ searchParams }: { searchParams: Promise<{ changed?: string }> }) {
  const { changed } = await searchParams;
  return changed ? (
    <p className="mb-4 rounded-xl bg-emerald-500/15 px-4 py-2.5 text-sm text-emerald-300">Password changed. Please sign in again.</p>
  ) : null;
}
