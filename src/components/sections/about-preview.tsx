import Image from "next/image";

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
 * Three columns — story, photograph, headline figure — on a soft gradient
 * field, collapsing to a single column on narrow screens.
 *
 * Motion: the heading rises word by word and the story lines stagger in under
 * it; the photograph wipes up from behind a curtain, settles from a zoom and
 * then drifts gently against the scroll inside its frame; the figure counts
 * up once it is on screen.
 */
export function AboutPreview() {
  return (
    <section className="bg-[linear-gradient(115deg,color-mix(in_oklab,var(--color-brand-100)_55%,var(--background)),var(--background)_55%,color-mix(in_oklab,var(--color-brand-100)_35%,var(--background)))] py-20 md:py-28">
      <div className="container-page grid items-center gap-10 lg:grid-cols-[1fr_0.9fr_0.7fr] lg:gap-14">
        <div className="flex flex-col gap-4">
          <FadeUp y={16}>
            <p className="text-sm font-semibold tracking-[0.04em] text-primary">
              About us
            </p>
          </FadeUp>
          <TextReveal
            as="h2"
            className="font-display text-[2.4rem] font-semibold leading-tight text-foreground"
          >
            Strategy, design and engineering under one roof
          </TextReveal>
          <Stagger className="flex flex-col gap-4" delay={0.15}>
            <StaggerItem y={24}>
              <p className="text-[1.02rem] font-semibold text-foreground">
                A digital studio for growing businesses.
              </p>
            </StaggerItem>
            <StaggerItem y={24}>
              <p className="text-[0.92rem] leading-relaxed text-muted-foreground">
                We partner with startups, SMEs and established companies across
                India to plan, design and build digital products that perform.
              </p>
            </StaggerItem>
            <StaggerItem y={24}>
              <p className="text-[0.92rem] leading-relaxed text-muted-foreground">
                Product strategy, design, engineering and marketing work
                together in one accountable team, from your first website to
                enterprise software.
              </p>
            </StaggerItem>
            <StaggerItem y={24}>
              <ButtonLink
                href="/about"
                variant="secondary"
                className="mt-3 w-fit rounded-full"
              >
                About Setuware
              </ButtonLink>
            </StaggerItem>
          </Stagger>
        </div>

        {/* The shadow lives outside the clip so the wipe does not cut it off. */}
        <FadeUp y={0} blur={false} className="rounded-[1.5rem] shadow-ambient">
          <ImageReveal delay={0.1} className="relative aspect-[9/10] rounded-[1.5rem]">
            {/* Overscanned so the scroll drift never shows an edge. */}
            <Parallax speed={24} className="absolute inset-x-0 -inset-y-[6%]">
              <Image
                src={images.aboutOffice.src}
                alt={images.aboutOffice.alt}
                fill
                sizes="(min-width: 1024px) 28rem, 90vw"
                className="object-cover"
              />
            </Parallax>
          </ImageReveal>
        </FadeUp>

        <FadeUp delay={0.2} className="flex flex-col gap-5">
          <div>
            <span className="font-display text-[5.5rem] font-semibold leading-[0.85] tracking-tight text-foreground">
              <Counter to={10} suffix="+" durationMs={1800} />
            </span>
            <p className="mt-3 max-w-[16rem] font-display text-xl font-semibold leading-tight text-foreground">
              Digital services, delivered by one team
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
