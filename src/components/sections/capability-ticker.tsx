"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from "framer-motion";

import { capabilities } from "@/lib/capabilities";
import { useReducedMotionSafe } from "@/components/motion/primitives";

/** Seconds for one full loop at rest (one copy of the list). */
const LOOP_SECONDS = 52;
/** Extra speed multiplier at a brisk scroll (~2000 px/s). */
const MAX_BOOST = 5;
/** Lean, in degrees, at that same scroll speed. */
const MAX_SKEW = 5;

/**
 * Capability ticker.
 *
 * Sits directly under the hero as a continuous scrolling band. A marquee
 * rather than a static row because the list is longer than any viewport —
 * eight capabilities would otherwise either wrap into a block or get cut off.
 *
 * The band is driven by scroll velocity: idle it drifts, a flick of the wheel
 * speeds it up and leans the type into the motion, and the direction follows
 * the scroll direction. Transform-only, and the frame loop does no work while
 * the band is off screen. It pauses under the pointer and while a link inside
 * has keyboard focus; reduced-motion visitors get a still row.
 */
export function CapabilityTicker() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef);
  const reduce = useReducedMotionSafe();
  const paused = useRef(false);
  const direction = useRef(1);

  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const boost = useTransform(velocity, [-2000, 0, 2000], [-MAX_BOOST, 0, MAX_BOOST], {
    clamp: false,
  });
  const skewX = useTransform(velocity, [-2000, 0, 2000], [-MAX_SKEW, 0, MAX_SKEW]);

  // Offset in percent of the track. The track holds two copies of the list,
  // so wrapping at -50% leaves no visible seam.
  const offset = useMotionValue(0);
  const x = useTransform(offset, (value) => `${wrap(-50, 0, value)}%`);

  useAnimationFrame((_, delta) => {
    if (reduce || !inView) return;
    const b = boost.get();
    if (b < -0.05) direction.current = -1;
    else if (b > 0.05) direction.current = 1;
    const base = paused.current ? 0 : 50 / LOOP_SECONDS;
    const speed = base * direction.current * (1 + Math.abs(b));
    offset.set(offset.get() - speed * (delta / 1000));
  });

  const items = capabilities.map((capability) => (
    <span key={capability.label} className="flex items-center">
      <Link
        href={capability.href}
        className="whitespace-nowrap px-6 text-[0.82rem] text-foreground/75 transition-colors hover:text-primary"
      >
        {capability.label}
      </Link>
      <span className="text-border" aria-hidden>
        /
      </span>
    </span>
  ));

  return (
    <section
      ref={sectionRef}
      className="border-y border-border bg-[linear-gradient(90deg,var(--color-brand-50),color-mix(in_oklab,var(--color-brand-100)_60%,white))] py-3.5 dark:bg-[linear-gradient(90deg,var(--color-brand-950),#0d1424)]"
      aria-label="What we build"
    >
      <div
        className="mask-fade-x relative overflow-hidden"
        onPointerEnter={() => (paused.current = true)}
        onPointerLeave={() => (paused.current = false)}
        onFocus={() => (paused.current = true)}
        onBlur={() => (paused.current = false)}
      >
        <motion.div
          className="flex w-max will-change-transform"
          style={reduce ? undefined : { x, skewX }}
        >
          <div className="flex shrink-0 items-center">{items}</div>
          {/*
            The duplicate exists only so the loop has no visible seam. `inert` takes
            it out of the accessibility tree *and* the tab order — `aria-hidden`
            alone would leave its links focusable but unannounced.
          */}
          <div className="flex shrink-0 items-center" aria-hidden inert>
            {items}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
