import { cookies } from "next/headers";
import QRCode from "qrcode";
import { Laptop, ShieldCheck, Smartphone } from "lucide-react";

import { revokeSessionAction, startTwoFactorAction } from "@/app/admin/actions";
import { listSessions, otpauthUrl, recoveryCodesLeft, ROLE_LABELS, SESSION_COOKIE } from "@/lib/cms/auth";
import { getDb } from "@/lib/cms/db";
import { requireUser } from "@/lib/cms/session";
import { SubmitButton } from "@/components/admin/form-bits";
import { ChangePasswordForm, TwoFactorConfirm, TwoFactorDisable } from "@/components/admin/team-forms";
import { Avatar, Card, formatWhen, PageHeader, timeAgo } from "@/components/admin/ui";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

function describeDevice(agent: string | null): { label: string; mobile: boolean } {
  const ua = agent ?? "";
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser";
  const os = /iPhone|iPad/.test(ua) ? "iPhone/iPad" : /Android/.test(ua) ? "Android" : /Mac OS X/.test(ua) ? "Mac" : /Windows/.test(ua) ? "Windows" : /Linux/.test(ua) ? "Linux" : "Unknown device";
  return { label: `${browser} on ${os}`, mobile: /iPhone|iPad|Android/.test(ua) };
}

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ required?: string }> }) {
  const user = await requireUser(undefined, { allowPasswordChange: true });
  const { required } = await searchParams;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const sessions = listSessions(user.id, token);
  const pending = getDb().prepare("SELECT totp_secret FROM users WHERE id = ?").get(user.id) as { totp_secret: string | null };
  const setup = !user.twoFactor && pending.totp_secret ? pending.totp_secret : null;
  const qr = setup ? await QRCode.toDataURL(otpauthUrl(setup, user.email), { margin: 1, width: 352 }) : null;

  return (
    <>
      <PageHeader title="My account" />
      {required || user.mustChangePassword ? (
        <p className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-800 dark:text-amber-300">
          You signed in with a temporary password. Choose your own password to continue.
        </p>
      ) : null}

      <Card className="mb-6 flex items-center gap-4 p-5">
        <Avatar name={user.name} size="lg" />
        <div>
          <p className="font-semibold text-foreground">{user.name}</p>
          <p className="text-sm text-muted-foreground">
            {user.email} · {ROLE_LABELS[user.role]}
          </p>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 font-semibold text-foreground">Change password</h2>
          <ChangePasswordForm />
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className={user.twoFactor ? "size-5 text-emerald-500" : "size-5 text-muted-foreground"} aria-hidden />
            <h2 className="font-semibold text-foreground">2-step verification</h2>
            <span
              className={`ml-auto rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                user.twoFactor ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400" : "bg-slate-500/12 text-slate-600 dark:text-slate-300"
              }`}
            >
              {user.twoFactor ? "On" : "Off"}
            </span>
          </div>
          {user.twoFactor ? (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                Sign-in asks for a code from your authenticator app. {recoveryCodesLeft(user.id)} recovery codes left.
              </p>
              <TwoFactorDisable />
            </>
          ) : setup && qr ? (
            <TwoFactorConfirm qr={qr} secret={setup} />
          ) : (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                Protect your account even if your password leaks: after the password, sign-in asks for a 6-digit code from an app on your phone.
              </p>
              <form action={startTwoFactorAction}>
                <SubmitButton pendingLabel="Preparing…">Set up 2-step verification</SubmitButton>
              </form>
            </>
          )}
        </Card>
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 pb-2 pt-5">
          <div>
            <h2 className="font-semibold text-foreground">Where you&apos;re signed in</h2>
            <p className="text-sm text-muted-foreground">Sign out any device you don&apos;t recognise.</p>
          </div>
          {sessions.length > 1 ? (
            <form action={revokeSessionAction}>
              <input type="hidden" name="all" value="1" />
              <SubmitButton variant="secondary" pendingLabel="Signing out…">
                Sign out all other devices
              </SubmitButton>
            </form>
          ) : null}
        </div>
        <ul className="divide-y divide-border px-2 pb-2">
          {sessions.map((session) => {
            const deviceInfo = describeDevice(session.user_agent);
            return (
              <li key={session.id} className="flex items-center gap-4 rounded-xl px-4 py-3">
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-foreground/[0.05] text-muted-foreground">
                  {deviceInfo.mobile ? <Smartphone className="size-5" aria-hidden /> : <Laptop className="size-5" aria-hidden />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-foreground">
                    {deviceInfo.label}
                    {session.current ? <span className="ml-2 rounded-full bg-emerald-500/12 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">This device</span> : null}
                  </span>
                  <span className="block text-xs text-muted-foreground" title={formatWhen(session.created_at)}>
                    {session.ip ?? "Unknown IP"} · active {timeAgo(session.last_seen_at ?? session.created_at)}
                  </span>
                </span>
                {!session.current ? (
                  <form action={revokeSessionAction}>
                    <input type="hidden" name="session" value={session.id} />
                    <SubmitButton variant="secondary" className="h-8 px-3 text-xs" pendingLabel="…">
                      Sign out
                    </SubmitButton>
                  </form>
                ) : null}
              </li>
            );
          })}
        </ul>
      </Card>
    </>
  );
}
