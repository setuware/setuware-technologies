import { ShieldCheck } from "lucide-react";

import { deleteRoleAction } from "@/app/admin/actions";
import { listRoles, PERMISSION_GROUPS, roleInUse } from "@/lib/cms/rbac";
import { requireUser } from "@/lib/cms/session";
import { SubmitButton } from "@/components/admin/form-bits";
import { RoleEditor } from "@/components/admin/role-editor";
import { Card, PageHeader } from "@/components/admin/ui";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

export default async function RolesPage() {
  await requireUser("roles.manage");
  const roles = listRoles();

  return (
    <>
      <PageHeader
        title="Roles & access"
        description="Decide exactly what each role can see and do. Everyone can always use their own tasks, check in and out, and request leave. People get a role on the Team page; changes apply on their next click."
      />
      <div className="flex flex-col gap-5">
        {roles.map((role) => {
          const members = roleInUse(role.key);
          return (
            <Card key={role.key} className="p-5">
              <details>
                <summary className="flex cursor-pointer list-none items-center gap-3 [&::-webkit-details-marker]:hidden">
                  <span className="inline-flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#2f56d8] to-[#0a8ea6] text-white">
                    <ShieldCheck className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-foreground">{role.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{role.description || "No description"}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {members} {members === 1 ? "person" : "people"} · {role.permissions.includes("*") ? "full access" : role.permissions.length ? `${role.permissions.length} permissions` : "own tasks & attendance"}
                  </span>
                </summary>
                <div className="mt-5 border-t border-border pt-5">
                  {role.key === "owner" ? (
                    <p className="text-sm text-muted-foreground">The Owner role is built in and always has full access, including team, roles and settings.</p>
                  ) : (
                    <>
                      <RoleEditor groups={PERMISSION_GROUPS} role={role} />
                      {members === 0 ? (
                        <form action={deleteRoleAction} className="mt-3">
                          <input type="hidden" name="key" value={role.key} />
                          <SubmitButton variant="danger" className="h-8 px-3 text-xs" pendingLabel="Deleting…">
                            Delete role
                          </SubmitButton>
                        </form>
                      ) : (
                        <p className="mt-3 text-xs text-muted-foreground">Move its {members} member(s) to another role before deleting it.</p>
                      )}
                    </>
                  )}
                </div>
              </details>
            </Card>
          );
        })}
        <Card className="p-6">
          <h2 className="mb-4 font-semibold text-foreground">Create a role</h2>
          <RoleEditor groups={PERMISSION_GROUPS} />
        </Card>
      </div>
    </>
  );
}
