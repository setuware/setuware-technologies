"use client";

import { useEffect, useRef, useState } from "react";

import { SubmitButton } from "./form-bits";
import { inputClass } from "./ui";

/**
 * Sits inside a list's <form>: select-all, a count of ticked rows and a
 * status to apply to all of them. Row checkboxes are plain inputs named "ids".
 */
export function BulkBar({ statuses }: { statuses: readonly string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const form = ref.current?.closest("form");
    if (!form) return;
    const boxes = () => [...form.querySelectorAll<HTMLInputElement>('input[name="ids"]')];
    const update = () => {
      setTotal(boxes().length);
      setCount(boxes().filter((box) => box.checked).length);
    };
    update();
    form.addEventListener("change", update);
    return () => form.removeEventListener("change", update);
  }, []);

  const toggleAll = (checked: boolean) => {
    const form = ref.current?.closest("form");
    form?.querySelectorAll<HTMLInputElement>('input[name="ids"]').forEach((box) => {
      box.checked = checked;
    });
    setCount(checked ? total : 0);
  };

  return (
    <div ref={ref} className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3">
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={total > 0 && count === total}
          onChange={(event) => toggleAll(event.target.checked)}
          className="size-4 accent-[#2f56d8]"
          aria-label="Select all"
        />
        {count ? <span className="font-semibold text-foreground">{count} selected</span> : "Select"}
      </label>
      {count ? (
        <div className="flex items-center gap-2">
          <select name="bulk_status" aria-label="New status" defaultValue="" className={`${inputClass} w-auto py-1.5 capitalize`}>
            <option value="" disabled>
              Change status to…
            </option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <SubmitButton variant="secondary" className="h-9 px-4" pendingLabel="Applying…">
            Apply
          </SubmitButton>
        </div>
      ) : null}
    </div>
  );
}
