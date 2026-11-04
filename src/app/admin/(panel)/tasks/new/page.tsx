import { can, listUsers, seesAll } from "@/lib/cms/auth";
import { requireUser } from "@/lib/cms/session";
import { taskProjects } from "@/lib/cms/tasks";
import { NewTaskForm } from "@/components/admin/task-tools";
import { Card, PageHeader } from "@/components/admin/ui";

import { linkedRecord } from "../links";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

export default async function NewTaskPage({ searchParams }: { searchParams: Promise<{ entity?: string; id?: string }> }) {
  const user = await requireUser();
  const { entity = null, id } = await searchParams;
  const link = linkedRecord(user, entity, Number(id) || null);
  const team = listUsers()
    .filter((member) => member.active)
    .map(({ id: memberId, name }) => ({ id: memberId, name }));
  return (
    <>
      <PageHeader title="New task" back={link ? { href: link.href, label: link.label } : { href: "/admin/tasks", label: "Tasks" }} />
      <Card className="max-w-3xl p-6">
        <NewTaskForm
          team={team}
          me={{ id: user.id, name: user.name }}
          canAssign={can(user, "tasks.assign") || seesAll(user, "tasks")}
          projects={taskProjects()}
          link={link ? { entity: link.entity, id: link.id, label: link.label } : null}
        />
      </Card>
    </>
  );
}
