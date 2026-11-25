import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { featuredCaseStudies } from "@/lib/content";
import { Eyebrow, SectionTitle } from "@/components/sections/home/shared";
import { ProjectFeature } from "@/components/sections/work/project-feature";

/** Home-page portfolio: the featured client projects, shown with their live sites. */
export function SelectedProjects() {
  return (
    <section
      id="work"
      aria-labelledby="projects-heading"
      className="relative overflow-hidden bg-[#f5f7fc] py-20 md:py-28 dark:bg-[#080c1c]"
    >
      <div className="container-page">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <Eyebrow>Our work</Eyebrow>
            <SectionTitle>
              <span id="projects-heading">Recent client projects</span>
            </SectionTitle>
            <p className="mt-4 text-[1.02rem] leading-relaxed text-slate-600 dark:text-slate-300">
              Live platforms we designed and built, from an engineering exam-preparation platform to a
              luxury fashion store.
            </p>
          </div>
          <Link
            href="/work"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#2f56d8] hover:text-[#1e3a8a] dark:text-[#7c9bff]"
          >
            View all work
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        <div className="mt-14 flex flex-col gap-20 md:mt-16 lg:gap-28">
          {featuredCaseStudies.map((study, i) => (
            <ProjectFeature key={study.slug} study={study} reverse={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
