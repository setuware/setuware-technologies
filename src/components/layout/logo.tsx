import Link from "next/link";

import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Wordmark, as drawn in the Figma header (nodes 24:2620 and 24:2618).
 *
 * "ST" monogram tile + two-line wordmark: "Setuware" in Sora SemiBold (brand
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
      <LogoMark className="size-9 shrink-0 transition-transform duration-500 group-hover:-rotate-6 lg:size-[calc(var(--s)*44)]" />
      <span className="flex flex-col leading-none">
        <span className="font-[family-name:var(--font-brand)] text-[1.2rem] font-semibold uppercase tracking-[0.02em] lg:text-[calc(var(--s)*22)]">
          {first}
        </span>
        {second ? (
          <span
            className={cn(
              "mt-[0.32rem] text-[0.6rem] font-bold uppercase tracking-[0.31em] lg:mt-[calc(var(--s)*6)] lg:text-[calc(var(--s)*10.6)]",
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
 * Brand mark: "ST" monogram on an ink tile — the S in the brand cyan
 * gradient, the T in white — with a hairline edge so the tile still reads on
 * dark backgrounds. Decorative — the link carries the name.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden className={className}>
      <defs>
        <linearGradient id="setu-mark" x1="6" y1="8" x2="34" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#5fe0f7" />
          <stop offset="1" stopColor="#00a1c6" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill="#0b1020" />
      <rect x=".5" y=".5" width="39" height="39" rx="11.5" fill="none" stroke="#fff" strokeOpacity=".12" />
      <path
        d="M18.6 13.4C17.4 11.4 15.5 10.4 13.3 10.4 10.3 10.4 8.3 12.2 8.3 14.5c0 5.3 10.6 3.5 10.6 9.3 0 2.4-2.2 4.3-5.4 4.3-2.4 0-4.4-1.1-5.6-3.1"
        fill="none"
        stroke="url(#setu-mark)"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      <path d="M22 11.2h10.6M27.3 11.2v16.9" fill="none" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" />
    </svg>
  );
}
