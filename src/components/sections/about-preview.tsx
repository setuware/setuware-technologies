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
            {"One team, from website\nto software"}
          </TextReveal>
          <Stagger className="flex flex-col gap-4" delay={0.15}>
            <StaggerItem y={24}>
              <p className="text-[1.02rem] font-semibold text-foreground">
                A design and build studio in Gurugram.
              </p>
            </StaggerItem>
            <StaggerItem y={24}>
              <p className="text-[0.92rem] leading-relaxed text-muted-foreground">
                Most clients start with a website. When they need an online
                store, an app, a brand refresh or a CRM, the same team builds
                it.
              </p>
            </StaggerItem>
            <StaggerItem y={24}>
              <p className="text-[0.92rem] leading-relaxed text-muted-foreground">
                Every project has a fixed written quote, weekly progress on a
                live preview and one point of contact. The domain, code and
                hosting accounts are registered in your name.
              </p>
            </StaggerItem>
            <StaggerItem y={24}>
              <ButtonLink
                href="/about"
                variant="secondary"
                className="mt-3 w-fit rounded-full"
              >
                Meet the team
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
              <Counter to={100} suffix="%" durationMs={1800} />
            </span>
            <p className="mt-3 font-display text-xl font-semibold leading-tight text-foreground">
              Ownership of your
              <br />
              code and accounts
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
            <a
              href="#testimonials"
              className="mt-3 inline-block text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Read client feedback
            </a>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
