import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  FileCheck2,
  Handshake,
  KeyRound,
  LifeBuoy,
  MapPin,
  MessageSquareText,
  Phone,
  Quote,
  ShieldCheck,
} from "lucide-react";

import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { services } from "@/lib/content";
import { images, type ImageSlot } from "@/lib/images";
import { industries } from "@/lib/industries";
import { servicePhotos } from "@/lib/service-photos";
import { founder } from "@/lib/team";
import { cn } from "@/lib/utils";
import { PageHero } from "@/components/layout/page-hero";
import { FounderCard } from "@/components/sections/founder-card";
import { LIGHT_CARD_SHADOW, LightSectionBackdrop } from "@/components/sections/services-dark";
import { ButtonLink } from "@/components/ui/button";
import { IndustryIcon } from "@/components/ui/industry-icon";
import { Section } from "@/components/ui/section";
import { TextReveal } from "@/components/motion/text-reveal";
import {
  FadeUp,
  ImageReveal,
  Parallax,
  SpotlightCard,
  Stagger,
  StaggerItem,
} from "@/components/motion/primitives";

export const metadata = pageMetadata({
  title: "About Our Gurugram Web Development Studio",
  description: `${site.name} is a ${site.address.city} web development studio building websites, e-commerce stores, mobile apps and custom software for Indian businesses.`,
  path: "/about",
});

/** Plain facts, all drawn from site data, shown under the header. */
const FACTS = [
  { Icon: MapPin, text: `Based in ${site.address.street}, ${site.address.city}` },
  { Icon: CalendarCheck, text: "Free 30-minute consultation" },
  { Icon: FileCheck2, text: "Fixed-price proposals" },
  { Icon: LifeBuoy, text: "Three months of post-launch support" },
] as const;

const VALUES = [
  {
    Icon: MessageSquareText,
    title: "Transparency",
    body: "You get the scope, the price and the dates in writing before we start. If the scope changes, the price changes in writing first — never as a surprise invoice.",
  },
  {
    Icon: ShieldCheck,
    title: "Quality",
    body: "Every site launches with a Lighthouse score of 90+ on mobile, SSL on, and analytics tracking enquiries from day one.",
  },
  {
    Icon: KeyRound,
    title: "Ownership",
    body: "Your domain, hosting account and source code are registered to your business, not to us. If you leave, everything goes with you.",
  },
  {
    Icon: Handshake,
    title: "Partnership",
    body: "Three months of support comes with every project. After that, a maintenance plan covers hosting, updates and fixes — and you can reach us on the phone.",
  },
] as const;

const HOW_WE_WORK = [
  {
    step: "01",
    title: "Discovery",
    body: "A free 30-minute call. We ask what the site has to do — enquiries, orders, bookings — and tell you honestly if we cannot do it.",
  },
  {
    step: "02",
    title: "Proposal",
    body: "Scope, dates and a fixed price, in writing. The price only moves if you change the scope.",
  },
  {
    step: "03",
    title: "Design and development",
    body: "Designs to approve first, then the build — which you watch on a staging link, not in a status meeting.",
  },
  {
    step: "04",
    title: "Launch and support",
    body: "We test, go live, hand over the logins, and support you for three months. After that, a maintenance plan if you want one.",
  },
] as const;

const EYEBROW = "text-xs font-semibold uppercase tracking-[0.18em] text-setu";
const H2 =
  "mt-4 font-display text-3xl font-semibold leading-tight text-foreground sm:text-[2.4rem]";

/** One framed photo in the "Who we are" composition. */
function TeamPhoto({
  image,
  sizes,
  className,
  speed,
  delay,
  direction,
}: {
  image: ImageSlot;
  sizes: string;
  className: string;
  speed: number;
  delay: number;
  direction: "up" | "left" | "right";
}) {
  return (
    <Parallax speed={speed} className={className}>
      {/* The shadow sits outside the reveal, whose clip-path would cut it off. */}
      <div className={cn("h-full w-full rounded-[1.25rem]", LIGHT_CARD_SHADOW)}>
        <ImageReveal
          delay={delay}
          direction={direction}
          className="relative h-full w-full rounded-[1.25rem] border-[5px] border-surface bg-surface-2"
        >
          <div className="relative h-full w-full">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes={sizes}
              className="object-cover"
            />
          </div>
        </ImageReveal>
      </div>
    </Parallax>
  );
}

export default function AboutPage() {
  return (
    <>
      <PageHero
        video="about"
        align="left"
        eyebrow={`About ${site.name}`}
        title="A software development company built around your business"
        description={`${site.name} designs, builds and supports websites, online stores, mobile apps and business software from ${site.address.street}, ${site.address.city}. Every engagement starts with a free consultation and a fixed-price proposal.`}
        className="pb-28 md:pb-32"
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
      </PageHero>

      {/* Fact strip, lifted over the bottom edge of the header. */}
      <div className="relative z-10 -mt-14 md:-mt-16">
        <Stagger as="ul" className="container-page grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" stagger={0.06}>
          {FACTS.map(({ Icon, text }) => (
            <StaggerItem
              key={text}
              as="li"
              y={20}
              className={cn(
                "flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5",
                LIGHT_CARD_SHADOW,
              )}
            >
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-setu/10 text-setu ring-1 ring-inset ring-setu/15">
                <Icon className="size-[18px]" aria-hidden />
              </span>
              <span className="text-[0.9rem] font-semibold leading-snug text-foreground sm:text-[0.95rem]">
                {text}
              </span>
            </StaggerItem>
          ))}
        </Stagger>
      </div>

      {/* Who we are */}
      <Section className="overflow-hidden">
        <div className="container-page grid items-center gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
          <div>
            <span className={EYEBROW}>Who we are</span>
            <TextReveal as="h2" className={H2}>
              {"A digital studio for\ngrowing businesses"}
            </TextReveal>
            <Stagger
              className="mt-6 flex flex-col gap-4 text-[1.02rem] leading-relaxed text-muted-foreground"
              delay={0.1}
            >
              <StaggerItem y={20}>
                <p>
                  Our clients are shop owners, clinics, manufacturers, schools and
                  startups across India. The work is the same in every case: a
                  website or app that brings in enquiries, bookings or orders —
                  not just something that looks finished.
                </p>
              </StaggerItem>
              <StaggerItem y={20}>
                <p>
                  One project manager runs your job from the first call to launch.
                  Designers and developers sit in the same team, so nothing gets
                  lost between the proposal and the build.
                </p>
              </StaggerItem>
              <StaggerItem y={20}>
                <p>
                  After launch you get three months of support included, then a
                  maintenance plan if you want it — hosting, updates, backups
                  and fixes, with published response times.
                </p>
              </StaggerItem>
            </Stagger>
          </div>

          {/* Team photos: percentages keep the overlap identical at every width. */}
          <div className="relative mx-auto w-full max-w-xl pb-[18%] pr-[10%] lg:max-w-none">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-6 -top-6 h-1/2 w-1/2 rounded-[1.5rem] bg-[radial-gradient(currentColor_1px,transparent_1.2px)] bg-[size:16px_16px] text-setu/30"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-10 left-1/4 size-64 rounded-full bg-setu/15 blur-3xl"
            />
            <TeamPhoto
              image={images.teamGroup}
              sizes="(min-width: 1024px) 34rem, 88vw"
              className="relative aspect-[4/3] w-full"
              speed={14}
              delay={0}
              direction="up"
            />
            <TeamPhoto
              image={images.teamWorkshop}
              sizes="(min-width: 1024px) 18rem, 46vw"
              className="absolute bottom-0 right-0 aspect-[4/3] w-[46%]"
              speed={-30}
              delay={0.2}
              direction="right"
            />
          </div>
        </div>
      </Section>

      {/* Mission */}
      <section className="relative overflow-hidden border-y border-setu/15 bg-[linear-gradient(120deg,#effafd,#f6fbfe_55%,#eef6fc)] py-16 md:py-24 dark:bg-[linear-gradient(120deg,#08202a,var(--background-subtle))]">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-1/2 size-[26rem] -translate-y-1/2 rounded-full bg-setu/15 blur-[100px]"
        />
        <div className="container-page relative">
          <FadeUp y={24} className="mx-auto max-w-4xl text-center">
            <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-setu text-white shadow-[0_10px_24px_-10px_rgba(0,161,198,0.8)]">
              <Quote className="size-5 fill-current" aria-hidden />
            </span>
            <p className={cn(EYEBROW, "mt-6")}>Our mission</p>
            <blockquote className="mt-4">
              <p className="font-display text-[1.7rem] font-semibold leading-[1.25] tracking-[-0.02em] text-foreground sm:text-[2.2rem] lg:text-[2.6rem]">
                To build software small businesses can rely on — and to say plainly
                what it will cost{" "}
                <span className="text-setu">before we start</span>.
              </p>
            </blockquote>
            <div aria-hidden className="mx-auto mt-8 h-px w-16 bg-setu/60" />
          </FadeUp>
        </div>
      </section>

      {/* Values */}
      <Section>
        <div className="container-page">
          <div className="max-w-2xl">
            <span className={EYEBROW}>Our values</span>
            <TextReveal as="h2" className={H2}>
              Four rules we do not break
            </TextReveal>
            <FadeUp delay={0.2} y={20}>
              <p className="mt-4 text-[1.02rem] leading-relaxed text-muted-foreground">
                Four things we hold to on every project, whatever its size.
              </p>
            </FadeUp>
          </div>

          <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
            {VALUES.map(({ Icon, title, body }) => (
              <StaggerItem key={title} y={28} className="h-full">
                <div className="h-full" data-cursor="hover">
                  <SpotlightCard
                    tilt={3}
                    glow="rgba(0,161,198,0.12)"
                    className={cn(
                      "h-full rounded-[1.25rem] border border-border bg-surface p-6 md:p-7",
                      LIGHT_CARD_SHADOW,
                    )}
                  >
                    <div className="relative">
                      <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(0,161,198,0.16),rgba(0,97,168,0.08))] text-setu ring-1 ring-inset ring-setu/20">
                        <Icon className="size-[22px]" strokeWidth={1.8} aria-hidden />
                      </span>
                      <h3 className="mt-6 font-display text-lg font-semibold text-foreground">
                        {title}
                      </h3>
                      <p className="mt-2 text-[0.93rem] leading-relaxed text-muted-foreground">
                        {body}
                      </p>
                    </div>
                  </SpotlightCard>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Section>

      {/* How we work */}
      <section className="relative isolate overflow-hidden border-t border-border bg-[linear-gradient(180deg,#f6f9fc,var(--background))] py-20 md:py-28 dark:bg-[linear-gradient(180deg,var(--background-subtle),var(--background))]">
        <LightSectionBackdrop variant="process" />
        <div className="container-page relative">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <span className={EYEBROW}>How we work</span>
              <TextReveal as="h2" className={H2}>
                Four steps, then launch
              </TextReveal>
            </div>
            <FadeUp delay={0.2} y={16}>
              <ButtonLink href="/process" variant="secondary" className="rounded-full">
                View our process
                <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
            </FadeUp>
          </div>

          <div className="relative mt-14">
            {/* The rail: vertical beside the steps on mobile, horizontal through the markers on desktop. */}
            <div
              aria-hidden
              className="absolute bottom-6 left-[19px] top-6 w-px bg-[linear-gradient(to_bottom,var(--color-setu),rgba(0,97,168,0.25))] lg:inset-x-[12.5%] lg:bottom-auto lg:left-[12.5%] lg:top-5 lg:h-px lg:w-auto lg:bg-[linear-gradient(90deg,var(--color-setu),rgba(0,97,168,0.25))]"
            />
            <Stagger as="ol" className="relative grid gap-6 lg:grid-cols-4 lg:gap-6" stagger={0.1}>
              {HOW_WE_WORK.map((item) => (
                <StaggerItem
                  key={item.step}
                  as="li"
                  y={24}
                  className="relative grid grid-cols-[40px_1fr] gap-5 lg:flex lg:flex-col lg:items-center lg:gap-6 lg:text-center"
                >
                  <span className="relative z-10 inline-flex size-10 items-center justify-center rounded-full border border-setu/40 bg-[#e8f7fb] font-mono text-xs font-semibold text-[#007a96] shadow-[0_0_0_6px_var(--background)] dark:bg-[#0b2a33] dark:text-setu">
                    {item.step}
                  </span>
                  <div
                    className={cn(
                      "h-full rounded-[1.25rem] border border-border bg-surface p-5 md:p-6 lg:w-full",
                      LIGHT_CARD_SHADOW,
                    )}
                  >
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[0.93rem] leading-relaxed text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      {/* Services */}
      <Section>
        <div className="container-page">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <span className={EYEBROW}>Our services</span>
              <TextReveal as="h2" className={H2}>
                What we build
              </TextReveal>
              <FadeUp delay={0.2} y={20}>
                <p className="mt-4 text-[1.02rem] leading-relaxed text-muted-foreground">
                  Landing pages, stores, apps, branding, SEO, ERP and hosting — from
                  ₹4,999, all from the same team.
                </p>
              </FadeUp>
            </div>
            <FadeUp delay={0.2} y={16}>
              <ButtonLink href="/services" variant="secondary" className="rounded-full">
                View all services
                <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
            </FadeUp>
          </div>

          <Stagger className="mt-12 grid gap-4 md:grid-cols-2 lg:gap-5" stagger={0.05}>
            {services.map((service) => (
              <StaggerItem key={service.slug} y={24} className="h-full">
                <Link
                  href={`/services/${service.slug}`}
                  className={cn(
                    "group flex h-full items-start gap-4 rounded-[1.1rem] border border-border bg-surface p-3.5 pr-5 transition-[border-color,transform,box-shadow] duration-300 hover:border-setu/45 motion-safe:hover:-translate-y-0.5",
                    LIGHT_CARD_SHADOW,
                  )}
                >
                  <span className="relative size-[4.5rem] shrink-0 overflow-hidden rounded-xl bg-surface-2">
                    <Image
                      src={servicePhotos[service.slug].src}
                      alt=""
                      fill
                      sizes="72px"
                      className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 motion-reduce:transition-none"
                    />
                    <span aria-hidden className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-black/5" />
                  </span>
                  <span className="min-w-0 flex-1 pt-1">
                    <span className="flex items-center justify-between gap-2 font-semibold text-foreground">
                      {service.name}
                      <ArrowUpRight
                        className="size-4 shrink-0 text-muted-foreground transition-[color,transform] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-setu"
                        aria-hidden
                      />
                    </span>
                    <span className="mt-1 block text-[0.86rem] leading-relaxed text-muted-foreground">
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
      <Section surface="subtle" className="border-t border-border">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-center lg:gap-16">
          <div>
            <span className={EYEBROW}>Industries</span>
            <TextReveal as="h2" className={H2}>
              {"Who we build for"}
            </TextReveal>
            <FadeUp delay={0.2} y={20}>
              <p className="mt-4 text-[1.02rem] leading-relaxed text-muted-foreground">
                Retail, healthcare, education, real estate, manufacturing, logistics,
                hospitality and professional services — each sector page spells
                out what we actually build for it.
              </p>
              <ButtonLink href="/industries" variant="secondary" className="mt-6 rounded-full">
                Industries we serve
                <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
            </FadeUp>
          </div>

          <Stagger as="ul" className="flex flex-wrap gap-2.5 sm:gap-3" stagger={0.04}>
            {industries.map((industry) => (
              <StaggerItem key={industry.slug} as="li" y={16}>
                <Link
                  href={`/industries/${industry.slug}`}
                  className="group inline-flex items-center gap-2.5 rounded-full border border-border bg-surface py-1.5 pl-1.5 pr-4 text-sm font-medium text-foreground shadow-[0_1px_2px_rgb(var(--shadow-color)/0.06)] transition-[border-color,box-shadow,color] duration-300 hover:border-setu/50 hover:text-setu hover:shadow-[0_8px_20px_-10px_rgba(0,161,198,0.5)]"
                >
                  <IndustryIcon
                    name={industry.icon}
                    size={15}
                    className="size-8 rounded-full ring-0"
                  />
                  {industry.name}
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Section>

      {/* Founder */}
      <Section className="border-t border-border pb-0 md:pb-0">
        <div className="container-page">
          <div className="max-w-2xl">
            <span className={EYEBROW}>Leadership</span>
            <TextReveal as="h2" className={H2}>
              Meet our founder
            </TextReveal>
          </div>
          <FadeUp y={28} className="mt-10">
            <FounderCard person={founder} />
          </FadeUp>
        </div>
      </Section>

      {/* Closing call to action */}
      <Section className="py-16 md:py-24">
        <div className="container-page">
          <FadeUp
            y={24}
            className={cn(
              "relative overflow-hidden rounded-[1.75rem] border border-setu/20 bg-[linear-gradient(120deg,#effafd,#ffffff_55%,#eef6fc)] px-6 py-12 text-center sm:px-12 md:py-16 dark:bg-[linear-gradient(120deg,#08202a,var(--surface))]",
              LIGHT_CARD_SHADOW,
            )}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-24 size-80 rounded-full bg-setu/20 blur-[90px]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(currentColor_1px,transparent_1.2px)] bg-[size:20px_20px] text-setu/15 [mask-image:radial-gradient(60%_80%_at_50%_0%,black,transparent)]"
            />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="font-display text-3xl font-semibold leading-tight text-foreground sm:text-[2.4rem]">
                Tell us what you need built
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[1.02rem] leading-relaxed text-muted-foreground">
                Book a free 30-minute call. We will tell you what we would build, what
                it costs, and how long it takes — and if we are not the right
                team, we will say so.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <ButtonLink
                  href="/contact"
                  size="lg"
                  className="w-full rounded-full bg-setu text-white shadow-[0_10px_24px_-10px_rgba(0,161,198,0.8)] hover:bg-setu-dark sm:w-auto"
                >
                  Book a consultation
                  <ArrowRight className="size-4" aria-hidden />
                </ButtonLink>
                <ButtonLink
                  href={site.phoneHref}
                  size="lg"
                  variant="secondary"
                  className="w-full rounded-full sm:w-auto"
                >
                  <Phone className="size-4" aria-hidden />
                  {site.phone}
                </ButtonLink>
              </div>
            </div>
          </FadeUp>
        </div>
      </Section>
    </>
  );
}
