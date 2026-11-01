import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { images } from "@/lib/images";
import { testimonials } from "@/lib/content";
import { Counter } from "@/components/ui/counter";
import { Reveal } from "@/components/ui/reveal";

const REASONS = [
  {
    title: "Built Around Real Workflows",
    body: "We understand how businesses operate before building solutions that address their real-world challenges.",
  },
  {
    title: "Designed for Simplicity",
    body: "We turn complex processes into intuitive, connected experiences that help teams work more efficiently.",
  },
  {
    title: "Engineered for Reliability",
    body: "We build secure, scalable software designed for dependable day-to-day operations and long-term growth.",
  },
] as const;

/**
 * Industry band.
 *
 * A five-tile bento on a 3-column grid: pull quote, satisfaction figure and
 * a case-study image card on the top row; project count and the reasons
 * column beneath. Tiles reflow to one column on narrow screens.
 */
export function IndustryBento() {
  const lead = testimonials[0];

  return (
    <section className="bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-brand-100)_70%,var(--background)),color-mix(in_oklab,var(--color-brand-100)_40%,var(--background)))] py-20 md:py-28">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold leading-tight text-foreground sm:text-[2.4rem]">
            Software designed for your industry.
            <br className="hidden sm:block" /> Built for your growth.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[0.9rem] leading-relaxed text-muted-foreground">
            We combine deep workflow understanding with thoughtful engineering
            to build dependable software that simplifies operations, reduces
            manual work, and supports long-term business growth.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <Reveal>
            <figure className="flex h-full flex-col gap-4 rounded-[1.25rem] bg-surface p-6 shadow-ambient">
              <figcaption className="font-display text-[1.05rem] font-semibold leading-snug text-foreground">
                Better Workflows,
                <br />
                Less Hassle
              </figcaption>
              <blockquote className="text-[0.82rem] leading-relaxed text-muted-foreground">
                “{lead.quote}”
              </blockquote>
              <div className="mt-auto flex items-center gap-2.5 pt-2">
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--color-brand-600),var(--color-accent-500))] text-[10px] font-semibold text-white">
                  {lead.initials}
                </span>
                <span>
                  <span className="block text-xs font-semibold text-foreground">
                    {lead.author}
                  </span>
                  <span className="block text-[10px] text-muted-foreground">
                    {lead.role} at {lead.company}
                  </span>
                </span>
              </div>
            </figure>
          </Reveal>

          <Reveal delay={70}>
            <div className="flex h-full flex-col justify-center rounded-[1.25rem] bg-surface p-7 shadow-ambient">
              <span className="font-display text-[3.4rem] font-semibold leading-none text-foreground">
                <Counter to={95} suffix="%" />
              </span>
              <p className="mt-6 text-[0.95rem] font-medium leading-snug text-foreground">
                Customer
                <br />
                satisfaction rate
              </p>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <Link
              href="/work/fintech-dashboard-rebuild"
              className="group relative flex h-full min-h-[14rem] flex-col justify-end overflow-hidden rounded-[1.25rem] p-6 shadow-ambient"
            >
              <Image
                src={images.caseStudyFeature.src}
                alt={images.caseStudyFeature.alt}
                fill
                sizes="(min-width: 768px) 22rem, 90vw"
                className="object-cover"
              />
              <div
                className="absolute inset-0 bg-[linear-gradient(to_top,rgba(10,13,22,0.88),rgba(10,13,22,0.25))]"
                aria-hidden
              />
              <p className="relative text-[0.95rem] font-semibold leading-snug text-white">
                $4M raised: the strategy behind Tera&apos;s growth
              </p>
              <span className="relative mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-white/40 px-4 py-1.5 text-[11px] font-medium text-white transition-colors group-hover:bg-white/15">
                View Case Study
                <ArrowUpRight
                  className="size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden
                />
              </span>
            </Link>
          </Reveal>

          <Reveal delay={210}>
            <div className="flex h-full flex-col rounded-[1.25rem] bg-surface p-6 shadow-ambient">
              <div className="flex -space-x-2">
                {testimonials.map((person) => (
                  <span
                    key={person.author}
                    className="inline-flex size-9 items-center justify-center rounded-full border-2 border-surface bg-[linear-gradient(135deg,var(--color-brand-600),var(--color-accent-500))] text-[10px] font-semibold text-white"
                  >
                    {person.initials}
                  </span>
                ))}
              </div>
              <span className="mt-8 font-display text-[3rem] font-semibold leading-none text-foreground">
                <Counter to={25} suffix="+" />
              </span>
              <p className="mt-4 text-[0.82rem] leading-relaxed text-muted-foreground">
                We have delivered 25+ projects that help companies generate real
                results.
              </p>
            </div>
          </Reveal>

          <Reveal delay={280} className="md:col-span-2">
            <div className="grid h-full gap-6 rounded-[1.25rem] bg-surface p-6 shadow-ambient sm:grid-cols-[9rem_1fr] md:p-7">
              <h3 className="font-display text-[1.15rem] font-semibold text-foreground">
                Why Setuware Technologies?
              </h3>

              <dl className="flex flex-col">
                {REASONS.map((reason, index) => (
                  <div
                    key={reason.title}
                    className={index > 0 ? "border-t border-border pt-4 mt-4" : undefined}
                  >
                    <dt className="text-[0.85rem] font-semibold text-foreground">
                      {reason.title}
                    </dt>
                    <dd className="mt-1 text-[0.8rem] leading-relaxed text-muted-foreground">
                      {reason.body}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
