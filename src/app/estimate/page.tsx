import {
  ArrowRight,
  Calculator,
  CalendarClock,
  FileSignature,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { cn } from "@/lib/utils";
import { Estimator } from "@/components/interactive/estimator";
import { PageHero } from "@/components/layout/page-hero";
import { CARD, IconTile, SectionIntro } from "@/components/sections/page-blocks";
import { ButtonLink } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { FadeUp, Stagger, StaggerItem } from "@/components/motion/primitives";

export const metadata = pageMetadata({
  title: "Website & App Development Cost Calculator",
  description:
    "Estimate the cost of your website, e-commerce store, app or custom software in India, with an indicative timeline, team size and payment milestones.",
  path: "/estimate",
});

const ASSURANCES = [
  {
    Icon: Calculator,
    text: "Calculated from the rate card used for our proposals",
  },
  {
    Icon: ShieldCheck,
    text: "No sign-up required, and no details shared without your consent",
  },
  {
    Icon: Sparkles,
    text: "A shareable link that preserves your selections",
  },
] as const;

const AFTER_ESTIMATE = [
  {
    Icon: Calculator,
    title: "Indicative estimate",
    body: "A price range, timeline, team size and milestone schedule based on the options you select.",
  },
  {
    Icon: CalendarClock,
    title: "Free consultation",
    body: "A 30-minute call to review your requirements and refine the scope behind the estimate.",
  },
  {
    Icon: FileSignature,
    title: "Fixed-price proposal",
    body: "A written scope, timeline and fixed price, agreed before any work begins.",
  },
] as const;

export default function EstimatePage() {
  return (
    <>
      <PageHero
        eyebrow="Instant estimate"
        title="Estimate your project"
        description="Select a service, scope and features to receive an indicative price range, timeline, team size and payment schedule."
      >
        <ul className="mx-auto mt-8 flex max-w-3xl flex-col gap-2.5 sm:flex-row sm:justify-center sm:gap-6">
          {ASSURANCES.map(({ Icon, text }) => (
            <li
              key={text}
              className="flex items-start gap-2 text-xs leading-snug text-muted-foreground sm:max-w-[16rem]"
            >
              <Icon className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
              {text}
            </li>
          ))}
        </ul>
      </PageHero>

      <Section surface="tint" className="py-12 md:py-16">
        <div className="container-page">
          <Estimator />
        </div>
      </Section>

      <Section surface="grid">
        <div className="container-page">
          <SectionIntro
            eyebrow="Next steps"
            title="From estimate to fixed-price proposal"
            description="The estimate is a starting point. Your final price is confirmed in a written proposal after a short discovery call."
          />

          <Stagger as="ol" className="relative mt-14 grid gap-5 md:grid-cols-3" stagger={0.08}>
            <span
              aria-hidden
              className="pointer-events-none absolute left-[16.6%] right-[16.6%] top-[2.9rem] hidden h-px bg-gradient-to-r from-setu/0 via-setu/50 to-setu/0 md:block"
            />
            {AFTER_ESTIMATE.map(({ Icon, title, body }, index) => (
              <StaggerItem
                key={title}
                as="li"
                y={22}
                className={cn(CARD, "relative flex h-full flex-col items-start p-6 md:items-center md:text-center")}
              >
                <IconTile className="relative size-11 rounded-full bg-setu bg-none text-white ring-0 shadow-[0_0_0_6px_rgb(0_161_198/0.12)]">
                  <Icon className="size-5" aria-hidden />
                </IconTile>
                <span className="mt-5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-setu">
                  Step {index + 1}
                </span>
                <h3 className="mt-1.5 text-lg font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-[0.9rem] leading-relaxed text-muted-foreground">{body}</p>
              </StaggerItem>
            ))}
          </Stagger>

          <FadeUp y={16} className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink
              href="/contact"
              className="rounded-full bg-setu text-white shadow-none hover:bg-setu-dark"
            >
              Book a consultation
              <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
            <ButtonLink href="/pricing" variant="secondary" className="rounded-full">
              View pricing
            </ButtonLink>
          </FadeUp>
        </div>
      </Section>
      <JsonLd data={breadcrumbJsonLd([{ name: "Cost estimate", path: "/estimate" }])} />
    </>
  );
}
