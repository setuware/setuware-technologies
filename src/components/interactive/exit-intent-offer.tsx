"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Loader2, X } from "lucide-react";

import { EASE_OUT } from "@/components/motion/ease";
import { useReducedMotionSafe } from "@/components/motion/primitives";
import { Field, Honeypot, Input } from "@/components/ui/field";
import { postJson } from "@/lib/client-api";
import { usePersistentState, useScrollLock } from "@/lib/hooks";
import { site } from "@/lib/site";
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

/** What the free call covers; shown beside the form on wider screens. */
const INCLUDED = [
  { title: "Your goals and requirements", body: "We listen first, then suggest the simplest way to build it." },
  { title: "An honest recommendation", body: "Platform, features to launch with and what can wait." },
  { title: "A fixed-price proposal", body: "Written scope, timeline and price within a few working days." },
] as const;

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
            className="absolute inset-0 bg-[#05070d]/55 backdrop-blur-[4px]"
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
            className={cn(
              "relative grid max-h-[92dvh] w-full overflow-y-auto rounded-t-[1.75rem] bg-surface pb-[env(safe-area-inset-bottom)] shadow-[0_40px_100px_-30px_rgba(5,7,13,0.6)] outline-none ring-1 ring-black/5 dark:ring-white/10 sm:rounded-[1.75rem] sm:pb-0",
              status === "sent" ? "sm:max-w-[440px]" : "sm:max-w-[840px] md:grid-cols-[0.85fr_1fr]",
            )}
          >
            <div aria-hidden className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-border sm:hidden md:col-span-2" />

            <button
              type="button"
              onClick={dismiss}
              className="absolute right-3 top-3.5 z-10 inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-setu sm:right-4 sm:top-4"
              aria-label="Close offer"
            >
              <X className="size-4" aria-hidden />
            </button>

            {status === "sent" ? (
              <div className="px-6 py-10 text-center sm:px-8" role="status">
                <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-600 dark:text-emerald-400">
                  <Check className="size-6" aria-hidden />
                </span>
                <h2 id="audit-offer-title" className="mt-4 text-xl font-semibold tracking-tight text-foreground">
                  Thank you{firstName ? `, ${firstName}` : ""}
                </h2>
                <p id="audit-offer-description" className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  We have your enquiry and will contact you within one business day to arrange your free consultation.
                </p>
                <button
                  type="button"
                  onClick={dismiss}
                  className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-foreground px-7 text-sm font-medium text-background transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-setu"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                {/* What the call includes: dark panel on wider screens. */}
                <div className="relative isolate hidden overflow-hidden bg-[#05070d] p-8 text-white md:flex md:flex-col">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-20 -top-24 -z-10 size-72 rounded-full bg-[#2f56d8]/30 blur-3xl"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -bottom-28 -left-16 -z-10 size-64 rounded-full bg-[#3b82f6]/20 blur-3xl"
                  />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5fe0f7]">
                    Free consultation · 30 min
                  </p>
                  <p className="mt-6 font-display text-[1.65rem] font-semibold leading-[1.15] tracking-[-0.03em]">
                    Talk your idea through with us.
                  </p>
                  <ul className="mt-6 flex flex-col gap-4">
                    {INCLUDED.map((item, index) => (
                      <li key={item.title} className="flex gap-4 border-t border-white/10 pt-4 first:border-t-0 first:pt-0">
                        <span className="font-mono text-xs text-white/40">0{index + 1}</span>
                        <span>
                          <span className="block text-sm font-medium text-white">{item.title}</span>
                          <span className="mt-0.5 block text-[0.8rem] leading-relaxed text-white/60">{item.body}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto flex flex-col gap-1.5 border-t border-white/10 pt-5 text-[0.8rem] text-white/60">
                    <Link href="/book" onClick={close} className="inline-flex items-center gap-1.5 font-medium text-white hover:underline underline-offset-4">
                      Pick a time slot yourself
                      <ArrowRight className="size-3.5" aria-hidden />
                    </Link>
                    <span>
                    Prefer to call?{" "}
                    <a href={site.phoneHref} className="font-medium text-white underline-offset-4 hover:underline">
                      {site.phone}
                    </a>
                    </span>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-4 sm:px-8 sm:pb-7 sm:pt-8">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-setu-dark dark:text-[#5fe0f7] md:hidden">
                    Free 30-minute consultation
                  </p>
                  <h2
                    id="audit-offer-title"
                    className="mt-2 pr-10 text-[1.4rem] font-semibold leading-tight tracking-[-0.02em] text-foreground md:mt-0 md:text-2xl"
                  >
                    Book a free consultation
                  </h2>
                  <p id="audit-offer-description" className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    Leave your details and we will call you within one business day.{" "}
                    <Link href="/book" onClick={close} className="font-medium text-foreground underline underline-offset-4 md:hidden">
                      Or pick a time
                    </Link>
                  </p>

                  <form ref={formRef} onSubmit={onSubmit} noValidate className="mt-5 flex flex-col gap-3.5">
                    <Honeypot name={HONEYPOT} />
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
                      />
                    </Field>
                    <div className="grid gap-3.5 sm:grid-cols-2">
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
                        />
                      </Field>
                      <Field label="Phone" htmlFor="audit-phone" error={errors.phone}>
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
                          className="py-2.5 text-[0.95rem] shadow-none"
                        />
                      </Field>
                    </div>

                    <fieldset>
                      <legend className="mb-2 text-sm font-medium text-foreground">Topic</legend>
                      <div className="flex flex-wrap gap-1.5">
                        {SERVICES.map((service) => {
                          const selected = draft.service === service;
                          return (
                            <button
                              key={service}
                              type="button"
                              aria-pressed={selected}
                              onClick={() => set({ service: selected ? "" : service })}
                              className={cn(
                                "rounded-full border px-3 py-1.5 text-[0.8125rem] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-setu",
                                selected
                                  ? "border-foreground bg-foreground text-background"
                                  : "border-border bg-background text-foreground/80 hover:border-foreground/40 hover:text-foreground",
                              )}
                            >
                              {service}
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>

                    <Field label="Anything we should know?" htmlFor="audit-message">
                      <textarea
                        id="audit-message"
                        name="message"
                        rows={2}
                        value={draft.message}
                        onChange={(event) => set({ message: event.target.value })}
                        className="w-full resize-none rounded-xl border border-border bg-surface px-3.5 py-2.5 text-[0.95rem] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-setu focus:ring-2 focus:ring-setu/20"
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
                      className="mt-1 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground text-[0.95rem] font-semibold text-background transition-opacity duration-200 hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-setu disabled:opacity-60"
                    >
                      {status === "sending" ? (
                        <>
                          <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
                          Sending
                        </>
                      ) : (
                        <>
                          Request a call back
                          <ArrowRight className="size-4" aria-hidden />
                        </>
                      )}
                    </button>
                    <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
                      No obligation. See our{" "}
                      <Link href="/privacy" onClick={dismiss} className="underline underline-offset-2 hover:text-foreground">
                        privacy policy
                      </Link>
                      .{" "}
                      <button
                        type="button"
                        onClick={dismiss}
                        className="font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-setu"
                      >
                        No thanks
                      </button>
                    </p>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
