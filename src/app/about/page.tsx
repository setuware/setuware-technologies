import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeIndianRupee,
  CalendarCheck,
  KeyRound,
  LifeBuoy,
  MessageSquareText,
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
  description: `${site.name} is a ${site.address.city} team that designs, builds and runs websites, apps and custom software for businesses. Fixed prices, weekly demos, and you own everything we build.`,
  path: "/about",
});

/** Plain facts, all drawn from site data, shown under the hero. */
const FACTS = [
  { label: "Based in", value: `${site.address.city}, ${site.address.region}` },
  { label: "Building since", value: site.founded },
  { label: "Quotes", value: "Fixed price, in writing" },
  { label: "Support", value: `${site.sla.support} on care plans` },
] as const;

const BELIEFS = [
  {
    Icon: BadgeIndianRupee,
    title: "Fixed scope, fixed price",
    body: "You get a written scope and one price before we start. If you ask for something new mid-project, we quote it first. The number never moves without your sign-off.",
  },
  {
    Icon: KeyRound,
    title: "You own everything",
    body: "The domain, the code, the hosting account and the designs are in your name from day one. Our handover notes are written for a developer who has never met us.",
  },
  {
    Icon: CalendarCheck,
    title: "A demo every week",
    body: "You see your website or app on a live link from the first week of the build. Each week we show what changed and what comes next.",
  },
  {
    Icon: MessageSquareText,
    title: "Updates in plain language",
    body: "No jargon and no status reports that need a translator. You hear what is done, what is blocked and what we need from you.",
  },
  {
    Icon: LifeBuoy,
    title: "We stay after launch",
    body: "Every build comes with a support window. After that, monthly care plans cover hosting, updates, backups and fixes, with published response times.",
  },
] as const;

const HOW_WE_WORK = [
  {
    step: "01",
    title: "Talk",
    body: "A free 30-minute call about your business, your customers and your deadline.",
  },
  {
    step: "02",
    title: "Quote",
    body: "A written scope, a timeline and a fixed price. You decide with the full picture.",
  },
  {
    step: "03",
    title: "Design and build",
    body: "Designs you can click through, then weekly demos on a live staging link.",
  },
  {
    step: "04",
    title: "Launch and run",
    body: "Testing, go-live and handover, then hosting, fixes and improvements for as long as you need.",
  },
] as const;

const INDUSTRIES = [
  "Retail and D2C brands",
  "Clinics and healthcare",
  "Schools and coaching institutes",
  "Logistics and field services",
  "Finance and SaaS",
  "Real estate",
  "Manufacturing and distribution",
  "Professional services",
] as const;

export default function AboutPage() {
  return (
    <>
      <PageHero
        align="left"
        eyebrow={`About ${site.name}`}
        title="We design, build and run websites and software for businesses"
        description={`${site.name} is a team in ${site.address.city}. Most clients come to us for a website. Many stay for what comes next: an online store, an app, marketing, custom software, and someone to keep it all running.`}
      >
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink
            href="/contact"
            size="lg"
            className="rounded-full bg-setu text-white shadow-none hover:bg-setu-dark"
          >
            Start a project
            <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
          <ButtonLink href="/work" size="lg" variant="secondary" className="rounded-full">
            See our work
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
              {"One team for your website\nand everything after it"}
            </TextReveal>
          </div>

          <Stagger className="flex flex-col gap-5 text-[1.02rem] leading-relaxed text-muted-foreground" delay={0.1}>
            <StaggerItem y={24}>
              <p>
                We are designers and engineers who build for businesses. Shops,
                clinics, schools, manufacturers, service firms and startups. Most
                of them need a website that brings in enquiries. Some need an
                online store, a customer app or software that replaces their
                spreadsheets.
              </p>
            </StaggerItem>
            <StaggerItem y={24}>
              <p>
                We started {site.name} because launch day is where most agencies
                stop. The site goes live, the invoice goes out, and six months
                later nobody can update the homepage or explain why the
                certificate expired.
              </p>
            </StaggerItem>
            <StaggerItem y={24}>
              <p>
                So we built the company around the part that usually gets
                dropped. We quote hosting and support alongside the build. We
                write the documentation before handover. And we stay on call for
                the websites and systems we run.
              </p>
            </StaggerItem>
            <StaggerItem y={24}>
              <p className="font-medium text-foreground">
                One team, one point of contact, and nothing to re-explain to a
                new agency when your business grows.
              </p>
            </StaggerItem>
          </Stagger>
        </div>
      </Section>

      {/* What we believe */}
      <Section surface="subtle">
        <div className="container-page">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-setu">
              What we believe
            </span>
            <TextReveal
              as="h2"
              className="mt-4 font-display text-3xl font-semibold leading-tight text-foreground sm:text-[2.4rem]"
            >
              Five promises we put in writing
            </TextReveal>
            <FadeUp delay={0.2} y={20}>
              <p className="mt-4 text-[1.02rem] leading-relaxed text-muted-foreground">
                These are in every proposal we send. Hold us to them.
              </p>
            </FadeUp>
          </div>

          <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
            {BELIEFS.map(({ Icon, title, body }) => (
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
            <StaggerItem y={28}>
              <div className="flex h-full flex-col justify-between gap-6 rounded-card bg-setu p-6 text-white md:p-7">
                <p className="font-display text-lg font-semibold leading-snug">
                  Want to see these in a real proposal?
                </p>
                <ButtonLink
                  href="/contact"
                  className="w-fit bg-white text-foreground shadow-none hover:bg-white/90"
                >
                  Ask for a quote
                  <ArrowRight className="size-4" aria-hidden />
                </ButtonLink>
              </div>
            </StaggerItem>
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
                Four steps from first call to launch
              </TextReveal>
            </div>
            <FadeUp delay={0.2} y={16}>
              <ButtonLink href="/process" variant="secondary">
                See the full process
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
              What we do
            </span>
            <TextReveal
              as="h2"
              className="mt-4 font-display text-3xl font-semibold leading-tight text-foreground sm:text-[2.4rem]"
            >
              {`${services.length} services, one team`}
            </TextReveal>
            <FadeUp delay={0.2} y={20}>
              <p className="mt-4 text-[1.02rem] leading-relaxed text-muted-foreground">
                Start with one. Add the next when you need it. Everything is
                built to work together.
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
              Who we build for
            </span>
            <TextReveal
              as="h2"
              className="mt-4 font-display text-3xl font-semibold leading-tight text-foreground sm:text-[2.4rem]"
            >
              {"Businesses that need\nthe work to pay off"}
            </TextReveal>
            <FadeUp delay={0.2} y={20}>
              <p className="mt-4 text-[1.02rem] leading-relaxed text-muted-foreground">
                Small and growing businesses across India, and startups shipping
                their first product. We learn how your industry sells before we
                design a single page.
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
