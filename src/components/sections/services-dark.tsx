"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import type { ServiceKey } from "@/lib/pricing";
import { services } from "@/lib/content";
import { servicePhotos } from "@/lib/service-photos";
import { useMediaQuery } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { ServiceIcon } from "@/components/ui/service-icon";
import { FadeUp, Magnetic, SpotlightCard, useReducedMotionSafe } from "@/components/motion/primitives";
import { TextReveal } from "@/components/motion/text-reveal";
import { DURATION, EASE_OUT, VIEWPORT } from "@/components/motion/ease";

/** One spring for every card state change, so the row moves as one object. */
const CARD_SPRING = { type: "spring", stiffness: 210, damping: 26, mass: 0.9 } as const;

/**
 * Layered elevation for white cards on the light sections: a crisp contact
 * shadow plus a long, soft ambient one. Uses `--shadow-color` so dark mode
 * gets a neutral black shadow instead of slate.
 */
export const LIGHT_CARD_SHADOW =
  "shadow-[0_1px_2px_rgb(var(--shadow-color)/0.06),0_24px_48px_-24px_rgb(var(--shadow-color)/0.18)]";

/**
 * Over each card's photo: a faint brand-cyan wash from the top-left and a
 * light navy (#0b1020) shade along the bottom edge, so the photo meets the
 * white card body with some depth instead of a hard seam.
 */
const MEDIA_OVERLAY = [
  "linear-gradient(to top, rgba(11,16,32,0.42) 0%, rgba(11,16,32,0.08) 45%, rgba(11,16,32,0) 70%)",
  "linear-gradient(135deg, rgba(0,161,198,0.22) 0%, rgba(0,161,198,0) 50%)",
].join(", ");

/**
 * Homepage card copy, from the approved copy deck. Kept here rather than in
 * `services[]` because the cards carry a shorter name and a single-line
 * description; the service pages keep their own fuller wording. Keyed by slug
 * so a renamed or removed service fails the type check.
 */
const CARD_COPY: Record<ServiceKey, { name: string; description: string }> = {
  "business-websites": {
    name: "Business websites",
    description:
      "Company websites from ₹9,999, live in 3–6 weeks, on WordPress or Next.js.",
  },
  "ecommerce-stores": {
    name: "E-commerce stores",
    description:
      "Online stores on Shopify or WooCommerce, with UPI checkout and GST invoices.",
  },
  "web-development": {
    name: "Web applications",
    description:
      "Portals, dashboards and SaaS on Next.js and PostgreSQL, from ₹9,999.",
  },
  "app-development": {
    name: "Mobile apps",
    description:
      "One React Native or Flutter codebase for iOS and Android, store submission included.",
  },
  "product-design": {
    name: "UI/UX & branding",
    description:
      "Logos, brand guides and Figma interfaces, designed next to the engineers who build them.",
  },
  "seo-marketing": {
    name: "SEO & digital marketing",
    description:
      "SEO, Google Ads and Meta campaigns — tracking first, so every rupee is measured.",
  },
  "custom-software": {
    name: "Custom software, ERP & CRM",
    description:
      "ERP and CRM built around your process, plugged into Tally, Zoho and WhatsApp.",
  },
  "ai-integration": {
    name: "AI & automation",
    description:
      "Assistants that answer from your own documents — and say so when they don't know.",
  },
  "managed-hosting": {
    name: "Hosting & domains",
    description:
      "Hosting, domains and email on AWS and Google Cloud, monitored around the clock.",
  },
  "support-maintenance": {
    name: "Maintenance & support",
    description:
      "Monthly updates, patches and fixes for a fixed fee, with published response times.",
  },
};

/**
 * "Ten services, one team in Gurugram"
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
const INITIAL_CARD = 1;

export function ServicesDark() {
  const trackRef = useRef<HTMLUListElement>(null);
  // Open on the second card so the carousel starts centred, with a
  // neighbour visible on each side.
  const [active, setActive] = useState(INITIAL_CARD);
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

  // Centre the initial card without animating the page on load.
  useEffect(() => {
    const track = trackRef.current;
    const card = track?.children[INITIAL_CARD] as HTMLElement | undefined;
    if (!track || !card) return;
    track.scrollLeft = card.offsetLeft - (track.clientWidth - card.clientWidth) / 2;
  }, [wide]);

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
      className="relative isolate overflow-hidden border-t border-border bg-[linear-gradient(180deg,#f6f9fc,var(--background))] py-20 md:py-28 dark:bg-[linear-gradient(180deg,var(--background-subtle),var(--background))]"
    >
      <LightSectionBackdrop variant="services" />

      <div className="container-page relative">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <TextReveal
              as="h2"
              className="font-display text-3xl font-semibold leading-tight text-foreground sm:text-[2.6rem]"
            >
              Ten services, one team in Gurugram
            </TextReveal>
            <FadeUp delay={0.25} y={20}>
              <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-foreground">
                Websites and apps from ₹9,999 — every price in
                writing before we start.
              </p>
            </FadeUp>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/services"
              className="mr-2 inline-flex h-10 items-center rounded-full border border-border bg-surface px-5 text-xs font-medium text-foreground shadow-[0_1px_2px_rgb(var(--shadow-color)/0.06)] transition-colors hover:border-setu/50 hover:bg-surface-2"
            >
              View all services
            </Link>
            <Magnetic strength={0.4}>
              <button
                type="button"
                onClick={() => go(-1)}
                disabled={active === 0}
                aria-label="Previous service"
                className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-[0_1px_2px_rgb(var(--shadow-color)/0.06)] transition-[background-color,border-color,opacity] hover:border-setu/50 hover:bg-surface-2 disabled:opacity-40"
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
                className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-[0_1px_2px_rgb(var(--shadow-color)/0.06)] transition-[background-color,border-color,opacity] hover:border-setu/50 hover:bg-surface-2 disabled:opacity-40"
              >
                <ArrowRight className="size-4" aria-hidden />
              </button>
            </Magnetic>
          </div>
        </div>

        {/* Vertical padding (offset by negative margins) leaves room for the
            cards' soft shadows, which the scroll container would clip. */}
        <motion.ul
          ref={trackRef}
          className="scrollbar-hide -mb-8 mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-12 pt-4"
          initial={reduce ? false : "hidden"}
          whileInView="shown"
          viewport={VIEWPORT}
          variants={{ hidden: {}, shown: { transition: { staggerChildren: 0.08 } } }}
        >
          {services.map((service, index) => {
            const isActive = index === active;
            const copy = CARD_COPY[service.slug];
            return (
              <motion.li
                key={service.slug}
                data-reveal=""
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
                    glow="rgba(0,161,198,0.12)"
                    className={cn(
                      "h-full overflow-hidden rounded-[1.4rem] border border-border bg-surface text-foreground",
                      LIGHT_CARD_SHADOW,
                    )}
                  >
                    <Link
                      href={`/services/${service.slug}`}
                      onFocus={() => {
                        setActive(index);
                        scrollToCard(index);
                      }}
                      className="group relative flex h-full flex-col rounded-[inherit] p-2 outline-offset-[-3px]"
                    >
                      {/* Photo, inset in the card like a framed print. */}
                      <span
                        className="relative block aspect-[16/10] shrink-0 overflow-hidden rounded-[1rem] bg-surface-2"
                        aria-hidden
                      >
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
                        <span
                          className="absolute inset-0 transition-opacity duration-700 group-hover:opacity-70"
                          style={{ backgroundImage: MEDIA_OVERLAY }}
                        />
                        <span className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-black/5" />
                      </span>

                      <div className="relative flex flex-1 flex-col px-5 pb-5">
                        <ServiceIcon
                          name={service.icon}
                          accent={service.accent}
                          className="-mt-[1.375rem] size-11 shadow-[0_8px_20px_-6px_rgb(var(--shadow-color)/0.35)] ring-4 ring-surface"
                          size={22}
                        />
                        <h3 className="mt-4 font-display text-[1.45rem] font-semibold leading-tight text-foreground">
                          {copy.name}
                        </h3>
                        {/* Clamped as a safeguard: the cards are a fixed
                            height in the carousel. */}
                        <p className="mb-6 mt-2.5 line-clamp-3 max-w-sm text-[0.9rem] leading-relaxed text-muted-foreground">
                          {copy.description}
                        </p>

                        <span
                          className={cn(
                            "mt-auto inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-5 py-2 text-xs font-medium text-foreground transition-colors",
                            "group-hover:border-foreground group-hover:bg-foreground group-hover:text-background",
                          )}
                        >
                          Learn more
                          <ArrowRight
                            className="size-3.5 text-setu transition-transform duration-300 group-hover:translate-x-1"
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
 * The light backdrop shared by "All services" and the process timeline: soft
 * brand-cyan (#00a1c6) and blue (#0061a8) glows at low opacity over a fine
 * pattern (dots for services, a grid for the process) that fades out toward
 * the edges, so the surface has texture without any visible tiling.
 * Purely decorative.
 */
export function LightSectionBackdrop({ variant }: { variant: "services" | "process" }) {
  const services = variant === "services";
  return (
    <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
      <div
        className="absolute inset-0 dark:opacity-60"
        style={{
          backgroundImage: services
            ? "radial-gradient(42rem 30rem at 8% -4%, rgba(0,161,198,0.16), transparent 70%), radial-gradient(38rem 32rem at 96% 38%, rgba(0,97,168,0.11), transparent 70%)"
            : "radial-gradient(46rem 26rem at 50% 0%, rgba(0,161,198,0.10), transparent 70%), radial-gradient(34rem 30rem at 0% 90%, rgba(0,97,168,0.07), transparent 70%)",
        }}
      />
      <div
        className={cn(
          "absolute inset-0 text-[#0b1020]/[0.07] dark:text-white/[0.06]",
          services
            ? "bg-[radial-gradient(currentColor_1px,transparent_1.2px)] bg-[size:22px_22px]"
            : "bg-[linear-gradient(currentColor_1px,transparent_1px),linear-gradient(90deg,currentColor_1px,transparent_1px)] bg-[size:56px_56px]",
        )}
        style={{
          maskImage: services
            ? "radial-gradient(ellipse 75% 65% at 50% 0%, #000 25%, transparent 75%)"
            : "radial-gradient(ellipse 60% 55% at 50% 12%, #000 20%, transparent 75%)",
        }}
      />
    </div>
  );
}
