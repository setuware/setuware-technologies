import Link from "next/link";
import { Cake, PartyPopper, Trash2 } from "lucide-react";

import { deleteUpdateAction } from "@/app/admin/work-actions";
import { can, listUsers } from "@/lib/cms/auth";
import { localDay } from "@/lib/cms/attendance";
import { listUpdates, upcomingMoments } from "@/lib/cms/people";
import { requireUser } from "@/lib/cms/session";
import { UpdateComposer } from "@/components/admin/work-forms";
import { Avatar, Card, formatDay, PageHeader, timeAgo } from "@/components/admin/ui";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

export default async function UpdatesPage({ searchParams }: { searchParams: Promise<{ person?: string }> }) {
  const user = await requireUser();
  const manage = can(user, "users.manage");
  const everyone = listUsers().filter((member) => member.active);
  const personId = Number((await searchParams).person) || undefined;
  const updates = listUpdates({ userId: personId, limit: 60 });
  const today = localDay();
  const moments = upcomingMoments(everyone, today);
  const posted = new Set(listUpdates({ limit: 200 }).filter((update) => localDay(new Date(update.created_at)) === today).map((update) => update.user_id));

  return (
    <>
      <PageHeader title="Team updates" description="Short notes on what everyone is working on. Post yours at the end of the day." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-6">
          <Card className="p-5 sm:p-6">
            <div className="flex gap-3">
              <span className="hidden sm:block">
                <Avatar name={user.name} />
              </span>
              <div className="min-w-0 flex-1">
                <UpdateComposer />
              </div>
            </div>
          </Card>

          <form className="flex flex-wrap items-center gap-2">
            <label htmlFor="person" className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Show
            </label>
            <select id="person" name="person" defaultValue={personId ?? ""} className="h-9 rounded-lg border border-border bg-surface px-3 text-sm text-foreground">
              <option value="">Everyone</option>
              {everyone.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
            <button type="submit" className="h-9 rounded-lg border border-border px-3 text-sm font-semibold text-foreground hover:bg-muted">
              Filter
            </button>
          </form>

          {updates.length ? (
            <ul className="flex flex-col gap-4">
              {updates.map((update) => (
                <li key={update.id}>
                  <Card className="flex gap-3 p-5">
                    <Avatar name={update.name} />
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-baseline gap-x-2">
                        <Link href={`/admin/people/${update.user_id}`} className="text-sm font-semibold text-foreground hover:underline">
                          {update.name}
                        </Link>
                        {update.designation ? <span className="text-xs text-muted-foreground">{update.designation}</span> : null}
                        <span className="text-xs text-muted-foreground">· {timeAgo(update.created_at)}</span>
                      </p>
                      <p className="mt-1.5 whitespace-pre-line break-words text-sm leading-relaxed text-foreground">{update.body}</p>
                    </div>
                    {manage || update.user_id === user.id ? (
                      <form action={deleteUpdateAction}>
                        <input type="hidden" name="id" value={update.id} />
                        <button type="submit" aria-label="Delete update" className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-red-600">
                          <Trash2 aria-hidden className="size-4" />
                        </button>
                      </form>
                    ) : null}
                  </Card>
                </li>
              ))}
            </ul>
          ) : (
            <Card className="p-8 text-center text-sm text-muted-foreground">No updates yet. Be the first to post one.</Card>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-foreground">Posted today</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {posted.size} of {everyone.length} people
            </p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {everyone.map((member) => (
                <li key={member.id} className="flex items-center gap-2.5">
                  <Avatar name={member.name} size="sm" />
                  <Link href={`/admin/people/${member.id}`} className="min-w-0 flex-1 truncate text-sm text-foreground hover:underline">
                    {member.name}
                  </Link>
                  <span className={posted.has(member.id) ? "text-xs font-semibold text-emerald-600 dark:text-emerald-400" : "text-xs text-muted-foreground"}>
                    {posted.has(member.id) ? "Posted" : "Not yet"}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-foreground">Coming up</h2>
            <p className="mt-1 text-xs text-muted-foreground">Birthdays and work anniversaries in the next 30 days.</p>
            {moments.length ? (
              <ul className="mt-4 flex flex-col gap-3">
                {moments.map((moment) => (
                  <li key={`${moment.kind}-${moment.userId}`} className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      {moment.kind === "birthday" ? <Cake aria-hidden className="size-4" /> : <PartyPopper aria-hidden className="size-4" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <Link href={`/admin/people/${moment.userId}`} className="block truncate text-sm font-medium text-foreground hover:underline">
                        {moment.name}
                      </Link>
                      <span className="block text-xs text-muted-foreground">
                        {moment.kind === "birthday" ? "Birthday" : `${moment.years} year${moment.years === 1 ? "" : "s"} at Setuware`} · {moment.day === today ? "today" : formatDay(moment.day)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">Nothing in the next 30 days.</p>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
