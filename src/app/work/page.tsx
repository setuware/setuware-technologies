import { ArrowRight } from "lucide-react";

import { caseStudies, getService } from "@/lib/content";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { PageHero } from "@/components/layout/page-hero";
import { FadeUp } from "@/components/motion/primitives";
import { ButtonLink } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { CaseStudyGrid, type CaseStudyCard } from "./case-study-grid";

export const metadata = pageMetadata({
  title: "Case Studies: Web, App & Software Projects",
  description:
    "Selected case studies from Setuware Technologies across e-commerce, mobile apps, AI assistants, dashboards and hosting, filterable by service or industry.",
  path: "/work",
});

export default function WorkPage() {
  const cards: CaseStudyCard[] = caseStudies.map((study) => ({
    slug: study.slug,
    client: study.client,
    sector: study.sector,
    title: study.title,
    summary: study.summary,
    year: study.year,
    accent: study.accent,
    results: study.results,
    services: study.services.map((slug) => ({
      slug,
      name: getService(slug)?.name ?? slug,
    })),
  }));

  return (
    <>
      <PageHero
        video="work"
        eyebrow="Our work"
        title="Selected work"
        description="Eight projects, each with the numbers: a grocery chain at 40,000 orders a month, a clinic AI resolving 68% of questions, an exam platform at 1,200 concurrent students. Challenge, approach, results — no vague claims."
      />

      <CaseStudyGrid studies={cards} />

      <Section surface="dots" className="py-16 md:py-20">
        <FadeUp y={20} className="container-page">
          <div className="mx-auto flex max-w-4xl flex-col items-start gap-8 rounded-card border border-border bg-surface/90 p-7 shadow-ambient backdrop-blur md:flex-row md:items-center md:justify-between md:p-10">
            <div className="max-w-xl">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-setu">
                Industries
              </span>
              <h2 className="mt-3 font-display text-2xl font-semibold leading-snug text-foreground sm:text-[1.75rem]">
                Explore our work by sector
              </h2>
              <p className="mt-3 text-[0.97rem] leading-relaxed text-muted-foreground">
                See what we built for retail, healthcare, education, manufacturing,
                logistics and professional services — and what it changed for
                each of them.
              </p>
            </div>
            <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto">
              <ButtonLink
                href="/industries"
                variant="ghost"
                className="rounded-full bg-setu font-semibold text-white hover:bg-setu-dark dark:hover:bg-setu-dark"
              >
                View industries
                <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
              <ButtonLink href="/contact" variant="secondary" className="rounded-full">
                Start a project
              </ButtonLink>
            </div>
          </div>
        </FadeUp>
      </Section>
      <JsonLd data={breadcrumbJsonLd([{ name: "Our work", path: "/work" }])} />
    </>
  );
}
