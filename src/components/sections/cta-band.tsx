import { ArrowRight, Phone } from "lucide-react";

import { site } from "@/lib/site";
import { ButtonLink } from "@/components/ui/button";

export interface CtaBandProps {
  title?: string;
  description?: string;
  primaryHref?: string;
  primaryLabel?: string;
}

export function CtaBand({
  title = "Bring us the problem, not a spec",
  description = "Book a free 30-minute call. You get a written summary and a price range afterwards. If we are not the right team, we will say so on the call.",
  primaryHref = "/contact",
  primaryLabel = "Book a free 30-min call",
}: CtaBandProps) {
  return (
    <section className="relative overflow-hidden border-y border-border">
      <div
        className="absolute inset-0 bg-[linear-gradient(120deg,var(--color-brand-700),var(--color-brand-600)_45%,var(--color-accent-600))]"
        aria-hidden
      />
      <div className="absolute inset-0 bg-grid opacity-25" aria-hidden />

      <div className="container-page relative py-16 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
            {title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[1.02rem] leading-relaxed text-white/85">
            {description}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink
              href={primaryHref}
              size="lg"
              className="bg-white text-brand-700 shadow-none hover:bg-white/92"
            >
              {primaryLabel}
              <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
            <ButtonLink
              href={site.phoneHref}
              size="lg"
              variant="ghost"
              className="border border-white/30 text-white hover:bg-white/12"
            >
              <Phone className="size-4" aria-hidden />
              {site.phone}
            </ButtonLink>
          </div>

          <p className="mt-5 text-xs text-white/70">
            Or email {site.salesEmail} · Mon–Fri, 10:00–19:00 IST
          </p>
        </div>
      </div>
    </section>
  );
}
