import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { images } from "@/lib/images";
import { heroBackdropPoster, heroBackdropSources } from "@/lib/media";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { HeroBackdrop } from "@/components/interactive/hero-backdrop";

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
 * must not wait behind lazy-loaded resources. For the same reason the
 * headline is never faded in — only the supporting copy and buttons reveal.
 */
export function Hero() {
  const videoSources = heroBackdropSources();

  return (
    // The header is fixed and solid, so the hero starts below it.
    <section className="pt-16 md:pt-18 lg:pt-[calc(var(--s)*72)]">
      <div className="relative isolate overflow-hidden bg-[#0a0d16]">
        {videoSources.length > 0 ? (
          <HeroBackdrop
            sources={videoSources}
            poster={heroBackdropPoster() ?? images.heroBackdrop.src}
            tone="dark"
          />
        ) : (
          <>
            <Image
              src={images.heroBackdrop.src}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div
              className="absolute inset-0 bg-[linear-gradient(95deg,rgba(6,9,18,0.92)_0%,rgba(6,9,18,0.72)_48%,rgba(6,9,18,0.42)_100%)]"
              aria-hidden
            />
          </>
        )}

        <div className="container-figma relative flex min-h-[clamp(30rem,72vh,40rem)] flex-col justify-center py-16 md:py-20 lg:h-[calc(var(--s)*765)] lg:min-h-0 lg:justify-start lg:pb-0 lg:pt-[calc(var(--s)*184)]">
          <div className="flex max-w-[42.625rem] flex-col items-start gap-8 lg:ml-[calc(var(--s)*2)] lg:w-[calc(var(--s)*682)] lg:max-w-none lg:gap-[calc(var(--s)*43)]">
            <div className="flex flex-col gap-4 text-white lg:gap-[calc(var(--s)*21)]">
              <h1 className="text-wrap text-[2.6rem] font-bold leading-[1.03] tracking-[-0.04em] sm:text-[3.6rem] lg:text-[calc(var(--s)*84)] lg:leading-[calc(var(--s)*86)]">
                From ideas to production-ready software.
              </h1>

              <Reveal delay={80}>
                <p className="text-base font-medium leading-relaxed opacity-78 sm:text-lg lg:ml-[calc(var(--s)*5)] lg:w-[calc(var(--s)*672)] lg:text-[calc(var(--s)*18)] lg:leading-[calc(var(--s)*32)]">
                  We turn early concepts to final deployment, we build reliable
                  software designed to solve real problems and scale with your
                  business.
                </p>
              </Reveal>
            </div>

            <Reveal
              delay={160}
              className="flex flex-wrap items-center gap-3 lg:gap-[calc(var(--s)*18)]"
            >
              <ButtonLink
                href="/contact"
                variant="ghost"
                className="h-11 rounded-full bg-setu px-6 font-semibold text-white hover:bg-setu-dark lg:h-[calc(var(--s)*40)] lg:w-[calc(var(--s)*202)] lg:justify-start lg:gap-[calc(var(--s)*10)] lg:pl-[calc(var(--s)*39)] lg:pr-0 lg:text-[calc(var(--s)*15)] lg:leading-[normal] dark:hover:bg-setu-dark"
              >
                Start A Project
                <ArrowRight
                  className="size-4 lg:h-[calc(var(--s)*12.5)] lg:w-[calc(var(--s)*13)]"
                  strokeWidth={2.4}
                  aria-hidden
                />
              </ButtonLink>
              <ButtonLink
                href="/contact?intent=consultation"
                variant="ghost"
                className="h-11 rounded-full border-[1.5px] border-white/60 px-6 font-semibold text-white hover:bg-white/12 lg:h-[calc(var(--s)*40)] lg:w-[calc(var(--s)*202)] lg:px-0 lg:text-[calc(var(--s)*15)] lg:leading-[normal]"
              >
                Free Consultation
              </ButtonLink>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
