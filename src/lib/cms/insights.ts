import { getDb } from "./db";
import { listProjects, type ProjectSummary } from "./projects";

/**
 * Period-over-period numbers for the dashboard and analytics: totals for the
 * last N days next to the N days before, daily series for sparklines, the
 * enquiry funnel, and the queues that need someone's attention.
 */

export const RANGES = [7, 30, 90] as const;
export type Range = (typeof RANGES)[number];

export function parseRange(value: string | undefined, fallback: Range = 30): Range {
  const n = Number(value);
  return (RANGES as readonly number[]).includes(n) ? (n as Range) : fallback;
}

const DAY = 86_400_000;

function dayString(offset: number, now: Date): string {
  return new Date(now.getTime() - offset * DAY).toISOString().slice(0, 10);
}

/** The `days` calendar days ending today, oldest first. */
function window(days: number, now: Date, shift = 0): string[] {
  return Array.from({ length: days }, (_, index) => dayString(shift + days - 1 - index, now));
}

function stepRate(n: number, of: number): number {
  const pct = (n / of) * 100;
  return pct > 0 && pct < 1 ? Math.round(pct * 10) / 10 : Math.round(pct);
}

export interface Metric {
  current: number;
  previous: number;
  /** Percentage change against the previous period; null when there is nothing to compare with. */
  change: number | null;
  series: number[];
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 100);
}

function metric(perDay: Map<string, number>, days: number, now: Date): Metric {
  const current = window(days, now);
  const previous = window(days, now, days);
  const sum = (list: string[]) => list.reduce((total, day) => total + (perDay.get(day) ?? 0), 0);
  const cur = sum(current);
  const prev = sum(previous);
  return { current: cur, previous: prev, change: percentChange(cur, prev), series: current.map((day) => perDay.get(day) ?? 0) };
}

function countByDay(sql: string, since: string): Map<string, number> {
  const rows = getDb().prepare(sql).all(since) as { day: string; n: number }[];
  return new Map(rows.map((row) => [row.day, row.n]));
}

export interface PeriodMetrics {
  days: Range;
  labels: string[];
  visits: Metric;
  enquiries: Metric;
  applications: Metric;
  won: Metric;
  subscribers: Metric;
}

export function periodMetrics(days: Range, now: Date = new Date()): PeriodMetrics {
  const since = dayString(days * 2 - 1, now);
  return {
    days,
    labels: window(days, now),
    visits: metric(countByDay("SELECT day, SUM(views) AS n FROM page_views_daily WHERE day >= ? GROUP BY day", since), days, now),
    enquiries: metric(
      countByDay("SELECT substr(created_at,1,10) AS day, COUNT(*) AS n FROM enquiries WHERE created_at >= ? AND status != 'spam' GROUP BY day", since),
      days,
      now,
    ),
    applications: metric(countByDay("SELECT substr(created_at,1,10) AS day, COUNT(*) AS n FROM applications WHERE created_at >= ? GROUP BY day", since), days, now),
    won: metric(
      countByDay("SELECT substr(created_at,1,10) AS day, COUNT(*) AS n FROM enquiries WHERE created_at >= ? AND status = 'won' GROUP BY day", since),
      days,
      now,
    ),
    subscribers: metric(countByDay("SELECT substr(created_at,1,10) AS day, COUNT(*) AS n FROM subscribers WHERE created_at >= ? GROUP BY day", since), days, now),
  };
}

export interface FunnelStep {
  label: string;
  n: number;
  /** Share of the step before, in percent. */
  rate: number | null;
}

/** Visits, then enquiries created in the period and how far they have got. */
export function enquiryFunnel(days: Range, now: Date = new Date()): FunnelStep[] {
  const since = dayString(days - 1, now);
  const db = getDb();
  const visits = (db.prepare("SELECT COALESCE(SUM(views),0) AS n FROM page_views_daily WHERE day >= ?").get(since) as { n: number }).n;
  const rows = db
    .prepare("SELECT status, COUNT(*) AS n FROM enquiries WHERE created_at >= ? AND status != 'spam' GROUP BY status")
    .all(since) as { status: string; n: number }[];
  const count = (...statuses: string[]) => rows.filter((row) => statuses.includes(row.status)).reduce((sum, row) => sum + row.n, 0);
  const steps = [
    { label: "Visits", n: visits },
    { label: "Enquiries", n: count("new", "contacted", "qualified", "proposal", "won", "lost") },
    { label: "Qualified", n: count("qualified", "proposal", "won") },
    { label: "Proposal", n: count("proposal", "won") },
    { label: "Won", n: count("won") },
  ];
  return steps.map((step, index) => ({
    ...step,
    rate: index === 0 || !steps[index - 1].n ? null : stepRate(step.n, steps[index - 1].n),
  }));
}

export interface AttentionCounts {
  unanswered: number;
  unassignedEnquiries: number;
  overdueFollowUps: number;
  staleApplications: number;
  unassignedApplications: number;
}

/**
 * Work that is slipping: new enquiries nobody has picked up within a day,
 * overdue follow-ups, records with no owner, applications untouched for a week.
 * A scope name limits that module's numbers to one person's records.
 */
export function attention(scope: { enquiries?: string | null; applications?: string | null } = {}, now: Date = new Date()): AttentionCounts {
  const db = getDb();
  const dayAgo = new Date(now.getTime() - DAY).toISOString();
  const weekAgo = new Date(now.getTime() - 7 * DAY).toISOString();
  const today = now.toISOString().slice(0, 10);
  const mine = (owner: string | null | undefined) => (owner ? { sql: " AND assignee = ?", args: [owner] } : { sql: "", args: [] });
  const enq = mine(scope.enquiries);
  const app = mine(scope.applications);
  const n = (sql: string, ...args: unknown[]) => (db.prepare(sql).get(...args) as { n: number }).n;
  const open = "status NOT IN ('won','lost','spam')";
  return {
    unanswered: n(`SELECT COUNT(*) AS n FROM enquiries WHERE status = 'new' AND created_at < ?${enq.sql}`, dayAgo, ...enq.args),
    unassignedEnquiries: scope.enquiries ? 0 : n(`SELECT COUNT(*) AS n FROM enquiries WHERE ${open} AND (assignee IS NULL OR assignee = '')`),
    overdueFollowUps: n(`SELECT COUNT(*) AS n FROM enquiries WHERE ${open} AND follow_up_at IS NOT NULL AND follow_up_at < ?${enq.sql}`, today, ...enq.args),
    staleApplications: n(
      `SELECT COUNT(*) AS n FROM applications a WHERE a.status IN ('new','reviewing') AND a.created_at < ?
        AND NOT EXISTS (SELECT 1 FROM notes WHERE entity = 'application' AND entity_id = a.id AND created_at >= ?)${app.sql.replace("assignee", "a.assignee")}`,
      weekAgo,
      weekAgo,
      ...app.args,
    ),
    unassignedApplications: scope.applications
      ? 0
      : n("SELECT COUNT(*) AS n FROM applications WHERE status NOT IN ('hired','rejected') AND (assignee IS NULL OR assignee = '')"),
  };
}

export interface ProjectRisk {
  project: ProjectSummary;
  reasons: string[];
}

/** Active projects past their deadline, over (or nearly over) their hours budget, or with overdue tasks. */
export function projectsAtRisk(today: string): ProjectRisk[] {
  return listProjects(today)
    .filter((project) => project.status === "active")
    .map((project) => {
      const reasons: string[] = [];
      const open = project.tasks - project.done;
      if (project.deadline && project.deadline < today && open > 0) reasons.push("Past deadline");
      if (project.budget_hours) {
        const used = project.logged / 60 / project.budget_hours;
        if (used >= 0.85) reasons.push(`${Math.round(used * 100)}% of hours used`);
      }
      if (project.overdue) reasons.push(`${project.overdue} overdue ${project.overdue === 1 ? "task" : "tasks"}`);
      return { project, reasons };
    })
    .filter((row) => row.reasons.length > 0)
    .sort((a, b) => b.reasons.length - a.reasons.length || b.project.overdue - a.project.overdue);
}

/** Overdue open tasks per assignee, most first. */
export function overdueByPerson(today: string, userIds?: number[]): { userId: number; name: string; n: number }[] {
  const rows = getDb()
    .prepare(
      `SELECT u.id AS userId, u.name AS name, COUNT(*) AS n FROM tasks t JOIN users u ON u.id = t.assignee_id
       WHERE t.status != 'done' AND t.due_date IS NOT NULL AND t.due_date < ? GROUP BY u.id ORDER BY n DESC, u.name`,
    )
    .all(today) as { userId: number; name: string; n: number }[];
  return userIds ? rows.filter((row) => userIds.includes(row.userId)) : rows;
}
