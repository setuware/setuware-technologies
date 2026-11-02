import Image from "next/image";
import { ArrowRight, MapPin } from "lucide-react";

import { images } from "@/lib/images";
import { ButtonLink } from "@/components/ui/button";
import { Counter } from "@/components/ui/counter";
import {
  FadeUp,
  ImageReveal,
  Parallax,
  Stagger,
  StaggerItem,
} from "@/components/motion/primitives";
import { TextReveal } from "@/components/motion/text-reveal";

/**
 * "About us" band.
 *
 * Two columns on a soft gradient field: a team photograph with a smaller
 * overlapping photo and a frosted figure card on the left, the story and the
 * call to action on the right. On narrow screens the story comes first and
 * the photo composition follows at full width.
 *
 * Motion: the heading rises word by word and the story lines stagger in under
 * it; both photographs wipe up from behind a curtain and drift gently against
 * the scroll at different speeds; the figure counts up once it is on screen.
 */
export function AboutPreview() {
  return (
    <section className="overflow-hidden bg-[linear-gradient(115deg,color-mix(in_oklab,var(--color-brand-100)_55%,var(--background)),var(--background)_55%,color-mix(in_oklab,var(--color-brand-100)_35%,var(--background)))] py-20 md:py-28">
      <div className="container-page grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-20">
        <div className="flex flex-col gap-4 lg:order-2">
          <FadeUp y={16}>
            <p className="text-sm font-semibold tracking-[0.04em] text-primary">About us</p>
          </FadeUp>
          <TextReveal
            as="h2"
            className="font-display text-[2.2rem] font-semibold leading-tight text-foreground sm:text-[2.6rem]"
          >
            One partner from strategy to launch
          </TextReveal>
          <Stagger className="flex flex-col gap-4" delay={0.15}>
            <StaggerItem y={24}>
              <p className="text-[1.05rem] font-semibold text-foreground">
                A digital studio for growing businesses.
              </p>
            </StaggerItem>
            <StaggerItem y={24}>
              <p className="text-[0.97rem] leading-relaxed text-muted-foreground">
                We partner with startups, SMEs and established companies across India to plan,
                design and build digital products that perform.
              </p>
            </StaggerItem>
            <StaggerItem y={24}>
              <p className="text-[0.97rem] leading-relaxed text-muted-foreground">
                Product strategy, design, engineering and marketing work together in one
                accountable team, from your first website to enterprise software.
              </p>
            </StaggerItem>
            <StaggerItem y={24}>
              <ButtonLink
                href="/about"
                variant="secondary"
                className="group mt-3 w-fit rounded-full"
              >
                About Setuware
                <ArrowRight
                  className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </ButtonLink>
            </StaggerItem>
          </Stagger>
        </div>

        {/* Photo composition: percentages keep the overlap identical at every width. */}
        <div className="relative pb-[16%] pr-[8%] lg:order-1">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-10 top-1/4 size-72 rounded-full bg-setu/20 blur-[90px]"
          />

          {/* The shadow lives outside the clip so the wipe does not cut it off. */}
          <FadeUp
            y={0}
            blur={false}
            className="relative rounded-[1.75rem] shadow-[0_2px_4px_rgb(var(--shadow-color)/0.06),0_40px_80px_-40px_rgb(var(--shadow-color)/0.45)]"
          >
            <ImageReveal className="relative aspect-[4/3] rounded-[1.75rem]">
              {/* Overscanned so the scroll drift never shows an edge. */}
              <Parallax speed={20} className="absolute inset-x-0 -inset-y-[6%]">
                <Image
                  src={images.teamGroup.src}
                  alt={images.teamGroup.alt}
                  fill
                  sizes="(min-width: 1024px) 36rem, 92vw"
                  className="object-cover object-[50%_35%]"
                />
              </Parallax>
            </ImageReveal>

            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#0b1020] shadow-sm ring-1 ring-white/70 backdrop-blur-md sm:left-5 sm:top-5 sm:text-[0.8rem]">
              <MapPin className="size-3.5 text-setu" aria-hidden />
              Gurugram studio
            </span>
          </FadeUp>

          {/* Second photograph, overlapping the lower-right corner. */}
          <Parallax speed={-36} className="absolute bottom-0 right-0 w-[44%]">
            <FadeUp
              delay={0.25}
              y={0}
              blur={false}
              className="rounded-[1.25rem] shadow-[0_2px_4px_rgb(var(--shadow-color)/0.08),0_28px_56px_-24px_rgb(var(--shadow-color)/0.5)]"
            >
              <ImageReveal
                delay={0.3}
                className="relative aspect-[4/3] rounded-[1.25rem] border-[5px] border-surface bg-surface-2 sm:border-[6px]"
              >
                <div className="relative h-full w-full">
                  <Image
                    src={images.teamLaptop.src}
                    alt={images.teamLaptop.alt}
                    fill
                    sizes="(min-width: 1024px) 16rem, 42vw"
                    className="object-cover"
                  />
                </div>
              </ImageReveal>
            </FadeUp>
          </Parallax>

          {/* Frosted figure card over the lower-left of the main photograph. */}
          <FadeUp
            delay={0.4}
            y={20}
            className="absolute bottom-[calc(16%+0.75rem)] left-3 max-w-[48%] rounded-2xl bg-white/80 p-3.5 shadow-[0_18px_40px_-20px_rgba(11,16,32,0.55)] ring-1 ring-white/70 backdrop-blur-md sm:bottom-[calc(16%+1.25rem)] sm:left-5 sm:p-5"
          >
            <span className="block font-display text-[2.2rem] font-semibold leading-none tracking-tight text-[#0b1020] sm:text-[3.25rem]">
              <Counter to={10} suffix="+" durationMs={1800} />
            </span>
            <p className="mt-1.5 text-[0.78rem] font-semibold leading-snug text-[#0b1020]/80 sm:mt-2 sm:text-[0.92rem]">
              Digital services, delivered by one team
            </p>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
