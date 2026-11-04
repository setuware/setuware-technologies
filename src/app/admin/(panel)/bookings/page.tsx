import Link from "next/link";
import { Phone, Video } from "lucide-react";

import { bookings } from "@/lib/cms/crm";
import { requireUser } from "@/lib/cms/session";
import { Avatar, Card, Empty, PageHeader, StatusBadge } from "@/components/admin/ui";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

const dayLabel = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Kolkata" }).format(new Date(iso));
const timeLabel = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }).format(new Date(iso));
const dayKey = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date(iso));

export default async function BookingsPage({ searchParams }: { searchParams: Promise<{ past?: string }> }) {
  await requireUser("bookings");
  const { past } = await searchParams;
  const nowIso = new Date().toISOString();
  const all = bookings();
  const list = past ? all.filter((item) => item.slot < nowIso).reverse() : all.filter((item) => item.slot >= nowIso);
  const groups = new Map<string, typeof list>();
  for (const item of list) groups.set(dayKey(item.slot), [...(groups.get(dayKey(item.slot)) ?? []), item]);

  return (
    <>
      <PageHeader
        title="Consultation bookings"
        description="Free 30-minute calls booked from setuware.in/book. Times are in IST."
        actions={
          <div className="flex rounded-full border border-border bg-surface p-1 text-sm">
            <Link href="/admin/bookings" className={`rounded-full px-4 py-1.5 font-medium ${past ? "text-muted-foreground" : "bg-foreground text-background"}`}>
              Upcoming
            </Link>
            <Link href="/admin/bookings?past=1" className={`rounded-full px-4 py-1.5 font-medium ${past ? "bg-foreground text-background" : "text-muted-foreground"}`}>
              Past
            </Link>
          </div>
        }
      />
      {list.length === 0 ? (
        <Card>
          <Empty title={past ? "No past bookings" : "No upcoming bookings"}>Bookings appear here when someone picks a slot.</Empty>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {[...groups.entries()].map(([key, items]) => (
            <section key={key}>
              <h2 className="mb-3 text-sm font-semibold text-foreground">{dayLabel(items[0].slot)}</h2>
              <Card className="overflow-hidden">
                <ul className="divide-y divide-border">
                  {items.map((item) => (
                    <li key={item.id}>
                      <Link href={`/admin/enquiries/${item.id}`} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-foreground/[0.03]">
                        <span className="w-20 shrink-0 font-display text-lg font-semibold tabular-nums text-foreground">{timeLabel(item.slot)}</span>
                        <Avatar name={item.name || item.email} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold text-foreground">{item.name || item.email}</span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {item.topic || "General"} · {item.phone || item.email}
                          </span>
                        </span>
                        <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
                          {item.mode === "phone" ? <Phone className="size-3.5" aria-hidden /> : <Video className="size-3.5" aria-hidden />}
                          {item.mode === "phone" ? "Phone" : "Video"}
                        </span>
                        <StatusBadge status={item.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
