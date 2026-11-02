import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  FileText,
  Globe,
  LifeBuoy,
  PenLine,
  ReceiptIndianRupee,
  Search,
  Server,
  Wrench,
  LayoutTemplate,
} from "lucide-react";

import { pageMetadata } from "@/lib/seo";
import { getService, services } from "@/lib/content";
import { carePlans } from "@/lib/plans";
import { SERVICE_RATES } from "@/lib/pricing";
import { formatINR, formatINRCompact } from "@/lib/utils";
import { PricingPlans } from "@/components/sections/pricing-plans";
import { Faq } from "@/components/sections/faq";
import { DeferredSection } from "@/components/ui/deferred-section";
import { PageHero } from "@/components/layout/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { ServiceIcon } from "@/components/ui/service-icon";
import { TextReveal } from "@/components/motion/text-reveal";
import { FadeUp, SpotlightCard, Stagger, StaggerItem } from "@/components/motion/primitives";

const carePlanFrom = Math.min(
  ...carePlans.map((plan) => plan.monthly ?? Number.POSITIVE_INFINITY),
);

export const metadata = pageMetadata({
  title: "Website, App & Software Pricing",
  description: `Starting prices for websites, online stores, apps and custom software, plus care plans from ${formatINR(carePlanFrom)} a month. Fixed quotes in writing, no markups.`,
  path: "/pricing",
});

/** Services sold as a one-off build; monthly services are covered under add-ons. */
const BUILD_SERVICES = [
  "business-websites",
  "ecommerce-stores",
  "web-development",
  "app-development",
  "product-design",
  "custom-software",
  "ai-integration",
] as const;

const INCLUDED = [
  "A free discovery call and a written scope",
  "One fixed price, agreed before work starts",
  "Design you approve before we build",
  "Mobile-friendly on every screen size",
  "Basic on-page SEO, sitemap and analytics setup",
  "SSL certificate and launch on your domain",
  "Weekly progress on a live preview link",
  "Testing on real phones and browsers",
  "Handover notes and a training session",
  "Support after launch, 3 months on websites",
  "Code, designs and accounts in your name",
  "GST invoice for every payment",
] as const;

const PAYMENT_TERMS = [
  {
    title: "Milestones, not a lump sum",
    body: "Project fees are split into milestones that follow the stages: discovery, design, build, and launch with handover. Your proposal lists each amount and date.",
  },
  {
    title: "Pay as each stage is delivered",
    body: "The first milestone books the team. Each one after that is invoiced when the stage before it is delivered and signed off.",
  },
  {
    title: "Monthly plans, billed monthly",
    body: "Hosting, care and marketing plans are billed each month. Change your plan as your needs change.",
  },
  {
    title: "Clear on tax and third parties",
    body: "Prices exclude GST, which is added at the current rate. Domains, cloud, gateways and licences are billed to your accounts at cost.",
  },
] as const;

const PRICING_FAQS = [
  {
    group: "Before you start" as const,
    question: "Why does a website start at one price and an app at another?",
    answer:
      "The starting price reflects the smallest useful version of each. A business website is mostly pages and content. An app adds accounts, data, an admin panel and more testing. Your proposal prices your actual scope, page by page or feature by feature.",
  },
  {
    group: "Before you start" as const,
    question: "Will the price change during the project?",
    answer:
      "No. The quote is fixed for the written scope. If you ask for something new, we quote it as a separate item and only start once you approve it.",
  },
  {
    group: "Before you start" as const,
    question: "Is GST included in these prices?",
    answer:
      "No. All prices exclude GST, which is added at the current rate on every invoice.",
  },
  {
    group: "Before you start" as const,
    question: "Do you mark up hosting, domains or other third-party costs?",
    answer:
      "No. Domains, cloud hosting, payment gateway fees and licences are billed to your own accounts at cost. You see exactly what the infrastructure costs.",
  },
  {
    group: "Before you start" as const,
    question: "Can I get a rough number before a call?",
    answer:
      "Yes. The instant estimator gives you a price range, a timeline and a payment schedule in about a minute, with no call and no email required.",
  },
  {
    group: "Help & support" as const,
    question: "What happens when the included support ends?",
    answer:
      "You can move to a monthly care plan for hosting, updates, backups and fixes, or take everything in-house. The code, accounts and documentation are already yours, so there is nothing to transfer.",
  },
  {
    group: "Help & support" as const,
    question: "Can you take over hosting for a site someone else built?",
    answer:
      "Usually, yes. We review the site or app first, plan a move with no downtime and migrate it. Most moves take three to seven days from start to finish.",
  },
] as const;

export default function PricingPage() {
  const extraPageRate = SERVICE_RATES["business-websites"].perScope;
  const seo = getService("seo-marketing");
  const buildServices = BUILD_SERVICES.map((slug) =>
    services.find((service) => service.slug === slug),
  ).filter((service) => service !== undefined);

  const addOns = [
    {
      Icon: Globe,
      title: "Domain name",
      price: "At cost",
      body: "Registered or transferred in your name. We set up DNS and renewals.",
      href: "/services/managed-hosting",
    },
    {
      Icon: Server,
      title: "Hosting and care plans",
      price: `From ${formatINR(carePlanFrom)} / month`,
      body: "Managed hosting, SSL, backups and uptime checks. See the plans above.",
      href: "#care",
    },
    {
      Icon: Wrench,
      title: "Maintenance and support",
      price: "Included in care plans",
      body: "Updates, security patches, bug fixes and small content changes.",
      href: "/services/support-maintenance",
    },
    {
      Icon: Search,
      title: "SEO and marketing retainer",
      price: seo ? `From ${formatINR(seo.priceFrom)} / month` : "Monthly retainer",
      body: "On-page and local SEO, Google Ads and a monthly report on leads.",
      href: "/services/seo-marketing",
    },
    {
      Icon: LayoutTemplate,
      title: "Extra website pages",
      price: `${formatINR(extraPageRate)} / page`,
      body: "Add service, location or product pages beyond your agreed scope.",
      href: "/estimate",
    },
    {
      Icon: PenLine,
      title: "Content writing",
      price: "Quoted per page",
      body: "Clear website copy written from a short call with you. Priced in your proposal.",
      href: "/contact",
    },
  ] as const;

  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="Clear prices before you pick up the phone"
        description="Starting prices for every service, what each project includes, and the monthly plans that keep it running. The estimator prices your exact scope in about a minute."
      >
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ButtonLink
            href="/estimate"
            size="lg"
            className="rounded-full bg-setu text-white shadow-none hover:bg-setu-dark"
          >
            Price my exact project
            <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
          <ButtonLink href="/contact" size="lg" variant="secondary" className="rounded-full">
            Book a free call first
          </ButtonLink>
        </div>
      </PageHero>

      {/* Starting prices by service */}
      <Section>
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-setu">
              Starting prices
            </span>
            <TextReveal
              as="h2"
              className="mt-4 font-display text-3xl font-semibold leading-tight text-foreground sm:text-[2.4rem]"
            >
              What each service starts at
            </TextReveal>
            <FadeUp delay={0.2} y={20}>
              <p className="mt-4 text-[1.02rem] leading-relaxed text-muted-foreground">
                The smallest useful version of each, with a typical timeline. Your
                quote depends on pages, features and integrations.
              </p>
            </FadeUp>
          </div>

          <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.05}>
            {buildServices.map((service) => (
              <StaggerItem key={service.slug} y={24}>
                <Link
                  href={`/services/${service.slug}`}
                  className="group flex h-full flex-col gap-4 rounded-card border border-border bg-surface p-5 transition-[border-color,transform] duration-300 hover:border-setu/50 motion-safe:hover:-translate-y-0.5"
                >
                  <span className="flex items-start justify-between gap-3">
                    <ServiceIcon name={service.icon} accent={service.accent} size={20} />
                    <ArrowUpRight
                      className="size-4 text-muted-foreground transition-[color,transform] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-setu"
                      aria-hidden
                    />
                  </span>
                  <span className="font-semibold text-foreground">{service.name}</span>
                  <span className="mt-auto flex flex-col gap-0.5">
                    <span className="flex items-baseline gap-1.5">
                      <span className="text-xs text-muted-foreground">from</span>
                      <span className="font-display text-2xl font-semibold text-foreground">
                        {formatINRCompact(service.priceFrom)}
                      </span>
                    </span>
                    <span className="text-xs text-muted-foreground">{service.typicalTimeline}</span>
                  </span>
                </Link>
              </StaggerItem>
            ))}
            <StaggerItem y={24}>
              <div className="flex h-full flex-col justify-between gap-5 rounded-card bg-setu p-5 text-white">
                <span className="font-display text-lg font-semibold leading-snug">
                  Need more than one service? We quote them together.
                </span>
                <ButtonLink
                  href="/estimate"
                  size="sm"
                  className="w-fit rounded-full bg-white text-foreground shadow-none hover:bg-white/90"
                >
                  Open the estimator
                </ButtonLink>
              </div>
            </StaggerItem>
          </Stagger>
        </div>
      </Section>

      <PricingPlans />

      {/* What's included */}
      <Section>
        <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1.4fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-setu">
              Included in every project
            </span>
            <TextReveal
              as="h2"
              className="mt-4 font-display text-3xl font-semibold leading-tight text-foreground sm:text-[2.4rem]"
            >
              No extras for the basics
            </TextReveal>
            <FadeUp delay={0.2} y={20}>
              <p className="mt-4 text-[1.02rem] leading-relaxed text-muted-foreground">
                Every website, store or app we build comes with these. They are
                part of the price, not line items added later.
              </p>
            </FadeUp>
          </div>

          <Stagger as="ul" className="grid gap-x-8 gap-y-3.5 sm:grid-cols-2" stagger={0.03}>
            {INCLUDED.map((item) => (
              <StaggerItem
                key={item}
                as="li"
                y={14}
                className="flex items-start gap-3 border-b border-border pb-3.5 text-[0.95rem] text-foreground/90"
              >
                <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-setu/12 text-setu">
                  <Check className="size-3" aria-hidden />
                </span>
                {item}
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Section>

      {/* Add-ons */}
      <Section surface="subtle" id="add-ons">
        <div className="container-page">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-setu">
              Add-ons
            </span>
            <TextReveal
              as="h2"
              className="mt-4 font-display text-3xl font-semibold leading-tight text-foreground sm:text-[2.4rem]"
            >
              Add what you need, when you need it
            </TextReveal>
          </div>

          <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
            {addOns.map(({ Icon, title, price, body, href }) => (
              <StaggerItem key={title} y={24}>
                <SpotlightCard
                  tilt={0}
                  className="h-full rounded-card border border-border bg-surface shadow-ambient"
                >
                  <Link href={href} className="relative flex h-full flex-col gap-3 p-6">
                    <span className="flex items-center justify-between gap-3">
                      <span className="inline-flex size-10 items-center justify-center rounded-xl bg-setu/10 text-setu">
                        <Icon className="size-[18px]" aria-hidden />
                      </span>
                      <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-foreground">
                        {price}
                      </span>
                    </span>
                    <span className="mt-1 font-semibold text-foreground">{title}</span>
                    <span className="text-[0.9rem] leading-relaxed text-muted-foreground">
                      {body}
                    </span>
                  </Link>
                </SpotlightCard>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Section>

      {/* Payment terms */}
      <Section>
        <div className="container-page">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.4fr] lg:gap-16">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-setu">
                Payment terms
              </span>
              <TextReveal
                as="h2"
                className="mt-4 font-display text-3xl font-semibold leading-tight text-foreground sm:text-[2.4rem]"
              >
                You pay as the work is delivered
              </TextReveal>
              <FadeUp delay={0.2} y={20}>
                <p className="mt-4 text-[1.02rem] leading-relaxed text-muted-foreground">
                  The estimator shows the milestone split for your scope before
                  you talk to us.
                </p>
                <div className="mt-6 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5">
                    <ReceiptIndianRupee className="size-3.5 text-setu" aria-hidden />
                    GST invoices
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5">
                    <FileText className="size-3.5 text-setu" aria-hidden />
                    Written proposal
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5">
                    <LifeBuoy className="size-3.5 text-setu" aria-hidden />
                    Support included
                  </span>
                </div>
              </FadeUp>
            </div>

            <Stagger as="ol" className="grid gap-4 sm:grid-cols-2" stagger={0.07}>
              {PAYMENT_TERMS.map((term, index) => (
                <StaggerItem
                  key={term.title}
                  as="li"
                  y={22}
                  className="rounded-card border border-border bg-surface p-6"
                >
                  <span className="font-mono text-xs font-semibold text-setu">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-2 font-semibold text-foreground">{term.title}</h3>
                  <p className="mt-2 text-[0.9rem] leading-relaxed text-muted-foreground">
                    {term.body}
                  </p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </Section>

      <DeferredSection minHeight={720}>
        <Faq items={PRICING_FAQS} />
      </DeferredSection>
    </>
  );
}
