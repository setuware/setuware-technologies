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
  title = "Discuss your project with our team",
  description = "Book a free 30-minute consultation. We will review your requirements and follow up with a recommended approach and an indicative budget.",
  primaryHref = "/contact",
  primaryLabel = "Book a consultation",
}: CtaBandProps) {
  return (
    <section className="relative bg-background-subtle py-14 md:py-20">
      <div className="container-page">
        <div className="relative isolate overflow-hidden rounded-[1.75rem] bg-[linear-gradient(120deg,#055a70,#007891_45%,#1d4ed8)] shadow-[0_30px_60px_-30px_rgb(0_137_169/0.6)]">
          <div
            className="pointer-events-none absolute -right-20 -top-24 -z-10 size-80 rounded-full bg-white/20 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_30%,transparent_100%)]"
            aria-hidden
          />

          <div className="relative px-6 py-14 md:px-12 md:py-16">
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
                  className="rounded-full bg-white text-[#055a70] shadow-none hover:bg-white/92"
                >
                  {primaryLabel}
                  <ArrowRight className="size-4" aria-hidden />
                </ButtonLink>
                <ButtonLink
                  href={site.phoneHref}
                  size="lg"
                  variant="ghost"
                  className="rounded-full border border-white/40 text-white hover:bg-white/12"
                >
                  <Phone className="size-4" aria-hidden />
                  {site.phone}
                </ButtonLink>
              </div>

              <p className="mt-5 text-xs text-white/85">
                Or email {site.salesEmail} · {site.hours}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
