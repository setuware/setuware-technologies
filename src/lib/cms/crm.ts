import { readdir, stat, unlink } from "node:fs/promises";
import path from "node:path";

import { dataDir, getDb } from "./db";
import type { ApplicationRecord, EnquiryRecord } from "./store";

/**
 * Team workflow on top of the CMS: timelines, e-mail templates, assignment,
 * follow-ups, subscribers, page views, site settings, search and analytics.
 */

type Entity = "enquiry" | "application" | "lead";

/* -------------------------------------------------------------------------- */
/* Timeline                                                                    */
/* -------------------------------------------------------------------------- */

export interface Note {
  id: number;
  kind: "note" | "status" | "email" | "assign" | "system";
  author: string;
  body: string;
  created_at: string;
}

export function addNote(entity: Entity | "task", id: number, kind: Note["kind"], author: string, body: string): void {
  getDb()
    .prepare("INSERT INTO notes (entity,entity_id,kind,author,body,created_at) VALUES (?,?,?,?,?,?)")
    .run(entity, id, kind, author, body.slice(0, 20_000), new Date().toISOString());
}

export function timeline(entity: Entity | "task", id: number): Note[] {
  return getDb()
    .prepare("SELECT id,kind,author,body,created_at FROM notes WHERE entity = ? AND entity_id = ? ORDER BY id DESC")
    .all(entity, id) as Note[];
}

/* -------------------------------------------------------------------------- */
/* Assignment, follow-ups, ratings                                             */
/* -------------------------------------------------------------------------- */

const TABLE: Record<Entity, string> = { enquiry: "enquiries", application: "applications", lead: "crm_leads" };

export function setAssignee(entity: Entity, id: number, assignee: string | null): void {
  getDb().prepare(`UPDATE ${TABLE[entity]} SET assignee = ? WHERE id = ?`).run(assignee, id);
}

export function setStatus(entity: Entity, id: number, status: string): void {
  getDb().prepare(`UPDATE ${TABLE[entity]} SET status = ? WHERE id = ?`).run(status, id);
}

export function setFollowUp(id: number, when: string | null, entity: "enquiry" | "lead" = "enquiry"): void {
  getDb().prepare(`UPDATE ${TABLE[entity]} SET follow_up_at = ? WHERE id = ?`).run(when, id);
}

export function setRating(id: number, rating: number | null): void {
  getDb().prepare("UPDATE applications SET rating = ? WHERE id = ?").run(rating, id);
}

export function setInterview(id: number, when: string | null): void {
  getDb().prepare("UPDATE applications SET interview_at = ? WHERE id = ?").run(when, id);
}

/** Open enquiries whose follow-up date is today or earlier. */
export function followUpsDue(assignee?: string): EnquiryRecord[] {
  const today = new Date().toISOString().slice(0, 10);
  const mine = assignee ? " AND assignee = ?" : "";
  return getDb()
    .prepare(
      `SELECT * FROM enquiries WHERE follow_up_at IS NOT NULL AND follow_up_at <= ? AND status NOT IN ('won','lost','spam')${mine} ORDER BY follow_up_at`,
    )
    .all(...(assignee ? [today, assignee] : [today])) as EnquiryRecord[];
}

export function upcomingInterviews(): ApplicationRecord[] {
  return getDb()
    .prepare("SELECT * FROM applications WHERE interview_at IS NOT NULL AND interview_at >= ? ORDER BY interview_at LIMIT 10")
    .all(new Date().toISOString().slice(0, 16)) as ApplicationRecord[];
}

export function bulkStatus(entity: Entity, ids: number[], status: string, author: string): number {
  const update = getDb().prepare(`UPDATE ${TABLE[entity]} SET status = ? WHERE id = ?`);
  for (const id of ids) {
    update.run(status, id);
    addNote(entity, id, "status", author, `Status changed to ${status} (bulk)`);
  }
  return ids.length;
}

/* -------------------------------------------------------------------------- */
/* E-mail templates                                                            */
/* -------------------------------------------------------------------------- */

export interface EmailTemplate {
  id: number;
  name: string;
  audience: "enquiry" | "application";
  subject: string;
  body: string;
  updated_at: string;
}

export function listTemplates(audience?: "enquiry" | "application"): EmailTemplate[] {
  return (audience
    ? getDb().prepare("SELECT * FROM email_templates WHERE audience = ? ORDER BY name").all(audience)
    : getDb().prepare("SELECT * FROM email_templates ORDER BY audience, name").all()) as EmailTemplate[];
}

export function saveTemplate(input: Omit<EmailTemplate, "id" | "updated_at">, id?: number): void {
  const now = new Date().toISOString();
  if (id) {
    getDb()
      .prepare("UPDATE email_templates SET name=?,audience=?,subject=?,body=?,updated_at=? WHERE id=?")
      .run(input.name, input.audience, input.subject, input.body, now, id);
  } else {
    getDb()
      .prepare("INSERT INTO email_templates (name,audience,subject,body,updated_at) VALUES (?,?,?,?,?)")
      .run(input.name, input.audience, input.subject, input.body, now);
  }
}

export function deleteTemplate(id: number): void {
  getDb().prepare("DELETE FROM email_templates WHERE id = ?").run(id);
}

/** Fills {{first_name}}, {{name}}, {{job}}, {{service}}, {{sender}}. */
export function fillTemplate(text: string, values: Record<string, string>): string {
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key: string) => values[key] ?? match);
}

/* -------------------------------------------------------------------------- */
/* Subscribers                                                                 */
/* -------------------------------------------------------------------------- */

export interface Subscriber {
  id: number;
  email: string;
  source: string;
  created_at: string;
}

export function addSubscriber(email: string, source: string): void {
  getDb()
    .prepare("INSERT OR IGNORE INTO subscribers (email,source,created_at) VALUES (?,?,?)")
    .run(email.trim().toLowerCase(), source, new Date().toISOString());
}

export function listSubscribers(q?: string): Subscriber[] {
  return (q
    ? getDb().prepare("SELECT * FROM subscribers WHERE email LIKE ? ORDER BY id DESC").all(`%${q}%`)
    : getDb().prepare("SELECT * FROM subscribers ORDER BY id DESC").all()) as Subscriber[];
}

export function deleteSubscriber(id: number): void {
  getDb().prepare("DELETE FROM subscribers WHERE id = ?").run(id);
}

/* -------------------------------------------------------------------------- */
/* Page views                                                                  */
/* -------------------------------------------------------------------------- */

export function recordView(pathname: string): void {
  getDb()
    .prepare(
      "INSERT INTO page_views (path,views,updated_at) VALUES (?,1,?) ON CONFLICT(path) DO UPDATE SET views = views + 1, updated_at = excluded.updated_at",
    )
    .run(pathname.slice(0, 200), new Date().toISOString());
}

export function topViews(prefix: string, limit = 10): { path: string; views: number }[] {
  return getDb()
    .prepare("SELECT path, views FROM page_views WHERE path LIKE ? ORDER BY views DESC LIMIT ?")
    .all(`${prefix}%`, limit) as { path: string; views: number }[];
}

/* -------------------------------------------------------------------------- */
/* Site settings                                                               */
/* -------------------------------------------------------------------------- */

export interface Announcement {
  enabled: boolean;
  text: string;
  link: string;
  linkLabel: string;
}

export function getSetting<T>(key: string, fallback: T): T {
  const row = getDb().prepare("SELECT value FROM settings WHERE key = ?").get(key) as { value: string } | undefined;
  if (!row) return fallback;
  try {
    return { ...fallback, ...(JSON.parse(row.value) as T) };
  } catch {
    return fallback;
  }
}

export function setSetting(key: string, value: unknown): void {
  getDb()
    .prepare("INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    .run(key, JSON.stringify(value));
}

export const DEFAULT_ANNOUNCEMENT: Announcement = { enabled: false, text: "", link: "", linkLabel: "" };

/* -------------------------------------------------------------------------- */
/* Search                                                                      */
/* -------------------------------------------------------------------------- */

export interface SearchHit {
  type: "Enquiry" | "Application" | "Post" | "Job";
  title: string;
  detail: string;
  href: string;
}

export function search(q: string, areas: readonly string[]): SearchHit[] {
  const like = `%${q}%`;
  const db = getDb();
  const hits: SearchHit[] = [];
  if (areas.includes("enquiries")) {
    for (const row of db
      .prepare("SELECT id,name,email,service,source FROM enquiries WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR message LIKE ? OR reference LIKE ? ORDER BY id DESC LIMIT 15")
      .all(like, like, like, like, like) as { id: number; name: string; email: string; service: string; source: string }[]) {
      hits.push({ type: "Enquiry", title: row.name || row.email, detail: `${row.service || row.source} · ${row.email}`, href: `/admin/enquiries/${row.id}` });
    }
  }
  if (areas.includes("applications")) {
    for (const row of db
      .prepare("SELECT id,name,email,job_title FROM applications WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR note LIKE ? ORDER BY id DESC LIMIT 15")
      .all(like, like, like, like) as { id: number; name: string; email: string; job_title: string }[]) {
      hits.push({ type: "Application", title: row.name, detail: `${row.job_title} · ${row.email}`, href: `/admin/applications/${row.id}` });
    }
  }
  if (areas.includes("posts")) {
    for (const row of db
      .prepare("SELECT id,title,slug,status FROM posts WHERE title LIKE ? OR slug LIKE ? OR body LIKE ? ORDER BY id DESC LIMIT 15")
      .all(like, like, like) as { id: number; title: string; slug: string; status: string }[]) {
      hits.push({ type: "Post", title: row.title, detail: `/blog/${row.slug} · ${row.status}`, href: `/admin/posts/${row.id}` });
    }
  }
  if (areas.includes("jobs")) {
    for (const row of db
      .prepare("SELECT id,title,team,status FROM jobs WHERE title LIKE ? OR summary LIKE ? OR team LIKE ? ORDER BY id DESC LIMIT 15")
      .all(like, like, like) as { id: number; title: string; team: string; status: string }[]) {
      hits.push({ type: "Job", title: row.title, detail: `${row.team} · ${row.status}`, href: `/admin/jobs/${row.id}` });
    }
  }
  return hits;
}

/* -------------------------------------------------------------------------- */
/* Analytics                                                                   */
/* -------------------------------------------------------------------------- */

export function analytics(days = 30) {
  const db = getDb();
  const since = new Date(Date.now() - (days - 1) * 86_400_000);
  const sinceDay = since.toISOString().slice(0, 10);
  const perDay = new Map(
    (db
      .prepare("SELECT substr(created_at,1,10) AS day, COUNT(*) AS n FROM enquiries WHERE created_at >= ? AND status != 'spam' GROUP BY day")
      .all(sinceDay) as { day: string; n: number }[]).map((row) => [row.day, row.n]),
  );
  const series = Array.from({ length: days }, (_, index) => {
    const day = new Date(since.getTime() + index * 86_400_000).toISOString().slice(0, 10);
    return { day, n: perDay.get(day) ?? 0 };
  });
  const group = (column: string) =>
    db
      .prepare(`SELECT COALESCE(NULLIF(${column},''),'Not specified') AS label, COUNT(*) AS n FROM enquiries WHERE status != 'spam' GROUP BY label ORDER BY n DESC LIMIT 8`)
      .all() as { label: string; n: number }[];
  const statuses = db.prepare("SELECT status AS label, COUNT(*) AS n FROM enquiries GROUP BY status").all() as { label: string; n: number }[];
  const count = (status: string) => statuses.find((row) => row.label === status)?.n ?? 0;
  const total = statuses.reduce((sum, row) => sum + row.n, 0) - count("spam");
  const perJob = db
    .prepare("SELECT job_title AS label, COUNT(*) AS n FROM applications GROUP BY job_title ORDER BY n DESC LIMIT 8")
    .all() as { label: string; n: number }[];
  return {
    series,
    last30: series.reduce((sum, row) => sum + row.n, 0),
    bySource: group("source"),
    byService: group("service"),
    total,
    won: count("won"),
    lost: count("lost"),
    winRate: total ? Math.round((count("won") / total) * 100) : 0,
    perJob,
    subscribers: (db.prepare("SELECT COUNT(*) AS n FROM subscribers").get() as { n: number }).n,
  };
}

/* -------------------------------------------------------------------------- */
/* Bookings                                                                    */
/* -------------------------------------------------------------------------- */

export interface Booking {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  slot: string;
  mode: string;
  topic: string;
}

export function bookings(): Booking[] {
  const rows = getDb()
    .prepare("SELECT id,name,email,phone,status,payload FROM enquiries WHERE kind = 'booking' ORDER BY id DESC LIMIT 500")
    .all() as { id: number; name: string; email: string; phone: string; status: string; payload: string }[];
  return rows
    .map((row) => {
      let payload: Record<string, unknown> = {};
      try {
        payload = JSON.parse(row.payload) as Record<string, unknown>;
      } catch {
        // ignore malformed payloads
      }
      return {
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        status: row.status,
        slot: String(payload.slot ?? ""),
        mode: String(payload.mode ?? ""),
        topic: String(payload.topic ?? ""),
      };
    })
    .filter((booking) => booking.slot)
    .sort((a, b) => a.slot.localeCompare(b.slot));
}

/* -------------------------------------------------------------------------- */
/* Media library                                                               */
/* -------------------------------------------------------------------------- */

export async function listMedia(): Promise<{ name: string; url: string; size: number; modified: string }[]> {
  const folder = path.join(dataDir(), "uploads", "media");
  let names: string[] = [];
  try {
    names = await readdir(folder);
  } catch {
    return [];
  }
  const files = await Promise.all(
    names
      .filter((name) => /^[\w-]+\.(jpg|png|webp|gif)$/.test(name))
      .map(async (name) => {
        const info = await stat(path.join(folder, name));
        return { name, url: `/media/${name}`, size: info.size, modified: info.mtime.toISOString() };
      }),
  );
  return files.sort((a, b) => b.modified.localeCompare(a.modified));
}

/** Posts that reference a media file (cover or body). */
export function mediaUsage(name: string): string[] {
  return (getDb()
    .prepare("SELECT title FROM posts WHERE cover_src LIKE ? OR body LIKE ?")
    .all(`%${name}%`, `%${name}%`) as { title: string }[]).map((row) => row.title);
}

export async function deleteMedia(name: string): Promise<void> {
  if (!/^[\w-]+\.(jpg|png|webp|gif)$/.test(name)) return;
  await unlink(path.join(dataDir(), "uploads", "media", name)).catch(() => undefined);
}
