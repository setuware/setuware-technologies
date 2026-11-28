import { Suspense } from "react";

import { AuthCard } from "@/components/admin/auth-card";

import { LoginForm } from "./login-form";

export default function LoginPage({ searchParams }: { searchParams: Promise<{ changed?: string; step?: string }> }) {
  return (
    <AuthCard title="Sign in to Setuware Core" subtitle="Your workspace for tasks, attendance, leave, timesheets and the team.">
      <Suspense fallback={<div className="h-56" />}>
        <LoginBody searchParams={searchParams} />
      </Suspense>
    </AuthCard>
  );
}

async function LoginBody({ searchParams }: { searchParams: Promise<{ changed?: string; step?: string }> }) {
  const { changed, step } = await searchParams;
  return (
    <>
      {changed ? <p className="mb-4 rounded-xl bg-emerald-500/15 px-4 py-2.5 text-sm text-emerald-300">Password changed. Please sign in again.</p> : null}
      <LoginForm startAtCode={step === "code"} />
    </>
  );
}
