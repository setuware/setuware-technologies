import Link from "next/link";

import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Wordmark plus an inline SVG monogram — two bridged nodes, for "setu" (bridge).
 * Inline so it paints with the first HTML response, no extra request.
 */
export function Logo({
  className,
  href = "/",
  inverted = false,
}: {
  className?: string;
  href?: string;
  /** Light wordmark, for when the header sits over the dark hero. */
  inverted?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label={`${site.name} — home`}
    >
      <span className="relative inline-flex size-9 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--color-brand-600),var(--color-accent-500))] shadow-glow">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M5 16c0-4.5 3-7.5 7-7.5s7 3 7 7.5"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <circle cx="5" cy="16" r="2.4" fill="white" />
          <circle cx="19" cy="16" r="2.4" fill="white" />
        </svg>
      </span>
      <span
        className={cn(
          "text-[1.15rem] font-semibold tracking-tight transition-colors",
          inverted ? "text-white" : "text-foreground",
        )}
      >
        {site.shortName}
        <sup className="ml-0.5 text-[0.55em] font-normal align-super">®</sup>
      </span>
    </Link>
  );
}
