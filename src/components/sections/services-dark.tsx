"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { services } from "@/lib/content";
import { images } from "@/lib/images";
import { cn } from "@/lib/utils";
import { ServiceIcon } from "@/components/ui/service-icon";

/**
 * "All services under one roof".
 *
 * A peek carousel: the active card is centred and full-size, its neighbours
 * sit behind it scaled down and dimmed. Built on native scroll snapping — the
 * arrows call `scrollIntoView`, so touch dragging, trackpad swiping and
 * keyboard scrolling all work without any gesture handling of our own.
 */
export function ServicesDark() {
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  const go = (direction: -1 | 1) => {
    const next = Math.min(services.length - 1, Math.max(0, active + direction));
    setActive(next);
    const card = trackRef.current?.children[next];
    card?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  return (
    <section
      id="services"
      className="relative overflow-hidden bg-black py-20 md:py-28"
    >
      {/* Figma 24:2647: black with a 13% halftone texture. The node spans this
          section and the process timeline below; this section shows its top. */}
      <DarkSectionBackdrop position="top" />

      <div className="container-page relative">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-display text-3xl font-semibold leading-tight text-white sm:text-[2.6rem]">
            All services
            <br />
            under one roof
          </h2>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={active === 0}
              aria-label="Previous service"
              className="inline-flex size-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10 disabled:opacity-35"
            >
              <ArrowLeft className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              disabled={active === services.length - 1}
              aria-label="Next service"
              className="inline-flex size-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10 disabled:opacity-35"
            >
              <ArrowRight className="size-4" aria-hidden />
            </button>
          </div>
        </div>

        <ul
          ref={trackRef}
          className="scrollbar-hide mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4"
        >
          {services.map((service, index) => {
            const isActive = index === active;
            return (
              <li
                key={service.slug}
                className={cn(
                  "w-[min(26rem,82vw)] shrink-0 snap-center transition-[transform,opacity] duration-500",
                  isActive ? "opacity-100" : "opacity-55 md:scale-[0.92]",
                )}
              >
                <Link
                  href={`/services/${service.slug}`}
                  onFocus={() => setActive(index)}
                  className="group relative flex h-full min-h-[21rem] flex-col overflow-hidden rounded-[1.4rem] border border-white/10 bg-[linear-gradient(160deg,#ffffff,#eef4fb_55%,#dce9f7)] p-7 text-[#0a0d16] shadow-2xl"
                >
                  {/* Photograph bleeds in from the bottom-right of the card. */}
                  <Image
                    src={
                      service.slug === "managed-hosting"
                        ? images.serviceCloud.src
                        : images.serviceWeb.src
                    }
                    alt=""
                    fill
                    sizes="26rem"
                    className="pointer-events-none object-cover opacity-25 mix-blend-multiply"
                  />

                  <span className="relative">
                    <ServiceIcon
                      name={service.icon}
                      accent={service.accent}
                      className="size-11"
                      size={22}
                    />
                  </span>

                  <h3 className="relative mt-5 font-display text-[1.6rem] font-semibold leading-tight">
                    {service.name}
                  </h3>
                  {/* Clamped: descriptions vary in length and the cards are a
                      fixed height in the carousel. */}
                  <p className="relative mt-3 line-clamp-4 max-w-sm text-[0.88rem] leading-relaxed text-[#0a0d16]/70">
                    {service.description}
                  </p>

                  <span className="relative mt-auto inline-flex w-fit items-center gap-2 rounded-full border border-[#0a0d16]/25 px-5 py-2 text-xs font-medium transition-colors group-hover:border-primary group-hover:text-primary">
                    View Details
                    <ArrowRight
                      className="size-3.5 transition-transform group-hover:translate-x-1"
                      aria-hidden
                    />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/**
 * The dark halftone backdrop shared by "All services" and the process
 * timeline (Figma 24:2647, one 1920×1980 node behind both). Each section shows
 * its own end of the image, and the seam between them is feathered with a mask
 * so the two read as one surface without depending on either's height.
 */
export function DarkSectionBackdrop({ position }: { position: "top" | "bottom" }) {
  const backdrop = images.servicesDarkBackdrop;
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        maskImage:
          position === "top"
            ? "linear-gradient(to bottom, #000 80%, transparent)"
            : "linear-gradient(to top, #000 80%, transparent)",
      }}
      aria-hidden
    >
      <Image
        src={backdrop.src}
        alt={backdrop.alt}
        fill
        sizes="100vw"
        className={cn(
          "object-cover",
          position === "top" ? "object-top" : "object-bottom",
        )}
      />
    </div>
  );
}
