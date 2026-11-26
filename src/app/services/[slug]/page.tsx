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
} from "lucide-react";

import {
  caseStudies,
  getService,
  serviceGroups,
  serviceStartingPrice,
  services,
  type Service,
} from "@/lib/content";
import { breadcrumbJsonLd, faqJsonLd, pageMetadata, serviceJsonLd } from "@/lib/seo";
import { servicePhotos } from "@/lib/service-photos";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { JsonLd } from "@/components/seo/json-ld";
import { Accordion } from "@/components/ui/accordion";
import { Section } from "@/components/ui/section";
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

/** Thin border plus a layered, soft shadow for cards on light surfaces. */
const CARD_SHADOW =
  "shadow-[0_1px_2px_rgb(15_23_42/0.04),0_10px_28px_-14px_rgb(15_23_42/0.14),0_28px_56px_-32px_rgb(15_23_42/0.12)]";

const primaryCta =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-setu px-7 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-setu-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-setu";
const secondaryCta =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full border-[1.5px] border-setu px-7 text-[15px] font-semibold text-foreground transition-colors duration-200 hover:bg-setu hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-setu";

export default async function ServiceLanding({ params }: { params: Promise<{ slug: string }> }) {
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
      <Hero service={service} groupLabel={group?.label} estimateHref={estimateHref} />

      {service.audience?.length ? (
        <Section surface="grid" aria-labelledby="audience-heading">
          <div className="container-page">
            <SectionIntro
              id="audience-heading"
              eyebrow="Who it is for"
              title="Organisations we typically work with"
            />
            <Stagger className="mt-10 grid gap-5 md:grid-cols-3">
              {service.audience.map((item, index) => (
                <StaggerItem key={item.title} className="h-full">
                  <div className={cn("flex h-full flex-col rounded-2xl border border-border bg-surface p-6 md:p-7", CARD_SHADOW)}>
                    <span className="inline-flex size-10 items-center justify-center rounded-xl bg-setu/10 font-mono text-sm font-semibold text-setu ring-1 ring-inset ring-setu/20">
                      0{index + 1}
                    </span>
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
        </Section>
      ) : null}

      {service.problems?.length ? (
        <Section surface="tint" aria-labelledby="problems-heading">
          <div className="container-page">
            <SectionIntro
              id="problems-heading"
              eyebrow="Challenges we solve"
              title="Common challenges and our approach"
            />
            <Stagger className="mt-10 grid gap-5 md:grid-cols-2">
              {service.problems.map((item, index) => (
                <StaggerItem key={item.problem} y={24} className="h-full">
                  <article
                    className={cn(
                      "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-colors duration-300 hover:border-setu/40",
                      CARD_SHADOW,
                    )}
                  >
                    <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-[linear-gradient(180deg,#2f56d8,#3b6cf6)] opacity-70" />
                    <div className="flex items-start gap-4 p-6 pb-5 md:p-7 md:pb-5">
                      <span className="font-mono text-sm font-semibold text-setu">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          The challenge
                        </p>
                        <h3 className="mt-1.5 text-[1.08rem] font-semibold leading-snug text-foreground">
                          {item.problem}
                        </h3>
                      </div>
                    </div>
                    <div className="mt-auto flex items-start gap-3 border-t border-border bg-setu/[0.04] px-6 py-5 md:px-7">
                      <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-setu text-white">
                        <Check className="size-3.5" aria-hidden />
                      </span>
                      <p className="text-[0.95rem] leading-relaxed text-foreground/80">
                        <span className="font-semibold text-foreground">Our approach: </span>
                        {item.solution}
                      </p>
                    </div>
                  </article>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </Section>
      ) : null}

      <Section aria-labelledby="included-heading">
        <div className="container-page">
          <SectionIntro
            id="included-heading"
            eyebrow="What is included"
            title="What we deliver"
            description="Every engagement includes the following, confirmed in your written proposal."
          />

          {service.features?.length ? (
            <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {service.features.map((feature, index) => (
                <StaggerItem key={feature.title} className="h-full">
                  <SpotlightCard
                    tilt={3}
                    className={cn("h-full rounded-2xl border border-border bg-surface p-6 transition-colors duration-300 hover:border-setu/40 md:p-7", CARD_SHADOW)}
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

          <FadeUp className="mt-8 rounded-2xl border border-setu/20 bg-[linear-gradient(135deg,rgba(47,86,216,0.07),rgba(59,130,246,0.03))] p-6 md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:gap-12">
              <div className="lg:w-64 lg:shrink-0">
                <h3 className="font-display text-[1.15rem] font-semibold text-foreground">
                  Deliverables
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Provided at handover, with full documentation.
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
      </Section>

      {service.process?.length ? (
        <ProcessTimeline service={service} />
      ) : null}

      <Section surface="dots" aria-labelledby="pricing-heading">
        <div className="container-page grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <FadeUp className={cn("flex flex-col gap-8 rounded-2xl border border-border bg-surface p-6 md:p-8", CARD_SHADOW)}>
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-setu">
                Technologies
              </span>
              <h2 className="mt-3 font-display text-2xl font-semibold text-foreground">
                Proven, well-supported technologies
              </h2>
              <p className="mt-2 max-w-lg text-[0.95rem] leading-relaxed text-muted-foreground">
                Established tools selected for performance, security and long-term maintainability.
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
                  Our commitments
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
                Every engagement begins with a fixed quote, agreed in writing before work starts.
              </p>
              {service.group === "run" ? (
                <p className="mt-3 text-sm leading-relaxed text-white/65">
                  Existing clients can email{" "}
                  <a
                    href={`mailto:${site.supportEmail}`}
                    className="font-medium text-white underline underline-offset-2 hover:text-setu"
                  >
                    {site.supportEmail}
                  </a>{" "}
                  for changes, fixes and hosting requests.
                </p>
              ) : null}
              <div className="mt-auto flex flex-col gap-3 pt-8 sm:flex-row lg:flex-col">
                <Link href={estimateHref} className={cn(primaryCta, "sm:flex-1 lg:flex-none")}>
                  <Calculator className="size-4" aria-hidden />
                  Get an instant estimate
                </Link>
                <Link
                  href={contactHref}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-[1.5px] border-white/30 sm:flex-1 lg:flex-none px-6 text-[15px] font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
                >
                  Request a quote
                </Link>
              </div>
            </div>
          </FadeUp>
        </div>
      </Section>

      {studies.length > 0 ? (
        <Section surface="grid" aria-labelledby="work-heading">
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
                    className={cn("group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-colors duration-300 hover:border-setu/50", CARD_SHADOW)}
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
                        View case study
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
        </Section>
      ) : null}

      {faqs.length > 0 ? (
        <Section aria-labelledby="faq-heading">
          <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
            <FadeUp className="lg:sticky lg:top-28 lg:self-start">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-setu">FAQ</span>
              <h2
                id="faq-heading"
                className="mt-3 font-display text-3xl font-semibold leading-tight text-foreground sm:text-[2.2rem]"
              >
                Frequently asked questions
              </h2>
              <p className="mt-4 max-w-sm text-[0.98rem] leading-relaxed text-muted-foreground">
                If your question is not covered here, our team will reply within one business day.
              </p>
              <Link
                href={contactHref}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-setu hover:text-setu-dark"
              >
                Ask a question
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </FadeUp>
            <Accordion items={faqs} defaultOpen={0} />
          </div>
        </Section>
      ) : null}

      {related.length > 0 ? (
        <Section surface="tint" aria-labelledby="related-heading">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionIntro
                id="related-heading"
                eyebrow="Explore more"
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
        </Section>
      ) : null}

      <Section aria-labelledby="final-cta-heading">
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
                  {"Request a fixed-price proposal"}
                </TextReveal>
                <p className="mt-4 text-[1.02rem] leading-relaxed text-white/85">
                  Share your requirements and our team will respond within one business day
                  with a recommended approach.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
                <Magnetic strength={0.2}>
                  <Link
                    href={contactHref}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-7 text-[15px] font-semibold text-black transition-colors hover:bg-black hover:text-white"
                  >
                    Start a project
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
      </Section>

      <JsonLd
        data={serviceJsonLd({
          name: service.name,
          description: service.seoDescription ?? service.description,
          path: `/services/${service.slug}`,
          priceFrom: serviceStartingPrice(service),
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

function SectionIntro({
  id,
  eyebrow,
  title,
  description,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <FadeUp className="max-w-2xl">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-setu">{eyebrow}</span>
      <h2
        id={id}
        className="mt-3 font-display text-3xl font-semibold leading-tight text-foreground sm:text-[2.2rem]"
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-[0.98rem] leading-relaxed text-muted-foreground md:text-[1.05rem]">
          {description}
        </p>
      ) : null}
    </FadeUp>
  );
}

/** Bottom-weighted navy so the inset card sits on a calm edge, plus a cyan wash. */
const HERO_PHOTO_OVERLAY = [
  "linear-gradient(to top, rgba(11,16,32,0.55) 0%, rgba(11,16,32,0.1) 45%, rgba(11,16,32,0) 100%)",
  "linear-gradient(135deg, rgba(47,86,216,0.2) 0%, rgba(47,86,216,0) 55%)",
].join(", ");

function Hero({
  service,
  groupLabel,
  estimateHref,
}: {
  service: Service;
  groupLabel?: string;
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
                    Get an estimate
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Magnetic>
                <Link href="/book" className={secondaryCta}>
                  Book a consultation
                </Link>
              </div>

              <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-border pt-6">
                <div>
                  <dt className="text-xs text-muted-foreground">Typical timeline</dt>
                  <dd className="mt-1 font-semibold text-foreground">{service.typicalTimeline}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Consultation</dt>
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

/** Sentence-initial numbers are written as words. */
const STAGE_COUNT: Record<number, string> = { 3: "Three", 4: "Four", 5: "Five", 6: "Six", 7: "Seven" };

function ProcessTimeline({ service }: { service: Service }) {
  const steps = service.process ?? [];
  return (
    <Section surface="ink" aria-labelledby="process-heading">
      <div className="container-page relative grid gap-12 lg:grid-cols-[1fr_1.7fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-setu">
            Our process
          </span>
          <TextReveal
            as="h2"
            id="process-heading"
            className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-[2.4rem]"
          >
            {"A structured delivery plan"}
          </TextReveal>
          <p className="mt-4 max-w-sm text-[0.98rem] leading-relaxed text-white/65">
            {STAGE_COUNT[steps.length] ?? steps.length} stages, each reviewed and approved before
            the next begins. Typical timeline: {service.typicalTimeline.toLowerCase()}.
          </p>
          <Link
            href="/process"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-setu hover:text-white"
          >
            View our delivery process
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </div>

        <Stagger as="ol" className="relative flex flex-col">
          {steps.map((step, index) => (
            <StaggerItem as="li" key={step.title} y={24} className="relative flex gap-5 pb-8 last:pb-0">
              {index < steps.length - 1 ? (
                <span className="absolute left-[1.1875rem] top-11 bottom-0 w-px bg-white/15" aria-hidden />
              ) : null}
              <span className="relative inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-setu/60 bg-[#05070d] font-mono text-sm text-setu">
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
    </Section>
  );
}
