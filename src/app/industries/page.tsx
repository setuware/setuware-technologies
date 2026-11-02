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
  title: "Industries We Build For",
  description:
    "Websites, apps and business software for retail, clinics, schools, real estate, manufacturing, logistics, hospitality, CA firms and startups in India.",
  path: "/industries",
});

const ADAPT = [
  "The features: GST invoices for a distributor, slot booking for a clinic, batch timetables for an institute.",
  "The integrations: Tally, Shiprocket, Razorpay, WhatsApp, Google Business Profile, or the tools you already run.",
  "The copy on every page, written for the buyers in your sector.",
] as const;

const SAME = [
  "A free 30-minute discovery call, then a written fixed quote.",
  "Weekly progress on a live preview link, not a status email.",
  "The domain, code and hosting accounts in your name.",
  "Three months of support after launch, from the team that built it.",
] as const;

export default function IndustriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Industries"
        title="Software shaped around your trade"
        description="A clinic, a coaching institute and a transporter need different software. We start from how your work runs today, then build the website, app or system around it."
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
                    See what we build
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
            eyebrow="Across every industry"
            title="What changes, and what stays fixed"
            description="The features change with your sector. The way we run the project does not."
          />
          <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-2">
            <Reveal className="rounded-card border border-border bg-surface p-7">
              <h3 className="text-lg font-semibold text-foreground">What we adapt to you</h3>
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
              <h3 className="text-lg font-semibold text-foreground">What stays the same</h3>
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
          title="Your industry not listed?"
          description="Most of what we build is workflow software. If your business runs on phone calls, spreadsheets and WhatsApp groups, one 30-minute call will show whether we can help."
          primaryLabel="Tell us about your business"
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
