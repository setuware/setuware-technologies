/**
 * Consultation booking: 30-minute slots in India Standard Time.
 *
 * Shared by the booking widget (to list slots) and the API route (to reject
 * anything the widget would never offer). Bookings are not stored; each one is
 * e-mailed with a calendar invite, and the team confirms by reply.
 */

export const BOOKING = {
  durationMin: 30,
  /** First and last start times, in minutes after midnight IST. */
  firstStart: 10 * 60,
  lastStart: 18 * 60 + 30,
  stepMin: 30,
  /** Minimum notice before a slot, in hours. */
  noticeHours: 3,
  /** How far ahead visitors can book, in days. */
  daysAhead: 14,
} as const;

export const MEETING_MODES = {
  video: "Video call (Google Meet)",
  phone: "Phone call",
} as const;

export type MeetingMode = keyof typeof MEETING_MODES;

const IST_OFFSET_MIN = 330;
const MINUTE = 60_000;

/** Calendar fields of an instant as seen in IST. */
function ist(date: Date) {
  const shifted = new Date(date.getTime() + IST_OFFSET_MIN * MINUTE);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    weekday: shifted.getUTCDay(),
    minutes: shifted.getUTCHours() * 60 + shifted.getUTCMinutes(),
  };
}

const pad = (value: number) => String(value).padStart(2, "0");

/** `YYYY-MM-DD` of an instant, in IST. */
export function istDayKey(date: Date): string {
  const p = ist(date);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

/** The instant a slot starts: an IST day plus minutes after midnight IST. */
export function slotStart(dayKey: string, minutes: number): Date {
  const [year, month, day] = dayKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day) + (minutes - IST_OFFSET_MIN) * MINUTE);
}

function earliest(now: Date): number {
  return now.getTime() + BOOKING.noticeHours * 60 * MINUTE;
}

export interface Slot {
  iso: string;
  label: string;
}

/** Open slots on one IST day (none on Sundays or in the past). */
export function slotsForDay(dayKey: string, now: Date = new Date()): Slot[] {
  const noon = slotStart(dayKey, 12 * 60);
  if (ist(noon).weekday === 0) return [];
  const slots: Slot[] = [];
  for (let m = BOOKING.firstStart; m <= BOOKING.lastStart; m += BOOKING.stepMin) {
    const start = slotStart(dayKey, m);
    if (start.getTime() < earliest(now)) continue;
    const hours = Math.floor(m / 60);
    const label = `${((hours + 11) % 12) + 1}:${pad(m % 60)} ${hours < 12 ? "am" : "pm"}`;
    slots.push({ iso: start.toISOString(), label });
  }
  return slots;
}

export interface BookingDay {
  key: string;
  weekday: string;
  day: number;
  month: string;
}

/** Days in the booking window that still have at least one open slot. */
export function bookableDays(now: Date = new Date()): BookingDay[] {
  const days: BookingDay[] = [];
  const today = slotStart(istDayKey(now), 12 * 60);
  for (let offset = 0; offset <= BOOKING.daysAhead; offset += 1) {
    const noon = new Date(today.getTime() + offset * 24 * 60 * MINUTE);
    const key = istDayKey(noon);
    if (slotsForDay(key, now).length === 0) continue;
    days.push({
      key,
      weekday: new Intl.DateTimeFormat("en-IN", { weekday: "short", timeZone: "Asia/Kolkata" }).format(noon),
      day: ist(noon).day,
      month: new Intl.DateTimeFormat("en-IN", { month: "short", timeZone: "Asia/Kolkata" }).format(noon),
    });
  }
  return days;
}

/** True only for a slot the widget could have offered at `now`. */
export function isBookableSlot(iso: string, now: Date = new Date()): boolean {
  const start = new Date(iso);
  if (Number.isNaN(start.getTime())) return false;
  const p = ist(start);
  if (p.weekday === 0) return false;
  if (p.minutes < BOOKING.firstStart || p.minutes > BOOKING.lastStart) return false;
  if ((p.minutes - BOOKING.firstStart) % BOOKING.stepMin !== 0) return false;
  if (start.getUTCSeconds() !== 0 || start.getUTCMilliseconds() !== 0) return false;
  if (start.getTime() < earliest(now) - 15 * MINUTE) return false;
  return start.getTime() <= now.getTime() + (BOOKING.daysAhead + 1) * 24 * 60 * MINUTE;
}

/** "Tue, 5 Nov 2026, 11:30 am IST" */
export function formatSlot(iso: string): string {
  const text = new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(new Date(iso));
  return `${text.replace(/\s?(am|pm)$/i, (m) => ` ${m.trim().toLowerCase()}`)} IST`;
}

/* -------------------------------------------------------------------------- */
/* Calendar invite                                                             */
/* -------------------------------------------------------------------------- */

function icsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function icsText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** RFC 5545 lines are folded at 75 octets. */
function fold(line: string): string {
  const out: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    out.push(rest.slice(0, 74));
    rest = ` ${rest.slice(74)}`;
  }
  out.push(rest);
  return out.join("\r\n");
}

export interface InviteOptions {
  uid: string;
  startIso: string;
  summary: string;
  description: string;
  location: string;
  organizer: { name: string; email: string };
  attendee: { name: string; email: string };
}

/** A calendar invitation (METHOD:REQUEST) that mail apps show with Add / Accept. */
export function buildInvite(options: InviteOptions): string {
  const start = new Date(options.startIso);
  const end = new Date(start.getTime() + BOOKING.durationMin * MINUTE);
  const lines = [
    "BEGIN:VCALENDAR",
    "PRODID:-//Setuware Technologies//Consultation booking//EN",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${options.uid}`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(start)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${icsText(options.summary)}`,
    `DESCRIPTION:${icsText(options.description)}`,
    `LOCATION:${icsText(options.location)}`,
    `ORGANIZER;CN=${icsText(options.organizer.name)}:mailto:${options.organizer.email}`,
    `ATTENDEE;CN=${icsText(options.attendee.name)};ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:${options.attendee.email}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Consultation with Setuware Technologies",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}

/** "Add to Google Calendar" link for the confirmation screen. */
export function googleCalendarUrl(startIso: string, title: string, details: string): string {
  const start = new Date(startIso);
  const end = new Date(start.getTime() + BOOKING.durationMin * MINUTE);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${icsDate(start)}/${icsDate(end)}`,
    details,
    ctz: "Asia/Kolkata",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
