import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { images } from "@/lib/images";
import { committedVideo, heroBackdropPoster, heroBackdropSources } from "@/lib/media";
import { ButtonLink } from "@/components/ui/button";
import { FadeUp, Magnetic } from "@/components/motion/primitives";
import { TextReveal } from "@/components/motion/text-reveal";
import {
  HeroBackdrop,
  HeroMedia,
  HeroScrollFade,
} from "@/components/interactive/hero-backdrop";

/**
 * Full-bleed hero.
 *
 * Figma: the media rectangle (24:2644) runs edge to edge from y 72 — directly
 * under the 72px header — and is 765px tall; the copy block (24:2658) starts
 * 184px into it, 2px inside the 1400px column.
 *
 * The background is a photograph by default and a video when one is
 * configured — `HeroBackdrop` takes over the whole layer in that case. Either
 * way a dark scrim sits between the media and the copy so the headline holds
 * its contrast ratio regardless of what is behind it.
 *
 * `priority` on the image: this is the Largest Contentful Paint element, so it
 * must not wait behind lazy-loaded resources.
 *
 * Motion: the media settles from a slight zoom into a slow Ken Burns drift
 * and sinks with parallax on scroll (`HeroMedia`); the headline rises word by
 * word on mount, the subcopy and buttons follow once it has landed, and the
 * whole copy block recedes as the page scrolls past it (`HeroScrollFade`).
 * Layout and type sizes are the Figma values — only transforms animate.
 */
export function Hero() {
  const committed = committedVideo("hero-bg");
  const envSources = heroBackdropSources();
  const videoSources = envSources.length > 0 ? envSources : committed.sources;

  return (
    // The header is fixed and solid, so the hero starts below it.
    <section className="pt-16 md:pt-18 lg:pt-[calc(var(--s)*72)]">
      <div className="relative isolate overflow-hidden bg-[#0a0d16]">
        {videoSources.length > 0 ? (
          <HeroMedia>
            <HeroBackdrop
              sources={videoSources}
              poster={heroBackdropPoster() ?? committed.poster ?? images.heroBackdrop.src}
              tone="dark"
            />
          </HeroMedia>
        ) : (
          <>
            <HeroMedia>
              <Image
                src={images.heroBackdrop.src}
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            </HeroMedia>
            {/* Scrim stays outside the moving layer so contrast never shifts. */}
            <div
              className="absolute inset-0 bg-[linear-gradient(95deg,rgba(6,9,18,0.92)_0%,rgba(6,9,18,0.72)_48%,rgba(6,9,18,0.42)_100%)]"
              aria-hidden
            />
          </>
        )}

        <div className="container-figma relative flex min-h-[clamp(30rem,72vh,40rem)] flex-col justify-center py-16 md:py-20 lg:h-[calc(var(--s)*765)] lg:min-h-0 lg:justify-start lg:pb-0 lg:pt-[calc(var(--s)*184)]">
          <HeroScrollFade className="flex max-w-[42.625rem] flex-col items-start gap-8 lg:ml-[calc(var(--s)*2)] lg:w-[calc(var(--s)*682)] lg:max-w-none lg:gap-[calc(var(--s)*43)]">
            <div className="flex flex-col gap-4 text-white lg:gap-[calc(var(--s)*21)]">
              <TextReveal
                as="h1"
                immediate
                delay={0.15}
                stagger={0.07}
                className="text-wrap text-[2.6rem] font-bold leading-[1.03] tracking-[-0.04em] sm:text-[3.6rem] lg:text-[calc(var(--s)*84)] lg:leading-[calc(var(--s)*86)]"
              >
                Websites that turn visitors into enquiries.
              </TextReveal>

              <FadeUp immediate delay={0.75} y={24}>
                <p className="text-base font-medium leading-relaxed opacity-78 sm:text-lg lg:ml-[calc(var(--s)*5)] lg:w-[calc(var(--s)*672)] lg:text-[calc(var(--s)*18)] lg:leading-[calc(var(--s)*32)]">
                  We design and build business websites, then the store,
                  app and software your business needs next.
                  Fixed quotes from ₹20,000, weekly progress on a live
                  preview, and the domain, code and hosting in your name.
                </p>
              </FadeUp>
            </div>

            <FadeUp
              immediate
              delay={0.9}
              y={24}
              className="flex flex-wrap items-center gap-3 lg:gap-[calc(var(--s)*18)]"
            >
              <Magnetic strength={0.3}>
                <ButtonLink
                  href="/contact"
                  variant="ghost"
                  className="h-11 rounded-full bg-setu px-6 font-semibold text-white hover:bg-setu-dark lg:h-[calc(var(--s)*40)] lg:w-[calc(var(--s)*202)] lg:justify-start lg:gap-[calc(var(--s)*10)] lg:pl-[calc(var(--s)*39)] lg:pr-0 lg:text-[calc(var(--s)*15)] lg:leading-[normal] dark:hover:bg-setu-dark"
                >
                  Get a fixed quote
                  <ArrowRight
                    className="size-4 lg:h-[calc(var(--s)*12.5)] lg:w-[calc(var(--s)*13)]"
                    strokeWidth={2.4}
                    aria-hidden
                  />
                </ButtonLink>
              </Magnetic>
              <ButtonLink
                href="/contact?intent=consultation"
                variant="ghost"
                className="h-11 rounded-full border-[1.5px] border-white/60 px-6 font-semibold text-white hover:bg-white/12 lg:h-[calc(var(--s)*40)] lg:w-[calc(var(--s)*202)] lg:px-0 lg:text-[calc(var(--s)*15)] lg:leading-[normal]"
              >
                Book a 30-minute call
              </ButtonLink>
            </FadeUp>
          </HeroScrollFade>
        </div>
      </div>
    </section>
  );
}
