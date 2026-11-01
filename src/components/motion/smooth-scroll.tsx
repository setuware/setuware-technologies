"use client";

import * as React from "react";
import Lenis from "lenis";

/**
 * Inertial smooth scrolling (Lenis) — the weighted, decelerating scroll that
 * premium sites have. Native scroll is kept for touch devices and for anyone
 * who asks the OS for reduced motion, and anchor links still work.
 */
export function SmoothScroll() {
  React.useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return;

    // `scroll-behavior: smooth` on <html> fights Lenis; hand control to it.
    const html = document.documentElement;
    const previous = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      anchors: { offset: -96 },
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      html.style.scrollBehavior = previous;
    };
  }, []);

  return null;
}
