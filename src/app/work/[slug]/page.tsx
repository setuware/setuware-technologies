import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";

import { caseStudies, getCaseStudy, getService } from "@/lib/content";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { CtaBand } from "@/components/sections/cta-band";
import { DeferredSection } from "@/components/ui/deferred-section";

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

  return pageMetadata({
    title: study.title,
    description: study.summary,
    path: `/work/${study.slug}`,
    type: "article",
  });
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  const others = caseStudies.filter((item) => item.slug !== study.slug).slice(0, 2);

  return (
    <>
      <section className="relative overflow-hidden border-b border-border pb-14 pt-28 md:pt-36">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage: `linear-gradient(135deg, ${study.accent[0]}, ${study.accent[1]})`,
          }}
          aria-hidden
        />

        <div className="container-page relative">
          <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted-foreground">
            <Link href="/work" className="transition-colors hover:text-foreground">
              Work
            </Link>
            <span className="mx-1.5" aria-hidden>
              /
            </span>
            <span className="text-foreground">{study.client}</span>
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            <Badge>{study.sector}</Badge>
            <Badge tone="neutral">{study.year}</Badge>
            {study.services.map((serviceSlug) => {
              const service = getService(serviceSlug);
              return service ? (
                <Link key={serviceSlug} href={`/services/${serviceSlug}`}>
                  <Badge tone="neutral">{service.shortName}</Badge>
                </Link>
              ) : null;
            })}
          </div>

          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.1] text-foreground sm:text-5xl">
            {study.title}
          </h1>
          <p className="mt-4 max-w-2xl text-[1.05rem] leading-relaxed text-muted-foreground">
            {study.summary}
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-border pt-8 sm:grid-cols-4">
            {study.results.map((metric) => (
              <div key={metric.label}>
                <dd className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
                  {metric.value}
                </dd>
                <dt className="mt-1 text-xs text-muted-foreground">{metric.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <Section>
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              The problem
            </h2>
            <p className="mt-4 text-[1.02rem] leading-relaxed text-muted-foreground">
              {study.challenge}
            </p>

            <h2 className="mt-9 text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Stack
            </h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {study.stack.map((tool) => (
                <Badge key={tool} tone="neutral">
                  {tool}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-foreground">What we did</h2>
            <ol className="mt-6 flex flex-col gap-4">
              {study.approach.map((step, index) => (
                <li
                  key={step}
                  className="flex gap-4 rounded-card border border-border bg-surface p-5"
                >
                  <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/12 font-mono text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  <span className="text-[0.98rem] leading-relaxed text-foreground/85">
                    {step}
                  </span>
                </li>
              ))}
            </ol>

            {study.quote ? (
              <figure className="mt-10 rounded-card border border-primary/25 bg-primary/5 p-7">
                <Quote className="size-6 text-primary/70" aria-hidden />
                <blockquote className="mt-4 text-lg leading-relaxed text-foreground">
                  {study.quote.text}
                </blockquote>
                <figcaption className="mt-4 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {study.quote.author}
                  </span>
                  , {study.quote.role}
                </figcaption>
              </figure>
            ) : null}
          </div>
        </div>
      </Section>

      <Section surface="subtle">
        <div className="container-page">
          <h2 className="text-xl font-semibold text-foreground">More work</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {others.map((item) => (
              <Link
                key={item.slug}
                href={`/work/${item.slug}`}
                className="group flex items-center justify-between gap-4 rounded-card border border-border bg-surface p-6 transition-colors hover:border-primary/40"
              >
                <span>
                  <span className="block text-xs text-muted-foreground">
                    {item.client} · {item.sector}
                  </span>
                  <span className="mt-1 block font-medium text-foreground">
                    {item.title}
                  </span>
                </span>
                <ArrowRight
                  className="size-4 shrink-0 text-primary transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
            ))}
          </div>

          <ButtonLink href="/work" variant="secondary" className="mt-8">
            All case studies
          </ButtonLink>
        </div>
      </Section>

      <DeferredSection minHeight={380}>
        <CtaBand />
      </DeferredSection>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Work", path: "/work" },
          { name: study.client, path: `/work/${study.slug}` },
        ])}
      />
    </>
  );
}
