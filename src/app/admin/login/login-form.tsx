"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { FormMessage, SubmitButton } from "@/components/admin/form-bits";
import { inputClass } from "@/components/admin/ui";

import { loginAction, verifyCodeAction, type FormState } from "../actions";

export function LoginForm({ startAtCode = false }: { startAtCode?: boolean }) {
  const [state, action] = useActionState<FormState, FormData>(loginAction, {});
  const [codeState, codeAction] = useActionState<FormState, FormData>(verifyCodeAction, {});
  // Controlled, so a failed attempt keeps the email (React resets forms after an action).
  const [email, setEmail] = useState("");
  const askCode = startAtCode || state.step === "code" || codeState.step === "code";

  if (askCode && !codeState.error?.startsWith("Your sign-in expired")) {
    return (
      <form action={codeAction} className="flex flex-col gap-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.05] p-3">
          <ShieldCheck className="size-5 shrink-0 text-[#5fd0ec]" aria-hidden />
          <p className="text-sm text-white/75">Enter the 6-digit code from your authenticator app, or one of your recovery codes.</p>
        </div>
        <div>
          <label htmlFor="code" className="mb-1.5 block text-sm font-medium text-white/80">
            Verification code
          </label>
          <input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            required
            placeholder="123 456"
            className={`${inputClass} text-center font-mono text-lg tracking-[0.3em]`}
          />
        </div>
        <FormMessage state={{ error: codeState.error }} />
        <SubmitButton pendingLabel="Checking…" className="w-full">
          Verify and sign in
        </SubmitButton>
      </form>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-white/80">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <div className="mb-1.5 flex items-baseline justify-between">
          <label htmlFor="password" className="block text-sm font-medium text-white/80">
            Password
          </label>
          <Link href="/admin/forgot" className="text-xs font-medium text-[#8fb0ff] hover:underline">
            Forgot password?
          </Link>
        </div>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </div>
      <FormMessage state={{ error: state.error ?? codeState.error }} />
      <SubmitButton pendingLabel="Signing in…" className="mt-1 w-full">
        Sign in
      </SubmitButton>
    </form>
  );
}
