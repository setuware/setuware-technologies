import { deleteTemplateAction } from "@/app/admin/actions";
import { listTemplates } from "@/lib/cms/crm";
import { requireUser } from "@/lib/cms/session";
import { SubmitButton } from "@/components/admin/form-bits";
import { TemplateForm } from "@/components/admin/settings-forms";
import { Card, PageHeader, timeAgo } from "@/components/admin/ui";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

export default async function TemplatesPage() {
  await requireUser("templates");
  const templates = listTemplates();

  return (
    <>
      <PageHeader title="Email templates" description="Ready-made replies for enquiries and applicants. Pick one in the email composer, then edit before sending." />
      <div className="flex flex-col gap-5">
        {templates.map((template) => (
          <Card key={template.id} className="p-5">
            <details>
              <summary className="flex cursor-pointer list-none items-center gap-3 [&::-webkit-details-marker]:hidden">
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    template.audience === "enquiry" ? "bg-blue-500/12 text-blue-700 dark:text-blue-300" : "bg-violet-500/12 text-violet-700 dark:text-violet-300"
                  }`}
                >
                  {template.audience === "enquiry" ? "Enquiries" : "Applicants"}
                </span>
                <span className="flex-1 font-semibold text-foreground">{template.name}</span>
                <span className="text-xs text-muted-foreground">Edited {timeAgo(template.updated_at)}</span>
              </summary>
              <div className="mt-4 border-t border-border pt-4">
                <TemplateForm template={template} />
                <form action={deleteTemplateAction} className="mt-3">
                  <input type="hidden" name="id" value={template.id} />
                  <SubmitButton variant="danger" className="h-8 px-3 text-xs" pendingLabel="Deleting…">
                    Delete template
                  </SubmitButton>
                </form>
              </div>
            </details>
          </Card>
        ))}
        <Card className="p-5">
          <h2 className="mb-3 font-semibold text-foreground">New template</h2>
          <TemplateForm />
        </Card>
      </div>
    </>
  );
}
