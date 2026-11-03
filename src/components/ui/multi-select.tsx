"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export interface MultiSelectOption<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

/**
 * Dropdown with checkboxes. The trigger summarises the selection; the panel
 * closes on outside click, Escape or "Done". Checkboxes are real inputs, so
 * labels, keyboard and screen readers work as usual.
 */
export function MultiSelect<T extends string>({
  id,
  options,
  value,
  onChange,
  placeholder = "Select",
  minOne = false,
  className,
}: {
  id?: string;
  options: readonly MultiSelectOption<T>[];
  value: readonly T[];
  onChange: (next: T[]) => void;
  placeholder?: string;
  /** Keep at least one option selected. */
  minOne?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const autoId = useId();
  const triggerId = id ?? `${autoId}-trigger`;
  const panelId = `${autoId}-panel`;

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = (option: T) => {
    if (value.includes(option)) {
      if (minOne && value.length === 1) return;
      onChange(value.filter((entry) => entry !== option));
    } else {
      onChange([...value, option]);
    }
  };

  const labels = options.filter((option) => value.includes(option.value)).map((option) => option.label);
  const summary =
    labels.length === 0
      ? placeholder
      : labels.length <= 2
        ? labels.join(", ")
        : `${labels.slice(0, 2).join(", ")} +${labels.length - 2}`;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-3 rounded-xl border bg-surface px-3.5 text-left text-[0.9rem] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-setu/40",
          open ? "border-setu" : "border-border hover:border-foreground/30",
        )}
      >
        <span className={cn("min-w-0 truncate", labels.length === 0 ? "text-muted-foreground" : "text-foreground")}>
          {summary}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {labels.length > 0 ? (
            <span className="rounded-full bg-setu/12 px-2 py-0.5 text-[11px] font-semibold text-setu-dark dark:text-[#5fe0f7]">
              {labels.length}
            </span>
          ) : null}
          <ChevronDown
            className={cn("size-4 text-muted-foreground transition-transform duration-200", open && "rotate-180")}
            aria-hidden
          />
        </span>
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-xl border border-border bg-surface shadow-[0_18px_40px_-16px_rgb(15_23_42/0.35)]"
      >
        <ul className="max-h-72 overflow-y-auto py-1.5">
          {options.map((option) => {
            const checked = value.includes(option.value);
            return (
              <li key={option.value}>
                <label className="flex cursor-pointer items-start gap-3 px-3.5 py-2.5 transition-colors hover:bg-foreground/[0.04] has-[:focus-visible]:bg-foreground/[0.05]">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(option.value)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden
                    className={cn(
                      "mt-0.5 inline-flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors",
                      checked ? "border-setu bg-setu text-white" : "border-foreground/25 bg-background",
                    )}
                  >
                    {checked ? <Check className="size-3" strokeWidth={3} /> : null}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.875rem] font-medium text-foreground">{option.label}</span>
                    {option.hint ? (
                      <span className="block text-xs leading-snug text-muted-foreground">{option.hint}</span>
                    ) : null}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center justify-between border-t border-border px-3.5 py-2">
          <button
            type="button"
            onClick={() => onChange(minOne && value.length > 0 ? [value[0]] : [])}
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              triggerRef.current?.focus();
            }}
            className="rounded-full bg-foreground px-3.5 py-1 text-xs font-semibold text-background hover:opacity-85"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

/** Native select with the site's field styling; the platform picker on phones. */
export function SelectField({
  id,
  value,
  onChange,
  children,
  className,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-border bg-surface pl-3.5 pr-10 text-[0.9rem] text-foreground transition-colors hover:border-foreground/30 focus:border-setu focus:outline-none focus:ring-2 focus:ring-setu/25"
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
    </div>
  );
}
