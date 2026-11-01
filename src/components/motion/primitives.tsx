"use client";

import * as React from "react";
import {
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type HTMLMotionProps,
} from "framer-motion";

import { cn } from "@/lib/utils";
import { DURATION, EASE_OUT, VIEWPORT } from "./ease";

/* -------------------------------------------------------------------------- */
/* FadeUp — the default entrance: rise + un-blur.                              */
/* -------------------------------------------------------------------------- */

export interface FadeUpProps extends HTMLMotionProps<"div"> {
  delay?: number;
  /** Distance in px. */
  y?: number;
  blur?: boolean;
  immediate?: boolean;
}

export function FadeUp({
  delay = 0,
  y = 36,
  blur = true,
  immediate = false,
  className,
  children,
  ...props
}: FadeUpProps) {
  const reduce = useReducedMotion();
  const hidden = { opacity: 0, y, filter: blur ? "blur(10px)" : "blur(0px)" };
  const shown = { opacity: 1, y: 0, filter: "blur(0px)" };
  return (
    <motion.div
      className={className}
      initial={reduce ? false : hidden}
      {...(immediate ? { animate: shown } : { whileInView: shown, viewport: VIEWPORT })}
      transition={{ duration: DURATION.base, ease: EASE_OUT, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Stagger — parent/child pair for grids and lists.                            */
/* -------------------------------------------------------------------------- */

export function Stagger({
  className,
  children,
  stagger = 0.09,
  delay = 0,
  as = "div",
}: {
  className?: string;
  children: React.ReactNode;
  stagger?: number;
  delay?: number;
  as?: "div" | "ul" | "ol";
}) {
  const reduce = useReducedMotion();
  const Component = motion[as] as React.ElementType;
  return (
    <Component
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView="shown"
      viewport={VIEWPORT}
      variants={{ hidden: {}, shown: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      {children}
    </Component>
  );
}

export function StaggerItem({
  className,
  children,
  as = "div",
  y = 40,
}: {
  className?: string;
  children: React.ReactNode;
  as?: "div" | "li" | "article";
  y?: number;
}) {
  const Component = motion[as] as React.ElementType;
  return (
    <Component
      className={className}
      variants={{
        hidden: { opacity: 0, y, scale: 0.98, filter: "blur(8px)" },
        shown: {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          transition: { duration: DURATION.base, ease: EASE_OUT },
        },
      }}
    >
      {children}
    </Component>
  );
}

/* -------------------------------------------------------------------------- */
/* ImageReveal — curtain wipe + slow settle zoom for photos and media.        */
/* -------------------------------------------------------------------------- */

export function ImageReveal({
  className,
  children,
  delay = 0,
  direction = "up",
}: {
  className?: string;
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "left" | "right";
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, VIEWPORT);
  const reduce = useReducedMotion();
  const from = {
    up: "inset(100% 0% 0% 0%)",
    left: "inset(0% 100% 0% 0%)",
    right: "inset(0% 0% 0% 100%)",
  }[direction];

  return (
    <motion.div
      ref={ref}
      className={cn("overflow-hidden", className)}
      initial={reduce ? false : { clipPath: from }}
      animate={inView ? { clipPath: "inset(0% 0% 0% 0%)" } : undefined}
      transition={{ duration: DURATION.slow, ease: EASE_OUT, delay }}
    >
      <motion.div
        className="h-full w-full"
        initial={reduce ? false : { scale: 1.25 }}
        animate={inView ? { scale: 1 } : undefined}
        transition={{ duration: DURATION.slow + 0.6, ease: EASE_OUT, delay }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Parallax — element drifts against scroll. Speed: px across the viewport.   */
/* -------------------------------------------------------------------------- */

export function Parallax({
  className,
  children,
  speed = 80,
  scale = false,
}: {
  className?: string;
  children: React.ReactNode;
  speed?: number;
  /** Also zoom out slightly as it scrolls (good for full-bleed backgrounds). */
  scale?: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [speed, -speed]);
  const s = useTransform(scrollYProgress, [0, 1], [1.12, 1]);
  return (
    <motion.div
      ref={ref}
      className={className}
      style={reduce ? undefined : { y, ...(scale ? { scale: s } : {}) }}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Magnetic — buttons lean toward the cursor and spring back.                  */
/* -------------------------------------------------------------------------- */

export function Magnetic({
  className,
  children,
  strength = 0.35,
}: {
  className?: string;
  children: React.ReactNode;
  strength?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useSpring(0, { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(0, { stiffness: 220, damping: 18, mass: 0.4 });

  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={cn("inline-block", className)}
      style={{ x, y }}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* SpotlightCard — cursor-following glow + gentle 3D tilt.                     */
/* -------------------------------------------------------------------------- */

export function SpotlightCard({
  className,
  children,
  glow = "rgba(0,161,198,0.18)",
  tilt = 6,
  as = "div",
}: {
  className?: string;
  children: React.ReactNode;
  glow?: string;
  /** Max tilt in degrees; 0 disables. */
  tilt?: number;
  as?: "div" | "article" | "li";
}) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(-400);
  const my = useMotionValue(-400);
  const rx = useSpring(0, { stiffness: 160, damping: 18 });
  const ry = useSpring(0, { stiffness: 160, damping: 18 });
  const background = useMotionTemplate`radial-gradient(420px circle at ${mx}px ${my}px, ${glow}, transparent 70%)`;
  const Component = motion[as] as React.ElementType;

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    mx.set(px);
    my.set(py);
    if (!reduce && tilt) {
      ry.set(((px / r.width) - 0.5) * tilt * 2);
      rx.set(-((py / r.height) - 0.5) * tilt * 2);
    }
  };
  const onLeave = () => {
    mx.set(-400);
    my.set(-400);
    rx.set(0);
    ry.set(0);
  };

  return (
    <Component
      className={cn("group/spot relative isolate [transform-style:preserve-3d]", className)}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1100 }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover/spot:opacity-100"
        style={{ background }}
      />
      {children}
    </Component>
  );
}

/* -------------------------------------------------------------------------- */
/* ScrollScale — a block that grows from inset card to full-bleed on scroll.  */
/* -------------------------------------------------------------------------- */

export function ScrollScale({
  className,
  children,
  from = 0.88,
  radius = 32,
}: {
  className?: string;
  children: React.ReactNode;
  from?: number;
  /** Corner radius (px) at the start; eases to 0 when full size. */
  radius?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.25"] });
  const scale = useTransform(scrollYProgress, [0, 1], [from, 1]);
  const borderRadius = useTransform(scrollYProgress, [0, 1], [radius, 0]);
  return (
    <motion.div
      ref={ref}
      className={cn("overflow-hidden will-change-transform", className)}
      style={reduce ? undefined : { scale, borderRadius }}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* LetterRise — giant wordmarks: letters rise one by one, scrubbed by scroll.  */
/* -------------------------------------------------------------------------- */

export function LetterRise({ text, className }: { text: string; className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -5% 0px" });
  const reduce = useReducedMotion();
  return (
    <div ref={ref} className={className} aria-label={text} role="text">
      {text.split("").map((ch, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={reduce ? false : { y: "105%" }}
            animate={inView ? { y: "0%" } : undefined}
            transition={{ duration: DURATION.slow, ease: EASE_OUT, delay: i * 0.035 }}
          >
            {ch === " " ? " " : ch}
          </motion.span>
        </span>
      ))}
    </div>
  );
}
