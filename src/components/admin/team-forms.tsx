"use client";

import { useActionState, useState } from "react";
import { KeyRound, Link2, MailPlus, Trash2 } from "lucide-react";

import {
  changeOwnPasswordAction,
  confirmTwoFactorAction,
  createUserAction,
  disableTwoFactorAction,
  removeUserAction,
  resendInviteAction,
  resetUserPasswordAction,
  sendResetLinkAction,
  type FormState,
} from "@/app/admin/actions";
import { cn } from "@/lib/utils";

import { CopyButton } from "./copy-button";
import { FieldError, FormMessage, SubmitButton } from "./form-bits";
import { inputClass } from "./ui";

function LinkResult({ state }: { state: FormState }) {
  return (
    <div className="flex flex-col gap-2">
      <FormMessage state={state} />
      {state.link ? (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-background/60 p-2">
          <code className="min-w-0 flex-1 truncate px-2 text-xs text-muted-foreground">{state.link}</code>
          <CopyButton value={state.link} />
        </div>
      ) : null}
    </div>
  );
}

export function AddUserForm({ roles }: { roles: Record<string, string> }) {
  const [state, action] = useActionState<FormState, FormData>(createUserAction, {});
  const [method, setMethod] = useState<"invite" | "password">("invite");
  const f = state.fields ?? {};
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="method" value={method} />
      <div className="grid grid-cols-2 gap-1 rounded-full border border-border bg-background-subtle p-1 sm:w-96">
        {(
          [
            ["invite", "Email an invite", MailPlus],
            ["password", "Set a temporary password", KeyRound],
          ] as const
        ).map(([value, label, Icon]) => (
          <button
            key={value}
            type="button"
            onClick={() => setMethod(value)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold",
              method === value ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground",
            )}
          >
            <Icon className="size-3.5" aria-hidden /> {label}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="new-name" className="mb-1 block text-sm font-medium text-foreground">Name</label>
          <input id="new-name" name="name" className={inputClass} />
          <FieldError message={f.name} />
        </div>
        <div>
          <label htmlFor="new-email" className="mb-1 block text-sm font-medium text-foreground">Work email</label>
          <input id="new-email" name="email" type="email" placeholder="name@setuware.in" className={inputClass} />
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
        {method === "password" ? (
          <div>
            <label htmlFor="new-password" className="mb-1 block text-sm font-medium text-foreground">Temporary password</label>
            <input id="new-password" name="password" type="text" autoComplete="off" className={inputClass} />
            <FieldError message={f.password} />
          </div>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">
        {method === "invite"
          ? "They get an email with a link to choose their own password (valid 3 days). If email isn't set up, copy the link below and send it."
          : "Share the password privately; they must choose their own the first time they sign in."}
      </p>
      <LinkResult state={state} />
      <SubmitButton className="self-start">{method === "invite" ? "Send invite" : "Add team member"}</SubmitButton>
    </form>
  );
}

/** Per-person account help for the owner: invite, reset link, temporary password. */
export function UserAccess({ id, invited }: { id: number; invited: boolean }) {
  const [open, setOpen] = useState<"" | "temp">("");
  const [linkState, linkAction] = useActionState<FormState, FormData>(invited ? resendInviteAction : sendResetLinkAction, {});
  const [tempState, tempAction] = useActionState<FormState, FormData>(resetUserPasswordAction, {});
  return (
    <div className="mt-2 flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <form action={linkAction}>
          <input type="hidden" name="id" value={id} />
          <button className="inline-flex items-center gap-1 font-medium text-setu-dark hover:underline dark:text-[#5fd0ec]">
            <Link2 className="size-3.5" aria-hidden /> {invited ? "Resend invite" : "Send reset link"}
          </button>
        </form>
        {!invited ? (
          <button type="button" onClick={() => setOpen(open ? "" : "temp")} className="font-medium text-muted-foreground hover:text-foreground">
            Set temporary password
          </button>
        ) : null}
      </div>
      {open === "temp" ? (
        <form action={tempAction} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="id" value={id} />
          <input name="password" type="text" placeholder="Temporary password" aria-label="Temporary password" autoComplete="off" className={`${inputClass} max-w-[14rem] py-1.5`} />
          <SubmitButton variant="secondary" className="h-8 px-3 text-xs">Set</SubmitButton>
          <div className="w-full">
            <FormMessage state={tempState} />
          </div>
        </form>
      ) : null}
      {linkState.ok || linkState.error ? <LinkResult state={linkState} /> : null}
    </div>
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
      <p className="text-xs text-muted-foreground">At least 10 characters with letters and a number. Other devices will be signed out.</p>
      <FormMessage state={state} />
      <SubmitButton className="self-start">Change password</SubmitButton>
    </form>
  );
}

export function TwoFactorConfirm({ qr, secret }: { qr: string; secret: string }) {
  const [state, action] = useActionState<FormState, FormData>(confirmTwoFactorAction, {});
  if (state.codes) {
    return (
      <div className="flex flex-col gap-3">
        <FormMessage state={state} />
        <p className="text-sm text-foreground">
          Save these recovery codes somewhere safe. Each works once if you lose your phone. They will not be shown again.
        </p>
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-background/60 p-4 font-mono text-sm sm:grid-cols-4">
          {state.codes.map((code) => (
            <span key={code}>{code}</span>
          ))}
        </div>
        <CopyButton value={state.codes.join("\n")} label="Copy codes" />
      </div>
    );
  }
  return (
    <form action={action} className="flex flex-col gap-4 sm:flex-row sm:items-start">
      {/* eslint-disable-next-line @next/next/no-img-element -- generated QR code (data URL) */}
      <img src={qr} alt="QR code for your authenticator app" width={176} height={176} className="rounded-xl border border-border bg-white p-2" />
      <div className="flex flex-1 flex-col gap-3">
        <ol className="list-decimal pl-5 text-sm text-foreground/85">
          <li>Open Google Authenticator, Microsoft Authenticator or 1Password.</li>
          <li>Scan the QR code (or enter the key below).</li>
          <li>Type the 6-digit code it shows.</li>
        </ol>
        <code className="w-fit rounded-lg bg-foreground/[0.05] px-2 py-1 text-xs tracking-wider text-muted-foreground">{secret.match(/.{1,4}/g)?.join(" ")}</code>
        <input name="code" inputMode="numeric" autoComplete="one-time-code" placeholder="123456" aria-label="6-digit code" className={`${inputClass} max-w-[10rem] font-mono tracking-[0.2em]`} />
        <FormMessage state={state} />
        <SubmitButton className="self-start">Turn on</SubmitButton>
      </div>
    </form>
  );
}

export function TwoFactorDisable() {
  const [state, action] = useActionState<FormState, FormData>(disableTwoFactorAction, {});
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input name="password" type="password" placeholder="Current password" aria-label="Current password" autoComplete="current-password" className={`${inputClass} max-w-[14rem]`} />
      <SubmitButton variant="danger">Turn off</SubmitButton>
      <div className="w-full">
        <FormMessage state={state} />
      </div>
    </form>
  );
}

/** Permanent removal, behind a confirmation so a stray click cannot delete an account. */
export function RemoveUser({ id, name }: { id: number; name: string }) {
  return (
    <form
      action={removeUserAction}
      onSubmit={(event) => {
        if (!window.confirm(`Remove ${name} from the admin? They lose access immediately. Their past tasks and time entries stay on record.`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-red-500/30 px-3 text-sm font-medium text-red-600 hover:bg-red-500/10 dark:text-red-400">
        <Trash2 className="size-4" aria-hidden /> Remove
      </button>
    </form>
  );
}
