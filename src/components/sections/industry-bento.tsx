"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import { images } from "@/lib/images";
import { carePlans, LANDING_PAGE_FROM, WEBSITE_FROM } from "@/lib/plans";
import { cn, formatINR } from "@/lib/utils";
import { Counter } from "@/components/ui/counter";
import { DURATION, EASE_OUT } from "@/components/motion/ease";
import {
  FadeUp,
  ImageReveal,
  Parallax,
  SpotlightCard,
  Stagger,
  StaggerItem,
} from "@/components/motion/primitives";
import { TextReveal } from "@/components/motion/text-reveal";

const REASONS = [
  {
    title: "You own everything",
    body: "Domain, code, hosting and every login are in your name from day one. If you move on, you take all of it with you.",
  },
  {
    title: "Designed for phones first",
    body: "We design for small screens first and test on real Android and iOS devices before launch. Images and code are optimised so pages stay quick on mobile data.",
  },
  {
    title: "Ready for Google at launch",
    body: "Page titles, sitemap, Search Console, analytics and enquiry tracking are configured before go-live. Google can index your site from the first day.",
  },
] as const;

/** The first tile (Figma 24:3132): the fixed-price promise, in the pull-quote layout. */
const PROMISE = {
  title: "One fixed price,\nin writing",
  body: "Your quote lists the pages, features, timeline and payment milestones before work begins. New requests are quoted separately, so the price changes only with your sign-off.",
  badge: "₹",
  label: "Written quote",
  detail: "Agreed before work starts",
} as const;

/** Ways to reach the team, sliding in on the support tile (Figma 24:3146). */
const CHANNELS = ["Call", "WhatsApp", "Email"] as const;

const TILE_RADIUS = "rounded-[1.25rem] lg:rounded-[calc(var(--s)*20)]";

/**
 * One bento cell: rises into place with the grid's stagger, then follows the
 * cursor with a soft cyan glow and a few degrees of tilt. The glow sits under
 * the tile, so it shows through the translucent surface rather than over text.
 */
function BentoTile({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <StaggerItem className={cn("h-full", className)}>
      <SpotlightCard tilt={3} glow="rgba(0,161,198,0.32)" className={cn("h-full", TILE_RADIUS)}>
        {children}
      </SpotlightCard>
    </StaggerItem>
  );
}

/** Headline figures, read from the published plans so they never drift. */
const WEBSITE_FROM_K = Math.round(WEBSITE_FROM / 1000);
const CARE_FROM = carePlans[0]?.monthly ?? 8_000;

/** Channel chips slide in one after another once their tile has landed. */
const CHIP_VARIANTS = {
  hidden: { opacity: 0, x: -14, scale: 0.85 },
  shown: (index: number) => ({
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: DURATION.base, ease: EASE_OUT, delay: 0.45 + index * 0.07 },
  }),
};

// Shared tile chrome: Figma tiles are white at ~70% over the band gradient.
const TILE =
  "relative h-full overflow-hidden rounded-[1.25rem] bg-surface/70 lg:rounded-[calc(var(--s)*20)]";

/**
 * Industry band (Figma 24:2610 → 24:2746).
 *
 * A 3-column bento on the 1400px column, laid out as the design's tiles but
 * carrying the reasons a business owner picks us: the fixed-price promise,
 * the starting price and a link to our work on the top row (420px); post-
 * launch support and the "why us" tile (spanning two columns) beneath
 * (444px). Tiles rise in a stagger and respond to the cursor; the figures
 * count up when they scroll into view and the oversized "₹" drifts against
 * the scroll.
 */
export function IndustryBento() {
  return (
    <section
      aria-labelledby="industry-heading"
      className="bg-[linear-gradient(49.26deg,rgba(10,52,166,0.12)_32.85%,rgba(0,161,198,0.12)_105.26%)] py-20 md:py-28 lg:pt-[calc(var(--s)*134)] lg:pb-[calc(var(--s)*178)]"
    >
      <div className="container-figma">
        <div className="text-center">
          <TextReveal
            as="h2"
            id="industry-heading"
            className="mx-auto max-w-[40rem] text-3xl leading-tight font-bold tracking-[-0.04em] text-foreground sm:text-[2.6rem] lg:max-w-[calc(var(--s)*1033)] lg:text-[calc(var(--s)*58)] lg:leading-[calc(var(--s)*72)]"
          >
            {"Websites shaped by how\nyour customers buy."}
          </TextReveal>
          <FadeUp delay={0.35} y={20}>
            <p className="mx-auto mt-5 max-w-xl text-[0.95rem] leading-relaxed text-foreground/70 lg:mt-[calc(var(--s)*21)] lg:max-w-[calc(var(--s)*889)] lg:text-[calc(var(--s)*16)] lg:leading-[calc(var(--s)*32)]">
              A clinic, a school and a manufacturer each win customers
              differently. We study how yours find you and what makes them get
              in touch, then build the site around that.
            </p>
          </FadeUp>
        </div>

        <Stagger
          stagger={0.1}
          className="mt-12 grid gap-4 md:grid-cols-2 lg:mt-[calc(var(--s)*40)] lg:grid-cols-3 lg:grid-rows-[calc(var(--s)*420)_calc(var(--s)*444)] lg:gap-[calc(var(--s)*25)]"
        >
          {/* 1 — Fixed-price promise, in the pull-quote tile (24:2684 / 24:3132). */}
          <BentoTile>
            <figure
              className={`${TILE} flex flex-col p-6 sm:p-8 lg:pt-[calc(var(--s)*50)] lg:pr-[calc(var(--s)*56)] lg:pb-[calc(var(--s)*40)] lg:pl-[calc(var(--s)*62)]`}
            >
              <figcaption className="max-w-[16rem] whitespace-pre-line text-[1.45rem] leading-[1.32] font-semibold tracking-[-0.02em] text-foreground lg:max-w-[calc(var(--s)*283)] lg:text-[calc(var(--s)*28)] lg:leading-[calc(var(--s)*37)]">
                {PROMISE.title}
              </figcaption>
              <p className="mt-4 text-[0.92rem] leading-relaxed text-foreground/70 lg:mt-[calc(var(--s)*15)] lg:max-w-[calc(var(--s)*332)] lg:text-[calc(var(--s)*15)] lg:leading-[calc(var(--s)*24)]">
                {PROMISE.body}
              </p>
              <div className="mt-6 flex items-center gap-3.5 lg:mt-auto lg:gap-[calc(var(--s)*14)]">
                <span
                  aria-hidden
                  className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0a34a6,#00a1c6)] text-xs font-semibold text-white lg:size-[calc(var(--s)*55)] lg:text-[calc(var(--s)*15)]"
                >
                  {PROMISE.badge}
                </span>
                <span>
                  <span className="block text-base leading-6 font-semibold tracking-[-0.01em] text-foreground lg:text-[calc(var(--s)*18)] lg:leading-[calc(var(--s)*24)]">
                    {PROMISE.label}
                  </span>
                  <span className="block text-[0.8rem] leading-6 text-foreground/60 lg:text-[calc(var(--s)*13)] lg:leading-[calc(var(--s)*24)]">
                    {PROMISE.detail}
                  </span>
                </span>
              </div>
            </figure>
          </BentoTile>

          {/* 2 — Starting price (24:2612 / 24:2613 / 24:2734). */}
          <BentoTile>
            <div
              className={`${TILE} flex min-h-[15rem] flex-col justify-between p-7 lg:min-h-0 lg:pt-[calc(var(--s)*60)] lg:pb-[calc(var(--s)*56)] lg:pl-[calc(var(--s)*53)]`}
            >
              {/* Oversized "₹" glyph clipped by the tile (24:2615). */}
              <Parallax
                speed={70}
                className="pointer-events-none absolute top-[-11rem] left-[52%] select-none lg:top-[calc(var(--s)*-367)] lg:left-[calc(var(--s)*225)]"
              >
                <span
                  aria-hidden
                  className="block text-[22rem] leading-[1.366] font-bold text-setu/[0.04] lg:text-[calc(var(--s)*778)]"
                >
                  ₹
                </span>
              </Parallax>
              <span className="relative block text-[4.5rem] leading-none font-bold tracking-[-0.03em] text-foreground lg:text-[calc(var(--s)*88)] lg:leading-[calc(var(--s)*72)]">
                <Counter to={WEBSITE_FROM_K} prefix="₹" suffix="k" />
              </span>
              <div className="relative mt-8 lg:mt-0">
                <p className="max-w-[15rem] text-[1.45rem] leading-[1.32] font-semibold tracking-[-0.02em] text-foreground lg:max-w-[calc(var(--s)*300)] lg:text-[calc(var(--s)*28)] lg:leading-[calc(var(--s)*37)]">
                  Starting price for a full business website
                </p>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-foreground/70 lg:mt-[calc(var(--s)*8)] lg:text-[calc(var(--s)*16)] lg:leading-[calc(var(--s)*26)]">
                  Single-page landing pages from {formatINR(LANDING_PAGE_FROM)}.
                </p>
                <Link
                  href="/pricing"
                  className="mt-3 inline-block text-[0.9rem] font-medium text-setu underline-offset-4 hover:underline lg:mt-[calc(var(--s)*12)] lg:text-[calc(var(--s)*15)]"
                >
                  Compare all packages
                </Link>
              </div>
            </div>
          </BentoTile>

          {/* 3 — Our work, image card (24:2685 / 24:2740). */}
          <BentoTile>
            <Link
              href="/work"
              className={`${TILE} group flex min-h-[15rem] flex-col justify-end bg-[#135b78] p-7 lg:min-h-0 lg:pb-[calc(var(--s)*65)] lg:pl-[calc(var(--s)*63)]`}
            >
              <ImageReveal delay={0.25} className="absolute inset-0">
                <div className="relative h-full w-full">
                  <Image
                    src={images.caseStudyFeature.src}
                    alt={images.caseStudyFeature.alt}
                    fill
                    sizes="(min-width: 1024px) 450px, (min-width: 768px) 50vw, 90vw"
                    className="object-cover transition-[scale] duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                  />
                </div>
              </ImageReveal>
              <div
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(200deg,rgba(10,52,166,0.35)_0%,rgba(0,161,198,0.45)_45%,rgba(4,48,74,0.85)_100%)]"
              />
              <p className="relative max-w-[18rem] text-[1.2rem] leading-[1.55] font-medium text-white lg:max-w-[calc(var(--s)*320)] lg:text-[calc(var(--s)*21)] lg:leading-[calc(var(--s)*33)]">
                Websites, stores and apps, with the brief and approach behind
                each one
              </p>
              <span className="relative mt-6 inline-flex h-10 w-fit items-center rounded-full border-[1.5px] border-white/60 px-[2.1rem] text-[15px] font-semibold text-white transition-[background-color,translate] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5 group-hover:bg-white/15 lg:mt-[calc(var(--s)*28)] lg:h-[calc(var(--s)*40)] lg:px-[calc(var(--s)*34)] lg:text-[calc(var(--s)*15)]">
                See our work
              </span>
            </Link>
          </BentoTile>

          {/* 4 — Post-launch care and local support (24:3140). */}
          <BentoTile>
            <div
              className={`${TILE} flex flex-col p-7 lg:pt-[calc(var(--s)*69)] lg:pr-[calc(var(--s)*49)] lg:pb-[calc(var(--s)*60)] lg:pl-[calc(var(--s)*55)]`}
            >
              <ul className="flex flex-wrap gap-2" aria-label="Ways to reach us">
                {CHANNELS.map((channel, index) => (
                  <motion.li
                    key={channel}
                    custom={index}
                    variants={CHIP_VARIANTS}
                    className="inline-flex h-10 items-center rounded-full bg-[linear-gradient(135deg,#0a34a6,#00a1c6)] px-5 text-sm font-semibold text-white lg:h-[calc(var(--s)*44)] lg:px-[calc(var(--s)*22)] lg:text-[calc(var(--s)*15)]"
                  >
                    {channel}
                  </motion.li>
                ))}
              </ul>
              <span className="mt-10 block text-[4.5rem] leading-none font-bold tracking-[-0.03em] text-foreground lg:mt-auto lg:text-[calc(var(--s)*88)] lg:leading-[calc(var(--s)*72)]">
                <Counter to={3} />
              </span>
              <p className="mt-6 max-w-[21rem] text-base leading-[1.75] text-foreground/70 lg:mt-[calc(var(--s)*29)] lg:max-w-[calc(var(--s)*345)] lg:text-[calc(var(--s)*17)] lg:leading-[calc(var(--s)*30)]">
                Months of support included after launch, on IST working hours.
                Then optional care plans from {formatINR(CARE_FROM)} a month.
              </p>
            </div>
          </BentoTile>

          {/* 5 — Why Setuware Technologies (24:2746), spans two columns. */}
          <BentoTile className="md:col-span-2">
            <div
              className={`${TILE} grid gap-6 p-7 sm:grid-cols-[minmax(0,11rem)_1fr] md:p-8 lg:grid-cols-[calc(var(--s)*274)_calc(var(--s)*522)] lg:gap-0 lg:pt-[calc(var(--s)*51)] lg:pr-[calc(var(--s)*67)] lg:pb-[calc(var(--s)*62)] lg:pl-[calc(var(--s)*62)]`}
            >
              <h3 className="text-[1.45rem] leading-[1.36] font-semibold tracking-[-0.02em] text-foreground lg:pr-[calc(var(--s)*24)] lg:text-[calc(var(--s)*28)] lg:leading-[calc(var(--s)*38)]">
                What every build includes
              </h3>

              <dl className="flex flex-col lg:pt-[calc(var(--s)*2)]">
                {REASONS.map((reason, index) => (
                  <div
                    key={reason.title}
                    className={
                      index > 0
                        ? "mt-5 border-t border-foreground/10 pt-5 lg:mt-[calc(var(--s)*20)] lg:pt-[calc(var(--s)*20)]"
                        : undefined
                    }
                  >
                    <dt className="text-[1.05rem] leading-[1.45] font-semibold text-foreground lg:text-[calc(var(--s)*18)] lg:leading-[calc(var(--s)*26)]">
                      {reason.title}
                    </dt>
                    <dd className="mt-1.5 text-[0.95rem] leading-relaxed text-foreground/70 lg:mt-[calc(var(--s)*7)] lg:text-[calc(var(--s)*16)] lg:leading-[calc(var(--s)*25)]">
                      {reason.body}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </BentoTile>
        </Stagger>
      </div>
    </section>
  );
}
