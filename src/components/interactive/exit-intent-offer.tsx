"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, MessageSquareText, Phone, X } from "lucide-react";

import { EASE_OUT } from "@/components/motion/ease";
import { useReducedMotionSafe } from "@/components/motion/primitives";
import { Field, Honeypot, Input } from "@/components/ui/field";
import { postJson } from "@/lib/client-api";
import { usePersistentState, useScrollLock } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { contactSchema, fieldErrors } from "@/lib/validation";

import { isChatOpen } from "./chatbot/state";

const STORAGE_KEY = "setuware.audit-offer.v1";
const SUPPRESS_DAYS = 14;
const MOBILE_IDLE_MS = 28_000;
const MOBILE_SCROLL_THRESHOLD = 0.55;
const HONEYPOT = "audit-honeypot";


interface OfferState {
  dismissedAt: number | null;
  takenAt: number | null;
}

const INITIAL: OfferState = { dismissedAt: null, takenAt: null };

interface Draft {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
}

const EMPTY: Draft = { name: "", email: "", phone: "", service: "", message: "" };

/** Short labels for the service chips; sent as the enquiry's service. */
const SERVICES = [
  "Website",
  "E-commerce store",
  "Mobile app",
  "Custom software",
  "SEO & marketing",
  "Not sure yet",
] as const;

const TRUST = ["Free consultation", "Fixed-price quote", "Reply within one business day"] as const;

/**
 * Invites visitors who are about to leave to send a project enquiry.
 *
 * Trigger rules are deliberately conservative — showing this twice is worse
 * than never showing it:
 *  - desktop: pointer exits through the top of the viewport (an address-bar or
 *    tab-close gesture), after some engagement
 *  - touch: no exit event exists, so it waits for real scroll depth plus a
 *    pause in activity
 *  - either way: once per visitor per fortnight, and never again once taken
 *  - never while the visitor is talking to the assistant
 *
 * The request goes to the same `/api/contact` endpoint as the contact form,
 * as a regular enquiry (name, email, optional phone, service, message).
 */
export function ExitIntentOffer() {
  const [state, setState] = usePersistentState<OfferState>(STORAGE_KEY, INITIAL);
  const [open, setOpen] = useState(false);
  const shownThisSession = useRef(false);
  const openedAt = useRef(0);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const reduce = useReducedMotionSafe();

  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  useScrollLock(open);

  const close = () => {
    setOpen(false);
    window.requestAnimationFrame(() => restoreFocus.current?.focus?.());
  };

  const dismiss = () => {
    close();
    // A completed request already recorded `takenAt`; closing the thank-you
    // card must not overwrite it with a dismissal.
    if (status !== "sent") {
      setState((previous) => ({ ...previous, dismissedAt: Date.now() }));
    }
  };

  useEffect(() => {
    // Suppression is evaluated here rather than during render: comparing
    // against `Date.now()` while rendering is impure, and this only needs to
    // be decided once per mount anyway.
    const suppressed =
      state.takenAt !== null ||
      (state.dismissedAt !== null &&
        Date.now() - state.dismissedAt < SUPPRESS_DAYS * 86_400_000);

    if (suppressed) return;

    let idleTimer: number | undefined;
    let engaged = false;

    const show = () => {
      if (shownThisSession.current) return;
      // Never interrupt a conversation; a later exit gesture can still show it.
      if (isChatOpen()) return;
      shownThisSession.current = true;
      openedAt.current = Date.now();
      restoreFocus.current = document.activeElement as HTMLElement | null;
      setOpen(true);
    };

    const onMouseOut = (event: MouseEvent) => {
      // `relatedTarget` is null when the pointer leaves the document entirely.
      if (event.relatedTarget !== null) return;
      if (event.clientY > 12) return;
      if (!engaged) return;
      show();
    };

    const markEngaged = () => {
      engaged = true;
    };

    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      if (scrollable <= 0) return;
      const depth = doc.scrollTop / scrollable;
      if (depth > 0.2) engaged = true;

      if (depth > MOBILE_SCROLL_THRESHOLD) {
        window.clearTimeout(idleTimer);
        idleTimer = window.setTimeout(show, MOBILE_IDLE_MS);
      }
    };

    const engageTimer = window.setTimeout(markEngaged, 12_000);

    document.addEventListener("mouseout", onMouseOut);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.clearTimeout(engageTimer);
      window.clearTimeout(idleTimer);
      document.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("scroll", onScroll);
    };
  }, [state.takenAt, state.dismissedAt]);

  // Escape closes, Tab stays inside, and focus moves in when it appears. On
  // touch screens the sheet itself takes focus so the keyboard does not pop up
  // uninvited.
  useEffect(() => {
    if (!open) return;
    const coarse = window.matchMedia?.("(pointer: coarse)").matches ?? false;
    const frame = window.requestAnimationFrame(() => {
      if (coarse) dialogRef.current?.focus();
      else nameRef.current?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dismiss();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]',
        ),
      ).filter((element) => element.tabIndex >= 0);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === dialogRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = (patch: Partial<Draft>) => {
    setDraft((previous) => ({ ...previous, ...patch }));
    const [key] = Object.keys(patch);
    if (key && errors[key]) setErrors(({ [key]: _removed, ...rest }) => rest);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;

    const note = draft.message.trim();
    const honeypot =
      (formRef.current?.elements.namedItem(HONEYPOT) as HTMLInputElement | null)?.value ?? "";
    const payload = {
      name: draft.name,
      email: draft.email,
      phone: draft.phone.trim(),
      service: draft.service || undefined,
      message: [
        draft.service ? `Service: ${draft.service}.` : "",
        note || "Please contact me to discuss a project.",
        "(Sent from the website enquiry pop-up.)",
      ]
        .filter(Boolean)
        .join("\n\n"),
      consent: true as const,
      honeypot,
      elapsedMs: openedAt.current === 0 ? 0 : Date.now() - openedAt.current,
    };

    const local: Record<string, string> = {};
    const parsed = contactSchema.safeParse(payload);
    if (!parsed.success) Object.assign(local, fieldErrors(parsed.error));
    const visible = Object.fromEntries(
      Object.entries(local).filter(([key]) => key === "name" || key === "email" || key === "phone"),
    );
    if (Object.keys(visible).length > 0) {
      setErrors(visible);
      return;
    }

    setStatus("sending");
    setErrors({});
    const result = await postJson<{ reference: string }>("/api/contact", payload);

    if (result.ok) {
      setStatus("sent");
      setState((previous) => ({ ...previous, takenAt: Date.now() }));
      return;
    }

    setStatus("idle");
    setErrors({ ...(result.fields ?? {}), _form: result.message });
  };

  const firstName = draft.name.trim().split(/\s+/)[0] ?? "";

  return (
    <AnimatePresence>
      {open ? (
        <div
          key="audit-offer"
          className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6"
        >
          <motion.div
            className="absolute inset-0 bg-[#0b1020]/50 backdrop-blur-[3px]"
            onClick={dismiss}
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="audit-offer-title"
            aria-describedby="audit-offer-description"
            tabIndex={-1}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: reduce ? 0.15 : 0.5, ease: EASE_OUT }}
            className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-border bg-surface pb-[env(safe-area-inset-bottom)] shadow-[0_32px_80px_-20px_rgba(11,16,32,0.45)] outline-none sm:max-w-[460px] sm:rounded-3xl sm:pb-0"
          >
            {/* Brand accent: hairline gradient plus a soft wash behind the header. */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#00a1c6,var(--color-accent-400),var(--color-brand-500))]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(120%_100%_at_0%_0%,rgba(0,161,198,0.14),transparent_60%),radial-gradient(90%_90%_at_100%_0%,rgba(59,130,246,0.10),transparent_60%)]"
            />
            <div aria-hidden className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-border sm:hidden" />

            <button
              type="button"
              onClick={dismiss}
              className="absolute right-3 top-3.5 z-10 inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-setu sm:right-4 sm:top-4"
              aria-label="Close offer"
            >
              <X className="size-4" aria-hidden />
            </button>

            <div className="relative px-5 pb-5 pt-4 sm:px-7 sm:pb-6 sm:pt-7">
              {status === "sent" ? (
                <div className="py-4 text-center" role="status">
                  <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-6" aria-hidden />
                  </span>
                  <h2 id="audit-offer-title" className="mt-4 text-xl font-semibold tracking-tight text-foreground">
                    Thank you{firstName ? `, ${firstName}` : ""}
                  </h2>
                  <p id="audit-offer-description" className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                    Your enquiry has been received. Our team will contact you within one business day to arrange a free consultation.
                  </p>
                  <button
                    type="button"
                    onClick={dismiss}
                    className="mt-6 inline-flex h-11 items-center justify-center rounded-xl border border-border px-6 text-sm font-medium text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-setu"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 pr-10">
                    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#00a1c6,var(--color-brand-600))] text-white shadow-[0_8px_20px_-8px_rgba(0,161,198,0.8)]">
                      <MessageSquareText className="size-5" aria-hidden />
                    </span>
                    <span className="inline-flex items-center rounded-full border border-setu/25 bg-setu/8 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-setu-dark dark:text-[#5fe0f7]">
                      Free consultation
                    </span>
                  </div>

                  <h2
                    id="audit-offer-title"
                    className="mt-4 text-[1.4rem] font-semibold leading-tight tracking-tight text-foreground sm:text-2xl"
                  >
                    Planning a new project?
                  </h2>
                  <p id="audit-offer-description" className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Share a few details and our team will respond within one business day with recommendations and a fixed quote.
                  </p>

                  <form ref={formRef} onSubmit={onSubmit} noValidate className="relative mt-5 flex flex-col gap-3.5">
                    <Honeypot name={HONEYPOT} />
                    <div className="grid gap-3.5 sm:grid-cols-2">
                      <Field label="Name" htmlFor="audit-name" error={errors.name} required>
                        <Input
                          ref={nameRef}
                          id="audit-name"
                          name="name"
                          autoComplete="name"
                          value={draft.name}
                          onChange={(event) => set({ name: event.target.value })}
                          aria-invalid={Boolean(errors.name)}
                          aria-describedby={errors.name ? "audit-name-error" : undefined}
                          className="py-2.5 text-[0.95rem] shadow-none"
                          placeholder="Your name"
                        />
                      </Field>
                      <Field label="Email" htmlFor="audit-email" error={errors.email} required>
                        <Input
                          id="audit-email"
                          name="email"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          value={draft.email}
                          onChange={(event) => set({ email: event.target.value })}
                          aria-invalid={Boolean(errors.email)}
                          aria-describedby={errors.email ? "audit-email-error" : undefined}
                          className="py-2.5 text-[0.95rem] shadow-none"
                          placeholder="name@company.com"
                        />
                      </Field>
                    </div>
                    <Field label="Phone" htmlFor="audit-phone" error={errors.phone}>
                      <div className="relative">
                        <Phone
                          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                          aria-hidden
                        />
                        <Input
                          id="audit-phone"
                          name="phone"
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          value={draft.phone}
                          onChange={(event) => set({ phone: event.target.value })}
                          aria-invalid={Boolean(errors.phone)}
                          aria-describedby={errors.phone ? "audit-phone-error" : undefined}
                          className="py-2.5 pl-10 text-[0.95rem] shadow-none"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </Field>

                    <fieldset>
                      <legend className="mb-2 text-sm font-medium text-foreground">What do you need?</legend>
                      <div className="flex flex-wrap gap-2">
                        {SERVICES.map((service) => {
                          const selected = draft.service === service;
                          return (
                            <button
                              key={service}
                              type="button"
                              aria-pressed={selected}
                              onClick={() => set({ service: selected ? "" : service })}
                              className={cn(
                                "rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-setu",
                                selected
                                  ? "border-setu bg-setu text-white"
                                  : "border-border bg-surface text-foreground hover:border-setu/50 hover:text-setu",
                              )}
                            >
                              {service}
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>

                    <Field label="Project details" htmlFor="audit-message">
                      <textarea
                        id="audit-message"
                        name="message"
                        rows={3}
                        value={draft.message}
                        onChange={(event) => set({ message: event.target.value })}
                        className="w-full resize-none rounded-xl border border-border bg-surface px-3.5 py-2.5 text-[0.95rem] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-setu focus:ring-2 focus:ring-setu/20"
                        placeholder="A few lines about your business and what you would like to build."
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
                      className={cn(
                        "mt-1 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[0.95rem] font-semibold text-white",
                        "bg-[linear-gradient(100deg,#00a1c6,var(--color-accent-500)_50%,var(--color-brand-600))] shadow-[0_10px_24px_-10px_rgba(0,161,198,0.85)]",
                        "transition-[filter,translate] duration-200 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-setu motion-safe:hover:-translate-y-px disabled:opacity-70",
                      )}
                    >
                      {status === "sending" ? (
                        <>
                          <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
                          Sending enquiry
                        </>
                      ) : (
                        "Send enquiry"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={dismiss}
                      className="mx-auto -mt-1 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-setu"
                    >
                      No thanks
                    </button>
                  </form>

                  <ul className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 border-t border-border pt-4 text-xs font-medium text-muted-foreground">
                    {TRUST.map((item) => (
                      <li key={item} className="inline-flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-emerald-500" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground/90">
                    By sending an enquiry you agree to our{" "}
                    <Link href="/privacy" onClick={dismiss} className="underline underline-offset-2 hover:text-foreground">
                      privacy policy
                    </Link>
                    .
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
