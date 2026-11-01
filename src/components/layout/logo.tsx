import Link from "next/link";

import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Wordmark, as drawn in the Figma header (nodes 24:2620 and 24:2618).
 *
 * "S" tile mark + two-line wordmark: "Setuware" in Sora SemiBold (brand face),
 * "Technologies" in Manrope SemiBold, muted, sized so the two lines balance. (The Figma ® is omitted at the
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
      <LogoMark className="size-9 shrink-0 transition-transform duration-500 group-hover:-rotate-6 lg:size-[calc(var(--s)*44)]" />
      <span className="flex flex-col leading-none">
        <span className="font-[family-name:var(--font-brand)] text-[1.2rem] font-semibold tracking-[-0.03em] lg:text-[calc(var(--s)*22)]">
          {first}
        </span>
        {second ? (
          <span
            className={cn(
              "mt-[0.22rem] text-[0.84rem] font-semibold tracking-[0.02em] lg:mt-[calc(var(--s)*5)] lg:text-[calc(var(--s)*15.5)]",
              inverted ? "text-white/65" : "text-foreground/55",
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
 * Brand mark: a geometric "S" in white on a cyan-to-blue tile, with a small
 * spark at the top right. Decorative — the link carries the name.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden className={className}>
      <defs>
        <linearGradient id="setu-mark" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1fc6ea" />
          <stop offset="1" stopColor="#0061a8" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill="url(#setu-mark)" />
      <path
        d="M27.6 12.2C25.9 9.4 23.2 8 20.1 8 15.9 8 13 10.5 13 13.8c0 7.6 14.6 5 14.6 12.9 0 3.4-3 6-7.4 6-3.3 0-6.1-1.5-7.8-4.3"
        fill="none"
        stroke="#fff"
        strokeWidth="4.4"
        strokeLinecap="round"
      />
      <circle cx="31" cy="9" r="2.2" fill="#fff" fillOpacity=".85" />
    </svg>
  );
}
