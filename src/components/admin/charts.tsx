import Link from "next/link";

import { RANGES, type FunnelStep, type Range } from "@/lib/cms/insights";
import { cn } from "@/lib/utils";

/** Server-rendered SVG charts for the admin (no client JS). */

export function RangeTabs({ value, href }: { value: Range; href: (range: Range) => string }) {
  return (
    <nav aria-label="Date range" className="inline-flex rounded-full border border-border bg-surface p-1 text-xs font-semibold">
      {RANGES.map((range) => (
        <Link
          key={range}
          href={href(range)}
          aria-current={range === value ? "page" : undefined}
          className={cn(
            "rounded-full px-3 py-1.5 transition-colors",
            range === value ? "bg-[#0b1020] text-white dark:bg-white dark:text-[#0b1020]" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {range} days
        </Link>
      ))}
    </nav>
  );
}

export interface Series {
  label: string;
  values: number[];
  colour: string;
}

/**
 * Line chart for one or more daily series. Each series is scaled to its own
 * peak so visits and enquiries can share a chart; the legend shows totals and
 * every day has a hover label with the exact numbers.
 */
export function TrendChart({ labels, series, height = 200 }: { labels: string[]; series: Series[]; height?: number }) {
  const width = 600;
  const count = labels.length;
  const step = width / Math.max(1, count - 1);
  const y = (value: number, max: number) => height - 6 - (value / Math.max(1, max)) * (height - 16);
  const empty = series.every((line) => line.values.every((value) => value === 0));
  const every = Math.ceil(count / 6);

  return (
    <div>
      <ul className="mb-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
        {series.map((line) => (
          <li key={line.label} className="flex items-center gap-2">
            <span aria-hidden className="h-1 w-4 rounded-full" style={{ background: line.colour }} />
            {line.label}
            <span className="font-semibold tabular-nums text-foreground">{line.values.reduce((sum, value) => sum + value, 0)}</span>
          </li>
        ))}
      </ul>
      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="block w-full"
          style={{ height }}
          role="img"
          aria-label={`${series.map((line) => line.label).join(" and ")} per day, ${labels[0]} to ${labels[count - 1]}`}
        >
          {[0.25, 0.5, 0.75, 1].map((fraction) => (
            <line
              key={fraction}
              x1="0"
              x2={width}
              y1={height - 6 - fraction * (height - 16)}
              y2={height - 6 - fraction * (height - 16)}
              stroke="currentColor"
              className="text-foreground/[0.07]"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {series.map((line) => {
            const max = Math.max(...line.values);
            const points = line.values.map((value, index) => `${(index * step).toFixed(1)},${y(value, max).toFixed(1)}`).join(" ");
            return (
              <g key={line.label}>
                <polygon points={`0,${height} ${points} ${width},${height}`} fill={line.colour} opacity="0.08" />
                <polyline points={points} fill="none" stroke={line.colour} strokeWidth="2.25" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              </g>
            );
          })}
          {labels.map((label, index) => (
            <rect key={label} x={index * step - step / 2} y="0" width={step} height={height} fill="transparent">
              <title>{`${label}: ${series.map((line) => `${line.label} ${line.values[index] ?? 0}`).join(" · ")}`}</title>
            </rect>
          ))}
        </svg>
        {empty ? (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">No activity in this period yet.</p>
        ) : null}
      </div>
      <div className="mt-2 flex justify-between text-[11px] tabular-nums text-muted-foreground">
        {labels.map((label, index) =>
          index % every === 0 || index === count - 1 ? (
            <span key={label}>{index === count - 1 ? "Today" : label.slice(5)}</span>
          ) : null,
        )}
      </div>
    </div>
  );
}

const FUNNEL_COLOURS = ["#7c3aed", "#2f56d8", "#06b6d4", "#0a8ea6", "#10b981"];

/** Visits draw full width; the enquiry steps are scaled to enquiries, so small numbers stay readable. */
export function Funnel({ steps }: { steps: FunnelStep[] }) {
  const width = (index: number, n: number) => (index === 0 ? (n ? 100 : 0) : n ? Math.max(2, (n / Math.max(1, steps[1]?.n ?? n)) * 100) : 0);
  return (
    <ol className="flex flex-col gap-3">
      {steps.map((step, index) => (
        <li key={step.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="text-foreground">{step.label}</span>
            <span className="flex items-baseline gap-2">
              {step.rate !== null ? <span className="text-xs text-muted-foreground">{step.rate}% of previous</span> : null}
              <span className="font-semibold tabular-nums text-foreground">{step.n}</span>
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-foreground/[0.06]">
            <div
              className="h-full rounded-full"
              style={{ width: `${width(index, step.n)}%`, background: FUNNEL_COLOURS[index % FUNNEL_COLOURS.length] }}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}
