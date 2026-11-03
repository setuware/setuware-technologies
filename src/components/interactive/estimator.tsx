"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Link2, Loader2, RotateCcw } from "lucide-react";

import {
  DEFAULT_ESTIMATE_INPUT,
  DESIGN_TIERS,
  FEATURE_RATES,
  SCOPE_LIMITS,
  SERVICE_RATES,
  TIMELINES,
  estimateProject,
  type DesignTier,
  type EstimateInput,
  type FeatureKey,
  type PlatformKey,
  type ServiceKey,
  type TimelineKey,
} from "@/lib/pricing";
import { postJson } from "@/lib/client-api";
import { services } from "@/lib/content";
import { cn, formatINR, formatINRCompact } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, Honeypot, Input } from "@/components/ui/field";

const STORAGE_KEY = "setuware.estimate.v1";

/**
 * Storage access is wrapped because it throws outright in some privacy modes,
 * and a blocked write must never take the estimator down with it.
 */
function readStored(): Partial<EstimateInput> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<EstimateInput>) : {};
  } catch {
    return {};
  }
}

function writeStored(value: EstimateInput): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Storage full or disabled; the session still works, it just will not
    // survive a reload.
  }
}

function clearStored(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clean up.
  }
}

const FEATURE_ORDER = Object.keys(FEATURE_RATES) as FeatureKey[];
const PLATFORM_LABELS: Record<PlatformKey, string> = {
  web: "Web",
  ios: "iOS",
  android: "Android",
};

/** URL round-tripping so a visitor can bookmark or share their configuration. */
function encodeInput(input: EstimateInput): string {
  const params = new URLSearchParams({
    s: input.service,
    n: String(input.scope),
    d: input.design,
    t: input.timeline,
    f: input.features.join(","),
    p: input.platforms.join(","),
    r: input.retainer ? "1" : "0",
  });
  return params.toString();
}

function decodeInput(search: string): Partial<EstimateInput> {
  const params = new URLSearchParams(search);
  const patch: Partial<EstimateInput> = {};

  const service = params.get("s");
  if (service && service in SERVICE_RATES) patch.service = service as ServiceKey;

  const scope = Number(params.get("n"));
  if (Number.isFinite(scope) && scope > 0) patch.scope = scope;

  const design = params.get("d");
  if (design && design in DESIGN_TIERS) patch.design = design as DesignTier;

  const timeline = params.get("t");
  if (timeline && timeline in TIMELINES) patch.timeline = timeline as TimelineKey;

  const features = params.get("f");
  if (features !== null) {
    patch.features = features
      .split(",")
      .filter((key): key is FeatureKey => key in FEATURE_RATES);
  }

  const platforms = params.get("p");
  if (platforms !== null) {
    patch.platforms = platforms
      .split(",")
      .filter((key): key is PlatformKey => key in PLATFORM_LABELS);
  }

  const retainer = params.get("r");
  if (retainer === "1" || retainer === "0") patch.retainer = retainer === "1";

  return patch;
}

type SendStatus = "idle" | "sending" | "done" | "error";

/**
 * Instant quote builder.
 *
 * The same `estimateProject` function runs here on every keystroke and again on
 * the server when the quote is emailed, so the number a visitor sees is the
 * number we record. State is mirrored to localStorage and to the URL, so a
 * half-finished configuration survives a refresh and can be shared with a
 * colleague.
 */
export function Estimator({ compact = false }: { compact?: boolean }) {
  // Server render and first client render both use the defaults, so hydration
  // matches; the saved and shared values are applied immediately after mount.
  const [input, setInput] = useState<EstimateInput>(DEFAULT_ESTIMATE_INPUT);
  const hydrated = useRef(false);

  useEffect(() => {
    // Precedence: URL beats saved state beats defaults — a link someone shared
    // must show what they shared, not what this browser last configured.
    const fromUrl = decodeInput(window.location.search);
    setInput({ ...DEFAULT_ESTIMATE_INPUT, ...readStored(), ...fromUrl });
    hydrated.current = true;
  }, []);

  const update = useCallback((patch: Partial<EstimateInput>) => {
    setInput((previous) => {
      const next = { ...previous, ...patch };
      writeStored(next);
      if (hydrated.current) {
        // replaceState, not router.push: no navigation and no history spam
        // while someone drags the scope slider.
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}?${encodeInput(next)}`,
        );
      }
      return next;
    });
  }, []);

  const result = useMemo(() => estimateProject(input), [input]);
  const rate = SERVICE_RATES[input.service];

  const toggleFeature = (feature: FeatureKey) => {
    update({
      features: input.features.includes(feature)
        ? input.features.filter((key) => key !== feature)
        : [...input.features, feature],
    });
  };

  const togglePlatform = (platform: PlatformKey) => {
    const next = input.platforms.includes(platform)
      ? input.platforms.filter((key) => key !== platform)
      : [...input.platforms, platform];
    // Never leave zero platforms selected: the quote would be meaningless.
    update({ platforms: next.length > 0 ? next : [platform] });
  };

  const reset = () => {
    clearStored();
    setInput(DEFAULT_ESTIMATE_INPUT);
    window.history.replaceState(null, "", window.location.pathname);
  };

  const service = services.find((entry) => entry.slug === input.service);
  let step = 0;
  const next = () => String(++step).padStart(2, "0");

  return (
    <div
      className={cn(
        "grid gap-10 lg:gap-14",
        compact ? "lg:grid-cols-1" : "lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_24rem]",
      )}
    >
      <div className="flex min-w-0 flex-col divide-y divide-border border-y border-border">
        {/* Service */}
        <Group
          step={next()}
          label="Service"
          detail={service ? `from ${formatINR(service.priceFrom)} + GST` : undefined}
        >
          <div className="flex flex-wrap gap-2">
            {services.map((entry) => (
              <Chip
                key={entry.slug}
                active={input.service === entry.slug}
                onClick={() => update({ service: entry.slug })}
              >
                {entry.shortName}
                {/* Read with the name ("Apps from ₹74,999"); shown once above. */}
                <span className="sr-only"> from {formatINR(entry.priceFrom)}</span>
              </Chip>
            ))}
          </div>
        </Group>

        {/* Scope */}
        <Group step={next()} label={`Number of ${rate.scopeNoun}`} detail={String(input.scope)}>
          <input
            type="range"
            min={SCOPE_LIMITS.min}
            max={SCOPE_LIMITS.max}
            step={1}
            value={input.scope}
            onChange={(event) => update({ scope: Number(event.target.value) })}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-[var(--color-setu,#00a1c6)]"
            aria-label={`Number of ${rate.scopeNoun}`}
            aria-valuetext={`${input.scope} ${rate.scopeNoun}`}
          />
          <div className="mt-2 flex justify-between font-mono text-[11px] text-muted-foreground">
            <span>{SCOPE_LIMITS.min}</span>
            <span>{SCOPE_LIMITS.max}</span>
          </div>
        </Group>

        {/* Platforms: only meaningful for app builds */}
        {rate.supportsPlatforms ? (
          <Group step={next()} label="Platforms">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(PLATFORM_LABELS) as PlatformKey[]).map((platform) => (
                <Chip
                  key={platform}
                  active={input.platforms.includes(platform)}
                  onClick={() => togglePlatform(platform)}
                >
                  {PLATFORM_LABELS[platform]}
                </Chip>
              ))}
            </div>
          </Group>
        ) : null}

        {/* Features */}
        <Group
          step={next()}
          label="Features"
          detail={input.features.length > 0 ? `${input.features.length} selected` : "Optional"}
        >
          <div className="flex flex-wrap gap-2">
            {FEATURE_ORDER.map((feature) => {
              const meta = FEATURE_RATES[feature];
              const active = input.features.includes(feature);
              return (
                <label key={feature} title={meta.hint} className={chipClass(active, "cursor-pointer")}>
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleFeature(feature)}
                    className="sr-only"
                  />
                  {active ? <Check className="size-3.5" aria-hidden /> : null}
                  {meta.label}
                </label>
              );
            })}
          </div>
        </Group>

        {/* Design + timeline */}
        <Group step={next()} label="Design" detail={DESIGN_TIERS[input.design].hint}>
          <Segmented
            name="design"
            options={(Object.keys(DESIGN_TIERS) as DesignTier[]).map((tier) => ({
              value: tier,
              label: DESIGN_TIERS[tier].label,
            }))}
            value={input.design}
            onChange={(design) => update({ design })}
          />
        </Group>

        <Group step={next()} label="Timeline" detail={TIMELINES[input.timeline].hint}>
          <Segmented
            name="timeline"
            options={(Object.keys(TIMELINES) as TimelineKey[]).map((key) => ({
              value: key,
              label: TIMELINES[key].label,
            }))}
            value={input.timeline}
            onChange={(timeline) => update({ timeline })}
          />
        </Group>

        <div className="flex flex-wrap items-center justify-between gap-4 py-6">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={input.retainer}
              onChange={(event) => update({ retainer: event.target.checked })}
              className="peer sr-only"
            />
            <span
              aria-hidden
              className="relative h-5 w-9 shrink-0 rounded-full bg-border transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:bg-setu peer-checked:after:translate-x-4 peer-focus-visible:ring-2 peer-focus-visible:ring-ring"
            />
            <span className="text-sm text-foreground">
              Monthly maintenance after launch
            </span>
          </label>

          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <RotateCcw className="size-3" aria-hidden />
            Start over
          </button>
        </div>
      </div>

      <QuoteSummary input={input} result={result} />
    </div>
  );
}

function chipClass(active: boolean, extra?: string) {
  return cn(
    "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[0.8125rem] font-medium transition-colors duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    active
      ? "border-foreground bg-foreground text-background"
      : "border-border bg-background text-foreground/80 hover:border-foreground/40 hover:text-foreground",
    extra,
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={chipClass(active)}>
      {children}
    </button>
  );
}

function Group({
  step,
  label,
  detail,
  children,
}: {
  step: string;
  label: string;
  detail?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="min-w-0 py-6">
      <legend className="sr-only">{label}</legend>
      <div className="grid gap-4 sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:gap-6">
        <div aria-hidden className="flex items-baseline gap-2.5 sm:flex-col sm:gap-1">
          <span className="font-mono text-[11px] text-muted-foreground">{step}</span>
          <span className="text-[0.95rem] font-semibold text-foreground">{label}</span>
          {detail ? (
            <span className="ml-auto text-right text-xs leading-snug text-muted-foreground sm:ml-0 sm:text-left">
              {detail}
            </span>
          ) : null}
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </fieldset>
  );
}

function Segmented<T extends string>({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-1 rounded-full border border-border bg-background-subtle p-1">
      {options.map((option) => (
        <label
          key={option.value}
          className="cursor-pointer rounded-full px-2 py-1.5 text-center text-[0.8125rem] font-medium text-muted-foreground transition-colors hover:text-foreground has-[:checked]:bg-background has-[:checked]:text-foreground has-[:checked]:shadow-[0_1px_3px_rgb(15_23_42/0.12)] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="sr-only"
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}

function QuoteSummary({
  input,
  result,
}: {
  input: EstimateInput;
  result: ReturnType<typeof estimateProject>;
}) {
  const [status, setStatus] = useState<SendStatus>("idle");
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard blocked (no permission, insecure context): the URL bar
      // already holds the shareable link, so this is a silent no-op.
    }
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;

    const form = new FormData(event.currentTarget);
    setStatus("sending");
    setErrors({});

    const response = await postJson<{ reference: string; total: number }>(
      "/api/estimate",
      {
        input,
        name: String(form.get("quote-name") ?? ""),
        email: String(form.get("quote-email") ?? ""),
        phone: String(form.get("quote-phone") ?? ""),
        notes: "",
        honeypot: String(form.get("quote-honeypot") ?? ""),
      },
    );

    if (response.ok) {
      setStatus("done");
      setReference(response.data.reference);
      setMessage(response.message ?? "Quote sent.");
      formRef.current?.reset();
      return;
    }

    setStatus("error");
    setMessage(response.message);
    setErrors(response.fields ?? {});
  };

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-[0_1px_2px_rgb(15_23_42/0.04),0_16px_40px_-24px_rgb(15_23_42/0.18)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Estimate
        </p>
        <p className="mt-2 font-display text-[2.1rem] font-semibold leading-none tracking-[-0.03em] tabular-nums text-foreground">
          {formatINRCompact(result.low)} – {formatINRCompact(result.high)}
        </p>
        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <span>~{result.weeks} weeks</span>
          <span aria-hidden className="size-1 rounded-full bg-border" />
          <span>{result.teamSize} people</span>
        </div>

        <div className="mt-6 border-t border-border pt-5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Payment milestones
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {result.milestones.map((milestone) => (
              <li key={milestone.name} className="flex items-center justify-between gap-3 text-[0.8125rem]">
                <span className="text-muted-foreground">{milestone.name}</span>
                <span className="shrink-0 tabular-nums text-foreground">{formatINR(milestone.amount)}</span>
              </li>
            ))}
            {result.monthlyRetainer > 0 ? (
              <li className="flex items-center justify-between gap-3 text-[0.8125rem]">
                <span className="text-muted-foreground">Maintenance, per month</span>
                <span className="shrink-0 tabular-nums text-foreground">{formatINR(result.monthlyRetainer)}</span>
              </li>
            ) : null}
          </ul>
          {result.notes.length > 0 ? (
            <ul className="mt-3 flex flex-col gap-1 text-xs leading-relaxed text-muted-foreground">
              {result.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="mt-6 border-t border-border pt-5">
          {status === "done" ? (
            <div role="status">
              <p className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                <Check className="size-4 shrink-0" aria-hidden />
                {message}
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Reference{" "}
                <span className="font-mono font-semibold text-foreground">{reference}</span>
              </p>
            </div>
          ) : (
            <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-3" noValidate>
              <h2 className="text-sm font-semibold text-foreground">Email me this estimate</h2>

              <Field label="Name" htmlFor="quote-name" required error={errors.name}>
                <Input
                  id="quote-name"
                  name="quote-name"
                  autoComplete="name"
                  required
                  aria-invalid={Boolean(errors.name)}
                />
              </Field>

              <Field label="Work email" htmlFor="quote-email" required error={errors.email}>
                <Input
                  id="quote-email"
                  name="quote-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  aria-invalid={Boolean(errors.email)}
                />
              </Field>

              <Field label="Phone" htmlFor="quote-phone" error={errors.phone}>
                <Input
                  id="quote-phone"
                  name="quote-phone"
                  type="tel"
                  autoComplete="tel"
                  aria-invalid={Boolean(errors.phone)}
                />
              </Field>

              <Honeypot name="quote-honeypot" />

              <Button
                type="submit"
                block
                disabled={status === "sending"}
                className="mt-1 rounded-full bg-foreground text-background shadow-none hover:bg-foreground/85"
              >
                {status === "sending" ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Sending
                  </>
                ) : (
                  "Send me this quote"
                )}
              </Button>

              <p aria-live="polite" className="text-[11px] leading-relaxed text-muted-foreground">
                {status === "error" ? (
                  <span className="text-xs font-medium text-red-500">{message}</span>
                ) : (
                  "Indicative and excluding GST. We confirm a fixed price after a short call."
                )}
              </p>
            </form>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={copyLink}
        className="mt-3 inline-flex items-center gap-1.5 px-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        {copied ? <Check className="size-3" aria-hidden /> : <Link2 className="size-3" aria-hidden />}
        {copied ? "Link copied" : "Copy shareable link"}
      </button>
    </aside>
  );
}
