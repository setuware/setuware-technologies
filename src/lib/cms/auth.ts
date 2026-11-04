import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

import { getDb } from "./db";

/**
 * Admin accounts and sessions.
 *
 * Passwords: scrypt with a per-user salt. Sessions: a random 32-byte token in
 * an httpOnly, SameSite=Lax cookie; only its SHA-256 is stored, so a copy of
 * the database cannot be replayed as a login. Sessions last 7 days.
 *
 * The first owner is created from ADMIN_EMAIL / ADMIN_PASSWORD the first time
 * someone signs in with them while no users exist.
 */

const scrypt = promisify(scryptCb) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;

export const SESSION_COOKIE = "stw_admin";
export const SESSION_DAYS = 7;

export type Role = "owner" | "editor" | "hr" | "sales";

export const ROLE_LABELS: Record<Role, string> = {
  owner: "Owner (everything)",
  editor: "Editor (blog)",
  hr: "HR (jobs and applications)",
  sales: "Sales (enquiries)",
};

/** What each role may open. The owner may open everything. */
export const ROLE_ACCESS: Record<Exclude<Role, "owner">, readonly string[]> = {
  editor: ["posts", "media"],
  hr: ["jobs", "applications", "templates"],
  sales: ["enquiries", "bookings", "templates", "subscribers", "analytics"],
};

export function can(role: Role, area: string): boolean {
  return role === "owner" || (ROLE_ACCESS[role as Exclude<Role, "owner">] ?? []).includes(area);
}

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: Role;
  active: boolean;
  created_at: string;
  last_login_at: string | null;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltB64, keyB64] = stored.split("$");
  if (scheme !== "scrypt" || !saltB64 || !keyB64) return false;
  const expected = Buffer.from(keyB64, "base64");
  if (expected.length === 0) return false;
  const actual = await scrypt(password, Buffer.from(saltB64, "base64"), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function passwordProblem(password: string): string | null {
  if (password.length < 10) return "Use at least 10 characters.";
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) return "Use letters and at least one number.";
  return null;
}

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

/** Same cost as a real check, for unknown e-mails (no timing leak). */
const DUMMY_HASH = `scrypt$${Buffer.alloc(16).toString("base64")}$${Buffer.alloc(64).toString("base64")}`;

function rowToUser(row: Record<string, unknown>): AdminUser {
  return {
    id: Number(row.id),
    email: String(row.email),
    name: String(row.name),
    role: row.role as Role,
    active: Number(row.active) === 1,
    created_at: String(row.created_at),
    last_login_at: (row.last_login_at as string | null) ?? null,
  };
}

export function listUsers(): AdminUser[] {
  return getDb()
    .prepare("SELECT * FROM users ORDER BY created_at")
    .all()
    .map((row) => rowToUser(row as Record<string, unknown>));
}

export function getUser(id: number): AdminUser | null {
  const row = getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  return row ? rowToUser(row) : null;
}

export async function createUser(input: { email: string; name: string; role: Role; password: string }): Promise<AdminUser> {
  const now = new Date().toISOString();
  const result = getDb()
    .prepare("INSERT INTO users (email,name,role,password_hash,created_at) VALUES (?,?,?,?,?)")
    .run(input.email.trim().toLowerCase(), input.name.trim(), input.role, await hashPassword(input.password), now);
  return getUser(Number(result.lastInsertRowid)) as AdminUser;
}

export async function setPassword(userId: number, password: string): Promise<void> {
  getDb().prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(await hashPassword(password), userId);
  // A new password signs every existing session out.
  getDb().prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
}

export function updateUser(userId: number, patch: { name?: string; role?: Role; active?: boolean }): void {
  const db = getDb();
  if (patch.name !== undefined) db.prepare("UPDATE users SET name = ? WHERE id = ?").run(patch.name.trim(), userId);
  if (patch.role !== undefined) db.prepare("UPDATE users SET role = ? WHERE id = ?").run(patch.role, userId);
  if (patch.active !== undefined) {
    db.prepare("UPDATE users SET active = ? WHERE id = ?").run(patch.active ? 1 : 0, userId);
    if (!patch.active) db.prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
  }
}

export function ownerCount(): number {
  return (getDb().prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'owner' AND active = 1").get() as { n: number }).n;
}

/**
 * Checks credentials and returns a new session token, or null. Creates the
 * owner from ADMIN_EMAIL / ADMIN_PASSWORD when no users exist yet.
 */
export async function signIn(email: string, password: string): Promise<{ token: string; user: AdminUser } | null> {
  const db = getDb();
  const normalised = email.trim().toLowerCase();

  const count = (db.prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number }).n;
  if (count === 0) {
    const bootEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const bootPassword = process.env.ADMIN_PASSWORD;
    if (!bootEmail || !bootPassword || normalised !== bootEmail || password !== bootPassword) return null;
    await createUser({ email: bootEmail, name: process.env.ADMIN_NAME ?? "Owner", role: "owner", password: bootPassword });
  }

  const row = db.prepare("SELECT * FROM users WHERE email = ?").get(normalised) as Record<string, unknown> | undefined;
  const ok = await verifyPassword(password, (row?.password_hash as string | undefined) ?? DUMMY_HASH);
  if (!row || !ok || Number(row.active) !== 1) return null;

  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_DAYS * 86_400_000);
  db.prepare("INSERT INTO sessions (id,user_id,expires_at,created_at) VALUES (?,?,?,?)").run(
    hashToken(token),
    row.id,
    expires.toISOString(),
    now.toISOString(),
  );
  db.prepare("UPDATE users SET last_login_at = ? WHERE id = ?").run(now.toISOString(), row.id);
  db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(now.toISOString());
  return { token, user: rowToUser(row) };
}

export function userForToken(token: string | undefined): AdminUser | null {
  if (!token) return null;
  const row = getDb()
    .prepare(
      `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.id = ? AND s.expires_at > ? AND u.active = 1`,
    )
    .get(hashToken(token), new Date().toISOString()) as Record<string, unknown> | undefined;
  return row ? rowToUser(row) : null;
}

export function signOut(token: string | undefined): void {
  if (token) getDb().prepare("DELETE FROM sessions WHERE id = ?").run(hashToken(token));
}

export function audit(actor: string, action: string, entity: string, summary: string): void {
  getDb()
    .prepare("INSERT INTO audit_log (actor,action,entity,summary,created_at) VALUES (?,?,?,?,?)")
    .run(actor, action, entity, summary.slice(0, 300), new Date().toISOString());
}

export function recentAudit(limit = 20): { actor: string; action: string; entity: string; summary: string; created_at: string }[] {
  return getDb().prepare("SELECT * FROM audit_log ORDER BY id DESC LIMIT ?").all(limit) as {
    actor: string;
    action: string;
    entity: string;
    summary: string;
    created_at: string;
  }[];
}
