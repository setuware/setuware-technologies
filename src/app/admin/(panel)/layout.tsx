import { Suspense } from "react";
import { redirect } from "next/navigation";

import { can, reportIds } from "@/lib/cms/auth";
import { unreadCount } from "@/lib/cms/notifications";
import { currentUser } from "@/lib/cms/session";
import { dashboardCounts } from "@/lib/cms/store";
import { listRequests, localDay, presence } from "@/lib/cms/attendance";
import { runningTimer, taskCounts } from "@/lib/cms/tasks";
import { pendingSheets } from "@/lib/cms/timesheets";
import { listClaims } from "@/lib/cms/expenses";
import { mayApproveFor } from "@/lib/cms/notify";
import { AdminShell } from "@/components/admin/shell";

const AREAS = ["leads", "roles.manage", "enquiries", "bookings", "subscribers", "analytics", "posts", "jobs", "media", "applications", "users", "templates", "settings.manage", "attendance", "timesheets", "expenses", "documents.manage"] as const;

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
  // Managers see their own team's attendance and timesheets even without the wider permission.
  const manages = reportIds(user.id).length > 0;
  const areas = AREAS.filter((area) => can(user, area) || (manages && (area === "attendance" || area === "timesheets" || area === "expenses")));
  const today = presence(user.id);
  const timer = runningTimer(user.id);
  const tasks = taskCounts(user.id, localDay());
  const approvals = areas.includes("attendance") ? listRequests({ status: "pending" }).filter((request) => mayApproveFor(user, request.user_id, "attendance.manage")).length : 0;
  const sheetsWaiting = areas.includes("timesheets") ? pendingSheets().filter((id) => mayApproveFor(user, id, "timesheets.approve")).length : 0;
  const expenseClaimsWaiting = areas.includes("expenses") ? listClaims({ status: "pending" }).filter((claim) => mayApproveFor(user, claim.user_id, "expenses.approve")).length : 0;
  return (
    <AdminShell
      user={{ id: user.id, name: user.name, email: user.email, roleLabel: user.roleName }}
      areas={areas}
      unread={unreadCount(user.id)}
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
        "/admin/tasks": tasks.overdue + tasks.toReview,
        "/admin/timesheets/team": sheetsWaiting,
        "/admin/attendance/team": approvals,
        "/admin/expenses/team": expenseClaimsWaiting,
      }}
    >
      {children}
    </AdminShell>
  );
}
