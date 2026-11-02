import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { caseStudies, getService } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/layout/page-hero";
import { FadeUp } from "@/components/motion/primitives";
import { CaseStudyGrid, type CaseStudyCard } from "./case-study-grid";

export const metadata = pageMetadata({
  title: "Case Studies & Recent Projects",
  description:
    "Case studies from Setuware Technologies: online stores, mobile apps, AI assistants, dashboards and hosting. Filter by service or industry.",
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
        eyebrow="Our work"
        title="Projects that are live and doing their job"
        description="Each case study sets out the problem, what we built and what changed after launch. Filter by the service you need or by industry."
      />

      <div className="container-page py-14 md:py-16">
        <FadeUp y={20} blur={false} immediate>
          <CaseStudyGrid studies={cards} />
        </FadeUp>

        <FadeUp
          y={20}
          className="mt-12 flex flex-col items-start justify-between gap-4 rounded-card border border-border bg-background-subtle p-6 md:flex-row md:items-center md:p-7"
        >
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              Looking for your sector?
            </h2>
            <p className="mt-1 text-[0.92rem] leading-relaxed text-muted-foreground">
              Retail, healthcare, education, manufacturing, logistics and more.
              See the problems we fix and what we build for each.
            </p>
          </div>
          <Link
            href="/industries"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-setu px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-setu hover:text-white"
          >
            Browse industries
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </FadeUp>
      </div>
    </>
  );
}
