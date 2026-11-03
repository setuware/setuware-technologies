import { updateUserAction } from "@/app/admin/actions";
import { listUsers, ROLE_LABELS } from "@/lib/cms/auth";
import { requireUser } from "@/lib/cms/session";
import { SubmitButton } from "@/components/admin/form-bits";
import { AddUserForm, ResetPasswordForm } from "@/components/admin/team-forms";
import { Card, formatWhen, inputClass, PageHeader } from "@/components/admin/ui";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const me = await requireUser("users");
  const { error } = await searchParams;
  const users = listUsers();

  return (
    <>
      <PageHeader title="Team" description="Who can sign in to the admin, and what each person can open." />
      {error === "last-owner" ? (
        <p className="mb-5 rounded-xl bg-amber-500/10 px-4 py-2.5 text-sm text-amber-700 dark:text-amber-300">
          There must always be at least one active owner.
        </p>
      ) : null}
      <Card className="mb-6 overflow-hidden">
        <ul className="divide-y divide-border">
          {users.map((user) => (
            <li key={user.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">
                  {user.name}
                  {user.id === me.id ? <span className="ml-2 text-xs text-muted-foreground">(you)</span> : null}
                  {!user.active ? <span className="ml-2 text-xs font-semibold text-red-500">disabled</span> : null}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user.email} · last sign-in {user.last_login_at ? formatWhen(user.last_login_at) : "never"}
                </p>
                <ResetPasswordForm id={user.id} />
              </div>
              <form action={updateUserAction} className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="id" value={user.id} />
                <select name="role" defaultValue={user.role} aria-label={`Role for ${user.name}`} className={`${inputClass} w-auto py-1.5`}>
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-1.5 text-sm text-foreground">
                  <input type="checkbox" name="active" defaultChecked={user.active} className="size-4 accent-[#2f56d8]" /> Active
                </label>
                <SubmitButton variant="secondary" className="h-9 px-4">
                  Update
                </SubmitButton>
              </form>
            </li>
          ))}
        </ul>
      </Card>
      <Card className="p-5">
        <h2 className="mb-1 font-semibold text-foreground">Add a team member</h2>
        <p className="mb-4 text-sm text-muted-foreground">Share the email and temporary password with them; they can change it under My account.</p>
        <AddUserForm roles={ROLE_LABELS} />
      </Card>
    </>
  );
}
