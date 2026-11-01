import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { getService } from "@/lib/content";
import { getIndustry, industries } from "@/lib/industries";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { IndustryIcon } from "@/components/ui/industry-icon";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { ServiceIcon } from "@/components/ui/service-icon";
import { DeferredSection } from "@/components/ui/deferred-section";
import { PageHero } from "@/components/layout/page-hero";
import { CtaBand } from "@/components/sections/cta-band";

/** One static page per industry, generated at build time. */
export function generateStaticParams() {
  return industries.map((industry) => ({ slug: industry.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) {
    return pageMetadata({ title: "Not found", description: "", path: "/industries", noIndex: true });
  }

  return pageMetadata({
    title: `Websites and software for ${industry.name.toLowerCase()}`,
    description: industry.intro,
    path: `/industries/${industry.slug}`,
  });
}

const START_STEPS = [
  {
    title: "A 30-minute call",
    body: "You walk us through how the work runs today. We ask about volumes, tools and who uses what.",
  },
  {
    title: "A written scope and fixed price",
    body: "Within a few working days you get the features, timeline and price in writing.",
  },
  {
    title: "Weekly builds you can click",
    body: "A staging link every week, so your team tries it on real work before launch.",
  },
] as const;

/**
 * `params` is read inside a Suspense boundary so navigations render the shell
 * instantly. Every known slug is prerendered by `generateStaticParams`, so the
 * fallback only ever shows on the way to a 404.
 */
export default function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" aria-busy="true" />}>
      <IndustryContent params={params} />
    </Suspense>
  );
}

async function IndustryContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) notFound();

  const others = industries.filter((item) => item.slug !== industry.slug);

  return (
    <>
      <PageHero
        align="left"
        eyebrow="Industries"
        title={industry.name}
        description={industry.intro}
        above={
          <div className="mb-8 flex flex-col gap-6">
            <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
              <Link href="/industries" className="transition-colors hover:text-foreground">
                Industries
              </Link>
              <span className="mx-1.5" aria-hidden>
                /
              </span>
              <span className="text-foreground">{industry.name}</span>
            </nav>
            <IndustryIcon name={industry.icon} className="size-14" size={26} />
          </div>
        }
      >
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink
            href="/contact"
            size="lg"
            variant="ghost"
            className="rounded-full bg-setu font-semibold text-white hover:bg-setu-dark dark:hover:bg-setu-dark"
          >
            Book a free 30-min call
            <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
          <ButtonLink href="/estimate" size="lg" variant="secondary" className="rounded-full">
            Get an instant estimate
          </ButtonLink>
        </div>
      </PageHero>

      <Section>
        <div className="container-page">
          <SectionHeading
            align="left"
            eyebrow="What we hear on first calls"
            title="Problems we are usually asked to fix"
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {industry.problems.map((problem, index) => (
              <Reveal
                key={problem.title}
                delay={(index % 2) * 70}
                className="rounded-card border border-border bg-surface p-6"
              >
                <span className="font-mono text-xs font-semibold text-setu">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-[1.05rem] font-semibold text-foreground">{problem.title}</h3>
                <p className="mt-2 text-[0.93rem] leading-relaxed text-muted-foreground">
                  {problem.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Section surface="subtle">
        <div className="container-page">
          <SectionHeading
            align="left"
            eyebrow="What we build"
            title={`What we build for ${industry.name.toLowerCase()}`}
            description="Each one links to the service behind it, with prices and timelines."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {industry.builds.map((build, index) => {
              const service = getService(build.service);
              return (
                <Reveal key={build.title} delay={(index % 2) * 70}>
                  <Link
                    href={`/services/${build.service}`}
                    className="group flex h-full gap-4 rounded-card border border-border bg-surface p-6 transition-[transform,border-color] duration-300 hover:border-setu/40 motion-safe:hover:-translate-y-1"
                  >
                    {service ? (
                      <ServiceIcon name={service.icon} accent={service.accent} className="size-11" size={20} />
                    ) : null}
                    <div className="flex min-w-0 flex-col">
                      <h3 className="text-[1.05rem] font-semibold text-foreground">{build.title}</h3>
                      <p className="mt-1.5 text-[0.93rem] leading-relaxed text-muted-foreground">
                        {build.body}
                      </p>
                      {service ? (
                        <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-setu">
                          {service.name}
                          <ArrowRight
                            className="size-3.5 transition-transform group-hover:translate-x-1"
                            aria-hidden
                          />
                        </span>
                      ) : null}
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </Section>

      <Section>
        <div className="container-page grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
          <div>
            <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">Features we often include</h2>
            <p className="mt-3 max-w-xl text-[0.98rem] leading-relaxed text-muted-foreground">
              A starting list, not a package. Your scope keeps what you need and drops the rest.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {industry.features.map((feature) => (
                <li
                  key={feature}
                  className="flex gap-3 rounded-xl border border-border bg-surface p-3.5 text-[0.93rem] text-foreground/85"
                >
                  <Check className="mt-0.5 size-4 shrink-0 text-setu" aria-hidden />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-card border border-border bg-surface p-7 lg:self-start">
            <h2 className="text-lg font-semibold text-foreground">How a project starts</h2>
            <ol className="mt-6 flex flex-col gap-5">
              {START_STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-setu/12 font-mono text-xs font-semibold text-setu">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">{step.title}</p>
                    <p className="mt-1 text-[0.9rem] leading-relaxed text-muted-foreground">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link
              href="/process"
              className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-setu"
            >
              See the full process
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </Section>

      <Section className="pt-0 md:pt-0">
        <div className="container-page">
          <h2 className="text-xl font-semibold text-foreground">Other industries</h2>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {others.map((item) => (
              <Link
                key={item.slug}
                href={`/industries/${item.slug}`}
                className="inline-flex items-center gap-2.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-setu/40 hover:text-setu"
              >
                <IndustryIcon name={item.icon} className="size-7 rounded-lg" size={14} />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </Section>

      <DeferredSection minHeight={380}>
        <CtaBand title={industry.cta.title} description={industry.cta.body} primaryLabel="Book a free 30-min call" />
      </DeferredSection>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Industries", path: "/industries" },
          { name: industry.name, path: `/industries/${industry.slug}` },
        ])}
      />
    </>
  );
}
