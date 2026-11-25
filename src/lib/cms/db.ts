import { mkdirSync } from "node:fs";
import path from "node:path";

import { jobs as seedJobs, JOBS_POSTED_ON } from "@/lib/careers";
import { postBodies } from "@/lib/post-bodies";
import { posts as seedPosts } from "@/lib/posts";

import { blocksToMarkdown } from "./markdown";
import { DEFAULT_ROLES } from "./rbac";

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
  role TEXT NOT NULL,
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
CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY,
  entity TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  kind TEXT NOT NULL DEFAULT 'note',
  author TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS notes_entity ON notes(entity, entity_id, created_at);
CREATE TABLE IF NOT EXISTS email_templates (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  audience TEXT NOT NULL CHECK (audience IN ('enquiry','application')),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  source TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS page_views (
  path TEXT PRIMARY KEY,
  views INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS page_views_daily (
  day TEXT NOT NULL,
  path TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, path)
);
CREATE TABLE IF NOT EXISTS password_tokens (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL CHECK (purpose IN ('invite','reset')),
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS roles (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  permissions TEXT NOT NULL DEFAULT '[]',
  builtin INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS crm_leads (
  id INTEGER PRIMARY KEY,
  zoho_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  company TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT '',
  zoho_owner TEXT NOT NULL DEFAULT '',
  zoho_owner_email TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  created_time TEXT NOT NULL DEFAULT '',
  modified_time TEXT NOT NULL DEFAULT '',
  assignee TEXT,
  follow_up_at TEXT,
  synced_at TEXT NOT NULL,
  removed INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS crm_leads_modified ON crm_leads(modified_time);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'todo',
  priority TEXT NOT NULL DEFAULT 'normal',
  assignee_id INTEGER,
  created_by INTEGER NOT NULL,
  due_date TEXT,
  project TEXT NOT NULL DEFAULT '',
  entity TEXT,
  entity_id INTEGER,
  estimate_minutes INTEGER,
  position REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT
);
CREATE INDEX IF NOT EXISTS tasks_assignee ON tasks(assignee_id, status);
CREATE INDEX IF NOT EXISTS tasks_entity ON tasks(entity, entity_id);
CREATE TABLE IF NOT EXISTS task_items (
  id INTEGER PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  done INTEGER NOT NULL DEFAULT 0,
  position INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS time_entries (
  id INTEGER PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  minutes INTEGER NOT NULL DEFAULT 0,
  note TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS time_entries_user ON time_entries(user_id, ended_at);
CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  day TEXT NOT NULL,
  check_in_at TEXT NOT NULL,
  check_out_at TEXT,
  break_minutes INTEGER NOT NULL DEFAULT 0,
  break_started_at TEXT,
  mode TEXT NOT NULL DEFAULT 'office',
  in_ip TEXT,
  out_ip TEXT,
  in_lat REAL,
  in_lng REAL,
  in_distance INTEGER,
  summary TEXT NOT NULL DEFAULT '',
  edited_by TEXT,
  UNIQUE (user_id, day)
);
CREATE TABLE IF NOT EXISTS leave_requests (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  kind TEXT NOT NULL DEFAULT 'leave',
  leave_type TEXT NOT NULL DEFAULT '',
  from_day TEXT NOT NULL,
  to_day TEXT NOT NULL,
  half_day INTEGER NOT NULL DEFAULT 0,
  check_in TEXT,
  check_out TEXT,
  reason TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  decided_by TEXT,
  decided_at TEXT,
  decision_note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS leave_requests_user ON leave_requests(user_id, from_day);
CREATE TABLE IF NOT EXISTS timesheets (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  week_start TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  total_minutes INTEGER NOT NULL DEFAULT 0,
  note TEXT NOT NULL DEFAULT '',
  submitted_at TEXT,
  decided_by TEXT,
  decided_at TEXT,
  decision_note TEXT NOT NULL DEFAULT '',
  UNIQUE (user_id, week_start)
);
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  link TEXT NOT NULL DEFAULT '',
  kind TEXT NOT NULL DEFAULT 'info',
  created_at TEXT NOT NULL,
  read_at TEXT
);
CREATE INDEX IF NOT EXISTS notifications_user ON notifications(user_id, read_at, created_at);
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE COLLATE NOCASE,
  client TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active',
  owner_id INTEGER,
  start_date TEXT,
  deadline TEXT,
  budget_hours REAL,
  description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS holidays (
  day TEXT PRIMARY KEY,
  name TEXT NOT NULL
);
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

/** Columns added after the first release; each is added once if missing. */
const COLUMNS: [table: string, column: string, definition: string][] = [
  ["enquiries", "assignee", "TEXT"],
  ["enquiries", "follow_up_at", "TEXT"],
  ["applications", "assignee", "TEXT"],
  ["applications", "rating", "INTEGER"],
  ["applications", "interview_at", "TEXT"],
  ["users", "must_change_password", "INTEGER NOT NULL DEFAULT 0"],
  ["users", "totp_secret", "TEXT"],
  ["users", "totp_enabled", "INTEGER NOT NULL DEFAULT 0"],
  ["users", "recovery_codes", "TEXT"],
  ["users", "failed_attempts", "INTEGER NOT NULL DEFAULT 0"],
  ["users", "locked_until", "TEXT"],
  ["sessions", "user_agent", "TEXT"],
  ["sessions", "ip", "TEXT"],
  ["sessions", "last_seen_at", "TEXT"],
  ["sessions", "mfa_ok", "INTEGER NOT NULL DEFAULT 1"],
  ["enquiries", "zoho_id", "TEXT"],
  ["tasks", "reviewer_id", "INTEGER"],
  ["time_entries", "source", "TEXT NOT NULL DEFAULT 'timer'"],
  ["attendance", "in_accuracy", "INTEGER"],
  ["attendance", "out_lat", "REAL"],
  ["attendance", "out_lng", "REAL"],
  ["attendance", "out_accuracy", "INTEGER"],
  ["attendance", "out_distance", "INTEGER"],
  ["users", "designation", "TEXT NOT NULL DEFAULT ''"],
  ["users", "department", "TEXT NOT NULL DEFAULT ''"],
  ["users", "phone", "TEXT NOT NULL DEFAULT ''"],
  ["users", "joined_on", "TEXT"],
  ["users", "birthday", "TEXT"],
  ["users", "manager_id", "INTEGER"],
  ["tasks", "repeat", "TEXT"],
  ["tasks", "next_id", "INTEGER"],
];

function addColumns(db: Database): void {
  for (const [table, column, definition] of COLUMNS) {
    const existing = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
    if (!existing.some((row) => row.name === column)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

/** SQLite cannot drop a CHECK constraint, so tables created with one are rebuilt once. */
function rebuild(db: Database, table: string, marker: string, create: string, columns: string[]): void {
  const row = db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ?").get(table) as { sql: string } | undefined;
  if (!row?.sql.includes(marker)) return;
  db.exec("PRAGMA foreign_keys = OFF");
  db.exec("BEGIN IMMEDIATE");
  try {
    db.exec(create.replace(`CREATE TABLE IF NOT EXISTS ${table} (`, `CREATE TABLE ${table}_v2 (`));
    db.exec(`INSERT INTO ${table}_v2 (${columns.join(",")}) SELECT ${columns.join(",")} FROM ${table}`);
    db.exec(`DROP TABLE ${table}`);
    db.exec(`ALTER TABLE ${table}_v2 RENAME TO ${table}`);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  } finally {
    db.exec("PRAGMA foreign_keys = ON");
  }
}

function migrate(db: Database): void {
  addColumns(db);
  rebuild(
    db,
    "users",
    "CHECK (role IN",
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY, email TEXT NOT NULL UNIQUE COLLATE NOCASE, name TEXT NOT NULL, role TEXT NOT NULL,
      password_hash TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, last_login_at TEXT,
      must_change_password INTEGER NOT NULL DEFAULT 0, totp_secret TEXT, totp_enabled INTEGER NOT NULL DEFAULT 0,
      recovery_codes TEXT, failed_attempts INTEGER NOT NULL DEFAULT 0, locked_until TEXT)`,
    ["id", "email", "name", "role", "password_hash", "active", "created_at", "last_login_at", "must_change_password", "totp_secret", "totp_enabled", "recovery_codes", "failed_attempts", "locked_until"],
  );
  rebuild(
    db,
    "notes",
    "CHECK (entity IN",
    `CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY, entity TEXT NOT NULL, entity_id INTEGER NOT NULL, kind TEXT NOT NULL DEFAULT 'note',
      author TEXT NOT NULL, body TEXT NOT NULL, created_at TEXT NOT NULL)`,
    ["id", "entity", "entity_id", "kind", "author", "body", "created_at"],
  );
  db.exec("CREATE INDEX IF NOT EXISTS notes_entity ON notes(entity, entity_id, created_at)");
  // A rebuild copies only the columns it lists; add any later ones back.
  addColumns(db);
  const roles = (db.prepare("SELECT COUNT(*) AS n FROM roles").get() as { n: number }).n;
  if (roles === 0) {
    const insert = db.prepare("INSERT OR IGNORE INTO roles (key,name,description,permissions,builtin) VALUES (?,?,?,?,?)");
    for (const role of DEFAULT_ROLES) insert.run(role.key, role.name, role.description, JSON.stringify(role.permissions), role.key === "owner" ? 1 : 0);
  }
  // Tasks and attendance (Nov 2026): give existing built-in roles their new permissions once.
  if (!db.prepare("SELECT 1 FROM settings WHERE key = 'rbac_work_v1'").get()) {
    const extra: Record<string, string[]> = { sales: ["tasks.assign"], hr: ["tasks.assign", "attendance.view", "attendance.manage"] };
    for (const [key, permissions] of Object.entries(extra)) {
      const row = db.prepare("SELECT permissions FROM roles WHERE key = ?").get(key) as { permissions: string } | undefined;
      if (!row) continue;
      const merged = [...new Set([...(JSON.parse(row.permissions) as string[]), ...permissions])];
      db.prepare("UPDATE roles SET permissions = ? WHERE key = ?").run(JSON.stringify(merged), key);
    }
    db.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES ('rbac_work_v1','true')").run();
  }
  // Task reviews and timesheet approvals (Nov 2026): extend existing roles once.
  if (!db.prepare("SELECT 1 FROM settings WHERE key = 'rbac_review_v1'").get()) {
    const extra: Record<string, string[]> = {
      tech_lead: ["tasks.review", "timesheets.view", "timesheets.approve"],
      qa: ["tasks.review"],
      sales: ["tasks.review"],
      hr: ["timesheets.view"],
    };
    for (const [key, permissions] of Object.entries(extra)) {
      const row = db.prepare("SELECT permissions FROM roles WHERE key = ?").get(key) as { permissions: string } | undefined;
      if (!row) continue;
      const merged = [...new Set([...(JSON.parse(row.permissions) as string[]), ...permissions])];
      db.prepare("UPDATE roles SET permissions = ? WHERE key = ?").run(JSON.stringify(merged), key);
    }
    db.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES ('rbac_review_v1','true')").run();
  }
  // Engineering roles (Nov 2026): added once to existing installs; never overwrites a role with the same key.
  if (!db.prepare("SELECT 1 FROM settings WHERE key = 'roles_engineering_v1'").get()) {
    const insert = db.prepare("INSERT OR IGNORE INTO roles (key,name,description,permissions,builtin) VALUES (?,?,?,?,0)");
    for (const role of DEFAULT_ROLES.filter((item) => ["tech_lead", "developer", "qa", "designer", "intern"].includes(item.key))) {
      insert.run(role.key, role.name, role.description, JSON.stringify(role.permissions));
    }
    db.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES ('roles_engineering_v1','true')").run();
  }
  const templates = (db.prepare("SELECT COUNT(*) AS n FROM email_templates").get() as { n: number }).n;
  if (templates === 0) {
    const insert = db.prepare("INSERT INTO email_templates (name,audience,subject,body,updated_at) VALUES (?,?,?,?,?)");
    const now = new Date().toISOString();
    for (const [name, audience, subject, body] of DEFAULT_TEMPLATES) insert.run(name, audience, subject, body, now);
  }
}

const DEFAULT_TEMPLATES: [string, "enquiry" | "application", string, string][] = [
  [
    "Thanks, let's schedule a call",
    "enquiry",
    "Your enquiry with Setuware Technologies",
    "Hi {{first_name}},\n\nThank you for getting in touch about {{service}}. I'd love to understand what you have in mind.\n\nCould you pick a 30-minute slot that suits you here: https://setuware.in/book\n\nIf you prefer, reply with two or three times and I'll send an invite.\n\nRegards,\n{{sender}}\nSetuware Technologies",
  ],
  [
    "Proposal follow-up",
    "enquiry",
    "Following up on your proposal",
    "Hi {{first_name}},\n\nI wanted to check whether you had a chance to review our proposal. Happy to walk through it on a quick call or adjust the scope.\n\nRegards,\n{{sender}}\nSetuware Technologies",
  ],
  [
    "Interview invitation",
    "application",
    "Interview: {{job}} at Setuware Technologies",
    "Hi {{first_name}},\n\nThank you for applying for the {{job}} role. We enjoyed reading your application and would like to invite you to a 45-minute interview.\n\nPlease reply with two or three times that work for you this week.\n\nRegards,\n{{sender}}\nSetuware Technologies",
  ],
  [
    "Application update (not progressing)",
    "application",
    "Your application for {{job}}",
    "Hi {{first_name}},\n\nThank you for your interest in the {{job}} role and for the time you put into your application. After careful review we will not be moving forward this time.\n\nWe will keep your details and get in touch if a suitable role opens up.\n\nRegards,\n{{sender}}\nSetuware Technologies",
  ],
];

const globalForDb = globalThis as unknown as { __setuwareCms?: Database };

export function getDb(): Database {
  if (globalForDb.__setuwareCms) return globalForDb.__setuwareCms;

  const file = process.env.CMS_DB_PATH ?? path.join(dataDir(), "cms.db");
  if (file !== ":memory:") mkdirSync(path.dirname(file), { recursive: true });

  const { DatabaseSync } = loadSqlite();
  const db = new DatabaseSync(file);
  // node:sqlite returns null-prototype rows; React cannot pass those to
  // Client Components, so every row is copied into a plain object.
  const prepare = db.prepare.bind(db);
  db.prepare = (sql: string) => {
    const statement = prepare(sql);
    return {
      run: (...params: unknown[]) => statement.run(...params),
      get: (...params: unknown[]) => {
        const row = statement.get(...params);
        return row && typeof row === "object" ? { ...(row as object) } : row;
      },
      all: (...params: unknown[]) => statement.all(...params).map((row) => ({ ...(row as object) })),
    };
  };
  db.exec("PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000; PRAGMA foreign_keys = ON;");
  db.exec(SCHEMA);
  migrate(db);
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
