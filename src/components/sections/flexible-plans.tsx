"use client";

import Link from "next/link";

import { projectPackages, type Plan } from "@/lib/plans";
import { cn, formatINR } from "@/lib/utils";
import { FadeUp, SpotlightCard, Stagger, StaggerItem } from "@/components/motion/primitives";
import { TextReveal } from "@/components/motion/text-reveal";
import { InclusionsDisclosure } from "@/components/ui/inclusions-disclosure";

/**
 * "Flexible plans" (Figma 24:2682, 24:2733 and cards 24:3062 / 24:3000 / 24:3031).
 *
 * The priced packages (landing page, website, application) keep the design's
 * three-card row. Enterprise is quoted rather than priced, so it sits in a
 * full-width strip under the row with a call booking instead of a price — a
 * ₹0 price would read as free, and a fourth card would squeeze the row.
 *
 * Cards are compact: name, tagline, starting price and a call to action, with
 * the inclusions in a collapsed "What's included" disclosure. Cards rise in a
 * stagger and follow the cursor with a glow, and the highlighted plan carries
 * a slow light sweeping round its border.
 */

/**
 * Homepage card copy, from the approved copy deck. The shared plan data also
 * feeds the pricing page, so the homepage wording is applied here rather than
 * by rewriting that data. Durations and delivery detail stay on /pricing.
 */
const DESIGN_COPY: Record<
  string,
  { name?: string; tagline?: string; features?: readonly string[] }
> = {
  "landing-page": {
    name: "Landing Page",
    tagline: "A focused single page to launch a campaign or product.",
    features: [
      "Single-page design",
      "Mobile-responsive design",
      "Contact forms and WhatsApp integration",
      "On-page SEO setup",
      "3 months of support",
    ],
  },
  "website-build": {
    name: "Business Website",
    tagline: "A complete multi-page website for your company.",
    features: [
      "Up to 8 pages",
      "Mobile-responsive design",
      "Content management system",
      "On-page SEO setup",
      "Contact forms and WhatsApp integration",
      "3 months of support",
    ],
  },
  "full-application-build": {
    name: "Full Application",
    tagline: "Online stores, web apps and mobile apps.",
    features: [
      "User accounts and admin dashboard",
      "Secure payment integration",
      "Automated email and order notifications",
      "Cloud infrastructure setup",
      "6–8 months of support",
    ],
  },
  "enterprise-engagement": {
    name: "Enterprise",
    tagline: "ERP, CRM and large-scale platforms.",
    features: [
      "Custom ERP, CRM and customer portals",
      "Phased migration from legacy systems",
      "Milestone-based delivery",
      "Dedicated project lead",
      "Extended support",
    ],
  },
};

function PlanCard({ plan }: { plan: Plan }) {
  const quoted = !plan.setupFrom;
  const copy = DESIGN_COPY[plan.id] ?? {};
  const tagline = copy.tagline ?? plan.tagline;
  const features = copy.features ?? plan.features;

  return (
    <SpotlightCard
      as="article"
      tilt={0}
      glow={plan.highlight ? "rgba(255,255,255,0.45)" : "rgba(0,161,198,0.16)"}
      className={cn(
        "flex flex-col rounded-[20px] border border-[rgba(0,161,198,0.15)] px-6 pb-5 pt-7 text-black transition-[translate,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-[0_24px_48px_-24px_rgba(0,161,198,0.45)] motion-safe:hover:-translate-y-1 dark:text-white",
        "lg:rounded-[calc(var(--s)*20)] lg:px-[calc(var(--s)*40)] lg:pb-[calc(var(--s)*20)] lg:pt-[calc(var(--s)*32)]",
        plan.highlight
          ? "bg-[linear-gradient(125deg,#d6def1_0%,#d4e7f4_48%,#d3dbf0_100%)] dark:bg-[linear-gradient(125deg,#1b2c4a_0%,#16384a_48%,#1a2744_100%)]"
          : "bg-[rgba(235,239,248,0.54)] dark:bg-white/5",
      )}
    >
      {plan.highlight ? <BorderSweep /> : null}
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[22px] font-extrabold leading-[normal] tracking-[-0.02em] lg:text-[calc(var(--s)*24)]">
          {copy.name ?? plan.name}
        </h3>
        {plan.highlight ? (
          <span className="rounded-full bg-[#00708c] px-2.5 py-0.5 text-[11px] font-semibold text-white">
            Recommended
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-[14px] leading-[1.5] tracking-[0.01em] opacity-70 md:min-h-[42px] lg:min-h-[calc(var(--s)*45)] lg:text-[calc(var(--s)*15)]">
        {tagline}
      </p>

      {quoted ? null : (
        <p className="mt-5 flex items-baseline gap-2 lg:mt-[calc(var(--s)*22)]">
          <span className="text-[13px] opacity-70 lg:text-[calc(var(--s)*14)]">Starting from</span>
          <span className="text-[30px] font-extrabold leading-none tracking-[-0.03em] tabular-nums lg:text-[calc(var(--s)*34)]">
            {formatINR(plan.setupFrom ?? 0)}
          </span>
        </p>
      )}

      <Link
        href={quoted ? "/contact?intent=consultation" : "/estimate"}
        className={cn(
          "mt-5 inline-flex h-10 w-full items-center justify-center rounded-[50px] border-[1.5px] border-setu text-[15px] font-semibold leading-[normal] transition-[background-color,border-color,color] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-setu lg:mt-[calc(var(--s)*22)] lg:h-[calc(var(--s)*40)] lg:text-[calc(var(--s)*15)]",
          plan.highlight
            ? "bg-setu text-white hover:border-setu-dark hover:bg-setu-dark"
            : "text-black hover:bg-setu hover:text-white dark:text-white",
        )}
      >
        {quoted ? "Talk to us" : "Get started"}
      </Link>

      <InclusionsDisclosure
        items={features}
        className="mt-4 border-t border-black/10 pt-1.5 dark:border-white/10"
        buttonClassName="text-black dark:text-white"
        itemClassName="text-black/80 dark:text-white/80"
      />
    </SpotlightCard>
  );
}

/**
 * A light that travels slowly round the highlighted card's 1px border. The
 * ring is the border box masked down to its outer pixel; inside it an
 * oversized conic gradient turns (transform only, CSS animation), so the
 * mask stays put while the light moves. Static for reduced-motion users.
 */
function BorderSweep() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute -inset-px -z-10 overflow-hidden rounded-[inherit] p-px"
      style={{
        WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        WebkitMaskComposite: "xor",
        mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
      }}
    >
      <span
        className="absolute top-1/2 left-1/2 aspect-square w-[260%] -translate-x-1/2 -translate-y-1/2 motion-safe:animate-[spin_9s_linear_infinite]"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, rgba(0,161,198,0.95) 50deg, transparent 110deg, transparent 180deg, rgba(10,52,166,0.75) 230deg, transparent 290deg)",
        }}
      />
    </span>
  );
}

const PRICED_PLANS = projectPackages.filter((plan) => (plan.setupFrom ?? 0) > 0);
const QUOTED_PLANS = projectPackages.filter((plan) => !plan.setupFrom);

/** The quoted tier as a strip: what it covers on the left, the call to book on the right. */
function QuotedPlanStrip({ plan }: { plan: Plan }) {
  const copy = DESIGN_COPY[plan.id] ?? {};
  const features = copy.features ?? plan.features;

  return (
    <article className="flex flex-col gap-4 rounded-[20px] border border-[rgba(0,161,198,0.15)] bg-[rgba(235,239,248,0.54)] px-6 py-6 text-black md:flex-row md:items-start md:justify-between md:gap-10 lg:rounded-[calc(var(--s)*20)] lg:px-[calc(var(--s)*40)] lg:py-[calc(var(--s)*26)] dark:bg-white/5 dark:text-white">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h3 className="text-[22px] font-extrabold leading-[normal] tracking-[-0.02em] lg:text-[calc(var(--s)*24)]">
            {copy.name ?? plan.name}
          </h3>
          <p className="text-[14px] tracking-[0.01em] opacity-70 lg:text-[calc(var(--s)*15)]">
            {copy.tagline ?? plan.tagline}
          </p>
        </div>
        <InclusionsDisclosure
          items={features}
          className="max-w-xl"
          buttonClassName="text-black dark:text-white"
          itemClassName="text-black/80 dark:text-white/80"
        />
      </div>

      <div className="flex shrink-0 flex-col gap-3 md:items-end lg:gap-[calc(var(--s)*12)]">
        <p className="text-[22px] font-extrabold leading-[normal] tracking-[-0.02em] lg:text-[calc(var(--s)*26)]">
          Custom quote
        </p>
        <Link
          href="/contact?intent=consultation"
          className="inline-flex h-10 w-full items-center justify-center rounded-[50px] border-[1.5px] border-setu px-8 text-[15px] font-semibold leading-[normal] text-black transition-[background-color,border-color,color] duration-200 hover:bg-setu hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-setu md:w-auto lg:h-[calc(var(--s)*40)] lg:px-[calc(var(--s)*34)] lg:text-[calc(var(--s)*15)] dark:text-white"
        >
          Talk to us
        </Link>
      </div>
    </article>
  );
}

export function FlexiblePlans() {
  return (
    <section
      id="pricing"
      aria-labelledby="flexible-plans-title"
      className="border-t border-border bg-[linear-gradient(180deg,#f6f9fc,var(--background)_85%)] pt-20 md:pt-28 lg:pt-[calc(var(--s)*139)] dark:bg-[linear-gradient(180deg,var(--background-subtle),var(--background)_85%)]"
    >
      <div className="container-figma">
        <div className="mx-auto flex max-w-[807px] flex-col items-center gap-3.5 text-center lg:max-w-[calc(var(--s)*807)] lg:gap-[calc(var(--s)*14)]">
          <TextReveal
            as="h2"
            id="flexible-plans-title"
            className="text-[40px] font-bold leading-[1.2] tracking-[-0.02em] text-black sm:text-[48px] lg:text-[calc(var(--s)*56)] lg:leading-[calc(var(--s)*72)] dark:text-white"
          >
            Flexible plans
          </TextReveal>
          <FadeUp delay={0.25} y={18}>
            <p className="text-[15px] font-normal leading-[29px] tracking-[0.02em] text-black opacity-70 lg:text-[calc(var(--s)*15)] lg:leading-[calc(var(--s)*29)] dark:text-white">
              Clear, upfront pricing for every stage of your business. All
              prices exclude GST.
            </p>
          </FadeUp>
        </div>

        <Stagger
          stagger={0.12}
          className="mx-auto mt-11 grid max-w-md items-start gap-5 md:max-w-none md:grid-cols-2 lg:mt-[calc(var(--s)*45)] lg:grid-cols-3 lg:gap-[calc(var(--s)*34)]"
        >
          {PRICED_PLANS.map((plan) => (
            <StaggerItem key={plan.id}>
              <PlanCard plan={plan} />
            </StaggerItem>
          ))}
          {QUOTED_PLANS.map((plan) => (
            <StaggerItem key={plan.id} className="md:col-span-2 lg:col-span-3">
              <QuotedPlanStrip plan={plan} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
