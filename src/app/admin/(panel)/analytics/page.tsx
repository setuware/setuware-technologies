import { Eye, Globe, Inbox, Mail, Trophy } from "lucide-react";

import { analytics, topViews, totalViews, viewsByDay } from "@/lib/cms/crm";
import { requireUser } from "@/lib/cms/session";
import { Card, PageHeader, Stat } from "@/components/admin/ui";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

function Bars({ rows, colour }: { rows: { label: string; n: number }[]; colour: string }) {
  const max = Math.max(1, ...rows.map((row) => row.n));
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">No data yet.</p>;
  return (
    <ul className="flex flex-col gap-3">
      {rows.map((row) => (
        <li key={row.label}>
          <div className="mb-1 flex justify-between gap-3 text-sm">
            <span className="truncate text-foreground">{row.label}</span>
            <span className="font-semibold tabular-nums text-foreground">{row.n}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-foreground/[0.06]">
            <div className="h-full rounded-full" style={{ width: `${(row.n / max) * 100}%`, background: colour }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default async function AnalyticsPage() {
  await requireUser("analytics");
  const data = analytics(30);
  const posts = topViews("/blog/", 8).map((row) => ({ label: row.path.replace("/blog/", ""), n: row.views }));
  const jobs = topViews("/careers/", 8).map((row) => ({ label: row.path.replace("/careers/", ""), n: row.views }));
  const visits = viewsByDay(30);
  const topPages = topViews("/", 8).map((row) => ({ label: row.path === "/" ? "Home" : row.path, n: row.views }));
  const max = Math.max(1, ...data.series.map((row) => row.n));
  const visitsMax = Math.max(1, ...visits.map((row) => row.n));

  return (
    <>
      <PageHeader title="Analytics" description="Visits, leads and content performance over the last 30 days." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Stat label="Total visits" value={totalViews()} hint="All pages, all time" icon={<Globe className="size-4" />} tone="blue" />
        <Stat label="Enquiries (30 days)" value={data.last30} icon={<Inbox className="size-4" />} tone="blue" />
        <Stat label="Win rate" value={`${data.winRate}%`} hint={`${data.won} won · ${data.lost} lost`} icon={<Trophy className="size-4" />} tone="teal" />
        <Stat label="Newsletter subscribers" value={data.subscribers} icon={<Mail className="size-4" />} tone="violet" />
        <Stat label="Article views" value={posts.reduce((sum, row) => sum + row.n, 0)} hint="All time, top articles" icon={<Eye className="size-4" />} tone="amber" />
      </div>

      <Card className="mt-6 p-6">
        <h2 className="font-semibold text-foreground">Enquiries per day</h2>
        <div className="mt-5 flex h-44 items-end gap-[3px]" role="img" aria-label="Enquiries per day for the last 30 days">
          {data.series.map((row) => (
            <div key={row.day} className="group relative flex h-full flex-1 flex-col justify-end">
              <div
                className="w-full rounded-t-md bg-[linear-gradient(180deg,#4f7cff,#0a8ea6)] opacity-85 transition-opacity group-hover:opacity-100"
                style={{ height: `${Math.max(row.n ? 6 : 2, (row.n / max) * 100)}%`, opacity: row.n ? undefined : 0.15 }}
              />
              <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-[#0b1020] px-2 py-1 text-[11px] text-white group-hover:block">
                {row.day.slice(5)}: {row.n}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
          <span>{data.series[0]?.day.slice(5)}</span>
          <span>Today</span>
        </div>
      </Card>

      <Card className="mt-6 p-6">
        <h2 className="font-semibold text-foreground">Visits per day</h2>
        <div className="mt-5 flex h-44 items-end gap-[3px]" role="img" aria-label="Visits per day for the last 30 days">
          {visits.map((row) => (
            <div key={row.day} className="group relative flex h-full flex-1 flex-col justify-end">
              <div
                className="w-full rounded-t-md bg-[linear-gradient(180deg,#7c3aed,#22d3ee)] opacity-85 transition-opacity group-hover:opacity-100"
                style={{ height: `${Math.max(row.n ? 6 : 2, (row.n / visitsMax) * 100)}%`, opacity: row.n ? undefined : 0.15 }}
              />
              <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-[#0b1020] px-2 py-1 text-[11px] text-white group-hover:block">
                {row.day.slice(5)}: {row.n}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
          <span>{visits[0]?.day.slice(5)}</span>
          <span>Today</span>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 font-semibold text-foreground">Where enquiries come from</h2>
          <Bars rows={data.bySource} colour="#2f56d8" />
        </Card>
        <Card className="p-6">
          <h2 className="mb-4 font-semibold text-foreground">Services requested</h2>
          <Bars rows={data.byService} colour="#0a8ea6" />
        </Card>
        <Card className="p-6">
          <h2 className="mb-4 font-semibold text-foreground">Most-read articles</h2>
          <Bars rows={posts} colour="#7c3aed" />
        </Card>
        <Card className="p-6">
          <h2 className="mb-4 font-semibold text-foreground">Most-visited pages</h2>
          <Bars rows={topPages} colour="#0a8ea6" />
        </Card>
        <Card className="p-6">
          <h2 className="mb-4 font-semibold text-foreground">Applications per role</h2>
          <Bars rows={data.perJob} colour="#f59e0b" />
          {jobs.length ? (
            <>
              <h3 className="mb-3 mt-6 text-sm font-semibold text-foreground">Job page views</h3>
              <Bars rows={jobs} colour="#f97316" />
            </>
          ) : null}
        </Card>
      </div>
    </>
  );
}
