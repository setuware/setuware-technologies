import Link from "next/link";

import { projectPackages, type Plan } from "@/lib/plans";
import { cn, formatINR } from "@/lib/utils";
import { Reveal } from "@/components/ui/reveal";

/**
 * "Flexible plans" (Figma 24:2682, 24:2733 and cards 24:3062 / 24:3000 / 24:3031).
 *
 * Enterprise is quoted rather than priced, which is why `setupFrom` of 0
 * drops the price block and swaps the call to action to a call booking — a
 * ₹0 price would read as free.
 */

/**
 * Card copy as it reads in the design. The shared plan data also feeds the
 * pricing page, so the wording differences are applied here rather than by
 * rewriting that data.
 */
const DESIGN_COPY: Record<string, { tagline?: string; features?: readonly string[] }> = {
  "website-build": { tagline: "Fast, SEO-ready business website." },
  "full-application-build": {
    features: [
      "Full-stack development",
      "Cloud infrastructure",
      "Admin dashboard",
      "6 - 8 months support",
      "Pause or cancel anytime",
    ],
  },
};

/** Figma vector 24:3073 — a 12.65 × 9.48 tick. */
function CheckGlyph() {
  return (
    <svg
      viewBox="0 0 13 10"
      fill="none"
      aria-hidden
      className="h-[9.5px] w-[12.65px] shrink-0 lg:h-[calc(var(--s)*9.482)] lg:w-[calc(var(--s)*12.653)]"
    >
      <path
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
    <article
      className={cn(
        "flex h-full flex-col rounded-[20px] border border-[rgba(0,161,198,0.15)] px-7 pb-10 pt-8 text-black transition-[transform,box-shadow] duration-300 ease-out hover:shadow-[0_24px_48px_-24px_rgba(0,161,198,0.45)] motion-safe:hover:-translate-y-2 dark:text-white",
        "lg:min-h-[calc(var(--s)*621)] lg:rounded-[calc(var(--s)*20)] lg:px-[calc(var(--s)*54)] lg:pb-[calc(var(--s)*58)] lg:pt-[calc(var(--s)*40)]",
        plan.highlight
          ? "bg-[linear-gradient(125deg,#d6def1_0%,#d4e7f4_48%,#d3dbf0_100%)] dark:bg-[linear-gradient(125deg,#1b2c4a_0%,#16384a_48%,#1a2744_100%)]"
          : "bg-[rgba(235,239,248,0.54)] dark:bg-white/5",
      )}
    >
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
            What&apos;s Included:
          </p>
          <ul className="flex flex-col gap-2 lg:gap-[calc(var(--s)*8)]">
            {features.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-4 text-[16px] font-medium leading-[28px] lg:gap-[calc(var(--s)*16)] lg:text-[calc(var(--s)*16)] lg:leading-[calc(var(--s)*28)]"
              >
                <CheckGlyph />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {quoted ? null : (
          <div className="flex flex-col">
            <p className="text-[14px] font-normal leading-[29px] tracking-[0.02em] opacity-70 lg:text-[calc(var(--s)*14)] lg:leading-[calc(var(--s)*29)]">
              Starts from
            </p>
            <p className="text-[34px] font-extrabold leading-[normal] tracking-[-0.03em] lg:text-[calc(var(--s)*39)]">
              {formatINR(plan.setupFrom ?? 0).replace("₹", "Rs. ")}
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
        {quoted ? "Book a Call" : "Get Started"}
      </Link>
    </article>
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
          <h2
            id="flexible-plans-title"
            className="text-[40px] font-bold leading-[1.2] tracking-[-0.02em] text-black sm:text-[48px] lg:text-[calc(var(--s)*56)] lg:leading-[calc(var(--s)*72)] dark:text-white"
          >
            Flexible plans
          </h2>
          <p className="text-[15px] font-normal leading-[29px] tracking-[0.02em] text-black opacity-70 lg:text-[calc(var(--s)*15)] lg:leading-[calc(var(--s)*29)] dark:text-white">
            We&rsquo;ve got you covered. Whether you&rsquo;re here for the long game
            or a sharp one-off.
          </p>
        </div>

        <div className="mx-auto mt-11 grid max-w-md items-stretch gap-6 md:max-w-none md:grid-cols-2 lg:mt-[calc(var(--s)*45)] lg:grid-cols-3 lg:gap-[calc(var(--s)*34)]">
          {projectPackages.map((plan, index) => (
            <Reveal key={plan.id} delay={index * 120} className="h-full">
              <PlanCard plan={plan} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
