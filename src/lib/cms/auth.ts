import { createHash, createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

import { getDb } from "./db";
import { allows, permissionsFor, roleName } from "./rbac";

/**
 * Admin accounts and sessions.
 *
 * - Passwords: scrypt with a per-user salt.
 * - Sessions: a random 32-byte token in an httpOnly, SameSite=Lax cookie;
 *   only its SHA-256 is stored. Sessions last 7 days and record the device.
 * - Two-step verification (optional per user): TOTP (RFC 6238) from any
 *   authenticator app, plus one-time recovery codes. After the password, the
 *   session stays "pending" until a valid code is entered.
 * - Lockout: 5 wrong passwords lock the account for 15 minutes.
 * - Invites and resets: single-use links, stored hashed (72 h / 1 h).
 *
 * The first owner is created from ADMIN_EMAIL / ADMIN_PASSWORD the first time
 * someone signs in with them while no users exist.
 */

const scrypt = promisify(scryptCb) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;

export const SESSION_COOKIE = "stw_admin";
export const SESSION_DAYS = 7;
export const IDLE_TIMEOUT_HOURS = 12;
const MAX_FAILURES = 5;
const LOCK_MINUTES = 15;
const PENDING_MINUTES = 10;

/** A role key from the roles table (see ./rbac.ts); "owner" is built in. */
export type Role = string;

/**
 * Whether a person may do something. `permission` is "module.action"
 * ("posts.publish") or a bare module meaning "module.view".
 */
export function can(user: Pick<AdminUser, "permissions">, permission: string): boolean {
  return allows(user.permissions, permission);
}

export function needsTwoFactorSetup(user: Pick<AdminUser, "permissions" | "twoFactor">, required: boolean): boolean {
  return required && !user.twoFactor && ["users", "users.manage", "roles.manage", "settings.manage"].some((permission) => can(user, permission));
}

/** True when the person sees every record of a scoped module, not only their own. */
export function seesAll(user: Pick<AdminUser, "permissions">, module: "leads" | "enquiries" | "applications" | "tasks"): boolean {
  return allows(user.permissions, `${module}.all`);
}

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: Role;
  roleName: string;
  permissions: string[];
  active: boolean;
  created_at: string;
  last_login_at: string | null;
  mustChangePassword: boolean;
  twoFactor: boolean;
  lockedUntil: string | null;
  hasPassword: boolean;
  designation: string;
  department: string;
  phone: string;
  joinedOn: string | null;
  birthday: string | null;
  managerId: number | null;
  bio: string;
  skills: string[];
  location: string;
  emergencyContact: string;
  employeeCode: string;
  employmentType: string;
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

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

/** Same cost as a real check, for unknown e-mails (no timing leak). */
const DUMMY_HASH = `scrypt$${Buffer.alloc(16).toString("base64")}$${Buffer.alloc(64).toString("base64")}`;
/** Stored for invited users until they choose a password; never matches. */
const NO_PASSWORD = "invite$pending";

function rowToUser(row: Record<string, unknown>): AdminUser {
  return {
    id: Number(row.id),
    email: String(row.email),
    name: String(row.name),
    role: String(row.role),
    roleName: roleName(String(row.role)),
    permissions: permissionsFor(String(row.role)),
    active: Number(row.active) === 1,
    created_at: String(row.created_at),
    last_login_at: (row.last_login_at as string | null) ?? null,
    mustChangePassword: Number(row.must_change_password) === 1,
    twoFactor: Number(row.totp_enabled) === 1,
    lockedUntil: (row.locked_until as string | null) ?? null,
    hasPassword: row.password_hash !== NO_PASSWORD,
    designation: String(row.designation ?? ""),
    department: String(row.department ?? ""),
    phone: String(row.phone ?? ""),
    joinedOn: (row.joined_on as string | null) ?? null,
    birthday: (row.birthday as string | null) ?? null,
    managerId: row.manager_id == null ? null : Number(row.manager_id),
    bio: String(row.bio ?? ""),
    skills: String(row.skills ?? "")
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean),
    location: String(row.location ?? ""),
    emergencyContact: String(row.emergency_contact ?? ""),
    employeeCode: String(row.employee_code ?? ""),
    employmentType: String(row.employment_type ?? ""),
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

export function getUserByEmail(email: string): AdminUser | null {
  const row = getDb().prepare("SELECT * FROM users WHERE email = ?").get(email.trim().toLowerCase()) as Record<string, unknown> | undefined;
  return row ? rowToUser(row) : null;
}

/**
 * Creates an account. With a password it is a temporary one the person must
 * change on first sign-in (unless `temporary` is false, e.g. the bootstrap
 * owner); without one the account waits for an invite link to be used.
 */
export async function createUser(input: {
  email: string;
  name: string;
  role: Role;
  password?: string;
  temporary?: boolean;
}): Promise<AdminUser> {
  const now = new Date().toISOString();
  const hash = input.password ? await hashPassword(input.password) : NO_PASSWORD;
  const result = getDb()
    .prepare(
      `INSERT INTO users (id,email,name,role,password_hash,must_change_password,created_at)
       VALUES (
         1 + MAX(
           COALESCE((SELECT MAX(id) FROM users), 0),
           COALESCE((SELECT MAX(user_id) FROM documents), 0),
           COALESCE((SELECT MAX(user_id) FROM expense_claims), 0)
         ),
         ?,?,?,?,?,?
       )`,
    )
    .run(input.email.trim().toLowerCase(), input.name.trim(), input.role, hash, input.password && input.temporary !== false ? 1 : 0, now);
  return getUser(Number(result.lastInsertRowid)) as AdminUser;
}

/** Sets a password; `temporary` makes the person choose their own next time. */
export async function setPassword(userId: number, password: string, temporary = false): Promise<void> {
  getDb()
    .prepare("UPDATE users SET password_hash = ?, must_change_password = ?, failed_attempts = 0, locked_until = NULL WHERE id = ?")
    .run(await hashPassword(password), temporary ? 1 : 0, userId);
  // A new password signs every existing session out.
  getDb().prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
  // An admin-set password replaces any unused invite or reset link.
  if (temporary) getDb().prepare("DELETE FROM password_tokens WHERE user_id = ? AND used_at IS NULL").run(userId);
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

/**
 * Removes an account for good. Sessions and password links go with it
 * (cascade); work history such as tasks, time and leave stays and shows as
 * "Former member".
 */
export function deleteUser(userId: number): void {
  const db = getDb();
  db.exec("BEGIN");
  try {
    db.prepare("UPDATE users SET manager_id = NULL WHERE manager_id = ?").run(userId);
    db.prepare("DELETE FROM notifications WHERE user_id = ?").run(userId);
    db.prepare("DELETE FROM work_updates WHERE user_id = ?").run(userId);
    db.prepare("DELETE FROM users WHERE id = ?").run(userId);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export interface Profile {
  designation: string;
  department: string;
  phone: string;
  joinedOn: string | null;
  birthday: string | null;
  managerId: number | null;
}

/** Job details shown in the directory; the manager can't be the person themself or someone who reports to them. */
export function updateProfile(userId: number, profile: Profile): void {
  let managerId = profile.managerId && profile.managerId !== userId ? profile.managerId : null;
  // Walk up the chain to stop loops (A reports to B reports to A).
  for (let id = managerId, guard = 0; id && guard < 50; guard += 1) {
    if (id === userId) {
      managerId = null;
      break;
    }
    id = (getDb().prepare("SELECT manager_id FROM users WHERE id = ?").get(id) as { manager_id: number | null } | undefined)?.manager_id ?? null;
  }
  getDb()
    .prepare("UPDATE users SET designation = ?, department = ?, phone = ?, joined_on = ?, birthday = ?, manager_id = ? WHERE id = ?")
    .run(profile.designation, profile.department, profile.phone, profile.joinedOn, profile.birthday, managerId, userId);
}

export const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Intern", "Contract", "Freelance"] as const;

/** The parts of a profile people write about themselves. */
export function updateAbout(userId: number, about: { bio: string; skills: string[]; location: string; emergencyContact: string }): void {
  const skills = [...new Set(about.skills.map((skill) => skill.trim().slice(0, 30)).filter(Boolean))].slice(0, 20);
  getDb()
    .prepare("UPDATE users SET bio = ?, skills = ?, location = ?, emergency_contact = ? WHERE id = ?")
    .run(about.bio, skills.join(", "), about.location, about.emergencyContact, userId);
}

/** HR details only someone who manages the team can set. */
export function updateEmployment(userId: number, employment: { employeeCode: string; employmentType: string }): void {
  const type = (EMPLOYMENT_TYPES as readonly string[]).includes(employment.employmentType) ? employment.employmentType : "";
  getDb().prepare("UPDATE users SET employee_code = ?, employment_type = ? WHERE id = ?").run(employment.employeeCode, type, userId);
}

/** People who report to `managerId`, directly or through others. */
export function reportIds(managerId: number): number[] {
  const rows = getDb().prepare("SELECT id, manager_id FROM users").all() as { id: number; manager_id: number | null }[];
  const found: number[] = [];
  let frontier = [managerId];
  while (frontier.length && found.length < 500) {
    const next = rows.filter((row) => row.manager_id !== null && frontier.includes(row.manager_id) && !found.includes(row.id) && row.id !== managerId).map((row) => row.id);
    found.push(...next);
    frontier = next;
  }
  return found;
}

export function unlockUser(userId: number): void {
  getDb().prepare("UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ?").run(userId);
}

export function ownerCount(): number {
  return (getDb().prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'owner' AND active = 1").get() as { n: number }).n;
}

/* -------------------------------------------------------------------------- */
/* Sign in                                                                     */
/* -------------------------------------------------------------------------- */

export type SignInResult =
  | { ok: true; token: string; user: AdminUser; needsCode: boolean }
  | { ok: false; reason: "invalid" | "locked"; lockedUntil?: string };

export interface DeviceInfo {
  userAgent?: string;
  ip?: string;
}

function createSession(userId: number, device: DeviceInfo, mfaOk: boolean): string {
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  const expires = new Date(now.getTime() + (mfaOk ? SESSION_DAYS * 86_400_000 : PENDING_MINUTES * 60_000));
  getDb()
    .prepare("INSERT INTO sessions (id,user_id,expires_at,created_at,user_agent,ip,last_seen_at,mfa_ok) VALUES (?,?,?,?,?,?,?,?)")
    .run(sha256(token), userId, expires.toISOString(), now.toISOString(), device.userAgent?.slice(0, 300) ?? null, device.ip ?? null, now.toISOString(), mfaOk ? 1 : 0);
  getDb().prepare("DELETE FROM sessions WHERE expires_at < ?").run(now.toISOString());
  return token;
}

export async function signIn(email: string, password: string, device: DeviceInfo = {}): Promise<SignInResult> {
  const db = getDb();
  const normalised = email.trim().toLowerCase();

  const count = (db.prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number }).n;
  if (count === 0) {
    const bootEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const bootPassword = process.env.ADMIN_PASSWORD;
    if (!bootEmail || !bootPassword || normalised !== bootEmail || password !== bootPassword) return { ok: false, reason: "invalid" };
    await createUser({ email: bootEmail, name: process.env.ADMIN_NAME ?? "Owner", role: "owner", password: bootPassword, temporary: false });
  }

  const row = db.prepare("SELECT * FROM users WHERE email = ?").get(normalised) as Record<string, unknown> | undefined;
  const now = new Date();
  if (row?.locked_until && String(row.locked_until) > now.toISOString()) {
    return { ok: false, reason: "locked", lockedUntil: String(row.locked_until) };
  }

  const ok = await verifyPassword(password, (row?.password_hash as string | undefined) ?? DUMMY_HASH);
  if (!row || !ok || Number(row.active) !== 1) {
    if (row && !ok) {
      const failures = Number(row.failed_attempts ?? 0) + 1;
      const lock = failures >= MAX_FAILURES ? new Date(now.getTime() + LOCK_MINUTES * 60_000).toISOString() : null;
      db.prepare("UPDATE users SET failed_attempts = ?, locked_until = ? WHERE id = ?").run(lock ? 0 : failures, lock, row.id);
      if (lock) return { ok: false, reason: "locked", lockedUntil: lock };
    }
    return { ok: false, reason: "invalid" };
  }

  db.prepare("UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ?").run(row.id);
  const needsCode = Number(row.totp_enabled) === 1;
  if (!needsCode) db.prepare("UPDATE users SET last_login_at = ? WHERE id = ?").run(now.toISOString(), row.id);
  return { ok: true, token: createSession(Number(row.id), device, !needsCode), user: rowToUser(row), needsCode };
}

/** Second step: a code from the authenticator app, or a recovery code. */
export function completeTwoFactor(token: string | undefined, code: string): AdminUser | null {
  if (!token) return null;
  const db = getDb();
  const row = db
    .prepare(
      `SELECT u.*, s.id AS session_id FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.id = ? AND s.mfa_ok = 0 AND s.expires_at > ? AND u.active = 1`,
    )
    .get(sha256(token), new Date().toISOString()) as Record<string, unknown> | undefined;
  if (!row) return null;
  const valid = verifyTotp(String(row.totp_secret ?? ""), code) || redeemRecoveryCode(Number(row.id), code);
  if (!valid) return null;
  const now = new Date();
  db.prepare("UPDATE sessions SET mfa_ok = 1, expires_at = ? WHERE id = ?").run(
    new Date(now.getTime() + SESSION_DAYS * 86_400_000).toISOString(),
    row.session_id,
  );
  db.prepare("UPDATE users SET last_login_at = ? WHERE id = ?").run(now.toISOString(), row.id);
  return rowToUser(row);
}

/** True while a password was accepted but the 2-step code is still due. */
export function pendingTwoFactor(token: string | undefined): boolean {
  if (!token) return false;
  return Boolean(
    getDb().prepare("SELECT 1 FROM sessions WHERE id = ? AND mfa_ok = 0 AND expires_at > ?").get(sha256(token), new Date().toISOString()),
  );
}

export function userForToken(token: string | undefined): AdminUser | null {
  if (!token) return null;
  const id = sha256(token);
  const nowMillis = Date.now();
  const now = new Date(nowMillis).toISOString();
  const row = getDb()
    .prepare(
      `SELECT u.*, s.last_seen_at AS seen, s.created_at AS session_created_at FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.id = ? AND s.expires_at > ? AND s.mfa_ok = 1 AND u.active = 1`,
    )
    .get(id, now) as Record<string, unknown> | undefined;
  if (!row) return null;
  const lastSeen = row.seen ?? row.session_created_at;
  if (lastSeen && Date.parse(String(lastSeen)) < nowMillis - IDLE_TIMEOUT_HOURS * 60 * 60_000) {
    getDb().prepare("DELETE FROM sessions WHERE id = ?").run(id);
    return null;
  }
  // Record activity at most every five minutes.
  if (!row.seen || Date.parse(String(row.seen)) < nowMillis - 5 * 60_000) {
    getDb().prepare("UPDATE sessions SET last_seen_at = ? WHERE id = ?").run(now, id);
  }
  return rowToUser(row);
}

export function isNewDeviceSignIn(userId: number, userAgent: string | undefined, currentToken: string): boolean {
  const sessions = getDb()
    .prepare("SELECT user_agent FROM sessions WHERE user_id = ? AND id != ? AND mfa_ok = 1")
    .all(userId, sha256(currentToken)) as { user_agent: string | null }[];
  const currentAgent = userAgent?.slice(0, 300) ?? null;
  return sessions.length > 0 && !sessions.some((session) => session.user_agent === currentAgent);
}

export function signOut(token: string | undefined): void {
  if (token) getDb().prepare("DELETE FROM sessions WHERE id = ?").run(sha256(token));
}

/* -------------------------------------------------------------------------- */
/* Devices                                                                     */
/* -------------------------------------------------------------------------- */

export interface SessionInfo {
  id: string;
  user_agent: string | null;
  ip: string | null;
  created_at: string;
  last_seen_at: string | null;
  current: boolean;
}

export function describeDevice(agent: string | null): { label: string; mobile: boolean } {
  const ua = agent ?? "";
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser";
  const os = /iPhone|iPad/.test(ua) ? "iPhone/iPad" : /Android/.test(ua) ? "Android" : /Mac OS X/.test(ua) ? "Mac" : /Windows/.test(ua) ? "Windows" : /Linux/.test(ua) ? "Linux" : "Unknown device";
  return { label: `${browser} on ${os}`, mobile: /iPhone|iPad|Android/.test(ua) };
}

export function listSessions(userId: number, currentToken?: string): SessionInfo[] {
  const current = currentToken ? sha256(currentToken) : "";
  const idleCutoff = new Date(Date.now() - IDLE_TIMEOUT_HOURS * 60 * 60_000).toISOString();
  return (getDb()
    .prepare(
      "SELECT id,user_agent,ip,created_at,last_seen_at FROM sessions WHERE user_id = ? AND mfa_ok = 1 AND expires_at > ? AND COALESCE(last_seen_at, created_at) >= ? ORDER BY COALESCE(last_seen_at, created_at) DESC",
    )
    .all(userId, new Date().toISOString(), idleCutoff) as Omit<SessionInfo, "current">[]).map((row) => ({ ...row, current: row.id === current }));
}

export function revokeSession(userId: number, sessionId: string): void {
  getDb().prepare("DELETE FROM sessions WHERE id = ? AND user_id = ?").run(sessionId, userId);
}

export function revokeOtherSessions(userId: number, currentToken?: string): void {
  getDb().prepare("DELETE FROM sessions WHERE user_id = ? AND id != ?").run(userId, currentToken ? sha256(currentToken) : "");
}

/* -------------------------------------------------------------------------- */
/* Invite and reset links                                                      */
/* -------------------------------------------------------------------------- */

export function createPasswordToken(userId: number, purpose: "invite" | "reset"): string {
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  const hours = purpose === "invite" ? 72 : 1;
  getDb().prepare("DELETE FROM password_tokens WHERE user_id = ? AND used_at IS NULL").run(userId);
  getDb()
    .prepare("INSERT INTO password_tokens (id,user_id,purpose,expires_at,created_at) VALUES (?,?,?,?,?)")
    .run(sha256(token), userId, purpose, new Date(now.getTime() + hours * 3_600_000).toISOString(), now.toISOString());
  return token;
}

/** The account a link belongs to, if the link is unused and unexpired. */
export function userForPasswordToken(token: string): { user: AdminUser; purpose: "invite" | "reset" } | null {
  const row = getDb()
    .prepare(
      `SELECT u.*, t.purpose AS purpose FROM password_tokens t JOIN users u ON u.id = t.user_id
       WHERE t.id = ? AND t.used_at IS NULL AND t.expires_at > ? AND u.active = 1`,
    )
    .get(sha256(token), new Date().toISOString()) as Record<string, unknown> | undefined;
  return row ? { user: rowToUser(row), purpose: row.purpose as "invite" | "reset" } : null;
}

export async function redeemPasswordToken(token: string, password: string): Promise<AdminUser | null> {
  const found = userForPasswordToken(token);
  if (!found) return null;
  await setPassword(found.user.id, password);
  getDb().prepare("UPDATE password_tokens SET used_at = ? WHERE id = ?").run(new Date().toISOString(), sha256(token));
  return found.user;
}

/** Signs in straight after setting a password from a link (still asks for 2FA). */
export function sessionAfterPasswordSet(user: AdminUser, device: DeviceInfo): { token: string; needsCode: boolean } {
  return { token: createSession(user.id, device, !user.twoFactor), needsCode: user.twoFactor };
}

/* -------------------------------------------------------------------------- */
/* Two-step verification (TOTP)                                                */
/* -------------------------------------------------------------------------- */

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32Encode(bytes: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += BASE32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += BASE32[(value << (5 - bits)) & 31];
  return out;
}

function base32Decode(text: string): Buffer {
  const clean = text.replace(/[\s=-]/g, "").toUpperCase();
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const char of clean) {
    const index = BASE32.indexOf(char);
    if (index < 0) continue;
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

export function totpCode(secret: string, time = Date.now()): string {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(time / 1000 / 30)));
  const hmac = createHmac("sha1", base32Decode(secret)).update(counter).digest();
  const offset = hmac[hmac.length - 1] & 15;
  const binary = ((hmac[offset] & 0x7f) << 24) | (hmac[offset + 1] << 16) | (hmac[offset + 2] << 8) | hmac[offset + 3];
  return String(binary % 1_000_000).padStart(6, "0");
}

/** Accepts the current code and one step either side (clock drift). */
export function verifyTotp(secret: string, code: string, time = Date.now()): boolean {
  const clean = code.replace(/\s/g, "");
  if (!secret || !/^\d{6}$/.test(clean)) return false;
  return [-1, 0, 1].some((step) => {
    const expected = totpCode(secret, time + step * 30_000);
    return timingSafeEqual(Buffer.from(expected), Buffer.from(clean));
  });
}

export function newTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

export function otpauthUrl(secret: string, email: string): string {
  const label = encodeURIComponent(`Setuware Core:${email}`);
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent("Setuware Core")}&algorithm=SHA1&digits=6&period=30`;
}

/** Turns 2-step on once the user proves the app works; returns recovery codes. */
export function enableTwoFactor(userId: number, secret: string, code: string): string[] | null {
  if (!verifyTotp(secret, code)) return null;
  const codes = Array.from({ length: 8 }, () => {
    const raw = randomBytes(5).toString("hex");
    return `${raw.slice(0, 5)}-${raw.slice(5)}`;
  });
  getDb()
    .prepare("UPDATE users SET totp_secret = ?, totp_enabled = 1, recovery_codes = ? WHERE id = ?")
    .run(secret, JSON.stringify(codes.map((item) => sha256(item))), userId);
  return codes;
}

export function disableTwoFactor(userId: number): void {
  getDb().prepare("UPDATE users SET totp_secret = NULL, totp_enabled = 0, recovery_codes = NULL WHERE id = ?").run(userId);
}

export function recoveryCodesLeft(userId: number): number {
  const row = getDb().prepare("SELECT recovery_codes FROM users WHERE id = ?").get(userId) as { recovery_codes: string | null } | undefined;
  try {
    return (JSON.parse(row?.recovery_codes ?? "[]") as string[]).length;
  } catch {
    return 0;
  }
}

function redeemRecoveryCode(userId: number, code: string): boolean {
  const clean = code.trim().toLowerCase();
  if (!/^[0-9a-f]{5}-[0-9a-f]{5}$/.test(clean)) return false;
  const row = getDb().prepare("SELECT recovery_codes FROM users WHERE id = ?").get(userId) as { recovery_codes: string | null };
  let hashes: string[] = [];
  try {
    hashes = JSON.parse(row.recovery_codes ?? "[]") as string[];
  } catch {
    return false;
  }
  const hash = sha256(clean);
  if (!hashes.includes(hash)) return false;
  getDb()
    .prepare("UPDATE users SET recovery_codes = ? WHERE id = ?")
    .run(JSON.stringify(hashes.filter((item) => item !== hash)), userId);
  return true;
}

/* -------------------------------------------------------------------------- */
/* Audit log                                                                   */
/* -------------------------------------------------------------------------- */

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
