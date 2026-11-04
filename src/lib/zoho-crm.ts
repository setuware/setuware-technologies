import { leadView } from "./email-templates";
import type { Lead } from "./leads";

/**
 * Zoho CRM (also part of Zoho CRM Plus): each website enquiry becomes a Lead.
 *
 * Enabled when ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET and ZOHO_REFRESH_TOKEN are
 * set (a "Self Client" in the Zoho API console; see docs/zoho-crm.md).
 *
 *   ZOHO_ACCOUNTS_URL=https://accounts.zoho.in   # .com / .eu / .com.au for other data centres
 *   ZOHO_API_DOMAIN=https://www.zohoapis.in
 *   ZOHO_LEAD_SOURCE=Website                     # must exist in the Lead Source picklist
 *
 * A returning visitor (same e-mail, when Email is a unique field in the CRM)
 * gets a Note on their existing Lead instead of a duplicate. Newsletter
 * sign-ups are not sent. Never throws.
 */

type Env = Record<string, string | undefined>;

const TIMEOUT_MS = 8_000;

export function zohoConfigured(env: Env = process.env): boolean {
  return Boolean(env.ZOHO_CLIENT_ID && env.ZOHO_CLIENT_SECRET && env.ZOHO_REFRESH_TOKEN);
}

function accountsUrl(): string {
  return (process.env.ZOHO_ACCOUNTS_URL ?? "https://accounts.zoho.in").replace(/\/$/, "");
}

function apiBase(): string {
  const domain = (process.env.ZOHO_API_DOMAIN ?? "https://www.zohoapis.in").replace(/\/$/, "");
  return `${domain}/crm/${process.env.ZOHO_API_VERSION ?? "v7"}`;
}

let cachedToken: { value: string; expiresAt: number } | null = null;

/** Test hook: forget the cached access token. */
export function resetZohoToken(): void {
  cachedToken = null;
}

async function call(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal, cache: "no-store" });
  } finally {
    clearTimeout(timer);
  }
}

/** Access tokens last an hour; one is reused until a minute before expiry. */
export async function zohoAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;
  const params = new URLSearchParams({
    refresh_token: process.env.ZOHO_REFRESH_TOKEN ?? "",
    client_id: process.env.ZOHO_CLIENT_ID ?? "",
    client_secret: process.env.ZOHO_CLIENT_SECRET ?? "",
    grant_type: "refresh_token",
  });
  const response = await call(`${accountsUrl()}/oauth/v2/token?${params.toString()}`, { method: "POST" });
  const data = (await response.json().catch(() => ({}))) as { access_token?: string; expires_in?: number; error?: string };
  if (!response.ok || !data.access_token) {
    throw new Error(`token refresh failed: ${data.error ?? response.status}`);
  }
  cachedToken = { value: data.access_token, expiresAt: Date.now() + ((data.expires_in ?? 3600) - 60) * 1000 };
  return data.access_token;
}

function splitName(full: string): { first: string; last: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { first: "", last: parts[0] ?? "Website visitor" };
  return { first: parts.slice(0, -1).join(" "), last: parts[parts.length - 1] };
}

/** Plain-text summary for the Lead's Description and for Notes. */
export function leadDescription(lead: Lead): string {
  const v = leadView(lead);
  const lines = [
    `Source: ${v.source}`,
    v.service ? `Service: ${v.service}` : "",
    v.budget ? `Budget: ${v.budget}` : "",
    v.quote ? `Estimate shown: ₹${v.quote.low.toLocaleString("en-IN")} – ₹${v.quote.high.toLocaleString("en-IN")}${v.quote.weeks ? `, about ${v.quote.weeks} weeks` : ""}` : "",
    v.slot ? `Consultation booked: ${v.slot}${v.mode ? ` (${v.mode})` : ""}` : "",
    `Website reference: ${lead.reference}`,
    v.message ? `\n${v.message}` : "",
  ];
  return lines.filter(Boolean).join("\n").slice(0, 32_000);
}

export function zohoLeadRecord(lead: Lead, includeSource = true): Record<string, unknown> {
  const v = leadView(lead);
  const { first, last } = splitName(v.name || v.email.split("@")[0] || "");
  const record: Record<string, unknown> = {
    Last_Name: last,
    Company: v.company || v.name || "Individual",
    Email: v.email || undefined,
    Phone: v.phone || undefined,
    Description: leadDescription(lead),
  };
  if (first) record.First_Name = first;
  if (includeSource) record.Lead_Source = process.env.ZOHO_LEAD_SOURCE ?? "Website";
  return record;
}

interface ZohoResult {
  code?: string;
  status?: string;
  message?: string;
  details?: { id?: string; api_name?: string; duplicate_record?: { id?: string } };
}

async function insertLead(token: string, record: Record<string, unknown>): Promise<ZohoResult> {
  const response = await call(`${apiBase()}/Leads`, {
    method: "POST",
    headers: { Authorization: `Zoho-oauthtoken ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ data: [record], trigger: ["workflow", "approval", "blueprint"] }),
  });
  const body = (await response.json().catch(() => ({}))) as { data?: ZohoResult[] } & ZohoResult;
  return body.data?.[0] ?? body;
}

async function addNote(token: string, leadId: string, lead: Lead): Promise<boolean> {
  const response = await call(`${apiBase()}/Leads/${leadId}/Notes`, {
    method: "POST",
    headers: { Authorization: `Zoho-oauthtoken ${token}`, "content-type": "application/json" },
    body: JSON.stringify({
      data: [{ Note_Title: `New website enquiry (${leadView(lead).source})`, Note_Content: leadDescription(lead) }],
    }),
  });
  return response.ok;
}

/** Zoho lead id of the last successful create or match, by website reference. */
export const zohoIdsByReference = new Map<string, string>();

/** Creates the Lead (or a Note on an existing one). Resolves to success. */
export async function sendToZoho(lead: Lead): Promise<boolean> {
  if (!zohoConfigured() || lead.kind === "newsletter") return false;
  try {
    const token = await zohoAccessToken();
    let result = await insertLead(token, zohoLeadRecord(lead));

    // The Lead Source value is not in the picklist: save the lead without it.
    if (result.code === "INVALID_DATA" && result.details?.api_name === "Lead_Source") {
      console.warn("[lead] zoho: add the Lead Source value", process.env.ZOHO_LEAD_SOURCE ?? "Website");
      result = await insertLead(token, zohoLeadRecord(lead, false));
    }

    if (result.code === "SUCCESS") {
      console.info("[lead] zoho lead created", lead.kind, lead.reference, result.details?.id);
      if (result.details?.id) zohoIdsByReference.set(lead.reference, result.details.id);
      return true;
    }

    const existing = result.details?.duplicate_record?.id ?? result.details?.id;
    if (result.code === "DUPLICATE_DATA" && existing) {
      zohoIdsByReference.set(lead.reference, existing);
      const noted = await addNote(token, existing, lead);
      console.info("[lead] zoho note added to existing lead", lead.reference, noted);
      return noted;
    }

    console.error("[lead] zoho rejected", lead.kind, lead.reference, result.code, result.message);
    return false;
  } catch (error) {
    console.error("[lead] zoho failed", lead.kind, lead.reference, error instanceof Error ? error.message : error);
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/* Reading and updating leads (CRM Leads workspace in the admin)               */
/* -------------------------------------------------------------------------- */

export interface ZohoLead {
  id: string;
  First_Name?: string | null;
  Last_Name?: string | null;
  Full_Name?: string | null;
  Email?: string | null;
  Phone?: string | null;
  Mobile?: string | null;
  Company?: string | null;
  Lead_Source?: string | null;
  Lead_Status?: string | null;
  Description?: string | null;
  Created_Time?: string;
  Modified_Time?: string;
  Owner?: { id: string; name?: string; email?: string } | null;
}

const LEAD_FIELDS = "First_Name,Last_Name,Full_Name,Email,Phone,Mobile,Company,Lead_Source,Lead_Status,Description,Created_Time,Modified_Time,Owner";

async function zohoJson(path: string, init: RequestInit = {}, extraHeaders: Record<string, string> = {}): Promise<{ status: number; body: Record<string, unknown> }> {
  const token = await zohoAccessToken();
  const response = await call(`${apiBase()}${path}`, {
    ...init,
    headers: { Authorization: `Zoho-oauthtoken ${token}`, "content-type": "application/json", ...extraHeaders },
  });
  if (response.status === 204) return { status: 204, body: {} };
  const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) throw new Error(`Zoho ${response.status}: ${String(body.code ?? "")} ${String(body.message ?? "")}`.trim());
  return { status: response.status, body };
}

/** Leads changed since `since` (ISO), newest first, up to `maxPages` × 200. */
export async function fetchZohoLeads(since?: string, maxPages = 10): Promise<ZohoLead[]> {
  const leads: ZohoLead[] = [];
  for (let page = 1; page <= maxPages; page += 1) {
    const { status, body } = await zohoJson(
      `/Leads?fields=${LEAD_FIELDS}&per_page=200&page=${page}&sort_by=Modified_Time&sort_order=desc`,
      { method: "GET" },
      since ? { "If-Modified-Since": since } : {},
    );
    if (status === 204) break;
    leads.push(...((body.data as ZohoLead[] | undefined) ?? []));
    const info = body.info as { more_records?: boolean } | undefined;
    if (!info?.more_records) break;
  }
  return leads;
}

export async function updateZohoLead(id: string, fields: Record<string, unknown>): Promise<void> {
  await zohoJson(`/Leads/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify({ data: [fields], trigger: ["workflow"] }) });
}

export async function addZohoLeadNote(id: string, title: string, content: string): Promise<void> {
  await zohoJson(`/Leads/${encodeURIComponent(id)}/Notes`, {
    method: "POST",
    body: JSON.stringify({ data: [{ Note_Title: title.slice(0, 120), Note_Content: content.slice(0, 30_000) }] }),
  });
}

let zohoUsersCache: { at: number; users: { id: string; name: string; email: string }[] } | null = null;

/** Active Zoho CRM users, for mapping admin staff to lead owners by e-mail. */
export async function zohoUsers(): Promise<{ id: string; name: string; email: string }[]> {
  if (zohoUsersCache && zohoUsersCache.at > Date.now() - 30 * 60_000) return zohoUsersCache.users;
  const { body } = await zohoJson("/users?type=ActiveUsers&per_page=200", { method: "GET" });
  const users = ((body.users as { id: string; full_name?: string; email?: string }[] | undefined) ?? []).map((user) => ({
    id: String(user.id),
    name: user.full_name ?? "",
    email: (user.email ?? "").toLowerCase(),
  }));
  zohoUsersCache = { at: Date.now(), users };
  return users;
}
