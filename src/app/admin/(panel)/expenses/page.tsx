import Link from "next/link";
import { ArrowRight, ReceiptText } from "lucide-react";

import { CancelClaimForm, ExpenseClaimForm } from "@/components/admin/expense-tools";
import { Card, Empty, PageHeader, Stat, StatusBadge } from "@/components/admin/ui";
import { can, reportIds } from "@/lib/cms/auth";
import { claimTotals, listClaims } from "@/lib/cms/expenses";
import { addDays, localDay } from "@/lib/cms/attendance";
import { requireUser } from "@/lib/cms/session";

export const instant = false;

const inr = (paise: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(paise / 100);

export default async function ExpensesPage() {
  const user = await requireUser();
  const today = localDay();
  const totals = claimTotals(user.id);
  const claims = listClaims({ userId: user.id });
  const canSeeTeam = can(user, "expenses") || reportIds(user.id).length > 0;
  return (
    <>
      <PageHeader title="My expenses" description="Submit and track your work-related expenses." actions={canSeeTeam ? <Link href="/admin/expenses/team" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2f56d8] hover:underline dark:text-[#8fb0ff]">Team expenses <ArrowRight className="size-4" aria-hidden /></Link> : null} />
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label="Pending" value={inr(totals.pending)} icon={<ReceiptText className="size-4" />} tone="amber" />
        <Stat label="Approved · awaiting payment" value={inr(totals.approvedUnpaid)} icon={<ReceiptText className="size-4" />} tone="teal" />
        <Stat label="Paid this year" value={inr(totals.paidThisYear)} icon={<ReceiptText className="size-4" />} tone="blue" />
      </div>
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.9fr)]">
        <ExpenseClaimForm today={today} earliest={addDays(today, -90)} />
        <Card className="overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-semibold text-foreground">Your claims</h2>
            <p className="mt-1 text-sm text-muted-foreground">Latest claims first.</p>
          </div>
          {claims.length ? (
            <ul className="divide-y divide-border">
              {claims.map((claim) => (
                <li key={claim.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-foreground">{claim.category} · {inr(claim.amount_paise)}</h3>
                      <StatusBadge status={claim.status} />
                    </div>
                    <p className="mt-1 break-words text-sm text-muted-foreground">{claim.spent_on} · {claim.description}</p>
                    {claim.decision_note ? <p className="mt-2 text-sm text-muted-foreground">Note: {claim.decision_note}</p> : null}
                    {claim.receipt_file ? <a href={`/admin/files/receipt/${claim.id}`} className="mt-2 inline-flex text-sm font-medium text-[#2f56d8] hover:underline dark:text-[#8fb0ff]">Download receipt</a> : null}
                  </div>
                  {claim.status === "pending" ? <CancelClaimForm id={claim.id} /> : null}
                </li>
              ))}
            </ul>
          ) : <div className="p-5"><Empty title="No expense claims yet">Your submitted claims will appear here.</Empty></div>}
        </Card>
      </div>
    </>
  );
}
