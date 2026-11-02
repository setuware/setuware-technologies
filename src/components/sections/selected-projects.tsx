"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

import { featuredCaseStudies } from "@/lib/content";
import { images } from "@/lib/images";
import { ImageReveal, Magnetic, SpotlightCard, useReducedMotionSafe } from "@/components/motion/primitives";
import { TextReveal } from "@/components/motion/text-reveal";

/**
 * The cards fanned out behind the lead project (Figma 24:2617, 24:3152–24:3156),
 * back to front. Offsets are distances from the front card's top edge, in
 * Figma pixels; the coloured band stands in for each card's cover image.
 *
 * `tuck` is how far (as a share of the card's own height) each card starts
 * pushed down behind the front card, and `tilt` the angle it starts at; both
 * scrub to zero as the stack scrolls into place.
 */
const BACK_CARDS = [
  {
    // 24:2617 / 24:3152 — 926 wide, 131 above the front card.
    className:
      "top-0 inset-x-[11%] h-28 bg-[#f1f1f1] lg:inset-x-[calc(var(--s)*137)] lg:h-[calc(var(--s)*437)]",
    cover: "bg-[#c9d3f1]",
    tuck: 30,
    tilt: -3.2,
  },
  {
    // 24:3153 / 24:3154 — 1010 wide, 89 above.
    className:
      "top-3 inset-x-[7.5%] h-28 bg-[#f9f9f9] lg:top-[calc(var(--s)*42)] lg:inset-x-[calc(var(--s)*95)] lg:h-[calc(var(--s)*477)]",
    cover:
      "bg-[linear-gradient(90deg,#ea6f98_0%,#b56ae2_38%,#00b4de_68%,#08131c_100%)]",
    tuck: 19,
    tilt: 2.4,
  },
  {
    // 24:3155 / 24:3156 — 1124 wide, 47 above.
    className:
      "top-6 inset-x-[3%] h-28 bg-[#f9f9f9] lg:top-[calc(var(--s)*84)] lg:inset-x-[calc(var(--s)*38)] lg:h-[calc(var(--s)*531)]",
    cover: "bg-[linear-gradient(90deg,#e6f6f5_0%,#eef2f8_45%,#f6d4ec_100%)]",
    tuck: 9,
    tilt: -1.4,
  },
] as const;

const CARD_SHADOW =
  "shadow-[0_18px_50px_-18px_rgba(10,20,40,0.18)] lg:shadow-[0_calc(var(--s)*20)_calc(var(--s)*60)_calc(var(--s)*-20)_rgba(10,20,40,0.18)]";

/**
 * "Selected Projects" (Figma 24:2681 → 24:3161, button 24:3105).
 *
 * The lead project sits on a stack of offset cards. The cards behind are
 * decorative and `aria-hidden`, so the stack reads as one item. Their motion
 * is scrubbed by scroll (through a spring, so a flick of the wheel still
 * lands softly): each layer starts tucked and slightly askew behind the front
 * card and settles into the fan as the stack reaches the middle of the view.
 */

type BackCard = (typeof BACK_CARDS)[number];

function FanCard({
  card,
  progress,
  reduce,
}: {
  card: BackCard;
  progress: MotionValue<number>;
  reduce: boolean;
}) {
  const y = useTransform(progress, [0, 1], [`${card.tuck}%`, "0%"]);
  const rotate = useTransform(progress, [0, 1], [card.tilt, 0]);
  const scale = useTransform(progress, [0, 1], [0.96, 1]);

  return (
    <motion.div
      aria-hidden
      className={`absolute origin-bottom overflow-hidden rounded-[1.25rem] will-change-transform lg:rounded-[calc(var(--s)*20)] ${CARD_SHADOW} ${card.className}`}
      style={reduce ? undefined : { y, rotate, scale }}
    >
      <div
        className={`h-full w-[49%] lg:h-[calc(var(--s)*442)] lg:w-[calc(var(--s)*589)] ${card.cover}`}
      />
    </motion.div>
  );
}

export function SelectedProjects() {
  const lead = featuredCaseStudies[0];
  const stackRef = React.useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionSafe() ?? false;
  const { scrollYProgress } = useScroll({
    target: stackRef,
    offset: ["start end", "center 0.6"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.6 });
  // The whole stack rises a little while the layers fan out of it, so the
  // back cards travel further than the front one and the stack reads as depth.
  const stackY = useTransform(progress, [0, 1], [56, 0]);

  return (
    <section
      id="work"
      aria-labelledby="projects-heading"
      className="relative overflow-hidden bg-background py-20 md:py-28 lg:pt-[calc(var(--s)*139)] lg:pb-[calc(var(--s)*124)]"
    >
      <div className="container-figma">
        <TextReveal
          as="h2"
          id="projects-heading"
          className="text-center text-3xl leading-tight font-bold tracking-[-0.04em] text-foreground sm:text-[2.6rem] lg:text-[calc(var(--s)*58)] lg:leading-[calc(var(--s)*72)]"
        >
          Selected work
        </TextReveal>

        <motion.div
          ref={stackRef}
          style={reduce ? undefined : { y: stackY }}
          // flow-root keeps the front card's top margin inside the stack;
          // collapsed through it, the back cards had no room to fan into.
          className="relative mx-auto mt-12 flow-root max-w-[75rem] lg:mt-[calc(var(--s)*41)] lg:w-[calc(var(--s)*1200)] lg:max-w-none"
        >
          {/* Soft cyan glow behind the stack (24:2609). */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-[calc(var(--s)*362)] left-[calc(var(--s)*252)] hidden h-[calc(var(--s)*715)] w-[calc(var(--s)*1151)] rounded-full bg-[radial-gradient(closest-side,rgba(0,161,198,0.09),transparent)] lg:block"
          />

          {BACK_CARDS.map((card) => (
            <FanCard key={card.cover} card={card} progress={progress} reduce={reduce} />
          ))}

          {/* Front card (24:3157 / 24:3158). */}
          <SpotlightCard
            as="article"
            tilt={2}
            glow="rgba(0,161,198,0.12)"
            className={`group/card mt-9 grid overflow-hidden rounded-[1.25rem] bg-surface md:grid-cols-[49%_1fr] lg:mt-[calc(var(--s)*131)] lg:h-[calc(var(--s)*560)] lg:grid-cols-[calc(var(--s)*589)_1fr] lg:rounded-[calc(var(--s)*20)] ${CARD_SHADOW}`}
          >
            <div className="relative min-h-[18rem] bg-[linear-gradient(150deg,#9fb3b8,#d7dfe0)]">
              <ImageReveal delay={0.15} className="absolute inset-0">
                <div className="relative h-full w-full">
                  <Image
                    src={images.projectMedicare.src}
                    // Decorative: the title beside it names the project, and
                    // the slot's own alt describes a different placeholder.
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 589px, (min-width: 768px) 50vw, 90vw"
                    className="object-cover transition-[scale] duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:scale-[1.04]"
                  />
                </div>
              </ImageReveal>
            </div>

            <div className="flex flex-col p-7 md:p-9 lg:pt-[calc(var(--s)*57)] lg:pr-[calc(var(--s)*46)] lg:pb-[calc(var(--s)*73)] lg:pl-[calc(var(--s)*79)]">
              <p className="mb-3 text-[0.8rem] font-semibold tracking-[0.08em] text-setu uppercase lg:mb-[calc(var(--s)*12)] lg:text-[calc(var(--s)*13)]">
                {lead.sector}
              </p>
              <h3 className="max-w-[24rem] text-[1.6rem] leading-[1.36] font-semibold tracking-normal text-foreground lg:max-w-[calc(var(--s)*426)] lg:text-[calc(var(--s)*33)] lg:leading-[calc(var(--s)*45)]">
                {lead.title}
              </h3>
              <p className="mt-4 max-w-[30rem] text-[0.95rem] leading-[1.9] tracking-[0.02em] text-foreground/70 lg:mt-[calc(var(--s)*17)] lg:max-w-[calc(var(--s)*485)] lg:text-[calc(var(--s)*15)] lg:leading-[calc(var(--s)*29)]">
                {lead.summary}
              </p>

              <Magnetic strength={0.25} className="mt-8 w-fit lg:mt-auto">
                <Link
                  href={`/work/${lead.slug}`}
                  className="group/btn inline-flex h-10 w-fit items-center gap-2.5 rounded-full border-[1.5px] border-foreground px-6 text-[15px] font-semibold text-foreground transition-colors hover:bg-foreground hover:text-background lg:h-[calc(var(--s)*40)] lg:gap-[calc(var(--s)*10)] lg:px-[calc(var(--s)*26)] lg:text-[calc(var(--s)*15)]"
                >
                  Read the case study
                  <ArrowUpRight
                    className="size-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 lg:size-[calc(var(--s)*18)]"
                    aria-hidden
                  />
                </Link>
              </Magnetic>
            </div>
          </SpotlightCard>
        </motion.div>

        {/* "See all projects" pill (24:3105). */}
        <div className="mt-10 flex justify-center lg:mt-[calc(var(--s)*70)]">
          <Magnetic>
            <Link
              href="/work"
              className="inline-flex h-10 min-w-[14.4rem] items-center justify-center rounded-full bg-black px-8 text-[15px] font-semibold text-white transition-colors hover:bg-setu dark:bg-foreground dark:text-background lg:h-[calc(var(--s)*40)] lg:w-[calc(var(--s)*230)] lg:min-w-0 lg:px-0 lg:text-[calc(var(--s)*15)]"
            >
              See all projects
            </Link>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
