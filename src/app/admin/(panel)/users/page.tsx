import { updateUserAction, userSecurityAction } from "@/app/admin/actions";
import { can, listUsers } from "@/lib/cms/auth";
import { listRoles } from "@/lib/cms/rbac";
import { requireUser } from "@/lib/cms/session";
import { ShieldAlert, UserPlus } from "lucide-react";
import { SubmitButton } from "@/components/admin/form-bits";
import { AddUserForm, RemoveUser, UserAccess } from "@/components/admin/team-forms";
import { Avatar, Card, inputClass, PageHeader, timeAgo } from "@/components/admin/ui";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

function Pill({ tone, children }: { tone: "green" | "amber" | "red" | "slate" | "blue"; children: React.ReactNode }) {
  const tones = {
    green: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400",
    amber: "bg-amber-500/12 text-amber-700 dark:text-amber-300",
    red: "bg-red-500/10 text-red-700 dark:text-red-400",
    slate: "bg-slate-500/12 text-slate-600 dark:text-slate-300",
    blue: "bg-blue-500/12 text-blue-700 dark:text-blue-300",
  };
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${tones[tone]}`}>{children}</span>;
}

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ error?: string; removed?: string }> }) {
  const me = await requireUser("users");
  const { error, removed } = await searchParams;
  const users = listUsers();
  const roles = Object.fromEntries(listRoles().map((role) => [role.key, role.name]));
  const manage = can(me, "users.manage");
  const now = new Date().toISOString();
  const summary = [
    { label: "Members", value: users.length },
    { label: "Active", value: users.filter((user) => user.active && user.hasPassword).length },
    { label: "Invited", value: users.filter((user) => user.active && !user.hasPassword).length },
    { label: "Disabled", value: users.filter((user) => !user.active).length },
  ];

  return (
    <>
      <PageHeader
        title="Team"
        description="Who can sign in to the admin, what each person can open, and how their account is protected."
        actions={
          manage ? (
            <a href="#add-member" className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#2f56d8] px-4 text-sm font-semibold text-white hover:bg-[#2647b8]">
              <UserPlus className="size-4" aria-hidden /> Add member
            </a>
          ) : null
        }
      />
      {error === "last-owner" ? (
        <p className="mb-5 rounded-xl bg-amber-500/10 px-4 py-2.5 text-sm text-amber-700 dark:text-amber-300">There must always be at least one active owner.</p>
      ) : null}
      {error === "self" ? (
        <p className="mb-5 rounded-xl bg-amber-500/10 px-4 py-2.5 text-sm text-amber-700 dark:text-amber-300">You cannot remove your own account.</p>
      ) : null}
      {removed ? (
        <p role="status" className="mb-5 rounded-xl bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-700 dark:text-emerald-400">{removed} was removed from the admin.</p>
      ) : null}

      <dl className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {summary.map((item) => (
          <Card key={item.label} className="p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.label}</dt>
            <dd className="mt-1 text-2xl font-bold text-foreground">{item.value}</dd>
          </Card>
        ))}
      </dl>

      {!manage ? (
        <p className="mb-6 flex items-start gap-2 rounded-xl bg-blue-500/8 px-4 py-3 text-sm text-blue-800 dark:text-blue-300">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          Your role ({me.roleName}) can view the team but not add, change or remove members. Ask an owner to give your role the Team “Invite / manage” permission under Roles.
        </p>
      ) : null}

      {manage ? (
      <div id="add-member" className="scroll-mt-24">
      <Card className="mb-6 p-6">
        <h2 className="mb-1 font-semibold text-foreground">Add a team member</h2>
        <p className="mb-4 text-sm text-muted-foreground">Use their work email so emails they send from the admin come back to them.</p>
        <AddUserForm roles={roles} />
      </Card>
      </div>
      ) : null}

      <Card className="overflow-hidden">
        <ul className="divide-y divide-border">
          {users.map((user) => {
            const locked = Boolean(user.lockedUntil && user.lockedUntil > now);
            return (
              <li key={user.id} className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-start">
                <div className="flex min-w-0 flex-1 gap-3">
                  <Avatar name={user.name} />
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-1.5 font-semibold text-foreground">
                      {user.name}
                      {user.id === me.id ? <span className="text-xs font-normal text-muted-foreground">(you)</span> : null}
                      {!user.active ? <Pill tone="red">Disabled</Pill> : null}
                      {!user.hasPassword ? <Pill tone="blue">Invited</Pill> : null}
                      {user.mustChangePassword ? <Pill tone="amber">Temporary password</Pill> : null}
                      {locked ? <Pill tone="red">Locked</Pill> : null}
                      {user.twoFactor ? <Pill tone="green">2-step on</Pill> : <Pill tone="slate">2-step off</Pill>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.email} · {user.last_login_at ? `last sign-in ${timeAgo(user.last_login_at)}` : "never signed in"}
                    </p>
                    {manage && user.id !== me.id ? <UserAccess id={user.id} invited={!user.hasPassword} /> : null}
                    {manage && user.id !== me.id ? (
                      <div className="mt-2 flex flex-wrap gap-3 text-xs">
                        {locked ? (
                          <form action={userSecurityAction}>
                            <input type="hidden" name="id" value={user.id} />
                            <input type="hidden" name="op" value="unlock" />
                            <button className="font-medium text-muted-foreground hover:text-foreground">Unlock</button>
                          </form>
                        ) : null}
                        <form action={userSecurityAction}>
                          <input type="hidden" name="id" value={user.id} />
                          <input type="hidden" name="op" value="signout" />
                          <button className="font-medium text-muted-foreground hover:text-foreground">Sign out everywhere</button>
                        </form>
                        {user.twoFactor ? (
                          <form action={userSecurityAction}>
                            <input type="hidden" name="id" value={user.id} />
                            <input type="hidden" name="op" value="reset-2fa" />
                            <button className="font-medium text-muted-foreground hover:text-foreground">Reset 2-step (lost phone)</button>
                          </form>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
                {manage ? (
                <div className="flex flex-wrap items-center gap-2">
                <form action={updateUserAction} className="flex flex-wrap items-center gap-2">
                  <input type="hidden" name="id" value={user.id} />
                  <select name="role" defaultValue={user.role} aria-label={`Role for ${user.name}`} className={`${inputClass} w-auto py-1.5`}>
                    {Object.entries(roles).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <label className="flex items-center gap-1.5 text-sm text-foreground">
                    <input type="checkbox" name="active" defaultChecked={user.active} className="size-4 accent-[#2f56d8]" /> Can sign in
                  </label>
                  <SubmitButton variant="secondary" className="h-9 px-4">
                    Save
                  </SubmitButton>
                </form>
                {user.id !== me.id ? <RemoveUser id={user.id} name={user.name} /> : null}
                </div>
                ) : (
                  <span className="text-sm text-muted-foreground">{user.roleName}</span>
                )}
              </li>
            );
          })}
        </ul>
      </Card>
    </>
  );
}
