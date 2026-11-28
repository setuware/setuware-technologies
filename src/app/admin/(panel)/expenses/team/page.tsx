import { Download } from "lucide-react";
import { redirect } from "next/navigation";

import { ExpenseDecisionForm, MarkClaimPaidForm } from "@/components/admin/expense-tools";
import { Avatar, Card, Empty, PageHeader, StatusBadge, inputClass } from "@/components/admin/ui";
import { getUser, listUsers, type AdminUser } from "@/lib/cms/auth";
import { localDay } from "@/lib/cms/attendance";
import { listClaims, type ExpenseClaim, type ExpenseStatus } from "@/lib/cms/expenses";
import { mayApproveFor, teamScope } from "@/lib/cms/notify";
import { requireUser } from "@/lib/cms/session";

export const instant = false;

const inr = (paise: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(paise / 100);
const STATUSES: ExpenseStatus[] = ["pending", "approved", "rejected", "paid", "cancelled"];

function ClaimRow({ claim, user }: { claim: ExpenseClaim; user: AdminUser }) {
  const person = getUser(claim.user_id);
  const canAct = mayApproveFor(user, claim.user_id, "expenses.approve");
  return (
    <li className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <Avatar name={person?.name ?? "Employee"} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-foreground">{person?.name ?? "Employee"} · {inr(claim.amount_paise)}</h3>
            <StatusBadge status={claim.status} />
          </div>
          <p className="mt-1 break-words text-sm text-muted-foreground">{claim.spent_on} · {claim.category} · {claim.description}</p>
          {claim.decision_note ? <p className="mt-1 text-sm text-muted-foreground">Note: {claim.decision_note}</p> : null}
          {claim.receipt_file ? <a href={`/admin/files/receipt/${claim.id}`} className="mt-2 inline-flex text-sm font-medium text-[#2f56d8] hover:underline dark:text-[#8fb0ff]">Download receipt</a> : null}
        </div>
      </div>
      {claim.status === "pending" && claim.user_id === user.id ? <span className="text-sm text-muted-foreground">Needs another approver</span> : null}
      {canAct && claim.status === "pending" && claim.user_id !== user.id ? <ExpenseDecisionForm id={claim.id} /> : null}
      {canAct && claim.status === "approved" ? <MarkClaimPaidForm id={claim.id} /> : null}
    </li>
  );
}

export default async function TeamExpensesPage({ searchParams }: { searchParams: Promise<{ month?: string; status?: string }> }) {
  const user = await requireUser();
  const scope = teamScope(user, "expenses");
  if (!scope.all && !scope.ids.length) redirect("/admin?denied=1");
  const params = await searchParams;
  const today = localDay();
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(params.month ?? "") ? (params.month as string) : today.slice(0, 7);
  const status = STATUSES.includes(params.status as ExpenseStatus) ? (params.status as ExpenseStatus) : "";
  const claims = listClaims({ month, status: status || undefined }).filter((claim) => scope.all || scope.ids.includes(claim.user_id));
  const pending = listClaims({ status: "pending" }).filter((claim) => scope.all || scope.ids.includes(claim.user_id));
  const approved = claims.filter((claim) => claim.status === "approved");
  const history = claims.filter((claim) => claim.status !== "pending" && claim.status !== "approved");
  const query = new URLSearchParams({ month, ...(status ? { status } : {}) }).toString();
  const monthTotals = claims.reduce((sum, claim) => sum + (claim.status === "pending" || claim.status === "approved" ? claim.amount_paise : 0), 0);
  const team = listUsers().filter((member) => member.active && (scope.all || scope.ids.includes(member.id)));
  return (
    <>
      <PageHeader title="Team expenses" description={scope.all ? "Review claims and record payments." : "Review claims submitted by your reports."} back={{ href: "/admin/expenses", label: "My expenses" }} actions={<a href={`/admin/files/export/expenses?${query}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2f56d8] hover:underline dark:text-[#8fb0ff]"><Download className="size-4" aria-hidden /> Export CSV</a>} />
      <Card className="mb-5 flex flex-col gap-4 p-4 sm:flex-row sm:items-end">
        <form method="get" className="grid flex-1 gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium text-foreground">Month<input name="month" type="month" defaultValue={month} className={`${inputClass} mt-1`} /></label>
          <label className="text-sm font-medium text-foreground">Status<select name="status" defaultValue={status} className={`${inputClass} mt-1`}><option value="">All statuses</option>{STATUSES.map((value) => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}</select></label>
          <button type="submit" className="rounded-xl bg-[#0b1020] px-4 py-2.5 text-sm font-semibold text-white sm:col-span-2 sm:justify-self-start dark:bg-white dark:text-[#0b1020]">Apply filters</button>
        </form>
        <div className="text-sm text-muted-foreground sm:text-right"><span className="font-semibold text-foreground">{team.length}</span> team members · {inr(monthTotals)} pending/approved this month</div>
      </Card>

      <section className="mb-6">
        <h2 className="mb-3 text-base font-semibold text-foreground">Pending approval <span className="text-muted-foreground">({pending.length})</span></h2>
        <Card className="overflow-hidden">
          {pending.length ? <ul className="divide-y divide-border">{pending.map((claim) => <ClaimRow key={claim.id} claim={claim} user={user} />)}</ul> : <div className="p-5"><Empty title="No pending claims">There are no pending claims for this filter.</Empty></div>}
        </Card>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-base font-semibold text-foreground">Approved · awaiting payment <span className="text-muted-foreground">({approved.length})</span></h2>
        <Card className="overflow-hidden">
          {approved.length ? <ul className="divide-y divide-border">{approved.map((claim) => <ClaimRow key={claim.id} claim={claim} user={user} />)}</ul> : <div className="p-5"><Empty title="No payments to record">Approved claims waiting for payment will appear here.</Empty></div>}
        </Card>
      </section>

      {history.length ? <section>
        <h2 className="mb-3 text-base font-semibold text-foreground">Claim history <span className="text-muted-foreground">({history.length})</span></h2>
        <Card className="overflow-hidden"><ul className="divide-y divide-border">{history.map((claim) => <ClaimRow key={claim.id} claim={claim} user={user} />)}</ul></Card>
      </section> : null}
    </>
  );
}
