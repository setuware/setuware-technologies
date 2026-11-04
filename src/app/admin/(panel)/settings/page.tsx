import { DEFAULT_ANNOUNCEMENT, getSetting, type Announcement } from "@/lib/cms/crm";
import { requireUser } from "@/lib/cms/session";
import { AnnouncementForm } from "@/components/admin/settings-forms";
import { Card, PageHeader } from "@/components/admin/ui";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

export default async function SettingsPage() {
  await requireUser("settings");
  const announcement = getSetting<Announcement>("announcement", DEFAULT_ANNOUNCEMENT);
  return (
    <>
      <PageHeader title="Site settings" description="Changes here go live on the website straight away." />
      <Card className="p-6">
        <h2 className="font-semibold text-foreground">Announcement bar</h2>
        <p className="mb-5 mt-1 text-sm text-muted-foreground">
          A thin bar above the navigation on every page, for offers, launches or holiday hours. Visitors can dismiss it.
        </p>
        <AnnouncementForm initial={announcement} />
      </Card>
    </>
  );
}
