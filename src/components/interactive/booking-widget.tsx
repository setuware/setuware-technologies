"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";

import {
  bookableDays,
  formatSlot,
  googleCalendarUrl,
  MEETING_MODES,
  slotsForDay,
  type BookingDay,
  type MeetingMode,
} from "@/lib/booking";
import { postJson } from "@/lib/client-api";
import { cn } from "@/lib/utils";
import { bookingSchema, fieldErrors } from "@/lib/validation";
import { Field, Honeypot, Input } from "@/components/ui/field";

const TOPICS = ["Website", "E-commerce store", "Mobile app", "Custom software", "SEO & marketing", "Not sure yet"] as const;

/**
 * Pick a day, a 30-minute slot and a format, then confirm with contact
 * details. Slots are computed in the browser after mount (they depend on the
 * current time), and the server checks the chosen one again.
 */
export function BookingWidget() {
  const [now, setNow] = useState<Date | null>(null);
  const [day, setDay] = useState<string>("");
  const [slot, setSlot] = useState<string>("");
  const [mode, setMode] = useState<MeetingMode>("video");
  const [topic, setTopic] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [booked, setBooked] = useState<{ slot: string; email: string } | null>(null);
  const mountedAt = useRef(0);
  const detailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const current = new Date();
    mountedAt.current = current.getTime();
    setNow(current);
  }, []);

  const days: BookingDay[] = useMemo(() => (now ? bookableDays(now) : []), [now]);
  const activeDay = day || days[0]?.key || "";
  const slots = useMemo(() => (now && activeDay ? slotsForDay(activeDay, now) : []), [now, activeDay]);

  const chooseSlot = (iso: string) => {
    setSlot(iso);
    setErrors(({ slot: _slot, ...rest }) => rest);
    // On phones the form sits below the times; bring it into view.
    if (window.matchMedia("(max-width: 1023px)").matches) {
      requestAnimationFrame(() => detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;
    const form = new FormData(event.currentTarget);
    const payload = {
      slot,
      mode,
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      topic,
      notes: String(form.get("notes") ?? ""),
      honeypot: String(form.get("booking-honeypot") ?? ""),
      elapsedMs: Date.now() - mountedAt.current,
    };

    const parsed = bookingSchema.safeParse(payload);
    if (!parsed.success) {
      const local = fieldErrors(parsed.error);
      if (!slot) local.slot = "Pick a time first.";
      setErrors(local);
      return;
    }

    setStatus("sending");
    setErrors({});
    const result = await postJson<{ reference: string }>("/api/booking", payload);
    if (result.ok) {
      setBooked({ slot, email: parsed.data.email });
      setStatus("done");
      return;
    }
    setStatus("idle");
    setErrors({ ...(result.fields ?? {}), _form: result.message });
  };

  if (status === "done" && booked) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-border bg-surface p-8 text-center md:p-10" role="status">
        <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-600 dark:text-emerald-400">
          <Check className="size-6" aria-hidden />
        </span>
        <h2 className="mt-5 font-display text-2xl font-semibold tracking-[-0.02em] text-foreground">You are booked</h2>
        <p className="mt-2 text-lg text-foreground">{formatSlot(booked.slot)}</p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          A confirmation and calendar invite are on their way to {booked.email}.{" "}
          {mode === "video" ? "We will send the Google Meet link before the call." : "We will call you at that time."}
        </p>
        <a
          href={googleCalendarUrl(
            booked.slot,
            "Consultation with Setuware Technologies",
            "Free 30-minute consultation. Reply to the confirmation e-mail to reschedule.",
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border px-6 text-sm font-medium text-foreground transition-colors hover:bg-surface-2"
        >
          Add to Google Calendar
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_1px_2px_rgb(15_23_42/0.04),0_16px_40px_-24px_rgb(15_23_42/0.18)] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      {/* Day and time */}
      <div className="border-b border-border p-5 md:p-7 lg:border-b-0 lg:border-r">
        <h2 className="text-[0.95rem] font-semibold text-foreground">Choose a day</h2>
        <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
          {now === null
            ? Array.from({ length: 6 }, (_, index) => (
                <span key={index} className="h-[4.5rem] w-14 shrink-0 animate-pulse rounded-xl bg-surface-2" />
              ))
            : days.map((entry) => {
                const active = entry.key === activeDay;
                return (
                  <button
                    key={entry.key}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setDay(entry.key);
                      setSlot("");
                    }}
                    className={cn(
                      "flex h-[4.5rem] w-14 shrink-0 flex-col items-center justify-center rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      active
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-background text-foreground hover:border-foreground/40",
                    )}
                  >
                    <span className={cn("text-[11px] uppercase tracking-[0.08em]", active ? "text-background/70" : "text-muted-foreground")}>
                      {entry.weekday}
                    </span>
                    <span className="text-lg font-semibold leading-tight tabular-nums">{entry.day}</span>
                    <span className={cn("text-[11px]", active ? "text-background/70" : "text-muted-foreground")}>{entry.month}</span>
                  </button>
                );
              })}
        </div>

        <div className="mt-7 flex items-baseline justify-between gap-3">
          <h2 className="text-[0.95rem] font-semibold text-foreground">Choose a time</h2>
          <span className="text-xs text-muted-foreground">India Standard Time · 30 min</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {slots.map((entry) => {
            const active = entry.iso === slot;
            return (
              <button
                key={entry.iso}
                type="button"
                aria-pressed={active}
                onClick={() => chooseSlot(entry.iso)}
                className={cn(
                  "rounded-lg border py-2 text-[0.8125rem] font-medium tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "border-setu bg-setu text-white"
                    : "border-border bg-background text-foreground hover:border-setu/60 hover:text-setu",
                )}
              >
                {entry.label}
              </button>
            );
          })}
        </div>
        {now !== null && slots.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No times left on this day. Please pick another.</p>
        ) : null}
      </div>

      {/* Details */}
      <div ref={detailsRef} className="scroll-mt-24 p-5 md:p-7">
        <div
          className={cn(
            "rounded-xl px-4 py-3 text-sm",
            slot ? "bg-setu/8 text-foreground" : "bg-surface-2/70 text-muted-foreground",
            errors.slot && "ring-1 ring-red-500/60",
          )}
          aria-live="polite"
        >
          {slot ? (
            <>
              <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-setu-dark dark:text-[#5fe0f7]">
                Selected
              </span>
              <span className="mt-0.5 block font-medium">{formatSlot(slot)}</span>
            </>
          ) : (
            (errors.slot ?? "Pick a day and time to continue.")
          )}
        </div>

        <form onSubmit={onSubmit} noValidate className="mt-5 flex flex-col gap-3.5">
          <Honeypot name="booking-honeypot" />

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-foreground">Format</legend>
            <div className="grid grid-cols-2 gap-1 rounded-full border border-border bg-background-subtle p-1">
              {(Object.keys(MEETING_MODES) as MeetingMode[]).map((key) => (
                <label
                  key={key}
                  className="cursor-pointer rounded-full px-2 py-1.5 text-center text-[0.8125rem] font-medium text-muted-foreground transition-colors hover:text-foreground has-[:checked]:bg-background has-[:checked]:text-foreground has-[:checked]:shadow-[0_1px_3px_rgb(15_23_42/0.12)] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
                >
                  <input
                    type="radio"
                    name="mode"
                    value={key}
                    checked={mode === key}
                    onChange={() => setMode(key)}
                    className="sr-only"
                  />
                  {key === "video" ? "Video call" : "Phone call"}
                </label>
              ))}
            </div>
          </fieldset>

          <Field label="Name" htmlFor="booking-name" required error={errors.name}>
            <Input id="booking-name" name="name" autoComplete="name" aria-invalid={Boolean(errors.name)} />
          </Field>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field label="Email" htmlFor="booking-email" required error={errors.email}>
              <Input
                id="booking-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
              />
            </Field>
            <Field label="Phone" htmlFor="booking-phone" required error={errors.phone}>
              <Input
                id="booking-phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                aria-invalid={Boolean(errors.phone)}
              />
            </Field>
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-foreground">Topic</legend>
            <div className="flex flex-wrap gap-1.5">
              {TOPICS.map((entry) => {
                const selected = topic === entry;
                return (
                  <button
                    key={entry}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setTopic(selected ? "" : entry)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-[0.8125rem] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      selected
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-background text-foreground/80 hover:border-foreground/40 hover:text-foreground",
                    )}
                  >
                    {entry}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <Field label="Anything we should know?" htmlFor="booking-notes" error={errors.notes}>
            <textarea
              id="booking-notes"
              name="notes"
              rows={2}
              className="w-full resize-none rounded-xl border border-border bg-surface px-3.5 py-2.5 text-[0.95rem] text-foreground outline-none transition-colors focus:border-setu focus:ring-2 focus:ring-setu/20"
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
            className="mt-1 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground text-[0.95rem] font-semibold text-background transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
          >
            {status === "sending" ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Booking
              </>
            ) : (
              <>
                Confirm booking
                <ArrowRight className="size-4" aria-hidden />
              </>
            )}
          </button>
          <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
            Free and without obligation. You will get a calendar invite by email.
          </p>
        </form>
      </div>
    </div>
  );
}
