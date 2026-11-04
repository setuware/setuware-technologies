import Link from "next/link";
import { Plus } from "lucide-react";

import { seesAll, type AdminUser } from "@/lib/cms/auth";
import { localDay } from "@/lib/cms/attendance";
import { listTasks, STATUS_LABELS, type LinkedEntity } from "@/lib/cms/tasks";
import { cn } from "@/lib/utils";

import { Card } from "./ui";

/** Tasks linked to a lead, enquiry or application, with "Add task". */
export function LinkedTasks({ user, entity, id }: { user: AdminUser; entity: LinkedEntity; id: number }) {
  const tasks = listTasks({ entity, entityId: id, oldDone: true, visibleTo: seesAll(user, "tasks") ? undefined : user.id });
  const today = localDay();
  return (
    <Card className="h-fit p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Tasks</h2>
        <Link href={`/admin/tasks/new?entity=${entity}&id=${id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-[#2f56d8] hover:underline dark:text-[#8fb0ff]">
          <Plus className="size-3.5" aria-hidden /> Add task
        </Link>
      </div>
      {tasks.length ? (
        <ul className="mt-3 flex flex-col divide-y divide-border text-sm">
          {tasks.map((task) => (
            <li key={task.id} className="py-2">
              <Link href={`/admin/tasks/${task.id}`} className={cn("font-medium hover:underline", task.status === "done" ? "text-muted-foreground line-through" : "text-foreground")}>
                {task.title}
              </Link>
              <p className="text-xs text-muted-foreground">
                {STATUS_LABELS[task.status]}
                {task.assignee_name ? ` · ${task.assignee_name}` : ""}
                {task.due_date && task.status !== "done" ? (
                  <span className={task.due_date < today ? "font-semibold text-red-600 dark:text-red-400" : ""}> · due {task.due_date}</span>
                ) : null}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">No tasks yet. Add one to plan the next step.</p>
      )}
    </Card>
  );
}
