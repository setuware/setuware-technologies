import { BOOKING, formatSlot, MEETING_MODES, type MeetingMode } from "./booking";
import { BRAND, buttons, detailCard, esc, link, meetingCard, note, paragraph, quote, renderEmail, siteHost, steps, type DetailRow, type EmailContent } from "./email-kit";
import { getService } from "./content";
import type { Lead } from "./leads";
import { site } from "./site";
import { founder } from "./team";
import { formatINR } from "./utils";

/**
 * E-mails for website enquiries: the notification the team receives and the
 * reply the visitor receives (enquiry received, estimate, consultation
 * confirmed). Built from the shared blocks in ./email-kit.ts.
 * Every visitor-supplied value goes through `esc`.
 */

export type { EmailContent };

const BUDGETS: Record<string, string> = {
  "under-1l": "Under ₹1,00,000",
  "1l-5l": "₹1,00,000 – ₹5,00,000",
  "5l-15l": "₹5,00,000 – ₹15,00,000",
  "15l-plus": "Above ₹15,00,000",
  "not-sure": "Not sure yet",
};

const POPUP_MARKER = "(Sent from the website enquiry pop-up.)";
const ASSISTANT_MARKER = "Enquiry via the website assistant.";

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function firstName(name: string): string {
  return name.split(/\s+/)[0] ?? name;
}

/** Digits for tel:/wa.me links; assumes India for 10-digit numbers. */
function phoneDigits(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 ? `91${digits}` : digits;
}

function receivedAt(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  }).format(new Date(iso)) + " IST";
}

export interface LeadView {
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  budget: string;
  message: string;
  source: string;
  quote?: { low: number; high: number; weeks: number };
  /** Consultation bookings only. */
  slot?: string;
  mode?: string;
}

/** Normalises the different enquiry payloads into one shape for display. */
export function leadView(lead: Lead): LeadView {
  const p = lead.payload;
  let message = str(p.message) || str(p.notes);
  let source =
    lead.kind === "estimate"
      ? "Instant estimator"
      : lead.kind === "newsletter"
        ? "Newsletter sign-up"
        : lead.kind === "booking"
          ? "Consultation booking"
          : "Contact form";

  if (message.includes(POPUP_MARKER)) {
    source = "Enquiry pop-up";
    message = message.replace(POPUP_MARKER, "").replace(/^Service: [^\n]*\.\s*/m, "");
  }
  if (message.startsWith(ASSISTANT_MARKER)) {
    source = "Website chat assistant";
    message = message.replace(ASSISTANT_MARKER, "").replace(/^\s*Requirement: [^\n]*\n?/m, "");
  }
  message = message.replace(/\n{3,}/g, "\n\n").trim();

  const rawService = str(p.service) || str(p.topic);
  const service = rawService ? (getService(rawService)?.name ?? rawService) : "";

  const quote =
    p.quote && typeof p.quote === "object"
      ? (p.quote as { low?: unknown; high?: unknown; weeks?: unknown })
      : undefined;
  const configService =
    p.configuration && typeof p.configuration === "object"
      ? str((p.configuration as { service?: unknown }).service)
      : "";

  return {
    name: str(p.name),
    email: str(p.email),
    phone: str(p.phone),
    company: str(p.company),
    service: service || (configService ? (getService(configService)?.name ?? configService) : ""),
    budget: BUDGETS[str(p.budget)] ?? "",
    message,
    source,
    quote:
      quote && typeof quote.low === "number" && typeof quote.high === "number"
        ? { low: quote.low, high: quote.high, weeks: typeof quote.weeks === "number" ? quote.weeks : 0 }
        : undefined,
    slot: str(p.slot) ? formatSlot(str(p.slot)) : undefined,
    mode: str(p.mode) in MEETING_MODES ? MEETING_MODES[str(p.mode) as MeetingMode] : undefined,
  };
}

/* -------------------------------------------------------------------------- */
/* Shared pieces                                                               */
/* -------------------------------------------------------------------------- */

function quoteText(value: NonNullable<LeadView["quote"]>): string {
  const range = value.low === value.high ? formatINR(value.low) : `${formatINR(value.low)} – ${formatINR(value.high)}`;
  return value.weeks ? `${range} · about ${value.weeks} weeks` : range;
}

const IST = "Asia/Kolkata";
const part = (iso: string, options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-IN", { ...options, timeZone: IST }).format(new Date(iso));
const clock = (date: Date) =>
  new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: IST }).format(date).toLowerCase();

/** Date tile, long date and "11:30 am – 12:00 pm IST" for a booked slot. */
function meetingTimes(slotIso: string) {
  const start = new Date(slotIso);
  const end = new Date(start.getTime() + BOOKING.durationMin * 60_000);
  return {
    month: part(slotIso, { month: "short" }),
    day: part(slotIso, { day: "numeric" }),
    date: part(slotIso, { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    time: `${clock(start)} – ${clock(end)} IST`,
  };
}

const slotOf = (lead: Lead) => (lead.kind === "booking" ? str(lead.payload.slot) : "");
const isVideo = (lead: Lead) => str(lead.payload.mode) !== "phone";

/* -------------------------------------------------------------------------- */
/* Team notification                                                           */
/* -------------------------------------------------------------------------- */

const TEAM_SUBJECT: Record<Lead["kind"], string> = {
  contact: "New project enquiry",
  estimate: "New estimate request",
  newsletter: "New newsletter subscriber",
  booking: "Consultation booked",
};

const TEAM_TAG: Record<Lead["kind"], string> = {
  contact: "New enquiry",
  estimate: "Estimate request",
  newsletter: "New subscriber",
  booking: "Consultation booked",
};

export function teamEmail(lead: Lead): EmailContent {
  const v = leadView(lead);
  const who = v.name || v.email || "A visitor";
  const subject = `${TEAM_SUBJECT[lead.kind]}${v.name ? ` from ${v.name}` : ""} · ${lead.reference}`;
  const headline =
    lead.kind === "newsletter"
      ? `${who} subscribed to the newsletter`
      : lead.kind === "estimate"
        ? `${who} requested an estimate${v.service ? ` for ${v.service.toLowerCase()}` : ""}`
        : lead.kind === "booking"
          ? `${who} booked a consultation`
          : `New enquiry from ${who}`;
  const when = receivedAt(lead.receivedAt);
  const tel = v.phone ? phoneDigits(v.phone) : "";
  const slot = slotOf(lead);

  const rows: [string, string][] = [];
  if (v.slot) rows.push(["When", `${esc(v.slot)}${v.mode ? `<br><span style="font-weight:400;color:${BRAND.muted};">${esc(v.mode)}, ${BOOKING.durationMin} minutes</span>` : ""}`]);
  if (v.name) rows.push(["Name", esc(v.name)]);
  if (v.email) rows.push(["Email", `<a href="mailto:${esc(v.email)}" style="color:${BRAND.blue};text-decoration:none;">${esc(v.email)}</a>`]);
  if (v.phone) rows.push(["Phone", `<a href="tel:+${esc(tel)}" style="color:${BRAND.blue};text-decoration:none;">${esc(v.phone)}</a>`]);
  if (v.company) rows.push(["Company", esc(v.company)]);
  if (v.service) rows.push(["Service", esc(v.service)]);
  if (v.budget) rows.push(["Budget", esc(v.budget)]);
  if (v.quote) rows.push(["Estimate shown", esc(quoteText(v.quote))]);
  rows.push(["Source", esc(v.source)]);
  if (lead.payload.consent === true) rows.push(["Consent to contact", "Given"]);

  const nextStep =
    lead.kind === "newsletter"
      ? ""
      : lead.kind === "booking"
        ? `<strong>Next step:</strong> accept the attached invite${isVideo(lead) ? ` and reply to ${esc(firstName(who))} with the Google Meet link before the call` : ` and call ${esc(firstName(who))} at the booked time`}.`
        : `<strong>Next step:</strong> reply within one business day and offer the free ${BOOKING.durationMin}-minute consultation.${v.email ? ` Replying to this email goes straight to ${esc(firstName(who))}.` : ""}`;

  const html = renderEmail({
    subject,
    preheader: `${who}${v.service ? ` · ${v.service}` : ""}${v.phone ? ` · ${v.phone}` : ""}`,
    tag: TEAM_TAG[lead.kind],
    heading: headline,
    subheading: `Received ${when} · Ref ${lead.reference} · ${v.source}`,
    blocks: [
      buttons([
        ...(v.email ? [{ url: `mailto:${v.email}?subject=${encodeURIComponent(`Re: Your enquiry with ${site.name}`)}`, label: "Reply by email" }] : []),
        ...(tel ? [{ url: `tel:+${tel}`, label: "Call", tone: "outline" as const }] : []),
        ...(tel ? [{ url: `https://wa.me/${tel}`, label: "WhatsApp", tone: "whatsapp" as const }] : []),
      ]),
      slot ? meetingCard("Consultation", { ...meetingTimes(slot), rows: v.mode ? [{ label: "Format", html: esc(v.mode) }] : [] }) : "",
      detailCard("Contact details", rows.filter(([name]) => name !== "When").map(([name, value]): DetailRow => ({ label: name, html: value }))),
      v.message ? `<div style="margin:0 0 10px;font:700 15px/1.4 Arial,sans-serif;color:${BRAND.ink};">${lead.kind === "booking" ? "Notes from the visitor" : "Project details"}</div>${quote(v.message)}` : "",
      nextStep ? note(nextStep, "warn") : "",
      buttons([{ url: `${site.url}/admin/enquiries`, label: "Open in the admin", tone: "outline" }]),
    ],
    reason: `Sent automatically by the ${siteHost()} website.`,
  });

  const plain: Record<string, string> = {
    Name: v.name,
    Email: v.email,
    Phone: v.phone,
    Company: v.company,
    Service: v.service,
    Budget: v.budget,
    "Estimate shown": v.quote ? quoteText(v.quote) : "",
    When: v.slot ? `${v.slot}${v.mode ? ` (${v.mode})` : ""}` : "",
    Source: v.source,
    "Consent to contact": "Given",
  };
  const text = [
    headline,
    `Received ${when} · Ref ${lead.reference} · ${v.source}`,
    "",
    ...rows.map(([name]) => `${name}: ${plain[name] ?? ""}`),
    ...(v.message ? ["", "Project details:", v.message] : []),
  ].join("\n");

  return { subject, html, text };
}

/* -------------------------------------------------------------------------- */
/* Visitor reply                                                               */
/* -------------------------------------------------------------------------- */

interface Piece {
  html: string;
  text: string;
}

const plainPiece = (text: string): Piece => ({ html: paragraph(esc(text)), text });

function stepsPiece(title: string, items: string[]): Piece {
  return { html: steps(title, items.map(esc)), text: `${title}\n${items.map((item, index) => `${index + 1}. ${item}`).join("\n")}` };
}

export function acknowledgementEmail(lead: Lead): EmailContent | null {
  if (lead.kind === "newsletter") return null;
  const v = leadView(lead);
  if (!v.email) return null;

  const name = firstName(v.name);
  const greeting = `Thank you${name ? `, ${name}` : ""}.`;
  const bookUrl = `${site.url}/book`;
  const slot = slotOf(lead);
  const about = v.service ? ` for your ${v.service.toLowerCase()} project` : "";

  let subject: string;
  let tag: string;
  let heading: string;
  let subheading: string;
  const pieces: Piece[] = [plainPiece(greeting)];

  if (lead.kind === "booking" && slot && v.slot) {
    const times = meetingTimes(slot);
    const video = isVideo(lead);
    const topic = str(lead.payload.topic);
    subject = `Consultation confirmed: ${v.slot}`;
    tag = "Consultation confirmed";
    heading = "Your consultation is confirmed";
    subheading = `${times.date} · ${times.time}`;
    const rows: DetailRow[] = [
      { label: "Format", html: esc(v.mode ?? "Call") },
      { label: "Duration", html: `${BOOKING.durationMin} minutes, free of charge` },
      { label: "With", html: `${esc(founder.name)}, ${esc(founder.role)}` },
      ...(topic ? [{ label: "Topic", html: esc(getService(topic)?.name ?? topic) }] : []),
      { label: video ? "Meeting link" : "We will call", html: esc(video ? "Google Meet link sent before the call" : v.phone || "The number you gave us") },
    ];
    pieces.push({
      html: paragraph(`Your free consultation with ${esc(site.name)} is booked. The calendar invite is attached to this email, so you can add it to your calendar in one tap.`),
      text: `Your free consultation with ${site.name} is booked for ${v.slot} (${BOOKING.durationMin} minutes). The calendar invite is attached.`,
    });
    pieces.push({
      html: meetingCard("Your consultation", { ...times, rows }),
      text: ["Your consultation", `${times.date}, ${times.time}`, ...rows.map((row) => `${row.label}: ${row.html.replace(/&amp;/g, "&")}`)].join("\n"),
    });
    pieces.push(
      stepsPiece("What we will cover", [
        "Your business, your customers and what you want the project to achieve.",
        "The scope we recommend, the technology behind it and what it leaves out.",
        "A realistic timeline, and when you will receive a fixed-price proposal in writing.",
      ]),
    );
    pieces.push(
      stepsPiece("To get the most from the call", [
        "Keep two or three websites or apps you like at hand, with what you like about each.",
        "Note the features you must have at launch and the ones that can wait.",
        "Have a rough budget and a launch date in mind; a range is enough.",
      ]),
    );
    pieces.push({
      html: note(`<strong>Need to change the time?</strong> Reply to this email or call ${esc(site.phone)} and we will move this booking. Please tell us at least two hours before the call.`),
      text: `Need to change the time? Reply to this email or call ${site.phone} and we will move this booking. Please tell us at least two hours before the call.`,
    });
  } else if (lead.kind === "estimate" && v.quote) {
    subject = `Your project estimate from ${site.name}`;
    tag = "Project estimate";
    heading = "Your project estimate";
    subheading = v.service ? `${v.service} · indicative range, excluding GST` : "Indicative range, excluding GST";
    pieces.push({
      html: paragraph(`Here is the estimate you requested${v.service ? ` for ${esc(v.service.toLowerCase())}` : ""}. It is based on the options you chose in the estimator.`),
      text: `Here is the estimate you requested${v.service ? ` for ${v.service.toLowerCase()}` : ""}: ${quoteText(v.quote)}. It excludes GST, and we confirm a fixed price after a short call.`,
    });
    const rows: DetailRow[] = [
      { label: "Estimated cost", html: `<span style="font-size:18px;">${esc(v.quote.low === v.quote.high ? formatINR(v.quote.low) : `${formatINR(v.quote.low)} – ${formatINR(v.quote.high)}`)}</span>` },
      ...(v.quote.weeks ? [{ label: "Estimated timeline", html: `About ${v.quote.weeks} weeks` }] : []),
      ...(v.service ? [{ label: "Service", html: esc(v.service) }] : []),
      { label: "Taxes", html: "GST extra, as applicable" },
    ];
    pieces.push({ html: detailCard("Indicative estimate", rows), text: "" });
    pieces.push(
      stepsPiece("What happens next", [
        `We call you within one business day to understand the project in detail (a free ${BOOKING.durationMin}-minute consultation).`,
        "You receive a written proposal with the scope, a fixed price, milestones and a delivery date.",
        "Work starts once you approve the proposal, and you review progress on a staging link.",
      ]),
    );
    pieces.push({
      html: buttons([{ url: bookUrl, label: "Pick a time for the call" }, { url: `${site.url}/work`, label: "See our work", tone: "outline" }]),
      text: `Pick a time for the call: ${bookUrl}\nSee our work: ${site.url}/work`,
    });
    pieces.push({
      html: note("The range is an estimate, not a quotation. The final price depends on the scope we agree on the call, and it is fixed in writing before any work starts."),
      text: "The range is an estimate, not a quotation. The final price depends on the scope we agree on the call, and it is fixed in writing before any work starts.",
    });
  } else {
    subject = `Thank you for contacting ${site.name}`;
    tag = "Enquiry received";
    heading = "We have received your enquiry";
    subheading = "A reply from our team within one business day";
    pieces.push(plainPiece(`Your message has reached our team, and one of us will reply within one business day${about ? ` to discuss the details${about}` : ""}.`));
    const rows: DetailRow[] = [
      ...(v.service ? [{ label: "Service", html: esc(v.service) }] : []),
      ...(v.company ? [{ label: "Company", html: esc(v.company) }] : []),
      ...(v.budget ? [{ label: "Budget", html: esc(v.budget) }] : []),
      ...(v.phone ? [{ label: "Phone", html: esc(v.phone) }] : []),
    ];
    if (rows.length) pieces.push({ html: detailCard("What you sent us", rows), text: `What you sent us\n${rows.map((row) => `${row.label}: ${row.html.replace(/&amp;/g, "&")}`).join("\n")}` });
    pieces.push(
      stepsPiece("What happens next", [
        `A free ${BOOKING.durationMin}-minute consultation to understand what you need.`,
        "A written proposal with the scope, a fixed price and a delivery date.",
        "Design and development in weekly steps that you review on a staging link.",
      ]),
    );
    pieces.push({
      html: buttons([{ url: bookUrl, label: "Pick a time for the call" }, { url: `${site.url}/work`, label: "See our work", tone: "outline" }]),
      text: `Prefer to choose the time yourself? Pick a slot here: ${bookUrl}\nSee our work: ${site.url}/work`,
    });
  }

  const html = renderEmail({
    subject,
    preheader: pieces[1]?.text || greeting,
    tag,
    heading,
    subheading,
    blocks: pieces.map((piece) => piece.html),
    signature: { name: founder.name, role: founder.role },
    contactLine: true,
    reason: `You are receiving this email because you contacted ${site.name} through ${siteHost()}.`,
  });
  const text = [
    ...pieces.map((piece) => piece.text).filter(Boolean),
    `Need us sooner? Reply to this email or call ${site.phone}.`,
    `Regards,\n${founder.name}\n${founder.role}\n${site.phone} · ${siteHost()}`,
  ].join("\n\n");

  return { subject, html, text };
}

/* -------------------------------------------------------------------------- */
/* Meeting link                                                                */
/* -------------------------------------------------------------------------- */

/** Sent from the admin once the video call's join link exists. */
export function meetingLinkEmail(lead: Lead, meetingUrl: string, host: string = founder.name): EmailContent | null {
  const v = leadView(lead);
  const slot = slotOf(lead);
  if (!slot || !v.slot || !v.email) return null;
  const times = meetingTimes(slot);
  const name = firstName(v.name);
  const subject = `Join link for your consultation: ${v.slot}`;
  const rows: DetailRow[] = [
    { label: "Join link", html: link(meetingUrl, meetingUrl.replace(/^https?:\/\//, "")) },
    { label: "Duration", html: `${BOOKING.durationMin} minutes` },
    { label: "With", html: `${esc(host)}, ${esc(site.name)}` },
  ];
  const tips = [
    "Join two or three minutes early to check your microphone and camera.",
    "The link opens in Chrome, Edge or Safari, or in the Google Meet app on a phone.",
    "Keep any reference websites, documents or screenshots open so you can share your screen.",
  ];
  const html = renderEmail({
    subject,
    preheader: `${times.date}, ${times.time}. Your join link is inside.`,
    tag: "Meeting link",
    heading: "Your consultation join link",
    subheading: `${times.date} · ${times.time}`,
    blocks: [
      paragraph(`Hi${name ? ` ${esc(name)}` : ""},`),
      paragraph(`Here is the link for your video consultation with ${esc(site.name)}. The attached invite updates the event in your calendar with the same link.`),
      meetingCard("Your consultation", { ...times, rows }),
      buttons([{ url: meetingUrl, label: "Join the video call" }]),
      steps("Before you join", tips.map(esc)),
      note(`<strong>Cannot make it?</strong> Reply to this email or call ${esc(site.phone)} and we will move the call to a time that suits you.`),
    ],
    signature: { name: host, role: site.name },
    contactLine: true,
    reason: `You are receiving this email because you booked a consultation on ${siteHost()}.`,
  });
  const text = [
    `Hi${name ? ` ${name}` : ""},`,
    `Here is the link for your video consultation with ${site.name}.`,
    `When: ${times.date}, ${times.time}\nJoin link: ${meetingUrl}\nDuration: ${BOOKING.durationMin} minutes\nWith: ${host}, ${site.name}`,
    `Before you join\n${tips.map((tip, index) => `${index + 1}. ${tip}`).join("\n")}`,
    `Cannot make it? Reply to this email or call ${site.phone} and we will move the call to a time that suits you.`,
    `Regards,\n${host}\n${site.name}`,
  ].join("\n\n");
  return { subject, html, text };
}
