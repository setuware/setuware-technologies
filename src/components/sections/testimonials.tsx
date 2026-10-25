import { Check, Quote, Star } from "lucide-react";

import { testimonials } from "@/lib/content";
import { Reveal } from "@/components/ui/reveal";

/**
 * "Real words, real people".
 *
 * Each card carries the quote plus the two outcomes that client measured —
 * the numbers are what make a testimonial worth reading.
 */
export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="bg-[linear-gradient(180deg,var(--background),color-mix(in_oklab,var(--color-brand-100)_40%,var(--background)))] py-20 md:py-28"
    >
      <div className="container-page">
        <h2 className="text-center font-display text-3xl font-semibold leading-tight text-foreground sm:text-[2.4rem]">
          Real words, real people
        </h2>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Reveal key={testimonial.author} delay={index * 80}>
              <figure className="flex h-full flex-col gap-4 rounded-[1.25rem] bg-surface p-6 shadow-ambient">
                <Quote className="size-5 text-primary/45" aria-hidden />

                <div className="flex gap-0.5" role="img" aria-label="Rated 5 out of 5">
                  {Array.from({ length: 5 }).map((_, star) => (
                    <Star
                      key={star}
                      className="size-3 fill-amber-400 text-amber-400"
                      aria-hidden
                    />
                  ))}
                </div>

                <blockquote className="text-[0.82rem] leading-relaxed text-muted-foreground">
                  “{testimonial.quote}”
                </blockquote>

                <figcaption className="pt-1">
                  <span className="block text-[0.85rem] font-semibold text-foreground">
                    {testimonial.author}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    {testimonial.role}, {testimonial.company}
                  </span>
                </figcaption>

                <ul className="mt-auto flex flex-col gap-1.5 border-t border-border pt-4">
                  {testimonial.outcomes.map((outcome) => (
                    <li
                      key={outcome}
                      className="flex items-center gap-2 text-[11px] text-muted-foreground"
                    >
                      <Check className="size-3 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
                      {outcome}
                    </li>
                  ))}
                </ul>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
