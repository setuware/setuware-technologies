"use client";

import { useRef, useState } from "react";
import { Check, FileUp, Loader2, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Field, Honeypot, Input } from "@/components/ui/field";

/** Application form on each role page: details plus a CV (PDF or Word, 5 MB). */
export function ApplyForm({ jobSlug, jobTitle }: { jobSlug: string; jobTitle: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const mountedAt = useRef(0);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;
    const form = new FormData(event.currentTarget);
    form.set("job", jobSlug);
    form.set("elapsedMs", String(mountedAt.current ? Date.now() - mountedAt.current : 5000));

    const local: Record<string, string> = {};
    if (String(form.get("name") ?? "").trim().length < 2) local.name = "Tell us your name";
    if (!/^\S+@\S+\.\S+$/.test(String(form.get("email") ?? ""))) local.email = "Enter your email address";
    if (String(form.get("phone") ?? "").replace(/\D/g, "").length < 7) local.phone = "Enter a phone number we can call";
    const file = form.get("resume");
    if (!(file instanceof File) || file.size === 0) local.resume = "Please attach your CV (PDF or Word).";
    else if (file.size > 5 * 1024 * 1024) local.resume = "Files must be under 5 MB.";
    if (Object.keys(local).length) {
      setErrors(local);
      return;
    }

    setStatus("sending");
    setErrors({});
    try {
      const response = await fetch("/api/apply", { method: "POST", body: form });
      const payload = (await response.json().catch(() => null)) as
        | { message?: string; error?: { message?: string; fields?: Record<string, string> } }
        | null;
      if (response.ok) {
        setMessage(payload?.message ?? "Application received.");
        setStatus("done");
        return;
      }
      setErrors({ ...(payload?.error?.fields ?? {}), _form: payload?.error?.message ?? "Something went wrong. Please try again." });
    } catch {
      setErrors({ _form: "The connection dropped. Please try again." });
    }
    setStatus("idle");
  };

  if (status === "done") {
    return (
      <div className="mt-5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-5 text-center" role="status">
        <span className="mx-auto inline-flex size-10 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          <Check className="size-5" aria-hidden />
        </span>
        <p className="mt-3 text-sm font-medium text-foreground">{message}</p>
        <p className="mt-1 text-xs text-muted-foreground">We reply to every application within five working days.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      onFocus={() => {
        if (!mountedAt.current) mountedAt.current = Date.now();
      }}
      noValidate
      className="mt-5 flex flex-col gap-3.5"
      aria-label={`Apply for ${jobTitle}`}
    >
      <Honeypot name="honeypot" />
      <Field label="Full name" htmlFor="apply-name" required error={errors.name}>
        <Input id="apply-name" name="name" autoComplete="name" aria-invalid={Boolean(errors.name)} />
      </Field>
      <Field label="Email" htmlFor="apply-email" required error={errors.email}>
        <Input id="apply-email" name="email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} />
      </Field>
      <Field label="Phone" htmlFor="apply-phone" required error={errors.phone}>
        <Input id="apply-phone" name="phone" type="tel" autoComplete="tel" aria-invalid={Boolean(errors.phone)} />
      </Field>
      <Field label="LinkedIn, GitHub or portfolio" htmlFor="apply-links" error={errors.links}>
        <Input id="apply-links" name="links" placeholder="https://" />
      </Field>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-foreground">
          CV <span className="ml-0.5 text-red-500" aria-hidden>*</span>
        </span>
        <label
          htmlFor="apply-resume"
          className={cn(
            "flex cursor-pointer items-center gap-3 rounded-xl border border-dashed px-4 py-3.5 text-sm transition-colors hover:border-setu/60 hover:bg-setu/[0.04] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-setu/40",
            errors.resume ? "border-red-500/70" : "border-border",
          )}
        >
          <FileUp className="size-5 shrink-0 text-setu" aria-hidden />
          <span className="min-w-0 flex-1 truncate">
            {fileName ? (
              <span className="font-medium text-foreground">{fileName}</span>
            ) : (
              <span className="text-muted-foreground">Upload PDF or Word, up to 5 MB</span>
            )}
          </span>
          {fileName ? (
            <button
              type="button"
              aria-label="Remove file"
              onClick={(event) => {
                event.preventDefault();
                if (fileRef.current) fileRef.current.value = "";
                setFileName("");
              }}
              className="rounded-full p-1 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
            >
              <X className="size-4" aria-hidden />
            </button>
          ) : null}
          <input
            ref={fileRef}
            id="apply-resume"
            name="resume"
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="sr-only"
            onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")}
          />
        </label>
        {errors.resume ? (
          <p role="alert" className="text-xs font-medium text-red-500">
            {errors.resume}
          </p>
        ) : null}
      </div>

      <Field label="Anything else? (notice period, location)" htmlFor="apply-note" error={errors.note}>
        <textarea
          id="apply-note"
          name="note"
          rows={3}
          className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-[0.95rem] text-foreground outline-none transition-colors focus:border-primary focus:ring-4 focus:ring-primary/15"
        />
      </Field>

      {errors._form ? (
        <p role="alert" className="rounded-lg bg-red-500/8 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400">
          {errors._form}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-1 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(100deg,#2f56d8,#1477c0_55%,#3b6cf6)] text-[0.95rem] font-semibold text-white transition-[filter] hover:brightness-110 disabled:opacity-60"
      >
        {status === "sending" ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Sending application
          </>
        ) : (
          "Submit application"
        )}
      </button>
    </form>
  );
}
