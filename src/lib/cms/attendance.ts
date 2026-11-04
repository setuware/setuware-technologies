import { getDb } from "./db";

/**
 * Attendance, breaks, leave and corrections. Times are stored in UTC (ISO);
 * days and clock times are worked out in India time.
 */

export const TZ = "Asia/Kolkata";

export interface AttendanceSettings {
  /** Office start, "HH:MM". */
  start: string;
  /** Minutes after start before a check-in counts as late. */
  graceMinutes: number;
  fullDayHours: number;
  halfDayHours: number;
  /** Weekly days off, 0 = Sunday … 6 = Saturday. */
  weeklyOff: number[];
  /** Office location for "at office" checks; null to skip. */
  office: { lat: number; lng: number; radius: number } | null;
  /** Refuse check-in / check-out without the browser's location. */
  requireLocation: boolean;
  /** Leave allowed per calendar year, by type. */
  quotas: Record<string, number>;
}

export const DEFAULT_ATTENDANCE: AttendanceSettings = {
  start: "10:00",
  graceMinutes: 15,
  fullDayHours: 8,
  halfDayHours: 4,
  weeklyOff: [0],
  office: null,
  requireLocation: false,
  quotas: { Casual: 12, Sick: 6, Earned: 12 },
};

export const LEAVE_TYPES = ["Casual", "Sick", "Earned", "Unpaid", "Work from home"] as const;
export const MODES = ["office", "remote", "field"] as const;
export type Mode = (typeof MODES)[number];

export interface AttendanceRecord {
  id: number;
  user_id: number;
  day: string;
  check_in_at: string;
  check_out_at: string | null;
  break_minutes: number;
  break_started_at: string | null;
  mode: Mode;
  in_ip: string | null;
  out_ip: string | null;
  in_lat: number | null;
  in_lng: number | null;
  in_distance: number | null;
  in_accuracy: number | null;
  out_lat: number | null;
  out_lng: number | null;
  out_accuracy: number | null;
  out_distance: number | null;
  summary: string;
  edited_by: string | null;
}

export interface LeaveRequest {
  id: number;
  user_id: number;
  user_name: string;
  kind: "leave" | "correction";
  leave_type: string;
  from_day: string;
  to_day: string;
  half_day: number;
  check_in: string | null;
  check_out: string | null;
  reason: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  decided_by: string | null;
  decided_at: string | null;
  decision_note: string;
  created_at: string;
}

/* ------------------------------- time helpers ------------------------------ */

/** "YYYY-MM-DD" in India time. */
export function localDay(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

/** "HH:MM" (24 h) in India time. */
export function localTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(iso));
}

/** UTC ISO for a day and "HH:MM" in India time. */
export function toIso(day: string, time: string): string {
  return new Date(`${day}T${time}:00+05:30`).toISOString();
}

export function weekday(day: string): number {
  return new Date(`${day}T12:00:00+05:30`).getUTCDay();
}

export function addDays(day: string, n: number): string {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + n);
  return date.toISOString().slice(0, 10);
}

export function daysInMonth(month: string): string[] {
  const [year, m] = month.split("-").map(Number);
  const count = new Date(Date.UTC(year, m, 0)).getUTCDate();
  return Array.from({ length: count }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`);
}

const minutesBetween = (from: string, to: string) => Math.max(0, Math.round((Date.parse(to) - Date.parse(from)) / 60_000));

export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
}

/** Metres between two points (haversine). */
export function distanceMetres(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return Math.round(2 * 6_371_000 * Math.asin(Math.sqrt(h)));
}

/* --------------------------------- settings -------------------------------- */

export function attendanceSettings(): AttendanceSettings {
  const row = getDb().prepare("SELECT value FROM settings WHERE key = 'attendance'").get() as { value: string } | undefined;
  if (!row) return DEFAULT_ATTENDANCE;
  try {
    return { ...DEFAULT_ATTENDANCE, ...(JSON.parse(row.value) as Partial<AttendanceSettings>) };
  } catch {
    return DEFAULT_ATTENDANCE;
  }
}

export function saveAttendanceSettings(settings: AttendanceSettings): void {
  getDb()
    .prepare("INSERT INTO settings (key,value) VALUES ('attendance',?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    .run(JSON.stringify(settings));
}

export function listHolidays(year?: string): { day: string; name: string }[] {
  return getDb()
    .prepare(year ? "SELECT * FROM holidays WHERE day LIKE ? ORDER BY day" : "SELECT * FROM holidays ORDER BY day")
    .all(...(year ? [`${year}-%`] : [])) as { day: string; name: string }[];
}

export function addHoliday(day: string, name: string): void {
  getDb().prepare("INSERT INTO holidays (day,name) VALUES (?,?) ON CONFLICT(day) DO UPDATE SET name = excluded.name").run(day, name);
}

export function removeHoliday(day: string): void {
  getDb().prepare("DELETE FROM holidays WHERE day = ?").run(day);
}

/* ------------------------------ check in / out ----------------------------- */

export function recordFor(userId: number, day: string): AttendanceRecord | null {
  return (getDb().prepare("SELECT * FROM attendance WHERE user_id = ? AND day = ?").get(userId, day) as AttendanceRecord | undefined) ?? null;
}

/** Minutes worked: check-in to check-out (or now), minus breaks. */
export function workedMinutes(record: AttendanceRecord, now: Date = new Date()): number {
  const end = record.check_out_at ?? now.toISOString();
  const runningBreak = record.break_started_at && !record.check_out_at ? minutesBetween(record.break_started_at, now.toISOString()) : 0;
  return Math.max(0, minutesBetween(record.check_in_at, end) - record.break_minutes - runningBreak);
}

export function isLate(record: AttendanceRecord, settings: AttendanceSettings = attendanceSettings()): boolean {
  const [h, m] = settings.start.split(":").map(Number);
  const [ih, im] = localTime(record.check_in_at).split(":").map(Number);
  return ih * 60 + im > h * 60 + m + settings.graceMinutes;
}

export interface Presence {
  state: "out" | "in" | "break" | "done";
  record: AttendanceRecord | null;
}

export function presence(userId: number, now: Date = new Date()): Presence {
  const record = recordFor(userId, localDay(now));
  if (!record) return { state: "out", record: null };
  if (record.check_out_at) return { state: "done", record };
  return { state: record.break_started_at ? "break" : "in", record };
}

export interface Location {
  lat: number;
  lng: number;
  /** Metres. */
  accuracy?: number | null;
}

export interface CheckInInput {
  mode: Mode;
  ip?: string;
  location?: Location | null;
}

function checkLocation(location: Location | null | undefined, settings: AttendanceSettings): { distance: number | null } {
  if (!location) {
    if (settings.requireLocation) throw new Error("Allow location access in your browser to continue (your company requires it).");
    return { distance: null };
  }
  return { distance: settings.office ? distanceMetres(settings.office, location) : null };
}

/** Checks in for today; checking in again after checking out resumes the day (the gap counts as a break). */
export function checkIn(userId: number, input: CheckInInput, now: Date = new Date()): AttendanceRecord {
  const db = getDb();
  const day = localDay(now);
  const iso = now.toISOString();
  const existing = recordFor(userId, day);
  if (existing && !existing.check_out_at) throw new Error("You are already checked in.");
  if (existing?.check_out_at) {
    db.prepare("UPDATE attendance SET check_out_at = NULL, break_minutes = break_minutes + ? WHERE id = ?").run(minutesBetween(existing.check_out_at, iso), existing.id);
    return recordFor(userId, day) as AttendanceRecord;
  }
  const { distance } = checkLocation(input.location, attendanceSettings());
  db.prepare("INSERT INTO attendance (user_id,day,check_in_at,mode,in_ip,in_lat,in_lng,in_accuracy,in_distance) VALUES (?,?,?,?,?,?,?,?,?)").run(
    userId,
    day,
    iso,
    MODES.includes(input.mode) ? input.mode : "office",
    input.ip ?? null,
    input.location?.lat ?? null,
    input.location?.lng ?? null,
    input.location?.accuracy != null ? Math.round(input.location.accuracy) : null,
    distance,
  );
  return recordFor(userId, day) as AttendanceRecord;
}

export function startBreak(userId: number, now: Date = new Date()): void {
  const record = recordFor(userId, localDay(now));
  if (!record || record.check_out_at) throw new Error("Check in first.");
  if (record.break_started_at) return;
  getDb().prepare("UPDATE attendance SET break_started_at = ? WHERE id = ?").run(now.toISOString(), record.id);
}

export function endBreak(userId: number, now: Date = new Date()): void {
  const record = recordFor(userId, localDay(now));
  if (!record?.break_started_at) return;
  getDb()
    .prepare("UPDATE attendance SET break_minutes = break_minutes + ?, break_started_at = NULL WHERE id = ?")
    .run(minutesBetween(record.break_started_at, now.toISOString()), record.id);
}

export function checkOut(userId: number, input: { summary?: string; ip?: string; location?: Location | null }, now: Date = new Date()): AttendanceRecord {
  const day = localDay(now);
  const record = recordFor(userId, day);
  if (!record || record.check_out_at) throw new Error("You are not checked in.");
  const { distance } = checkLocation(input.location, attendanceSettings());
  endBreak(userId, now);
  getDb()
    .prepare(
      "UPDATE attendance SET check_out_at = ?, out_ip = ?, out_lat = ?, out_lng = ?, out_accuracy = ?, out_distance = ?, summary = CASE WHEN ? = '' THEN summary ELSE ? END WHERE id = ?",
    )
    .run(
      now.toISOString(),
      input.ip ?? null,
      input.location?.lat ?? null,
      input.location?.lng ?? null,
      input.location?.accuracy != null ? Math.round(input.location.accuracy) : null,
      distance,
      input.summary ?? "",
      input.summary ?? "",
      record.id,
    );
  return recordFor(userId, day) as AttendanceRecord;
}

/** Earlier days left without a check-out. */
export function missedCheckOuts(userId: number, today: string = localDay()): AttendanceRecord[] {
  return getDb()
    .prepare("SELECT * FROM attendance WHERE user_id = ? AND check_out_at IS NULL AND day < ? ORDER BY day DESC LIMIT 10")
    .all(userId, today) as AttendanceRecord[];
}

/** Sets a day's times by hand (manager fix or approved correction). */
export function setAttendance(userId: number, day: string, checkInAt: string, checkOutAt: string | null, by: string, breakMinutes?: number): void {
  const existing = recordFor(userId, day);
  if (existing) {
    getDb()
      .prepare("UPDATE attendance SET check_in_at = ?, check_out_at = ?, break_started_at = NULL, break_minutes = COALESCE(?, break_minutes), edited_by = ? WHERE id = ?")
      .run(checkInAt, checkOutAt, breakMinutes ?? null, by, existing.id);
  } else {
    getDb()
      .prepare("INSERT INTO attendance (user_id,day,check_in_at,check_out_at,break_minutes,edited_by) VALUES (?,?,?,?,?,?)")
      .run(userId, day, checkInAt, checkOutAt, breakMinutes ?? 0, by);
  }
}

export function deleteAttendance(userId: number, day: string): void {
  getDb().prepare("DELETE FROM attendance WHERE user_id = ? AND day = ?").run(userId, day);
}

/* ---------------------------- leave & corrections --------------------------- */

const REQUEST_SELECT = "SELECT r.*, COALESCE(u.name, 'Former member') AS user_name FROM leave_requests r LEFT JOIN users u ON u.id = r.user_id";

export function listRequests(filter: { userId?: number; status?: string; from?: string; to?: string } = {}): LeaveRequest[] {
  const where: string[] = [];
  const params: unknown[] = [];
  if (filter.userId) {
    where.push("r.user_id = ?");
    params.push(filter.userId);
  }
  if (filter.status) {
    where.push("r.status = ?");
    params.push(filter.status);
  }
  if (filter.from && filter.to) {
    where.push("r.to_day >= ? AND r.from_day <= ?");
    params.push(filter.from, filter.to);
  }
  return getDb()
    .prepare(`${REQUEST_SELECT} ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY r.created_at DESC LIMIT 300`)
    .all(...params) as LeaveRequest[];
}

export function getRequest(id: number): LeaveRequest | null {
  return (getDb().prepare(`${REQUEST_SELECT} WHERE r.id = ?`).get(id) as LeaveRequest | undefined) ?? null;
}

/** Working days in a range (weekly offs and holidays excluded). */
export function workingDays(from: string, to: string, settings: AttendanceSettings = attendanceSettings()): string[] {
  const holidays = new Set(listHolidays().map((holiday) => holiday.day));
  const days: string[] = [];
  for (let day = from; day <= to && days.length < 370; day = addDays(day, 1)) {
    if (!settings.weeklyOff.includes(weekday(day)) && !holidays.has(day)) days.push(day);
  }
  return days;
}

export function requestLeave(userId: number, input: { type: string; from: string; to: string; halfDay: boolean; reason: string }): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.from) || !/^\d{4}-\d{2}-\d{2}$/.test(input.to) || input.to < input.from) throw new Error("Choose valid dates.");
  if (input.halfDay && input.from !== input.to) throw new Error("A half day must be a single date.");
  if (!workingDays(input.from, input.to).length) throw new Error("Those dates are all days off or holidays.");
  const overlap = getDb()
    .prepare("SELECT 1 FROM leave_requests WHERE user_id = ? AND kind = 'leave' AND status IN ('pending','approved') AND to_day >= ? AND from_day <= ?")
    .get(userId, input.from, input.to);
  if (overlap) throw new Error("You already have leave on some of these dates.");
  const result = getDb()
    .prepare("INSERT INTO leave_requests (user_id,kind,leave_type,from_day,to_day,half_day,reason,created_at) VALUES (?,'leave',?,?,?,?,?,?)")
    .run(userId, input.type, input.from, input.to, input.halfDay ? 1 : 0, input.reason, new Date().toISOString());
  return Number(result.lastInsertRowid);
}

export function requestCorrection(userId: number, input: { day: string; checkIn: string; checkOut: string; reason: string }, today: string = localDay()): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.day) || input.day > today) throw new Error("Choose a past date.");
  if (!/^\d{2}:\d{2}$/.test(input.checkIn) || !/^\d{2}:\d{2}$/.test(input.checkOut) || input.checkOut <= input.checkIn) {
    throw new Error("Check-out must be after check-in.");
  }
  if (!input.reason) throw new Error("Add a reason.");
  const result = getDb()
    .prepare("INSERT INTO leave_requests (user_id,kind,from_day,to_day,check_in,check_out,reason,created_at) VALUES (?,'correction',?,?,?,?,?,?)")
    .run(userId, input.day, input.day, input.checkIn, input.checkOut, input.reason, new Date().toISOString());
  return Number(result.lastInsertRowid);
}

/** Approves or rejects; an approved correction rewrites that day's times. */
export function decideRequest(id: number, approve: boolean, by: string, note = ""): LeaveRequest {
  const request = getRequest(id);
  if (!request || request.status !== "pending") throw new Error("This request was already handled.");
  getDb()
    .prepare("UPDATE leave_requests SET status = ?, decided_by = ?, decided_at = ?, decision_note = ? WHERE id = ?")
    .run(approve ? "approved" : "rejected", by, new Date().toISOString(), note, id);
  if (approve && request.kind === "correction" && request.check_in && request.check_out) {
    setAttendance(request.user_id, request.from_day, toIso(request.from_day, request.check_in), toIso(request.from_day, request.check_out), by);
  }
  return getRequest(id) as LeaveRequest;
}

export function cancelRequest(id: number, userId: number): void {
  getDb().prepare("UPDATE leave_requests SET status = 'cancelled' WHERE id = ? AND user_id = ? AND status = 'pending'").run(id, userId);
}

/** Days of leave taken this year by type (approved, working days only). */
export function leaveUsed(userId: number, year: string): Record<string, number> {
  const settings = attendanceSettings();
  const used: Record<string, number> = {};
  for (const request of listRequests({ userId, status: "approved", from: `${year}-01-01`, to: `${year}-12-31` })) {
    if (request.kind !== "leave") continue;
    const from = request.from_day < `${year}-01-01` ? `${year}-01-01` : request.from_day;
    const to = request.to_day > `${year}-12-31` ? `${year}-12-31` : request.to_day;
    const days = request.half_day ? 0.5 : workingDays(from, to, settings).length;
    used[request.leave_type] = (used[request.leave_type] ?? 0) + days;
  }
  return used;
}

export function leaveBalance(userId: number, year: string): { type: string; quota: number; used: number; left: number }[] {
  const used = leaveUsed(userId, year);
  return Object.entries(attendanceSettings().quotas).map(([type, quota]) => ({
    type,
    quota,
    used: used[type] ?? 0,
    left: Math.max(0, quota - (used[type] ?? 0)),
  }));
}

/* ------------------------------ register / board ---------------------------- */

/**
 * Day codes: P present, HD half day, S short, L leave, HL half-day leave,
 * WFH, H holiday, WO weekly off, A absent, MC missed check-out, IN at work now.
 */
export type DayCode = "P" | "HD" | "S" | "L" | "HL" | "WFH" | "H" | "WO" | "A" | "MC" | "IN" | "";

export interface DayCell {
  day: string;
  code: DayCode;
  late: boolean;
  minutes: number;
  record: AttendanceRecord | null;
  leave: string | null;
  holiday: string | null;
}

export interface RegisterRow {
  userId: number;
  name: string;
  cells: DayCell[];
  totals: { present: number; half: number; leave: number; absent: number; late: number; minutes: number };
}

function codeFor(
  day: string,
  record: AttendanceRecord | null,
  leave: LeaveRequest | null,
  holiday: string | null,
  settings: AttendanceSettings,
  today: string,
  now: Date,
): { code: DayCode; minutes: number } {
  if (record) {
    if (!record.check_out_at) return day === today ? { code: "IN", minutes: workedMinutes(record, now) } : { code: "MC", minutes: 0 };
    const minutes = workedMinutes(record, now);
    if (minutes >= settings.fullDayHours * 60) return { code: "P", minutes };
    if (leave?.half_day) return { code: "HL", minutes };
    if (minutes >= settings.halfDayHours * 60) return { code: "HD", minutes };
    return { code: "S", minutes };
  }
  if (leave) return { code: leave.leave_type === "Work from home" ? "WFH" : leave.half_day ? "HL" : "L", minutes: 0 };
  if (holiday) return { code: "H", minutes: 0 };
  if (settings.weeklyOff.includes(weekday(day))) return { code: "WO", minutes: 0 };
  if (day >= today) return { code: "", minutes: 0 };
  return { code: "A", minutes: 0 };
}

export function register(month: string, users: { id: number; name: string; created_at?: string }[], now: Date = new Date()): RegisterRow[] {
  const settings = attendanceSettings();
  const days = daysInMonth(month);
  const today = localDay(now);
  const holidays = new Map(listHolidays(month.slice(0, 4)).map((holiday) => [holiday.day, holiday.name]));
  const records = getDb().prepare("SELECT * FROM attendance WHERE day LIKE ?").all(`${month}-%`) as AttendanceRecord[];
  const leaves = listRequests({ status: "approved", from: days[0], to: days[days.length - 1] }).filter((request) => request.kind === "leave");
  return users.map((user) => {
    const joined = user.created_at ? localDay(new Date(user.created_at)) : "";
    const totals = { present: 0, half: 0, leave: 0, absent: 0, late: 0, minutes: 0 };
    const cells = days.map((day): DayCell => {
      const record = records.find((row) => row.user_id === user.id && row.day === day) ?? null;
      const leave = leaves.find((request) => request.user_id === user.id && request.from_day <= day && request.to_day >= day) ?? null;
      const holiday = holidays.get(day) ?? null;
      const result = codeFor(day, record, leave, holiday, settings, today, now);
      const minutes = result.minutes;
      // Days before the person joined are left blank, not absent.
      const code: DayCode = result.code === "A" && joined && day < joined ? "" : result.code;
      const late = Boolean(record && isLate(record, settings));
      if (code === "P" || code === "IN" || code === "MC" || code === "WFH") totals.present += 1;
      if (code === "HD" || code === "HL" || code === "S") totals.half += 1;
      if (code === "L") totals.leave += 1;
      if (code === "HL") totals.leave += 0.5;
      if (code === "A") totals.absent += 1;
      if (late) totals.late += 1;
      totals.minutes += minutes;
      return { day, code, late, minutes, record, leave: leave?.leave_type ?? null, holiday };
    });
    return { userId: user.id, name: user.name, cells, totals };
  });
}

export interface BoardRow {
  userId: number;
  name: string;
  state: "in" | "break" | "done" | "leave" | "off" | "not-in";
  record: AttendanceRecord | null;
  late: boolean;
  minutes: number;
  leave: string | null;
}

/** Who is in today. */
export function todayBoard(users: { id: number; name: string }[], now: Date = new Date()): BoardRow[] {
  const settings = attendanceSettings();
  const today = localDay(now);
  const off = settings.weeklyOff.includes(weekday(today)) || listHolidays().some((holiday) => holiday.day === today);
  const leaves = listRequests({ status: "approved", from: today, to: today }).filter((request) => request.kind === "leave");
  return users.map((user) => {
    const record = recordFor(user.id, today);
    const leave = leaves.find((request) => request.user_id === user.id) ?? null;
    const state: BoardRow["state"] = record
      ? record.check_out_at
        ? "done"
        : record.break_started_at
          ? "break"
          : "in"
      : leave
        ? "leave"
        : off
          ? "off"
          : "not-in";
    return {
      userId: user.id,
      name: user.name,
      state,
      record,
      late: Boolean(record && isLate(record, settings)),
      minutes: record ? workedMinutes(record, now) : 0,
      leave: leave?.leave_type ?? null,
    };
  });
}
