"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Clock,
  Copy,
  Link2,
  Loader2,
  Mail,
  RotateCcw,
  Users,
} from "lucide-react";

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
import { Field, Honeypot, Input, Textarea } from "@/components/ui/field";
import { ServiceIcon } from "@/components/ui/service-icon";

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

  return (
    <div className={cn("grid gap-6", compact ? "lg:grid-cols-1" : "lg:grid-cols-[1.35fr_1fr]")}>
      <div className="flex flex-col gap-7 rounded-card border border-border bg-surface p-5 md:p-7">
        {/* Service */}
        <fieldset>
          <Legend step={1} label="What do you need built?" />
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {services.map((service) => {
              const active = input.service === service.slug;
              return (
                <button
                  key={service.slug}
                  type="button"
                  onClick={() => update({ service: service.slug })}
                  aria-pressed={active}
                  /*
                   * No aria-label: the name is computed from the two spans
                   * below. Any label we write here is judged against the
                   * visible text joined with no separator ("Appsfrom ₹2.2L"),
                   * so every readable phrasing registers as a
                   * label-content mismatch. Letting the content speak is both
                   * accurate and one less thing to keep in sync.
                   */
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200",
                    active
                      ? "border-primary bg-primary/8 shadow-glow"
                      : "border-border bg-background hover:border-primary/35",
                  )}
                >
                  <ServiceIcon
                    name={service.icon}
                    accent={service.accent}
                    className="size-9"
                    size={17}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-foreground">
                      {service.shortName}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      from {formatINRCompact(service.priceFrom)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Scope */}
        <fieldset>
          <Legend
            step={2}
            label={`How many ${rate.scopeNoun}?`}
            hint="A rough number is fine — we refine it on the call."
          />
          <div className="mt-4 flex items-center gap-4">
            <input
              type="range"
              min={SCOPE_LIMITS.min}
              max={SCOPE_LIMITS.max}
              step={1}
              value={input.scope}
              onChange={(event) => update({ scope: Number(event.target.value) })}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-2 accent-[var(--primary)]"
              aria-label={`Number of ${rate.scopeNoun}`}
              aria-valuetext={`${input.scope} ${rate.scopeNoun}`}
            />
            <output className="w-16 shrink-0 rounded-lg border border-border bg-background py-1.5 text-center font-mono text-sm font-semibold text-foreground">
              {input.scope}
            </output>
          </div>
        </fieldset>

        {/* Platforms — only meaningful for app builds */}
        {rate.supportsPlatforms ? (
          <fieldset>
            <Legend step={3} label="Which platforms?" />
            <div className="mt-3 flex flex-wrap gap-2">
              {(Object.keys(PLATFORM_LABELS) as PlatformKey[]).map((platform) => {
                const active = input.platforms.includes(platform);
                return (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => togglePlatform(platform)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {PLATFORM_LABELS[platform]}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ) : null}

        {/* Features */}
        <fieldset>
          <Legend
            step={rate.supportsPlatforms ? 4 : 3}
            label="What should it do?"
            hint="Pick everything you know you need. Leave the rest for phase two."
          />
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {FEATURE_ORDER.map((feature) => {
              const meta = FEATURE_RATES[feature];
              const active = input.features.includes(feature);
              return (
                <label
                  key={feature}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
                    active
                      ? "border-primary/60 bg-primary/8"
                      : "border-border bg-background hover:border-primary/30",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleFeature(feature)}
                    className="mt-0.5 size-4 shrink-0 accent-[var(--primary)]"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-foreground">
                      {meta.label}
                    </span>
                    <span className="block text-xs leading-snug text-muted-foreground">
                      {meta.hint}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* Design + timeline */}
        <div className="grid gap-7 sm:grid-cols-2">
          <fieldset>
            <Legend step={rate.supportsPlatforms ? 5 : 4} label="Design level" />
            <div className="mt-3 flex flex-col gap-2">
              {(Object.keys(DESIGN_TIERS) as DesignTier[]).map((tier) => (
                <RadioRow
                  key={tier}
                  name="design"
                  checked={input.design === tier}
                  onChange={() => update({ design: tier })}
                  label={DESIGN_TIERS[tier].label}
                  hint={DESIGN_TIERS[tier].hint}
                />
              ))}
            </div>
          </fieldset>

          <fieldset>
            <Legend step={rate.supportsPlatforms ? 6 : 5} label="Timeline" />
            <div className="mt-3 flex flex-col gap-2">
              {(Object.keys(TIMELINES) as TimelineKey[]).map((key) => (
                <RadioRow
                  key={key}
                  name="timeline"
                  checked={input.timeline === key}
                  onChange={() => update({ timeline: key })}
                  label={TIMELINES[key].label}
                  hint={TIMELINES[key].hint}
                />
              ))}
            </div>
          </fieldset>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background p-4">
          <input
            type="checkbox"
            checked={input.retainer}
            onChange={(event) => update({ retainer: event.target.checked })}
            className="mt-0.5 size-4 shrink-0 accent-[var(--primary)]"
          />
          <span>
            <span className="block text-sm font-medium text-foreground">
              Add a monthly care plan after launch
            </span>
            <span className="block text-xs text-muted-foreground">
              Monitoring, patches, backups and a named engineer on call.
            </span>
          </span>
        </label>

        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 self-start text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <RotateCcw className="size-3" aria-hidden />
          Start over
        </button>
      </div>

      <QuoteSummary input={input} result={result} />
    </div>
  );
}

function Legend({
  step,
  label,
  hint,
}: {
  step: number;
  label: string;
  hint?: string;
}) {
  return (
    <legend className="flex flex-col gap-1">
      <span className="flex items-center gap-2.5">
        <span className="inline-flex size-6 items-center justify-center rounded-full bg-primary/12 font-mono text-[11px] font-semibold text-primary">
          {step}
        </span>
        <span className="text-[0.95rem] font-semibold text-foreground">{label}</span>
      </span>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </legend>
  );
}

function RadioRow({
  name,
  checked,
  onChange,
  label,
  hint,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  hint: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
        checked ? "border-primary/60 bg-primary/8" : "border-border bg-background hover:border-primary/30",
      )}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="mt-0.5 size-4 shrink-0 accent-[var(--primary)]"
      />
      <span>
        <span className="block text-sm font-medium text-foreground">{label}</span>
        <span className="block text-xs leading-snug text-muted-foreground">{hint}</span>
      </span>
    </label>
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
        notes: String(form.get("quote-notes") ?? ""),
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
      <div className="overflow-hidden rounded-card border border-border bg-surface shadow-ambient">
        <div className="bg-[linear-gradient(135deg,var(--color-brand-600),var(--color-accent-500))] p-5 text-white md:p-6">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/80">
            Estimated investment
          </p>
          <p className="mt-2 font-display text-3xl font-semibold tabular-nums md:text-4xl">
            {formatINRCompact(result.low)} – {formatINRCompact(result.high)}
          </p>
          <p className="mt-1 text-sm text-white/85">
            Mid-point {formatINR(result.total)} · fixed price after discovery
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/12 px-3 py-2.5 backdrop-blur">
              <span className="flex items-center gap-1.5 text-[11px] text-white/80">
                <Clock className="size-3" aria-hidden /> Timeline
              </span>
              <span className="mt-0.5 block text-sm font-semibold">
                ~{result.weeks} weeks
              </span>
            </div>
            <div className="rounded-xl bg-white/12 px-3 py-2.5 backdrop-blur">
              <span className="flex items-center gap-1.5 text-[11px] text-white/80">
                <Users className="size-3" aria-hidden /> Squad
              </span>
              <span className="mt-0.5 block text-sm font-semibold">
                {result.teamSize} people
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 p-5 md:p-6">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Payment milestones</h2>
            <ul className="mt-2.5 flex flex-col gap-2">
              {result.milestones.map((milestone) => (
                <li
                  key={milestone.name}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="text-muted-foreground">{milestone.name}</span>
                  <span className="shrink-0 font-mono text-[0.8rem] font-medium tabular-nums text-foreground">
                    {formatINR(milestone.amount)}
                  </span>
                </li>
              ))}
              {result.monthlyRetainer > 0 ? (
                <li className="flex items-center justify-between gap-3 border-t border-border pt-2 text-sm">
                  <span className="text-muted-foreground">Care plan / month</span>
                  <span className="shrink-0 font-mono text-[0.8rem] font-medium tabular-nums text-primary">
                    {formatINR(result.monthlyRetainer)}
                  </span>
                </li>
              ) : null}
            </ul>
          </div>

          {result.notes.length > 0 ? (
            <ul className="flex flex-col gap-1.5 rounded-xl bg-surface-2/70 p-3 text-xs leading-relaxed text-muted-foreground">
              {result.notes.map((note) => (
                <li key={note} className="flex gap-2">
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" aria-hidden />
                  {note}
                </li>
              ))}
            </ul>
          ) : null}

          {status === "done" ? (
            <div
              className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4"
              role="status"
            >
              <p className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                <Check className="size-4 shrink-0" aria-hidden />
                {message}
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Your reference is{" "}
                <span className="font-mono font-semibold text-foreground">{reference}</span>
                . Quote it when we speak and we&apos;ll pull this exact configuration up.
              </p>
            </div>
          ) : (
            <form ref={formRef} onSubmit={onSubmit} className="relative flex flex-col gap-3" noValidate>
              <h2 className="text-sm font-semibold text-foreground">
                Email me this quote
              </h2>

              <Field label="Name" htmlFor="quote-name" required error={errors.name}>
                <Input
                  id="quote-name"
                  name="quote-name"
                  autoComplete="name"
                  required
                  placeholder="Your name"
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
                  placeholder="you@company.com"
                  aria-invalid={Boolean(errors.email)}
                />
              </Field>

              <Field label="Phone" htmlFor="quote-phone" error={errors.phone}>
                <Input
                  id="quote-phone"
                  name="quote-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+91…"
                  aria-invalid={Boolean(errors.phone)}
                />
              </Field>

              <Field label="Anything specific?" htmlFor="quote-notes" error={errors.notes}>
                <Textarea
                  id="quote-notes"
                  name="quote-notes"
                  rows={3}
                  placeholder="Deadline, existing stack, integrations…"
                />
              </Field>

              <Honeypot name="quote-honeypot" />

              <Button type="submit" variant="gradient" block disabled={status === "sending"}>
                {status === "sending" ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Sending
                  </>
                ) : (
                  <>
                    <Mail className="size-4" aria-hidden />
                    Send me this quote
                  </>
                )}
              </Button>

              <p aria-live="polite">
                {status === "error" ? (
                  <span className="text-xs font-medium text-red-500">{message}</span>
                ) : (
                  <span className="text-[11px] text-muted-foreground">
                    No sales sequence. One email with the breakdown, and a reply
                    from an engineer if you want one.
                  </span>
                )}
              </p>
            </form>
          )}

          <button
            type="button"
            onClick={copyLink}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            {copied ? (
              <>
                <Check className="size-3" aria-hidden /> Link copied
              </>
            ) : (
              <>
                <Link2 className="size-3" aria-hidden /> Copy shareable link
              </>
            )}
          </button>
        </div>
      </div>

      <p className="mt-3 flex items-start gap-2 px-1 text-[11px] leading-relaxed text-muted-foreground">
        <Copy className="mt-0.5 size-3 shrink-0" aria-hidden />
        This is a real estimate from our rate card, not a lead-capture
        placeholder. The written proposal after discovery is fixed-price.
      </p>
    </aside>
  );
}
