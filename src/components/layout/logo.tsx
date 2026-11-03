import { useId } from "react";
import Link from "next/link";

import { MARK_PATHS } from "@/lib/brand-mark";

import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Wordmark, as drawn in the Figma header (nodes 24:2620 and 24:2618).
 *
 * SW monogram + two-line wordmark: "Setuware" in Sora SemiBold (brand
 * face), "TECHNOLOGIES" in widely tracked Manrope Bold caps spanning the
 * same width. (The Figma ® is omitted at the
 * owner's request.)
 *
 * The design only shows "Setuware"; the company name is "Setuware
 * Technologies", so the second word sits underneath as a small tracked line
 * and the whole lockup reads as the full name.
 */
export function Logo({
  className,
  href = "/",
  inverted = false,
}: {
  className?: string;
  href?: string;
  /** Light wordmark, for use on dark backgrounds. */
  inverted?: boolean;
}) {
  const [first, ...rest] = site.shortName.split(" ");
  const second = rest.join(" ");

  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2.5 transition-colors lg:gap-[calc(var(--s)*12)]",
        inverted ? "text-white" : "text-foreground",
        className,
      )}
      aria-label={`${site.name} — home`}
    >
      <LogoMark className="size-9 shrink-0 transition-transform duration-500 group-hover:rotate-[-8deg] lg:size-[calc(var(--s)*44)]" />
      <span className="flex flex-col leading-none">
        <span className="font-[family-name:var(--font-brand)] text-[1.2rem] font-semibold uppercase tracking-[0.02em] lg:text-[calc(var(--s)*22)]">
          {first}
        </span>
        {second ? (
          <span
            className={cn(
              "mt-[0.3rem] text-[0.74rem] font-bold uppercase tracking-[0.2em] lg:mt-[calc(var(--s)*5)] lg:text-[calc(var(--s)*13)]",
              inverted ? "text-white/65" : "text-foreground/60",
            )}
          >
            {second}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

/**
 * Brand mark: the SW monogram in its ring. Colours come from CSS variables so
 * the same SVG switches to brighter blues in dark mode (and inside the
 * always-dark footer). Decorative — the link carries the name.
 */
export function LogoMark({ className }: { className?: string }) {
  const gradient = `sw-${useId().replace(/:/g, "")}`;
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden
      className={cn(
        "[--sw-ring:#1d3fae] [--sw-w0:#1d3fae] [--sw-w1:#1468ad] [--sw-w2:#0a8ea6] dark:[--sw-ring:#6a8cff] dark:[--sw-w0:#6a8cff] dark:[--sw-w1:#3fa9e8] dark:[--sw-w2:#22c3e6]",
        className,
      )}
    >
      <defs>
        <linearGradient id={gradient} x1="40" y1="0" x2="92" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: "var(--sw-w0)" }} />
          <stop offset=".55" style={{ stopColor: "var(--sw-w1)" }} />
          <stop offset="1" style={{ stopColor: "var(--sw-w2)" }} />
        </linearGradient>
      </defs>
      <path d={MARK_PATHS.ring} fill="none" style={{ stroke: "var(--sw-ring)" }} strokeWidth="9" />
      <path d={MARK_PATHS.nodes} fillRule="evenodd" style={{ fill: "var(--sw-ring)" }} />
      <path d={MARK_PATHS.s} fill="none" style={{ stroke: "var(--sw-ring)" }} strokeWidth="9.4" />
      <path d={MARK_PATHS.w} fill={`url(#${gradient})`} />
    </svg>
  );
}
