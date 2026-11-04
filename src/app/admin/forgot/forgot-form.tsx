"use client";

import { useActionState } from "react";
import Link from "next/link";

import { FormMessage, SubmitButton } from "@/components/admin/form-bits";
import { inputClass } from "@/components/admin/ui";

import { forgotPasswordAction, type FormState } from "../actions";

export function ForgotForm() {
  const [state, action] = useActionState<FormState, FormData>(forgotPasswordAction, {});
  return (
    <form action={action} className="flex flex-col gap-4">
      {state.ok ? null : (
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-white/80">
            Work email
          </label>
          <input id="email" name="email" type="email" autoComplete="username" required className={inputClass} />
        </div>
      )}
      <FormMessage state={state} />
      {state.ok ? null : (
        <SubmitButton pendingLabel="Sending…" className="w-full">
          Send reset link
        </SubmitButton>
      )}
      <Link href="/admin/login" className="text-center text-sm text-white/60 hover:text-white">
        ← Back to sign in
      </Link>
    </form>
  );
}
