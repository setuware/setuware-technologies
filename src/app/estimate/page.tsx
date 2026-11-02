import { Calculator, ShieldCheck, Sparkles } from "lucide-react";

import { pageMetadata } from "@/lib/seo";
import { Estimator } from "@/components/interactive/estimator";
import { PageHero } from "@/components/layout/page-hero";

export const metadata = pageMetadata({
  title: "Instant Project Cost Estimate",
  description:
    "Price your website, store, app or custom software in about a minute. Ranges from our rate card, with timeline, team size and payment milestones.",
  path: "/estimate",
});

const ASSURANCES = [
  {
    Icon: Calculator,
    text: "Priced from the same rate card we use for real quotes",
  },
  {
    Icon: ShieldCheck,
    text: "No call needed. Nothing is sent until you ask for it",
  },
  {
    Icon: Sparkles,
    text: "Share the link with your team. Your choices travel with it",
  },
] as const;

export default function EstimatePage() {
  return (
    <>
      <PageHero
        eyebrow="Instant quote"
        title="Your project's cost and timeline, in a minute"
        description="Choose a service, the size and the features you need. You get a price range, a timeline, the team size and the payment milestones before you speak to anyone."
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
    </>
  );
}
