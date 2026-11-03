import type { Job, JobTeam, JobType } from "@/lib/careers";
import type { Block } from "@/lib/post-bodies";
import type { Post } from "@/lib/posts";

import { getDb } from "./db";
import { markdownToBlocks, readingMinutes } from "./markdown";

/**
 * Data access for the CMS. Admin screens call these directly; the public site
 * goes through the cached readers in ./public.ts.
 */

/* -------------------------------------------------------------------------- */
/* Posts                                                                       */
/* -------------------------------------------------------------------------- */

export interface PostRecord {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author_name: string;
  author_role: string;
  cover_src: string;
  cover_alt: string;
  body: string;
  seo_title: string | null;
  seo_description: string | null;
  featured: number;
  status: "draft" | "published";
  published_at: string;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export type PostInput = Omit<PostRecord, "id" | "created_at" | "updated_at" | "updated_by">;

const ACCENTS: readonly (readonly [string, string])[] = [
  ["#6366f1", "#22d3ee"],
  ["#0ea5e9", "#22c55e"],
  ["#f97316", "#ec4899"],
  ["#8b5cf6", "#06b6d4"],
  ["#14b8a6", "#3b82f6"],
];

function accentFor(category: string): readonly [string, string] {
  let hash = 0;
  for (const char of category) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return ACCENTS[hash % ACCENTS.length];
}

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "ST"
  );
}

/** A database post in the shape the site's components already render. */
export function toPost(record: PostRecord): Post {
  return {
    slug: record.slug,
    title: record.title,
    excerpt: record.excerpt,
    date: record.published_at.slice(0, 10),
    readingMinutes: readingMinutes(record.body),
    category: record.category,
    author: { name: record.author_name || "Setuware Team", role: record.author_role, initials: initials(record.author_name) },
    accent: accentFor(record.category),
    featured: record.featured === 1,
    cover: {
      src: record.cover_src || "/images/blog/surviving-a-traffic-spike.jpg",
      alt: record.cover_alt || record.title,
      width: 1200,
      height: 800,
    },
    ...(record.seo_title ? { seoTitle: record.seo_title } : {}),
    ...(record.seo_description ? { seoDescription: record.seo_description } : {}),
  };
}

export function postBlocks(record: PostRecord): Block[] {
  return markdownToBlocks(record.body);
}

export function listPostRecords(): PostRecord[] {
  return getDb().prepare("SELECT * FROM posts ORDER BY published_at DESC, id DESC").all() as PostRecord[];
}

export function getPostRecord(id: number): PostRecord | null {
  return (getDb().prepare("SELECT * FROM posts WHERE id = ?").get(id) as PostRecord | undefined) ?? null;
}

/** Published and not scheduled for later. */
export function publishedPostRecords(now = new Date()): PostRecord[] {
  return getDb()
    .prepare("SELECT * FROM posts WHERE status = 'published' AND published_at <= ? ORDER BY published_at DESC, id DESC")
    .all(now.toISOString()) as PostRecord[];
}

export function publishedPostBySlug(slug: string, now = new Date()): PostRecord | null {
  return (
    (getDb()
      .prepare("SELECT * FROM posts WHERE slug = ? AND status = 'published' AND published_at <= ?")
      .get(slug, now.toISOString()) as PostRecord | undefined) ?? null
  );
}

export function slugTaken(table: "posts" | "jobs", slug: string, exceptId?: number): boolean {
  const row = getDb().prepare(`SELECT id FROM ${table} WHERE slug = ?`).get(slug) as { id: number } | undefined;
  return Boolean(row && row.id !== exceptId);
}

export function savePost(input: PostInput, actor: string, id?: number): number {
  const db = getDb();
  const now = new Date().toISOString();
  const values = [
    input.slug,
    input.title,
    input.excerpt,
    input.category,
    input.author_name,
    input.author_role,
    input.cover_src,
    input.cover_alt,
    input.body,
    input.seo_title,
    input.seo_description,
    input.featured,
    input.status,
    input.published_at,
  ];
  if (id) {
    db.prepare(
      `UPDATE posts SET slug=?,title=?,excerpt=?,category=?,author_name=?,author_role=?,cover_src=?,cover_alt=?,body=?,seo_title=?,seo_description=?,featured=?,status=?,published_at=?,updated_at=?,updated_by=? WHERE id=?`,
    ).run(...values, now, actor, id);
    return id;
  }
  const result = db
    .prepare(
      `INSERT INTO posts (slug,title,excerpt,category,author_name,author_role,cover_src,cover_alt,body,seo_title,seo_description,featured,status,published_at,created_at,updated_at,updated_by)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .run(...values, now, now, actor);
  return Number(result.lastInsertRowid);
}

export function deletePost(id: number): void {
  getDb().prepare("DELETE FROM posts WHERE id = ?").run(id);
}

/* -------------------------------------------------------------------------- */
/* Jobs                                                                        */
/* -------------------------------------------------------------------------- */

export interface JobRecord {
  id: number;
  slug: string;
  title: string;
  short_title: string | null;
  team: string;
  location: string;
  type: string;
  experience: string;
  summary: string;
  skills: string;
  responsibilities: string;
  requirements: string;
  nice_to_haves: string;
  status: "draft" | "open" | "closed";
  posted_at: string;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export interface JobInput {
  slug: string;
  title: string;
  short_title: string | null;
  team: string;
  location: string;
  type: string;
  experience: string;
  summary: string;
  skills: string[];
  responsibilities: string[];
  requirements: string[];
  nice_to_haves: string[];
  status: JobRecord["status"];
  posted_at: string;
}

const list = (value: string): string[] => {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
};

export function toJob(record: JobRecord): Job & { postedAt: string } {
  return {
    slug: record.slug,
    title: record.title,
    ...(record.short_title ? { shortTitle: record.short_title } : {}),
    team: record.team as JobTeam,
    location: record.location,
    type: record.type as JobType,
    experience: record.experience,
    summary: record.summary,
    skills: list(record.skills),
    responsibilities: list(record.responsibilities),
    requirements: list(record.requirements),
    niceToHaves: list(record.nice_to_haves),
    postedAt: record.posted_at,
  };
}

export function jobLists(record: JobRecord) {
  return {
    skills: list(record.skills),
    responsibilities: list(record.responsibilities),
    requirements: list(record.requirements),
    nice_to_haves: list(record.nice_to_haves),
  };
}

export function listJobRecords(): JobRecord[] {
  return getDb().prepare("SELECT * FROM jobs ORDER BY status = 'open' DESC, posted_at DESC, id DESC").all() as JobRecord[];
}

export function getJobRecord(id: number): JobRecord | null {
  return (getDb().prepare("SELECT * FROM jobs WHERE id = ?").get(id) as JobRecord | undefined) ?? null;
}

export function openJobRecords(): JobRecord[] {
  return getDb().prepare("SELECT * FROM jobs WHERE status = 'open' ORDER BY posted_at DESC, id").all() as JobRecord[];
}

export function openJobBySlug(slug: string): JobRecord | null {
  return (getDb().prepare("SELECT * FROM jobs WHERE slug = ? AND status = 'open'").get(slug) as JobRecord | undefined) ?? null;
}

export function saveJob(input: JobInput, actor: string, id?: number): number {
  const db = getDb();
  const now = new Date().toISOString();
  const values = [
    input.slug,
    input.title,
    input.short_title,
    input.team,
    input.location,
    input.type,
    input.experience,
    input.summary,
    JSON.stringify(input.skills),
    JSON.stringify(input.responsibilities),
    JSON.stringify(input.requirements),
    JSON.stringify(input.nice_to_haves),
    input.status,
    input.posted_at,
  ];
  if (id) {
    db.prepare(
      `UPDATE jobs SET slug=?,title=?,short_title=?,team=?,location=?,type=?,experience=?,summary=?,skills=?,responsibilities=?,requirements=?,nice_to_haves=?,status=?,posted_at=?,updated_at=?,updated_by=? WHERE id=?`,
    ).run(...values, now, actor, id);
    return id;
  }
  const result = db
    .prepare(
      `INSERT INTO jobs (slug,title,short_title,team,location,type,experience,summary,skills,responsibilities,requirements,nice_to_haves,status,posted_at,created_at,updated_at,updated_by)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .run(...values, now, now, actor);
  return Number(result.lastInsertRowid);
}

export function deleteJob(id: number): void {
  getDb().prepare("DELETE FROM jobs WHERE id = ?").run(id);
}

/* -------------------------------------------------------------------------- */
/* Applications                                                                */
/* -------------------------------------------------------------------------- */

export const APPLICATION_STATUSES = ["new", "reviewing", "shortlisted", "interview", "offer", "hired", "rejected"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface ApplicationRecord {
  id: number;
  job_slug: string;
  job_title: string;
  name: string;
  email: string;
  phone: string;
  links: string;
  note: string;
  resume_file: string | null;
  resume_name: string | null;
  status: ApplicationStatus;
  internal_notes: string;
  created_at: string;
}

export function createApplication(input: Omit<ApplicationRecord, "id" | "status" | "internal_notes" | "created_at">): number {
  const result = getDb()
    .prepare(
      `INSERT INTO applications (job_slug,job_title,name,email,phone,links,note,resume_file,resume_name,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)`,
    )
    .run(
      input.job_slug,
      input.job_title,
      input.name,
      input.email,
      input.phone,
      input.links,
      input.note,
      input.resume_file,
      input.resume_name,
      new Date().toISOString(),
    );
  return Number(result.lastInsertRowid);
}

export function listApplications(filter?: { status?: string; job?: string; q?: string }): ApplicationRecord[] {
  const where: string[] = [];
  const params: unknown[] = [];
  if (filter?.status) {
    where.push("status = ?");
    params.push(filter.status);
  }
  if (filter?.job) {
    where.push("job_slug = ?");
    params.push(filter.job);
  }
  if (filter?.q) {
    where.push("(name LIKE ? OR email LIKE ? OR phone LIKE ?)");
    const like = `%${filter.q}%`;
    params.push(like, like, like);
  }
  return getDb()
    .prepare(`SELECT * FROM applications ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY id DESC LIMIT 500`)
    .all(...params) as ApplicationRecord[];
}

export function getApplication(id: number): ApplicationRecord | null {
  return (getDb().prepare("SELECT * FROM applications WHERE id = ?").get(id) as ApplicationRecord | undefined) ?? null;
}

export function updateApplication(id: number, patch: { status?: string; internal_notes?: string }): void {
  const db = getDb();
  if (patch.status !== undefined) db.prepare("UPDATE applications SET status = ? WHERE id = ?").run(patch.status, id);
  if (patch.internal_notes !== undefined)
    db.prepare("UPDATE applications SET internal_notes = ? WHERE id = ?").run(patch.internal_notes, id);
}

/* -------------------------------------------------------------------------- */
/* Enquiries                                                                   */
/* -------------------------------------------------------------------------- */

export const ENQUIRY_STATUSES = ["new", "contacted", "qualified", "proposal", "won", "lost", "spam"] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export interface EnquiryRecord {
  id: number;
  reference: string;
  kind: string;
  source: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  payload: string;
  status: EnquiryStatus;
  internal_notes: string;
  created_at: string;
}

export function saveEnquiry(input: Omit<EnquiryRecord, "id" | "status" | "internal_notes">): void {
  getDb()
    .prepare(
      `INSERT INTO enquiries (reference,kind,source,name,email,phone,service,message,payload,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)`,
    )
    .run(
      input.reference,
      input.kind,
      input.source,
      input.name,
      input.email,
      input.phone,
      input.service,
      input.message,
      input.payload,
      input.created_at,
    );
}

export function listEnquiries(filter?: { status?: string; kind?: string; q?: string }): EnquiryRecord[] {
  const where: string[] = [];
  const params: unknown[] = [];
  if (filter?.status) {
    where.push("status = ?");
    params.push(filter.status);
  }
  if (filter?.kind) {
    where.push("kind = ?");
    params.push(filter.kind);
  }
  if (filter?.q) {
    where.push("(name LIKE ? OR email LIKE ? OR phone LIKE ? OR message LIKE ? OR reference LIKE ?)");
    const like = `%${filter.q}%`;
    params.push(like, like, like, like, like);
  }
  return getDb()
    .prepare(`SELECT * FROM enquiries ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY id DESC LIMIT 500`)
    .all(...params) as EnquiryRecord[];
}

export function getEnquiry(id: number): EnquiryRecord | null {
  return (getDb().prepare("SELECT * FROM enquiries WHERE id = ?").get(id) as EnquiryRecord | undefined) ?? null;
}

export function updateEnquiry(id: number, patch: { status?: string; internal_notes?: string }): void {
  const db = getDb();
  if (patch.status !== undefined) db.prepare("UPDATE enquiries SET status = ? WHERE id = ?").run(patch.status, id);
  if (patch.internal_notes !== undefined)
    db.prepare("UPDATE enquiries SET internal_notes = ? WHERE id = ?").run(patch.internal_notes, id);
}

/* -------------------------------------------------------------------------- */
/* Dashboard                                                                   */
/* -------------------------------------------------------------------------- */

export function dashboardCounts() {
  const db = getDb();
  const count = (sql: string, ...params: unknown[]) => (db.prepare(sql).get(...params) as { n: number }).n;
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
  return {
    postsPublished: count("SELECT COUNT(*) AS n FROM posts WHERE status = 'published'"),
    postsDraft: count("SELECT COUNT(*) AS n FROM posts WHERE status = 'draft'"),
    jobsOpen: count("SELECT COUNT(*) AS n FROM jobs WHERE status = 'open'"),
    applicationsNew: count("SELECT COUNT(*) AS n FROM applications WHERE status = 'new'"),
    applicationsWeek: count("SELECT COUNT(*) AS n FROM applications WHERE created_at >= ?", weekAgo),
    enquiriesNew: count("SELECT COUNT(*) AS n FROM enquiries WHERE status = 'new'"),
    enquiriesWeek: count("SELECT COUNT(*) AS n FROM enquiries WHERE created_at >= ?", weekAgo),
  };
}
