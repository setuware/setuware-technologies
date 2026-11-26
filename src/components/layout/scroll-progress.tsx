"use client";

import { useState } from "react";
import { ArrowUp } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "framer-motion";

import { EASE_OUT } from "@/components/motion/ease";
import { useReducedMotionSafe } from "@/components/motion/primitives";

/**
 * Reading-progress bar plus a back-to-top button that appears once a visitor is
 * far enough down to want it. The button tops the bottom-right stack, above
 * the assistant launcher and the WhatsApp button. Both read framer-motion's shared scroll value, so
 * the bar updates off React's render path: a spring smooths the raw progress
 * into a bar that glides rather than ticks.
 */
export function ScrollProgress() {
  const reduce = useReducedMotionSafe();
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.35,
    restDelta: 0.0005,
  });
  const [showTop, setShowTop] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = value > 0.12;
    setShowTop((current) => (current === next ? current : next));
  });

  return (
    <>
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px]"
        aria-hidden
      >
        <motion.div
          className="h-full origin-left bg-[#2f56d8] shadow-[0_0_10px_rgba(47,86,216,0.55)]"
          style={{ scaleX: reduce ? scrollYProgress : smooth }}
        />
      </div>

      <AnimatePresence>
        {showTop ? (
          <motion.button
            key="back-to-top"
            type="button"
            onClick={() =>
              window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })
            }
            initial={reduce ? false : { opacity: 0, y: 14, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.9 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            whileHover={reduce ? undefined : { y: -3 }}
            whileTap={reduce ? undefined : { scale: 0.94 }}
            className="group fixed bottom-[calc(9rem+env(safe-area-inset-bottom))] right-[20px] z-[35] inline-flex size-11 sm:bottom-[160px] sm:right-[26px] items-center justify-center overflow-hidden rounded-full border border-border bg-surface/90 text-foreground shadow-ambient backdrop-blur transition-colors hover:border-[#2f56d8]/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f56d8]"
            aria-label="Back to top"
          >
            <ArrowUp
              className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5"
              aria-hidden
            />
          </motion.button>
        ) : null}
      </AnimatePresence>
    </>
  );
}
