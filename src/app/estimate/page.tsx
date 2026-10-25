import { Calculator, ShieldCheck, Sparkles } from "lucide-react";

import { pageMetadata } from "@/lib/seo";
import { Estimator } from "@/components/interactive/estimator";
import { CtaBand } from "@/components/sections/cta-band";
import { PageHero } from "@/components/layout/page-hero";

export const metadata = pageMetadata({
  title: "Instant project quote",
  description:
    "Price your web app, mobile app or hosting project in about a minute. Real ranges from our rate card, with timeline, squad size and payment milestones.",
  path: "/estimate",
});

const ASSURANCES = [
  {
    Icon: Calculator,
    text: "Priced from the same rate card we quote from — no inflated anchor number",
  },
  {
    Icon: ShieldCheck,
    text: "No call required, and nothing is sent until you ask for it",
  },
  {
    Icon: Sparkles,
    text: "Share the link with your team; the configuration travels with the URL",
  },
] as const;

export default function EstimatePage() {
  return (
    <>
      <PageHero
        eyebrow="Instant quote"
        title="What will it cost, and how long will it take?"
        description="Answer five questions. You get a priced range, a timeline, the squad we would put on it and the payment milestones — before you speak to anyone."
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

      <div className="container-page py-12 md:py-16">
        <Estimator />
      </div>

      <CtaBand
        title="Prefer to just talk it through?"
        description="Some projects are easier to scope in conversation than with sliders. Book 45 minutes and we will do the thinking with you."
      />
    </>
  );
}
