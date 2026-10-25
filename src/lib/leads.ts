import { referenceId } from "./utils";

/**
 * Lead delivery.
 *
 * Enquiries are forwarded to whatever `LEAD_WEBHOOK_URL` points at (Slack, a
 * CRM, an email relay) and otherwise written to the server log. Nothing is
 * stored in process memory and no endpoint reads leads back out — a marketing
 * site should never become an unauthenticated database of its visitors'
 * contact details.
 */

export type LeadKind = "contact" | "newsletter" | "estimate";

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

  if (!webhook) {
    console.info("[lead]", kind, lead.reference, redact(payload));
    return { reference: lead.reference, delivered: false };
  }

  // A slow or broken webhook must never fail the visitor's submission: we
  // already hold the lead in the log, so this is best-effort.
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
      console.error("[lead] webhook rejected", kind, lead.reference, response.status);
      return { reference: lead.reference, delivered: false };
    }

    return { reference: lead.reference, delivered: true };
  } catch (error) {
    console.error(
      "[lead] webhook failed",
      kind,
      lead.reference,
      error instanceof Error ? error.message : error,
    );
    return { reference: lead.reference, delivered: false };
  }
}
