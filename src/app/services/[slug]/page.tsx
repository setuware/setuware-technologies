import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Calculator,
  Check,
  Clock,
  IndianRupee,
  KeyRound,
  X,
} from "lucide-react";

import { caseStudies, getService, serviceGroups, services, type Service } from "@/lib/content";
import { breadcrumbJsonLd, faqJsonLd, pageMetadata, serviceJsonLd } from "@/lib/seo";
import { servicePhotos } from "@/lib/service-photos";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { JsonLd } from "@/components/seo/json-ld";
import { Accordion } from "@/components/ui/accordion";
import { ServiceIcon } from "@/components/ui/service-icon";
import { ServiceVisual } from "@/components/interactive/service-visual";
import {
  FadeUp,
  Magnetic,
  SpotlightCard,
  Stagger,
  StaggerItem,
} from "@/components/motion/primitives";
import { TextReveal } from "@/components/motion/text-reveal";
import { ServiceCard, servicePriceLabel } from "@/components/services/service-card";

/** Every service page is prerendered at build time. */
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
    title: service.seoTitle ?? service.name,
    description: service.seoDescription ?? service.description,
    path: `/services/${service.slug}`,
  });
}

const primaryCta =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-setu px-7 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-setu-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-setu";
const secondaryCta =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full border-[1.5px] border-setu px-7 text-[15px] font-semibold text-foreground transition-colors duration-200 hover:bg-setu hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-setu";

/**
 * `params` is read inside a Suspense boundary so navigations render the shell
 * instantly. Every known slug is prerendered by `generateStaticParams`, so the
 * fallback only ever shows on the way to a 404.
 */
export default function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" aria-busy="true" />}>
      <ServiceLanding params={params} />
    </Suspense>
  );
}

async function ServiceLanding({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const group = serviceGroups.find((item) => item.id === service.group);
  const studies = caseStudies.filter((study) => study.services.includes(service.slug));
  const related = (service.related ?? [])
    .map((key) => getService(key))
    .filter((item): item is Service => Boolean(item));
  const faqs = service.faqs ?? [];
  const contactHref = `/contact?service=${service.slug}`;
  const estimateHref = `/estimate?s=${service.slug}`;

  return (
    <>
      <Hero service={service} groupLabel={group?.label} contactHref={contactHref} estimateHref={estimateHref} />

      {service.audience?.length ? (
        <section className="py-16 md:py-24" aria-labelledby="audience-heading">
          <div className="container-page">
            <SectionIntro
              id="audience-heading"
              eyebrow="Who it's for"
              title="Built for businesses like these"
            />
            <Stagger className="mt-10 grid gap-5 md:grid-cols-3">
              {service.audience.map((item, index) => (
                <StaggerItem key={item.title} className="h-full">
                  <div className="flex h-full flex-col rounded-[1.4rem] border border-border bg-surface p-6 md:p-7">
                    <span className="font-mono text-sm text-setu">0{index + 1}</span>
                    <h3 className="mt-4 font-display text-[1.2rem] font-semibold leading-snug text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[0.95rem] leading-relaxed text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      ) : null}

      {service.problems?.length ? (
        <section className="bg-background-subtle py-16 md:py-24" aria-labelledby="problems-heading">
          <div className="container-page">
            <SectionIntro
              id="problems-heading"
              eyebrow="Problems we fix"
              title="What goes wrong, and how we fix it"
            />
            <div className="mt-10 hidden grid-cols-[1fr_2.5rem_1.3fr] gap-4 px-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground md:grid">
              <span>The problem</span>
              <span aria-hidden />
              <span>Our fix</span>
            </div>
            <Stagger className="mt-4 flex flex-col gap-4">
              {service.problems.map((item) => (
                <StaggerItem key={item.problem} y={24}>
                  <div className="grid gap-3 md:grid-cols-[1fr_2.5rem_1.3fr] md:items-stretch md:gap-4">
                    <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-5">
                      <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                        <X className="size-3.5" aria-hidden />
                      </span>
                      <p className="font-medium text-foreground">
                        <span className="sr-only">Problem: </span>
                        {item.problem}
                      </p>
                    </div>
                    <span className="hidden items-center justify-center text-setu md:flex" aria-hidden>
                      <ArrowRight className="size-5" />
                    </span>
                    <div className="flex items-start gap-3 rounded-2xl border border-setu/30 bg-setu/[0.06] p-5">
                      <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-setu text-white">
                        <Check className="size-3.5" aria-hidden />
                      </span>
                      <p className="text-[0.97rem] leading-relaxed text-foreground/85">
                        <span className="sr-only">Our fix: </span>
                        {item.solution}
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      ) : null}

      <section className="py-16 md:py-24" aria-labelledby="included-heading">
        <div className="container-page">
          <SectionIntro
            id="included-heading"
            eyebrow="What's included"
            title="What we deliver"
          />

          {service.features?.length ? (
            <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {service.features.map((feature, index) => (
                <StaggerItem key={feature.title} className="h-full">
                  <SpotlightCard
                    tilt={3}
                    className="h-full rounded-[1.4rem] border border-border bg-surface p-6 transition-colors duration-300 hover:border-setu/40 md:p-7"
                  >
                    <span
                      className="inline-flex size-10 items-center justify-center rounded-xl font-mono text-sm font-semibold text-white"
                      style={{
                        backgroundImage: `linear-gradient(135deg, ${service.accent[0]}, ${service.accent[1]})`,
                      }}
                      aria-hidden
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-5 font-display text-[1.15rem] font-semibold leading-snug text-foreground">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-[0.94rem] leading-relaxed text-muted-foreground">
                      {feature.body}
                    </p>
                  </SpotlightCard>
                </StaggerItem>
              ))}
            </Stagger>
          ) : null}

          <FadeUp className="mt-8 rounded-[1.4rem] border border-border bg-background-subtle p-6 md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:gap-12">
              <div className="lg:w-64 lg:shrink-0">
                <h3 className="font-display text-[1.15rem] font-semibold text-foreground">
                  What you get at handover
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Delivered, documented and in your name.
                </p>
              </div>
              <ul className="grid flex-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                {service.deliverables.map((deliverable) => (
                  <li key={deliverable} className="flex gap-3">
                    <Check className="mt-0.5 size-5 shrink-0 text-setu" aria-hidden />
                    <span className="text-[0.95rem] text-foreground/85">{deliverable}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeUp>
        </div>
      </section>

      {service.process?.length ? (
        <ProcessTimeline service={service} />
      ) : null}

      <section className="py-16 md:py-24" aria-labelledby="pricing-heading">
        <div className="container-page grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <FadeUp className="flex flex-col gap-8 rounded-[1.4rem] border border-border bg-surface p-6 md:p-8">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-setu">
                Tools we use
              </span>
              <h2 className="mt-3 font-display text-2xl font-semibold text-foreground">
                Proven, well-supported tech
              </h2>
              <p className="mt-2 max-w-lg text-[0.95rem] leading-relaxed text-muted-foreground">
                Tools any good developer can pick up after us. No proprietary builders, no lock-in.
              </p>
              <ul className="mt-5 flex flex-wrap gap-2" aria-label="Technology and tools">
                {service.stack.map((tool) => (
                  <li
                    key={tool}
                    className="rounded-full border border-border bg-background-subtle px-3.5 py-1.5 text-sm font-medium text-foreground"
                  >
                    {tool}
                  </li>
                ))}
              </ul>
            </div>

            {service.commitments?.length ? (
              <div className="border-t border-border pt-6">
                <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                  <KeyRound className="size-5 text-setu" aria-hidden />
                  What we put in writing
                </h3>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {service.commitments.map((item) => (
                    <li key={item} className="flex gap-3">
                      <Check className="mt-0.5 size-5 shrink-0 text-setu" aria-hidden />
                      <span className="text-[0.95rem] text-foreground/85">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </FadeUp>

          <FadeUp delay={0.1} className="relative overflow-hidden rounded-[1.4rem] bg-black p-6 text-white md:p-8">
            <div
              className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-setu/30 blur-3xl"
              aria-hidden
            />
            <div className="relative flex h-full flex-col">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-setu">
                Pricing and timeline
              </span>
              <h2 id="pricing-heading" className="sr-only">
                {service.name} pricing and timeline
              </h2>
              <dl className="mt-5 grid gap-6">
                <div>
                  <dt className="flex items-center gap-2 text-sm text-white/60">
                    <IndianRupee className="size-4 text-setu" aria-hidden />
                    Starting from
                  </dt>
                  <dd className="mt-1 font-display text-[2.2rem] font-semibold leading-tight">
                    {servicePriceLabel(service).replace(/^From /, "")}
                  </dd>
                  {service.priceNote ? (
                    <dd className="mt-2 text-sm leading-relaxed text-white/65">{service.priceNote}</dd>
                  ) : null}
                </div>
                <div>
                  <dt className="flex items-center gap-2 text-sm text-white/60">
                    <Clock className="size-4 text-setu" aria-hidden />
                    Typical timeline
                  </dt>
                  <dd className="mt-1 text-xl font-semibold">{service.typicalTimeline}</dd>
                </div>
              </dl>
              <p className="mt-6 text-sm leading-relaxed text-white/65">
                The quote is fixed and in writing before any work starts.
              </p>
              <div className="mt-auto flex flex-col gap-3 pt-8 sm:flex-row lg:flex-col">
                <Link href={estimateHref} className={cn(primaryCta, "flex-1")}>
                  <Calculator className="size-4" aria-hidden />
                  Get an instant estimate
                </Link>
                <Link
                  href={contactHref}
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full border-[1.5px] border-white/30 px-6 text-[15px] font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
                >
                  Request a fixed quote
                </Link>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {studies.length > 0 ? (
        <section className="bg-background-subtle py-16 md:py-24" aria-labelledby="work-heading">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionIntro id="work-heading" eyebrow="Our work" title="Related projects" />
              <Link
                href="/work"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-setu hover:text-setu-dark"
              >
                All projects
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
            <Stagger className="mt-10 grid gap-5 md:grid-cols-2">
              {studies.map((study) => (
                <StaggerItem key={study.slug} className="h-full">
                  <Link
                    href={`/work/${study.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-[1.4rem] border border-border bg-surface transition-colors duration-300 hover:border-setu/50"
                  >
                    <span
                      className="block h-1.5"
                      style={{
                        backgroundImage: `linear-gradient(90deg, ${study.accent[0]}, ${study.accent[1]})`,
                      }}
                      aria-hidden
                    />
                    <div className="flex flex-1 flex-col p-6 md:p-7">
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        {study.sector} · {study.year}
                      </span>
                      <h3 className="mt-3 font-display text-[1.2rem] font-semibold leading-snug text-foreground">
                        {study.title}
                      </h3>
                      <p className="mt-2 text-[0.94rem] leading-relaxed text-muted-foreground">
                        {study.summary}
                      </p>
                      {study.results.length > 0 ? (
                        <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-5">
                          {study.results.slice(0, 2).map((metric) => (
                            <div key={metric.label}>
                              <dt className="text-xs text-muted-foreground">{metric.label}</dt>
                              <dd className="mt-0.5 font-display text-xl font-semibold text-foreground">
                                {metric.value}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      ) : null}
                      <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-setu">
                        Read the case study
                        <ArrowRight
                          className="size-4 transition-transform group-hover:translate-x-1"
                          aria-hidden
                        />
                      </span>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      ) : null}

      {faqs.length > 0 ? (
        <section className="py-16 md:py-24" aria-labelledby="faq-heading">
          <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
            <FadeUp className="lg:sticky lg:top-28 lg:self-start">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-setu">FAQ</span>
              <h2
                id="faq-heading"
                className="mt-3 font-display text-3xl font-semibold leading-tight text-foreground sm:text-[2.2rem]"
              >
                Common questions
              </h2>
              <p className="mt-4 max-w-sm text-[0.98rem] leading-relaxed text-muted-foreground">
                Something not covered here? Ask the engineer who would build it, by email, phone or WhatsApp.
              </p>
              <Link
                href={contactHref}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-setu hover:text-setu-dark"
              >
                Ask your question
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </FadeUp>
            <Accordion items={faqs} defaultOpen={0} />
          </div>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="bg-background-subtle py-16 md:py-24" aria-labelledby="related-heading">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionIntro
                id="related-heading"
                eyebrow="Often paired with"
                title="Related services"
              />
              <Link
                href="/services"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-setu hover:text-setu-dark"
              >
                All services
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
            <Stagger className="mt-10 grid gap-5 md:grid-cols-3">
              {related.map((item) => (
                <StaggerItem key={item.slug} className="h-full">
                  <ServiceCard
                    service={item}
                    sizes="(min-width: 1280px) 24rem, (min-width: 768px) 33vw, 100vw"
                  />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      ) : null}

      <section className="py-16 md:py-24" aria-labelledby="final-cta-heading">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-[1.6rem] bg-setu px-6 py-12 text-white sm:px-10 md:px-14 md:py-16">
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" aria-hidden />
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                  {service.name}
                </span>
                <TextReveal
                  as="h2"
                  id="final-cta-heading"
                  className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-[2.6rem]"
                >
                  {"Get a fixed quote in writing"}
                </TextReveal>
                <p className="mt-4 text-[1.02rem] leading-relaxed text-white/85">
                  Send what you have: a brief, a site you like, or just the problem. An engineer
                  replies within one working day with questions, options and a next step.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
                <Magnetic strength={0.2}>
                  <Link
                    href={contactHref}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-7 text-[15px] font-semibold text-black transition-colors hover:bg-black hover:text-white"
                  >
                    Send your brief
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Magnetic>
                <a
                  href={site.phoneHref}
                  className="inline-flex h-12 items-center justify-center rounded-full border-[1.5px] border-white/60 px-7 text-[15px] font-semibold text-white transition-colors hover:bg-white/15"
                >
                  Call {site.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <JsonLd
        data={serviceJsonLd({
          name: service.name,
          description: service.seoDescription ?? service.description,
          path: `/services/${service.slug}`,
          priceFrom: service.priceFrom,
        })}
      />
      {faqs.length > 0 ? <JsonLd data={faqJsonLd(faqs)} /> : null}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Services", path: "/services" },
          { name: service.name, path: `/services/${service.slug}` },
        ])}
      />
    </>
  );
}

function SectionIntro({ id, eyebrow, title }: { id: string; eyebrow: string; title: string }) {
  return (
    <FadeUp className="max-w-2xl">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-setu">{eyebrow}</span>
      <h2
        id={id}
        className="mt-3 font-display text-3xl font-semibold leading-tight text-foreground sm:text-[2.2rem]"
      >
        {title}
      </h2>
    </FadeUp>
  );
}

/** Bottom-weighted navy so the inset card sits on a calm edge, plus a cyan wash. */
const HERO_PHOTO_OVERLAY = [
  "linear-gradient(to top, rgba(11,16,32,0.55) 0%, rgba(11,16,32,0.1) 45%, rgba(11,16,32,0) 100%)",
  "linear-gradient(135deg, rgba(0,161,198,0.2) 0%, rgba(0,161,198,0) 55%)",
].join(", ");

function Hero({
  service,
  groupLabel,
  contactHref,
  estimateHref,
}: {
  service: Service;
  groupLabel?: string;
  contactHref: string;
  estimateHref: string;
}) {
  const photo = servicePhotos[service.slug];
  return (
    <section className="relative overflow-hidden border-b border-border pb-16 pt-28 md:pb-24 md:pt-36">
      <div className="pointer-events-none absolute inset-0 bg-mesh opacity-60" aria-hidden />

      <div className="container-page relative">
        <nav aria-label="Breadcrumb" className="mb-8 text-xs text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="transition-colors hover:text-foreground">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/services" className="transition-colors hover:text-foreground">
                Services
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-foreground">
              {service.name}
            </li>
          </ol>
        </nav>

        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-14">
          <div className="min-w-0">
            <FadeUp immediate className="flex items-center gap-3">
              <ServiceIcon name={service.icon} accent={service.accent} className="size-10" size={19} />
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-setu">
                {groupLabel ? `${groupLabel} · ` : ""}
                {service.name}
              </span>
            </FadeUp>

            <TextReveal
              as="h1"
              immediate
              delay={0.05}
              stagger={0.04}
              className="mt-5 font-display text-[2.3rem] font-semibold leading-[1.08] text-foreground sm:text-5xl lg:text-[3.4rem]"
            >
              {service.headline ?? service.name}
            </TextReveal>

            <FadeUp immediate delay={0.25}>
              <p className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-muted-foreground md:text-lg">
                {service.subheadline ?? service.description}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Magnetic strength={0.2}>
                  <Link href={estimateHref} className={cn(primaryCta, "w-full")}>
                    Price this service
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Magnetic>
                <Link href={contactHref} className={secondaryCta}>
                  Talk to an engineer
                </Link>
              </div>

              <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-border pt-6 sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-muted-foreground">Starting from</dt>
                  <dd className="mt-1 font-semibold text-foreground">
                    {servicePriceLabel(service).replace(/^From /, "")}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Typical timeline</dt>
                  <dd className="mt-1 font-semibold text-foreground">{service.typicalTimeline}</dd>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <dt className="text-xs text-muted-foreground">First call</dt>
                  <dd className="mt-1 font-semibold text-foreground">Free, 30 minutes</dd>
                </div>
              </dl>
            </FadeUp>
          </div>

          <FadeUp immediate delay={0.2} className="min-w-0">
            {/* A large photo panel, with the service's motion graphic as an
                inset card overlapping its lower-left corner. */}
            <div className="relative">
              <figure className="relative aspect-[4/3] overflow-hidden rounded-[1.6rem] bg-[#0b1020] shadow-2xl ring-1 ring-black/5 lg:aspect-[5/4]">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  loading="eager"
                  fetchPriority="high"
                  sizes="(min-width: 1280px) 34rem, (min-width: 1024px) 44vw, 100vw"
                  className="object-cover"
                />
                <span
                  className="pointer-events-none absolute inset-0"
                  style={{ backgroundImage: HERO_PHOTO_OVERLAY }}
                  aria-hidden
                />
                <figcaption className="absolute right-3 top-3 rounded-full bg-[#0b1020]/55 px-2.5 py-1 text-[10px] font-medium text-white/90 backdrop-blur-md">
                  {photo.credit}
                </figcaption>
              </figure>
              <ServiceVisual
                variant={service.icon}
                accent={service.accent}
                className="relative z-10 mx-4 -mt-16 w-auto shadow-2xl sm:mx-10 sm:-mt-24 lg:absolute lg:-bottom-10 lg:-left-8 lg:mx-0 lg:mt-0 lg:w-[60%]"
              />
            </div>
            <ul className="mt-5 flex flex-wrap gap-2 lg:mt-16" aria-label="Key outcomes">
              {service.outcomes.map((outcome) => (
                <li
                  key={outcome}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/90 px-3 py-1.5 text-xs font-medium text-foreground"
                >
                  <Check className="size-3.5 shrink-0 text-setu" aria-hidden />
                  {outcome}
                </li>
              ))}
            </ul>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

function ProcessTimeline({ service }: { service: Service }) {
  const steps = service.process ?? [];
  return (
    <section className="relative overflow-hidden bg-black py-16 text-white md:py-24" aria-labelledby="process-heading">
      <div
        className="pointer-events-none absolute -left-40 top-1/3 size-[28rem] rounded-full bg-setu/15 blur-3xl"
        aria-hidden
      />
      <div className="container-page relative grid gap-12 lg:grid-cols-[1fr_1.7fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-setu">
            How it runs
          </span>
          <TextReveal
            as="h2"
            id="process-heading"
            className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-[2.4rem]"
          >
            {"Step by step, with dates"}
          </TextReveal>
          <p className="mt-4 max-w-sm text-[0.98rem] leading-relaxed text-white/65">
            {steps.length} stages. Typical timeline: {service.typicalTimeline.toLowerCase()}. You
            sign off each stage before the next one starts.
          </p>
          <Link
            href="/process"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-setu hover:text-white"
          >
            How we work on every project
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </div>

        <Stagger as="ol" className="relative flex flex-col">
          {steps.map((step, index) => (
            <StaggerItem as="li" key={step.title} y={24} className="relative flex gap-5 pb-8 last:pb-0">
              {index < steps.length - 1 ? (
                <span className="absolute left-[1.1875rem] top-11 bottom-0 w-px bg-white/15" aria-hidden />
              ) : null}
              <span className="relative inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-setu/60 bg-black font-mono text-sm text-setu">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-display text-lg font-semibold">{step.title}</h3>
                  <span className="rounded-full bg-setu/15 px-2.5 py-0.5 font-mono text-xs text-setu">
                    {step.duration}
                  </span>
                </div>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-white/70">{step.body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
