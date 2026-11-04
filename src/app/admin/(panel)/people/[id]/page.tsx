import Link from "next/link";
import { notFound } from "next/navigation";

import { can, getUser, listUsers } from "@/lib/cms/auth";
import { leaveBalance, localDay } from "@/lib/cms/attendance";
import { requireUser } from "@/lib/cms/session";
import { taskCounts } from "@/lib/cms/tasks";
import { ProfileForm } from "@/components/admin/work-forms";
import { Avatar, Card, formatDay, PageHeader } from "@/components/admin/ui";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const person = getUser(Number((await params).id));
  if (!person) notFound();
  const everyone = listUsers().filter((member) => member.active);
  const manage = can(user, "users.manage");
  const self = person.id === user.id;
  const manager = everyone.find((member) => member.id === person.managerId);
  const reports = everyone.filter((member) => member.managerId === person.id);
  const today = localDay();
  const managerOfThem = person.managerId === user.id;
  const showWork = self || manage || managerOfThem || can(user, "attendance");
  const counts = showWork ? taskCounts(person.id, today) : null;

  return (
    <>
      <PageHeader title={person.name} back={{ href: "/admin/people", label: "Team directory" }} />
      <div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <Card className="h-fit p-6 text-center">
          <div className="flex justify-center">
            <Avatar name={person.name} size="lg" />
          </div>
          <p className="mt-3 font-display text-lg font-semibold text-foreground">{person.name}</p>
          <p className="text-sm text-muted-foreground">{person.designation || person.roleName}</p>
          {person.department ? <p className="text-xs text-muted-foreground">{person.department}</p> : null}
          <dl className="mt-5 grid gap-3 border-t border-border pt-4 text-left text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Email</dt>
              <dd className="truncate text-foreground">{person.email}</dd>
            </div>
            {person.phone ? (
              <div>
                <dt className="text-xs text-muted-foreground">Phone</dt>
                <dd className="text-foreground">{person.phone}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-xs text-muted-foreground">Reports to</dt>
              <dd className="text-foreground">{manager ? <Link href={`/admin/people/${manager.id}`} className="hover:underline">{manager.name}</Link> : "—"}</dd>
            </div>
            {reports.length ? (
              <div>
                <dt className="text-xs text-muted-foreground">Team ({reports.length})</dt>
                <dd className="flex flex-wrap gap-x-2 text-foreground">
                  {reports.map((member) => (
                    <Link key={member.id} href={`/admin/people/${member.id}`} className="hover:underline">
                      {member.name}
                    </Link>
                  ))}
                </dd>
              </div>
            ) : null}
            {person.joinedOn ? (
              <div>
                <dt className="text-xs text-muted-foreground">Joined</dt>
                <dd className="text-foreground">{formatDay(person.joinedOn)}</dd>
              </div>
            ) : null}
            {person.birthday ? (
              <div>
                <dt className="text-xs text-muted-foreground">Birthday</dt>
                <dd className="text-foreground">
                  {new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${person.birthday}T00:00:00Z`))}
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="text-xs text-muted-foreground">Access</dt>
              <dd className="text-foreground">{person.roleName}</dd>
            </div>
          </dl>
        </Card>

        <div className="flex flex-col gap-6">
          {counts ? (
            <Card className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
              {[
                ["Open tasks", counts.open],
                ["Overdue", counts.overdue],
                ["To review", counts.toReview],
                ["Leave left", leaveBalance(person.id, today.slice(0, 4)).reduce((sum, item) => sum + item.left, 0)],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="font-display text-2xl font-semibold tabular-nums text-foreground">{value}</p>
                </div>
              ))}
            </Card>
          ) : null}
          {manage || self ? (
            <Card className="p-6">
              <h2 className="mb-4 text-sm font-semibold text-foreground">{manage ? "Profile" : "My profile"}</h2>
              <ProfileForm
                person={person}
                managers={everyone.map(({ id, name }) => ({ id, name }))}
                departments={[...new Set(everyone.map((member) => member.department).filter(Boolean))]}
                manage={manage}
              />
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
}
