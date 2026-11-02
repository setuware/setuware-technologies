import { Check, Info } from "lucide-react";

import { carePlans, projectPackages, type Plan } from "@/lib/plans";
import { site } from "@/lib/site";
import { formatINR, formatINRCompact } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/ui/section";
import { Stagger, StaggerItem } from "@/components/motion/primitives";
import { cn } from "@/lib/utils";

/** Where each build package's button goes, so the next step matches the package. */
const PACKAGE_CTA: Record<string, { href: string; label: string }> = {
  "landing-page": { href: "/contact?service=business-websites", label: "Get a landing page quote" },
  "website-build": { href: "/contact?service=business-websites", label: "Get a website quote" },
  "full-application-build": { href: "/estimate", label: "Estimate my app" },
  "enterprise-engagement": { href: "/contact?service=custom-software", label: "Discuss a large project" },
};

export function PricingPlans() {
  return (
    <>
      <Section id="packages">
        <div className="container-page">
          <SectionHeading
            eyebrow="Build packages"
            title="Four ways to start a project"
            description="Pick the package closest to your project. After a free 30-minute call, you get a written scope and one fixed price. That is the number you pay."
          />

          <Stagger
            className="mt-14 grid items-start gap-5 md:grid-cols-2 xl:grid-cols-4"
            stagger={0.08}
          >
            {projectPackages.map((plan) => {
              const cta = PACKAGE_CTA[plan.id] ?? { href: "/contact", label: "Request a quote" };
              return (
                <StaggerItem key={plan.id} y={28} className="h-full">
                  <PlanCard plan={plan} ctaHref={cta.href} ctaLabel={cta.label} />
                </StaggerItem>
              );
            })}
          </Stagger>

          <p className="mx-auto mt-8 flex max-w-xl items-start justify-center gap-2 text-center text-xs leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            Prices exclude GST. Domains, payment gateways, cloud and licences are
            billed to your own accounts at cost, with no markup.
          </p>
        </div>
      </Section>

      <Section surface="subtle" id="care">
        <div className="container-page">
          <SectionHeading
            eyebrow="Hosting and care plans"
            title="Monthly plans that keep you online"
            description="Hosting, updates, backups, monitoring and fixes for one monthly fee. Available for anything we built, and for sites and apps built elsewhere."
          />

          <Stagger className="mt-14 grid items-start gap-5 lg:grid-cols-3" stagger={0.08}>
            {carePlans.map((plan) => (
              <StaggerItem key={plan.id} y={28} className="h-full">
                <PlanCard
                  plan={plan}
                  ctaHref="/contact?service=managed-hosting"
                  ctaLabel={`Choose ${plan.name}`}
                />
              </StaggerItem>
            ))}
          </Stagger>

          <p className="mx-auto mt-8 flex max-w-xl items-start justify-center gap-2 text-center text-xs leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <span>
              Already on a plan? Email{" "}
              <a
                href={`mailto:${site.supportEmail}`}
                className="font-medium text-setu underline-offset-2 hover:underline"
              >
                {site.supportEmail}
              </a>{" "}
              for fixes, changes and hosting requests.
            </span>
          </p>
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
  const quoted = plan.monthly === null && !plan.setupFrom;

  return (
    <article
      className={cn(
        "relative flex h-full flex-col rounded-card border bg-surface p-6 shadow-ambient md:p-7",
        plan.highlight ? "border-setu/60 ring-1 ring-setu/25" : "border-border",
      )}
    >
      {plan.highlight ? (
        <Badge className="absolute -top-3 left-6 border-setu/30 bg-setu text-white">
          Recommended
        </Badge>
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
        ) : quoted ? (
          <span className="font-display text-3xl font-semibold text-foreground">
            Custom quote
          </span>
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
            <Check className="mt-0.5 size-4 shrink-0 text-setu" aria-hidden />
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

      <div className="min-h-6 flex-1" aria-hidden />

      <ButtonLink
        href={ctaHref}
        variant={plan.highlight ? "primary" : "secondary"}
        block
        className={cn(
          "rounded-full",
          plan.highlight && "bg-setu text-white shadow-none hover:bg-setu-dark",
        )}
      >
        {ctaLabel}
      </ButtonLink>
    </article>
  );
}
