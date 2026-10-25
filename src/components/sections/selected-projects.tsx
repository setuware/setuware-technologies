import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { featuredCaseStudies } from "@/lib/content";
import { images } from "@/lib/images";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

/**
 * "Selected Projects".
 *
 * The lead project sits on a stack of offset cards, as in the design — the
 * cards behind are decorative and `aria-hidden`, so the stack reads as one
 * item rather than three empty ones.
 */
export function SelectedProjects() {
  const lead = featuredCaseStudies[0];

  return (
    <section id="work" className="bg-background py-20 md:py-28">
      <div className="container-page">
        <h2 className="text-center font-display text-3xl font-semibold leading-tight text-foreground sm:text-[2.4rem]">
          Selected Projects
        </h2>

        <Reveal className="relative mx-auto mt-12 max-w-4xl">
          {/* Offset cards behind the active project. */}
          <div
            className="absolute inset-x-10 -top-4 h-16 rounded-[1.25rem] border border-border bg-surface-2/70"
            aria-hidden
          />
          <div
            className="absolute inset-x-5 -top-2 h-16 rounded-[1.25rem] border border-border bg-surface/90"
            aria-hidden
          />

          <article className="relative grid overflow-hidden rounded-[1.25rem] border border-border bg-surface shadow-ambient md:grid-cols-[0.85fr_1fr]">
            <div className="relative min-h-[16rem] bg-[linear-gradient(150deg,#0f172a,#2563eb)]">
              <Image
                src={images.projectMedicare.src}
                alt={images.projectMedicare.alt}
                fill
                sizes="(min-width: 768px) 22rem, 90vw"
                className="object-cover"
              />
            </div>

            <div className="flex flex-col gap-4 p-7 md:p-9">
              <h3 className="font-display text-[1.45rem] font-semibold leading-tight text-foreground">
                MediCare — Healthcare
                <br />
                management app
              </h3>
              <p className="max-w-sm text-[0.86rem] leading-relaxed text-muted-foreground">
                A user-friendly mobile app that helps patients manage
                appointments, access medical records, connect with healthcare
                providers, and stay on top of their health — all in one place.
              </p>

              <Link
                href={`/work/${lead.slug}`}
                className="group mt-auto inline-flex w-fit items-center gap-2 rounded-full border border-border px-5 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                View Project
                <ArrowUpRight
                  className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden
                />
              </Link>
            </div>
          </article>
        </Reveal>

        <div className="mt-10 flex justify-center">
          <ButtonLink
            href="/work"
            className="rounded-full bg-foreground text-background shadow-none hover:bg-foreground/85"
          >
            Explore More Projects
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
