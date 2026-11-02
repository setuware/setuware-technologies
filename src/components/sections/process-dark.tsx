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
import { cn } from "@/lib/utils";
import { FadeUp, useReducedMotionSafe } from "@/components/motion/primitives";
import { TextReveal } from "@/components/motion/text-reveal";
import { LIGHT_CARD_SHADOW, LightSectionBackdrop } from "@/components/sections/services-dark";

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
      className="relative isolate overflow-hidden border-t border-border bg-background py-20 md:py-28"
    >
      <LightSectionBackdrop variant="process" />

      <div className="container-page relative">
        <div className="mx-auto max-w-2xl text-center">
          <TextReveal
            as="h2"
            className="font-display text-3xl font-semibold leading-tight text-foreground sm:text-[2.6rem]"
          >
            A refined process built on clarity
          </TextReveal>
          <FadeUp delay={0.25} y={20}>
            <p className="mx-auto mt-5 max-w-xl text-[0.95rem] leading-relaxed text-muted-foreground">
              A structured delivery model that keeps every project on time, on
              budget and fully transparent.
            </p>
          </FadeUp>
        </div>

        <div className="relative mx-auto mt-14 max-w-5xl">
          {/* Progress rail, in the gutter left of the rows on wide screens. */}
          <div
            className="pointer-events-none absolute inset-y-6 -left-12 hidden w-0.5 rounded-full bg-border xl:block"
            aria-hidden
          >
            <motion.div
              className="absolute inset-0 origin-top rounded-full bg-[linear-gradient(to_bottom,var(--color-setu),#0061a8)] shadow-[0_0_12px_rgba(0,161,198,0.45)]"
              style={{ scaleY: progress }}
            />
          </div>

          {/* The rows sit in one elevated white panel, divided by hairlines. */}
          <dl
            ref={listRef}
            className={cn(
              "overflow-hidden rounded-[1.4rem] border border-border bg-surface",
              LIGHT_CARD_SHADOW,
            )}
          >
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
      className="relative grid items-center gap-2 border-t border-border px-5 py-5 first:border-t-0 sm:px-7 md:grid-cols-[17rem_1fr] md:gap-6 md:py-6"
    >
      <dt className="flex items-center gap-4 text-[1rem] font-semibold text-foreground">
        {/* Decorations live inside the <dt> (a <dl> group may only hold
            dt/dd) but are positioned against the whole row. */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left bg-[linear-gradient(90deg,var(--color-setu),rgba(0,97,168,0.35)_60%,transparent)]"
          style={{ scaleX: lit }}
        />
        <motion.span
          aria-hidden
          className="pointer-events-none absolute -left-12 top-1/2 -mt-[6px] -ml-[5px] hidden size-3 rounded-full bg-setu shadow-[0_0_0_4px_var(--background),0_0_14px_rgba(0,161,198,0.7)] xl:block"
          style={{ scale: nodeScale, opacity: lit }}
        />
        {/* The lit copy is drawn with CSS generated content so the number
            exists once in the text and accessibility trees. */}
        <span className="relative inline-flex h-7 min-w-10 items-center justify-center rounded-full border border-border bg-[#f6f9fc] px-2.5 font-mono text-[0.7rem] font-medium text-muted-foreground dark:bg-surface-2">
          {step.step}
          <motion.span
            aria-hidden
            data-step={step.step}
            className="absolute -inset-px flex items-center justify-center rounded-full border border-setu/40 bg-[#e8f7fb] text-[#007a96] before:content-[attr(data-step)] dark:bg-[#0b2a33] dark:text-setu"
            style={{ opacity: lit }}
          />
        </span>
        <motion.span style={{ x: titleX }}>{step.title}</motion.span>
      </dt>

      <dd className="text-[0.9rem] leading-relaxed text-muted-foreground">
        {step.description}
      </dd>
    </FadeUp>
  );
}
