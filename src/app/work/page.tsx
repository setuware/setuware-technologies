import { ArrowRight } from "lucide-react";

import { caseStudies } from "@/lib/content";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { PageHero } from "@/components/layout/page-hero";
import { FadeUp } from "@/components/motion/primitives";
import { ButtonLink } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { ProjectFeature } from "@/components/sections/work/project-feature";

export const metadata = pageMetadata({
  title: "Our Work: Website & App Development Projects",
  description:
    "Client projects by Setuware Technologies: an engineering exam-preparation platform and a luxury fashion e-commerce store, with live sites and results.",
  path: "/work",
});

export default function WorkPage() {
  return (
    <>
      <PageHero
        video="work"
        align="left"
        eyebrow="Our work"
        title="Client projects"
        description="Platforms we have designed, built and launched for our clients, each with the brief, our approach and the outcome."
      />

      <Section className="bg-[#f5f7fc] dark:bg-[#080c1c]">
        <div className="container-page flex flex-col gap-20 lg:gap-28">
          {caseStudies.map((study, i) => (
            <ProjectFeature key={study.slug} study={study} reverse={i % 2 === 1} headingLevel="h2" />
          ))}
        </div>
      </Section>

      <Section surface="dots" className="py-16 md:py-20">
        <FadeUp y={20} className="container-page">
          <div className="mx-auto flex max-w-4xl flex-col items-start gap-8 rounded-card border border-border bg-surface/90 p-7 shadow-ambient backdrop-blur md:flex-row md:items-center md:justify-between md:p-10">
            <div className="max-w-xl">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-setu">
                Industries
              </span>
              <h2 className="mt-3 font-display text-2xl font-semibold leading-snug text-foreground sm:text-[1.75rem]">
                Solutions by industry
              </h2>
              <p className="mt-3 text-[0.97rem] leading-relaxed text-muted-foreground">
                How we approach websites, stores and business software for retail,
                healthcare, education, manufacturing and professional services.
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
