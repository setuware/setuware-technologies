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
  const [first = "Setuware", ...rest] = site.shortName.split(" ");
  const second = rest.join(" ");
  const name = first.toUpperCase();
  // "SETU" + "WARE": the second half takes the W's blue-to-teal gradient.
  const split = Math.ceil(name.length / 2);

  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2.5 lg:gap-[calc(var(--s)*12)]", className)}
      aria-label={`${site.name} — home`}
    >
      <LogoMark className="size-10 shrink-0 transition-transform duration-500 group-hover:rotate-[-8deg] lg:size-[calc(var(--s)*46)]" />
      <span className="inline-flex flex-col leading-none" aria-hidden>
        <span className="font-[family-name:var(--font-brand)] text-[1.25rem] font-bold tracking-[0.045em] lg:text-[calc(var(--s)*23)]">
          <span className={inverted ? "text-white" : "text-[#0b1020] dark:text-white"}>{name.slice(0, split)}</span>
          <span
            className={cn(
              "bg-clip-text text-transparent",
              inverted
                ? "bg-[linear-gradient(90deg,#8aa6ff,#22c3e6)]"
                : "bg-[linear-gradient(90deg,#1d3fae,#0a8ea6)] dark:bg-[linear-gradient(90deg,#8aa6ff,#22c3e6)]",
            )}
          >
            {name.slice(split)}
          </span>
        </span>
        {second ? (
          // Letters spread across the full width of the name above.
          <span
            className={cn(
              "mt-[0.32rem] flex justify-between text-[0.66rem] font-semibold lg:mt-[calc(var(--s)*6)] lg:text-[calc(var(--s)*11.5)]",
              inverted ? "text-white/60" : "text-slate-500 dark:text-white/60",
            )}
          >
            {second
              .toUpperCase()
              .split("")
              .map((letter, index) => (
                <span key={index}>{letter}</span>
              ))}
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
