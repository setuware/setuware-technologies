import Link from "next/link";
import { Cake, Mail, Phone } from "lucide-react";

import { listUsers } from "@/lib/cms/auth";
import { localDay, todayBoard } from "@/lib/cms/attendance";
import { requireUser } from "@/lib/cms/session";
import { Avatar, Card, inputClass, PageHeader } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

const STATE: Record<string, { label: string; dot: string }> = {
  in: { label: "Working", dot: "bg-emerald-500" },
  break: { label: "On break", dot: "bg-amber-500" },
  done: { label: "Done for the day", dot: "bg-sky-500" },
  leave: { label: "On leave", dot: "bg-violet-500" },
  off: { label: "Day off", dot: "bg-slate-400" },
  "not-in": { label: "Not in yet", dot: "bg-slate-300" },
};

export default async function PeoplePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireUser();
  const { q = "" } = await searchParams;
  const today = localDay();
  const everyone = listUsers().filter((member) => member.active);
  const board = new Map(todayBoard(everyone).map((row) => [row.userId, row]));
  const needle = q.trim().toLowerCase();
  const people = everyone.filter((member) => !needle || [member.name, member.designation, member.department, member.email, member.location, ...member.skills].some((value) => value.toLowerCase().includes(needle)));
  const departments = [...new Set(people.map((member) => member.department || "Other"))].sort((a, b) => (a === "Other" ? 1 : b === "Other" ? -1 : a.localeCompare(b)));
  const nameOf = (id: number | null) => everyone.find((member) => member.id === id)?.name;

  return (
    <>
      <PageHeader title="Team directory" description={`${everyone.length} people. Who does what, who they report to, and who’s in today.`} />
      <form className="mb-5">
        <input name="q" defaultValue={q} placeholder="Search by name, role, department, skill or email…" aria-label="Search people" className={`${inputClass} max-w-md`} />
      </form>
      {departments.map((department) => (
        <section key={department} className="mb-7">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            {department} · {people.filter((member) => (member.department || "Other") === department).length}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {people
              .filter((member) => (member.department || "Other") === department)
              .map((member) => {
                const state = STATE[board.get(member.id)?.state ?? "not-in"];
                const birthday = member.birthday?.slice(5) === today.slice(5);
                return (
                  <Card key={member.id} className="p-4">
                    <Link href={`/admin/people/${member.id}`} className="flex items-center gap-3">
                      <Avatar name={member.name} size="lg" />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5 truncate font-semibold text-foreground hover:underline">
                          {member.name}
                          {birthday ? <Cake className="size-4 text-pink-500" aria-label="Birthday today" /> : null}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">{member.designation || member.roleName}</span>
                        <span className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <span className={cn("size-1.5 rounded-full", state.dot)} aria-hidden /> {state.label}
                        </span>
                      </span>
                    </Link>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
                      <a href={`mailto:${member.email}`} className="inline-flex items-center gap-1 hover:text-foreground">
                        <Mail className="size-3" aria-hidden /> {member.email}
                      </a>
                      {member.phone ? (
                        <a href={`tel:${member.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1 hover:text-foreground">
                          <Phone className="size-3" aria-hidden /> {member.phone}
                        </a>
                      ) : null}
                      {member.managerId ? <span>Reports to {nameOf(member.managerId)}</span> : null}
                    </div>
                  </Card>
                );
              })}
          </div>
        </section>
      ))}
    </>
  );
}
