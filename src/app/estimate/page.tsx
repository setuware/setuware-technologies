import { Calculator, ShieldCheck, Sparkles } from "lucide-react";

import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { Estimator } from "@/components/interactive/estimator";
import { PageHero } from "@/components/layout/page-hero";

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

      <div className="container-page py-12 md:py-16">
        <Estimator />
      </div>
      <JsonLd data={breadcrumbJsonLd([{ name: "Cost estimate", path: "/estimate" }])} />
    </>
  );
}
