"use client";

import { useEffect, useRef, useState } from "react";

import { useInView, usePrefersReducedMotion } from "@/lib/hooks";

export interface CounterProps {
  to: number;
  /** Decimal places; derived from `to` when omitted. */
  decimals?: number;
  durationMs?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/** Counts up once the number scrolls into view. Static for reduced-motion users. */
export function Counter({
  to,
  decimals,
  durationMs = 1400,
  suffix = "",
  prefix = "",
  className,
}: CounterProps) {
  const places = decimals ?? (Number.isInteger(to) ? 0 : 2);
  const { ref, inView } = useInView<HTMLSpanElement>({ threshold: 0.4 });
  const reduceMotion = usePrefersReducedMotion();
  const [value, setValue] = useState(0);
  const frame = useRef(0);

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      setValue(to);
      return;
    }

    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / durationMs);
      setValue(to * easeOut(progress));
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [durationMs, inView, reduceMotion, to]);

  return (
    <span ref={ref} className={className}>
      {/* Screen readers get the final value immediately. */}
      <span aria-hidden>
        {prefix}
        {value.toFixed(places)}
        {suffix}
      </span>
      <span className="sr-only">
        {prefix}
        {to.toFixed(places)}
        {suffix}
      </span>
    </span>
  );
}
