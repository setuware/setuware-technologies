"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Send } from "lucide-react";

import { postJson } from "@/lib/client-api";
import { usePersistentState } from "@/lib/hooks";
import type { ServiceKey } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { Field, Honeypot, Input, Select, Textarea } from "@/components/ui/field";

const STORAGE_KEY = "setuware.contact-draft.v1";

const BUDGETS = [
  { value: "", label: "To be confirmed" },
  { value: "under-1l", label: "Under ₹1,00,000" },
  { value: "1l-5l", label: "₹1,00,000–₹5,00,000" },
  { value: "5l-15l", label: "₹5,00,000–₹15,00,000" },
  { value: "15l-plus", label: "Above ₹15,00,000" },
] as const;

/**
 * Every service we sell, in the order a visitor scans for them. Values are the
 * service slugs so `?service=<slug>` links from service pages prefill the field
 * and the lead record matches the services catalogue.
 */
const SERVICE_OPTIONS: readonly { value: ServiceKey; label: string }[] = [
  { value: "business-websites", label: "Business website" },
  { value: "ecommerce-stores", label: "E-commerce store" },
  { value: "web-development", label: "Web application" },
  { value: "app-development", label: "Mobile app" },
  { value: "product-design", label: "UI/UX & branding" },
  { value: "seo-marketing", label: "SEO & digital marketing" },
  { value: "custom-software", label: "Custom software, ERP & CRM" },
  { value: "ai-integration", label: "AI & automation" },
  { value: "managed-hosting", label: "Hosting & domains" },
  { value: "support-maintenance", label: "Maintenance & support" },
];

const isServiceOption = (value: string | null): value is ServiceKey =>
  SERVICE_OPTIONS.some((option) => option.value === value);

interface Draft {
  name: string;
  email: string;
  company: string;
  phone: string;
  budget: string;
  service: string;
  message: string;
}

const EMPTY: Draft = {
  name: "",
  email: "",
  company: "",
  phone: "",
  budget: "",
  service: "",
  message: "",
};

type Status = "idle" | "sending" | "done" | "error";

/**
 * Project enquiry form.
 *
 * Two details that matter more than the markup: the draft is persisted on every
 * keystroke so a refresh or an accidental back never costs someone their brief,
 * and the submit timer plus honeypot filter out the automated submissions that
 * otherwise fill a public inbox.
 */
export function ContactForm() {
  const [draft, setDraft, { clear }] = usePersistentState<Draft>(STORAGE_KEY, EMPTY);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const mountedAt = useRef<number>(0);
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  // Prefill from the link that brought them here (`?service=` / `?intent=audit`).
  useEffect(() => {
    // Stamped on mount, not during render: the submit-timing spam check needs
    // a real mount time, and reading the clock while rendering is impure.
    mountedAt.current = Date.now();

    const params = new URLSearchParams(window.location.search);
    const service = params.get("service");
    const intent = params.get("intent");

    setDraft((previous) => ({
      ...previous,
      service: isServiceOption(service) && !previous.service ? service : previous.service,
      message:
        intent === "audit" && previous.message === ""
          ? "I would like a free performance audit of our current website. Our URL is: "
          : previous.message,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (patch: Partial<Draft>) => setDraft((previous) => ({ ...previous, ...patch }));

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;

    setStatus("sending");
    setErrors({});

    const honeypot =
      (formRef.current?.elements.namedItem("contact-honeypot") as HTMLInputElement | null)
        ?.value ?? "";

    const result = await postJson<{ reference: string }>("/api/contact", {
      ...draft,
      budget: draft.budget === "" ? undefined : draft.budget,
      consent,
      honeypot,
      elapsedMs: mountedAt.current === 0 ? 0 : Date.now() - mountedAt.current,
    });

    if (result.ok) {
      setStatus("done");
      setMessage(result.message ?? "Thank you. Your brief is with us.");
      clear();
      return;
    }

    setStatus("error");
    setMessage(result.message);
    setErrors(result.fields ?? {});
  };

  // The form collapses into a short confirmation; bring it into view so the
  // visitor is not left looking at whatever sat below the form.
  useEffect(() => {
    if (status !== "done") return;
    doneRef.current?.focus({ preventScroll: true });
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    doneRef.current?.scrollIntoView?.({ block: "center", behavior: reduce ? "auto" : "smooth" });
  }, [status]);

  if (status === "done") {
    return (
      <div
        ref={doneRef}
        tabIndex={-1}
        className="scroll-mt-28 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-7 text-center outline-none"
        role="status"
      >
        <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          <Check className="size-6" aria-hidden />
        </span>
        <h2 className="mt-4 text-xl font-semibold text-foreground">{message}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Our team will respond within one business day.
        </p>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="relative flex flex-col gap-4"
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" htmlFor="contact-name" required error={errors.name}>
          <Input
            id="contact-name"
            name="name"
            autoComplete="name"
            required
            placeholder="Priya Sharma"
            value={draft.name}
            onChange={(event) => set({ name: event.target.value })}
            aria-invalid={Boolean(errors.name)}
          />
        </Field>

        <Field label="Work email" htmlFor="contact-email" required error={errors.email}>
          <Input
            id="contact-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            placeholder="you@company.com"
            value={draft.email}
            onChange={(event) => set({ email: event.target.value })}
            aria-invalid={Boolean(errors.email)}
          />
        </Field>

        <Field label="Company" htmlFor="contact-company" error={errors.company}>
          <Input
            id="contact-company"
            name="company"
            autoComplete="organization"
            placeholder="Acme Pvt Ltd"
            value={draft.company}
            onChange={(event) => set({ company: event.target.value })}
          />
        </Field>

        <Field label="Phone" htmlFor="contact-phone" error={errors.phone}>
          <Input
            id="contact-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+91 98765 43210"
            value={draft.phone}
            onChange={(event) => set({ phone: event.target.value })}
            aria-invalid={Boolean(errors.phone)}
          />
        </Field>

        <Field label="Service required" htmlFor="contact-service" error={errors.service}>
          <Select
            id="contact-service"
            name="service"
            value={draft.service}
            onChange={(event) => set({ service: event.target.value })}
          >
            <option value="">Choose a service</option>
            {SERVICE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
            <option value="not-sure">Not sure yet</option>
          </Select>
        </Field>

        <Field label="Budget range" htmlFor="contact-budget" error={errors.budget}>
          <Select
            id="contact-budget"
            name="budget"
            value={draft.budget}
            onChange={(event) => set({ budget: event.target.value })}
          >
            {BUDGETS.map((budget) => (
              <option key={budget.value} value={budget.value}>
                {budget.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field
        label="About the project"
        htmlFor="contact-message"
        required
        error={errors.message}
        hint="Briefly describe your business, what you need and your preferred timeline."
      >
        <Textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          placeholder="For example: we run a chain of clinics and need a new website with online appointment booking."
          value={draft.message}
          onChange={(event) => set({ message: event.target.value })}
          aria-invalid={Boolean(errors.message)}
        />
      </Field>

      <label className="flex cursor-pointer items-start gap-2.5 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-1 size-4 shrink-0 accent-[var(--primary)]"
          aria-invalid={Boolean(errors.consent)}
          required
        />
        <span>
          I agree to Setuware Technologies contacting me about this enquiry, in accordance with the{" "}
          <a href="/privacy" className="text-primary underline underline-offset-2">
            privacy policy
          </a>
          .
        </span>
      </label>
      {errors.consent ? (
        <p role="alert" className="-mt-2 text-xs font-medium text-red-500">
          {errors.consent}
        </p>
      ) : null}

      <Honeypot name="contact-honeypot" />

      <Button type="submit" variant="gradient" size="lg" disabled={status === "sending"}>
        {status === "sending" ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Sending
          </>
        ) : (
          <>
            <Send className="size-4" aria-hidden />
            Send project brief
          </>
        )}
      </Button>

      <p aria-live="polite" className="min-h-[1.1rem]">
        {status === "error" ? (
          <span className="text-sm font-medium text-red-500">{message}</span>
        ) : (
          <span className="text-xs text-muted-foreground">
            Your draft is saved automatically in this browser.
          </span>
        )}
      </p>
    </form>
  );
}
