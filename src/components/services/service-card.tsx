import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { serviceStartingPrice, type Service } from "@/lib/content";
import { servicePhotos } from "@/lib/service-photos";
import { cn, formatINR } from "@/lib/utils";
import { SpotlightCard } from "@/components/motion/primitives";
import { ServiceIcon } from "@/components/ui/service-icon";

/** "From ₹4,999", or the service's own label when the price needs a unit. */
export function servicePriceLabel(
  service: Pick<Service, "priceFrom" | "entryPriceFrom" | "priceLabel">,
): string {
  if (service.priceLabel) return service.priceLabel;
  const from = serviceStartingPrice(service);
  return from > 0 ? `From ${formatINR(from)}` : "Custom quote";
}

export interface ServiceCardProps {
  service: Service;
  /** Heading level for the service name, so cards fit the page outline. */
  as?: "h2" | "h3";
  /** `sizes` for the header photo; the default suits a two-column grid. */
  sizes?: string;
  className?: string;
}

/** Navy from the bottom (under the icon chip) plus a faint brand-cyan wash. */
const MEDIA_OVERLAY = [
  "linear-gradient(to top, rgba(11,16,32,0.7) 0%, rgba(11,16,32,0.15) 55%, rgba(11,16,32,0.05) 100%)",
  "linear-gradient(135deg, rgba(0,161,198,0.22) 0%, rgba(0,161,198,0) 60%)",
].join(", ");

/**
 * Card used on the services index and in "related services". The whole card is
 * one link: a photo header with the service icon, then the name and summary,
 * with a "Learn more" footer so cards line up in a grid. Prices live on the
 * service page's pricing card, not here.
 */
export function ServiceCard({
  service,
  as: Heading = "h3",
  sizes = "(min-width: 1024px) 28rem, (min-width: 640px) 50vw, 100vw",
  className,
}: ServiceCardProps) {
  const photo = servicePhotos[service.slug];
  return (
    <SpotlightCard
      tilt={3}
      className={cn(
        "h-full overflow-hidden rounded-[1.4rem] border border-border bg-surface shadow-ambient transition-colors duration-300 hover:border-setu/50",
        className,
      )}
    >
      <Link
        href={`/services/${service.slug}`}
        className="group relative flex h-full flex-col rounded-[inherit] outline-offset-[-3px]"
      >
        {/* Photo header. The image is decorative here: the heading below
            names the service. */}
        <div className="relative aspect-[16/10] overflow-hidden" aria-hidden>
          <Image
            src={photo.src}
            alt=""
            fill
            sizes={sizes}
            className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06] group-focus-visible:scale-[1.06] motion-reduce:transition-none"
          />
          <span
            className="absolute inset-0 transition-opacity duration-700 group-hover:opacity-80"
            style={{ backgroundImage: MEDIA_OVERLAY }}
          />
          <ServiceIcon
            name={service.icon}
            accent={service.accent}
            className="absolute bottom-4 left-5 size-11 shadow-lg ring-1 ring-white/25 md:left-6"
            size={21}
          />
          <span className="absolute right-4 top-4 inline-flex size-9 items-center justify-center rounded-full border border-white/30 bg-[#0b1020]/35 text-white backdrop-blur-md transition-colors duration-300 group-hover:border-setu group-hover:bg-setu">
            <ArrowUpRight
              className="size-4 transition-transform duration-300 group-hover:rotate-45"
            />
          </span>
        </div>

        <div className="flex flex-1 flex-col p-6 pt-5 md:p-7 md:pt-6">
          <Heading className="font-display text-[1.3rem] font-semibold leading-snug text-foreground">
            {service.name}
          </Heading>
          <p className="mb-6 mt-2 text-[0.93rem] leading-relaxed text-muted-foreground">
            {service.summary}
          </p>

          <div className="mt-auto flex items-center border-t border-border pt-4 text-[0.88rem]">
            <span className="inline-flex items-center gap-1.5 font-semibold text-setu">
              Learn more
              <ArrowRight
                className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden
              />
            </span>
          </div>
        </div>
      </Link>
    </SpotlightCard>
  );
}
