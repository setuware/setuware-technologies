"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import { SubmitButton } from "./form-bits";
import { buttonClass } from "./ui";

/** Two-step delete: the first click asks, the second deletes. */
export function ConfirmDelete({
  action,
  id,
  label,
  what,
}: {
  action: (form: FormData) => Promise<void>;
  id: number;
  label: string;
  what: string;
}) {
  const [asking, setAsking] = useState(false);
  if (!asking) {
    return (
      <button type="button" onClick={() => setAsking(true)} className={buttonClass.danger}>
        <Trash2 className="size-4" aria-hidden /> {label}
      </button>
    );
  }
  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <span className="max-w-[16rem] truncate text-sm text-muted-foreground">Delete “{what}”?</span>
      <SubmitButton variant="danger" pendingLabel="Deleting…">
        Yes, delete
      </SubmitButton>
      <button type="button" onClick={() => setAsking(false)} className={buttonClass.secondary}>
        Cancel
      </button>
    </form>
  );
}
