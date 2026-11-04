import { notFound } from "next/navigation";
import { CalendarClock, Phone } from "lucide-react";

import { listUsers, seesAll } from "@/lib/cms/auth";
import { listTemplates, timeline } from "@/lib/cms/crm";
import { requireUser } from "@/lib/cms/session";
import { ENQUIRY_STATUSES, getEnquiry } from "@/lib/cms/store";
import { AddNoteForm, EmailComposer, RecordPanel } from "@/components/admin/record-tools";
import { LinkedTasks } from "@/components/admin/linked-tasks";
import { Timeline } from "@/components/admin/timeline";
import { Avatar, buttonClass, Card, formatWhen, PageHeader, StatusBadge } from "@/components/admin/ui";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

export default async function EnquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser("enquiries");
  const { id } = await params;
  const item = getEnquiry(Number(id));
  if (!item || (!seesAll(user, "enquiries") && item.assignee !== user.name)) notFound();
  const digits = item.phone.replace(/\D/g, "").replace(/^(\d{10})$/, "91$1");
  const name = item.name || item.email || "Website visitor";
  const team = listUsers().filter((member) => member.active).map((member) => member.name);
  const templates = listTemplates("enquiry").map(({ id: templateId, name: templateName, subject, body }) => ({ id: templateId, name: templateName, subject, body }));
  const today = new Date().toISOString().slice(0, 10);
  const overdue = item.follow_up_at && item.follow_up_at <= today && !["won", "lost", "spam"].includes(item.status);

  return (
    <>
      <PageHeader title="Enquiry" back={{ href: "/admin/enquiries", label: "All enquiries" }} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card className="p-6">
            <div className="flex flex-wrap items-start gap-4">
              <Avatar name={name} size="lg" />
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-xl font-semibold text-foreground">{name}</h2>
                <p className="text-sm text-muted-foreground">
                  {item.source} · {formatWhen(item.created_at)} · Ref {item.reference}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusBadge status={item.status} />
                  {item.service ? <span className="rounded-full bg-foreground/[0.05] px-2.5 py-1 text-[11px] font-semibold text-foreground/80">{item.service}</span> : null}
                  {item.assignee ? <span className="text-xs text-muted-foreground">Owner: {item.assignee}</span> : null}
                  {overdue ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-600 dark:text-red-400">
                      <CalendarClock className="size-3" aria-hidden /> Follow-up due
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            <dl className="mt-5 grid gap-4 border-t border-border pt-5 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Email</dt>
                <dd className="font-medium text-foreground">{item.email || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Phone</dt>
                <dd className="font-medium text-foreground">{item.phone || "—"}</dd>
              </div>
            </dl>
            <div className="mt-5 flex flex-wrap gap-2">
              {item.email ? (
                <EmailComposer
                  entity="enquiry"
                  id={item.id}
                  to={item.email}
                  templates={templates}
                  values={{ first_name: name.split(" ")[0], name, service: item.service.toLowerCase() || "your project", sender: user.name }}
                />
              ) : null}
              {digits ? (
                <>
                  <a href={`tel:+${digits}`} className={buttonClass.secondary}>
                    <Phone className="size-4" aria-hidden /> Call
                  </a>
                  <a href={`https://wa.me/${digits}`} target="_blank" rel="noreferrer" className={buttonClass.secondary}>
                    WhatsApp
                  </a>
                </>
              ) : null}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-semibold text-foreground">Their message</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">{item.message || "No message."}</p>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Activity</h2>
            <AddNoteForm entity="enquiry" id={item.id} />
            <div className="mt-6">
              <Timeline notes={timeline("enquiry", item.id)} legacyNote={item.internal_notes || undefined} received={item.created_at} />
            </div>
          </Card>
        </div>
        <div className="flex flex-col gap-6">
          <Card className="h-fit p-5">
          <RecordPanel
            key={`${item.status}:${item.assignee}:${item.follow_up_at}`}
            entity="enquiry"
            id={item.id}
            status={item.status}
            statuses={ENQUIRY_STATUSES}
            assignee={item.assignee}
            team={team}
            followUp={item.follow_up_at}
          />
        </Card>
          <LinkedTasks user={user} entity="enquiry" id={item.id} />
        </div>
      </div>
    </>
  );
}
