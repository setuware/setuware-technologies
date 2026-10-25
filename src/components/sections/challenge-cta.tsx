import { ArrowRight } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";

/**
 * Mid-page conversion band.
 *
 * Deliberately plain: it sits between two dense sections, so the contrast
 * comes from the whitespace rather than another gradient.
 */
export function ChallengeCta() {
  return (
    <section className="bg-background py-16 md:py-20">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold leading-tight text-foreground sm:text-[2.2rem]">
            Have a challenge to solve or an
            <br className="hidden sm:block" /> idea to explore?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[0.88rem] leading-relaxed text-muted-foreground">
            Book a free consultation with our team to discuss your needs and
            discover how the right software can help your business work smarter.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="/contact" variant="gradient" className="rounded-full">
              Start A Project
              <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
            <ButtonLink
              href="/contact?intent=consultation"
              variant="secondary"
              className="rounded-full"
            >
              Book a Free Consultation
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
