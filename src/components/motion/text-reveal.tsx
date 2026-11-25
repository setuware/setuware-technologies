"use client";

import * as React from "react";
import { motion, useInView } from "framer-motion";

import { cn } from "@/lib/utils";
import { DURATION, EASE_OUT } from "./ease";

type Tag = "h1" | "h2" | "h3" | "p" | "span" | "div";

export interface TextRevealProps {
  /** Plain text. Use `\n` to force a line break where the design breaks. */
  children: string;
  as?: Tag;
  className?: string;
  /** Seconds before the first word starts. */
  delay?: number;
  /** Seconds between consecutive words. */
  stagger?: number;
  /** Animate as soon as mounted (above the fold) instead of on scroll. */
  immediate?: boolean;
  id?: string;
}

/**
 * Masked word-by-word rise: each word slides up from behind its own clipping
 * box, with a slight rotation that settles flat. Screen readers get the plain
 * sentence through `aria-label`; the animated spans are hidden from them.
 */
export function TextReveal({
  children,
  as = "h2",
  className,
  delay = 0,
  stagger = 0.06,
  immediate = false,
  id,
}: TextRevealProps) {
  const ref = React.useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const show = immediate || inView;

  const lines = children.split("\n");
  let index = 0;

  const Component = motion[as] as React.ElementType;

  return (
    <Component ref={ref} id={id} className={className} aria-label={children.replace(/\n/g, " ")}>
      {lines.map((line, li) => (
        <React.Fragment key={li}>
          {line.split(" ").filter(Boolean).map((word, wi) => {
            const i = index++;
            return (
              <span
                key={`${li}-${wi}`}
                aria-hidden
                className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-top"
              >
                <motion.span
                  data-reveal=""
                  className="inline-block will-change-transform"
                  initial={{ y: "110%", rotate: 4, opacity: 0 }}
                  animate={show ? { y: "0%", rotate: 0, opacity: 1 } : undefined}
                  transition={{ duration: DURATION.slow, ease: EASE_OUT, delay: delay + i * stagger }}
                >
                  {word}
                </motion.span>
                {" "}
              </span>
            );
          })}
          {li < lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </Component>
  );
}

/** Same reveal for short inline labels where a wrapper class is needed. */
export function RevealLine({ className, ...props }: TextRevealProps) {
  return <TextReveal {...props} className={cn("block", className)} />;
}
