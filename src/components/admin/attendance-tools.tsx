"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { Coffee, Fingerprint, Loader2, LogIn, LogOut, MapPin } from "lucide-react";

import { breakAction, checkInAction, checkOutAction, correctionRequestAction, fixAttendanceAction, attendanceSettingsAction, leaveRequestAction } from "@/app/admin/work-actions";
import type { FormState } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

import { FormMessage, SubmitButton } from "./form-bits";
import { Clock, Elapsed } from "./live-clock";
import { buttonClass, inputClass } from "./ui";

const LABEL = "mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground";

/** Best-effort location (5 s); resolves to null if refused or unavailable. */
function locate(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 60_000 },
    );
  });
}

export interface PunchState {
  state: "out" | "in" | "break" | "done";
  checkInAt: string | null;
  checkOutAt: string | null;
  breakMinutes: number;
  breakStartedAt: string | null;
  workedMinutes: number;
  summary: string;
  late: boolean;
  officeSet: boolean;
}

/** The check-in / break / check-out card. */
export function PunchCard({ punch, inTime, outTime }: { punch: PunchState; inTime: string | null; outTime: string | null }) {
  const [mode, setMode] = useState("office");
  const [inState, checkIn] = useActionState<FormState, FormData>(checkInAction, {});
  const [outState, checkOut] = useActionState<FormState, FormData>(checkOutAction, {});
  const [locating, setLocating] = useState(false);
  const [closing, setClosing] = useState(false);
  const [pending, startTransition] = useTransition();
  const busy = locating || pending;

  async function doCheckIn() {
    setLocating(true);
    const where = await locate();
    setLocating(false);
    const form = new FormData();
    form.set("mode", mode);
    if (where) {
      form.set("lat", String(where.lat));
      form.set("lng", String(where.lng));
    }
    startTransition(() => checkIn(form));
  }

  const status = {
    out: { label: "Not checked in", dot: "bg-slate-400" },
    in: { label: punch.late ? "Working · checked in late" : "Working", dot: "animate-pulse bg-emerald-400" },
    break: { label: "On a break", dot: "bg-amber-400" },
    done: { label: "Day finished", dot: "bg-[#5fd0ec]" },
  }[punch.state];

  return (
    <section className="dark relative overflow-hidden rounded-3xl bg-[#0b1020] p-6 text-white shadow-[0_24px_60px_-28px_rgba(11,16,32,0.8)] sm:p-7">
      <span aria-hidden className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-[#2f56d8]/35 blur-3xl" />
      <span aria-hidden className="pointer-events-none absolute -bottom-24 left-10 size-60 rounded-full bg-[#0a8ea6]/25 blur-3xl" />
      <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
            <span className={cn("size-2 rounded-full", status.dot)} aria-hidden /> {status.label}
          </p>
          <p className="mt-2 font-display text-5xl font-semibold tracking-tight sm:text-6xl">
            {punch.state === "in" && punch.checkInAt ? (
              <Elapsed since={punch.checkInAt} minus={punch.breakMinutes} />
            ) : punch.state === "break" && punch.breakStartedAt ? (
              <Elapsed since={punch.breakStartedAt} />
            ) : punch.state === "done" ? (
              `${Math.floor(punch.workedMinutes / 60)}h ${String(punch.workedMinutes % 60).padStart(2, "0")}m`
            ) : (
              <Clock />
            )}
          </p>
          <p className="mt-2 text-sm text-white/60">
            {punch.state === "out"
              ? "Check in when you start work. Your location is recorded if you allow it."
              : punch.state === "break"
                ? `Break time. Worked so far: ${Math.floor(punch.workedMinutes / 60)}h ${punch.workedMinutes % 60}m`
                : `In at ${inTime}${outTime ? ` · out at ${outTime}` : ""}${punch.breakMinutes ? ` · ${punch.breakMinutes} min break` : ""}`}
          </p>
        </div>

        <div className="flex flex-col gap-3 md:w-72">
          {punch.state === "out" ? (
            <>
              <div className="grid grid-cols-3 gap-1 rounded-xl bg-white/[0.06] p-1 text-xs font-semibold" role="radiogroup" aria-label="Where are you working?">
                {[
                  ["office", "Office"],
                  ["remote", "Remote"],
                  ["field", "On-site"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={mode === value}
                    onClick={() => setMode(value)}
                    className={cn("rounded-lg py-2 transition-colors", mode === value ? "bg-white text-[#0b1020]" : "text-white/70 hover:text-white")}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={doCheckIn}
                className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(100deg,#2f56d8,#1477c0_55%,#0a8ea6)] text-base font-semibold text-white shadow-[0_12px_30px_-12px_rgba(47,86,216,0.9)] transition-[filter] hover:brightness-110 disabled:opacity-70"
              >
                {busy ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <Fingerprint className="size-5" aria-hidden />}
                {locating ? "Getting location…" : pending ? "Checking in…" : "Check in"}
              </button>
              {punch.officeSet ? (
                <p className="flex items-center gap-1.5 text-[11px] text-white/50">
                  <MapPin className="size-3" aria-hidden /> Office check-ins are matched to the office location.
                </p>
              ) : null}
            </>
          ) : null}

          {punch.state === "in" || punch.state === "break" ? (
            closing ? (
              <form action={checkOut} className="flex flex-col gap-2">
                <label htmlFor="summary" className="text-xs font-semibold text-white/70">
                  What did you work on today?
                </label>
                <textarea
                  id="summary"
                  name="summary"
                  rows={3}
                  autoFocus
                  placeholder="e.g. Finished the Acme homepage, called 4 leads…"
                  className="rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/40"
                />
                <div className="flex gap-2">
                  <SubmitButton pendingLabel="Checking out…" className="flex-1 bg-none bg-red-500">
                    <LogOut className="size-4" aria-hidden /> Check out
                  </SubmitButton>
                  <button type="button" onClick={() => setClosing(false)} className="rounded-full px-4 text-sm text-white/70 hover:text-white">
                    Back
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <form action={breakAction}>
                  <input type="hidden" name="op" value={punch.state === "break" ? "end" : "start"} />
                  <button className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.06] text-sm font-semibold text-white hover:bg-white/[0.12]">
                    <Coffee className="size-4" aria-hidden /> {punch.state === "break" ? "End break" : "Break"}
                  </button>
                </form>
                <button
                  type="button"
                  onClick={() => setClosing(true)}
                  className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-white text-sm font-semibold text-[#0b1020] hover:opacity-90"
                >
                  <LogOut className="size-4" aria-hidden /> Check out
                </button>
              </div>
            )
          ) : null}

          {punch.state === "done" ? (
            <>
              {punch.summary ? <p className="rounded-xl bg-white/[0.06] px-3 py-2 text-xs text-white/75">“{punch.summary}”</p> : null}
              <button
                type="button"
                disabled={busy}
                onClick={doCheckIn}
                className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.06] text-sm font-semibold text-white hover:bg-white/[0.12] disabled:opacity-60"
              >
                <LogIn className="size-4" aria-hidden /> Back at work? Check in again
              </button>
            </>
          ) : null}
          <div className="text-xs">
            <FormMessage state={outState.error ? outState : inState.error ? inState : punch.state === "done" ? outState : inState} />
          </div>
        </div>
      </div>
    </section>
  );
}

export function LeaveForm({ types, today }: { types: readonly string[]; today: string }) {
  const [state, action] = useActionState<FormState, FormData>(leaveRequestAction, {});
  const [half, setHalf] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form ref={formRef} action={action} className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="leave_type" className={LABEL}>
            Type
          </label>
          <select id="leave_type" name="leave_type" className={inputClass}>
            {types.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </div>
        <label className="flex items-end gap-2 pb-2.5 text-sm text-foreground">
          <input type="checkbox" name="half_day" value="1" checked={half} onChange={(event) => setHalf(event.target.checked)} className="size-4 accent-[#2f56d8]" />
          Half day
        </label>
        <div>
          <label htmlFor="from_day" className={LABEL}>
            {half ? "Date" : "From"}
          </label>
          <input id="from_day" name="from_day" type="date" required min={today} className={inputClass} />
        </div>
        {!half ? (
          <div>
            <label htmlFor="to_day" className={LABEL}>
              To
            </label>
            <input id="to_day" name="to_day" type="date" min={today} className={inputClass} />
          </div>
        ) : null}
      </div>
      <textarea name="reason" rows={2} placeholder="Reason (optional)" aria-label="Reason" className={inputClass} />
      <div className="flex items-center gap-3">
        <SubmitButton pendingLabel="Sending…">Request leave</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}

export function CorrectionForm({ today, day }: { today: string; day?: string }) {
  const [state, action] = useActionState<FormState, FormData>(correctionRequestAction, {});
  return (
    <form action={action} className="grid gap-3">
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-3 sm:col-span-1">
          <label htmlFor="c_day" className={LABEL}>
            Date
          </label>
          <input id="c_day" name="day" type="date" required max={today} defaultValue={day} className={inputClass} />
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="c_in" className={LABEL}>
            In
          </label>
          <input id="c_in" name="check_in" type="time" required className={inputClass} />
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="c_out" className={LABEL}>
            Out
          </label>
          <input id="c_out" name="check_out" type="time" required className={inputClass} />
        </div>
      </div>
      <input name="reason" required placeholder="Why? e.g. forgot to check out" aria-label="Reason" className={inputClass} />
      <div className="flex items-center gap-3">
        <SubmitButton variant="secondary" pendingLabel="Sending…">
          Request correction
        </SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}

/** Manager: set or remove a person's attendance for a day. */
export function FixAttendanceForm({ team, today }: { team: { id: number; name: string }[]; today: string }) {
  const [state, action] = useActionState<FormState, FormData>(fixAttendanceAction, {});
  return (
    <form action={action} className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="f_user" className={LABEL}>
            Person
          </label>
          <select id="f_user" name="user_id" required className={inputClass}>
            {team.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f_day" className={LABEL}>
            Date
          </label>
          <input id="f_day" name="day" type="date" required max={today} defaultValue={today} className={inputClass} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label htmlFor="f_in" className={LABEL}>
            In
          </label>
          <input id="f_in" name="check_in" type="time" className={inputClass} />
        </div>
        <div>
          <label htmlFor="f_out" className={LABEL}>
            Out
          </label>
          <input id="f_out" name="check_out" type="time" className={inputClass} />
        </div>
        <div>
          <label htmlFor="f_break" className={LABEL}>
            Break (min)
          </label>
          <input id="f_break" name="break_minutes" type="number" min="0" max="600" defaultValue="0" className={inputClass} />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <SubmitButton name="op" value="save">
          Save record
        </SubmitButton>
        <SubmitButton name="op" value="delete" variant="danger" pendingLabel="Removing…">
          Remove day
        </SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function AttendanceSettingsForm({
  settings,
}: {
  settings: {
    start: string;
    graceMinutes: number;
    fullDayHours: number;
    halfDayHours: number;
    weeklyOff: number[];
    office: { lat: number; lng: number; radius: number } | null;
    quotas: Record<string, number>;
  };
}) {
  const [state, action] = useActionState<FormState, FormData>(attendanceSettingsAction, {});
  const [lat, setLat] = useState(settings.office ? String(settings.office.lat) : "");
  const [lng, setLng] = useState(settings.office ? String(settings.office.lng) : "");
  const [locating, setLocating] = useState(false);
  return (
    <form action={action} className="grid gap-6">
      <fieldset className="grid gap-4 sm:grid-cols-4">
        <legend className="mb-3 text-sm font-semibold text-foreground">Working hours</legend>
        <div>
          <label htmlFor="start" className={LABEL}>
            Office start
          </label>
          <input id="start" name="start" type="time" required defaultValue={settings.start} className={inputClass} />
        </div>
        <div>
          <label htmlFor="grace_minutes" className={LABEL}>
            Late after (min)
          </label>
          <input id="grace_minutes" name="grace_minutes" type="number" min="0" max="180" defaultValue={settings.graceMinutes} className={inputClass} />
        </div>
        <div>
          <label htmlFor="full_day_hours" className={LABEL}>
            Full day (h)
          </label>
          <input id="full_day_hours" name="full_day_hours" type="number" step="0.5" min="1" max="16" defaultValue={settings.fullDayHours} className={inputClass} />
        </div>
        <div>
          <label htmlFor="half_day_hours" className={LABEL}>
            Half day (h)
          </label>
          <input id="half_day_hours" name="half_day_hours" type="number" step="0.5" min="1" max="12" defaultValue={settings.halfDayHours} className={inputClass} />
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-foreground">Weekly days off</legend>
        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map((day, index) => (
            <label key={day} className="cursor-pointer">
              <input type="checkbox" name="weekly_off" value={index} defaultChecked={settings.weeklyOff.includes(index)} className="peer sr-only" />
              <span className="inline-flex h-9 w-12 items-center justify-center rounded-xl border border-border text-sm font-semibold text-muted-foreground transition-colors peer-checked:border-[#2f56d8] peer-checked:bg-[#2f56d8] peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-setu/30">
                {day}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-3">
        <legend className="mb-1 text-sm font-semibold text-foreground">Office location</legend>
        <p className="text-xs text-muted-foreground sm:col-span-3">
          Optional. Check-ins show how far from the office they were made. Open this page at the office and use your current location.
        </p>
        <div>
          <label htmlFor="office_lat" className={LABEL}>
            Latitude
          </label>
          <input id="office_lat" name="office_lat" value={lat} onChange={(event) => setLat(event.target.value)} inputMode="decimal" className={inputClass} />
        </div>
        <div>
          <label htmlFor="office_lng" className={LABEL}>
            Longitude
          </label>
          <input id="office_lng" name="office_lng" value={lng} onChange={(event) => setLng(event.target.value)} inputMode="decimal" className={inputClass} />
        </div>
        <div>
          <label htmlFor="office_radius" className={LABEL}>
            Radius (m)
          </label>
          <input id="office_radius" name="office_radius" type="number" min="20" max="5000" defaultValue={settings.office?.radius ?? 200} className={inputClass} />
        </div>
        <div className="flex gap-2 sm:col-span-3">
          <button
            type="button"
            disabled={locating}
            onClick={async () => {
              setLocating(true);
              const where = await locate();
              setLocating(false);
              if (where) {
                setLat(where.lat.toFixed(6));
                setLng(where.lng.toFixed(6));
              }
            }}
            className={buttonClass.secondary}
          >
            <MapPin className="size-4" aria-hidden /> {locating ? "Locating…" : "Use my current location"}
          </button>
          {lat ? (
            <button
              type="button"
              onClick={() => {
                setLat("");
                setLng("");
              }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          ) : null}
        </div>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-3">
        <legend className="mb-3 text-sm font-semibold text-foreground">Leave per year (days)</legend>
        {["Casual", "Sick", "Earned"].map((type) => (
          <div key={type}>
            <label htmlFor={`quota_${type}`} className={LABEL}>
              {type}
            </label>
            <input id={`quota_${type}`} name={`quota_${type}`} type="number" min="0" max="60" step="0.5" defaultValue={settings.quotas[type] ?? 0} className={inputClass} />
          </div>
        ))}
      </fieldset>

      <div className="flex items-center gap-3">
        <SubmitButton>Save settings</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
