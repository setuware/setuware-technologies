import { notFound } from "next/navigation";
import { Mail, Phone } from "lucide-react";

import { updateEnquiryAction } from "@/app/admin/actions";
import { requireUser } from "@/lib/cms/session";
import { ENQUIRY_STATUSES, getEnquiry } from "@/lib/cms/store";
import { StatusForm } from "@/components/admin/status-form";
import { buttonClass, Card, formatWhen, PageHeader, StatusBadge } from "@/components/admin/ui";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

export default async function EnquiryPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("enquiries");
  const { id } = await params;
  const item = getEnquiry(Number(id));
  if (!item) notFound();
  const digits = item.phone.replace(/\D/g, "").replace(/^(\d{10})$/, "91$1");

  return (
    <>
      <PageHeader
        title={item.name || item.email || "Website visitor"}
        description={`${item.source} · ${formatWhen(item.created_at)} · Ref ${item.reference}`}
        back={{ href: "/admin/enquiries", label: "All enquiries" }}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-6">
          <Card className="p-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={item.status} />
              {item.service ? <span className="text-sm text-muted-foreground">{item.service}</span> : null}
            </div>
            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
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
                <a href={`mailto:${item.email}?subject=${encodeURIComponent("Your enquiry with Setuware Technologies")}`} className={buttonClass.primary}>
                  <Mail className="size-4" aria-hidden /> Reply by email
                </a>
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
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-foreground">Message</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">{item.message || "No message."}</p>
          </Card>
        </div>
        <Card className="h-fit p-5">
          <StatusForm key={`${item.status}:${item.internal_notes}`} action={updateEnquiryAction} id={item.id} status={item.status} statuses={ENQUIRY_STATUSES} notes={item.internal_notes} />
        </Card>
      </div>
    </>
  );
}
