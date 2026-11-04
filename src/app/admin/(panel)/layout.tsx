import { Suspense } from "react";
import { redirect } from "next/navigation";

import { can, ROLE_LABELS } from "@/lib/cms/auth";
import { currentUser } from "@/lib/cms/session";
import { dashboardCounts } from "@/lib/cms/store";
import { AdminShell } from "@/components/admin/shell";

const AREAS = ["enquiries", "bookings", "subscribers", "analytics", "posts", "jobs", "media", "applications", "users", "templates", "settings"] as const;

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
  const areas = AREAS.filter((area) => can(user.role, area));
  return (
    <AdminShell
      user={{ name: user.name, email: user.email, roleLabel: ROLE_LABELS[user.role] }}
      areas={areas}
      badges={{
        ...(areas.includes("enquiries") ? { "/admin/enquiries": counts.enquiriesNew } : {}),
        ...(areas.includes("applications") ? { "/admin/applications": counts.applicationsNew } : {}),
      }}
    >
      {children}
    </AdminShell>
  );
}
