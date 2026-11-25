"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { SubmitButton } from "./form-bits";
import { inputClass } from "./ui";

const OPS = [
  ["status", "Move to"],
  ["priority", "Set priority"],
  ["due", "Set due date"],
  ["assign", "Assign to"],
  ["delete", "Delete"],
] as const;

/**
 * Sits inside the task list's <form>: select-all, a count of ticked rows and
 * one change to apply to all of them. Row checkboxes are inputs named "ids".
 */
export function TaskBulkBar({ team, canAssign, me }: { team: { id: number; name: string }[]; canAssign: boolean; me: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [op, setOp] = useState<string>("status");

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
    ref.current
      ?.closest("form")
      ?.querySelectorAll<HTMLInputElement>('input[name="ids"]')
      .forEach((box) => {
        box.checked = checked;
      });
    setCount(checked ? total : 0);
  };

  const people = canAssign ? team : team.filter((member) => member.id === me);
  const field = cn(inputClass, "h-9 w-auto min-w-36 py-0");

  return (
    <div ref={ref} className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-3 sm:gap-3 sm:px-5">
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input type="checkbox" checked={total > 0 && count === total} onChange={(event) => toggleAll(event.target.checked)} className="size-4 accent-[#2f56d8]" aria-label="Select all" />
        {count ? <span className="font-semibold text-foreground">{count} selected</span> : "Select"}
      </label>
      {count ? (
        <div className="flex flex-wrap items-center gap-2">
          <select name="bulk_op" aria-label="Change" value={op} onChange={(event) => setOp(event.target.value)} className={field}>
            {OPS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {op === "status" ? (
            <select key="status" name="bulk_value" aria-label="Status" className={field}>
              <option value="todo">To do</option>
              <option value="in_progress">In progress</option>
              <option value="review">In review</option>
              <option value="done">Done</option>
            </select>
          ) : null}
          {op === "priority" ? (
            <select key="priority" name="bulk_value" aria-label="Priority" defaultValue="high" className={cn(field, "capitalize")}>
              {["urgent", "high", "normal", "low"].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          ) : null}
          {op === "due" ? <input key="due" name="bulk_value" type="date" aria-label="Due date" className={field} /> : null}
          {op === "assign" ? (
            <select key="assign" name="bulk_value" aria-label="Assign to" className={field}>
              {people.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.id === me ? `${member.name} (me)` : member.name}
                </option>
              ))}
              <option value="">Unassigned</option>
            </select>
          ) : null}
          <SubmitButton
            variant={op === "delete" ? "danger" : "secondary"}
            className="h-9 px-4"
            pendingLabel="Applying…"
            onClick={(event) => {
              if (op === "delete" && !window.confirm(`Delete ${count} ${count === 1 ? "task" : "tasks"}? This can't be undone.`)) event.preventDefault();
            }}
          >
            {op === "delete" ? "Delete" : "Apply"}
          </SubmitButton>
        </div>
      ) : null}
    </div>
  );
}
