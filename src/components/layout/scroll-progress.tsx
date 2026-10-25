"use client";

import { ArrowUp } from "lucide-react";

import { useScrollProgress } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/**
 * Reading-progress bar plus a back-to-top button that appears once a visitor is
 * far enough down to want it. Both derive from one throttled scroll listener.
 */
export function ScrollProgress() {
  const progress = useScrollProgress();
  const showTop = progress > 0.12;

  return (
    <>
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5"
        aria-hidden
      >
        <div
          className="h-full origin-left bg-[linear-gradient(90deg,var(--color-brand-500),var(--color-accent-400))]"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={cn(
          "fixed bottom-6 right-5 z-50 inline-flex size-11 items-center justify-center rounded-full border border-border bg-surface/90 text-foreground shadow-ambient backdrop-blur transition-all duration-300",
          showTop
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0",
        )}
        aria-label="Back to top"
        tabIndex={showTop ? 0 : -1}
      >
        <ArrowUp className="size-4" aria-hidden />
      </button>
    </>
  );
}
