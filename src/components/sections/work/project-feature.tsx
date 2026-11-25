import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { caseStudyPhoto } from "@/lib/case-study-photos";
import { getService, type CaseStudy } from "@/lib/content";
import { cn } from "@/lib/utils";
import { FadeUp } from "@/components/motion/primitives";
import { DeviceShowcase } from "./device-showcase";

/** One real client project: live-site screenshots beside the brief and results. */
export function ProjectFeature({
  study,
  reverse = false,
  headingLevel = "h3",
}: {
  study: CaseStudy;
  reverse?: boolean;
  headingLevel?: "h2" | "h3";
}) {
  const photo = caseStudyPhoto(study.slug);
  const Heading = headingLevel;
  return (
    <article className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
      {photo ? (
        <FadeUp y={24} className={cn(reverse && "lg:order-2")}>
          <DeviceShowcase photo={photo} url={study.website} />
        </FadeUp>
      ) : null}
      <FadeUp y={24} delay={0.08}>
        <p className="text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#2f56d8] dark:text-[#7c9bff]">
          {study.sector} · {study.year}
        </p>
        <Heading className="mt-3 text-[1.6rem] font-bold leading-[1.2] tracking-[-0.01em] text-[#0f1330] sm:text-[2rem] dark:text-white">
          {study.client}
        </Heading>
        <p className="mt-2 text-[1.05rem] font-medium text-slate-700 dark:text-slate-200">{study.title}</p>
        <p className="mt-4 text-[0.97rem] leading-relaxed text-slate-600 dark:text-slate-300">
          {study.summary}
        </p>

        <ul className="mt-5 flex flex-wrap gap-2">
          {[...study.services.map((slug) => getService(slug)?.name ?? slug), ...study.stack].map(
            (tag) => (
              <li
                key={tag}
                className="rounded-full border border-[#dbe3f7] bg-[#f4f7ff] px-3 py-1 text-xs font-medium text-[#1e3a8a] dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
              >
                {tag}
              </li>
            ),
          )}
        </ul>

        <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#e3e8f3] bg-[#e3e8f3] dark:border-white/10 dark:bg-white/10">
          {study.results.slice(0, 4).map((metric) => (
            <div key={metric.label} className="flex flex-col-reverse bg-white px-4 py-3.5 dark:bg-[#0d1226]">
              <dt className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{metric.label}</dt>
              <dd className="text-lg font-bold text-[#0f1330] dark:text-white">{metric.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            href={`/work/${study.slug}`}
            className="inline-flex h-11 items-center gap-2 rounded-md bg-[#2f56d8] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#1e3a8a]"
          >
            Read the case study
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          {study.website ? (
            <a
              href={study.website}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0f1330] underline-offset-4 hover:text-[#2f56d8] hover:underline dark:text-white"
            >
              Visit live site
              <ArrowUpRight className="size-4" aria-hidden />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          ) : null}
        </div>
      </FadeUp>
    </article>
  );
}
