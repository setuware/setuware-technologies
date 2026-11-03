"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

/**
 * Inertial smooth scrolling (Lenis) — the weighted, decelerating scroll that
 * premium sites have. Native scroll is kept for touch devices and for anyone
 * who asks the OS for reduced motion, and anchor links still work.
 *
 * Every new page opens at the top. Back and forward keep the browser's
 * restored position, and links to an anchor (`/page#section`) are left alone.
 */
export function SmoothScroll() {
  const pathname = usePathname();
  const lenisRef = React.useRef<Lenis | null>(null);
  const historyNav = React.useRef(false);
  const firstRender = React.useRef(true);

  React.useEffect(() => {
    const onPopState = () => {
      historyNav.current = true;
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (historyNav.current) {
      historyNav.current = false;
      return;
    }
    if (window.location.hash) return;

    const toTop = () => {
      lenisRef.current?.scrollTo(0, { immediate: true, force: true });
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    };
    toTop();
    // Once more after the new page has painted, in case it streamed in late.
    const frame = requestAnimationFrame(toTop);
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

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
    lenisRef.current = lenis;

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenisRef.current = null;
      html.style.scrollBehavior = previous;
    };
  }, []);

  return null;
}
