import { ArrowRight, Calculator, Clock, FileText } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";

const POINTS = [
  {
    Icon: Calculator,
    title: "Indicative price range",
    body: "Calculated from our published rate card and updated as you select options.",
  },
  {
    Icon: Clock,
    title: "Timeline and team size",
    body: "The expected duration and team size for your scope.",
  },
  {
    Icon: FileText,
    title: "Payment milestones",
    body: "A payment schedule across discovery, design, development and launch.",
  },
] as const;

/** Home-page bridge into the estimator, the site's main conversion path. */
export function EstimatorTeaser() {
  return (
    <Section surface="dots">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-surface p-7 shadow-[0_1px_2px_rgb(15_23_42/0.04),0_24px_48px_-24px_rgb(15_23_42/0.18)] dark:border-border md:p-12">
          <div
            className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_28%,transparent),transparent_70%)] blur-2xl"
            aria-hidden
          />

          <div className="relative grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Instant estimate
              </span>
              <h2 className="mt-3 text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
                Estimate your
                <span className="text-gradient"> project investment</span>
              </h2>
              <p className="mt-4 max-w-lg text-[1.02rem] leading-relaxed text-muted-foreground">
                Select a service, scope and timeline to receive an indicative price
                range, delivery schedule and payment plan.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/estimate" size="lg" variant="gradient">
                  Open the estimator
                  <ArrowRight className="size-4" aria-hidden />
                </ButtonLink>
                <ButtonLink href="/pricing" size="lg" variant="secondary">
                  View pricing
                </ButtonLink>
              </div>
            </div>

            <ul className="flex flex-col gap-4">
              {POINTS.map(({ Icon, title, body }, index) => (
                <Reveal
                  key={title}
                  as="li"
                  delay={index * 80}
                  className="flex gap-4 rounded-2xl border border-border bg-background-subtle p-4"
                >
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">
                      {title}
                    </span>
                    <span className="mt-1 block text-[0.85rem] leading-snug text-muted-foreground">
                      {body}
                    </span>
                  </span>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}
