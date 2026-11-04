import { redirect } from "next/navigation";

import { can, listUsers, seesAll } from "@/lib/cms/auth";
import { requireUser } from "@/lib/cms/session";
import { ProjectForm } from "@/components/admin/work-forms";
import { Card, PageHeader } from "@/components/admin/ui";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

export default async function NewProjectPage() {
  const user = await requireUser();
  if (!can(user, "tasks.assign") && !seesAll(user, "tasks")) redirect("/admin/projects");
  return (
    <>
      <PageHeader title="New project" back={{ href: "/admin/projects", label: "Projects" }} />
      <Card className="max-w-3xl p-6">
        <ProjectForm team={listUsers().filter((member) => member.active).map(({ id, name }) => ({ id, name }))} />
      </Card>
    </>
  );
}
