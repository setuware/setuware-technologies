import { notFound } from "next/navigation";
import { FileDown, Mail, Phone } from "lucide-react";

import { updateApplicationAction } from "@/app/admin/actions";
import { requireUser } from "@/lib/cms/session";
import { APPLICATION_STATUSES, getApplication } from "@/lib/cms/store";
import { StatusForm } from "@/components/admin/status-form";
import { buttonClass, Card, formatWhen, PageHeader, StatusBadge } from "@/components/admin/ui";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

export default async function ApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("applications");
  const { id } = await params;
  const item = getApplication(Number(id));
  if (!item) notFound();
  const links = item.links.split(/[\s,]+/).filter((link) => /^https?:\/\//i.test(link));

  return (
    <>
      <PageHeader title={item.name} description={`${item.job_title} · applied ${formatWhen(item.created_at)}`} back={{ href: "/admin/applications", label: "All applications" }} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-6">
          <Card className="p-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={item.status} />
              <span className="text-sm text-muted-foreground">for {item.job_title}</span>
            </div>
            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Email</dt>
                <dd>
                  <a href={`mailto:${item.email}`} className="font-medium text-foreground hover:underline">
                    {item.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Phone</dt>
                <dd>
                  <a href={`tel:${item.phone.replace(/[^\d+]/g, "")}`} className="font-medium text-foreground hover:underline">
                    {item.phone}
                  </a>
                </dd>
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
              {item.resume_file ? (
                <a href={`/admin/files/resume/${item.id}`} className={buttonClass.primary}>
                  <FileDown className="size-4" aria-hidden /> Download CV
                </a>
              ) : null}
              <a href={`mailto:${item.email}?subject=${encodeURIComponent(`Your application for ${item.job_title}`)}`} className={buttonClass.secondary}>
                <Mail className="size-4" aria-hidden /> Email
              </a>
              <a href={`https://wa.me/${item.phone.replace(/\D/g, "").replace(/^(\d{10})$/, "91$1")}`} target="_blank" rel="noreferrer" className={buttonClass.secondary}>
                <Phone className="size-4" aria-hidden /> WhatsApp
              </a>
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-foreground">Note from the candidate</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">{item.note || "No note."}</p>
            {item.resume_name ? <p className="mt-4 text-xs text-muted-foreground">CV file: {item.resume_name}</p> : null}
          </Card>
        </div>
        <Card className="h-fit p-5">
          <StatusForm key={`${item.status}:${item.internal_notes}`} action={updateApplicationAction} id={item.id} status={item.status} statuses={APPLICATION_STATUSES} notes={item.internal_notes} />
        </Card>
      </div>
    </>
  );
}
