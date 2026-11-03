"use client";

import { useActionState, useState } from "react";

import {
  changeOwnPasswordAction,
  createUserAction,
  resetUserPasswordAction,
  type FormState,
} from "@/app/admin/actions";

import { FieldError, FormMessage, SubmitButton } from "./form-bits";
import { inputClass } from "./ui";

export function AddUserForm({ roles }: { roles: Record<string, string> }) {
  const [state, action] = useActionState<FormState, FormData>(createUserAction, {});
  const f = state.fields ?? {};
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <div>
        <label htmlFor="new-name" className="mb-1 block text-sm font-medium text-foreground">Name</label>
        <input id="new-name" name="name" className={inputClass} />
        <FieldError message={f.name} />
      </div>
      <div>
        <label htmlFor="new-email" className="mb-1 block text-sm font-medium text-foreground">Email</label>
        <input id="new-email" name="email" type="email" className={inputClass} />
        <FieldError message={f.email} />
      </div>
      <div>
        <label htmlFor="new-role" className="mb-1 block text-sm font-medium text-foreground">Role</label>
        <select id="new-role" name="role" defaultValue="editor" className={inputClass}>
          {Object.entries(roles).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <FieldError message={f.role} />
      </div>
      <div>
        <label htmlFor="new-password" className="mb-1 block text-sm font-medium text-foreground">Temporary password</label>
        <input id="new-password" name="password" type="text" autoComplete="off" className={inputClass} />
        <FieldError message={f.password} />
      </div>
      <div className="flex flex-col gap-3 sm:col-span-2">
        <FormMessage state={state} />
        <SubmitButton className="self-start">Add team member</SubmitButton>
      </div>
    </form>
  );
}

export function ResetPasswordForm({ id }: { id: number }) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState<FormState, FormData>(resetUserPasswordAction, {});
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-xs font-medium text-muted-foreground hover:text-foreground">
        Reset password
      </button>
    );
  }
  return (
    <form action={action} className="mt-2 flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <input name="password" type="text" placeholder="New password" aria-label="New password" autoComplete="off" className={`${inputClass} max-w-[12rem] py-1.5`} />
      <SubmitButton variant="secondary" className="h-8 px-3 text-xs">Set</SubmitButton>
      <button type="button" onClick={() => setOpen(false)} className="text-xs text-muted-foreground">
        Cancel
      </button>
      <div className="w-full">
        <FormMessage state={state} />
      </div>
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, action] = useActionState<FormState, FormData>(changeOwnPasswordAction, {});
  return (
    <form action={action} className="flex max-w-md flex-col gap-3">
      {(
        [
          ["current", "Current password", "current-password"],
          ["next", "New password", "new-password"],
          ["confirm", "Repeat new password", "new-password"],
        ] as const
      ).map(([name, label, autoComplete]) => (
        <div key={name}>
          <label htmlFor={name} className="mb-1 block text-sm font-medium text-foreground">
            {label}
          </label>
          <input id={name} name={name} type="password" autoComplete={autoComplete} className={inputClass} />
        </div>
      ))}
      <p className="text-xs text-muted-foreground">At least 10 characters with letters and a number. You will be signed out everywhere.</p>
      <FormMessage state={state} />
      <SubmitButton className="self-start">Change password</SubmitButton>
    </form>
  );
}
