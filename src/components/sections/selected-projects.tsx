import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { caseStudyPhoto } from "@/lib/case-study-photos";
import { featuredCaseStudies } from "@/lib/content";
import { FadeUp, ImageReveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import { Eyebrow, SectionTitle } from "@/components/sections/home/shared";

/** Home-page portfolio: compact cards for the featured client projects. */
export function SelectedProjects() {
  const projects = featuredCaseStudies.slice(0, 4);
  return (
    <section
      id="work"
      aria-labelledby="projects-heading"
      className="relative overflow-hidden bg-[#f5f7fc] py-20 md:py-24 dark:bg-[#080c1c]"
    >
      <div className="container-figma">
        <FadeUp className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <Eyebrow>Our work</Eyebrow>
            <SectionTitle>
              <span id="projects-heading">Recent client projects</span>
            </SectionTitle>
          </div>
          <Link
            href="/work"
            className="group inline-flex items-center gap-2 self-start text-sm font-semibold text-[#2f56d8] hover:text-[#1e3a8a] md:self-auto dark:text-[#7c9bff]"
          >
            View all projects
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </FadeUp>

        <Stagger className="mt-12 grid gap-6 md:grid-cols-2">
          {projects.map((study, i) => {
            const photo = caseStudyPhoto(study.slug);
            return (
              <StaggerItem key={study.slug}>
                <article className="group relative h-full overflow-hidden rounded-2xl border border-[#e3e8f5] bg-white shadow-[0_1px_2px_rgba(15,19,48,0.04),0_18px_40px_-28px_rgba(15,19,48,0.35)] transition-[transform,box-shadow] duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-30px_rgba(29,78,216,0.45)] dark:border-white/10 dark:bg-[#0d1226]">
                  {photo ? (
                    <ImageReveal delay={i * 0.08} className="relative aspect-[16/9] overflow-hidden bg-[#eef2fb] dark:bg-white/5">
                      <Image
                        src={photo.src}
                        alt={photo.alt}
                        fill
                        sizes="(min-width: 768px) 40rem, 92vw"
                        className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />
                      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(11,15,42,0.55))] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                      <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[#2f56d8] backdrop-blur dark:bg-[#0d1226]/85 dark:text-[#9db4ff]">
                        {study.sector}
                      </span>
                    </ImageReveal>
                  ) : null}
                  <div className="p-6">
                    <p className="text-sm font-semibold text-[#5a6180] dark:text-white/60">
                      {study.client} · {study.year}
                    </p>
                    <h3 className="mt-1.5 text-[1.2rem] font-bold leading-snug text-[#0f1330] dark:text-white">
                      <Link href={`/work/${study.slug}`} className="after:absolute after:inset-0">
                        {study.title}
                      </Link>
                    </h3>
                    <p className="mt-2 line-clamp-2 text-[0.95rem] leading-relaxed text-[#5a6180] dark:text-white/65">
                      {study.summary}
                    </p>
                    <div className="mt-5 flex items-center justify-between gap-4">
                      <ul className="flex flex-wrap gap-1.5">
                        {study.stack.slice(0, 3).map((tech) => (
                          <li key={tech} className="rounded-md bg-[#f1f4fb] px-2 py-1 text-xs font-medium text-[#3b4366] dark:bg-white/5 dark:text-white/70">
                            {tech}
                          </li>
                        ))}
                      </ul>
                      <span aria-hidden className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-[#eef2ff] text-[#2f56d8] transition-[background-color,color,transform] duration-300 group-hover:rotate-45 group-hover:bg-[#2f56d8] group-hover:text-white dark:bg-white/10 dark:text-white">
                        <ArrowUpRight className="size-5" />
                      </span>
                    </div>
                  </div>
                </article>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
