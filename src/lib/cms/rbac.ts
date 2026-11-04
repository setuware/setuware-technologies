import { getDb } from "./db";

/**
 * Role-based access control.
 *
 * A role is a named set of permissions like "posts.publish". "<module>.view"
 * opens a section; "<module>.all" widens record-level sections (enquiries,
 * CRM leads, applications) from "assigned to me" to everything. The Owner
 * role is built in and always has every permission.
 *
 * Every signed-in person can always use their own tasks (those assigned to
 * or created by them), check in and out, and request leave; permissions
 * below add to that.
 */

export interface PermissionGroup {
  module: string;
  label: string;
  actions: { key: string; label: string }[];
  /** Records can be limited to the ones assigned to the person. */
  scoped?: boolean;
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    module: "leads",
    label: "CRM leads",
    scoped: true,
    actions: [
      { key: "view", label: "View" },
      { key: "edit", label: "Work on leads" },
      { key: "assign", label: "Assign owner" },
      { key: "sync", label: "Sync with Zoho" },
    ],
  },
  {
    module: "enquiries",
    label: "Website enquiries",
    scoped: true,
    actions: [
      { key: "view", label: "View" },
      { key: "edit", label: "Update / email" },
      { key: "export", label: "Export CSV" },
    ],
  },
  { module: "bookings", label: "Bookings", actions: [{ key: "view", label: "View" }] },
  {
    module: "subscribers",
    label: "Subscribers",
    actions: [
      { key: "view", label: "View" },
      { key: "export", label: "Export CSV" },
      { key: "delete", label: "Remove" },
    ],
  },
  { module: "analytics", label: "Analytics", actions: [{ key: "view", label: "View" }] },
  {
    module: "posts",
    label: "Blog posts",
    actions: [
      { key: "view", label: "View" },
      { key: "create", label: "Create" },
      { key: "edit", label: "Edit" },
      { key: "publish", label: "Publish" },
      { key: "delete", label: "Delete" },
    ],
  },
  {
    module: "media",
    label: "Media",
    actions: [
      { key: "view", label: "View" },
      { key: "upload", label: "Upload" },
      { key: "delete", label: "Delete" },
    ],
  },
  {
    module: "jobs",
    label: "Jobs",
    actions: [
      { key: "view", label: "View" },
      { key: "create", label: "Create" },
      { key: "edit", label: "Edit / open / close" },
      { key: "delete", label: "Delete" },
    ],
  },
  {
    module: "applications",
    label: "Applications",
    scoped: true,
    actions: [
      { key: "view", label: "View" },
      { key: "edit", label: "Update / email" },
      { key: "export", label: "Export CSV" },
    ],
  },
  {
    module: "templates",
    label: "Email templates",
    actions: [
      { key: "view", label: "Use" },
      { key: "edit", label: "Edit" },
    ],
  },
  {
    module: "users",
    label: "Team",
    actions: [
      { key: "view", label: "View" },
      { key: "manage", label: "Invite / manage" },
    ],
  },
  {
    module: "tasks",
    label: "Tasks",
    scoped: true,
    actions: [
      { key: "assign", label: "Assign to others" },
      { key: "review", label: "Review & approve work" },
    ],
  },
  {
    module: "timesheets",
    label: "Timesheets",
    actions: [
      { key: "view", label: "See team timesheets" },
      { key: "approve", label: "Approve timesheets" },
    ],
  },
  {
    module: "attendance",
    label: "Attendance & leave",
    actions: [
      { key: "view", label: "See team attendance" },
      { key: "manage", label: "Approve leave, fix records, settings" },
    ],
  },
  { module: "roles", label: "Roles", actions: [{ key: "manage", label: "Create / edit roles" }] },
  { module: "settings", label: "Site settings", actions: [{ key: "manage", label: "Change" }] },
];

export const ALL_PERMISSIONS: string[] = PERMISSION_GROUPS.flatMap((group) => [
  ...group.actions.map((action) => `${group.module}.${action.key}`),
  ...(group.scoped ? [`${group.module}.all`] : []),
]);

export interface Role {
  key: string;
  name: string;
  description: string;
  permissions: string[];
  builtin: boolean;
}

const all = (module: string) => ALL_PERMISSIONS.filter((key) => key.startsWith(`${module}.`));

/** Starting roles; edit or add more under Admin → Roles. */
export const DEFAULT_ROLES: Omit<Role, "builtin">[] = [
  { key: "owner", name: "Owner", description: "Everything, including team, roles and settings.", permissions: ["*"] },
  {
    key: "sales",
    name: "Sales Manager",
    description: "All leads and enquiries, assigning, bookings, subscribers and analytics.",
    permissions: [...all("leads"), ...all("enquiries"), "bookings.view", ...all("subscribers"), "analytics.view", "templates.view", "templates.edit", "users.view", "tasks.assign", "tasks.review"],
  },
  {
    key: "sales_exec",
    name: "Sales Executive",
    description: "Works on the leads and enquiries assigned to them.",
    permissions: ["leads.view", "leads.edit", "enquiries.view", "enquiries.edit", "bookings.view", "templates.view"],
  },
  {
    key: "hr",
    name: "HR",
    description: "Jobs, applications, attendance and leave approvals.",
    permissions: [...all("jobs"), ...all("applications"), "templates.view", "templates.edit", "tasks.assign", ...all("attendance"), "timesheets.view"],
  },
  {
    key: "tech_lead",
    name: "Tech Lead / Project Manager",
    description: "Plans, assigns and reviews the engineering team's tasks, approves timesheets, sees team attendance and client enquiries.",
    permissions: ["tasks.assign", "tasks.review", "tasks.all", "timesheets.view", "timesheets.approve", "attendance.view", "users.view", "enquiries.view", "enquiries.all", "bookings.view"],
  },
  {
    key: "developer",
    name: "Software Developer",
    description: "Works on their tasks, logs time, hands tasks to QA or designers, checks in and requests leave.",
    permissions: ["tasks.assign"],
  },
  {
    key: "qa",
    name: "QA Tester",
    description: "Tests and reviews developers' work, files bugs as tasks, fills timesheets, checks in and requests leave.",
    permissions: ["tasks.assign", "tasks.review"],
  },
  {
    key: "designer",
    name: "UI/UX Designer",
    description: "Works on design tasks, hands them to developers, and can upload images to the media library.",
    permissions: ["tasks.assign", "media.view", "media.upload"],
  },
  {
    key: "intern",
    name: "Intern",
    description: "Works on the tasks assigned to them, logs time, checks in and requests leave.",
    permissions: [],
  },
  {
    key: "editor",
    name: "Content Editor",
    description: "Writes and publishes blog posts and manages images.",
    permissions: [...all("posts"), ...all("media")],
  },
];

function rowToRole(row: Record<string, unknown>): Role {
  let permissions: string[] = [];
  try {
    permissions = JSON.parse(String(row.permissions)) as string[];
  } catch {
    permissions = [];
  }
  return {
    key: String(row.key),
    name: String(row.name),
    description: String(row.description ?? ""),
    permissions,
    builtin: Number(row.builtin) === 1,
  };
}

export function listRoles(): Role[] {
  return getDb()
    .prepare("SELECT * FROM roles ORDER BY builtin DESC, name")
    .all()
    .map((row) => rowToRole(row as Record<string, unknown>));
}

export function getRole(key: string): Role | null {
  const row = getDb().prepare("SELECT * FROM roles WHERE key = ?").get(key) as Record<string, unknown> | undefined;
  return row ? rowToRole(row) : null;
}

export function roleName(key: string): string {
  return getRole(key)?.name ?? key;
}

export function permissionsFor(key: string): string[] {
  if (key === "owner") return ["*"];
  return getRole(key)?.permissions ?? [];
}

export function saveRole(input: { key?: string; name: string; description: string; permissions: string[] }): string {
  const permissions = input.permissions.filter((permission) => ALL_PERMISSIONS.includes(permission));
  let key = input.key;
  if (!key) {
    // New role: derive a key from the name that doesn't clash with an existing role.
    const base = input.name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 40) || "role";
    key = base;
    for (let n = 2; getRole(key); n += 1) key = `${base}_${n}`;
  }
  if (key === "owner") throw new Error("The Owner role cannot be changed.");
  getDb()
    .prepare(
      "INSERT INTO roles (key,name,description,permissions,builtin) VALUES (?,?,?,?,0) ON CONFLICT(key) DO UPDATE SET name = excluded.name, description = excluded.description, permissions = excluded.permissions",
    )
    .run(key, input.name.trim(), input.description.trim(), JSON.stringify(permissions));
  return key;
}

export function roleInUse(key: string): number {
  return (getDb().prepare("SELECT COUNT(*) AS n FROM users WHERE role = ?").get(key) as { n: number }).n;
}

export function deleteRole(key: string): void {
  if (key === "owner" || roleInUse(key) > 0) return;
  getDb().prepare("DELETE FROM roles WHERE key = ?").run(key);
}

/** True if the permission list allows `permission` ("posts" means "posts.view"). */
export function allows(permissions: readonly string[], permission: string): boolean {
  if (permissions.includes("*")) return true;
  const key = permission.includes(".") ? permission : `${permission}.view`;
  return permissions.includes(key);
}
