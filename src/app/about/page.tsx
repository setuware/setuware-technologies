import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Handshake,
  KeyRound,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";

import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { services } from "@/lib/content";
import { heroVideoPoster, heroVideoSources } from "@/lib/media";
import { HeroVideo } from "@/components/interactive/hero-video";
import { PipelineAnimation } from "@/components/interactive/pipeline-animation";
import { PageHero } from "@/components/layout/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { ServiceIcon } from "@/components/ui/service-icon";
import { TextReveal } from "@/components/motion/text-reveal";
import {
  FadeUp,
  SpotlightCard,
  Stagger,
  StaggerItem,
} from "@/components/motion/primitives";

export const metadata = pageMetadata({
  title: "About us",
  description: `${site.name} is a ${site.address.city}-based digital studio that designs and engineers websites, e-commerce platforms, mobile apps and custom software.`,
  path: "/about",
});

/** Plain facts, all drawn from site data, shown under the hero. */
const FACTS = [
  { label: "Based in", value: `${site.address.street}, ${site.address.city}` },
  { label: "Consultation", value: "Free, 30 minutes" },
  { label: "Proposals", value: "Fixed price" },
  { label: "Post-launch support", value: "Three months" },
] as const;

const VALUES = [
  {
    Icon: MessageSquareText,
    title: "Transparency",
    body: "Every engagement begins with a clear scope and a fixed quote, followed by regular progress updates.",
  },
  {
    Icon: ShieldCheck,
    title: "Quality",
    body: "We build fast, secure and accessible products that follow established engineering standards.",
  },
  {
    Icon: KeyRound,
    title: "Ownership",
    body: "Your code, domains and accounts remain the property of your business at every stage.",
  },
  {
    Icon: Handshake,
    title: "Partnership",
    body: "We support and improve your platforms long after launch, as a dependable extension of your team.",
  },
] as const;

const HOW_WE_WORK = [
  {
    step: "01",
    title: "Discovery",
    body: "A free consultation to understand your business, customers and objectives.",
  },
  {
    step: "02",
    title: "Proposal",
    body: "A written scope, timeline and fixed price, agreed before work begins.",
  },
  {
    step: "03",
    title: "Design and development",
    body: "Interactive prototypes, followed by development with regular progress reviews.",
  },
  {
    step: "04",
    title: "Launch and support",
    body: "Testing, go-live and handover, followed by ongoing maintenance and optimisation.",
  },
] as const;

const INDUSTRIES = [
  "Retail and D2C brands",
  "Healthcare and clinics",
  "Schools and coaching institutes",
  "Logistics and transport",
  "Finance and SaaS",
  "Real estate",
  "Manufacturing and distribution",
  "Professional services",
] as const;

export default function AboutPage() {
  return (
    <>
      <PageHero
        video="about"
        align="left"
        eyebrow={`About ${site.name}`}
        title="Strategy, design and engineering under one roof"
        description={`${site.name} is a digital studio based in ${site.address.city}. We design and engineer websites, e-commerce platforms, mobile apps and custom software for growing businesses.`}
      >
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink
            href="/contact"
            size="lg"
            className="rounded-full bg-setu text-white shadow-none hover:bg-setu-dark"
          >
            Book a consultation
            <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
          <ButtonLink href="/work" size="lg" variant="secondary" className="rounded-full">
            View our work
          </ButtonLink>
        </div>

        <div className="mt-10 lg:max-w-2xl">
          <HeroVideo
            sources={heroVideoSources()}
            poster={heroVideoPoster()}
            fallback={<PipelineAnimation />}
            label="Setuware Technologies delivery pipeline in motion"
          />
        </div>

        <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-border pt-9 lg:grid-cols-4">
          {FACTS.map((fact) => (
            <div key={fact.label} className="flex flex-col-reverse gap-1">
              <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                {fact.label}
              </dt>
              <dd className="font-display text-lg font-semibold text-foreground sm:text-xl">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </PageHero>

      {/* Who we are */}
      <Section>
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-setu">
              Who we are
            </span>
            <TextReveal
              as="h2"
              className="mt-4 font-display text-3xl font-semibold leading-tight text-foreground sm:text-[2.4rem]"
            >
              {"A digital studio for\ngrowing businesses"}
            </TextReveal>
          </div>

          <Stagger className="flex flex-col gap-5 text-[1.02rem] leading-relaxed text-muted-foreground" delay={0.1}>
            <StaggerItem y={24}>
              <p>
                We partner with startups, SMEs and established companies across
                India to plan, design and build digital products that perform.
              </p>
            </StaggerItem>
            <StaggerItem y={24}>
              <p>
                Our designers, developers, marketers and project managers work
                as one accountable team. Each engagement is led by a dedicated
                project manager from discovery to launch.
              </p>
            </StaggerItem>
            <StaggerItem y={24}>
              <p>
                Beyond launch, we provide hosting, maintenance and continuous
                improvement, so your platforms remain secure and effective as
                your business grows.
              </p>
            </StaggerItem>
            <StaggerItem y={24}>
              <div className="rounded-card border border-setu/30 bg-setu/[0.06] p-6">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-setu">
                  Our mission
                </span>
                <p className="mt-2 font-display text-xl font-semibold leading-snug text-foreground">
                  To help growing businesses compete online with dependable, well-crafted
                  technology.
                </p>
              </div>
            </StaggerItem>
          </Stagger>
        </div>
      </Section>

      {/* What we believe */}
      <Section surface="subtle">
        <div className="container-page">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-setu">
              Our approach
            </span>
            <TextReveal
              as="h2"
              className="mt-4 font-display text-3xl font-semibold leading-tight text-foreground sm:text-[2.4rem]"
            >
              The values behind every engagement
            </TextReveal>
            <FadeUp delay={0.2} y={20}>
              <p className="mt-4 text-[1.02rem] leading-relaxed text-muted-foreground">
                Four principles guide how we plan, deliver and support every project.
              </p>
            </FadeUp>
          </div>

          <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
            {VALUES.map(({ Icon, title, body }) => (
              <StaggerItem key={title} y={28}>
                <SpotlightCard
                  tilt={3}
                  className="h-full rounded-card border border-border bg-surface p-6 shadow-ambient md:p-7"
                >
                  <div className="relative">
                    <span className="inline-flex size-11 items-center justify-center rounded-xl bg-setu/10 text-setu">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <h3 className="mt-5 font-display text-lg font-semibold text-foreground">
                      {title}
                    </h3>
                    <p className="mt-2 text-[0.93rem] leading-relaxed text-muted-foreground">
                      {body}
                    </p>
                  </div>
                </SpotlightCard>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Section>

      {/* How we work */}
      <Section>
        <div className="container-page">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-setu">
                How we work
              </span>
              <TextReveal
                as="h2"
                className="mt-4 font-display text-3xl font-semibold leading-tight text-foreground sm:text-[2.4rem]"
              >
                A structured path from discovery to launch
              </TextReveal>
            </div>
            <FadeUp delay={0.2} y={16}>
              <ButtonLink href="/process" variant="secondary">
                View our process
                <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
            </FadeUp>
          </div>

          <Stagger as="ol" className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_WE_WORK.map((item) => (
              <StaggerItem
                key={item.step}
                as="li"
                y={28}
                className="relative flex flex-col gap-3 border-t-2 border-setu pt-5"
              >
                <span className="font-mono text-xs font-semibold text-setu">{item.step}</span>
                <h3 className="font-display text-xl font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-[0.93rem] leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Section>

      {/* What we do */}
      <Section surface="subtle">
        <div className="container-page">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-setu">
              Our services
            </span>
            <TextReveal
              as="h2"
              className="mt-4 font-display text-3xl font-semibold leading-tight text-foreground sm:text-[2.4rem]"
            >
              {"Comprehensive digital services"}
            </TextReveal>
            <FadeUp delay={0.2} y={20}>
              <p className="mt-4 text-[1.02rem] leading-relaxed text-muted-foreground">
                From a first company website to enterprise software, every
                service is delivered by the same team.
              </p>
            </FadeUp>
          </div>

          <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.05}>
            {services.map((service) => (
              <StaggerItem key={service.slug} y={24}>
                <Link
                  href={`/services/${service.slug}`}
                  className="group flex h-full items-start gap-4 rounded-card border border-border bg-surface p-5 transition-[border-color,transform] duration-300 hover:border-setu/50 motion-safe:hover:-translate-y-0.5"
                >
                  <ServiceIcon name={service.icon} accent={service.accent} size={20} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2 font-semibold text-foreground">
                      {service.name}
                      <ArrowUpRight
                        className="size-4 shrink-0 text-muted-foreground transition-[color,transform] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-setu"
                        aria-hidden
                      />
                    </span>
                    <span className="mt-1 block text-[0.88rem] leading-relaxed text-muted-foreground">
                      {service.summary}
                    </span>
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Section>

      {/* Industries */}
      <Section>
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:items-center lg:gap-16">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-setu">
              Industries
            </span>
            <TextReveal
              as="h2"
              className="mt-4 font-display text-3xl font-semibold leading-tight text-foreground sm:text-[2.4rem]"
            >
              {"Experience across\nkey sectors"}
            </TextReveal>
            <FadeUp delay={0.2} y={20}>
              <p className="mt-4 text-[1.02rem] leading-relaxed text-muted-foreground">
                We work with growing businesses and startups across India,
                bringing an understanding of each sector to every engagement.
              </p>
              <ButtonLink href="/industries" variant="secondary" className="mt-6">
                Industries we serve
                <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
            </FadeUp>
          </div>

          <Stagger as="ul" className="flex flex-wrap gap-2.5" stagger={0.04}>
            {INDUSTRIES.map((industry) => (
              <StaggerItem
                key={industry}
                as="li"
                y={16}
                className="rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground"
              >
                {industry}
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Section>
    </>
  );
}
