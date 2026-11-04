"use client";

import { useActionState, useState } from "react";

import { FormMessage, SubmitButton } from "@/components/admin/form-bits";
import { inputClass } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

import { setPasswordFromLinkAction, type FormState } from "../actions";

/** Strength hint: length, letters, digits, symbols. */
function strength(password: string): number {
  let score = 0;
  if (password.length >= 10) score += 1;
  if (password.length >= 14) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^\w\s]/.test(password)) score += 1;
  return Math.min(4, score);
}

const LABELS = ["Too short", "Weak", "Okay", "Good", "Strong"];
const COLOURS = ["bg-red-500", "bg-orange-500", "bg-amber-400", "bg-emerald-500", "bg-emerald-400"];

export function SetPasswordForm({ token }: { token: string }) {
  const [state, action] = useActionState<FormState, FormData>(setPasswordFromLinkAction, {});
  const [password, setPassword] = useState("");
  const score = password ? strength(password) : -1;
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-white/80">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={inputClass}
        />
        <div className="mt-2 flex gap-1" aria-hidden>
          {[0, 1, 2, 3].map((index) => (
            <span key={index} className={cn("h-1 flex-1 rounded-full", score > index ? COLOURS[score] : "bg-white/10")} />
          ))}
        </div>
        <p className="mt-1 text-xs text-white/50">{score >= 0 ? LABELS[score] : "At least 10 characters with letters and a number."}</p>
      </div>
      <div>
        <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-white/80">
          Repeat password
        </label>
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" required className={inputClass} />
      </div>
      <FormMessage state={state} />
      <SubmitButton pendingLabel="Saving…" className="w-full">
        Save password and sign in
      </SubmitButton>
    </form>
  );
}
