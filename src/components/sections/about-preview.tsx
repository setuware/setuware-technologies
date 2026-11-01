import Image from "next/image";

import { images } from "@/lib/images";
import { testimonials } from "@/lib/content";
import { ButtonLink } from "@/components/ui/button";
import { Counter } from "@/components/ui/counter";
import { Reveal } from "@/components/ui/reveal";

/**
 * "About us" band.
 *
 * Three columns — story, photograph, headline figure — on a soft gradient
 * field, collapsing to a single column on narrow screens.
 */
export function AboutPreview() {
  return (
    <section className="bg-[linear-gradient(115deg,color-mix(in_oklab,var(--color-brand-100)_55%,var(--background)),var(--background)_55%,color-mix(in_oklab,var(--color-brand-100)_35%,var(--background)))] py-20 md:py-28">
      <div className="container-page grid items-center gap-10 lg:grid-cols-[1fr_0.9fr_0.7fr] lg:gap-14">
        <Reveal className="flex flex-col gap-4">
          <h2 className="font-display text-[2.4rem] font-semibold leading-tight text-foreground">
            About us
          </h2>
          <p className="text-[1.02rem] font-semibold text-foreground">
            Purpose-built software. Real-world impact.
          </p>
          <p className="text-[0.92rem] leading-relaxed text-muted-foreground">
            Setuware Technologies is a software company building industry-specific platforms
            that simplify complex operations, connect fragmented workflows, and
            help businesses operate with greater clarity and confidence.
          </p>
          <p className="text-[0.92rem] leading-relaxed text-muted-foreground">
            We believe software should adapt to the way businesses work — not
            force businesses to adapt to the software. That is why we create
            purpose-built solutions designed around the unique challenges,
            processes and needs of each industry.
          </p>
          <ButtonLink
            href="/about"
            variant="secondary"
            className="mt-3 w-fit rounded-full"
          >
            More About Us
          </ButtonLink>
        </Reveal>

        <Reveal delay={90}>
          <div className="relative aspect-[9/10] overflow-hidden rounded-[1.5rem] shadow-ambient">
            <Image
              src={images.aboutOffice.src}
              alt={images.aboutOffice.alt}
              fill
              sizes="(min-width: 1024px) 28rem, 90vw"
              className="object-cover"
            />
          </div>
        </Reveal>

        <Reveal delay={160} className="flex flex-col gap-5">
          <div>
            <span className="font-display text-[5.5rem] font-semibold leading-[0.85] tracking-tight text-foreground">
              <Counter to={5} suffix="+" />
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
              Trusted by industry leaders
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
