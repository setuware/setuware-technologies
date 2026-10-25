import * as React from "react";

import { cn } from "@/lib/utils";

export interface MarqueeProps {
  children: React.ReactNode;
  /** Seconds for one full loop. */
  durationSeconds?: number;
  reverse?: boolean;
  className?: string;
  /** Pause while the pointer is over the row, so logos stay readable. */
  pauseOnHover?: boolean;
}

/**
 * CSS-only infinite row. Children are rendered twice and the track is
 * translated by exactly -50%, so the loop has no visible seam and no JavaScript
 * runs per frame.
 */
export function Marquee({
  children,
  durationSeconds = 36,
  reverse = false,
  className,
  pauseOnHover = true,
}: MarqueeProps) {
  return (
    <div className={cn("mask-fade-x relative overflow-hidden", className)}>
      <div
        className={cn(
          "flex w-max motion-safe:animate-marquee",
          pauseOnHover && "hover:[animation-play-state:paused]",
        )}
        style={
          {
            "--marquee-duration": `${durationSeconds}s`,
            animationDirection: reverse ? "reverse" : "normal",
          } as React.CSSProperties
        }
      >
        <div className="flex shrink-0 items-center" aria-hidden={false}>
          {children}
        </div>
        {/*
          The duplicate exists only to make the loop seamless. `inert` takes it
          out of the accessibility tree *and* the tab order — `aria-hidden`
          alone would leave any links inside it focusable but unannounced.
        */}
        <div
          className="flex shrink-0 items-center"
          aria-hidden
          inert
        >
          {children}
        </div>
      </div>
    </div>
  );
}
