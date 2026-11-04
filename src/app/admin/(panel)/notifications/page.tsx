import { Bell, CheckCheck } from "lucide-react";

import { markAllReadAction, openNotificationAction } from "@/app/admin/work-actions";
import { listNotifications } from "@/lib/cms/notifications";
import { requireUser } from "@/lib/cms/session";
import { buttonClass, Card, Empty, formatWhen, PageHeader, timeAgo } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

export default async function NotificationsPage() {
  const user = await requireUser();
  const items = listNotifications(user.id, 100);
  const unread = items.filter((item) => !item.read_at).length;
  return (
    <>
      <PageHeader
        title="Notifications"
        description="Assignments, reviews, approvals and reminders. They are also emailed when email is set up."
        actions={
          unread ? (
            <form action={markAllReadAction}>
              <button className={buttonClass.secondary}>
                <CheckCheck className="size-4" aria-hidden /> Mark all read
              </button>
            </form>
          ) : null
        }
      />
      <Card className="overflow-hidden">
        {items.length === 0 ? (
          <Empty title="Nothing yet">You’ll see task assignments, reviews, approvals and reminders here.</Empty>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li key={item.id}>
                <form action={openNotificationAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="link" value={item.link} />
                  <button className={cn("flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-foreground/[0.03]", !item.read_at && "bg-[#2f56d8]/[0.04]")}>
                    <span
                      className={cn(
                        "mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full",
                        item.kind === "celebration" ? "bg-pink-500/12 text-pink-600" : "bg-[#2f56d8]/10 text-[#2f56d8] dark:text-[#8fb0ff]",
                      )}
                    >
                      <Bell className="size-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cn("block text-sm text-foreground", !item.read_at && "font-semibold")}>{item.title}</span>
                      {item.body ? <span className="mt-0.5 block text-sm text-muted-foreground">{item.body}</span> : null}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground" title={formatWhen(item.created_at)}>
                      {timeAgo(item.created_at)}
                    </span>
                    {!item.read_at ? <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#2f56d8]" aria-label="Unread" /> : null}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
