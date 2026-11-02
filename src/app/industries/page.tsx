import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { industries } from "@/lib/industries";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { IndustryIcon } from "@/components/ui/industry-icon";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { DeferredSection } from "@/components/ui/deferred-section";
import { PageHero } from "@/components/layout/page-hero";
import { CtaBand } from "@/components/sections/cta-band";

export const metadata = pageMetadata({
  title: "Industry Websites, Apps & Software Solutions",
  description:
    "Websites, apps and business software for retail, healthcare, education, real estate, manufacturing, logistics, hospitality and professional services.",
  path: "/industries",
});

const ADAPT = [
  "Features specific to your sector, from GST invoicing to appointment scheduling.",
  "Integrations with Tally, Razorpay, Shiprocket, WhatsApp and the tools you already use.",
  "Content written for the customers and buyers in your market.",
] as const;

const SAME = [
  "A free consultation followed by a fixed-price proposal.",
  "A dedicated project manager and regular progress updates.",
  "Performance, security and accessibility best practices.",
  "Three months of post-launch support.",
] as const;

export default function IndustriesPage() {
  return (
    <>
      <PageHero
        video="industries"
        eyebrow="Industries"
        title="Industries we serve"
        description="We bring domain understanding to every engagement, delivering websites and software tailored to the way each sector operates."
      />

      <Section>
        <div className="container-page">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {industries.map((industry, index) => (
              <Reveal as="li" key={industry.slug} delay={(index % 3) * 70}>
                <Link
                  href={`/industries/${industry.slug}`}
                  className="group flex h-full flex-col rounded-card border border-border bg-surface p-6 transition-[transform,border-color,box-shadow] duration-300 hover:border-setu/40 hover:shadow-ambient motion-safe:hover:-translate-y-1"
                >
                  <IndustryIcon name={industry.icon} />
                  <h2 className="mt-5 text-lg font-semibold text-foreground">{industry.name}</h2>
                  <p className="mt-2 text-[0.92rem] leading-relaxed text-muted-foreground">
                    {industry.summary}
                  </p>
                  <ul className="mt-4 flex flex-col gap-1.5">
                    {industry.features.slice(0, 3).map((feature) => (
                      <li key={feature} className="flex gap-2 text-[0.85rem] text-foreground/80">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-setu" aria-hidden />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-setu">
                    Learn more
                    <ArrowRight
                      className="size-3.5 transition-transform group-hover:translate-x-1"
                      aria-hidden
                    />
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </Section>

      <Section surface="subtle">
        <div className="container-page">
          <SectionHeading
            eyebrow="Our approach"
            title="Adapted to your sector, delivered consistently"
            description="Every engagement is adapted to your sector and delivered through the same proven process."
          />
          <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-2">
            <Reveal className="rounded-card border border-border bg-surface p-7">
              <h3 className="text-lg font-semibold text-foreground">Tailored to your sector</h3>
              <ul className="mt-5 flex flex-col gap-3.5">
                {ADAPT.map((line) => (
                  <li key={line} className="flex gap-3 text-[0.95rem] leading-relaxed text-muted-foreground">
                    <Check className="mt-1 size-4 shrink-0 text-setu" aria-hidden />
                    {line}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={80} className="rounded-card border border-border bg-surface p-7">
              <h3 className="text-lg font-semibold text-foreground">Consistent on every project</h3>
              <ul className="mt-5 flex flex-col gap-3.5">
                {SAME.map((line) => (
                  <li key={line} className="flex gap-3 text-[0.95rem] leading-relaxed text-muted-foreground">
                    <Check className="mt-1 size-4 shrink-0 text-setu" aria-hidden />
                    {line}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </Section>

      <DeferredSection minHeight={380}>
        <CtaBand
          title="Working in another sector?"
          description="Our team builds websites and business software for organisations across many industries. Book a consultation to discuss your requirements."
          primaryLabel="Discuss your project"
        />
      </DeferredSection>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Industries", path: "/industries" },
        ])}
      />
    </>
  );
}
