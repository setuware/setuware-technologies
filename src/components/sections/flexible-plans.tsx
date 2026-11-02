"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { projectPackages, type Plan } from "@/lib/plans";
import { cn, formatINR } from "@/lib/utils";
import { DURATION, EASE_OUT } from "@/components/motion/ease";
import { FadeUp, SpotlightCard, Stagger, StaggerItem } from "@/components/motion/primitives";
import { TextReveal } from "@/components/motion/text-reveal";

/**
 * "Flexible plans" (Figma 24:2682, 24:2733 and cards 24:3062 / 24:3000 / 24:3031).
 *
 * The priced packages (landing page, website, application) keep the design's
 * three-card row. Enterprise is quoted rather than priced, so it sits in a
 * full-width strip under the row with a call booking instead of a price — a
 * ₹0 price would read as free, and a fourth card would squeeze the row.
 *
 * Motion: cards rise in a stagger, then each card's checklist ticks itself
 * off line by line. Cards follow the cursor with a glow and a slight tilt,
 * and the highlighted plan carries a slow light sweeping round its border.
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

/** Each tick draws on, then its line slides in, one after another. */
const FEATURE_VARIANTS = {
  hidden: { opacity: 0, x: -10 },
  shown: (index: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: DURATION.base, ease: EASE_OUT, delay: 0.35 + index * 0.07 },
  }),
};
const TICK_VARIANTS = {
  hidden: { pathLength: 0 },
  shown: (index: number) => ({
    pathLength: 1,
    transition: { duration: DURATION.fast, ease: EASE_OUT, delay: 0.45 + index * 0.07 },
  }),
};

/** Figma vector 24:3073 — a 12.65 × 9.48 tick. */
function CheckGlyph({ index }: { index: number }) {
  return (
    <svg
      viewBox="0 0 13 10"
      fill="none"
      aria-hidden
      className="h-[9.5px] w-[12.65px] shrink-0 lg:h-[calc(var(--s)*9.482)] lg:w-[calc(var(--s)*12.653)]"
    >
      <motion.path
        custom={index}
        variants={TICK_VARIANTS}
        d="M1 4.9 4.55 8.45 12 1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const quoted = !plan.setupFrom;
  const copy = DESIGN_COPY[plan.id] ?? {};
  const tagline = copy.tagline ?? plan.tagline;
  const features = copy.features ?? plan.features;

  return (
    <SpotlightCard
      as="article"
      tilt={4}
      glow={plan.highlight ? "rgba(255,255,255,0.45)" : "rgba(0,161,198,0.16)"}
      className={cn(
        "flex h-full flex-col rounded-[20px] border border-[rgba(0,161,198,0.15)] px-7 pb-10 pt-8 text-black transition-[translate,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-[0_24px_48px_-24px_rgba(0,161,198,0.45)] motion-safe:hover:-translate-y-2 dark:text-white",
        "lg:min-h-[calc(var(--s)*621)] lg:rounded-[calc(var(--s)*20)] lg:px-[calc(var(--s)*54)] lg:pb-[calc(var(--s)*58)] lg:pt-[calc(var(--s)*40)]",
        plan.highlight
          ? "bg-[linear-gradient(125deg,#d6def1_0%,#d4e7f4_48%,#d3dbf0_100%)] dark:bg-[linear-gradient(125deg,#1b2c4a_0%,#16384a_48%,#1a2744_100%)]"
          : "bg-[rgba(235,239,248,0.54)] dark:bg-white/5",
      )}
    >
      {plan.highlight ? <BorderSweep /> : null}
      <div className="flex flex-col gap-10 md:flex-1 lg:gap-[calc(var(--s)*40)]">
        <div className="flex flex-col gap-[5px] lg:gap-[calc(var(--s)*5)]">
          <h3 className="text-[22px] font-extrabold leading-[normal] tracking-[-0.02em] lg:text-[calc(var(--s)*24)]">
            {copy.name ?? plan.name}
          </h3>
          <p className="text-[15px] font-normal leading-[29px] tracking-[0.02em] opacity-70 lg:text-[calc(var(--s)*15)] lg:leading-[calc(var(--s)*29)]">
            {tagline}
          </p>
        </div>

        <div className="flex flex-col gap-[13px] lg:gap-[calc(var(--s)*13)]">
          <p className="text-[15px] font-medium leading-[29px] tracking-[0.02em] opacity-40 lg:text-[calc(var(--s)*15)] lg:leading-[calc(var(--s)*29)]">
            What&apos;s included
          </p>
          <ul className="flex flex-col gap-2 lg:gap-[calc(var(--s)*8)]">
            {features.map((feature, index) => (
              <motion.li
                key={feature}
                custom={index}
                variants={FEATURE_VARIANTS}
                className="flex items-center gap-4 text-[16px] font-medium leading-[28px] lg:gap-[calc(var(--s)*16)] lg:text-[calc(var(--s)*16)] lg:leading-[calc(var(--s)*28)]"
              >
                <CheckGlyph index={index} />
                <span>{feature}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {quoted ? null : (
          <div className="flex flex-col md:mt-auto">
            <p className="text-[14px] font-normal leading-[29px] tracking-[0.02em] opacity-70 lg:text-[calc(var(--s)*14)] lg:leading-[calc(var(--s)*29)]">
              Starting from
            </p>
            <p className="text-[34px] font-extrabold leading-[normal] tracking-[-0.03em] lg:text-[calc(var(--s)*39)]">
              {formatINR(plan.setupFrom ?? 0)}
            </p>
          </div>
        )}
      </div>

      <Link
        href={quoted ? "/contact?intent=consultation" : "/estimate"}
        className={cn(
          "mt-10 inline-flex h-10 w-full items-center justify-center rounded-[50px] border-[1.5px] border-setu text-[15px] font-semibold leading-[normal] transition-[background-color,border-color,color] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-setu lg:mt-[calc(var(--s)*24)] lg:h-[calc(var(--s)*40)] lg:text-[calc(var(--s)*15)]",
          plan.highlight
            ? "bg-setu text-white hover:border-setu-dark hover:bg-setu-dark"
            : "text-black hover:bg-setu hover:text-white dark:text-white",
        )}
      >
        {quoted ? "Talk to us" : "Get started"}
      </Link>
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
    <article className="flex flex-col gap-6 rounded-[20px] border border-[rgba(0,161,198,0.15)] bg-[rgba(235,239,248,0.54)] px-7 py-8 text-black md:flex-row md:items-center md:justify-between md:gap-10 lg:rounded-[calc(var(--s)*20)] lg:px-[calc(var(--s)*54)] lg:py-[calc(var(--s)*36)] dark:bg-white/5 dark:text-white">
      <div className="flex flex-col gap-3 lg:gap-[calc(var(--s)*12)]">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h3 className="text-[22px] font-extrabold leading-[normal] tracking-[-0.02em] lg:text-[calc(var(--s)*24)]">
            {copy.name ?? plan.name}
          </h3>
          <p className="text-[15px] font-normal tracking-[0.02em] opacity-70 lg:text-[calc(var(--s)*15)]">
            {copy.tagline ?? plan.tagline}
          </p>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 lg:gap-x-[calc(var(--s)*28)]">
          {features.map((feature, index) => (
            <motion.li
              key={feature}
              custom={index}
              variants={FEATURE_VARIANTS}
              className="flex items-center gap-3 text-[15px] font-medium leading-[26px] lg:gap-[calc(var(--s)*12)] lg:text-[calc(var(--s)*15)] lg:leading-[calc(var(--s)*26)]"
            >
              <CheckGlyph index={index} />
              <span>{feature}</span>
            </motion.li>
          ))}
        </ul>
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
          className="mx-auto mt-11 grid max-w-md items-stretch gap-6 md:max-w-none md:grid-cols-2 lg:mt-[calc(var(--s)*45)] lg:grid-cols-3 lg:gap-[calc(var(--s)*34)]"
        >
          {PRICED_PLANS.map((plan) => (
            <StaggerItem key={plan.id} className="h-full">
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
