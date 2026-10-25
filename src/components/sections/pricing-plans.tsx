import { Check, Info } from "lucide-react";

import { carePlans, projectPackages, type Plan } from "@/lib/plans";
import { formatINR, formatINRCompact } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { cn } from "@/lib/utils";

export function PricingPlans() {
  return (
    <>
      <Section id="packages">
        <div className="container-page">
          <SectionHeading
            eyebrow="Build pricing"
            title="Three starting points, one fixed price"
            description="Packages are a starting shape, not a cage. The estimator prices your actual scope, and the proposal after discovery is the number you pay."
          />

          <div className="mt-14 grid items-start gap-5 lg:grid-cols-3">
            {projectPackages.map((plan, index) => (
              <Reveal key={plan.id} delay={index * 80}>
                <PlanCard plan={plan} ctaHref="/estimate" ctaLabel="Price this scope" />
              </Reveal>
            ))}
          </div>

          <p className="mx-auto mt-8 flex max-w-xl items-start gap-2 text-center text-xs leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            Prices exclude GST and third-party costs (gateways, cloud, licences),
            which you pay the vendor directly at cost — we never mark them up.
          </p>
        </div>
      </Section>

      <Section surface="subtle" id="care">
        <div className="container-page">
          <SectionHeading
            eyebrow="Hosting & support"
            title="Monthly plans for software that is already live"
            description="Whether we built it or not. Each plan is a published SLA, not a best-effort promise."
          />

          <div className="mt-14 grid items-start gap-5 lg:grid-cols-3">
            {carePlans.map((plan, index) => (
              <Reveal key={plan.id} delay={index * 80}>
                <PlanCard plan={plan} ctaHref="/contact?service=managed-hosting" ctaLabel="Talk to us" />
              </Reveal>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}

export function PlanCard({
  plan,
  ctaHref,
  ctaLabel,
}: {
  plan: Plan;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <article
      className={cn(
        "relative flex h-full flex-col rounded-card border bg-surface p-6 shadow-ambient md:p-7",
        plan.highlight
          ? "border-primary/50 ring-1 ring-primary/20 lg:-translate-y-2"
          : "border-border",
      )}
    >
      {plan.highlight ? (
        <Badge className="absolute -top-3 left-6">Most chosen</Badge>
      ) : null}

      <h3 className="font-display text-xl font-semibold text-foreground">{plan.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>

      <p className="mt-5 flex items-baseline gap-1.5">
        {plan.monthly !== null ? (
          <>
            <span className="font-display text-3xl font-semibold text-foreground">
              {formatINR(plan.monthly)}
            </span>
            <span className="text-sm text-muted-foreground">/ month</span>
          </>
        ) : (
          <>
            <span className="text-sm text-muted-foreground">from</span>
            <span className="font-display text-3xl font-semibold text-foreground">
              {formatINRCompact(plan.setupFrom ?? 0)}
            </span>
          </>
        )}
      </p>

      <p className="mt-3 rounded-lg bg-surface-2/70 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
        Best for: {plan.bestFor}
      </p>

      <ul className="mt-5 flex flex-col gap-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-2.5 text-[0.9rem] text-muted-foreground">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <span className="text-foreground/85">{feature}</span>
          </li>
        ))}
      </ul>

      {plan.limits.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-1.5 border-t border-border pt-4">
          {plan.limits.map((limit) => (
            <li key={limit} className="text-[11px] text-muted-foreground">
              {limit}
            </li>
          ))}
        </ul>
      ) : null}

      <ButtonLink
        href={ctaHref}
        variant={plan.highlight ? "gradient" : "secondary"}
        block
        className="mt-6"
      >
        {ctaLabel}
      </ButtonLink>
    </article>
  );
}
