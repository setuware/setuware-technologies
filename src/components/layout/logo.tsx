import Image from "next/image";
import Link from "next/link";

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

  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2.5 lg:gap-[calc(var(--s)*12)]", className)}
      aria-label={`${site.name} — home`}
    >
      <LogoMark className="h-10 w-auto shrink-0 transition-transform duration-500 group-hover:rotate-[-8deg] lg:h-[calc(var(--s)*46)] lg:w-auto" />
      <span className="inline-flex flex-col leading-none" aria-hidden>
        <span
          className={cn(
            "font-[family-name:var(--font-brand)] text-[1.25rem] font-bold tracking-[0.06em] lg:text-[calc(var(--s)*23)]",
            inverted ? "text-white" : "text-[#0b1020] dark:text-white",
          )}
        >
          {name}
        </span>
        {second ? (
          <span
            className={cn(
              "mt-[0.36rem] pl-[0.06em] text-[0.64rem] font-semibold uppercase tracking-[0.36em] lg:mt-[calc(var(--s)*7)] lg:text-[calc(var(--s)*11.5)]",
              inverted ? "text-[#5fd0ec]" : "text-[#0a8ea6] dark:text-[#5fd0ec]",
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
 * Brand mark: the V3 SW ribbon (transparent PNG, no ring). The old ringed
 * SVG monogram read as the "old logo" even after the V3 gradient landed,
 * because the shape never changed — the ribbon is unmistakably the new mark
 * on both light and dark backgrounds. The V3 gradient colours in
 * `MARK_COLORS` remain the brand palette; the favicon and app icons use
 * the glossy ribbon raster (`public/images/favicon-v3-glossy-512.png`).
 * Decorative — the link carries the name.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src="/images/logo-v3-transparent.png"
      alt=""
      width={1412}
      height={816}
      className={cn("w-auto shrink-0", className)}
      priority
    />
  );
}
