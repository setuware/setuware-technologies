import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";

import type { Service } from "@/lib/content";
import { cn, formatINR } from "@/lib/utils";
import { SpotlightCard } from "@/components/motion/primitives";
import { ServiceIcon } from "@/components/ui/service-icon";

/** "From ₹20,000", or the service's own label when the price needs a unit. */
export function servicePriceLabel(service: Pick<Service, "priceFrom" | "priceLabel">): string {
  if (service.priceLabel) return service.priceLabel;
  return service.priceFrom > 0 ? `From ${formatINR(service.priceFrom)}` : "Custom quote";
}

export interface ServiceCardProps {
  service: Service;
  /** Heading level for the service name, so cards fit the page outline. */
  as?: "h2" | "h3";
  className?: string;
}

/**
 * Card used on the services index and in "related services". The whole card is
 * one link; price and timeline sit in the footer so cards line up in a grid.
 */
export function ServiceCard({ service, as: Heading = "h3", className }: ServiceCardProps) {
  return (
    <SpotlightCard
      tilt={3}
      className={cn(
        "h-full rounded-[1.4rem] border border-border bg-surface shadow-ambient transition-colors duration-300 hover:border-setu/50",
        className,
      )}
    >
      <Link
        href={`/services/${service.slug}`}
        className="group relative flex h-full flex-col rounded-[inherit] p-6 outline-offset-[-3px] md:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <ServiceIcon name={service.icon} accent={service.accent} className="size-11" size={21} />
          <span className="inline-flex size-9 items-center justify-center rounded-full border border-border text-foreground transition-colors duration-300 group-hover:border-setu group-hover:bg-setu group-hover:text-white">
            <ArrowUpRight
              className="size-4 transition-transform duration-300 group-hover:rotate-45"
              aria-hidden
            />
          </span>
        </div>

        <Heading className="mt-5 font-display text-[1.3rem] font-semibold leading-snug text-foreground">
          {service.name}
        </Heading>
        <p className="mb-6 mt-2 text-[0.93rem] leading-relaxed text-muted-foreground">
          {service.summary}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-4 text-[0.82rem]">
          <span className="font-semibold text-foreground">{servicePriceLabel(service)}</span>
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <Clock className="size-3.5 text-setu" aria-hidden />
            {service.typicalTimeline}
          </span>
        </div>
      </Link>
    </SpotlightCard>
  );
}
