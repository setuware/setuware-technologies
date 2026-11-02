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
 * Enterprise is quoted rather than priced, which is why `setupFrom` of 0
 * drops the price block and swaps the call to action to a call booking — a
 * ₹0 price would read as free.
 *
 * Motion: cards rise in a stagger, then each card's checklist ticks itself
 * off line by line. Cards follow the cursor with a glow and a slight tilt,
 * and the highlighted plan carries a slow light sweeping round its border.
 */

/**
 * Card copy as it reads in the design. The shared plan data also feeds the
 * pricing page, so the wording differences are applied here rather than by
 * rewriting that data.
 */
const DESIGN_COPY: Record<string, { tagline?: string; features?: readonly string[] }> = {
  "website-build": {
    tagline: "A website that brings in enquiries.",
    features: [
      "Up to 8 pages, designed mobile-first",
      "Edit text and photos yourself",
      "WhatsApp, call and enquiry buttons",
      "SEO setup and Google Analytics",
      "Domain, hosting and launch handled",
      "3 months of support after launch",
    ],
  },
  "full-application-build": {
    tagline: "Online stores, web apps and mobile apps.",
    features: [
      "Customer logins and an admin panel",
      "UPI, card and net-banking payments",
      "Order, booking and email alerts",
      "Weekly progress on a preview link",
      "6–8 months of support after launch",
    ],
  },
  "enterprise-engagement": {
    tagline: "ERP, CRM and multi-team programmes.",
    features: [
      "Custom ERP, CRM or customer portal",
      "Phased move off legacy software",
      "Milestones fixed in the contract",
      "One named project lead",
      "Extended support and on-call cover",
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
      <div className="flex flex-col gap-10 lg:gap-[calc(var(--s)*40)]">
        <div className="flex flex-col gap-[5px] lg:gap-[calc(var(--s)*5)]">
          <h3 className="text-[22px] font-extrabold leading-[normal] tracking-[-0.02em] lg:text-[calc(var(--s)*24)]">
            {plan.name}
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
          <div className="flex flex-col">
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
          "mt-10 inline-flex h-10 w-full items-center justify-center rounded-[50px] border-[1.5px] border-setu text-[15px] font-semibold leading-[normal] transition-[background-color,border-color,color] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-setu md:mt-auto lg:h-[calc(var(--s)*40)] lg:text-[calc(var(--s)*15)]",
          plan.highlight
            ? "bg-setu text-white hover:border-setu-dark hover:bg-setu-dark"
            : "text-black hover:bg-setu hover:text-white dark:text-white",
        )}
      >
        {quoted ? "Book a 30-minute call" : "Estimate your project"}
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

export function FlexiblePlans() {
  return (
    <section
      id="pricing"
      aria-labelledby="flexible-plans-title"
      className="bg-background pt-20 md:pt-28 lg:pt-[calc(var(--s)*139)]"
    >
      <div className="container-figma">
        <div className="mx-auto flex max-w-[807px] flex-col items-center gap-3.5 text-center lg:max-w-[calc(var(--s)*807)] lg:gap-[calc(var(--s)*14)]">
          <TextReveal
            as="h2"
            id="flexible-plans-title"
            className="text-[40px] font-bold leading-[1.2] tracking-[-0.02em] text-black sm:text-[48px] lg:text-[calc(var(--s)*56)] lg:leading-[calc(var(--s)*72)] dark:text-white"
          >
            Clear starting prices
          </TextReveal>
          <FadeUp delay={0.25} y={18}>
            <p className="text-[15px] font-normal leading-[29px] tracking-[0.02em] text-black opacity-70 lg:text-[calc(var(--s)*15)] lg:leading-[calc(var(--s)*29)] dark:text-white">
              One fixed price, agreed in writing before work starts, with no
              hourly billing. You own everything we build, and all prices
              exclude GST.{" "}
              <Link href="/pricing" className="font-medium text-setu underline-offset-4 hover:underline">
                See full pricing
              </Link>
            </p>
          </FadeUp>
        </div>

        <Stagger
          stagger={0.12}
          className="mx-auto mt-11 grid max-w-md items-stretch gap-6 md:max-w-none md:grid-cols-2 lg:mt-[calc(var(--s)*45)] lg:grid-cols-3 lg:gap-[calc(var(--s)*34)]"
        >
          {projectPackages.map((plan) => (
            <StaggerItem key={plan.id} className="h-full">
              <PlanCard plan={plan} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
