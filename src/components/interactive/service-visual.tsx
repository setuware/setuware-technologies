import type { IconName } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * Per-service motion graphic.
 *
 * Each service page gets a visual that shows what the work actually looks
 * like — a build typing itself out, screens sliding through a phone, racks
 * blinking, a retrieval graph firing. All CSS and SVG, all on `transform` and
 * `opacity`, so there is nothing to download and nothing to decode.
 *
 * Marked `role="img"` with one label: a screen reader should hear a single
 * description, not forty decorative rectangles.
 */

export interface ServiceVisualProps {
  variant: IconName;
  accent: readonly [string, string];
  className?: string;
}

const LABELS: Record<IconName, string> = {
  globe:
    "Animated illustration of a business website on desktop and phone, with a new enquiry arriving.",
  cart: "Animated illustration of a product grid, a cart and a UPI payment confirmation.",
  megaphone:
    "Animated illustration of a search result climbing the rankings next to a rising leads chart.",
  boxes:
    "Animated illustration of orders, stock and billing modules syncing into one dashboard.",
  code: "Animated illustration of a web page being built line by line, with a live performance score.",
  smartphone: "Animated illustration of app screens moving through a phone frame.",
  server: "Animated illustration of server racks with health indicators and traffic throughput.",
  sparkles: "Animated illustration of a retrieval graph answering a question from source documents.",
  palette: "Animated illustration of a design system's colour, type and layout tokens.",
  shield: "Animated illustration of a monitoring radar sweeping for incidents.",
};

export function ServiceVisual({ variant, accent, className }: ServiceVisualProps) {
  return (
    <div
      className={cn(
        "relative aspect-[4/3] w-full overflow-hidden rounded-card border border-border bg-surface shadow-ambient",
        className,
      )}
      role="img"
      aria-label={LABELS[variant]}
      style={
        {
          "--accent-from": accent[0],
          "--accent-to": accent[1],
        } as React.CSSProperties
      }
    >
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `linear-gradient(135deg, ${accent[0]}, ${accent[1]})`,
        }}
        aria-hidden
      />
      <Variant variant={variant} />
    </div>
  );
}

function Variant({ variant }: { variant: IconName }) {
  switch (variant) {
    case "globe":
      return <WebsiteVisual />;
    case "cart":
      return <StoreVisual />;
    case "megaphone":
      return <MarketingVisual />;
    case "boxes":
      return <SystemVisual />;
    case "code":
      return <CodeVisual />;
    case "smartphone":
      return <PhoneVisual />;
    case "server":
      return <ServerVisual />;
    case "sparkles":
      return <AiVisual />;
    case "palette":
      return <DesignVisual />;
    case "shield":
      return <SupportVisual />;
    default:
      return <CodeVisual />;
  }
}

const gradient = "linear-gradient(90deg, var(--accent-from), var(--accent-to))";

/** Web development: a page assembling itself, line by line. */
function CodeVisual() {
  const lines = [72, 48, 88, 36, 64, 52];

  return (
    <div className="absolute inset-0 flex flex-col gap-3 p-6">
      <div className="flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-red-400/70" />
        <span className="size-2 rounded-full bg-amber-400/70" />
        <span className="size-2 rounded-full bg-emerald-400/70" />
      </div>

      <div className="flex flex-1 gap-4">
        <div className="flex flex-1 flex-col justify-center gap-2.5">
          {lines.map((width, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="w-3 shrink-0 font-mono text-[9px] text-muted-foreground">
                {index + 1}
              </span>
              <span
                className="h-2 origin-left rounded-full motion-safe:animate-[type-line_4.5s_ease-in-out_infinite]"
                style={{
                  width: `${width}%`,
                  backgroundImage: gradient,
                  opacity: 0.55,
                  animationDelay: `${index * 0.35}s`,
                }}
              />
            </div>
          ))}
        </div>

        <div className="flex w-24 shrink-0 flex-col justify-center gap-2 rounded-xl border border-border bg-background/70 p-3">
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
            Lighthouse
          </span>
          <span
            className="font-mono text-2xl font-semibold motion-safe:animate-shimmer"
            style={{
              backgroundImage: gradient,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            100
          </span>
          <span className="h-1 rounded-full bg-emerald-500/70" />
        </div>
      </div>
    </div>
  );
}

/** App development: screens sliding through a device frame. */
function PhoneVisual() {
  const screens = ["Home", "Jobs", "Sync", "Done"];

  return (
    <div className="absolute inset-0 flex items-center justify-center p-6">
      <div className="relative h-full max-h-[15rem] w-[8.5rem] overflow-hidden rounded-[1.4rem] border-4 border-foreground/80 bg-background">
        <span className="absolute left-1/2 top-1.5 z-10 h-1 w-10 -translate-x-1/2 rounded-full bg-foreground/60" />

        <div className="flex h-full w-[400%] motion-safe:animate-[screen-slide_11s_ease-in-out_infinite]">
          {screens.map((screen, index) => (
            <div
              key={screen}
              className="flex h-full w-1/4 shrink-0 flex-col gap-2 p-3 pt-6"
              style={{
                backgroundImage:
                  index % 2 === 0
                    ? "linear-gradient(170deg, color-mix(in oklab, var(--accent-from) 16%, transparent), transparent)"
                    : "linear-gradient(170deg, color-mix(in oklab, var(--accent-to) 16%, transparent), transparent)",
              }}
            >
              <span className="text-[9px] font-semibold text-foreground">{screen}</span>
              <span className="h-10 rounded-lg" style={{ backgroundImage: gradient, opacity: 0.35 }} />
              <span className="h-2 w-3/4 rounded-full bg-foreground/15" />
              <span className="h-2 w-1/2 rounded-full bg-foreground/15" />
              <span className="mt-auto h-6 rounded-lg" style={{ backgroundImage: gradient, opacity: 0.8 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Managed hosting: racks with health LEDs and live throughput. */
function ServerVisual() {
  const racks = [0, 1, 2];
  const bars = [40, 66, 52, 78, 60, 88, 70];

  return (
    <div className="absolute inset-0 flex gap-4 p-6">
      <div className="flex flex-1 flex-col justify-center gap-2.5">
        {racks.map((rack) => (
          <div
            key={rack}
            className="flex items-center gap-2 rounded-lg border border-border bg-background/70 px-2.5 py-2"
          >
            <span className="flex gap-1">
              {[0, 1, 2].map((led) => (
                <span
                  key={led}
                  className="size-1.5 rounded-full bg-emerald-500 motion-safe:animate-[blink-led_2.4s_ease-in-out_infinite]"
                  style={{ animationDelay: `${rack * 0.3 + led * 0.18}s` }}
                />
              ))}
            </span>
            <span className="font-mono text-[9px] text-muted-foreground">
              node-{rack + 1}
            </span>
            <span className="ml-auto font-mono text-[9px] text-emerald-600 dark:text-emerald-400">
              ok
            </span>
          </div>
        ))}
        <p className="mt-1 font-mono text-[9px] text-muted-foreground">
          autoscaling · 3/8 active
        </p>
      </div>

      <div className="flex w-24 shrink-0 flex-col justify-end gap-2 rounded-xl border border-border bg-background/70 p-3">
        <div className="flex h-20 items-end gap-1">
          {bars.map((height, index) => (
            <span
              key={index}
              className="flex-1 origin-bottom rounded-sm motion-safe:animate-[bar-grow_2.6s_ease-in-out_infinite]"
              style={{
                height: `${height}%`,
                backgroundImage: gradient,
                animationDelay: `${index * 0.12}s`,
              }}
            />
          ))}
        </div>
        <span className="text-[9px] text-muted-foreground">req/s</span>
      </div>
    </div>
  );
}

/** AI integration: a question resolving against source documents. */
function AiVisual() {
  const sources = [0, 1, 2, 3];

  return (
    <div className="absolute inset-0 flex items-center justify-center p-6">
      <svg viewBox="0 0 220 160" className="h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="ai-stroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--accent-from)" />
            <stop offset="100%" stopColor="var(--accent-to)" />
          </linearGradient>
        </defs>

        {sources.map((source) => {
          const y = 28 + source * 35;
          return (
            <g key={source}>
              <rect
                x="12"
                y={y - 11}
                width="48"
                height="22"
                rx="5"
                fill="var(--surface)"
                stroke="currentColor"
                className="text-border"
              />
              <line x1="20" y1={y - 4} x2="50" y2={y - 4} stroke="currentColor" className="text-border" strokeWidth="2" />
              <line x1="20" y1={y + 3} x2="42" y2={y + 3} stroke="currentColor" className="text-border" strokeWidth="2" />

              <path
                d={`M60 ${y} C 95 ${y}, 95 80, 128 80`}
                fill="none"
                stroke="url(#ai-stroke)"
                strokeWidth="1.8"
                strokeDasharray="6 10"
                className="motion-safe:animate-dash"
                style={{ animationDelay: `${source * 0.3}s` }}
              />
            </g>
          );
        })}

        <circle
          cx="128"
          cy="80"
          r="20"
          fill="var(--surface)"
          stroke="url(#ai-stroke)"
          strokeWidth="2.5"
        />
        <circle
          cx="128"
          cy="80"
          r="7"
          fill="url(#ai-stroke)"
          className="motion-safe:animate-shimmer"
        />

        <path
          d="M148 80 H 176"
          stroke="url(#ai-stroke)"
          strokeWidth="2"
          strokeDasharray="5 7"
          className="motion-safe:animate-dash"
        />
        <rect
          x="176"
          y="62"
          width="32"
          height="36"
          rx="6"
          fill="var(--surface)"
          stroke="url(#ai-stroke)"
          strokeWidth="2"
        />
        <line x1="183" y1="73" x2="201" y2="73" stroke="url(#ai-stroke)" strokeWidth="2" />
        <line x1="183" y1="81" x2="196" y2="81" stroke="url(#ai-stroke)" strokeWidth="2" />
        <line x1="183" y1="89" x2="199" y2="89" stroke="url(#ai-stroke)" strokeWidth="2" />
      </svg>
    </div>
  );
}

/** Product design: tokens and layout blocks settling into a system. */
function DesignVisual() {
  const swatches = [0, 1, 2, 3, 4];

  return (
    <div className="absolute inset-0 flex flex-col gap-4 p-6">
      <div className="flex gap-2">
        {swatches.map((swatch) => (
          <span
            key={swatch}
            className="size-8 rounded-lg motion-safe:animate-[swatch-pop_3.2s_ease-in-out_infinite]"
            style={{
              backgroundImage: gradient,
              opacity: 0.35 + swatch * 0.15,
              animationDelay: `${swatch * 0.22}s`,
            }}
          />
        ))}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="font-display text-2xl font-semibold text-foreground">Aa</span>
        <span className="font-display text-lg font-medium text-muted-foreground">Aa</span>
        <span className="text-sm text-muted-foreground">Aa</span>
        <span className="ml-auto font-mono text-[9px] text-muted-foreground">
          type scale
        </span>
      </div>

      <div className="grid flex-1 grid-cols-3 gap-2">
        {[0, 1, 2, 3, 4, 5].map((block) => (
          <span
            key={block}
            className="rounded-lg border border-border bg-background/70 motion-safe:animate-float"
            style={{ animationDelay: `${block * 0.4}s` }}
          />
        ))}
      </div>
    </div>
  );
}

/** Support: a monitoring radar sweeping, with an incident log. */
function SupportVisual() {
  return (
    <div className="absolute inset-0 flex items-center gap-5 p-6">
      <div className="relative aspect-square h-full max-h-[9.5rem] shrink-0">
        <span className="absolute inset-0 rounded-full border border-border" />
        <span className="absolute inset-[18%] rounded-full border border-border" />
        <span className="absolute inset-[38%] rounded-full border border-border" />
        <span
          className="absolute inset-0 rounded-full motion-safe:animate-[radar-sweep_4s_linear_infinite]"
          style={{
            backgroundImage: `conic-gradient(from 0deg, transparent 0deg, color-mix(in oklab, var(--accent-from) 45%, transparent) 40deg, transparent 70deg)`,
          }}
        />
        <span
          className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ backgroundImage: gradient }}
        />
      </div>

      <ul className="flex flex-1 flex-col gap-1.5 font-mono text-[9px]">
        {[
          { time: "02:14", text: "alert · latency p95", tone: "text-amber-600 dark:text-amber-400" },
          { time: "02:15", text: "paged · on-call ack", tone: "text-muted-foreground" },
          { time: "02:21", text: "resolved · rolled back", tone: "text-emerald-700 dark:text-emerald-400" },
          { time: "09:00", text: "report sent to client", tone: "text-muted-foreground" },
        ].map((entry, index) => (
          <li
            key={entry.time}
            className="flex gap-2 rounded-md border border-border bg-background/70 px-2 py-1.5 motion-safe:animate-shimmer"
            style={{ animationDelay: `${index * 0.7}s` }}
          >
            <span className="text-muted-foreground">{entry.time}</span>
            <span className={entry.tone}>{entry.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Business websites: a company site on desktop and phone, an enquiry landing. */
function WebsiteVisual() {
  return (
    <div className="absolute inset-0 p-6">
      <div className="absolute inset-y-6 left-6 right-[30%] flex flex-col overflow-hidden rounded-xl border border-border bg-background/80">
        <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
          <span className="size-1.5 rounded-full bg-red-400/70" />
          <span className="size-1.5 rounded-full bg-amber-400/70" />
          <span className="size-1.5 rounded-full bg-emerald-400/70" />
          <span className="ml-2 h-2.5 flex-1 rounded-full bg-foreground/8 px-2 font-mono text-[7px] leading-[10px] text-muted-foreground">
            yourbusiness.in
          </span>
        </div>
        <div className="flex items-center justify-between px-3 py-2">
          <span className="h-2 w-10 rounded-full" style={{ backgroundImage: gradient }} />
          <span className="flex gap-1.5">
            {[0, 1, 2].map((item) => (
              <span key={item} className="h-1.5 w-5 rounded-full bg-foreground/15" />
            ))}
          </span>
        </div>
        <div className="flex flex-1 flex-col justify-center gap-2 px-3">
          <span className="h-3 w-4/5 rounded-full bg-foreground/70" />
          <span className="h-3 w-3/5 rounded-full bg-foreground/70" />
          <span className="mt-1 h-1.5 w-11/12 rounded-full bg-foreground/15" />
          <span className="h-1.5 w-3/4 rounded-full bg-foreground/15" />
          <span className="relative mt-2 inline-flex h-6 w-20 items-center justify-center rounded-full text-[8px] font-semibold text-white" style={{ backgroundImage: gradient }}>
            Get a quote
            <span
              className="absolute inset-0 rounded-full motion-safe:animate-pulse-ring"
              style={{ boxShadow: "0 0 0 2px var(--accent-to)" }}
            />
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 p-3">
          {[0, 1, 2].map((card) => (
            <span key={card} className="h-6 rounded-md border border-border bg-surface" />
          ))}
        </div>
      </div>

      <div className="absolute bottom-6 right-6 top-10 flex w-[24%] flex-col gap-1.5 overflow-hidden rounded-[1rem] border-[3px] border-foreground/75 bg-background p-2 pt-3 motion-safe:animate-float">
        <span className="h-1.5 w-8 rounded-full" style={{ backgroundImage: gradient }} />
        <span className="mt-1 h-2 w-full rounded-full bg-foreground/70" />
        <span className="h-2 w-3/4 rounded-full bg-foreground/70" />
        <span className="h-1 w-full rounded-full bg-foreground/15" />
        <span className="h-1 w-2/3 rounded-full bg-foreground/15" />
        <span className="mt-auto h-4 rounded-md" style={{ backgroundImage: gradient }} />
      </div>

      <div className="absolute bottom-[14%] right-[33%] flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1.5 shadow-ambient motion-safe:animate-float">
        <span className="size-2 rounded-full bg-emerald-500" />
        <span className="text-[9px] font-semibold text-foreground">New enquiry</span>
        <span className="font-mono text-[8px] text-muted-foreground">via WhatsApp</span>
      </div>
    </div>
  );
}

/** E-commerce: a product grid feeding a cart, paid over UPI. */
function StoreVisual() {
  const products = [0, 1, 2, 3];

  return (
    <div className="absolute inset-0 flex gap-4 p-6">
      <div className="grid flex-1 grid-cols-2 gap-2.5">
        {products.map((product) => (
          <div
            key={product}
            className="flex flex-col gap-1.5 rounded-xl border border-border bg-background/80 p-2"
          >
            <span
              className="flex-1 rounded-lg motion-safe:animate-shimmer"
              style={{
                backgroundImage: gradient,
                opacity: 0.3 + product * 0.1,
                animationDelay: `${product * 0.5}s`,
              }}
            />
            <span className="h-1.5 w-3/4 rounded-full bg-foreground/20" />
            <span className="flex items-center justify-between">
              <span className="font-mono text-[8px] font-semibold text-foreground">
                ₹{[1499, 899, 2199, 649][product]}
              </span>
              <span
                className="inline-flex size-3.5 items-center justify-center rounded-full text-[9px] leading-none text-white"
                style={{ backgroundImage: gradient }}
              >
                +
              </span>
            </span>
          </div>
        ))}
      </div>

      <div className="flex w-[38%] shrink-0 flex-col gap-2 rounded-xl border border-border bg-background/80 p-3">
        <span className="flex items-center justify-between text-[9px] font-semibold text-foreground">
          Cart
          <span
            className="inline-flex size-4 items-center justify-center rounded-full text-[8px] text-white motion-safe:animate-[swatch-pop_2.4s_ease-in-out_infinite]"
            style={{ backgroundImage: gradient }}
          >
            3
          </span>
        </span>
        {[70, 55, 62].map((width, index) => (
          <span key={index} className="flex items-center gap-1.5">
            <span className="size-4 shrink-0 rounded bg-foreground/10" />
            <span className="h-1.5 rounded-full bg-foreground/20" style={{ width: `${width}%` }} />
          </span>
        ))}
        <span className="mt-auto flex items-center justify-between border-t border-border pt-2 font-mono text-[8px] text-muted-foreground">
          GST incl.
          <span className="font-semibold text-foreground">₹4,597</span>
        </span>
        <span className="rounded-lg py-1.5 text-center text-[8px] font-semibold text-white" style={{ backgroundImage: gradient }}>
          Pay with UPI
        </span>
        <span className="flex items-center justify-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 py-1 text-[8px] font-medium text-emerald-700 motion-safe:animate-shimmer dark:text-emerald-400">
          Paid · courier booked
        </span>
      </div>
    </div>
  );
}

/** SEO and marketing: a result climbing the search page, leads rising. */
function MarketingVisual() {
  const bars = [22, 30, 28, 40, 48, 58, 72, 86];

  return (
    <div className="absolute inset-0 flex gap-4 p-6">
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1.5">
          <span className="size-2 rounded-full border border-muted-foreground" />
          <span className="font-mono text-[9px] text-foreground">dental clinic near me</span>
          <span className="h-3 w-px bg-foreground motion-safe:animate-[caret_1s_steps(1)_infinite]" />
        </div>

        <div className="relative flex flex-1 flex-col justify-center gap-2">
          {[0, 1, 2].map((row) => (
            <div key={row} className="flex flex-col gap-1 rounded-lg border border-border bg-background/60 px-2.5 py-1.5 opacity-60">
              <span className="h-1.5 w-1/2 rounded-full bg-foreground/25" />
              <span className="h-1 w-5/6 rounded-full bg-foreground/12" />
            </div>
          ))}
          <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col gap-1 rounded-lg border bg-surface px-2.5 py-1.5 shadow-ambient motion-safe:animate-float"
            style={{ borderColor: "var(--accent-to)" }}
          >
            <span className="flex items-center justify-between">
              <span className="h-1.5 w-1/2 rounded-full" style={{ backgroundImage: gradient }} />
              <span className="rounded-full bg-emerald-500/15 px-1.5 font-mono text-[8px] font-semibold text-emerald-700 dark:text-emerald-400">
                ▲ 5 places
              </span>
            </span>
            <span className="h-1 w-5/6 rounded-full bg-foreground/20" />
            <span className="flex gap-0.5">
              {[0, 1, 2, 3, 4].map((star) => (
                <span key={star} className="text-[8px] leading-none text-amber-500">★</span>
              ))}
            </span>
          </div>
        </div>
      </div>

      <div className="flex w-[34%] shrink-0 flex-col gap-2 rounded-xl border border-border bg-background/80 p-3">
        <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
          Enquiries
        </span>
        <span className="font-mono text-[8px] text-muted-foreground">by week, tracked in GA4</span>
        <div className="flex flex-1 items-end gap-1">
          {bars.map((height, index) => (
            <span
              key={index}
              className="flex-1 origin-bottom rounded-sm motion-safe:animate-[bar-grow_3s_ease-in-out_infinite]"
              style={{ height: `${height}%`, backgroundImage: gradient, animationDelay: `${index * 0.1}s` }}
            />
          ))}
        </div>
        <span className="font-mono text-[8px] text-muted-foreground">cost / lead ▼</span>
      </div>
    </div>
  );
}

/** Custom software: separate modules feeding one system of record. */
function SystemVisual() {
  const modules = ["Orders", "Stock", "Billing", "Staff"];

  return (
    <div className="absolute inset-0 flex items-center justify-center p-6">
      <svg
        viewBox="0 0 220 160"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id="erp-stroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--accent-from)" />
            <stop offset="100%" stopColor="var(--accent-to)" />
          </linearGradient>
        </defs>
        {[
          "M60 36 C 90 36, 90 80, 110 80",
          "M160 36 C 130 36, 130 80, 110 80",
          "M60 124 C 90 124, 90 80, 110 80",
          "M160 124 C 130 124, 130 80, 110 80",
        ].map((d, index) => (
          <path
            key={d}
            d={d}
            fill="none"
            stroke="url(#erp-stroke)"
            strokeWidth="1.6"
            strokeDasharray="5 8"
            className="motion-safe:animate-dash"
            style={{ animationDelay: `${index * 0.4}s` }}
          />
        ))}
      </svg>

      <div className="relative grid h-full w-full grid-cols-2 grid-rows-2 gap-x-[38%] gap-y-[30%]">
        {modules.map((module, index) => (
          <div
            key={module}
            className="flex flex-col justify-center gap-1 rounded-lg border border-border bg-background/90 px-2.5 py-1.5"
          >
            <span className="flex items-center gap-1.5 text-[9px] font-semibold text-foreground">
              <span
                className="size-1.5 rounded-full bg-emerald-500 motion-safe:animate-[blink-led_2.4s_ease-in-out_infinite]"
                style={{ animationDelay: `${index * 0.3}s` }}
              />
              {module}
            </span>
            <span className="h-1 w-3/4 rounded-full bg-foreground/15" />
          </div>
        ))}
      </div>

      <div className="absolute left-1/2 top-1/2 flex w-[30%] -translate-x-1/2 -translate-y-1/2 flex-col gap-1.5 rounded-xl border bg-surface p-2.5 shadow-ambient"
        style={{ borderColor: "var(--accent-from)" }}
      >
        <span className="text-[8px] uppercase tracking-wider text-muted-foreground">Dashboard</span>
        <div className="flex h-8 items-end gap-0.5">
          {[45, 70, 55, 85, 65].map((height, index) => (
            <span
              key={index}
              className="flex-1 origin-bottom rounded-sm motion-safe:animate-[bar-grow_2.8s_ease-in-out_infinite]"
              style={{ height: `${height}%`, backgroundImage: gradient, animationDelay: `${index * 0.15}s` }}
            />
          ))}
        </div>
        <span className="font-mono text-[8px] text-foreground">1 source of truth</span>
      </div>
    </div>
  );
}
