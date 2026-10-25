import { cn } from "@/lib/utils";

/**
 * The animated hero visual: a stylised deploy console showing a build moving
 * through our pipeline.
 *
 * Deliberately SVG and CSS rather than a video file — it is a few kilobytes
 * instead of a few megabytes, stays sharp at any size, needs no decode budget
 * on a mid-range phone, and doubles as the poster/fallback for `HeroVideo`.
 * Every animation is on `transform`, `opacity` or `stroke-dashoffset`, all of
 * which the compositor handles without touching layout.
 */

const STAGES = ["Commit", "Build", "Test", "Deploy"] as const;

const BARS = [38, 62, 46, 78, 54, 88, 66, 94, 72] as const;

export function PipelineAnimation({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-card border border-border bg-surface shadow-ambient",
        className,
      )}
      role="img"
      aria-label="Animated illustration of a build moving through Setuware's commit, build, test and deploy pipeline, with live performance metrics."
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-border bg-surface-2/60 px-4 py-3">
        <span className="size-2.5 rounded-full bg-red-400/80" />
        <span className="size-2.5 rounded-full bg-amber-400/80" />
        <span className="size-2.5 rounded-full bg-emerald-400/80" />
        <span className="ml-3 font-mono text-[11px] text-muted-foreground">
          setuware · deploy console
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-emerald-600/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full rounded-full bg-emerald-500 motion-safe:animate-pulse-ring" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
          </span>
          live
        </span>
      </div>

      <div className="relative p-5 md:p-6">
        {/* Light sweep across the panel */}
        <div
          className="pointer-events-none absolute inset-0 motion-safe:animate-[sweep_5.5s_ease-in-out_infinite]"
          style={{
            background:
              "linear-gradient(90deg, transparent, color-mix(in oklab, var(--primary) 12%, transparent), transparent)",
            width: "45%",
          }}
          aria-hidden
        />

        {/* Pipeline */}
        <svg
          viewBox="0 0 420 72"
          className="w-full"
          aria-hidden
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="pipeline-stroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--color-brand-500)" />
              <stop offset="100%" stopColor="var(--color-accent-400)" />
            </linearGradient>
          </defs>

          {/* Track */}
          <line
            x1="34"
            y1="30"
            x2="386"
            y2="30"
            stroke="currentColor"
            className="text-border"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Animated progress dashes travelling along the track */}
          <line
            x1="34"
            y1="30"
            x2="386"
            y2="30"
            stroke="url(#pipeline-stroke)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="18 22"
            className="motion-safe:animate-dash"
          />

          {STAGES.map((stage, index) => {
            const x = 34 + index * (352 / (STAGES.length - 1));
            return (
              <g key={stage}>
                <circle
                  cx={x}
                  cy={30}
                  r={11}
                  fill="var(--surface)"
                  stroke="url(#pipeline-stroke)"
                  strokeWidth="2.5"
                />
                <circle
                  cx={x}
                  cy={30}
                  r={4}
                  fill="url(#pipeline-stroke)"
                  className="motion-safe:animate-shimmer"
                  style={{ animationDelay: `${index * 0.45}s` }}
                />
                <text
                  x={x}
                  y={60}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[10px]"
                  style={{ fontSize: 10 }}
                >
                  {stage}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Metric cards */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { label: "LCP", value: "0.9s", tone: "text-emerald-700 dark:text-emerald-400" },
            { label: "Uptime", value: "99.95%", tone: "text-primary" },
            { label: "p95", value: "180ms", tone: "text-cyan-800 dark:text-cyan-300" },
          ].map((metric, index) => (
            <div
              key={metric.label}
              className="rounded-xl border border-border bg-background/60 px-3 py-2.5 motion-safe:animate-float"
              style={{ animationDelay: `${index * 0.8}s` }}
            >
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {metric.label}
              </div>
              <div className={cn("font-mono text-sm font-semibold", metric.tone)}>
                {metric.value}
              </div>
            </div>
          ))}
        </div>

        {/* Throughput bars */}
        <div className="mt-5 flex h-20 items-end gap-1.5">
          {BARS.map((height, index) => (
            <div
              key={index}
              className="flex-1 origin-bottom rounded-t-md motion-safe:animate-[bar-grow_2.8s_ease-in-out_infinite]"
              style={{
                height: `${height}%`,
                animationDelay: `${index * 0.14}s`,
                backgroundImage:
                  "linear-gradient(to top, color-mix(in oklab, var(--color-brand-500) 85%, transparent), color-mix(in oklab, var(--color-accent-400) 70%, transparent))",
              }}
            />
          ))}
        </div>

        {/* Terminal line */}
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-background/70 px-3 py-2 font-mono text-[11px] text-muted-foreground">
          <span className="text-emerald-700 dark:text-emerald-400">✓</span>
          <span>deployed to production in 42s</span>
          <span className="ml-auto inline-block h-3 w-1.5 bg-primary motion-safe:animate-[caret_1.1s_step-end_infinite]" />
        </div>
      </div>
    </div>
  );
}
