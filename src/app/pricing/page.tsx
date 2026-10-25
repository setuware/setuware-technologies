import { pageMetadata } from "@/lib/seo";
import { faqs } from "@/lib/content";
import { PricingPlans } from "@/components/sections/pricing-plans";
import { Faq } from "@/components/sections/faq";
import { CtaBand } from "@/components/sections/cta-band";
import { DeferredSection } from "@/components/ui/deferred-section";
import { PageHero } from "@/components/layout/page-hero";
import { ButtonLink } from "@/components/ui/button";

export const metadata = pageMetadata({
  title: "Pricing",
  description:
    "Transparent pricing for web and app builds, plus monthly managed hosting and support plans from ₹8,000. Fixed price per phase, written scope, no hidden markups.",
  path: "/pricing",
});

const PRICING_FAQS = [
  ...faqs.filter((faq) =>
    [
      "What is a typical timeline?",
      "Do you provide post-launch support?",
      "Do you offer a free consultation?",
    ].includes(faq.question),
  ),
  {
    group: "Before you start" as const,
    question: "Is GST included in these prices?",
    answer:
      "No. All prices are exclusive of GST, which is added at the prevailing rate on the invoice.",
  },
  {
    group: "Before you start" as const,
    question: "Do you mark up cloud or third-party costs?",
    answer:
      "Never. Cloud, gateway fees and licences are billed to your own accounts at cost. We would rather you see exactly what infrastructure costs than hide a margin in it.",
  },
  {
    group: "Help & support" as const,
    question: "Can I move hosting to you without a rebuild?",
    answer:
      "Usually yes. We audit the application, plan a zero-downtime migration and move it over a weekend. Most migrations take three to seven days end to end.",
  },
] as const;

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="Published prices, written scope"
        description="You should not have to sit through a call to find out roughly what something costs. Here is the real shape of our pricing — and the estimator will price your exact scope."
      >
        <div className="mt-8 flex justify-center">
          <ButtonLink href="/estimate" size="lg" variant="gradient">
            Price my exact project
          </ButtonLink>
        </div>
      </PageHero>

      <PricingPlans />

      <DeferredSection minHeight={720}>
        <Faq items={PRICING_FAQS} />
      </DeferredSection>

      <DeferredSection minHeight={380}>
        <CtaBand
          title="Not sure which plan fits?"
          description="Tell us what you are running and how much downtime would actually cost you. We will recommend the smallest plan that covers it."
        />
      </DeferredSection>
    </>
  );
}
