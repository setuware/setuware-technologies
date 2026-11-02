"use client";

import { useRef, useState } from "react";
import { Check, Loader2, Send } from "lucide-react";

import { postJson } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Honeypot, Input } from "@/components/ui/field";

type Status = "idle" | "sending" | "done" | "error";

export function NewsletterForm({ source = "site" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;

    setStatus("sending");
    setMessage("");

    const honeypot =
      (formRef.current?.elements.namedItem("newsletter-honeypot") as
        | HTMLInputElement
        | null)?.value ?? "";

    const result = await postJson<{ email: string }>("/api/newsletter", {
      email,
      source,
      honeypot,
    });

    if (result.ok) {
      setStatus("done");
      setMessage(result.message ?? "You're on the list.");
      setEmail("");
      return;
    }

    setStatus("error");
    setMessage(result.fields?.email ?? result.message);
  };

  if (status === "done") {
    return (
      <p
        className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400"
        role="status"
      >
        <Check className="size-4 shrink-0" aria-hidden />
        {message}
      </p>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="relative flex flex-col gap-1.5" noValidate>
      {/* One pill on wider screens: the field and the button share a border. */}
      <div className="flex flex-col gap-2 rounded-2xl sm:flex-row sm:items-center sm:gap-1 sm:rounded-full sm:border sm:border-border sm:bg-surface sm:p-1 sm:transition-[border-color,box-shadow] sm:focus-within:border-primary sm:focus-within:ring-4 sm:focus-within:ring-primary/15 sm:has-[[aria-invalid=true]]:border-red-500">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <Input
          id="newsletter-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="you@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={status === "error"}
          aria-describedby={status === "error" ? "newsletter-error" : undefined}
          disabled={status === "sending"}
          className="h-12 rounded-full px-5 sm:h-10 sm:border-0 sm:bg-transparent sm:px-4 sm:shadow-none! sm:focus:ring-0 sm:focus-visible:outline-none"
        />
        <Honeypot name="newsletter-honeypot" />
        <Button
          type="submit"
          disabled={status === "sending"}
          className="h-12 shrink-0 rounded-full bg-foreground px-5 font-semibold text-background shadow-none! hover:bg-foreground/85 motion-safe:hover:translate-y-0 sm:h-10 dark:hover:bg-foreground/85"
        >
          {status === "sending" ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Subscribing
            </>
          ) : (
            <>
              Subscribe
              <Send className="size-3.5" aria-hidden />
            </>
          )}
        </Button>
      </div>

      <p aria-live="polite" className="min-h-[1rem] px-1">
        {status === "error" ? (
          <span id="newsletter-error" className="text-xs font-medium text-red-600 dark:text-red-400">
            {message}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">You can unsubscribe at any time.</span>
        )}
      </p>
    </form>
  );
}
