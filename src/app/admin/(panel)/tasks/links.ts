import type { AdminUser } from "@/lib/cms/auth";
import { can, listUsers, seesAll } from "@/lib/cms/auth";
import { getLead } from "@/lib/cms/crm-leads";
import { getApplication, getEnquiry } from "@/lib/cms/store";

/** A lead, enquiry or application a task is linked to, if the person may see it. */
export function linkedRecord(user: AdminUser, entity: string | null, id: number | null): { entity: string; id: number; label: string; href: string } | null {
  if (!entity || !id) return null;
  if (entity === "lead" && can(user, "leads")) {
    const lead = getLead(id);
    if (lead && (seesAll(user, "leads") || lead.assignee === user.name)) return { entity, id, label: `Lead: ${lead.name}`, href: `/admin/leads/${id}` };
  }
  if (entity === "enquiry" && can(user, "enquiries")) {
    const enquiry = getEnquiry(id);
    if (enquiry && (seesAll(user, "enquiries") || enquiry.assignee === user.name)) {
      return { entity, id, label: `Enquiry: ${enquiry.name || enquiry.email || "Visitor"}`, href: `/admin/enquiries/${id}` };
    }
  }
  if (entity === "application" && can(user, "applications")) {
    const application = getApplication(id);
    if (application && (seesAll(user, "applications") || application.assignee === user.name)) {
      return { entity, id, label: `Applicant: ${application.name} (${application.job_title})`, href: `/admin/applications/${id}` };
    }
  }
  return null;
}

/** Active people who may review work ("Review & approve work"). */
export function reviewerOptions(): { id: number; name: string }[] {
  return listUsers()
    .filter((member) => member.active && can(member, "tasks.review"))
    .map(({ id, name }) => ({ id, name }));
}
