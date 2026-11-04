import { Suspense } from "react";
import { redirect } from "next/navigation";

import { can } from "@/lib/cms/auth";
import { currentUser } from "@/lib/cms/session";
import { dashboardCounts } from "@/lib/cms/store";
import { listRequests, localDay, presence } from "@/lib/cms/attendance";
import { runningTimer, taskCounts } from "@/lib/cms/tasks";
import { AdminShell } from "@/components/admin/shell";

const AREAS = ["leads", "roles.manage", "enquiries", "bookings", "subscribers", "analytics", "posts", "jobs", "media", "applications", "users", "templates", "settings.manage", "attendance"] as const;

// Signed-in pages block on the session; per the Cache Components auth guide,
// they opt out of instant-navigation validation.
export const instant = false;

/** Everything under the panel needs a signed-in admin. */
export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-background" aria-busy="true" />}>
      <Gate>{children}</Gate>
    </Suspense>
  );
}

async function Gate({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/admin/login");
  const counts = dashboardCounts();
  const areas = AREAS.filter((area) => can(user, area));
  const today = presence(user.id);
  const timer = runningTimer(user.id);
  const overdue = taskCounts(user.id, localDay()).overdue;
  const approvals = areas.includes("attendance") && can(user, "attendance.manage") ? listRequests({ status: "pending" }).length : 0;
  return (
    <AdminShell
      user={{ name: user.name, email: user.email, roleLabel: user.roleName }}
      areas={areas}
      presence={{
        state: today.state,
        since: today.record?.check_in_at ?? null,
        breakMinutes: today.record?.break_minutes ?? 0,
        breakSince: today.record?.break_started_at ?? null,
        timer: timer ? { taskId: timer.task_id, title: timer.title, startedAt: timer.started_at } : null,
      }}
      badges={{
        ...(areas.includes("enquiries") ? { "/admin/enquiries": counts.enquiriesNew } : {}),
        ...(areas.includes("applications") ? { "/admin/applications": counts.applicationsNew } : {}),
        "/admin/tasks": overdue,
        "/admin/attendance/team": approvals,
      }}
    >
      {children}
    </AdminShell>
  );
}
