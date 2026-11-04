import { getDb } from "./db";

/** In-app notifications (the bell). E-mail is sent separately when SMTP is set up. */

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  body: string;
  link: string;
  kind: string;
  created_at: string;
  read_at: string | null;
}

export function addNotification(userId: number, title: string, body = "", link = "", kind = "info"): void {
  getDb()
    .prepare("INSERT INTO notifications (user_id,title,body,link,kind,created_at) VALUES (?,?,?,?,?,?)")
    .run(userId, title.slice(0, 200), body.slice(0, 1000), link.slice(0, 300), kind, new Date().toISOString());
}

export function listNotifications(userId: number, limit = 30): Notification[] {
  return getDb().prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT ?").all(userId, limit) as Notification[];
}

export function unreadCount(userId: number): number {
  return (getDb().prepare("SELECT COUNT(*) AS n FROM notifications WHERE user_id = ? AND read_at IS NULL").get(userId) as { n: number }).n;
}

/** Marks one notification (or all of them) as read. */
export function markRead(userId: number, id?: number): void {
  const now = new Date().toISOString();
  if (id) getDb().prepare("UPDATE notifications SET read_at = COALESCE(read_at, ?) WHERE id = ? AND user_id = ?").run(now, id, userId);
  else getDb().prepare("UPDATE notifications SET read_at = ? WHERE user_id = ? AND read_at IS NULL").run(now, userId);
}

/** Drops read notifications older than `days`. */
export function pruneNotifications(days = 90): void {
  getDb().prepare("DELETE FROM notifications WHERE read_at IS NOT NULL AND created_at < ?").run(new Date(Date.now() - days * 86_400_000).toISOString());
}

/** Sends a reminder at most once per key (e.g. "checkin:2026-11-04:7"). */
export function once(key: string): boolean {
  const result = getDb().prepare("INSERT OR IGNORE INTO settings (key,value) VALUES (?, ?)").run(`sent:${key}`, JSON.stringify(new Date().toISOString()));
  return Number(result.changes) > 0;
}

/** Forgets reminder markers older than `days`. */
export function pruneReminderMarks(days = 45): void {
  getDb()
    .prepare("DELETE FROM settings WHERE key LIKE 'sent:%' AND value < ?")
    .run(JSON.stringify(new Date(Date.now() - days * 86_400_000).toISOString()));
}
