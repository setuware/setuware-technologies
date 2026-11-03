import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, CircleAlert } from "lucide-react";

import { getService } from "@/lib/content";
import { getIndustry, industries } from "@/lib/industries";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";
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
    title: industry.seoTitle,
    description: industry.seoDescription,
    path: `/industries/${industry.slug}`,
  });
}

const START_STEPS = [
  {
    title: "Consultation",
    body: "A free 30-minute call to understand your operations, current tools and objectives.",
  },
  {
    title: "Proposal",
    body: "A written scope, timeline and fixed price, agreed before any work begins.",
  },
  {
    title: "Delivery",
    body: "Regular reviews on a live preview, so your team can test the system before launch.",
  },
] as const;

/** White card with a thin border and a layered, soft shadow. */
const CARD =
  "rounded-2xl border border-border bg-surface shadow-[0_1px_2px_rgb(15_23_42/0.04),0_10px_28px_-14px_rgb(15_23_42/0.14),0_28px_56px_-32px_rgb(15_23_42/0.12)]";

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
  // The distinct services behind this sector's solutions, in first-mention order.
  const serviceKeys = [...new Set(industry.builds.map((build) => build.service))];
  const linkedServices = serviceKeys
    .map((key) => getService(key))
    .filter((service): service is NonNullable<typeof service> => Boolean(service));

  return (
    <>
      <PageHero
        video="industries"
        align="left"
        eyebrow={industry.name}
        title={industry.headline}
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
            href="/book"
            size="lg"
            variant="ghost"
            className="rounded-full bg-setu font-semibold text-white hover:bg-setu-dark dark:hover:bg-setu-dark"
          >
            Book a consultation
            <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
          <ButtonLink href="/estimate" size="lg" variant="secondary" className="rounded-full">
            Get an instant estimate
          </ButtonLink>
        </div>
      </PageHero>

      {/* Overview beside a large photograph. */}
      <Section surface="grid" aria-labelledby="overview-heading">
        <div className="container-page grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          <div className="min-w-0">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Overview
            </span>
            <h2
              id="overview-heading"
              className="mt-4 text-3xl font-semibold leading-[1.15] text-foreground sm:text-4xl"
            >
              {industry.overview.title}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-[1.05rem]">
              {industry.overview.body}
            </p>
            <ul className="mt-8 flex flex-col gap-3" aria-label="What you can expect">
              {industry.outcomes.map((outcome) => (
                <li key={outcome} className={cn(CARD, "flex items-center gap-3.5 px-4 py-3.5")}>
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-setu/10 text-setu ring-1 ring-inset ring-setu/20">
                    <Check className="size-4" aria-hidden />
                  </span>
                  <span className="text-[0.95rem] font-medium text-foreground">{outcome}</span>
                </li>
              ))}
            </ul>
          </div>

          <Reveal className="relative min-w-0">
            <div
              aria-hidden
              className="absolute -inset-3 -z-10 rounded-[2rem] bg-[linear-gradient(135deg,rgba(0,161,198,0.18),rgba(59,130,246,0.08)_60%,transparent)] blur-xl"
            />
            <figure className="relative aspect-[3/2] overflow-hidden rounded-[1.6rem] bg-[#0b1020] shadow-2xl ring-1 ring-black/5">
              <Image
                src={industry.image.src}
                alt={industry.image.alt}
                fill
                sizes="(min-width: 1280px) 38rem, (min-width: 1024px) 48vw, 100vw"
                className="object-cover"
              />
              <span
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(to_top,rgba(11,16,32,0.55)_0%,rgba(11,16,32,0)_45%)]"
              />
              <figcaption className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-xl border border-white/20 bg-[#0b1020]/55 px-4 py-3 text-white backdrop-blur-md sm:right-auto">
                <IndustryIcon
                  name={industry.icon}
                  className="size-9 bg-white/15 text-white ring-white/20"
                  size={17}
                />
                <span className="text-sm font-semibold">{industry.name}</span>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </Section>

      <Section surface="tint" aria-labelledby="challenges-heading">
        <div className="container-page">
          <SectionHeading
            align="left"
            eyebrow="Challenges we solve"
            title={<span id="challenges-heading">Common challenges for {industry.sector}</span>}
            description="The operational issues that most often prompt a new website or system in this sector."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {industry.problems.map((problem, index) => (
              <Reveal
                key={problem.title}
                delay={(index % 2) * 70}
                className={cn(CARD, "flex gap-4 p-6 md:p-7")}
              >
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-setu/10 text-setu ring-1 ring-inset ring-setu/20">
                  <CircleAlert className="size-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[1.05rem] font-semibold text-foreground">{problem.title}</h3>
                  <p className="mt-2 text-[0.93rem] leading-relaxed text-muted-foreground">
                    {problem.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Section aria-labelledby="solutions-heading">
        <div className="container-page">
          <SectionHeading
            align="left"
            eyebrow="What we build"
            title={<span id="solutions-heading">Solutions for {industry.sector}</span>}
            description="Each solution is delivered through one of our core services, with the scope and price fixed in a written proposal."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {industry.builds.map((build, index) => {
              const service = getService(build.service);
              return (
                <Reveal key={build.title} delay={(index % 3) * 70} className="h-full">
                  <Link
                    href={`/services/${build.service}`}
                    className={cn(
                      CARD,
                      "group flex h-full flex-col p-6 transition-[transform,border-color] duration-300 hover:border-setu/40 motion-safe:hover:-translate-y-1 md:p-7",
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {service ? (
                        <ServiceIcon name={service.icon} accent={service.accent} className="size-11" size={20} />
                      ) : null}
                      <span className="font-mono text-xs font-semibold text-setu">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="mt-5 text-[1.1rem] font-semibold leading-snug text-foreground">
                      {build.title}
                    </h3>
                    <p className="mt-2 text-[0.93rem] leading-relaxed text-muted-foreground">
                      {build.body}
                    </p>
                    {service ? (
                      <span className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4 text-sm">
                        <span className="text-muted-foreground">
                          Service: <span className="font-semibold text-setu">{service.name}</span>
                        </span>
                        <ArrowRight
                          className="size-4 shrink-0 text-setu transition-transform group-hover:translate-x-1"
                          aria-hidden
                        />
                      </span>
                    ) : null}
                  </Link>
                </Reveal>
              );
            })}
            {industry.builds.length % 3 !== 0 ? (
              // Completes the last row on wide screens with a route for other needs.
              <Reveal delay={140} className="h-full">
                <Link
                  href="/contact"
                  className="group flex h-full flex-col justify-between gap-6 rounded-2xl border border-dashed border-setu/40 bg-setu/[0.04] p-6 transition-colors duration-300 hover:border-setu hover:bg-setu/[0.07] md:p-7"
                >
                  <div>
                    <h3 className="text-[1.1rem] font-semibold leading-snug text-foreground">
                      Need something else?
                    </h3>
                    <p className="mt-2 text-[0.93rem] leading-relaxed text-muted-foreground">
                      Describe the process you want to improve, and we will recommend a solution
                      with a fixed-price proposal.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-setu">
                    Discuss your requirements
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                  </span>
                </Link>
              </Reveal>
            ) : null}
          </div>
        </div>
      </Section>

      <Section surface="ink" aria-labelledby="features-heading">
        <div className="container-page grid gap-12 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
          <div className="min-w-0">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-setu">
              Typical features
            </span>
            <h2
              id="features-heading"
              className="mt-4 text-3xl font-semibold leading-[1.15] text-foreground sm:text-4xl"
            >
              Features commonly included
            </h2>
            <p className="mt-4 max-w-xl text-[0.98rem] leading-relaxed text-muted-foreground">
              Every project is scoped to your requirements. These features are commonly
              requested by {industry.sector}.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {industry.features.map((feature) => (
                <li
                  key={feature}
                  className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-[0.93rem] leading-snug text-foreground/90"
                >
                  <Check className="mt-0.5 size-4 shrink-0 text-setu" aria-hidden />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex min-w-0 flex-col gap-5 lg:self-start">
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-7 backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-foreground">How we begin</h2>
              <ol className="mt-6 flex flex-col gap-5">
                {START_STEPS.map((step, index) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-setu/50 font-mono text-xs font-semibold text-setu">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="font-semibold text-foreground">{step.title}</p>
                      <p className="mt-1 text-[0.9rem] leading-relaxed text-muted-foreground">
                        {step.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
              <Link
                href="/process"
                className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-setu hover:text-foreground"
              >
                View our delivery process
                <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-7">
              <h2 className="text-lg font-semibold text-foreground">Services involved</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {linkedServices.map((service) => (
                  <li key={service.slug}>
                    <Link
                      href={`/services/${service.slug}`}
                      className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-setu hover:text-setu"
                    >
                      {service.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      <Section surface="dots" aria-labelledby="other-industries-heading">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              align="left"
              eyebrow="Other sectors"
              title={<span id="other-industries-heading">Explore other industries</span>}
            />
            <Link
              href="/industries"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-setu hover:text-setu-dark"
            >
              All industries
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {others.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/industries/${item.slug}`}
                  className={cn(
                    CARD,
                    "group flex h-full flex-col overflow-hidden transition-[transform,border-color] duration-300 hover:border-setu/40 motion-safe:hover:-translate-y-1",
                  )}
                >
                  <span className="relative block aspect-[3/2] overflow-hidden" aria-hidden>
                    <Image
                      src={item.image.src}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 18rem, (min-width: 768px) 25vw, 50vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.05] motion-reduce:transition-none"
                    />
                  </span>
                  <span className="flex flex-1 items-center gap-2.5 p-3.5 sm:p-4">
                    <IndustryIcon name={item.icon} className="hidden size-8 rounded-lg sm:inline-flex" size={15} />
                    <span className="text-sm font-semibold leading-snug text-foreground">{item.name}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <DeferredSection minHeight={380}>
        <CtaBand title={industry.cta.title} description={industry.cta.body} primaryLabel="Book a consultation" />
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
