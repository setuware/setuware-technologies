import { notFound } from "next/navigation";
import { CalendarClock, FileDown, Phone, Star } from "lucide-react";

import { listUsers, seesAll } from "@/lib/cms/auth";
import { listTemplates, timeline } from "@/lib/cms/crm";
import { requireUser } from "@/lib/cms/session";
import { APPLICATION_STATUSES, getApplication } from "@/lib/cms/store";
import { AddNoteForm, EmailComposer, RecordPanel } from "@/components/admin/record-tools";
import { LinkedTasks } from "@/components/admin/linked-tasks";
import { Timeline } from "@/components/admin/timeline";
import { Avatar, buttonClass, Card, formatWhen, PageHeader, StatusBadge } from "@/components/admin/ui";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

export default async function ApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser("applications");
  const { id } = await params;
  const item = getApplication(Number(id));
  if (!item || (!seesAll(user, "applications") && item.assignee !== user.name)) notFound();
  const links = item.links.split(/[\s,]+/).filter((link) => /^https?:\/\//i.test(link));
  const team = [...new Set(listUsers().filter((member) => member.active).map((member) => member.name))];
  const templates = listTemplates("application").map(({ id: templateId, name, subject, body }) => ({ id: templateId, name, subject, body }));
  const digits = item.phone.replace(/\D/g, "").replace(/^(\d{10})$/, "91$1");

  return (
    <>
      <PageHeader title="Application" back={{ href: "/admin/applications", label: "All applications" }} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card className="p-6">
            <div className="flex flex-wrap items-start gap-4">
              <Avatar name={item.name} size="lg" />
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-xl font-semibold text-foreground">{item.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {item.job_title} · applied {formatWhen(item.created_at)}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusBadge status={item.status} />
                  {item.rating ? (
                    <span className="inline-flex items-center gap-0.5" aria-label={`${item.rating} of 5`}>
                      {Array.from({ length: 5 }, (_, index) => (
                        <Star key={index} className={index < (item.rating ?? 0) ? "size-3.5 fill-amber-400 text-amber-400" : "size-3.5 text-foreground/15"} aria-hidden />
                      ))}
                    </span>
                  ) : null}
                  {item.interview_at ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
                      <CalendarClock className="size-3" aria-hidden /> Interview {formatWhen(item.interview_at)}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            <dl className="mt-5 grid gap-4 border-t border-border pt-5 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Email</dt>
                <dd className="font-medium text-foreground">{item.email}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Phone</dt>
                <dd className="font-medium text-foreground">{item.phone}</dd>
              </div>
              {links.length ? (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-muted-foreground">Links</dt>
                  <dd className="flex flex-col gap-1">
                    {links.map((link) => (
                      <a key={link} href={link} target="_blank" rel="noopener noreferrer" className="truncate font-medium text-setu-dark hover:underline dark:text-[#5fd0ec]">
                        {link}
                      </a>
                    ))}
                  </dd>
                </div>
              ) : null}
            </dl>
            <div className="mt-5 flex flex-wrap gap-2">
              <EmailComposer
                entity="application"
                id={item.id}
                to={item.email}
                templates={templates}
                values={{ first_name: item.name.split(" ")[0], name: item.name, job: item.job_title, sender: user.name }}
              />
              {item.resume_file ? (
                <a href={`/admin/files/resume/${item.id}`} className={buttonClass.secondary}>
                  <FileDown className="size-4" aria-hidden /> Download CV
                </a>
              ) : null}
              <a href={`https://wa.me/${digits}`} target="_blank" rel="noreferrer" className={buttonClass.secondary}>
                <Phone className="size-4" aria-hidden /> WhatsApp
              </a>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-semibold text-foreground">Note from the candidate</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">{item.note || "No note."}</p>
            {item.resume_name ? <p className="mt-4 text-xs text-muted-foreground">CV file: {item.resume_name}</p> : null}
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Activity</h2>
            <AddNoteForm entity="application" id={item.id} />
            <div className="mt-6">
              <Timeline notes={timeline("application", item.id)} legacyNote={item.internal_notes || undefined} received={item.created_at} />
            </div>
          </Card>
        </div>
        <div className="flex flex-col gap-6">
          <Card className="h-fit p-5">
          <RecordPanel
            version={`${item.status}:${item.assignee}:${item.rating}:${item.interview_at}`}
            entity="application"
            id={item.id}
            status={item.status}
            statuses={APPLICATION_STATUSES}
            assignee={item.assignee}
            team={team}
            rating={item.rating}
            interview={item.interview_at}
          />
        </Card>
          <LinkedTasks user={user} entity="application" id={item.id} />
        </div>
      </div>
    </>
  );
}
