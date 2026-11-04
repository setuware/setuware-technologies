import { Download } from "lucide-react";

import { deleteSubscriberAction } from "@/app/admin/actions";
import { listSubscribers } from "@/lib/cms/crm";
import { requireUser } from "@/lib/cms/session";
import { SubmitButton } from "@/components/admin/form-bits";
import { Avatar, buttonClass, Card, Empty, formatWhen, inputClass, PageHeader, theadClass, timeAgo } from "@/components/admin/ui";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

export default async function SubscribersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireUser("subscribers");
  const { q = "" } = await searchParams;
  const items = listSubscribers(q || undefined);

  return (
    <>
      <PageHeader
        title="Newsletter subscribers"
        description={`${items.length} ${items.length === 1 ? "person has" : "people have"} signed up from the website. Export for Zoho Campaigns or any email tool.`}
        actions={
          // eslint-disable-next-line @next/next/no-html-link-for-pages -- a CSV download (route handler), not a page
          <a href="/admin/files/export/subscribers" className={buttonClass.secondary}>
            <Download className="size-4" aria-hidden /> Export CSV
          </a>
        }
      />
      <form className="mb-4 flex gap-2">
        <input name="q" defaultValue={q} placeholder="Search email…" className={`${inputClass} max-w-xs`} />
        <button className={buttonClass.secondary}>Search</button>
      </form>
      <Card className="overflow-hidden">
        {items.length === 0 ? (
          <Empty title="No subscribers yet">Sign-ups from the footer and blog appear here.</Empty>
        ) : (
          <table className="w-full text-sm">
            <thead className={theadClass}>
              <tr>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="hidden px-5 py-3 font-medium sm:table-cell">Source</th>
                <th className="hidden px-5 py-3 font-medium sm:table-cell">Joined</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-foreground/[0.03]">
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-3">
                      <Avatar name={item.email} size="sm" />
                      <span className="font-medium text-foreground">{item.email}</span>
                    </span>
                  </td>
                  <td className="hidden px-5 py-3 text-muted-foreground sm:table-cell">{item.source || "website"}</td>
                  <td className="hidden px-5 py-3 text-muted-foreground sm:table-cell" title={formatWhen(item.created_at)}>
                    {timeAgo(item.created_at)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <form action={deleteSubscriberAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <SubmitButton variant="secondary" className="h-8 px-3 text-xs" pendingLabel="…">
                        Remove
                      </SubmitButton>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
