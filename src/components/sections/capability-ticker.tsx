import Link from "next/link";

import { capabilities } from "@/lib/capabilities";
import { Marquee } from "@/components/ui/marquee";

/**
 * Capability ticker.
 *
 * Sits directly under the hero as a continuous scrolling band. A marquee
 * rather than a static row because the list is longer than any viewport —
 * eight capabilities would otherwise either wrap into a block or get cut off.
 */
export function CapabilityTicker() {
  return (
    <section
      className="border-y border-border bg-[linear-gradient(90deg,var(--color-brand-50),color-mix(in_oklab,var(--color-brand-100)_60%,white))] py-3.5 dark:bg-[linear-gradient(90deg,var(--color-brand-950),#0d1424)]"
      aria-label="What we build"
    >
      <Marquee durationSeconds={52}>
        {capabilities.map((capability) => (
          <span key={capability.label} className="flex items-center">
            <Link
              href={capability.href}
              className="whitespace-nowrap px-6 text-[0.82rem] text-foreground/75 transition-colors hover:text-primary"
            >
              {capability.label}
            </Link>
            <span className="text-border" aria-hidden>
              /
            </span>
          </span>
        ))}
      </Marquee>
    </section>
  );
}
