import { Check } from "lucide-react";

import { projectPackages } from "@/lib/plans";
import { cn, formatINR } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

/**
 * "Flexible plans".
 *
 * Enterprise is quoted rather than priced, which is why `setupFrom` of 0
 * renders as "Custom" and swaps the call to action to a call booking — a
 * ₹0 price would read as free.
 */
export function FlexiblePlans() {
  return (
    <section id="pricing" className="bg-background py-20 md:py-28">
      <div className="container-page">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-3xl font-semibold leading-tight text-foreground sm:text-[2.4rem]">
            Flexible plans
          </h2>
          <p className="mt-4 text-[0.9rem] leading-relaxed text-muted-foreground">
            We have got you covered. Whether you are here for the long game or a
            sharp one-off.
          </p>
        </div>

        <div className="mt-12 grid items-stretch gap-5 lg:grid-cols-3">
          {projectPackages.map((plan, index) => {
            const quoted = !plan.setupFrom;

            return (
              <Reveal key={plan.id} delay={index * 80}>
                <article
                  className={cn(
                    "flex h-full flex-col rounded-[1.25rem] p-6 md:p-7",
                    plan.highlight
                      ? "bg-[linear-gradient(170deg,color-mix(in_oklab,var(--color-brand-200)_55%,white),color-mix(in_oklab,var(--color-brand-100)_70%,white))] text-[#0a0d16] shadow-glow dark:text-[#0a0d16]"
                      : "border border-border bg-surface-2/60 shadow-ambient",
                  )}
                >
                  <h3 className="text-[1.05rem] font-semibold">{plan.name}</h3>
                  <p
                    className={cn(
                      "mt-1.5 text-[0.8rem]",
                      plan.highlight ? "text-[#0a0d16]/65" : "text-muted-foreground",
                    )}
                  >
                    {plan.tagline}
                  </p>

                  <p
                    className={cn(
                      "mt-6 text-[0.78rem] font-semibold",
                      plan.highlight ? "text-[#0a0d16]/70" : "text-muted-foreground",
                    )}
                  >
                    What&apos;s included:
                  </p>

                  <ul className="mt-3 flex flex-col gap-2.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-2.5 text-[0.84rem]">
                        <Check
                          className={cn(
                            "mt-0.5 size-3.5 shrink-0",
                            plan.highlight ? "text-[#0a0d16]" : "text-primary",
                          )}
                          aria-hidden
                        />
                        <span
                          className={plan.highlight ? "text-[#0a0d16]/85" : "text-foreground/85"}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-8">
                    {quoted ? (
                      <p className="text-[0.78rem] text-muted-foreground">
                        Priced per engagement
                      </p>
                    ) : (
                      <>
                        <p
                          className={cn(
                            "text-[0.75rem]",
                            plan.highlight ? "text-[#0a0d16]/60" : "text-muted-foreground",
                          )}
                        >
                          Starts from
                        </p>
                        <p className="mt-0.5 font-display text-[1.6rem] font-semibold">
                          {formatINR(plan.setupFrom ?? 0).replace("₹", "Rs. ")}
                        </p>
                      </>
                    )}

                    <ButtonLink
                      href={quoted ? "/contact?intent=consultation" : "/estimate"}
                      block
                      variant={plan.highlight ? "gradient" : "secondary"}
                      className="mt-4 rounded-full"
                    >
                      {quoted ? "Book a Call" : "Get Started"}
                    </ButtonLink>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
