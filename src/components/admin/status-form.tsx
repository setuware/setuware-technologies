"use client";

import { useActionState } from "react";

import type { FormState } from "@/app/admin/actions";

import { FormMessage, SubmitButton } from "./form-bits";
import { inputClass } from "./ui";

/** Status + internal notes for an application or enquiry. */
export function StatusForm({
  action,
  id,
  status,
  statuses,
  notes,
}: {
  action: (state: FormState, form: FormData) => Promise<FormState>;
  id: number;
  status: string;
  statuses: readonly string[];
  notes: string;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(action, {});
  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={id} />
      <label htmlFor="status" className="text-sm font-medium text-foreground">
        Status
      </label>
      <select id="status" name="status" defaultValue={status} className={`${inputClass} capitalize`}>
        {statuses.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
      <label htmlFor="internal_notes" className="mt-1 text-sm font-medium text-foreground">
        Internal notes <span className="text-xs font-normal text-muted-foreground">only visible to the team</span>
      </label>
      <textarea id="internal_notes" name="internal_notes" rows={6} defaultValue={notes} className={inputClass} />
      <FormMessage state={state} />
      <SubmitButton>Save</SubmitButton>
    </form>
  );
}
