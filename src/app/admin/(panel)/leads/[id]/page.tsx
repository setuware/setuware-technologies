import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Phone } from "lucide-react";

import { can, listUsers, seesAll } from "@/lib/cms/auth";
import { listTemplates, timeline } from "@/lib/cms/crm";
import { enquiryForLead, getLead, leadStatuses } from "@/lib/cms/crm-leads";
import { requireUser } from "@/lib/cms/session";
import { LeadStatus } from "@/components/admin/lead-status";
import { AddNoteForm, EmailComposer, RecordPanel } from "@/components/admin/record-tools";
import { LinkedTasks } from "@/components/admin/linked-tasks";
import { Timeline } from "@/components/admin/timeline";
import { Avatar, buttonClass, Card, formatWhen, PageHeader } from "@/components/admin/ui";


// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser("leads");
  const { id } = await params;
  const lead = getLead(Number(id));
  if (!lead || (!seesAll(user, "leads") && lead.assignee !== user.name)) notFound();
  const digits = lead.phone.replace(/\D/g, "").replace(/^(\d{10})$/, "91$1");
  const team = listUsers().filter((member) => member.active).map((member) => member.name);
  const templates = listTemplates("enquiry").map(({ id: templateId, name, subject, body }) => ({ id: templateId, name, subject, body }));
  const enquiryId = enquiryForLead(lead.zoho_id);
  const editable = can(user, "leads.edit");
  const crmHost = (process.env.ZOHO_API_DOMAIN ?? "https://www.zohoapis.in").replace("www.zohoapis", "crm.zoho");

  return (
    <>
      <PageHeader
        title="Lead"
        back={{ href: "/admin/leads", label: "All leads" }}
        actions={
          <a href={`${crmHost}/crm/tab/Leads/${lead.zoho_id}`} target="_blank" rel="noreferrer" className={buttonClass.secondary}>
            <ExternalLink className="size-4" aria-hidden /> Open in Zoho
          </a>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card className="p-6">
            <div className="flex flex-wrap items-start gap-4">
              <Avatar name={lead.name} size="lg" />
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-xl font-semibold text-foreground">{lead.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {[lead.company, lead.source].filter(Boolean).join(" · ") || "Zoho CRM lead"} · created {formatWhen(lead.created_time)}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <LeadStatus status={lead.status} />
                  {lead.zoho_owner ? <span className="text-xs text-muted-foreground">Zoho owner: {lead.zoho_owner}</span> : null}
                  {enquiryId ? (
                    <Link href={`/admin/enquiries/${enquiryId}`} className="rounded-full bg-[#2f56d8]/10 px-2.5 py-1 text-[11px] font-semibold text-[#2f56d8] hover:underline dark:text-[#8fb0ff]">
                      From website enquiry
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
            <dl className="mt-5 grid gap-4 border-t border-border pt-5 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Email</dt>
                <dd className="font-medium text-foreground">{lead.email || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Phone</dt>
                <dd className="font-medium text-foreground">{lead.phone || "—"}</dd>
              </div>
            </dl>
            <div className="mt-5 flex flex-wrap gap-2">
              {lead.email && editable ? (
                <EmailComposer
                  entity="lead"
                  id={lead.id}
                  to={lead.email}
                  templates={templates}
                  values={{ first_name: lead.name.split(" ")[0], name: lead.name, service: "your project", sender: user.name }}
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

          {lead.description ? (
            <Card className="p-6">
              <h2 className="text-sm font-semibold text-foreground">Details from Zoho</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">{lead.description}</p>
            </Card>
          ) : null}

          <Card className="p-6">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Activity</h2>
            {editable ? <AddNoteForm entity="lead" id={lead.id} /> : null}
            <div className="mt-6">
              <Timeline notes={timeline("lead", lead.id)} received={lead.created_time} />
            </div>
          </Card>
        </div>
        <div className="flex flex-col gap-6">
        {editable ? (
          <Card className="h-fit p-5">
            <RecordPanel
              key={`${lead.status}:${lead.assignee}:${lead.follow_up_at}`}
              entity="lead"
              id={lead.id}
              status={lead.status}
              statuses={leadStatuses()}
              assignee={lead.assignee}
              team={team}
              followUp={lead.follow_up_at}
              canAssign={can(user, "leads.assign")}
            />
            <p className="mt-3 text-xs text-muted-foreground">Status, owner and notes are saved to Zoho CRM as well.</p>
          </Card>
        ) : null}
        <LinkedTasks user={user} entity="lead" id={lead.id} />
        </div>
      </div>
    </>
  );
}
