import { mkdirSync } from "node:fs";
import path from "node:path";

import { jobs as seedJobs, JOBS_POSTED_ON } from "@/lib/careers";
import { postBodies } from "@/lib/post-bodies";
import { posts as seedPosts } from "@/lib/posts";

import { blocksToMarkdown } from "./markdown";

/**
 * The CMS database: one SQLite file (Node's built-in driver, no native
 * dependency) holding posts, jobs, applications, enquiries, users, sessions
 * and the audit log.
 *
 * Location: CMS_DB_PATH, default `<project>/data/cms.db`. `data/` is
 * git-ignored and survives `git reset --hard`, so deploys never touch it.
 * Back it up with:  sqlite3 data/cms.db ".backup data/cms-backup.db"
 */

type Statement = {
  run: (...params: unknown[]) => { changes: number | bigint; lastInsertRowid: number | bigint };
  get: (...params: unknown[]) => unknown;
  all: (...params: unknown[]) => unknown[];
};
export type Database = {
  exec: (sql: string) => void;
  prepare: (sql: string) => Statement;
  close: () => void;
};

type SqliteModule = { DatabaseSync: new (file: string) => Database };

/**
 * `node:sqlite` is loaded at runtime (not imported) so the bundler never tries
 * to resolve it, and its one-time "experimental" warning is kept out of logs.
 */
function loadSqlite(): SqliteModule {
  const emit = process.emitWarning;
  process.emitWarning = ((warning: string | Error, ...rest: unknown[]) => {
    const text = typeof warning === "string" ? warning : warning.message;
    if (text.includes("SQLite")) return;
    return (emit as (...args: unknown[]) => void).call(process, warning, ...rest);
  }) as typeof process.emitWarning;
  try {
    return process.getBuiltinModule("node:sqlite") as SqliteModule;
  } finally {
    process.emitWarning = emit;
  }
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner','editor','hr','sales')),
  password_hash TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  last_login_at TEXT
);
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Insights',
  author_name TEXT NOT NULL DEFAULT '',
  author_role TEXT NOT NULL DEFAULT '',
  cover_src TEXT NOT NULL DEFAULT '',
  cover_alt TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  seo_title TEXT,
  seo_description TEXT,
  featured INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  published_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  updated_by TEXT
);
CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  short_title TEXT,
  team TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL,
  experience TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  skills TEXT NOT NULL DEFAULT '[]',
  responsibilities TEXT NOT NULL DEFAULT '[]',
  requirements TEXT NOT NULL DEFAULT '[]',
  nice_to_haves TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('draft','open','closed')),
  posted_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  updated_by TEXT
);
CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY,
  job_slug TEXT NOT NULL,
  job_title TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  links TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  resume_file TEXT,
  resume_name TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  internal_notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS enquiries (
  id INTEGER PRIMARY KEY,
  reference TEXT NOT NULL,
  kind TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  service TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  payload TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'new',
  internal_notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS posts_status ON posts(status, published_at);
CREATE INDEX IF NOT EXISTS jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS applications_created ON applications(created_at);
CREATE INDEX IF NOT EXISTS enquiries_created ON enquiries(created_at);
`;

export function dataDir(): string {
  return process.env.CMS_DATA_DIR ?? path.join(process.cwd(), "data");
}

function seed(db: Database): void {
  const now = new Date().toISOString();
  const postCount = (db.prepare("SELECT COUNT(*) AS n FROM posts").get() as { n: number }).n;
  if (postCount === 0) {
    const insert = db.prepare(
      `INSERT OR IGNORE INTO posts (slug,title,excerpt,category,author_name,author_role,cover_src,cover_alt,body,seo_title,seo_description,featured,status,published_at,created_at,updated_at,updated_by)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,'published',?,?,?,'import')`,
    );
    for (const post of seedPosts) {
      insert.run(
        post.slug,
        post.title,
        post.excerpt,
        post.category,
        post.author.name,
        post.author.role,
        post.cover.src,
        post.cover.alt,
        blocksToMarkdown(postBodies[post.slug] ?? []),
        post.seoTitle ?? null,
        post.seoDescription ?? null,
        post.featured ? 1 : 0,
        post.date,
        now,
        now,
      );
    }
  }

  const jobCount = (db.prepare("SELECT COUNT(*) AS n FROM jobs").get() as { n: number }).n;
  if (jobCount === 0) {
    const insert = db.prepare(
      `INSERT OR IGNORE INTO jobs (slug,title,short_title,team,location,type,experience,summary,skills,responsibilities,requirements,nice_to_haves,status,posted_at,created_at,updated_at,updated_by)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,'open',?,?,?,'import')`,
    );
    for (const job of seedJobs) {
      insert.run(
        job.slug,
        job.title,
        job.shortTitle ?? null,
        job.team,
        job.location,
        job.type,
        job.experience,
        job.summary,
        JSON.stringify(job.skills),
        JSON.stringify(job.responsibilities),
        JSON.stringify(job.requirements),
        JSON.stringify(job.niceToHaves),
        JOBS_POSTED_ON,
        now,
        now,
      );
    }
  }
}

const globalForDb = globalThis as unknown as { __setuwareCms?: Database };

export function getDb(): Database {
  if (globalForDb.__setuwareCms) return globalForDb.__setuwareCms;

  const file = process.env.CMS_DB_PATH ?? path.join(dataDir(), "cms.db");
  if (file !== ":memory:") mkdirSync(path.dirname(file), { recursive: true });

  const { DatabaseSync } = loadSqlite();
  const db = new DatabaseSync(file);
  db.exec("PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000; PRAGMA foreign_keys = ON;");
  db.exec(SCHEMA);
  // Build workers and the running site can open the file at the same time;
  // the immediate transaction makes the first-run import happen exactly once.
  db.exec("BEGIN IMMEDIATE");
  try {
    seed(db);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  globalForDb.__setuwareCms = db;
  return db;
}

/** Tests only: forget the open database. */
export function resetDb(): void {
  globalForDb.__setuwareCms?.close();
  globalForDb.__setuwareCms = undefined;
}
