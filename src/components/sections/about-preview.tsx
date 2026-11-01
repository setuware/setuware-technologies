import Image from "next/image";

import { images } from "@/lib/images";
import { testimonials } from "@/lib/content";
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
          <TextReveal
            as="h2"
            className="font-display text-[2.4rem] font-semibold leading-tight text-foreground"
          >
            About us
          </TextReveal>
          <Stagger className="flex flex-col gap-4" delay={0.15}>
            <StaggerItem y={24}>
              <p className="text-[1.02rem] font-semibold text-foreground">
                Purpose-built software. Real-world impact.
              </p>
            </StaggerItem>
            <StaggerItem y={24}>
              <p className="text-[0.92rem] leading-relaxed text-muted-foreground">
                Setuware Technologies is a senior engineering team in Gurugram.
                We design, build and run web apps, mobile apps and the cloud
                they live on, for businesses whose software has to work on
                Monday morning.
              </p>
            </StaggerItem>
            <StaggerItem y={24}>
              <p className="text-[0.92rem] leading-relaxed text-muted-foreground">
                We start with how your team works today: the spreadsheets, the
                hand-offs, the steps someone still does by hand. Then we build
                around that. A fixed-price scope before any code, a staging URL
                from the first sprint, and the repo in your name from day one.
              </p>
            </StaggerItem>
            <StaggerItem y={24}>
              <ButtonLink
                href="/about"
                variant="secondary"
                className="mt-3 w-fit rounded-full"
              >
                More About Us
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
              <Counter to={5} suffix="+" durationMs={1800} />
            </span>
            <p className="mt-3 font-display text-xl font-semibold leading-tight text-foreground">
              Years of
              <br />
              experience
            </p>
          </div>

          <div>
            {/* Initials, not stock headshots: real people, no invented faces. */}
            <div className="flex -space-x-2">
              {testimonials.map((person) => (
                <span
                  key={person.author}
                  title={`${person.author}, ${person.company}`}
                  className="inline-flex size-10 items-center justify-center rounded-full border-2 border-background bg-[linear-gradient(135deg,var(--color-brand-600),var(--color-accent-500))] text-xs font-semibold text-white"
                >
                  {person.initials}
                </span>
              ))}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Teams who have shipped with us
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
