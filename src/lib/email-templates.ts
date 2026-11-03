import { getService } from "./content";
import type { Lead } from "./leads";
import { site } from "./site";
import { formatINR } from "./utils";

/**
 * HTML e-mails for website enquiries: the notification the team receives and
 * the acknowledgement the visitor receives. Table layout with inline styles so
 * they render the same in Gmail, Outlook, Apple Mail and on phones.
 * Every visitor-supplied value goes through `esc`.
 */

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

const BUDGETS: Record<string, string> = {
  "under-1l": "Under ₹1,00,000",
  "1l-5l": "₹1,00,000 – ₹5,00,000",
  "5l-15l": "₹5,00,000 – ₹15,00,000",
  "15l-plus": "Above ₹15,00,000",
  "not-sure": "Not sure yet",
};

const POPUP_MARKER = "(Sent from the website enquiry pop-up.)";
const ASSISTANT_MARKER = "Enquiry via the website assistant.";

function esc(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

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
}

/** Normalises the different enquiry payloads into one shape for display. */
export function leadView(lead: Lead): LeadView {
  const p = lead.payload;
  let message = str(p.message) || str(p.notes);
  let source =
    lead.kind === "estimate" ? "Instant estimator" : lead.kind === "newsletter" ? "Newsletter sign-up" : "Contact form";

  if (message.includes(POPUP_MARKER)) {
    source = "Enquiry pop-up";
    message = message.replace(POPUP_MARKER, "").replace(/^Service: [^\n]*\.\s*/m, "");
  }
  if (message.startsWith(ASSISTANT_MARKER)) {
    source = "Website chat assistant";
    message = message.replace(ASSISTANT_MARKER, "").replace(/^\s*Requirement: [^\n]*\n?/m, "");
  }
  message = message.replace(/\n{3,}/g, "\n\n").trim();

  const rawService = str(p.service);
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
  };
}

/* -------------------------------------------------------------------------- */
/* Shared pieces                                                               */
/* -------------------------------------------------------------------------- */

const FONT = "-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

function shell(title: string, preheader: string, inner: string): string {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#eef2f7;font-family:${FONT};color:#0b1020;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f7;padding:32px 12px;"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 2px rgba(15,23,42,.06),0 18px 40px -20px rgba(15,23,42,.25);">
${inner}
</table></td></tr></table></body></html>`;
}

function logo(onDark: boolean): string {
  return `<table role="presentation"><tr>
  <td style="width:40px;height:40px;background:#0b1020;${onDark ? "border:1px solid rgba(255,255,255,.18);" : ""}border-radius:10px;text-align:center;font:800 17px/40px Arial,sans-serif;"><span style="color:#5fe0f7;">S</span><span style="color:#ffffff;">T</span></td>
  <td style="padding-left:12px;"><div style="font:800 17px/1 Arial,sans-serif;letter-spacing:.06em;color:${onDark ? "#ffffff" : "#0b1020"};">SETUWARE</div><div style="font:700 9px/1 Arial,sans-serif;letter-spacing:.38em;color:${onDark ? "rgba(255,255,255,.65)" : "#7a8396"};margin-top:5px;">TECHNOLOGIES</div></td>
</tr></table>`;
}

function button(href: string, label: string, tone: "primary" | "outline" | "whatsapp"): string {
  const styles = {
    primary: "background:#00a1c6;color:#ffffff;padding:11px 18px;",
    outline: "background:#ffffff;color:#0b1020;border:1px solid #d6dde8;padding:10px 18px;",
    whatsapp: "background:#25d366;color:#ffffff;padding:11px 18px;",
  }[tone];
  return `<td style="padding:0 8px 8px 0;"><a href="${esc(href)}" style="display:inline-block;${styles}text-decoration:none;border-radius:10px;font:700 14px/1 Arial,sans-serif;">${esc(label)}</a></td>`;
}

function label(text: string): string {
  return `<div style="font:700 11px/1 Arial,sans-serif;letter-spacing:.12em;color:#5b6478;margin:8px 0 12px;">${esc(text.toUpperCase())}</div>`;
}

function row(name: string, valueHtml: string, last: boolean): string {
  const border = last ? "" : "border-bottom:1px solid #e4e8f0;";
  return `<tr><td style="padding:12px 16px;width:34%;background:#f6f9fc;font:600 13px Arial,sans-serif;color:#5b6478;${border}">${esc(name)}</td><td style="padding:12px 16px;font:400 14px Arial,sans-serif;${border}">${valueHtml}</td></tr>`;
}

function quoteText(quote: NonNullable<LeadView["quote"]>): string {
  const range = quote.low === quote.high ? formatINR(quote.low) : `${formatINR(quote.low)} – ${formatINR(quote.high)}`;
  return quote.weeks ? `${range} · about ${quote.weeks} weeks` : range;
}

/* -------------------------------------------------------------------------- */
/* Team notification                                                           */
/* -------------------------------------------------------------------------- */

const TEAM_SUBJECT: Record<Lead["kind"], string> = {
  contact: "New project enquiry",
  estimate: "New estimate request",
  newsletter: "New newsletter subscriber",
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
        : `New enquiry from ${who}`;
  const when = receivedAt(lead.receivedAt);
  const tel = v.phone ? phoneDigits(v.phone) : "";

  const actions = [
    v.email ? button(`mailto:${v.email}?subject=${encodeURIComponent(`Re: Your enquiry (${lead.reference})`)}`, "Reply by email", "primary") : "",
    tel ? button(`tel:+${tel}`, "Call", "outline") : "",
    tel ? button(`https://wa.me/${tel}`, "WhatsApp", "whatsapp") : "",
  ].join("");

  const rows: [string, string][] = [];
  if (v.name) rows.push(["Name", `<strong>${esc(v.name)}</strong>`]);
  if (v.email) rows.push(["Email", `<a href="mailto:${esc(v.email)}" style="color:#0089a9;">${esc(v.email)}</a>`]);
  if (v.phone) rows.push(["Phone", `<a href="tel:+${esc(tel)}" style="color:#0089a9;">${esc(v.phone)}</a>`]);
  if (v.company) rows.push(["Company", esc(v.company)]);
  if (v.service)
    rows.push([
      "Service",
      `<span style="display:inline-block;background:#e6f7fb;color:#00718c;border-radius:999px;padding:4px 10px;font:700 12px Arial,sans-serif;">${esc(v.service)}</span>`,
    ]);
  if (v.budget) rows.push(["Budget", esc(v.budget)]);
  if (v.quote) rows.push(["Estimate shown", esc(quoteText(v.quote))]);
  rows.push(["Source", esc(v.source)]);

  const inner = `
<tr><td style="background:#0b1020;background-image:linear-gradient(135deg,#0b1020 0%,#0d2a3a 60%,#00718c 100%);padding:28px 32px;">
  <table role="presentation" width="100%"><tr>
    <td style="vertical-align:middle;">${logo(true)}</td>
    <td align="right" style="vertical-align:middle;"><span style="display:inline-block;background:rgba(95,224,247,.15);color:#5fe0f7;border:1px solid rgba(95,224,247,.35);border-radius:999px;padding:6px 12px;font:700 11px/1 Arial,sans-serif;letter-spacing:.08em;">${lead.kind === "newsletter" ? "NEW SUBSCRIBER" : "NEW ENQUIRY"}</span></td>
  </tr></table>
  <h1 style="margin:22px 0 6px;font:700 24px/1.25 Arial,sans-serif;color:#ffffff;">${esc(headline)}</h1>
  <p style="margin:0;font:400 14px/1.5 Arial,sans-serif;color:rgba(255,255,255,.75);">Received ${esc(when)} · Ref <strong style="color:#ffffff;">${esc(lead.reference)}</strong> · ${esc(v.source)}</p>
</td></tr>
${actions ? `<tr><td style="padding:24px 32px 8px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr>${actions}</tr></table></td></tr>` : ""}
<tr><td style="padding:8px 32px 0;">
  ${label("Contact details")}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e4e8f0;border-radius:12px;border-collapse:separate;overflow:hidden;">
    ${rows.map(([name, value], index) => row(name, value, index === rows.length - 1)).join("\n")}
  </table>
</td></tr>
${
  v.message
    ? `<tr><td style="padding:24px 32px 0;">${label("Project details")}<div style="background:#f6f9fc;border-left:4px solid #00a1c6;border-radius:0 12px 12px 0;padding:16px 18px;font:400 15px/1.6 Arial,sans-serif;color:#0b1020;white-space:pre-wrap;">${esc(v.message)}</div></td></tr>`
    : ""
}
${
  lead.kind !== "newsletter"
    ? `<tr><td style="padding:24px 32px 28px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff8e6;border:1px solid #f5dfa3;border-radius:12px;"><tr><td style="padding:14px 16px;font:400 13px/1.5 Arial,sans-serif;color:#6b5310;"><strong>Next step:</strong> reply within one business day to book the free 30-minute consultation.${v.email ? ` Replying to this email goes straight to ${esc(firstName(who))}.` : ""}</td></tr></table></td></tr>`
    : `<tr><td style="padding:0 0 28px;"></td></tr>`
}
<tr><td style="background:#f6f9fc;border-top:1px solid #e4e8f0;padding:18px 32px;font:400 12px/1.6 Arial,sans-serif;color:#7a8396;">
  Sent automatically by the ${esc(site.url.replace(/^https?:\/\//, ""))} website · ${esc(site.name)}, ${esc(site.address.street)}, ${esc(site.address.city)}${lead.payload.consent === true ? "<br>Consent to be contacted: given" : ""}
</td></tr>`;

  const text = [
    headline,
    `Received ${when} · Ref ${lead.reference} · ${v.source}`,
    "",
    ...rows.map(([name]) => {
      const plain: Record<string, string> = {
        Name: v.name,
        Email: v.email,
        Phone: v.phone,
        Company: v.company,
        Service: v.service,
        Budget: v.budget,
        "Estimate shown": v.quote ? quoteText(v.quote) : "",
        Source: v.source,
      };
      return `${name}: ${plain[name] ?? ""}`;
    }),
    ...(v.message ? ["", "Project details:", v.message] : []),
  ].join("\n");

  return { subject, html: shell(subject, `${who}${v.service ? ` · ${v.service}` : ""}${v.phone ? ` · ${v.phone}` : ""}`, inner), text };
}

/* -------------------------------------------------------------------------- */
/* Visitor acknowledgement                                                     */
/* -------------------------------------------------------------------------- */

export function acknowledgementEmail(lead: Lead): EmailContent | null {
  if (lead.kind === "newsletter") return null;
  const v = leadView(lead);
  if (!v.email) return null;

  const name = firstName(v.name) || "there";
  const isEstimate = lead.kind === "estimate";
  const subject = isEstimate
    ? `Your project estimate from ${site.name} (${lead.reference})`
    : `We have received your enquiry (${lead.reference})`;
  const whatsappDigits = site.whatsapp.replace(/\D/g, "");

  const steps = [
    ["Consultation call", "We discuss your goals, audience and timeline."],
    ["Written proposal", "A clear scope, timeline and fixed quote within two to five days."],
    ["Project kick-off", "Design starts once you approve the proposal."],
  ];

  const summary = [
    v.service ? `<span style="color:#5b6478;">Service:</span> ${esc(v.service)}` : "",
    v.quote ? `<span style="color:#5b6478;">Indicative estimate:</span> <strong>${esc(quoteText(v.quote))}</strong>` : "",
    v.message ? `<span style="color:#5b6478;">Details:</span> ${esc(v.message.length > 400 ? `${v.message.slice(0, 400)}…` : v.message)}` : "",
  ].filter(Boolean);

  const inner = `
<tr><td style="padding:28px 32px 0;">${logo(false)}</td></tr>
<tr><td style="padding:28px 32px 0;">
  <div style="width:48px;height:48px;border-radius:999px;background:#e6f7fb;text-align:center;font:700 24px/48px Arial,sans-serif;color:#00a1c6;">&#10003;</div>
  <h1 style="margin:18px 0 8px;font:700 24px/1.3 Arial,sans-serif;">Thank you, ${esc(name)}. ${isEstimate ? "Here is your project estimate." : "We have received your enquiry."}</h1>
  <p style="margin:0;font:400 15px/1.6 Arial,sans-serif;color:#5b6478;">A member of our team will contact you within one business day to arrange a free 30-minute consultation. Your reference is <strong style="color:#0b1020;">${esc(lead.reference)}</strong>.</p>
</td></tr>
${
  v.quote
    ? `<tr><td style="padding:24px 32px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b1020;border-radius:12px;"><tr><td style="padding:18px 20px;"><div style="font:700 11px/1 Arial,sans-serif;letter-spacing:.12em;color:#5fe0f7;">INDICATIVE ESTIMATE</div><div style="margin-top:8px;font:800 26px/1.2 Arial,sans-serif;color:#ffffff;">${esc(v.quote.low === v.quote.high ? formatINR(v.quote.low) : `${formatINR(v.quote.low)} – ${formatINR(v.quote.high)}`)}</div>${v.quote.weeks ? `<div style="margin-top:4px;font:400 13px/1.5 Arial,sans-serif;color:rgba(255,255,255,.7);">About ${v.quote.weeks} weeks · excludes GST · confirmed as a fixed quote after the consultation</div>` : ""}</td></tr></table></td></tr>`
    : ""
}
<tr><td style="padding:24px 32px 0;">
  ${label("What happens next")}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    ${steps
      .map(
        ([title, body], index) =>
          `<tr><td style="width:36px;vertical-align:top;padding:0 0 ${index === steps.length - 1 ? 0 : 14}px;"><div style="width:26px;height:26px;border-radius:999px;background:#00a1c6;color:#fff;text-align:center;font:700 13px/26px Arial,sans-serif;">${index + 1}</div></td><td style="padding:2px 0 ${index === steps.length - 1 ? 0 : 14}px;font:400 14px/1.5 Arial,sans-serif;"><strong>${esc(title)}</strong><br><span style="color:#5b6478;">${esc(body)}</span></td></tr>`,
      )
      .join("\n")}
  </table>
</td></tr>
${
  summary.length
    ? `<tr><td style="padding:24px 32px 0;">${label(isEstimate ? "Your request" : "Your enquiry")}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f9fc;border:1px solid #e4e8f0;border-radius:12px;"><tr><td style="padding:14px 16px;font:400 14px/1.6 Arial,sans-serif;white-space:pre-wrap;">${summary.join("<br>")}</td></tr></table></td></tr>`
    : ""
}
<tr><td style="padding:24px 32px 28px;">
  <p style="margin:0 0 14px;font:400 14px/1.6 Arial,sans-serif;color:#5b6478;">Need to speak sooner? Reply to this email, call us or message us on WhatsApp.</p>
  <table role="presentation" cellpadding="0" cellspacing="0"><tr>
    ${button(site.phoneHref, `Call ${site.phone}`, "primary")}
    ${button(`https://wa.me/${whatsappDigits}`, "WhatsApp us", "whatsapp")}
  </tr></table>
</td></tr>
<tr><td style="background:#0b1020;padding:22px 32px;font:400 12px/1.7 Arial,sans-serif;color:rgba(255,255,255,.7);">
  <strong style="color:#ffffff;">${esc(site.name)}</strong> · ${esc(site.address.street)}, ${esc(site.address.city)}, ${esc(site.address.region)} ${esc(site.address.postalCode)}<br>
  <a href="${esc(site.url)}" style="color:#5fe0f7;text-decoration:none;">${esc(site.url.replace(/^https?:\/\//, ""))}</a> · ${esc(site.salesEmail)} · ${esc(site.hours)}<br>
  You are receiving this because you submitted ${isEstimate ? "an estimate request" : "an enquiry"} on ${esc(site.url.replace(/^https?:\/\//, ""))}.
</td></tr>`;

  const text = [
    `Thank you, ${name}. ${isEstimate ? "Here is your project estimate." : "We have received your enquiry."}`,
    "",
    `A member of our team will contact you within one business day to arrange a free 30-minute consultation. Your reference is ${lead.reference}.`,
    ...(v.quote ? ["", `Indicative estimate: ${quoteText(v.quote)} (excludes GST; confirmed as a fixed quote after the consultation).`] : []),
    "",
    "What happens next:",
    ...steps.map(([title, body], index) => `${index + 1}. ${title}: ${body}`),
    "",
    `Call ${site.phone} · WhatsApp ${site.whatsapp} · ${site.salesEmail}`,
    `${site.name}, ${site.address.street}, ${site.address.city}`,
  ].join("\n");

  return { subject, html: shell(subject, `Reference ${lead.reference} · we will contact you within one business day`, inner), text };
}
