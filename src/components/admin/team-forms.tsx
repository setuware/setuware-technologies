"use client";

import { useActionState, useRef, useState } from "react";
import { KeyRound, Link2, MailPlus, PartyPopper, RefreshCw, Trash2, UserPlus } from "lucide-react";

import {
  changeOwnPasswordAction,
  confirmTwoFactorAction,
  createUserAction,
  disableTwoFactorAction,
  emailLoginDetailsAction,
  removeUserAction,
  resendInviteAction,
  resetUserPasswordAction,
  sendResetLinkAction,
  sendWelcomeAction,
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
      {state.password ? (
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/8 p-2">
          <span className="px-2 text-xs text-muted-foreground">Temporary password</span>
          <code className="min-w-0 flex-1 truncate font-mono text-sm font-semibold tracking-wide text-foreground">{state.password}</code>
          <CopyButton value={state.password} label="Copy password" />
        </div>
      ) : null}
      {state.link ? (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-background/60 p-2">
          <code className="min-w-0 flex-1 truncate px-2 text-xs text-muted-foreground">{state.link}</code>
          <CopyButton value={state.link} />
        </div>
      ) : null}
    </div>
  );
}

const PASSWORD_LETTERS = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";
const PASSWORD_DIGITS = "23456789";

/** Same shape as the server's generator (`Kq7m-xT3p-Rw9a`), from the browser's secure random source. */
function randomPassword(): string {
  const bytes = crypto.getRandomValues(new Uint32Array(12));
  const pick = (set: string, index: number) => set[bytes[index] % set.length];
  return [0, 1, 2]
    .map((group) => [0, 1, 2, 3].map((slot) => pick(slot === 2 ? PASSWORD_DIGITS : PASSWORD_LETTERS + PASSWORD_DIGITS, group * 4 + slot)).join(""))
    .join("-");
}

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 flex items-baseline justify-between gap-2 text-sm font-medium text-foreground">
        {label}
        {hint ? <span className="text-xs font-normal text-muted-foreground">{hint}</span> : null}
      </label>
      {children}
      <FieldError message={error} />
    </div>
  );
}

function SectionTitle({ step, children }: { step: number; children: React.ReactNode }) {
  return (
    <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
      <span className="grid size-5 place-items-center rounded-full bg-[#2f56d8] text-[10px] text-white">{step}</span>
      {children}
    </h3>
  );
}

export function AddUserForm({
  roles,
  members,
  departments,
  emailReady,
}: {
  roles: Record<string, string>;
  members: { id: number; name: string }[];
  departments: string[];
  emailReady: boolean;
}) {
  const [state, action] = useActionState<FormState, FormData>(createUserAction, {});
  const [method, setMethod] = useState<"credentials" | "invite">("credentials");
  const [welcome, setWelcome] = useState(true);
  const password = useRef<HTMLInputElement>(null);
  const f = state.fields ?? {};
  const emails = [
    method === "credentials"
      ? { icon: KeyRound, title: "Login details", note: "Sign-in page, their email and a temporary password. They choose their own at first sign-in." }
      : { icon: Link2, title: "Invite link", note: "A one-time link to choose their password, valid for 3 days." },
    ...(welcome ? [{ icon: PartyPopper, title: "Welcome email", note: "Their role, manager, joining date and first-day checklist." }] : []),
  ];
  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <input type="hidden" name="method" value={method} />
      <div className="flex flex-col gap-6">
        <section>
          <SectionTitle step={1}>Account</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field id="new-name" label="Full name" error={f.name}>
              <input id="new-name" name="name" autoComplete="off" className={inputClass} />
            </Field>
            <Field id="new-email" label="Work email" error={f.email}>
              <input id="new-email" name="email" type="email" autoComplete="off" placeholder="name@setuware.in" className={inputClass} />
            </Field>
            <Field id="new-role" label="Admin role" hint="What they can open" error={f.role}>
              <select id="new-role" name="role" defaultValue="editor" className={inputClass}>
                {Object.entries(roles).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </section>

        <section>
          <SectionTitle step={2}>Job details</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field id="new-designation" label="Designation" hint="Optional">
              <input id="new-designation" name="designation" placeholder="e.g. Frontend Developer" className={inputClass} />
            </Field>
            <Field id="new-department" label="Department" hint="Optional">
              <input id="new-department" name="department" list="new-departments" placeholder="e.g. Engineering" className={inputClass} />
              <datalist id="new-departments">
                {departments.map((department) => (
                  <option key={department} value={department} />
                ))}
              </datalist>
            </Field>
            <Field id="new-manager" label="Reports to" hint="Optional" error={f.manager_id}>
              <select id="new-manager" name="manager_id" defaultValue="" className={inputClass}>
                <option value="">No manager</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="new-joined" label="Joining date" hint="Optional" error={f.joined_on}>
              <input id="new-joined" name="joined_on" type="date" className={inputClass} />
            </Field>
          </div>
        </section>

        <section>
          <SectionTitle step={3}>Sign-in</SectionTitle>
          <div className="grid gap-2 sm:grid-cols-2">
            {(
              [
                ["credentials", "Email login details", "We create a temporary password and email it", KeyRound],
                ["invite", "Email an invite link", "They set their password from a link", MailPlus],
              ] as const
            ).map(([value, label, note, Icon]) => (
              <button
                key={value}
                type="button"
                aria-pressed={method === value}
                onClick={() => setMethod(value)}
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-3 text-left transition-colors",
                  method === value ? "border-[#2f56d8] bg-[#2f56d8]/6 ring-1 ring-[#2f56d8]/30" : "border-border hover:border-foreground/25",
                )}
              >
                <Icon className={cn("mt-0.5 size-4 shrink-0", method === value ? "text-[#2f56d8]" : "text-muted-foreground")} aria-hidden />
                <span>
                  <span className="block text-sm font-semibold text-foreground">{label}</span>
                  <span className="block text-xs text-muted-foreground">{note}</span>
                </span>
              </button>
            ))}
          </div>
          {method === "credentials" ? (
            <div className="mt-3 sm:max-w-md">
              <Field id="new-password" label="Temporary password" hint="Leave blank to generate one" error={f.password}>
                <div className="flex gap-2">
                  <input ref={password} id="new-password" name="password" type="text" autoComplete="off" spellCheck={false} placeholder="Generated automatically" className={`${inputClass} font-mono`} />
                  <button
                    type="button"
                    onClick={() => {
                      if (password.current) password.current.value = randomPassword();
                    }}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-border bg-surface px-3 text-xs font-semibold text-foreground hover:border-foreground/30"
                  >
                    <RefreshCw className="size-3.5" aria-hidden /> Generate
                  </button>
                </div>
              </Field>
            </div>
          ) : null}
          <label className="mt-4 flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" name="welcome" checked={welcome} onChange={(event) => setWelcome(event.target.checked)} className="size-4 accent-[#2f56d8]" />
            Also send a welcome email
          </label>
        </section>

        <LinkResult state={state} />
        <SubmitButton className="self-start" pendingLabel="Adding…">
          <UserPlus className="size-4" aria-hidden /> Add and send email{emails.length > 1 ? "s" : ""}
        </SubmitButton>
      </div>

      <aside className="h-fit rounded-2xl border border-border bg-background-subtle p-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">They will receive</p>
        <ul className="mt-3 flex flex-col gap-3">
          {emails.map(({ icon: Icon, title, note }) => (
            <li key={title} className="flex gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#2f56d8]/10 text-[#2f56d8]">
                <Icon className="size-4" aria-hidden />
              </span>
              <span>
                <span className="block text-sm font-semibold text-foreground">{title}</span>
                <span className="block text-xs leading-relaxed text-muted-foreground">{note}</span>
              </span>
            </li>
          ))}
        </ul>
        {!emailReady ? (
          <p className="mt-4 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
            Email (SMTP) is not set up on this server. The account is still created and you get the password or link to share yourself.
          </p>
        ) : null}
      </aside>
    </form>
  );
}

/** Per-person account help for the owner: invite, login details, reset link, welcome email, temporary password. */
export function UserAccess({ id, invited }: { id: number; invited: boolean }) {
  const [open, setOpen] = useState<"" | "temp">("");
  const [linkState, linkAction] = useActionState<FormState, FormData>(invited ? resendInviteAction : sendResetLinkAction, {});
  const [loginState, loginAction] = useActionState<FormState, FormData>(emailLoginDetailsAction, {});
  const [welcomeState, welcomeAction] = useActionState<FormState, FormData>(sendWelcomeAction, {});
  const [tempState, tempAction] = useActionState<FormState, FormData>(resetUserPasswordAction, {});
  const linkClass = "inline-flex items-center gap-1 font-medium text-setu-dark hover:underline dark:text-[#5fd0ec]";
  return (
    <div className="mt-2 flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <form
          action={loginAction}
          onSubmit={(event) => {
            if (!window.confirm("Email new login details? Their current password stops working and they are signed out.")) event.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={id} />
          <button className={linkClass}>
            <KeyRound className="size-3.5" aria-hidden /> Email login details
          </button>
        </form>
        <form action={linkAction}>
          <input type="hidden" name="id" value={id} />
          <button className={linkClass}>
            <Link2 className="size-3.5" aria-hidden /> {invited ? "Resend invite" : "Send reset link"}
          </button>
        </form>
        <form action={welcomeAction}>
          <input type="hidden" name="id" value={id} />
          <button className={linkClass}>
            <PartyPopper className="size-3.5" aria-hidden /> Send welcome email
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
      {loginState.ok || loginState.error ? <LinkResult state={loginState} /> : null}
      {linkState.ok || linkState.error ? <LinkResult state={linkState} /> : null}
      {welcomeState.ok || welcomeState.error ? <FormMessage state={welcomeState} /> : null}
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
