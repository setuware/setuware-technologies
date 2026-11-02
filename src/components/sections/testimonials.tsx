"use client";

import { useCallback, useState } from "react";
import { Check } from "lucide-react";
import {
  AnimatePresence,
  motion,
  type Variants,
} from "framer-motion";

import { testimonials, type Testimonial } from "@/lib/content";
import { cn } from "@/lib/utils";
import { EASE_OUT, VIEWPORT } from "@/components/motion/ease";
import { TextReveal } from "@/components/motion/text-reveal";
import { Magnetic, SpotlightCard, Stagger, StaggerItem, useReducedMotionSafe } from "@/components/motion/primitives";

/**
 * "Real words, real people" (Figma 24:2680, cards 24:2900, pager 24:2997,
 * glow 24:2606).
 *
 * A rotating carousel: the arrows move the first visible card by one, and the
 * order wraps, so every testimonial can lead on any screen width — three are
 * visible on desktop, two on tablets and one on phones.
 *
 * Each visible slot cross-fades on its own: the outgoing card is popped out of
 * layout and drifts away while the incoming one springs in from the side the
 * carousel is travelling from, slot by slot.
 */

/** Figma 24:2907 — the opening quote mark, top-left of every card. */
function QuoteMark() {
  return (
    <svg
      viewBox="0 0 49 49"
      aria-hidden
      className="size-10 text-setu/70 lg:size-[calc(var(--s)*49)]"
    >
      <path
        fill="currentColor"
        d="M17.6 2.4c-6.4 1.6-11.6 6.7-11.6 15.2V26h11.2V15H11c.3-4.4 3-7.1 7.4-8.3l-.8-4.3Zm18 0c-6.4 1.6-11.6 6.7-11.6 15.2V26h11.2V15H29c.3-4.4 3-7.1 7.4-8.3l-.8-4.3Z"
      />
    </svg>
  );
}

const STAR_PATH =
  "M9 0.6l2.47 5.04 5.53.8-4 3.92.94 5.5L9 13.27l-4.94 2.6.94-5.5-4-3.92 5.53-.8L9 .6Z";

/**
 * Figma 24:2913 — one of five 17.29 × 16.53 stars. A faint outline star sits
 * underneath; the gold one wipes in left to right over it.
 */
function StarGlyph({ index }: { index: number }) {
  const reduce = useReducedMotionSafe();
  return (
    <span className="relative inline-block h-[16.5px] w-[17.3px] lg:h-[calc(var(--s)*16.527)] lg:w-[calc(var(--s)*17.291)]">
      <svg viewBox="0 0 18 17" aria-hidden className="absolute inset-0 size-full">
        <path fill="#ffb21e" fillOpacity={0.2} d={STAR_PATH} />
      </svg>
      <motion.svg
        viewBox="0 0 18 17"
        aria-hidden
        className="absolute inset-0 size-full"
        // Same initial state on server and client (no hydration drift); with
        // reduced motion the fill simply lands instantly.
        initial={{ clipPath: "inset(0% 100% 0% 0%)", scale: 0.6 }}
        whileInView={{ clipPath: "inset(0% 0% 0% 0%)", scale: 1 }}
        viewport={VIEWPORT}
        transition={
          reduce
            ? { duration: 0 }
            : {
                clipPath: { duration: 0.5, ease: EASE_OUT, delay: 0.25 + index * 0.09 },
                scale: {
                  type: "spring",
                  stiffness: 420,
                  damping: 14,
                  delay: 0.25 + index * 0.09,
                },
              }
        }
      >
        <path fill="#ffb21e" d={STAR_PATH} />
      </motion.svg>
    </span>
  );
}

function ArrowGlyph({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 30 23"
      fill="none"
      aria-hidden
      className={cn(
        "h-[21px] w-[27px] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:h-[calc(var(--s)*23)] lg:w-[calc(var(--s)*30)]",
        direction === "left"
          ? "-scale-x-100 group-hover:-translate-x-1"
          : "group-hover:translate-x-1",
      )}
    >
      <path
        d="M1.5 11.5h26M18 2l9.5 9.5L18 21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TestimonialCard({
  testimonial,
  position,
  total,
}: {
  testimonial: Testimonial;
  position: number;
  total: number;
}) {
  return (
    <SpotlightCard
      tilt={4}
      className="h-full rounded-[20px] border border-white/70 bg-[linear-gradient(180deg,#ebf4f9_0%,#ebeff8_100%)] text-black dark:border-white/10 dark:bg-[linear-gradient(180deg,#121a2b_0%,#10172a_100%)] dark:text-white lg:rounded-[calc(var(--s)*20)]"
    >
      <figure
        role="group"
        aria-roledescription="slide"
        aria-label={`${position} of ${total}`}
        className="relative flex h-full flex-col px-7 pb-10 pt-8 lg:min-h-[calc(var(--s)*529)] lg:px-[calc(var(--s)*49)] lg:pb-[calc(var(--s)*55)] lg:pt-[calc(var(--s)*42)]"
      >
        <QuoteMark />

        <div
          className="mt-4 flex gap-[6.9px] lg:mt-[calc(var(--s)*21)] lg:gap-[calc(var(--s)*6.886)]"
          role="img"
          aria-label="Rated 5 out of 5"
        >
          {Array.from({ length: 5 }, (_, star) => (
            <StarGlyph key={star} index={star} />
          ))}
        </div>

        <blockquote className="mt-4 max-w-[342px] text-[15px] font-normal leading-[27px] tracking-[0.02em] opacity-70 lg:mt-[calc(var(--s)*16.5)] lg:min-h-[calc(var(--s)*162)] lg:max-w-[calc(var(--s)*342)] lg:text-[calc(var(--s)*15)] lg:leading-[calc(var(--s)*27)]">
          &ldquo;{testimonial.quote}&rdquo;
        </blockquote>

        <figcaption className="mt-6 flex flex-col gap-1.5 lg:mt-[calc(var(--s)*24)] lg:gap-[calc(var(--s)*6)]">
          <span className="text-[18px] font-extrabold leading-[25px] tracking-[-0.02em] lg:text-[calc(var(--s)*18)] lg:leading-[calc(var(--s)*25)]">
            {testimonial.author}
          </span>
          <span className="text-[14px] font-normal leading-[19px] opacity-50 lg:text-[calc(var(--s)*14)] lg:leading-[calc(var(--s)*19)]">
            {testimonial.role}, {testimonial.company}
          </span>
        </figcaption>

        <div className="mt-8 flex items-end justify-between gap-4 pt-0 lg:mt-auto">
          {/* Client logo slot (Figma 24:2928) — the logo artwork is not in the repo. */}
          <span
            aria-hidden
            className="flex h-[31px] max-w-[100px] items-center truncate text-[17px] font-extrabold tracking-[-0.03em] opacity-25 lg:h-[calc(var(--s)*31)] lg:max-w-[calc(var(--s)*110)] lg:text-[calc(var(--s)*18)]"
          >
            {testimonial.company.split(" ")[0]}
          </span>

          <ul className="flex w-[186px] flex-col gap-3.5 lg:w-[calc(var(--s)*186)] lg:gap-[calc(var(--s)*14)]">
            {testimonial.outcomes.map((outcome) => (
              <li
                key={outcome}
                className="flex items-center gap-2.5 text-[14px] font-medium leading-4 lg:gap-[calc(var(--s)*10)] lg:text-[calc(var(--s)*14)] lg:leading-[calc(var(--s)*16)]"
              >
                <Check
                  className="size-4 shrink-0 text-setu lg:size-[calc(var(--s)*16)]"
                  strokeWidth={2.5}
                  aria-hidden
                />
                {outcome}
              </li>
            ))}
          </ul>
        </div>
      </figure>
    </SpotlightCard>
  );
}

/** `custom` is the travel direction: 1 = next, -1 = previous. */
const slideVariants: Variants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction * 56,
    scale: 0.97,
    filter: "blur(6px)",
  }),
  center: { opacity: 1, x: 0, scale: 1, filter: "blur(0px)" },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction * -40,
    scale: 0.97,
    filter: "blur(6px)",
  }),
};

export function Testimonials() {
  const total = testimonials.length;
  const [start, setStart] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const reduce = useReducedMotionSafe();

  const go = useCallback(
    (step: 1 | -1) => {
      setDirection(step);
      setStart((current) => (current + step + total) % total);
    },
    [total],
  );

  const ordered = Array.from({ length: total }, (_, index) => {
    const at = (start + index) % total;
    return { testimonial: testimonials[at], position: at + 1 };
  });

  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-title"
      className="relative isolate overflow-hidden bg-background pb-20 pt-20 md:pt-28 lg:pb-[calc(var(--s)*40)] lg:pt-[calc(var(--s)*140)]"
    >
      {/* Glow (Figma 24:2606): a soft blue wash behind the title and cards. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(50%_40%_at_88%_8%,rgba(176,203,233,0.55),transparent_70%),radial-gradient(45%_32%_at_32%_72%,rgba(196,220,240,0.5),transparent_80%)] dark:opacity-25"
      />

      <div className="container-figma">
        <TextReveal
          id="testimonials-title"
          className="text-center text-[40px] font-bold leading-[1.2] tracking-[-0.02em] text-black sm:text-[48px] lg:text-[calc(var(--s)*56)] lg:leading-[calc(var(--s)*72)] dark:text-white"
        >
          What clients say
        </TextReveal>

        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Client testimonials"
          className="mt-10 lg:mt-[calc(var(--s)*50)]"
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              go(-1);
            } else if (event.key === "ArrowRight") {
              event.preventDefault();
              go(1);
            }
          }}
        >
          <Stagger
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-[calc(var(--s)*31)]"
            stagger={0.12}
          >
            {ordered.map(({ testimonial, position }, index) => (
              <StaggerItem
                key={index}
                y={56}
                className={cn(
                  "relative",
                  index >= 1 && "hidden md:block",
                  index >= 2 && "md:hidden lg:block",
                  index >= 3 && "lg:hidden",
                )}
              >
                <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                  <motion.div
                    key={testimonial.author}
                    className="h-full"
                    custom={direction}
                    variants={slideVariants}
                    initial={reduce ? false : "enter"}
                    animate="center"
                    exit={reduce ? undefined : "exit"}
                    transition={{
                      x: { type: "spring", stiffness: 220, damping: 28, mass: 0.9, delay: index * 0.06 },
                      scale: { type: "spring", stiffness: 220, damping: 28, delay: index * 0.06 },
                      opacity: { duration: 0.45, ease: EASE_OUT, delay: index * 0.06 },
                      filter: { duration: 0.45, ease: EASE_OUT, delay: index * 0.06 },
                    }}
                  >
                    <TestimonialCard
                      testimonial={testimonial}
                      position={position}
                      total={total}
                    />
                  </motion.div>
                </AnimatePresence>
              </StaggerItem>
            ))}
          </Stagger>

          <p className="sr-only" aria-live="polite">
            Showing testimonial {start + 1} of {total}
          </p>

          {/* Pager (Figma 24:2997): two 30px arrows 31px apart; the 44px hit
              areas overlap that gap, hence the smaller flex gap. */}
          <div className="mt-10 flex items-center justify-center gap-4 lg:mt-[calc(var(--s)*53.5)] lg:gap-[calc(var(--s)*17)]">
            <Magnetic strength={0.3}>
              <motion.button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous testimonial"
                whileTap={reduce ? undefined : { scale: 0.9 }}
                className="group inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-black/30 transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-setu dark:text-white/40 dark:hover:text-white"
              >
                <ArrowGlyph direction="left" />
              </motion.button>
            </Magnetic>
            <Magnetic strength={0.3}>
              <motion.button
                type="button"
                onClick={() => go(1)}
                aria-label="Next testimonial"
                whileTap={reduce ? undefined : { scale: 0.9 }}
                className="group inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-black transition-colors hover:text-setu focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-setu dark:text-white"
              >
                <ArrowGlyph direction="right" />
              </motion.button>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}
