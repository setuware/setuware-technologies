import Image from "next/image";

import { images } from "@/lib/images";
import { ButtonLink } from "@/components/ui/button";
import { HeroVideo } from "@/components/interactive/hero-video";
import { heroVideoPoster, heroVideoSources } from "@/lib/media";

/**
 * Skills-gap band.
 *
 * Dark panel with a portrait bleeding in from the right. When a hero video is
 * configured it plays here instead of the still, which is what gives the
 * section its play affordance — a decorative play button over a static image
 * promises something that does not happen.
 */
export function SkillsGap() {
  const videoSources = heroVideoSources();

  return (
    <section className="bg-background py-6">
      <div className="container-page">
        <div className="relative isolate overflow-hidden rounded-[1.5rem] bg-[#16343f]">
          <div className="absolute inset-y-0 right-0 w-[58%] md:w-[52%]">
            {videoSources.length > 0 ? (
              <HeroVideo
                sources={videoSources}
                poster={heroVideoPoster() ?? images.skillsGap.src}
                fallback={
                  <Image
                    src={images.skillsGap.src}
                    alt={images.skillsGap.alt}
                    fill
                    sizes="55vw"
                    className="object-cover"
                  />
                }
                className="size-full [&_video]:size-full [&_video]:rounded-none [&_video]:border-0 [&_video]:object-cover"
              />
            ) : (
              <Image
                src={images.skillsGap.src}
                alt={images.skillsGap.alt}
                fill
                sizes="55vw"
                className="object-cover"
              />
            )}
          </div>

          <div
            className="absolute inset-0 bg-[linear-gradient(95deg,#16343f_0%,rgba(22,52,63,0.92)_42%,rgba(22,52,63,0.35)_75%,transparent_100%)]"
            aria-hidden
          />

          <div className="relative max-w-lg px-7 py-16 md:px-12 md:py-20">
            <h2 className="font-display text-3xl font-semibold leading-tight text-white sm:text-[2.3rem]">
              This is how
              <br />
              we jetpack over the
              <br />
              skills gap.
            </h2>
            <p className="mt-5 max-w-sm text-[0.88rem] leading-relaxed text-white/70">
              Access senior engineers on a full-service delivery team,
              customised to meet your needs. No six-month recruitment cycle
              before you can ship — this is how modern teams scale.
            </p>

            <ButtonLink
              href="/contact"
              className="mt-8 rounded-full border border-white/35 bg-transparent text-white shadow-none hover:bg-white/12"
            >
              Let&apos;s talk
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
