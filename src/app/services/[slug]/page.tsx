import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check, Clock, IndianRupee } from "lucide-react";

import { caseStudies, getService, services } from "@/lib/content";
import { breadcrumbJsonLd, pageMetadata, serviceJsonLd } from "@/lib/seo";
import { formatINRCompact } from "@/lib/utils";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { ServiceIcon } from "@/components/ui/service-icon";
import { ServiceVisual } from "@/components/interactive/service-visual";
import { CtaBand } from "@/components/sections/cta-band";
import { DeferredSection } from "@/components/ui/deferred-section";

/** Every service page is prerendered at build time — six static files. */
export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return pageMetadata({ title: "Not found", description: "", path: "/services", noIndex: true });

  return pageMetadata({
    title: service.name,
    description: service.description,
    path: `/services/${service.slug}`,
  });
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const related = caseStudies.filter((study) => study.services.includes(service.slug));
  const others = services.filter((item) => item.slug !== service.slug);

  return (
    <>
      <section className="relative overflow-hidden border-b border-border pb-14 pt-28 md:pt-36">
        <div className="pointer-events-none absolute inset-0 bg-mesh opacity-60" aria-hidden />

        <div className="container-page relative">
          <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted-foreground">
            <Link href="/services" className="transition-colors hover:text-foreground">
              Services
            </Link>
            <span className="mx-1.5" aria-hidden>
              /
            </span>
            <span className="text-foreground">{service.name}</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:items-start">
            <div>
              <ServiceIcon name={service.icon} accent={service.accent} className="size-14" size={26} />
              <h1 className="mt-5 text-4xl font-semibold leading-[1.1] text-foreground sm:text-5xl">
                {service.name}
              </h1>
              <p className="mt-4 max-w-xl text-[1.05rem] leading-relaxed text-muted-foreground">
                {service.description}
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/estimate" size="lg" variant="gradient">
                  Price this service
                  <ArrowRight className="size-4" aria-hidden />
                </ButtonLink>
                <ButtonLink
                  href={`/contact?service=${service.slug}`}
                  size="lg"
                  variant="secondary"
                >
                  Talk to an engineer
                </ButtonLink>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <ServiceVisual variant={service.icon} accent={service.accent} />

            {/*
              Each <div> under a <dl> may contain only <dt>/<dd>, so the icons
              live inside their term rather than beside it.
            */}
            <dl className="grid gap-3 rounded-card border border-border bg-surface p-6 shadow-ambient sm:grid-cols-2 lg:grid-cols-1">
              <div>
                <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                  <IndianRupee className="size-4 shrink-0 text-primary" aria-hidden />
                  Starts from
                </dt>
                <dd className="mt-1 text-sm font-semibold text-foreground">
                  {formatINRCompact(service.priceFrom)}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="size-4 shrink-0 text-primary" aria-hidden />
                  Typical timeline
                </dt>
                <dd className="mt-1 text-sm font-semibold text-foreground">
                  {service.typicalTimeline}
                </dd>
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <dt className="mb-2 text-xs text-muted-foreground">Stack we use</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {service.stack.map((tool) => (
                    <Badge key={tool} tone="neutral">
                      {tool}
                    </Badge>
                  ))}
                </dd>
              </div>
            </dl>
            </div>
          </div>
        </div>
      </section>

      <Section>
        <div className="container-page grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              What you get out of it
            </h2>
            <ul className="mt-5 flex flex-col gap-3.5">
              {service.outcomes.map((outcome) => (
                <li key={outcome} className="flex gap-3">
                  <Check className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                  <span className="text-[0.98rem] leading-relaxed text-muted-foreground">
                    {outcome}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              What we actually deliver
            </h2>
            <ol className="mt-5 flex flex-col gap-3">
              {service.deliverables.map((deliverable, index) => (
                <li
                  key={deliverable}
                  className="flex gap-3.5 rounded-xl border border-border bg-surface p-3.5"
                >
                  <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/12 font-mono text-[11px] font-semibold text-primary">
                    {index + 1}
                  </span>
                  <span className="text-[0.95rem] text-foreground/85">{deliverable}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      {related.length > 0 ? (
        <Section surface="subtle">
          <div className="container-page">
            <SectionHeading
              align="left"
              eyebrow="Proof"
              title={`${service.name} we have shipped`}
            />
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {related.map((study, index) => (
                <Reveal key={study.slug} delay={index * 80}>
                  <Link
                    href={`/work/${study.slug}`}
                    className="group flex h-full flex-col gap-3 rounded-card border border-border bg-surface p-6 transition-[transform,border-color] duration-300 hover:border-primary/40 motion-safe:hover:-translate-y-1"
                  >
                    <Badge tone="neutral">{study.sector}</Badge>
                    <h3 className="text-[1.05rem] font-semibold leading-snug text-foreground">
                      {study.title}
                    </h3>
                    <p className="text-[0.9rem] leading-relaxed text-muted-foreground">
                      {study.summary}
                    </p>
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-medium text-primary">
                      Read the case study
                      <ArrowRight
                        className="size-3.5 transition-transform group-hover:translate-x-1"
                        aria-hidden
                      />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </Section>
      ) : null}

      <Section>
        <div className="container-page">
          <h2 className="text-xl font-semibold text-foreground">Other services</h2>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {others.map((item) => (
              <Link
                key={item.slug}
                href={`/services/${item.slug}`}
                className="inline-flex items-center gap-2.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <ServiceIcon
                  name={item.icon}
                  accent={item.accent}
                  className="size-7"
                  size={14}
                />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </Section>

      <DeferredSection minHeight={380}>
        <CtaBand primaryLabel={`Start a ${service.shortName.toLowerCase()} project`} />
      </DeferredSection>

      <JsonLd
        data={serviceJsonLd({
          name: service.name,
          description: service.description,
          path: `/services/${service.slug}`,
          priceFrom: service.priceFrom,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Services", path: "/services" },
          { name: service.name, path: `/services/${service.slug}` },
        ])}
      />
    </>
  );
}
