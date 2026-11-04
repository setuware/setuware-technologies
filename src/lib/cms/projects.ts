import { getDb } from "./db";

/**
 * Client projects. A task belongs to a project by name (tasks.project); the
 * projects table adds client, owner, dates, budget and status. Projects that
 * only exist on tasks show up too, so nothing has to be set up first.
 */

export const PROJECT_STATUSES = ["active", "on_hold", "completed", "cancelled"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = { active: "Active", on_hold: "On hold", completed: "Completed", cancelled: "Cancelled" };

export interface ProjectSummary {
  id: number | null;
  name: string;
  client: string;
  status: ProjectStatus;
  owner_id: number | null;
  owner_name: string | null;
  start_date: string | null;
  deadline: string | null;
  budget_hours: number | null;
  description: string;
  tasks: number;
  done: number;
  overdue: number;
  inReview: number;
  logged: number;
  people: string[];
  lastActivity: string | null;
}

interface ProjectRow {
  id: number;
  name: string;
  client: string;
  status: ProjectStatus;
  owner_id: number | null;
  owner_name: string | null;
  start_date: string | null;
  deadline: string | null;
  budget_hours: number | null;
  description: string;
}

function stats(today: string): Map<string, Omit<ProjectSummary, keyof ProjectRow | "people"> & { people: Set<string> }> {
  const rows = getDb()
    .prepare(
      `SELECT t.project, t.status, t.due_date, t.updated_at, u.name AS assignee,
        (SELECT COALESCE(SUM(minutes),0) FROM time_entries e WHERE e.task_id = t.id) AS logged
       FROM tasks t LEFT JOIN users u ON u.id = t.assignee_id WHERE t.project != ''`,
    )
    .all() as { project: string; status: string; due_date: string | null; updated_at: string; assignee: string | null; logged: number }[];
  const map = new Map<string, Omit<ProjectSummary, keyof ProjectRow | "people"> & { people: Set<string> }>();
  for (const row of rows) {
    const key = row.project.toLowerCase();
    const item = map.get(key) ?? { tasks: 0, done: 0, overdue: 0, inReview: 0, logged: 0, people: new Set<string>(), lastActivity: null };
    item.tasks += 1;
    if (row.status === "done") item.done += 1;
    if (row.status === "review") item.inReview += 1;
    if (row.status !== "done" && row.due_date && row.due_date < today) item.overdue += 1;
    item.logged += row.logged;
    if (row.assignee) item.people.add(row.assignee);
    if (!item.lastActivity || row.updated_at > item.lastActivity) item.lastActivity = row.updated_at;
    map.set(key, item);
  }
  return map;
}

const PROJECT_SELECT = "SELECT p.*, u.name AS owner_name FROM projects p LEFT JOIN users u ON u.id = p.owner_id";

export function listProjects(today: string): ProjectSummary[] {
  const counts = stats(today);
  const saved = getDb().prepare(`${PROJECT_SELECT} ORDER BY p.name`).all() as ProjectRow[];
  const names = new Map<string, string>();
  for (const project of saved) names.set(project.name.toLowerCase(), project.name);
  const taskNames = getDb().prepare("SELECT DISTINCT project FROM tasks WHERE project != ''").all() as { project: string }[];
  for (const row of taskNames) if (!names.has(row.project.toLowerCase())) names.set(row.project.toLowerCase(), row.project);

  return [...names.entries()]
    .map(([key, name]) => {
      const project = saved.find((item) => item.name.toLowerCase() === key);
      const count = counts.get(key);
      return {
        id: project?.id ?? null,
        name,
        client: project?.client ?? "",
        status: project?.status ?? "active",
        owner_id: project?.owner_id ?? null,
        owner_name: project?.owner_name ?? null,
        start_date: project?.start_date ?? null,
        deadline: project?.deadline ?? null,
        budget_hours: project?.budget_hours ?? null,
        description: project?.description ?? "",
        tasks: count?.tasks ?? 0,
        done: count?.done ?? 0,
        overdue: count?.overdue ?? 0,
        inReview: count?.inReview ?? 0,
        logged: count?.logged ?? 0,
        people: [...(count?.people ?? [])].sort(),
        lastActivity: count?.lastActivity ?? null,
      } satisfies ProjectSummary;
    })
    .sort((a, b) => {
      const order = (status: ProjectStatus) => PROJECT_STATUSES.indexOf(status);
      return order(a.status) - order(b.status) || (b.lastActivity ?? "").localeCompare(a.lastActivity ?? "") || a.name.localeCompare(b.name);
    });
}

export function getProject(name: string, today: string): ProjectSummary | null {
  return listProjects(today).find((project) => project.name.toLowerCase() === name.toLowerCase()) ?? null;
}

export interface ProjectInput {
  name: string;
  client: string;
  status: ProjectStatus;
  ownerId: number | null;
  startDate: string | null;
  deadline: string | null;
  budgetHours: number | null;
  description: string;
}

/** Creates or updates a project; renaming also moves its tasks to the new name. */
export function saveProject(input: ProjectInput, previousName?: string): void {
  const db = getDb();
  const now = new Date().toISOString();
  const name = input.name.trim();
  if (!name) throw new Error("Give the project a name.");
  const clash = db.prepare("SELECT name FROM projects WHERE name = ?").get(name) as { name: string } | undefined;
  if (previousName && previousName.toLowerCase() !== name.toLowerCase() && clash) throw new Error("Another project already has that name.");
  if (!PROJECT_STATUSES.includes(input.status)) throw new Error("Choose a status.");
  const existing = db.prepare("SELECT id FROM projects WHERE name = ?").get(previousName ?? name) as { id: number } | undefined;
  if (existing) {
    db.prepare(
      "UPDATE projects SET name = ?, client = ?, status = ?, owner_id = ?, start_date = ?, deadline = ?, budget_hours = ?, description = ?, updated_at = ? WHERE id = ?",
    ).run(name, input.client, input.status, input.ownerId, input.startDate, input.deadline, input.budgetHours, input.description, now, existing.id);
  } else {
    db.prepare(
      "INSERT INTO projects (name,client,status,owner_id,start_date,deadline,budget_hours,description,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)",
    ).run(name, input.client, input.status, input.ownerId, input.startDate, input.deadline, input.budgetHours, input.description, now, now);
  }
  if (previousName && previousName !== name) db.prepare("UPDATE tasks SET project = ? WHERE project = ? COLLATE NOCASE").run(name, previousName);
}

/** Hours on a project per person. */
export function projectHours(name: string): { name: string; minutes: number }[] {
  return getDb()
    .prepare(
      `SELECT u.name, SUM(e.minutes) AS minutes FROM time_entries e JOIN tasks t ON t.id = e.task_id JOIN users u ON u.id = e.user_id
       WHERE t.project = ? COLLATE NOCASE AND e.ended_at IS NOT NULL GROUP BY u.id ORDER BY minutes DESC`,
    )
    .all(name) as { name: string; minutes: number }[];
}

/** Active project names for task forms. */
export function activeProjectNames(): string[] {
  const closed = new Set(
    (getDb().prepare("SELECT name FROM projects WHERE status IN ('completed','cancelled')").all() as { name: string }[]).map((row) => row.name.toLowerCase()),
  );
  const names = [
    ...(getDb().prepare("SELECT name FROM projects").all() as { name: string }[]).map((row) => row.name),
    ...(getDb().prepare("SELECT DISTINCT project AS name FROM tasks WHERE project != ''").all() as { name: string }[]).map((row) => row.name),
  ];
  return [...new Map(names.filter((name) => !closed.has(name.toLowerCase())).map((name) => [name.toLowerCase(), name])).values()].sort();
}
