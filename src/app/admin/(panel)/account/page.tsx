import { ROLE_LABELS } from "@/lib/cms/auth";
import { requireUser } from "@/lib/cms/session";
import { ChangePasswordForm } from "@/components/admin/team-forms";
import { Card, PageHeader } from "@/components/admin/ui";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

export default async function AccountPage() {
  const user = await requireUser();
  return (
    <>
      <PageHeader title="My account" description={`${user.name} · ${user.email} · ${ROLE_LABELS[user.role]}`} />
      <Card className="p-5">
        <h2 className="mb-4 font-semibold text-foreground">Change password</h2>
        <ChangePasswordForm />
      </Card>
    </>
  );
}
