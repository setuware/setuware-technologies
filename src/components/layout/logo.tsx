import Link from "next/link";

import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Wordmark, as drawn in the Figma header (nodes 24:2620 and 24:2618).
 *
 * "Setuware" is set Bold 34 / −0.02em with its box trimmed to the cap height,
 * and the ® (ExtraLight 30) hangs off its top-right corner, 12.5px above the
 * cap line. The ® is absolutely positioned so it never pushes the nav links:
 * in the design they start exactly 116px after the word itself.
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
        "group inline-flex flex-col items-start gap-[0.3rem] transition-colors lg:gap-[calc(var(--s)*6)]",
        inverted ? "text-white" : "text-foreground",
        className,
      )}
      aria-label={`${site.name} — home`}
    >
      <span className="relative block text-[1.6rem] font-bold leading-none tracking-[-0.02em] [text-box:trim-both_cap_alphabetic] lg:min-w-[calc(var(--s)*155)] lg:text-[calc(var(--s)*34)]">
        {first}
        <span
          aria-hidden
          className="absolute left-full top-[-0.37em] text-[1.4rem] font-extralight leading-[normal] tracking-normal lg:top-[calc(var(--s)*-12.5)] lg:text-[calc(var(--s)*30)]"
        >
          ®
        </span>
      </span>
      {second ? (
        <span
          className={cn(
            "block text-[0.5rem] font-semibold uppercase leading-none tracking-[0.42em] [text-box:trim-both_cap_alphabetic] lg:text-[calc(var(--s)*10.5)]",
            inverted ? "text-white/70" : "text-foreground/65",
          )}
        >
          {second}
        </span>
      ) : null}
    </Link>
  );
}
