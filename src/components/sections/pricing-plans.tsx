import { ArrowRight, Info, Sparkles } from "lucide-react";

import { carePlans, projectPackages, type Plan } from "@/lib/plans";
import { site } from "@/lib/site";
import { formatINR } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { InclusionsDisclosure } from "@/components/ui/inclusions-disclosure";
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
    <Section surface={surface} id="packages" className="py-14 md:py-20">
      <div className="container-page">
        <SectionIntro
          compact
          eyebrow="Build packages"
          title="Project packages"
          description="Choose the package closest to your requirements. After a free consultation, you receive a written scope and a fixed price."
        />

        <Stagger
          className="mt-10 grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-4"
          stagger={0.08}
        >
          {projectPackages.map((plan) => {
            const cta = PACKAGE_CTA[plan.id] ?? { href: "/contact", label: "Request a quote" };
            return (
              <StaggerItem key={plan.id} y={28}>
                <PlanCard plan={plan} ctaHref={cta.href} ctaLabel={cta.label} />
              </StaggerItem>
            );
          })}
        </Stagger>

        <p className="mx-auto mt-7 flex max-w-xl items-start justify-center gap-2 text-center text-xs leading-relaxed text-muted-foreground">
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
    <Section surface={surface} id="care" className="py-14 md:py-20">
      <div className="container-page">
        <SectionIntro
          compact
          eyebrow="Hosting and maintenance"
          title="Monthly maintenance plans"
          description="Hosting, updates, backups, monitoring and fixes for a single monthly fee. Available for platforms we build and for those built elsewhere."
        />

        <Stagger className="mx-auto mt-10 grid max-w-5xl items-start gap-4 md:grid-cols-3" stagger={0.08}>
          {carePlans.map((plan) => (
            <StaggerItem key={plan.id} y={28}>
              <PlanCard
                plan={plan}
                ctaHref="/contact?service=managed-hosting"
                ctaLabel={`Choose ${plan.name}`}
              />
            </StaggerItem>
          ))}
        </Stagger>

        <p className="mx-auto mt-7 flex max-w-xl items-start justify-center gap-2 text-center text-xs leading-relaxed text-muted-foreground">
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
  // Delivery notes and SLAs read as inclusions, so they join the list.
  const inclusions = [...plan.features, ...plan.limits];

  const body = (
    <article
      className={cn(
        "relative flex h-full flex-col p-5 md:p-6",
        plan.highlight ? "overflow-hidden rounded-[calc(1rem-1.5px)] bg-surface" : CARD,
      )}
    >
      {plan.highlight ? (
        <span className="-mx-5 -mt-5 mb-4 flex items-center justify-center gap-1.5 bg-[linear-gradient(90deg,#00657f,#00809d)] py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white md:-mx-6 md:-mt-6">
          <Sparkles className="size-3" aria-hidden />
          Recommended
        </span>
      ) : null}
      <h3 className="font-display text-lg font-semibold text-foreground">{plan.name}</h3>
      <p className="mt-1 text-[0.85rem] leading-snug text-muted-foreground sm:min-h-[2.5rem]">
        {plan.tagline}
      </p>

      <div className="mt-4 flex items-baseline gap-2">
        {plan.monthly !== null ? (
          <>
            <span className="font-display text-[1.75rem] font-semibold leading-none tabular-nums text-foreground">
              {formatINR(plan.monthly)}
            </span>
            <span className="text-xs text-muted-foreground">per month</span>
          </>
        ) : quoted ? (
          <span className="font-display text-[1.75rem] font-semibold leading-none text-foreground">
            Custom quote
          </span>
        ) : (
          <>
            <span className="text-xs text-muted-foreground">Starting from</span>
            <span className="font-display text-[1.75rem] font-semibold leading-none tabular-nums text-foreground">
              {formatINR(plan.setupFrom ?? 0)}
            </span>
          </>
        )}
      </div>

      <ButtonLink
        href={ctaHref}
        variant={plan.highlight ? "primary" : "secondary"}
        size="sm"
        block
        className={cn(
          "mt-5 rounded-full",
          plan.highlight && "bg-setu text-white shadow-none hover:bg-setu-dark",
        )}
      >
        {ctaLabel}
        <ArrowRight className="size-4" aria-hidden />
      </ButtonLink>

      <InclusionsDisclosure items={inclusions} className="mt-4 border-t border-border pt-2" />
    </article>
  );

  if (!plan.highlight) return body;

  // Recommended plan: a slowly rotating cyan gradient shows through a 1.5px
  // gap around the card. Reduced motion keeps the gradient, without the spin.
  return (
    <div className="relative h-full overflow-hidden rounded-2xl p-[1.5px] shadow-[0_1px_2px_rgb(15_23_42/0.05),0_20px_50px_-20px_rgb(0_161_198/0.45)]">
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 aspect-square w-[250%] -translate-x-1/2 -translate-y-1/2 animate-spin bg-[conic-gradient(from_0deg,#2f56d8,#3b82f6_25%,rgba(47,86,216,0.15)_50%,#22d3ee_75%,#2f56d8)] [animation-duration:7s] motion-reduce:animate-none"
      />
      <div className="relative h-full">{body}</div>
    </div>
  );
}
