"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

import { processSteps } from "@/lib/content";
import { FadeUp, useReducedMotionSafe } from "@/components/motion/primitives";
import { TextReveal } from "@/components/motion/text-reveal";
import { DarkSectionBackdrop } from "@/components/sections/services-dark";

/**
 * "A refined process built on clarity".
 *
 * One row per stage: number, name and a one-line description. Deliverables
 * and durations stay on the /process page; the homepage gives the outline.
 *
 * Motion: a progress rail draws down the timeline as you scroll (scrubbed,
 * spring-smoothed), and each row lights up as the rail reaches it — its top
 * rule draws across in the brand colour, the step number turns on and a node
 * fills on the rail. Lighting only ever adds emphasis: an unlit row is the
 * original design at full contrast, so nothing is hidden before hydration or
 * from reduced-motion visitors (who get every row lit).
 */
export function ProcessDark() {
  const listRef = useRef<HTMLDListElement>(null);
  const reduce = useReducedMotionSafe();
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 75%", "end 55%"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });
  const full = useMotionValue(1);
  const progress = reduce ? full : smooth;

  return (
    <section
      id="process"
      className="relative overflow-hidden bg-black pb-24 pt-4 md:pb-32"
    >
      {/* Lower end of Figma 24:2647, continuing the services backdrop. */}
      <DarkSectionBackdrop position="bottom" />

      <div className="container-page relative">
        <div className="mx-auto max-w-2xl text-center">
          <TextReveal
            as="h2"
            className="font-display text-3xl font-semibold leading-tight text-white sm:text-[2.6rem]"
          >
            A refined process built on clarity
          </TextReveal>
          <FadeUp delay={0.25} y={20}>
            <p className="mx-auto mt-5 max-w-xl text-[0.92rem] leading-relaxed text-white/60">
              A structured delivery model that keeps every project on time, on
              budget and fully transparent.
            </p>
          </FadeUp>
        </div>

        <dl ref={listRef} className="relative mx-auto mt-14 max-w-5xl">
          {/* Progress rail, in the gutter left of the rows on wide screens. */}
          <div
            className="pointer-events-none absolute inset-y-0 -left-12 hidden w-px bg-white/10 xl:block"
            aria-hidden
          >
            <motion.div
              className="absolute inset-0 origin-top bg-[linear-gradient(to_bottom,var(--color-setu),color-mix(in_oklab,var(--color-setu)_40%,white))]"
              style={{ scaleY: progress }}
            />
          </div>

          {processSteps.map((step, index) => (
            <ProcessRow
              key={step.step}
              step={step}
              index={index}
              count={processSteps.length}
              progress={progress}
            />
          ))}
        </dl>
      </div>
    </section>
  );
}

function ProcessRow({
  step,
  index,
  count,
  progress,
}: {
  step: (typeof processSteps)[number];
  index: number;
  count: number;
  progress: MotionValue<number>;
}) {
  // The rail tip reaches this row's middle at (index + 0.5) / count.
  const at = (index + 0.5) / count;
  const lit = useTransform(progress, [at - 0.6 / count, at], [0, 1]);
  const nodeScale = useTransform(lit, [0, 1], [0.4, 1]);
  const titleX = useTransform(lit, [0, 1], [0, 6]);

  return (
    <FadeUp
      delay={Math.min(index, 4) * 0.05}
      y={24}
      className="relative grid items-center gap-2 border-t border-white/10 py-5 md:grid-cols-[16rem_1fr] md:gap-6"
    >
      <dt className="flex items-center gap-4 text-[1rem] font-medium text-white">
        {/* Decorations live inside the <dt> (a <dl> group may only hold
            dt/dd) but are positioned against the whole row. */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-px h-px origin-left bg-[linear-gradient(90deg,var(--color-setu),transparent)]"
          style={{ scaleX: lit }}
        />
        <motion.span
          aria-hidden
          className="pointer-events-none absolute -left-12 top-1/2 -mt-[5px] -ml-[5px] hidden size-2.5 rounded-full bg-setu shadow-[0_0_14px_rgba(0,161,198,0.8)] xl:block"
          style={{ scale: nodeScale, opacity: lit }}
        />
        {/* The lit copy is drawn with CSS generated content so the number
            exists once in the text and accessibility trees. */}
        <span className="relative font-mono text-[0.7rem] text-white/55">
          {step.step}
          <motion.span
            aria-hidden
            data-step={step.step}
            className="absolute inset-0 text-setu before:content-[attr(data-step)]"
            style={{ opacity: lit }}
          />
        </span>
        <motion.span style={{ x: titleX }}>{step.title}</motion.span>
      </dt>

      <dd className="text-[0.88rem] leading-relaxed text-white/60">
        {step.description}
      </dd>
    </FadeUp>
  );
}
