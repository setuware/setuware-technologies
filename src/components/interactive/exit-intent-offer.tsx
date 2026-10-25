"use client";

import { useEffect, useRef, useState } from "react";
import { Gauge, X } from "lucide-react";

import { usePersistentState } from "@/lib/hooks";
import { ButtonLink } from "@/components/ui/button";

const STORAGE_KEY = "setuware.audit-offer.v1";
const SUPPRESS_DAYS = 14;
const MOBILE_IDLE_MS = 28_000;
const MOBILE_SCROLL_THRESHOLD = 0.55;

interface OfferState {
  dismissedAt: number | null;
  takenAt: number | null;
}

const INITIAL: OfferState = { dismissedAt: null, takenAt: null };

/**
 * Offers a free performance audit to visitors who are about to leave.
 *
 * Trigger rules are deliberately conservative — showing this twice is worse
 * than never showing it:
 *  - desktop: pointer exits through the top of the viewport (an address-bar or
 *    tab-close gesture), after some engagement
 *  - touch: no exit event exists, so it waits for real scroll depth plus a
 *    pause in activity
 *  - either way: once per visitor per fortnight, and never again once taken
 */
export function ExitIntentOffer() {
  const [state, setState] = usePersistentState<OfferState>(STORAGE_KEY, INITIAL);
  const [open, setOpen] = useState(false);
  const shownThisSession = useRef(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const dismiss = () => {
    setOpen(false);
    setState((previous) => ({ ...previous, dismissedAt: Date.now() }));
  };

  const accept = () => {
    setOpen(false);
    setState((previous) => ({ ...previous, takenAt: Date.now() }));
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
      shownThisSession.current = true;
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

  // Escape closes; focus moves into the dialog when it appears.
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="audit-offer-title"
    >
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={dismiss} aria-hidden />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="h-1 bg-[linear-gradient(90deg,var(--color-brand-500),var(--color-accent-400))]" />
        <button
          ref={closeRef}
          type="button"
          onClick={dismiss}
          className="absolute right-3 top-4 inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
          aria-label="Close offer"
        >
          <X className="size-4" aria-hidden />
        </button>

        <div className="p-6 md:p-7">
          <span className="inline-flex size-11 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--color-brand-600),var(--color-accent-500))] text-white">
            <Gauge className="size-5" aria-hidden />
          </span>

          <h2
            id="audit-offer-title"
            className="mt-4 text-xl font-semibold text-foreground"
          >
            Before you go — want your current site audited?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            A real engineer spends 45 minutes on your site and sends you a written
            report: load times on a mid-range phone, the three things costing you
            conversions, and what each would take to fix. Free, no pitch deck.
          </p>

          <ul className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
            {[
              "Core Web Vitals measured on real mobile hardware",
              "Security headers, SEO and accessibility checks",
              "Prioritised fix list with effort estimates",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <ButtonLink
              href="/contact?intent=audit"
              variant="gradient"
              className="flex-1"
              onClick={accept}
            >
              Claim my free audit
            </ButtonLink>
            <button
              type="button"
              onClick={dismiss}
              className="rounded-xl px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              No thanks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
