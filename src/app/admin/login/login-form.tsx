"use client";

import { useActionState, useState } from "react";

import { FormMessage, SubmitButton } from "@/components/admin/form-bits";
import { inputClass } from "@/components/admin/ui";

import { loginAction, type FormState } from "../actions";

export function LoginForm() {
  const [state, action] = useActionState<FormState, FormData>(loginAction, {});
  // Controlled, so a failed attempt keeps the email (React resets forms after an action).
  const [email, setEmail] = useState("");
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
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-white/80">
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </div>
      <FormMessage state={state} />
      <SubmitButton pendingLabel="Signing in…" className="mt-1 w-full">
        Sign in
      </SubmitButton>
    </form>
  );
}
