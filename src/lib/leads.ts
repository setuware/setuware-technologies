import { emailConfigured, emailLead } from "./lead-email";
import { addSubscriber } from "./cms/crm";
import { saveEnquiry } from "./cms/store";
import { leadView } from "./email-templates";
import { referenceId } from "./utils";
import { sendToZoho, zohoConfigured } from "./zoho-crm";

/**
 * Lead delivery.
 *
 * Enquiries are e-mailed when SMTP is configured (see ./lead-email.ts),
 * created as Leads in Zoho CRM when ZOHO_* is set (see ./zoho-crm.ts), and/or
 * forwarded to `LEAD_WEBHOOK_URL` (Slack, a CRM, Google Sheets via Apps
 * Script). A redacted trace is always written to the server log, and the
 * enquiry is saved to the admin's Enquiries inbox (sign-in required; no
 * public endpoint reads leads back out).
 */

export type LeadKind = "contact" | "newsletter" | "estimate" | "booking";

export interface Lead {
  kind: LeadKind;
  reference: string;
  receivedAt: string;
  payload: Record<string, unknown>;
}

export interface DeliveryResult {
  reference: string;
  delivered: boolean;
}

const WEBHOOK_TIMEOUT_MS = 4_000;

/** Values that must never reach a log line in full. */
const SENSITIVE_KEYS = new Set(["email", "phone"]);

function maskValue(value: unknown): unknown {
  if (typeof value !== "string" || value.length === 0) return value;
  if (value.includes("@")) {
    const [local, domain] = value.split("@");
    return `${local.slice(0, 2)}***@${domain}`;
  }
  return `***${value.slice(-4)}`;
}

/** Log-safe copy: enough to debug a delivery failure, not enough to leak PII. */
export function redact(payload: Record<string, unknown>): Record<string, unknown> {
  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    safe[key] = SENSITIVE_KEYS.has(key) ? maskValue(value) : value;
  }
  return safe;
}

export async function deliverLead(
  kind: LeadKind,
  payload: Record<string, unknown>,
): Promise<DeliveryResult> {
  const lead: Lead = {
    kind,
    reference: referenceId(),
    receivedAt: new Date().toISOString(),
    payload,
  };

  const webhook = process.env.LEAD_WEBHOOK_URL;
  const viaEmailEnabled = emailConfigured();
  const viaZohoEnabled = zohoConfigured() && kind !== "newsletter";

  // Always keep a redacted trace in the server log.
  console.info("[lead]", kind, lead.reference, redact(payload));
  storeEnquiry(lead);

  if (!webhook && !viaEmailEnabled && !viaZohoEnabled) {
    console.warn(
      "[lead] no delivery channel configured (set SMTP_*, ZOHO_* or LEAD_WEBHOOK_URL)",
      lead.reference,
    );
    return { reference: lead.reference, delivered: false };
  }

  // A slow or broken channel must never fail the visitor's submission.
  const [byEmail, byWebhook, byZoho] = await Promise.all([
    viaEmailEnabled ? emailLead(lead) : Promise.resolve(false),
    webhook ? postWebhook(webhook, lead) : Promise.resolve(false),
    viaZohoEnabled ? sendToZoho(lead) : Promise.resolve(false),
  ]);

  return { reference: lead.reference, delivered: byEmail || byWebhook || byZoho };
}

/** Saves the enquiry for the admin inbox. Never throws. */
function storeEnquiry(lead: Lead): void {
  try {
    if (lead.kind === "newsletter") {
      if (typeof lead.payload.email === "string") addSubscriber(lead.payload.email, String(lead.payload.source ?? "website"));
      return;
    }
    const view = leadView(lead);
    saveEnquiry({
      reference: lead.reference,
      kind: lead.kind,
      source: view.source,
      name: view.name,
      email: view.email,
      phone: view.phone,
      service: view.service,
      message: [view.slot ? `Consultation booked: ${view.slot}${view.mode ? ` (${view.mode})` : ""}` : "", view.message]
        .filter(Boolean)
        .join("\n\n"),
      payload: JSON.stringify(lead.payload),
      created_at: lead.receivedAt,
    });
  } catch (error) {
    console.error("[lead] could not save to the admin inbox", lead.reference, error instanceof Error ? error.message : error);
  }
}

async function postWebhook(webhook: string, lead: Lead): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(lead),
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeout);

    if (!response.ok) {
      console.error("[lead] webhook rejected", lead.kind, lead.reference, response.status);
      return false;
    }
    return true;
  } catch (error) {
    console.error(
      "[lead] webhook failed",
      lead.kind,
      lead.reference,
      error instanceof Error ? error.message : error,
    );
    return false;
  }
}
