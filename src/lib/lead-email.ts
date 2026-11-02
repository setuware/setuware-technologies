import nodemailer, { type Transporter } from "nodemailer";

import type { Lead } from "./leads";

/**
 * Optional e-mail delivery for website enquiries.
 *
 * Enabled when SMTP_HOST, SMTP_USER and SMTP_PASS are set. Works with any
 * SMTP provider (Zoho Mail, Google Workspace, Hostinger, Amazon SES, …):
 *
 *   SMTP_HOST=smtp.zoho.in
 *   SMTP_PORT=465            # 465 = implicit TLS, 587 = STARTTLS
 *   SMTP_USER=no-reply@setuware.in
 *   SMTP_PASS=app-password
 *   LEAD_EMAIL_TO=sales@setuware.in        # comma-separated, optional
 *   LEAD_EMAIL_FROM="Setuware Website <no-reply@setuware.in>"  # optional
 */

const SUBJECTS: Record<Lead["kind"], string> = {
  contact: "New project enquiry",
  estimate: "New estimate request",
  newsletter: "New newsletter subscriber",
};

let transporter: Transporter | null = null;

export function emailConfigured(env: Record<string, string | undefined> = process.env): boolean {
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
}

function getTransporter(): Transporter {
  if (transporter) return transporter;
  const port = Number(process.env.SMTP_PORT ?? 465);
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 8_000,
    greetingTimeout: 8_000,
    socketTimeout: 10_000,
  });
  return transporter;
}

const LABELS: Record<string, string> = {
  name: "Name",
  email: "Email",
  phone: "Phone",
  company: "Company",
  service: "Service",
  budget: "Budget",
  message: "Message",
  source: "Source",
  notes: "Notes",
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function stringify(value: unknown): string {
  if (value === undefined || value === null || value === "") return "";
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

/** Visible rows, skipping internal fields. */
function rows(payload: Record<string, unknown>): [string, string][] {
  const hidden = new Set(["consent", "honeypot", "elapsedMs"]);
  return Object.entries(payload)
    .filter(([key, value]) => !hidden.has(key) && stringify(value) !== "")
    .map(([key, value]) => [LABELS[key] ?? key, stringify(value)]);
}

export function formatLeadEmail(lead: Lead): { subject: string; text: string; html: string } {
  const name = typeof lead.payload.name === "string" ? lead.payload.name : "";
  const subject = `${SUBJECTS[lead.kind]}${name ? ` from ${name}` : ""} · ${lead.reference}`;
  const list = rows(lead.payload);

  const text = [
    `${SUBJECTS[lead.kind]} (${lead.reference})`,
    `Received: ${lead.receivedAt}`,
    "",
    ...list.map(([label, value]) => `${label}: ${value}`),
  ].join("\n");

  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#0b1020">
<h2 style="margin:0 0 4px">${escapeHtml(SUBJECTS[lead.kind])}</h2>
<p style="margin:0 0 16px;color:#5b6478">Reference ${escapeHtml(lead.reference)} · ${escapeHtml(lead.receivedAt)}</p>
<table cellpadding="8" style="border-collapse:collapse">
${list
  .map(
    ([label, value]) =>
      `<tr><td style="border:1px solid #e4e8f0;font-weight:bold;vertical-align:top">${escapeHtml(label)}</td><td style="border:1px solid #e4e8f0;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`,
  )
  .join("\n")}
</table></body></html>`;

  return { subject, text, html };
}

/** Sends the lead by e-mail. Resolves to false (never throws) on failure. */
export async function emailLead(lead: Lead): Promise<boolean> {
  if (!emailConfigured()) return false;
  const to = process.env.LEAD_EMAIL_TO ?? "sales@setuware.in";
  const from = process.env.LEAD_EMAIL_FROM ?? `Setuware Website <${process.env.SMTP_USER}>`;
  const replyTo = typeof lead.payload.email === "string" ? lead.payload.email : undefined;
  const { subject, text, html } = formatLeadEmail(lead);

  try {
    await getTransporter().sendMail({ from, to, replyTo, subject, text, html });
    return true;
  } catch (error) {
    console.error(
      "[lead] email failed",
      lead.kind,
      lead.reference,
      error instanceof Error ? error.message : error,
    );
    return false;
  }
}
