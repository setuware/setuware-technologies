"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  motion,
} from "framer-motion";

import { services } from "@/lib/content";
import { images } from "@/lib/images";
import { useMediaQuery } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { ServiceIcon } from "@/components/ui/service-icon";
import { Magnetic, SpotlightCard, useReducedMotionSafe } from "@/components/motion/primitives";
import { TextReveal } from "@/components/motion/text-reveal";
import { DURATION, EASE_OUT, VIEWPORT } from "@/components/motion/ease";

/** One spring for every card state change, so the row moves as one object. */
const CARD_SPRING = { type: "spring", stiffness: 210, damping: 26, mass: 0.9 } as const;

/**
 * "All services under one roof".
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
          <TextReveal
            as="h2"
            className="font-display text-3xl font-semibold leading-tight text-white sm:text-[2.6rem]"
          >
            {"All services\nunder one roof"}
          </TextReveal>

          <div className="flex gap-2">
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
                    className="h-full overflow-hidden rounded-[1.4rem] border border-white/10 bg-[linear-gradient(160deg,#ffffff,#eef4fb_55%,#dce9f7)] text-[#0a0d16] shadow-2xl"
                  >
                    <Link
                      href={`/services/${service.slug}`}
                      onFocus={() => {
                        setActive(index);
                        scrollToCard(index);
                      }}
                      className="group relative flex h-full min-h-[21rem] flex-col rounded-[inherit] p-7 outline-offset-[-3px]"
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
                        className="pointer-events-none object-cover opacity-25 mix-blend-multiply transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
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

                      <span
                        className={cn(
                          "relative mt-auto inline-flex w-fit items-center gap-2 rounded-full border border-[#0a0d16]/25 px-5 py-2 text-xs font-medium transition-colors",
                          "group-hover:border-primary group-hover:text-primary",
                        )}
                      >
                        View Details
                        <ArrowRight
                          className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
                          aria-hidden
                        />
                      </span>
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
