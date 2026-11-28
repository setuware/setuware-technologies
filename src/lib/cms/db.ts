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
CREATE TABLE IF NOT EXISTS work_updates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS work_updates_user ON work_updates(user_id, created_at);
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
CREATE TABLE IF NOT EXISTS expense_claims (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  spent_on TEXT NOT NULL,
  category TEXT NOT NULL,
  amount_paise INTEGER NOT NULL,
  description TEXT NOT NULL,
  receipt_file TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','paid','cancelled')),
  decided_by INTEGER,
  decided_at TEXT,
  decision_note TEXT NOT NULL DEFAULT '',
  paid_at TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS expense_claims_user ON expense_claims(user_id, spent_on);
CREATE INDEX IF NOT EXISTS expense_claims_status ON expense_claims(status, spent_on);
CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  file TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime TEXT NOT NULL,
  size INTEGER NOT NULL,
  uploaded_by INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS documents_user ON documents(user_id, category, created_at);
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
  ["users", "bio", "TEXT NOT NULL DEFAULT ''"],
  ["users", "skills", "TEXT NOT NULL DEFAULT ''"],
  ["users", "location", "TEXT NOT NULL DEFAULT ''"],
  ["users", "emergency_contact", "TEXT NOT NULL DEFAULT ''"],
  ["users", "employee_code", "TEXT NOT NULL DEFAULT ''"],
  ["users", "employment_type", "TEXT NOT NULL DEFAULT ''"],
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
  if (!db.prepare("SELECT 1 FROM settings WHERE key = 'rbac_erp_v1'").get()) {
    const row = db.prepare("SELECT permissions FROM roles WHERE key = 'hr'").get() as { permissions: string } | undefined;
    if (row) {
      const extra = ["expenses.view", "expenses.approve", "documents.manage"];
      const merged = [...new Set([...(JSON.parse(row.permissions) as string[]), ...extra])];
      db.prepare("UPDATE roles SET permissions = ? WHERE key = 'hr'").run(JSON.stringify(merged));
    }
    db.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES ('rbac_erp_v1','true')").run();
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
  const insert = db.prepare("INSERT INTO email_templates (name,audience,subject,body,updated_at) VALUES (?,?,?,?,?)");
  const now = new Date().toISOString();
  if (templates === 0) {
    for (const [name, audience, subject, body] of DEFAULT_TEMPLATES) insert.run(name, audience, subject, body, now);
    db.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES ('email_templates_v2','true')").run();
  }
  // Rewritten templates (Nov 2026): replaces the first set where it was never edited, and adds the new ones once.
  if (!db.prepare("SELECT 1 FROM settings WHERE key = 'email_templates_v2'").get()) {
    for (const [name, body] of LEGACY_TEMPLATE_BODIES) db.prepare("DELETE FROM email_templates WHERE name = ? AND body = ?").run(name, body);
    const has = db.prepare("SELECT 1 FROM email_templates WHERE name = ?");
    for (const [name, audience, subject, body] of DEFAULT_TEMPLATES) if (!has.get(name)) insert.run(name, audience, subject, body, now);
    db.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES ('email_templates_v2','true')").run();
  }
}

/** The first set of templates, kept so an unedited copy can be replaced. */
const LEGACY_TEMPLATE_BODIES: [string, string][] = [
  [
    "Thanks, let's schedule a call",
    "Hi {{first_name}},\n\nThank you for getting in touch about {{service}}. I'd love to understand what you have in mind.\n\nCould you pick a 30-minute slot that suits you here: https://setuware.in/book\n\nIf you prefer, reply with two or three times and I'll send an invite.\n\nRegards,\n{{sender}}\nSetuware Technologies",
  ],
  [
    "Proposal follow-up",
    "Hi {{first_name}},\n\nI wanted to check whether you had a chance to review our proposal. Happy to walk through it on a quick call or adjust the scope.\n\nRegards,\n{{sender}}\nSetuware Technologies",
  ],
  [
    "Interview invitation",
    "Hi {{first_name}},\n\nThank you for applying for the {{job}} role. We enjoyed reading your application and would like to invite you to a 45-minute interview.\n\nPlease reply with two or three times that work for you this week.\n\nRegards,\n{{sender}}\nSetuware Technologies",
  ],
  [
    "Application update (not progressing)",
    "Hi {{first_name}},\n\nThank you for your interest in the {{job}} role and for the time you put into your application. After careful review we will not be moving forward this time.\n\nWe will keep your details and get in touch if a suitable role opens up.\n\nRegards,\n{{sender}}\nSetuware Technologies",
  ],
];

const SIGN_OFF = "Regards,\n{{sender}}\nSetuware Technologies\n+91 70912 98828 · setuware.in";

const DEFAULT_TEMPLATES: [string, "enquiry" | "application", string, string][] = [
  [
    "First reply: book a consultation",
    "enquiry",
    "Your {{service}} enquiry: next steps",
    `Hi {{first_name}},\n\nThank you for writing to us about {{service}}. I have read your message, and the quickest way to give you a clear scope and a fixed price is a 30-minute call.\n\nOn the call we will cover:\n- What you want the project to do for your business\n- The features you need at launch and the ones that can wait\n- Your timeline and budget range\n\nPick a time that suits you here: https://setuware.in/book\n\nIf none of the slots work, reply with two or three times and I will send you an invite.\n\n${SIGN_OFF}`,
  ],
  [
    "Requirements: questions before the proposal",
    "enquiry",
    "A few questions about your {{service}} project",
    `Hi {{first_name}},\n\nThank you for the details so far. To prepare an accurate proposal for {{service}}, I need a few more answers:\n\n- Who will use it, and roughly how many people?\n- Which features must be ready on day one?\n- Do you have a logo, brand colours and content, or should we prepare them?\n- Are there websites or apps you like that we should look at?\n- Is there a launch date we must meet?\n\nShort answers are enough. If it is easier to talk it through, pick a time here: https://setuware.in/book\n\n${SIGN_OFF}`,
  ],
  [
    "Proposal sent",
    "enquiry",
    "Your proposal from Setuware Technologies",
    `Hi {{first_name}},\n\nThank you for your time on the call. I have sent the proposal for {{service}} as a PDF in a separate email. It covers:\n\n- The scope: what is included and what is not\n- A fixed price with the payment milestones\n- The delivery timeline, week by week\n- Support after launch\n\nPlease read it and tell me if anything should change. Once you approve it, we can start as soon as the first milestone is paid.\n\n${SIGN_OFF}`,
  ],
  [
    "Proposal follow-up",
    "enquiry",
    "Following up on your {{service}} proposal",
    `Hi {{first_name}},\n\nI am following up on the proposal I sent for {{service}}. Have you had a chance to read it?\n\nIf the scope, the price or the timeline needs to change, tell me which part and I will send a revised version. I can also walk you through it on a short call: https://setuware.in/book\n\nIf the timing is not right at the moment, a one-line reply is enough and I will check back later.\n\n${SIGN_OFF}`,
  ],
  [
    "Project kickoff",
    "enquiry",
    "Welcome aboard: starting your {{service}} project",
    `Hi {{first_name}},\n\nThank you for choosing Setuware Technologies. Here is how the project will run:\n\n- Kickoff call: we confirm the scope, the milestones and who to contact on each side\n- Weekly updates: every week you receive a progress note and a staging link to review\n- Feedback: send your comments on each review, and we include them in the next week's work\n- Launch: we go live after your final approval and stay available for support\n\nTo begin, please send your logo, brand colours, any content you already have, and access to your domain or hosting if you own them.\n\n${SIGN_OFF}`,
  ],
  [
    "Interview invitation",
    "application",
    "Interview for {{job}} at Setuware Technologies",
    `Hi {{first_name}},\n\nThank you for applying for the {{job}} role. We have reviewed your application and would like to invite you to an interview.\n\nFormat: video call on Google Meet\nDuration: about 45 minutes\nWith: {{sender}}\n\nWe will talk about your recent work, how you approach a problem, and what the role involves day to day. Please keep one or two projects ready to show.\n\nReply with two or three times that suit you this week, and I will send a calendar invite with the link.\n\n${SIGN_OFF}`,
  ],
  [
    "Practical exercise",
    "application",
    "Next step for {{job}}: a short practical exercise",
    `Hi {{first_name}},\n\nThank you for speaking with us about the {{job}} role. The next step is a short practical exercise, so we can see how you work.\n\nI have sent the brief in a separate email. It should take two to three hours, and you have five days to send it back. Use the tools you normally work with, and add a short note on the decisions you made.\n\nIf anything in the brief is unclear, reply to this email and ask.\n\n${SIGN_OFF}`,
  ],
  [
    "Offer",
    "application",
    "Offer: {{job}} at Setuware Technologies",
    `Hi {{first_name}},\n\nWe are pleased to offer you the {{job}} role at Setuware Technologies.\n\nThe offer letter with your compensation, start date and terms follows in a separate email. Please read it carefully and reply with your acceptance, or with any questions.\n\nWe are looking forward to working with you.\n\n${SIGN_OFF}`,
  ],
  [
    "Application update (not progressing)",
    "application",
    "Your application for {{job}}",
    `Hi {{first_name}},\n\nThank you for applying for the {{job}} role and for the time you gave to your application. After reviewing it against what the role needs at present, we are not taking it forward.\n\nThis is a decision about this opening only. We will keep your details, and you are welcome to apply again when a role closer to your experience opens: https://setuware.in/careers\n\nWe wish you the best with your search.\n\n${SIGN_OFF}`,
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
