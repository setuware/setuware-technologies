import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { images } from "@/lib/images";
import { heroBackdropPoster, heroBackdropSources } from "@/lib/media";
import { ButtonLink } from "@/components/ui/button";
import { HeroBackdrop } from "@/components/interactive/hero-backdrop";

/**
 * Full-bleed hero.
 *
 * The background is a photograph by default and a video when one is
 * configured — `HeroBackdrop` takes over the whole layer in that case. Either
 * way a dark scrim sits between the media and the copy so the headline holds
 * its contrast ratio regardless of what is behind it.
 *
 * `priority` on the image: this is the Largest Contentful Paint element, so it
 * must not wait behind lazy-loaded resources.
 */
export function Hero() {
  const videoSources = heroBackdropSources();

  return (
    <section className="relative isolate overflow-hidden bg-[#0a0d16]">
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

      <div className="container-page relative flex min-h-[clamp(30rem,76vh,42rem)] flex-col justify-center pb-16 pt-36 md:pb-24 md:pt-44">
        <h1 className="max-w-3xl font-semibold leading-[1.04] text-white text-[2.75rem] sm:text-6xl lg:text-[4.1rem]">
          From ideas to
          <br />
          production-ready software.
        </h1>

        <p className="mt-6 max-w-lg text-[0.98rem] leading-relaxed text-white/75">
          We turn early concepts into final deployment — building reliable
          software designed to solve real problems and scale with your business.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <ButtonLink href="/contact" size="lg" variant="gradient" className="rounded-full">
            Start A Project
            <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
          <ButtonLink
            href="/contact?intent=consultation"
            size="lg"
            variant="ghost"
            className="rounded-full border border-white/30 text-white hover:bg-white/12"
          >
            Free Consultation
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
