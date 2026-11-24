import { Eye, Globe, Inbox, Mail, Trophy } from "lucide-react";

import { analytics, topViews, totalViews } from "@/lib/cms/crm";
import { enquiryFunnel, parseRange, periodMetrics, type Range } from "@/lib/cms/insights";
import { requireUser } from "@/lib/cms/session";
import { Funnel, RangeTabs, TrendChart } from "@/components/admin/charts";
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

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  await requireUser("analytics");
  const range = parseRange((await searchParams).range);
  const data = analytics(range);
  const metrics = periodMetrics(range);
  const funnel = enquiryFunnel(range);
  const posts = topViews("/blog/", 8).map((row) => ({ label: row.path.replace("/blog/", ""), n: row.views }));
  const jobs = topViews("/careers/", 8).map((row) => ({ label: row.path.replace("/careers/", ""), n: row.views }));
  const topPages = topViews("/", 8).map((row) => ({ label: row.path === "/" ? "Home" : row.path, n: row.views }));
  const rangeHref = (next: Range) => (next === 30 ? "/admin/analytics" : `/admin/analytics?range=${next}`);
  const before = `vs the ${range} days before`;

  return (
    <>
      <PageHeader
        title="Analytics"
        description={`Visits, leads and content performance over the last ${range} days, compared with the ${range} days before.`}
        actions={<RangeTabs value={range} href={rangeHref} />}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Stat
          label="Visits"
          value={metrics.visits.current.toLocaleString("en-IN")}
          change={metrics.visits.change}
          spark={metrics.visits.series}
          hint={`${totalViews().toLocaleString("en-IN")} all time`}
          icon={<Globe className="size-4" />}
          tone="violet"
        />
        <Stat
          label="Enquiries"
          value={metrics.enquiries.current}
          change={metrics.enquiries.change}
          spark={metrics.enquiries.series}
          hint={before}
          icon={<Inbox className="size-4" />}
          tone="blue"
        />
        <Stat label="Win rate" value={`${data.winRate}%`} hint={`All time · ${data.won} won · ${data.lost} lost`} icon={<Trophy className="size-4" />} tone="teal" />
        <Stat
          label="New subscribers"
          value={metrics.subscribers.current}
          change={metrics.subscribers.change}
          hint={`${data.subscribers} in total`}
          icon={<Mail className="size-4" />}
          tone="violet"
        />
        <Stat label="Article views" value={posts.reduce((sum, row) => sum + row.n, 0)} hint="All time, top articles" icon={<Eye className="size-4" />} tone="amber" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h2 className="mb-3 font-semibold text-foreground">Visits and enquiries per day</h2>
          <TrendChart
            labels={metrics.labels}
            series={[
              { label: "Visits", values: metrics.visits.series, colour: "#7c3aed" },
              { label: "Enquiries", values: metrics.enquiries.series, colour: "#2f56d8" },
              { label: "Applications", values: metrics.applications.series, colour: "#f59e0b" },
            ]}
          />
        </Card>
        <Card className="p-6">
          <h2 className="font-semibold text-foreground">Conversion funnel</h2>
          <p className="mb-4 text-xs text-muted-foreground">Enquiries received in the last {range} days and how far they got</p>
          <Funnel steps={funnel} />
        </Card>
      </div>

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
        <Card className="p-6 lg:col-span-2">
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
