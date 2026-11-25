import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Quote } from "lucide-react";

import { caseStudyPhoto, caseStudyPhotos } from "@/lib/case-study-photos";
import { DeviceShowcase } from "@/components/sections/work/device-showcase";
import { caseStudies, getCaseStudy, getService } from "@/lib/content";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { FadeUp, Stagger, StaggerItem } from "@/components/motion/primitives";

export function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) {
    return pageMetadata({ title: "Not found", description: "", path: "/work", noIndex: true });
  }

  const photo = caseStudyPhotos[study.slug];

  return pageMetadata({
    title: study.seoTitle ?? study.title,
    description: study.seoDescription ?? study.summary,
    path: `/work/${study.slug}`,
    type: "article",
    ...(photo ? { image: { url: photo.src, width: photo.width, height: photo.height, alt: photo.alt } } : {}),
  });
}

/**
 * `params` is read inside a Suspense boundary so navigations render the shell
 * instantly. Every known slug is prerendered by `generateStaticParams`, so the
 * fallback only ever shows on the way to a 404.
 */
export default function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" aria-busy="true" />}>
      <CaseStudy params={params} />
    </Suspense>
  );
}

async function CaseStudy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  // Prefer related work that shares a service, then fill with the rest.
  const rest = caseStudies.filter((item) => item.slug !== study.slug);
  const others = [
    ...rest.filter((item) => item.services.some((slug) => study.services.includes(slug))),
    ...rest.filter((item) => !item.services.some((slug) => study.services.includes(slug))),
  ].slice(0, 2);
  const studyServices = study.services
    .map((serviceSlug) => getService(serviceSlug))
    .filter((service) => service !== undefined);
  const primaryService = studyServices[0];
  const photo = caseStudyPhoto(study.slug);

  return (
    <>
      <section className="relative overflow-hidden border-b border-[#e3e8f3] bg-[linear-gradient(180deg,#eef3ff_0%,#f8faff_100%)] pb-16 pt-32 md:pb-20 md:pt-40 dark:border-white/10 dark:bg-[linear-gradient(180deg,#0b1230_0%,#070b1c_100%)]">
        <div className="container-page relative grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <div>
            <nav aria-label="Breadcrumb" className="mb-6 text-xs text-slate-500 dark:text-slate-400">
              <Link href="/" className="transition-colors hover:text-[#2f56d8]">
                Home
              </Link>
              <span className="mx-1.5" aria-hidden>
                /
              </span>
              <Link href="/work" className="transition-colors hover:text-[#2f56d8]">
                Our work
              </Link>
              <span className="mx-1.5" aria-hidden>
                /
              </span>
              <span className="text-[#0f1330] dark:text-white">{study.client}</span>
            </nav>

            <p className="text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[#2f56d8] dark:text-[#7c9bff]">
              {study.client} · {study.sector} · {study.year}
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-[1.12] tracking-[-0.02em] text-[#0f1330] sm:text-[2.9rem] dark:text-white">
              {study.title}
            </h1>
            <p className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-slate-600 dark:text-slate-300">
              {study.summary}
            </p>

            {studyServices.length > 0 ? (
              <ul className="mt-7 flex flex-wrap gap-2" aria-label="Services delivered">
                {studyServices.map((service) => (
                  <li key={service.slug}>
                    <Link
                      href={`/services/${service.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#dbe3f7] bg-white px-3.5 py-1.5 text-[0.84rem] font-medium text-[#1e3a8a] transition-colors hover:border-[#2f56d8] dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                    >
                      {service.name}
                      <ArrowUpRight className="size-3.5" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}

            {study.website ? (
              <a
                href={study.website}
                target="_blank"
                rel="noopener"
                className="mt-8 inline-flex h-11 items-center gap-2 rounded-md bg-[#2f56d8] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#1e3a8a]"
              >
                Visit live site
                <ArrowUpRight className="size-4" aria-hidden />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            ) : null}
          </div>

          {photo ? <DeviceShowcase photo={photo} url={study.website} preload /> : null}
        </div>
      </section>

      <Section aria-labelledby="challenge-heading">
        <div className="container-page grid gap-12 lg:grid-cols-[1.45fr_1fr] lg:gap-16">
          <FadeUp y={20}>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-setu">
              01 · The challenge
            </span>
            <h2
              id="challenge-heading"
              className="mt-4 font-display text-3xl font-semibold leading-[1.15] text-foreground sm:text-4xl"
            >
              The business problem
            </h2>
            <p className="mt-6 max-w-[62ch] text-lg leading-relaxed text-foreground/80 md:text-xl md:leading-relaxed">
              {study.challenge}
            </p>
          </FadeUp>

          <FadeUp y={20} delay={0.1}>
            <dl className="rounded-card border border-border bg-background-subtle p-6 md:p-7">
              <div className="flex justify-between gap-4 border-b border-border pb-4">
                <dt className="text-sm text-muted-foreground">Client</dt>
                <dd className="text-right text-sm font-semibold text-foreground">{study.client}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-border py-4">
                <dt className="text-sm text-muted-foreground">Industry</dt>
                <dd className="text-right text-sm font-semibold text-foreground">{study.sector}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-border py-4">
                <dt className="text-sm text-muted-foreground">Year</dt>
                <dd className="text-right text-sm font-semibold text-foreground">{study.year}</dd>
              </div>
              <div className="pt-4">
                <dt className="text-sm text-muted-foreground">Technology</dt>
                <dd className="mt-3 flex flex-wrap gap-1.5">
                  {study.stack.map((tool) => (
                    <Badge key={tool} tone="neutral">
                      {tool}
                    </Badge>
                  ))}
                </dd>
              </div>
            </dl>
          </FadeUp>
        </div>
      </Section>

      <Section surface="dots" aria-labelledby="approach-heading">
        <div className="container-page">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-setu">
              02 · Our approach
            </span>
            <h2
              id="approach-heading"
              className="mt-4 font-display text-3xl font-semibold leading-[1.15] text-foreground sm:text-4xl"
            >
              How we delivered it
            </h2>
          </div>
          <Stagger as="ol" className="mt-12 grid gap-5 sm:grid-cols-2">
            {study.approach.map((step, index) => (
              <StaggerItem
                as="li"
                key={step}
                className="flex h-full gap-5 rounded-card border border-border bg-surface p-6 shadow-ambient md:p-7"
              >
                <span className="font-display text-3xl font-semibold leading-none text-setu/35 tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-[1rem] leading-relaxed text-foreground/85">{step}</span>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Section>

      <Section surface="ink" aria-labelledby="results-heading">
        <div className="container-page">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-setu">
              03 · Results
            </span>
            <h2
              id="results-heading"
              className="mt-4 font-display text-3xl font-semibold leading-[1.15] text-foreground sm:text-4xl"
            >
              Measurable outcomes
            </h2>
          </div>
          <dl className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {study.results.map((metric) => (
              <div
                key={metric.label}
                className="flex flex-col-reverse justify-end rounded-card border border-white/10 bg-white/[0.04] p-6 backdrop-blur md:p-7"
              >
                <dt className="mt-3 text-sm leading-snug text-muted-foreground">{metric.label}</dt>
                <dd className="font-display text-4xl font-semibold tracking-tight text-foreground md:text-[2.75rem]">
                  {metric.value}
                </dd>
              </div>
            ))}
          </dl>

          {study.quote ? (
            <FadeUp y={20}>
              <figure className="mt-12 max-w-3xl border-l-2 border-setu pl-6 md:pl-8">
                <Quote className="size-6 text-setu" aria-hidden />
                <blockquote className="mt-4 text-xl leading-relaxed text-foreground md:text-2xl md:leading-relaxed">
                  {study.quote.text}
                </blockquote>
                <figcaption className="mt-5 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{study.quote.author}</span>,{" "}
                  {study.quote.role}
                </figcaption>
              </figure>
            </FadeUp>
          ) : null}
        </div>
      </Section>

      <Section surface="subtle" aria-labelledby="related-heading">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2
              id="related-heading"
              className="font-display text-2xl font-semibold text-foreground sm:text-3xl"
            >
              Related work
            </h2>
            <Link
              href="/work"
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-setu"
            >
              All projects
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
          <ul className="mt-8 grid gap-6 md:grid-cols-2">
            {others.map((item) => {
              const itemPhoto = caseStudyPhoto(item.slug);
              return (
                <li key={item.slug}>
                  <Link
                    href={`/work/${item.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface shadow-ambient transition-[transform,border-color,box-shadow] duration-300 hover:border-setu/50 hover:shadow-glow motion-safe:hover:-translate-y-1"
                  >
                    <div
                      className="relative aspect-[16/9] overflow-hidden"
                      style={{
                        backgroundImage: `linear-gradient(135deg, ${item.accent[0]}, ${item.accent[1]})`,
                      }}
                    >
                      {itemPhoto ? (
                        <Image
                          src={itemPhoto.src}
                          alt={itemPhoto.alt}
                          fill
                          sizes="(min-width: 768px) 50vw, 100vw"
                          className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.04]"
                        />
                      ) : null}
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-6">
                      <span className="text-xs font-medium text-muted-foreground">
                        {item.client} · {item.sector}
                      </span>
                      <span className="text-lg font-semibold leading-snug text-foreground">
                        {item.title}
                      </span>
                      <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-semibold text-setu">
                        View case study
                        <ArrowUpRight
                          className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </Section>

      <Section surface="grid" className="py-16 md:py-24">
        <FadeUp y={20} className="container-page mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold leading-[1.15] text-foreground sm:text-4xl">
            Discuss a similar project
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            Share your requirements and our team will respond within one business day with
            recommendations and next steps.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink
              href={primaryService ? `/contact?service=${primaryService.slug}` : "/contact"}
              size="lg"
              variant="ghost"
              className="rounded-full bg-setu font-semibold text-white hover:bg-setu-dark dark:hover:bg-setu-dark"
            >
              Start a similar project
              <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
            <ButtonLink href="/work" size="lg" variant="secondary" className="rounded-full">
              View all projects
            </ButtonLink>
          </div>
        </FadeUp>
      </Section>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Our work", path: "/work" },
          { name: study.client, path: `/work/${study.slug}` },
        ])}
      />
    </>
  );
}
