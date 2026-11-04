import nodemailer, { type Transporter } from "nodemailer";

import { buildInvite, MEETING_MODES, type MeetingMode } from "./booking";
import { acknowledgementEmail, teamEmail, type EmailContent } from "./email-templates";
import type { Lead } from "./leads";
import { site } from "./site";
import { founder } from "./team";

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
 *   LEAD_EMAIL_FROM="Setuware Technologies <sales@setuware.in>"  # optional; must be the SMTP mailbox for Zoho
 *   LEAD_SEND_ACK=true       # thank-you e-mail to the visitor (default on)
 *
 * Templates live in ./email-templates.ts. Test the settings on the server
 * with `npm run mail:test`.
 */

let transporter: Transporter | null = null;

export function emailConfigured(env: Record<string, string | undefined> = process.env): boolean {
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
}

/** Thank-you e-mail to the visitor; on unless LEAD_SEND_ACK=false. */
export function acknowledgementEnabled(env: Record<string, string | undefined> = process.env): boolean {
  return (env.LEAD_SEND_ACK ?? "true").toLowerCase() !== "false";
}

export function getTransporter(): Transporter {
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

/** The team notification (kept for callers and tests). */
export function formatLeadEmail(lead: Lead): EmailContent {
  return teamEmail(lead);
}

function sender(): string {
  return process.env.LEAD_EMAIL_FROM ?? `Setuware Technologies <${process.env.SMTP_USER}>`;
}

/** Bare address of the sending mailbox (from LEAD_EMAIL_FROM or SMTP_USER). */
export function senderAddress(): string {
  const from = process.env.LEAD_EMAIL_FROM ?? "";
  return from.match(/<([^>]+)>/)?.[1] ?? (from.includes("@") ? from.trim() : (process.env.SMTP_USER ?? ""));
}

/**
 * The visitor's copy comes from a person, not a brand: mail from a named
 * sender reads as correspondence and is less likely to be filed as promotion.
 */
function personalSender() {
  return { name: `${founder.name} | ${site.name}`, address: senderAddress() };
}

/** Calendar invite for a consultation booking, attached to both e-mails. */
function bookingInvite(lead: Lead): { method: string; content: string } | undefined {
  if (lead.kind !== "booking") return undefined;
  const p = lead.payload;
  const slot = typeof p.slot === "string" ? p.slot : "";
  const email = typeof p.email === "string" ? p.email : "";
  if (!slot || !email) return undefined;
  const name = typeof p.name === "string" ? p.name : email;
  const mode = typeof p.mode === "string" && p.mode in MEETING_MODES ? MEETING_MODES[p.mode as MeetingMode] : "";
  const phone = typeof p.phone === "string" ? p.phone : "";
  const topic = typeof p.topic === "string" ? p.topic : "";
  const notes = typeof p.notes === "string" ? p.notes : "";
  return {
    method: "REQUEST",
    content: buildInvite({
      uid: `${lead.reference}@${site.url.replace(/^https?:\/\//, "")}`,
      startIso: slot,
      summary: `Consultation: ${site.name} and ${name}`,
      description: [
        "Free 30-minute consultation.",
        mode ? `Format: ${mode}.` : "",
        phone ? `Phone: ${phone}` : "",
        topic ? `Topic: ${topic}` : "",
        notes ? `Notes: ${notes}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      location: mode.startsWith("Video") ? "Google Meet (link to follow)" : `Phone call${phone ? ` to ${phone}` : ""}`,
      organizer: { name: site.name, email: senderAddress() },
      attendee: { name, email },
    }),
  };
}

function inbox(): string {
  return process.env.LEAD_EMAIL_TO ?? "sales@setuware.in";
}

/**
 * Sends the team notification and, for contact and estimate requests, a
 * thank-you e-mail to the visitor. Resolves to whether the team e-mail was
 * sent; never throws.
 */
export async function emailLead(lead: Lead): Promise<boolean> {
  if (!emailConfigured()) return false;
  const visitor = typeof lead.payload.email === "string" ? lead.payload.email : undefined;
  const team = teamEmail(lead);
  const invite = bookingInvite(lead);

  let delivered = false;
  try {
    await getTransporter().sendMail({
      from: sender(),
      to: inbox(),
      replyTo: visitor,
      subject: team.subject,
      text: team.text,
      html: team.html,
      ...(invite ? { icalEvent: invite } : {}),
    });
    delivered = true;
    console.info("[lead] email sent", lead.kind, lead.reference);
  } catch (error) {
    console.error(
      "[lead] email failed",
      lead.kind,
      lead.reference,
      error instanceof Error ? error.message : error,
    );
  }

  const ack = acknowledgementEnabled() ? acknowledgementEmail(lead) : null;
  if (ack && visitor) {
    try {
      await getTransporter().sendMail({
        from: personalSender(),
        to: visitor,
        replyTo: inbox(),
        subject: ack.subject,
        text: ack.text,
        html: ack.html,
        ...(invite ? { icalEvent: invite } : {}),
      });
      console.info("[lead] acknowledgement sent", lead.kind, lead.reference);
    } catch (error) {
      console.error(
        "[lead] acknowledgement failed",
        lead.kind,
        lead.reference,
        error instanceof Error ? error.message : error,
      );
    }
  }

  return delivered;
}
