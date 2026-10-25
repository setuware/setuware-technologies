"use client";

import * as React from "react";

import { useInView } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export interface RevealProps extends React.HTMLAttributes<HTMLElement> {
  /** Stagger delay in milliseconds. */
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  as?: "div" | "li" | "section" | "article";
}

const OFFSETS: Record<NonNullable<RevealProps["direction"]>, string> = {
  up: "translate3d(0,22px,0)",
  down: "translate3d(0,-22px,0)",
  left: "translate3d(22px,0,0)",
  right: "translate3d(-22px,0,0)",
  none: "none",
};

/**
 * Scroll-in animation using transform and opacity only — both composited, so
 * the main thread stays free. Content is in the DOM and readable regardless of
 * whether the animation ever runs.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
  as = "div",
  style,
  ...props
}: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const Tag = as as React.ElementType;

  return (
    <Tag
      ref={ref}
      data-in-view={inView ? "true" : "false"}
      className={cn("motion-safe:transition-[opacity,transform]", className)}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : OFFSETS[direction],
        transitionDuration: "620ms",
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        transitionDelay: `${delay}ms`,
        willChange: inView ? undefined : "opacity, transform",
        ...style,
      }}
      {...props}
    >
      {children}
    </Tag>
  );
}
