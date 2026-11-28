"use client";

import { useActionState } from "react";

import { cancelClaimAction, decideClaimAction, markClaimPaidAction, submitClaimAction } from "@/app/admin/expense-actions";
import { EXPENSE_CATEGORIES } from "@/lib/cms/expense-types";

import { FormMessage, Label, SubmitButton } from "./form-bits";
import { buttonClass, Card, inputClass } from "./ui";
import type { FormState } from "@/app/admin/actions";

export function ExpenseClaimForm({ today, earliest }: { today: string; earliest: string }) {
  const [state, action] = useActionState<FormState, FormData>(submitClaimAction, {});
  return (
    <form action={action}>
      <Card className="flex flex-col gap-4 p-5">
        <div>
          <h2 className="text-base font-semibold text-foreground">Submit an expense</h2>
          <p className="mt-1 text-sm text-muted-foreground">Claims must be for the last 90 days. Receipts are private and optional.</p>
        </div>
        <FormMessage state={state} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="spent_on">Date spent</Label>
            <input id="spent_on" name="spent_on" type="date" min={earliest} max={today} required className={inputClass} />
          </div>
          <div>
            <Label htmlFor="expense-category">Category</Label>
            <select id="expense-category" name="category" required className={inputClass}>
              {EXPENSE_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="expense-amount">Amount (₹)</Label>
            <input id="expense-amount" name="amount" type="number" min="0.01" max="1000000" step="0.01" required className={inputClass} placeholder="0.00" />
          </div>
          <div>
            <Label htmlFor="receipt">Receipt <span className="text-xs font-normal text-muted-foreground">(PDF, JPG, PNG or WebP; max 5 MB)</span></Label>
            <input id="receipt" name="receipt" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" className={`${inputClass} file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium`} />
          </div>
        </div>
        <div>
          <Label htmlFor="expense-description">Description</Label>
          <textarea id="expense-description" name="description" rows={3} minLength={3} maxLength={300} required className={inputClass} placeholder="What was this expense for?" />
        </div>
        <div><SubmitButton>Submit claim</SubmitButton></div>
      </Card>
    </form>
  );
}

export function CancelClaimForm({ id }: { id: number }) {
  const [state, action] = useActionState<FormState, FormData>(cancelClaimAction, {});
  return (
    <form action={action} className="flex flex-col items-start gap-2">
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={buttonClass.secondary}>Cancel claim</button>
      <FormMessage state={state} />
    </form>
  );
}

export function ExpenseDecisionForm({ id }: { id: number }) {
  const [state, action] = useActionState<FormState, FormData>(decideClaimAction, {});
  return (
    <form action={action} className="flex min-w-48 flex-col gap-2">
      <input type="hidden" name="id" value={id} />
      <textarea name="note" rows={2} maxLength={1000} aria-label="Decision note" placeholder="Note (optional)" className={inputClass} />
      <div className="flex flex-wrap gap-2">
        <SubmitButton name="decision" value="approved" className="px-3 py-1.5 text-xs">Approve</SubmitButton>
        <SubmitButton name="decision" value="rejected" variant="secondary" className="px-3 py-1.5 text-xs">Reject</SubmitButton>
      </div>
      <FormMessage state={state} />
    </form>
  );
}

export function MarkClaimPaidForm({ id }: { id: number }) {
  const [state, action] = useActionState<FormState, FormData>(markClaimPaidAction, {});
  return (
    <form action={action} className="flex flex-col items-start gap-2">
      <input type="hidden" name="id" value={id} />
      <SubmitButton>Mark paid</SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}
