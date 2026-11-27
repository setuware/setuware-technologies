import { site } from "./site";

/**
 * One look for every e-mail the site and the admin send: a navy-to-blue
 * header with the logo, a white body built from a few blocks (detail card,
 * meeting card, numbered steps, buttons, note), a signature and a footer.
 * Table layout with inline styles so it renders the same in Gmail, Outlook
 * and Apple Mail. Callers escape their own values with `esc`.
 */

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

export const BRAND = {
  navy: "#0b1a3a",
  blue: "#2f56d8",
  blueDark: "#1e3fae",
  teal: "#0a8ea6",
  ink: "#0b1020",
  body: "#1f2937",
  muted: "#5b6577",
  line: "#e3e8f0",
  tint: "#f4f7ff",
  tintLine: "#d6e0fb",
  page: "#eef2f8",
} as const;

const SANS = "Arial,Helvetica,sans-serif";

export function esc(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export const siteHost = () => site.url.replace(/^https?:\/\//, "");

/** A paragraph of body copy. `html` must already be escaped. */
export function paragraph(html: string): string {
  return `<p style="margin:0 0 16px;font:400 15px/1.7 ${SANS};color:${BRAND.body};">${html}</p>`;
}

export function link(href: string, label: string): string {
  return `<a href="${esc(href)}" style="color:${BRAND.blue};font-weight:700;text-decoration:none;">${esc(label)}</a>`;
}

/** Small capital heading above a block. */
export function eyebrow(text: string): string {
  return `<div style="margin:0 0 10px;font:700 11px/1 ${SANS};letter-spacing:.14em;color:${BRAND.blue};">${esc(text.toUpperCase())}</div>`;
}

export interface DetailRow {
  label: string;
  /** Already-escaped HTML. */
  html: string;
}

/** Label and value rows inside a tinted card. */
export function detailCard(title: string, rows: DetailRow[]): string {
  if (rows.length === 0) return "";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 22px;background:${BRAND.tint};border:1px solid ${BRAND.tintLine};border-radius:14px;">
<tr><td colspan="2" style="padding:18px 20px 8px;">${eyebrow(title)}</td></tr>
${rows
  .map(
    (row, index) =>
      `<tr><td valign="top" style="width:36%;padding:9px 12px 9px 20px;font:400 13px/1.5 ${SANS};color:${BRAND.muted};${index ? `border-top:1px solid ${BRAND.tintLine};` : ""}">${esc(row.label)}</td><td valign="top" style="padding:9px 20px 9px 0;font:700 14px/1.5 ${SANS};color:${BRAND.ink};word-break:break-word;${index ? `border-top:1px solid ${BRAND.tintLine};` : ""}">${row.html}</td></tr>`,
  )
  .join("\n")}
<tr><td colspan="2" style="padding:0 0 8px;"></td></tr></table>`;
}

export interface MeetingBlock {
  /** "NOV" */
  month: string;
  /** "27" */
  day: string;
  /** "Friday, 27 November 2026" */
  date: string;
  /** "11:30 am – 12:00 pm IST" */
  time: string;
  rows: DetailRow[];
}

/** Calendar tile with the date and time, then the meeting's details. */
export function meetingCard(title: string, meeting: MeetingBlock): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 22px;background:${BRAND.tint};border:1px solid ${BRAND.tintLine};border-radius:14px;">
<tr><td style="padding:20px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td valign="top" style="width:72px;">
<table role="presentation" width="64" cellpadding="0" cellspacing="0" style="width:64px;border-radius:12px;overflow:hidden;border:1px solid ${BRAND.tintLine};background:#ffffff;">
<tr><td align="center" bgcolor="${BRAND.blue}" style="padding:6px 0;font:700 11px/1 ${SANS};letter-spacing:.14em;color:#ffffff;">${esc(meeting.month.toUpperCase())}</td></tr>
<tr><td align="center" style="padding:8px 0 10px;font:700 26px/1 ${SANS};color:${BRAND.ink};">${esc(meeting.day)}</td></tr>
</table></td>
<td valign="top" style="padding-left:14px;">
${eyebrow(title)}
<div style="font:700 18px/1.35 ${SANS};color:${BRAND.ink};">${esc(meeting.date)}</div>
<div style="margin-top:4px;font:700 15px/1.4 ${SANS};color:${BRAND.blue};">${esc(meeting.time)}</div>
</td></tr></table>
${
  meeting.rows.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;border-top:1px solid ${BRAND.tintLine};">
${meeting.rows
  .map(
    (row) =>
      `<tr><td valign="top" style="width:34%;padding:10px 12px 0 0;font:400 13px/1.5 ${SANS};color:${BRAND.muted};">${esc(row.label)}</td><td valign="top" style="padding:10px 0 0;font:700 14px/1.5 ${SANS};color:${BRAND.ink};word-break:break-word;">${row.html}</td></tr>`,
  )
  .join("\n")}
</table>`
    : ""
}
</td></tr></table>`;
}

/** Numbered list. Items are already-escaped HTML. */
export function steps(title: string, items: string[]): string {
  if (items.length === 0) return "";
  return `<div style="margin:0 0 12px;font:700 15px/1.4 ${SANS};color:${BRAND.ink};">${esc(title)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;">
${items
  .map(
    (item, index) =>
      `<tr><td valign="top" style="width:34px;padding:0 0 12px;"><div style="width:24px;height:24px;border-radius:999px;background:${BRAND.blue};color:#ffffff;font:700 12px/24px ${SANS};text-align:center;">${index + 1}</div></td><td valign="top" style="padding:2px 0 12px;font:400 14px/1.65 ${SANS};color:${BRAND.body};">${item}</td></tr>`,
  )
  .join("\n")}
</table>`;
}

export interface Button {
  url: string;
  label: string;
  tone?: "primary" | "outline" | "whatsapp";
}

/** One row of buttons; the first is the main action. */
export function buttons(list: Button[]): string {
  if (list.length === 0) return "";
  const cell = ({ url, label, tone = "primary" }: Button) => {
    const fill = tone === "primary" ? BRAND.blue : tone === "whatsapp" ? "#1faa59" : "#ffffff";
    const color = tone === "outline" ? BRAND.ink : "#ffffff";
    const border = tone === "outline" ? `border:1px solid #cfd8e6;` : `border:1px solid ${fill};`;
    return `<td style="padding:0 10px 10px 0;"><a href="${esc(url)}" style="display:inline-block;background:${fill};${border}color:${color};padding:12px 22px;border-radius:999px;font:700 14px/1 ${SANS};text-decoration:none;">${esc(label)}</a></td>`;
  };
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:4px 0 14px;"><tr>${list.map(cell).join("")}</tr></table>`;
}

/** A highlighted note. `html` must already be escaped. */
export function note(html: string, tone: "info" | "warn" = "info"): string {
  const [background, border, color] = tone === "warn" ? ["#fff8e6", "#f5dfa3", "#6b5310"] : ["#f1f9fb", "#c5e6ee", "#0b4f5f"];
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;background:${background};border:1px solid ${border};border-radius:12px;"><tr><td style="padding:14px 16px;font:400 13px/1.6 ${SANS};color:${color};">${html}</td></tr></table>`;
}

/** A visitor's or sender's own words, kept as typed. */
export function quote(text: string): string {
  return `<div style="margin:0 0 20px;background:#f7f9fc;border-left:4px solid ${BRAND.blue};border-radius:0 12px 12px 0;padding:16px 18px;font:400 15px/1.65 ${SANS};color:${BRAND.ink};white-space:pre-wrap;">${esc(text)}</div>`;
}

export interface Signature {
  name: string;
  role?: string;
}

export interface Layout {
  subject: string;
  preheader: string;
  /** Short capital tag in the header, e.g. "Consultation confirmed". */
  tag?: string;
  heading: string;
  /** One line under the heading. Plain text. */
  subheading?: string;
  /** Body blocks, already-rendered HTML. */
  blocks: string[];
  signature?: Signature;
  /** Shows the phone, WhatsApp and e-mail line (customer-facing mail). */
  contactLine?: boolean;
  /** Why the reader received this e-mail. Plain text. */
  reason?: string;
}

function header(layout: Layout): string {
  return `<tr><td bgcolor="${BRAND.navy}" style="padding:28px 32px 30px;background:${BRAND.navy};background-image:linear-gradient(135deg,${BRAND.navy} 0%,#17337f 58%,${BRAND.blue} 100%);">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td valign="middle"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="width:42px;height:42px;background:#ffffff;border-radius:11px;text-align:center;"><img src="${esc(site.url)}/apple-icon" width="42" height="42" alt="SW" style="display:block;border:0;border-radius:11px;"></td>
<td style="padding-left:12px;"><div style="font:800 18px/1 ${SANS};letter-spacing:.06em;color:#ffffff;">SETUWARE</div><div style="margin-top:6px;font:700 10px/1 ${SANS};letter-spacing:.28em;color:#c7d4f5;">TECHNOLOGIES</div></td>
</tr></table></td>
${layout.tag ? `<td align="right" valign="middle"><span style="display:inline-block;background:#1f3f9c;border:1px solid #5b7ee6;border-radius:999px;padding:7px 12px;font:700 10px/1 ${SANS};letter-spacing:.12em;color:#dbe5ff;">${esc(layout.tag.toUpperCase())}</span></td>` : ""}
</tr></table>
<h1 style="margin:26px 0 0;font:700 25px/1.3 ${SANS};color:#ffffff;">${esc(layout.heading)}</h1>
${layout.subheading ? `<p style="margin:8px 0 0;font:400 14px/1.6 ${SANS};color:#c7d4f5;">${esc(layout.subheading)}</p>` : ""}
</td></tr>
<tr><td height="4" bgcolor="${BRAND.teal}" style="height:4px;line-height:4px;font-size:0;background:${BRAND.teal};background-image:linear-gradient(90deg,${BRAND.blue},${BRAND.teal});">&nbsp;</td></tr>`;
}

/** The whole e-mail: header, blocks, signature and footer. */
export function renderEmail(layout: Layout): string {
  const signature = layout.signature
    ? `<tr><td style="padding:0 32px 26px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${BRAND.line};"><tr><td style="padding-top:18px;font:400 14px/1.65 ${SANS};color:${BRAND.body};">Regards,<br><strong style="color:${BRAND.ink};">${esc(layout.signature.name)}</strong>${layout.signature.role ? `<br><span style="color:${BRAND.muted};">${esc(layout.signature.role)}</span>` : ""}</td></tr></table></td></tr>`
    : "";
  const contact = layout.contactLine
    ? `<tr><td bgcolor="#f7f9fc" style="padding:16px 32px;background:#f7f9fc;border-top:1px solid ${BRAND.line};font:400 13px/1.7 ${SANS};color:${BRAND.muted};"><strong style="color:${BRAND.ink};">Need us sooner?</strong> Call <a href="${esc(site.phoneHref)}" style="color:${BRAND.blue};text-decoration:none;font-weight:700;">${esc(site.phone)}</a> · <a href="${esc(site.whatsapp)}" style="color:${BRAND.blue};text-decoration:none;font-weight:700;">WhatsApp</a> · <a href="mailto:${esc(site.email)}" style="color:${BRAND.blue};text-decoration:none;font-weight:700;">${esc(site.email)}</a><br>${esc(site.hours)}</td></tr>`
    : "";
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light only"><title>${esc(layout.subject)}</title></head>
<body bgcolor="${BRAND.page}" style="margin:0;padding:0;background:${BRAND.page};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(layout.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${BRAND.page}" style="background:${BRAND.page};"><tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid ${BRAND.line};">
${header(layout)}
<tr><td style="padding:30px 32px 10px;">
${layout.blocks.filter(Boolean).join("\n")}
</td></tr>
${signature}
${contact}
</table>
<p style="margin:16px 0 0;font:400 12px/1.7 ${SANS};color:${BRAND.muted};">${esc(site.name)} · ${esc(site.address.street)}, ${esc(site.address.city)}, ${esc(site.address.region)} · <a href="${esc(site.url)}" style="color:${BRAND.muted};">${esc(siteHost())}</a>${layout.reason ? `<br>${esc(layout.reason)}` : ""}</p>
</td></tr></table></body></html>`;
}

/** Turns typed text (blank lines between paragraphs) into body paragraphs, linking bare URLs. */
export function textToBlocks(text: string): string[] {
  return text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) =>
      paragraph(
        esc(part)
          .replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)])/g, `<a href="$1" style="color:${BRAND.blue};text-decoration:none;font-weight:700;">$1</a>`)
          .replaceAll("\n", "<br>"),
      ),
    );
}
