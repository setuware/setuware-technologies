import { fetchZohoLeads, zohoConfigured, type ZohoLead } from "@/lib/zoho-crm";

import { getDb } from "./db";

/**
 * Zoho CRM leads mirrored into the admin so the team can work on them.
 * Zoho stays the source of truth: sync pulls changes in; status, owner and
 * notes made in the admin are written back (see the lead actions).
 */

export interface CrmLead {
  id: number;
  zoho_id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  status: string;
  zoho_owner: string;
  zoho_owner_email: string;
  description: string;
  created_time: string;
  modified_time: string;
  assignee: string | null;
  follow_up_at: string | null;
  synced_at: string;
}

/** Zoho's standard Lead Status values; statuses seen in synced data are added. */
export const DEFAULT_LEAD_STATUSES = [
  "Not Contacted",
  "Attempted to Contact",
  "Contacted",
  "Contact in Future",
  "Pre-Qualified",
  "Not Qualified",
  "Junk Lead",
  "Lost Lead",
];

export function leadStatuses(): string[] {
  const seen = (getDb().prepare("SELECT DISTINCT status FROM crm_leads WHERE status != ''").all() as { status: string }[]).map((row) => row.status);
  return [...new Set([...DEFAULT_LEAD_STATUSES, ...seen])];
}

export function listLeads(filter: { q?: string; status?: string; source?: string; assignee?: string } = {}): CrmLead[] {
  const where = ["removed = 0"];
  const params: unknown[] = [];
  if (filter.status) {
    where.push("status = ?");
    params.push(filter.status);
  }
  if (filter.source) {
    where.push("source = ?");
    params.push(filter.source);
  }
  if (filter.assignee) {
    where.push("assignee = ?");
    params.push(filter.assignee);
  }
  if (filter.q) {
    where.push("(name LIKE ? OR email LIKE ? OR phone LIKE ? OR company LIKE ? OR description LIKE ?)");
    const like = `%${filter.q}%`;
    params.push(like, like, like, like, like);
  }
  return getDb()
    .prepare(`SELECT * FROM crm_leads WHERE ${where.join(" AND ")} ORDER BY modified_time DESC LIMIT 1000`)
    .all(...params) as CrmLead[];
}

export function getLead(id: number): CrmLead | null {
  return (getDb().prepare("SELECT * FROM crm_leads WHERE id = ?").get(id) as CrmLead | undefined) ?? null;
}

export function leadSources(): string[] {
  return (getDb().prepare("SELECT DISTINCT source FROM crm_leads WHERE source != '' ORDER BY source").all() as { source: string }[]).map((row) => row.source);
}

/** Website enquiry that created this lead, if any. */
export function enquiryForLead(zohoId: string): number | null {
  const row = getDb().prepare("SELECT id FROM enquiries WHERE zoho_id = ? ORDER BY id DESC LIMIT 1").get(zohoId) as { id: number } | undefined;
  return row?.id ?? null;
}

export function leadIdForZoho(zohoId: string): number | null {
  const row = getDb().prepare("SELECT id FROM crm_leads WHERE zoho_id = ?").get(zohoId) as { id: number } | undefined;
  return row?.id ?? null;
}

function name(lead: ZohoLead): string {
  return (lead.Full_Name || [lead.First_Name, lead.Last_Name].filter(Boolean).join(" ") || lead.Email || "Unnamed lead").trim();
}

/** Inserts or refreshes one Zoho lead; keeps the local follow-up date. */
export function upsertLead(lead: ZohoLead, staffByEmail: Map<string, string>): void {
  const now = new Date().toISOString();
  const ownerEmail = (lead.Owner?.email ?? "").toLowerCase();
  const staff = staffByEmail.get(ownerEmail) ?? null;
  getDb()
    .prepare(
      `INSERT INTO crm_leads (zoho_id,name,email,phone,company,source,status,zoho_owner,zoho_owner_email,description,created_time,modified_time,assignee,synced_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
       ON CONFLICT(zoho_id) DO UPDATE SET
         name = excluded.name, email = excluded.email, phone = excluded.phone, company = excluded.company,
         source = excluded.source, status = excluded.status, zoho_owner = excluded.zoho_owner,
         zoho_owner_email = excluded.zoho_owner_email, description = excluded.description,
         modified_time = excluded.modified_time, synced_at = excluded.synced_at, removed = 0,
         assignee = COALESCE(excluded.assignee, crm_leads.assignee)`,
    )
    .run(
      lead.id,
      name(lead),
      lead.Email ?? "",
      lead.Mobile || lead.Phone || "",
      lead.Company ?? "",
      lead.Lead_Source ?? "",
      lead.Lead_Status ?? "",
      lead.Owner?.name ?? "",
      ownerEmail,
      lead.Description ?? "",
      lead.Created_Time ?? now,
      lead.Modified_Time ?? now,
      staff,
      now,
    );
}

function setting(key: string): string | null {
  const row = getDb().prepare("SELECT value FROM settings WHERE key = ?").get(key) as { value: string } | undefined;
  return row ? (JSON.parse(row.value) as string) : null;
}

function setSettingValue(key: string, value: string | null): void {
  getDb()
    .prepare("INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    .run(key, JSON.stringify(value));
}

export function lastSync(): { at: string | null; error: string | null; count: number } {
  return {
    at: setting("crm_last_sync_at"),
    error: setting("crm_last_sync_error"),
    count: (getDb().prepare("SELECT COUNT(*) AS n FROM crm_leads WHERE removed = 0").get() as { n: number }).n,
  };
}

/**
 * Pulls leads changed since the last sync (everything the first time).
 * Safe to call often: a lock stops overlapping runs.
 */
export async function syncLeads(options: { full?: boolean } = {}): Promise<{ synced: number; error?: string }> {
  if (!zohoConfigured()) return { synced: 0, error: "Zoho CRM is not connected (ZOHO_* settings)." };
  const running = setting("crm_sync_running");
  if (running && Date.parse(running) > Date.now() - 2 * 60_000) return { synced: 0, error: "A sync is already running." };
  setSettingValue("crm_sync_running", new Date().toISOString());
  try {
    const since = options.full ? undefined : setting("crm_last_modified") ?? undefined;
    const leads = await fetchZohoLeads(since);
    const staff = new Map(
      (getDb().prepare("SELECT email, name FROM users WHERE active = 1").all() as { email: string; name: string }[]).map((row) => [row.email.toLowerCase(), row.name]),
    );
    let newest = since ?? "";
    for (const lead of leads) {
      upsertLead(lead, staff);
      if (lead.Modified_Time && lead.Modified_Time > newest) newest = lead.Modified_Time;
    }
    if (newest) setSettingValue("crm_last_modified", newest);
    setSettingValue("crm_last_sync_at", new Date().toISOString());
    setSettingValue("crm_last_sync_error", null);
    return { synced: leads.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    setSettingValue("crm_last_sync_error", message);
    console.error("[crm] sync failed", message);
    return { synced: 0, error: message };
  } finally {
    setSettingValue("crm_sync_running", null);
  }
}

/** Runs a background sync when the last one is older than `minutes`. */
export function syncIfStale(minutes = 10): Promise<unknown> | null {
  const at = setting("crm_last_sync_at");
  if (at && Date.parse(at) > Date.now() - minutes * 60_000) return null;
  return syncLeads();
}

/** Open leads (not junk, lost or unqualified) and follow-ups due, optionally for one person. */
export function leadCounts(assignee?: string): { open: number; due: number } {
  const mine = assignee ? " AND assignee = ?" : "";
  const args = assignee ? [assignee] : [];
  const db = getDb();
  const open = (db
    .prepare(`SELECT COUNT(*) AS n FROM crm_leads WHERE removed = 0 AND status NOT IN ('Junk Lead','Lost Lead','Not Qualified')${mine}`)
    .get(...args) as { n: number }).n;
  const due = (db
    .prepare(`SELECT COUNT(*) AS n FROM crm_leads WHERE removed = 0 AND follow_up_at IS NOT NULL AND follow_up_at <= ? AND status NOT IN ('Junk Lead','Lost Lead','Not Qualified')${mine}`)
    .get(new Date().toISOString().slice(0, 10), ...args) as { n: number }).n;
  return { open, due };
}
