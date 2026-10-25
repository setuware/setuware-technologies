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
  title = "Tell us what you are trying to ship",
  description = "A 45-minute call, a written summary and a ballpark range. If we are not the right team for it, we will tell you on that call and point you somewhere better.",
  primaryHref = "/contact",
  primaryLabel = "Start a project",
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
            Or email {site.salesEmail} · We reply within one working day
          </p>
        </div>
      </div>
    </section>
  );
}
