"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

import { buttonClass } from "./ui";

export function SubmitButton({
  children,
  pendingLabel = "Saving…",
  variant = "primary",
  name,
  value,
  className,
  onClick,
}: {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: keyof typeof buttonClass;
  name?: string;
  value?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" name={name} value={value} disabled={pending} onClick={onClick} className={cn(buttonClass[variant], className)}>
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function FormMessage({ state }: { state: { error?: string; ok?: string } }) {
  if (state.error) {
    return (
      <p role="alert" className="rounded-xl bg-red-500/8 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400">
        {state.error}
      </p>
    );
  }
  if (state.ok) {
    return (
      <p role="status" className="rounded-xl bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-700 dark:text-emerald-400">
        {state.ok}
      </p>
    );
  }
  return null;
}

export function Label({
  htmlFor,
  children,
  hint,
  error,
  counter,
}: {
  htmlFor: string;
  children: React.ReactNode;
  hint?: string;
  error?: string;
  counter?: { value: number; max: number };
}) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-3">
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {children}
        {hint ? <span className="ml-2 text-xs font-normal text-muted-foreground">{hint}</span> : null}
      </label>
      {counter ? (
        <span className={cn("text-xs tabular-nums", counter.value > counter.max ? "text-red-500" : "text-muted-foreground")}>
          {counter.value}/{counter.max}
        </span>
      ) : null}
      {error ? <span className="sr-only">{error}</span> : null}
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-xs font-medium text-red-500">{message}</p> : null;
}
