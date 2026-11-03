import { ArrowRight, Check, Info, Sparkles } from "lucide-react";

import { carePlans, projectPackages, type Plan } from "@/lib/plans";
import { site } from "@/lib/site";
import { formatINR } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { Section, type SectionSurface } from "@/components/ui/section";
import { Stagger, StaggerItem } from "@/components/motion/primitives";
import { CARD, SectionIntro } from "@/components/sections/page-blocks";
import { cn } from "@/lib/utils";

/** Where each build package's button goes, so the next step matches the package. */
const PACKAGE_CTA: Record<string, { href: string; label: string }> = {
  "landing-page": { href: "/contact?service=business-websites", label: "Get started" },
  "website-build": { href: "/contact?service=business-websites", label: "Get started" },
  "full-application-build": { href: "/estimate", label: "Get an estimate" },
  "enterprise-engagement": { href: "/contact?service=custom-software", label: "Talk to us" },
};

export function ProjectPackages({ surface = "grid" }: { surface?: SectionSurface }) {
  return (
    <Section surface={surface} id="packages">
      <div className="container-page">
        <SectionIntro
          eyebrow="Build packages"
          title="Project packages"
          description="Choose the package closest to your requirements. After a free consultation, you receive a written scope and a fixed price."
        />

        <Stagger
          className="mt-14 grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-4"
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

        <p className="mx-auto mt-10 flex max-w-xl items-start justify-center gap-2 text-center text-xs leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0 text-setu" aria-hidden />
          All prices exclude GST. Domains, payment gateways, cloud services and
          licences are billed to your accounts at cost.
        </p>
      </div>
    </Section>
  );
}

export function CarePlans({ surface = "dots" }: { surface?: SectionSurface }) {
  return (
    <Section surface={surface} id="care">
      <div className="container-page">
        <SectionIntro
          eyebrow="Hosting and maintenance"
          title="Monthly maintenance plans"
          description="Hosting, updates, backups, monitoring and fixes for a single monthly fee. Available for platforms we build and for those built elsewhere."
        />

        <Stagger className="mt-14 grid items-stretch gap-5 lg:grid-cols-3" stagger={0.08}>
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

        <p className="mx-auto mt-10 flex max-w-xl items-start justify-center gap-2 text-center text-xs leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0 text-setu" aria-hidden />
          <span>
            Existing plan clients can email{" "}
            <a
              href={`mailto:${site.supportEmail}`}
              className="font-medium text-setu underline-offset-2 hover:underline"
            >
              {site.supportEmail}
            </a>{" "}
            for changes, fixes and hosting requests.
          </span>
        </p>
      </div>
    </Section>
  );
}

/** Both plan sections, in their default order. */
export function PricingPlans() {
  return (
    <>
      <ProjectPackages />
      <CarePlans />
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

  const body = (
    <article
      className={cn(
        "relative flex h-full flex-col p-6 md:p-7",
        plan.highlight ? "rounded-[calc(1rem-1px)] bg-surface" : CARD,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-xl font-semibold text-foreground">{plan.name}</h3>
        {plan.highlight ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-setu px-2.5 py-1 text-[11px] font-semibold text-white">
            <Sparkles className="size-3" aria-hidden />
            Recommended
          </span>
        ) : null}
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{plan.tagline}</p>

      <div className="mt-6 border-t border-border pt-5">
        {plan.monthly !== null ? (
          <>
            <span className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Per month
            </span>
            <span className="mt-1 block font-display text-[2rem] font-semibold leading-none tabular-nums text-foreground">
              {formatINR(plan.monthly)}
            </span>
          </>
        ) : quoted ? (
          <>
            <span className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Pricing
            </span>
            <span className="mt-1 block font-display text-[2rem] font-semibold leading-none text-foreground">
              Custom quote
            </span>
          </>
        ) : (
          <>
            <span className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Starting at
            </span>
            <span className="mt-1 block font-display text-[2rem] font-semibold leading-none tabular-nums text-foreground">
              {formatINR(plan.setupFrom ?? 0)}
            </span>
          </>
        )}
        <span className="mt-2 block text-xs text-muted-foreground">Excluding GST</span>
      </div>

      <p className="mt-5 rounded-xl bg-setu/[0.06] px-3.5 py-2.5 text-xs leading-relaxed text-foreground/80 ring-1 ring-inset ring-setu/10">
        <span className="font-semibold text-foreground">Best for: </span>
        {plan.bestFor}
      </p>

      <h4 className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        What&apos;s included
      </h4>
      <ul className="mt-3 flex flex-col gap-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-2.5 text-[0.9rem] leading-snug text-foreground/85">
            <span className="mt-0.5 inline-flex size-[18px] shrink-0 items-center justify-center rounded-full bg-setu/12 text-setu">
              <Check className="size-3" strokeWidth={3} aria-hidden />
            </span>
            {feature}
          </li>
        ))}
      </ul>

      {plan.limits.length > 0 ? (
        <ul className="mt-5 flex flex-wrap gap-1.5">
          {plan.limits.map((limit) => (
            <li
              key={limit}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background-subtle px-2.5 py-1 text-[11px] text-muted-foreground"
            >
              <span className="size-1.5 rounded-full bg-setu" aria-hidden />
              {limit}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="min-h-7 flex-1" aria-hidden />

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
        <ArrowRight className="size-4" aria-hidden />
      </ButtonLink>
    </article>
  );

  if (!plan.highlight) return body;

  // Recommended plan: a slowly rotating cyan gradient shows through a 1.5px
  // gap around the card. Reduced motion keeps the gradient, without the spin.
  return (
    <div className="relative h-full overflow-hidden rounded-2xl p-[1.5px] shadow-[0_1px_2px_rgb(15_23_42/0.05),0_20px_50px_-20px_rgb(0_161_198/0.45)]">
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 aspect-square w-[250%] -translate-x-1/2 -translate-y-1/2 animate-spin bg-[conic-gradient(from_0deg,#00a1c6,#3b82f6_25%,rgba(0,161,198,0.15)_50%,#22d3ee_75%,#00a1c6)] [animation-duration:7s] motion-reduce:animate-none"
      />
      <div className="relative h-full">{body}</div>
    </div>
  );
}
