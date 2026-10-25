import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { caseStudies } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/layout/page-hero";
import { CtaBand } from "@/components/sections/cta-band";
import { DeferredSection } from "@/components/ui/deferred-section";

export const metadata = pageMetadata({
  title: "Case studies",
  description:
    "Production software we have shipped and still run — commerce platforms, field-service apps, AI support desks and exam-day infrastructure, with the numbers clients measure.",
  path: "/work",
});

export default function WorkPage() {
  return (
    <>
      <PageHero
        eyebrow="Our work"
        title="Software that is still running"
        description="Each of these is live today. The numbers are the client's own, measured after launch — not projections from a proposal."
      />

      <div className="container-page py-16">
        <div className="grid gap-6 md:grid-cols-2">
          {caseStudies.map((study, index) => (
            <Reveal key={study.slug} delay={(index % 2) * 80}>
              <Link
                href={`/work/${study.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface shadow-ambient transition-[transform,border-color,box-shadow] duration-300 hover:border-primary/40 hover:shadow-glow motion-safe:hover:-translate-y-1"
              >
                <div
                  className="relative h-40 overflow-hidden"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${study.accent[0]}, ${study.accent[1]})`,
                  }}
                >
                  <div className="absolute inset-0 bg-grid opacity-30" aria-hidden />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
                    <span className="font-display text-xl font-semibold text-white">
                      {study.client}
                    </span>
                    <span className="rounded-full bg-white/18 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur">
                      {study.year}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-4 p-6 md:p-7">
                  <Badge tone="neutral">{study.sector}</Badge>
                  <h2 className="text-xl font-semibold leading-snug text-foreground">
                    {study.title}
                  </h2>
                  <p className="text-[0.95rem] leading-relaxed text-muted-foreground">
                    {study.summary}
                  </p>

                  <dl className="mt-auto grid grid-cols-2 gap-4 border-t border-border pt-5 sm:grid-cols-4">
                    {study.results.map((metric) => (
                      <div key={metric.label}>
                        <dd className="font-display text-base font-semibold text-foreground">
                          {metric.value}
                        </dd>
                        <dt className="text-[11px] leading-tight text-muted-foreground">
                          {metric.label}
                        </dt>
                      </div>
                    ))}
                  </dl>

                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Read the case study
                    <ArrowUpRight
                      className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden
                    />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>

      <DeferredSection minHeight={380}>
        <CtaBand
          title="Your project could be the next one here"
          primaryLabel="Start a project"
        />
      </DeferredSection>
    </>
  );
}
