import Link from "next/link";
import { Search } from "lucide-react";

import { can } from "@/lib/cms/auth";
import { search } from "@/lib/cms/crm";
import { requireUser } from "@/lib/cms/session";
import { Card, Empty, inputClass, PageHeader } from "@/components/admin/ui";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

const TONE: Record<string, string> = {
  Enquiry: "bg-blue-500/12 text-blue-700 dark:text-blue-300",
  Application: "bg-violet-500/12 text-violet-700 dark:text-violet-300",
  Post: "bg-teal-500/12 text-teal-700 dark:text-teal-300",
  Job: "bg-amber-500/12 text-amber-700 dark:text-amber-300",
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await requireUser();
  const { q = "" } = await searchParams;
  const areas = ["enquiries", "applications", "posts", "jobs"].filter((area) => can(user.role, area));
  const hits = q.trim().length >= 2 ? search(q.trim(), areas) : [];

  return (
    <>
      <PageHeader title="Search" description="Find any enquiry, applicant, post or job by name, email, phone or text." />
      <form className="relative mb-6">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <input name="q" defaultValue={q} autoFocus placeholder="Search everything…" aria-label="Search" className={`${inputClass} h-14 rounded-2xl pl-12 text-base`} />
      </form>
      {q.trim().length >= 2 ? (
        <Card className="overflow-hidden">
          {hits.length === 0 ? (
            <Empty title={`No results for “${q}”`}>Try a name, email, phone number or part of a message.</Empty>
          ) : (
            <ul className="divide-y divide-border">
              {hits.map((hit) => (
                <li key={hit.href}>
                  <Link href={hit.href} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-foreground/[0.03]">
                    <span className={`w-24 shrink-0 rounded-full px-2.5 py-1 text-center text-[11px] font-semibold ${TONE[hit.type]}`}>{hit.type}</span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-foreground">{hit.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">{hit.detail}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      ) : null}
    </>
  );
}
