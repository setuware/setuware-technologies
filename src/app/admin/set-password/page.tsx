import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";

import { userForPasswordToken } from "@/lib/cms/auth";
import { AuthCard } from "@/components/admin/auth-card";

import { SetPasswordForm } from "./set-password-form";

export default function SetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#0b1020]" />}>
      <Body searchParams={searchParams} />
    </Suspense>
  );
}

async function Body({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  await connection();
  const { token = "" } = await searchParams;
  const found = token ? userForPasswordToken(token) : null;

  if (!found) {
    return (
      <AuthCard title="This link has expired" subtitle="Invite links last 3 days and reset links 1 hour, and each works once.">
        <div className="flex flex-col gap-3 text-center">
          <Link href="/admin/forgot" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#0b1020] hover:opacity-90">
            Send me a new link
          </Link>
          <Link href="/admin/login" className="text-sm text-white/60 hover:text-white">
            Back to sign in
          </Link>
        </div>
      </AuthCard>
    );
  }

  const first = found.user.name.split(" ")[0];
  return (
    <AuthCard
      title={found.purpose === "invite" ? `Welcome, ${first}` : "Choose a new password"}
      subtitle={found.purpose === "invite" ? `Set a password for ${found.user.email} to start using Setuware Core.` : found.user.email}
    >
      <SetPasswordForm token={token} />
    </AuthCard>
  );
}
