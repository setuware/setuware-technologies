"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { serviceStartingPrice, services } from "@/lib/content";
import { images } from "@/lib/images";
import { servicePhotos } from "@/lib/service-photos";
import { useMediaQuery } from "@/lib/hooks";
import { cn, formatINR } from "@/lib/utils";
import { ServiceIcon } from "@/components/ui/service-icon";
import { FadeUp, Magnetic, SpotlightCard, useReducedMotionSafe } from "@/components/motion/primitives";
import { TextReveal } from "@/components/motion/text-reveal";
import { DURATION, EASE_OUT, VIEWPORT } from "@/components/motion/ease";

/** One spring for every card state change, so the row moves as one object. */
const CARD_SPRING = { type: "spring", stiffness: 210, damping: 26, mass: 0.9 } as const;

/**
 * Overlay over each card's photo: navy (#0b1020) at 92% under the text,
 * thinning to 35% at the top, plus a faint brand-cyan wash from the top-left.
 */
const CARD_OVERLAY = [
  "linear-gradient(to top, rgba(11,16,32,0.94) 0%, rgba(11,16,32,0.8) 38%, rgba(11,16,32,0.48) 68%, rgba(11,16,32,0.3) 100%)",
  "linear-gradient(135deg, rgba(0,161,198,0.28) 0%, rgba(0,161,198,0) 55%)",
].join(", ");

/**
 * "Start with a website. Add what comes next."
 *
 * A peek carousel: the active card is centred and full-size, its neighbours
 * sit behind it scaled down and dimmed. Built on native scroll snapping, so
 * touch dragging, trackpad swiping and keyboard scrolling all work without any
 * gesture handling of our own; the active card follows the scroll position,
 * whichever way it was moved.
 *
 * Motion: the heading rises word by word, the cards slide in from the right
 * in sequence, the active/inactive change is a spring rather than a CSS fade,
 * and each card carries a cursor-following glow with a slight tilt. The arrow
 * buttons lean toward the pointer.
 */
export function ServicesDark() {
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const reduce = useReducedMotionSafe();
  const wide = useMediaQuery("(min-width: 768px)");

  const scrollToCard = (index: number) => {
    const track = trackRef.current;
    const card = track?.children[index] as HTMLElement | undefined;
    if (!track || !card) return;
    // Scroll the track itself, not the page: `scrollIntoView` would also
    // nudge the window vertically.
    track.scrollTo({
      left: card.offsetLeft - (track.clientWidth - card.clientWidth) / 2,
      behavior: reduce ? "auto" : "smooth",
    });
  };

  const go = (direction: -1 | 1) => {
    const next = Math.min(services.length - 1, Math.max(0, active + direction));
    setActive(next);
    scrollToCard(next);
  };

  // The card nearest the track's centre is the active one.
  const syncActive = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const centre = track.scrollLeft + track.clientWidth / 2;
    let nearest = 0;
    let best = Infinity;
    Array.from(track.children).forEach((child, index) => {
      const card = child as HTMLElement;
      const distance = Math.abs(card.offsetLeft + card.clientWidth / 2 - centre);
      if (distance < best) {
        best = distance;
        nearest = index;
      }
    });
    setActive(nearest);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      if (frame === 0) {
        frame = requestAnimationFrame(() => {
          frame = 0;
          syncActive();
        });
      }
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
    };
  }, [syncActive]);

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
          <div className="max-w-xl">
            <TextReveal
              as="h2"
              className="font-display text-3xl font-semibold leading-tight text-white sm:text-[2.6rem]"
            >
              {"Start with a website.\nAdd what comes next."}
            </TextReveal>
            <FadeUp delay={0.25} y={20}>
              <p className="mt-4 text-[0.92rem] leading-relaxed text-white/60">
                Stores, apps, branding, marketing and custom software come from
                the team that built your site. Every service lists its starting
                price and typical timeline.
              </p>
            </FadeUp>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/services"
              className="mr-2 inline-flex h-10 items-center rounded-full border border-white/20 px-5 text-xs font-medium text-white transition-colors hover:bg-white/10"
            >
              Explore all {services.length} services
            </Link>
            <Magnetic strength={0.4}>
              <button
                type="button"
                onClick={() => go(-1)}
                disabled={active === 0}
                aria-label="Previous service"
                className="inline-flex size-10 items-center justify-center rounded-full border border-white/20 text-white transition-[background-color,opacity] hover:bg-white/10 disabled:opacity-35"
              >
                <ArrowLeft className="size-4" aria-hidden />
              </button>
            </Magnetic>
            <Magnetic strength={0.4}>
              <button
                type="button"
                onClick={() => go(1)}
                disabled={active === services.length - 1}
                aria-label="Next service"
                className="inline-flex size-10 items-center justify-center rounded-full border border-white/20 text-white transition-[background-color,opacity] hover:bg-white/10 disabled:opacity-35"
              >
                <ArrowRight className="size-4" aria-hidden />
              </button>
            </Magnetic>
          </div>
        </div>

        <motion.ul
          ref={trackRef}
          className="scrollbar-hide mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4"
          initial={reduce ? false : "hidden"}
          whileInView="shown"
          viewport={VIEWPORT}
          variants={{ hidden: {}, shown: { transition: { staggerChildren: 0.08 } } }}
        >
          {services.map((service, index) => {
            const isActive = index === active;
            return (
              <motion.li
                key={service.slug}
                className="w-[min(26rem,82vw)] shrink-0 snap-center"
                variants={{
                  hidden: { opacity: 0, x: 140 },
                  shown: {
                    opacity: 1,
                    x: 0,
                    transition: { duration: DURATION.slow, ease: EASE_OUT },
                  },
                }}
              >
                <motion.div
                  className="h-full"
                  initial={false}
                  animate={{
                    scale: isActive || !wide ? 1 : 0.92,
                    opacity: isActive ? 1 : 0.55,
                  }}
                  transition={reduce ? { duration: 0 } : CARD_SPRING}
                >
                  <SpotlightCard
                    tilt={5}
                    glow="rgba(0,161,198,0.22)"
                    className="h-full overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#0b1020] text-white shadow-2xl"
                  >
                    <Link
                      href={`/services/${service.slug}`}
                      onFocus={() => {
                        setActive(index);
                        scrollToCard(index);
                      }}
                      className="group relative flex h-full min-h-[21rem] flex-col rounded-[inherit] p-7 outline-offset-[-3px]"
                    >
                      {/* Full-bleed photograph. `-z-10` puts it under the
                          spotlight glow (the card is its own stacking
                          context), so the cursor glow still reads on top. */}
                      <span className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]" aria-hidden>
                        <Image
                          src={servicePhotos[service.slug].src}
                          alt=""
                          fill
                          sizes="(min-width: 768px) 26rem, 82vw"
                          className={cn(
                            "object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06] group-focus-visible:scale-[1.06] motion-reduce:transition-none",
                            isActive && wide && "scale-[1.06]",
                          )}
                        />
                        {/* Brand overlay: near-opaque navy under the text,
                            thinning toward the top so the photo shows. */}
                        <span
                          className="absolute inset-0 transition-opacity duration-700 group-hover:opacity-[0.88]"
                          style={{ backgroundImage: CARD_OVERLAY }}
                        />
                      </span>

                      <span className="relative">
                        <ServiceIcon
                          name={service.icon}
                          accent={service.accent}
                          className="size-11 shadow-lg ring-1 ring-white/20"
                          size={22}
                        />
                      </span>

                      <div className="relative mt-auto pt-10">
                        <h3 className="font-display text-[1.6rem] font-semibold leading-tight [text-shadow:0_1px_12px_rgba(11,16,32,0.6)]">
                          {service.name}
                        </h3>
                        {/* Clamped: summaries vary in length and the cards are a
                            fixed height in the carousel. */}
                        <p className="mt-3 line-clamp-3 max-w-sm text-[0.88rem] leading-relaxed text-white/80">
                          {service.summary}
                        </p>
                        {/* Price and timeline up front: the two things a buyer
                            asks first. */}
                        <p className="mt-4 text-[0.8rem] font-medium text-white/90">
                          From {formatINR(serviceStartingPrice(service))}
                          <span className="px-2 text-white/40" aria-hidden>
                            |
                          </span>
                          <span className="sr-only">, </span>
                          {service.typicalTimeline}
                        </p>

                        <span
                          className={cn(
                            "mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/30 bg-white/5 px-5 py-2 text-xs font-medium backdrop-blur-sm transition-colors",
                            "group-hover:border-setu group-hover:bg-setu-dark",
                          )}
                        >
                          See scope and pricing
                          <ArrowRight
                            className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
                            aria-hidden
                          />
                        </span>
                      </div>
                    </Link>
                  </SpotlightCard>
                </motion.div>
              </motion.li>
            );
          })}
        </motion.ul>
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
