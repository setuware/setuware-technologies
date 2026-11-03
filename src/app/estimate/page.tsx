import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { Estimator } from "@/components/interactive/estimator";
import { PageHero } from "@/components/layout/page-hero";
import { Section } from "@/components/ui/section";

export const metadata = pageMetadata({
  title: "Website & App Development Cost Calculator",
  description:
    "Estimate the cost of your website, e-commerce store, app or custom software in India, with an indicative timeline, team size and payment milestones.",
  path: "/estimate",
});

export default function EstimatePage() {
  return (
    <>
      <PageHero
        eyebrow="Instant estimate"
        title="Estimate your project"
        description="Pick a service and the features you need. The price updates as you go, and the link keeps your choices."
      />

      <Section className="pb-20 pt-4 md:pb-28 md:pt-6">
        <div className="container-page">
          <Estimator />
        </div>
      </Section>
      <JsonLd data={breadcrumbJsonLd([{ name: "Cost estimate", path: "/estimate" }])} />
    </>
  );
}
