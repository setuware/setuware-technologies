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
import { site } from "@/lib/site";
import { getService, serviceStartingPrice, services } from "@/lib/content";
import { carePlans, LANDING_PAGE_FROM, WEBSITE_FROM } from "@/lib/plans";
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
  title: "Pricing",
  description: `Transparent, fixed-price packages: landing pages from ${formatINR(LANDING_PAGE_FROM)}, business websites from ${formatINR(WEBSITE_FROM)} and maintenance plans from ${formatINR(carePlanFrom)} a month.`,
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
  "Free consultation and written scope",
  "Fixed price agreed before work begins",
  "Design approval before development",
  "Responsive design for every screen size",
  "On-page SEO, sitemap and analytics set-up",
  "SSL certificate and launch on your domain",
  "Weekly progress reviews on a live preview",
  "Testing across devices and browsers",
  "Handover documentation and training",
  "Three months of post-launch support for websites",
  "Full ownership of code, designs and accounts",
  "GST invoice for every payment",
] as const;

const PAYMENT_TERMS = [
  {
    title: "Milestone-based billing",
    body: "Project fees are divided into milestones aligned with discovery, design, development and launch. Each amount and date is set out in your proposal.",
  },
  {
    title: "Payment on delivery",
    body: "The first milestone secures your project schedule. Each subsequent milestone is invoiced once the preceding stage is delivered and approved.",
  },
  {
    title: "Monthly plans",
    body: "Hosting, maintenance and marketing plans are billed monthly and can be adjusted as your requirements change.",
  },
  {
    title: "Taxes and third-party costs",
    body: "Prices exclude GST, which is added at the prevailing rate. Domains, cloud services, payment gateways and licences are billed to your accounts at cost.",
  },
] as const;

const PRICING_FAQS = [
  {
    group: "Before you start" as const,
    question: "Why do starting prices differ between services?",
    answer:
      "Each starting price reflects the minimum viable scope of that service. Landing pages start at ₹5,000 and complete business websites at ₹25,000, while applications involve user accounts, data, administration and more extensive testing.",
  },
  {
    group: "Before you start" as const,
    question: "Will the price change during the project?",
    answer:
      "No. The quote is fixed for the agreed scope, and any new requirements are quoted separately for your approval.",
  },
  {
    group: "Before you start" as const,
    question: "Is GST included in these prices?",
    answer:
      "No. All prices exclude GST, which is added at the prevailing rate on every invoice.",
  },
  {
    group: "Before you start" as const,
    question: "Do you mark up hosting, domains or other third-party costs?",
    answer:
      "No. Domains, cloud hosting, payment gateway fees and licences are billed to your own accounts at cost.",
  },
  {
    group: "Before you start" as const,
    question: "Can I get an estimate before a consultation?",
    answer:
      "Yes. The instant estimator provides an indicative price range, timeline and payment schedule without any sign-up.",
  },
  {
    group: "Help & support" as const,
    question: "What happens when the included support ends?",
    answer:
      "You can choose a monthly maintenance plan for hosting, updates, backups and fixes, or manage the platform in-house with our complete documentation.",
  },
  {
    group: "Help & support" as const,
    question: "Where do existing clients send support requests?",
    answer: `Existing clients can email ${site.supportEmail} for fixes, changes, hosting and maintenance plan queries. For urgent issues, please also call or WhatsApp ${site.phone}.`,
  },
  {
    group: "Help & support" as const,
    question: "Can you take over hosting for a site someone else built?",
    answer:
      "Yes. We review the site or application first, then plan and complete a migration without downtime, typically within three to seven days.",
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
      body: "Registration or transfer, with DNS configuration and renewal management.",
      href: "/services/managed-hosting",
    },
    {
      Icon: Server,
      title: "Hosting and maintenance plans",
      price: `From ${formatINR(carePlanFrom)} / month`,
      body: "Managed hosting, SSL, backups and uptime monitoring.",
      href: "#care",
    },
    {
      Icon: Wrench,
      title: "Maintenance and support",
      price: "Included in maintenance plans",
      body: "Updates, security patches, bug fixes and minor content changes.",
      href: "/services/support-maintenance",
    },
    {
      Icon: Search,
      title: "SEO and marketing retainer",
      price: seo ? `From ${formatINR(seo.priceFrom)} / month` : "Monthly retainer",
      body: "On-page and local SEO, Google Ads and monthly performance reporting.",
      href: "/services/seo-marketing",
    },
    {
      Icon: LayoutTemplate,
      title: "Extra website pages",
      price: `${formatINR(extraPageRate)} / page`,
      body: "Additional service, location or product pages beyond the agreed scope.",
      href: "/estimate",
    },
    {
      Icon: PenLine,
      title: "Content writing",
      price: "Quoted per page",
      body: "Professional website copy developed from a short briefing session.",
      href: "/contact",
    },
  ] as const;

  return (
    <>
      <PageHero
        eyebrow="Plans and packages"
        title="Pricing"
        description="Transparent, fixed-price packages for every stage of your business."
      >
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ButtonLink
            href="/estimate"
            size="lg"
            className="rounded-full bg-setu text-white shadow-none hover:bg-setu-dark"
          >
            Get an instant estimate
            <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
          <ButtonLink href="/contact" size="lg" variant="secondary" className="rounded-full">
            Book a consultation
          </ButtonLink>
        </div>
      </PageHero>

      {/* Starting prices by service */}
      <Section>
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-setu">
              By service
            </span>
            <TextReveal
              as="h2"
              className="mt-4 font-display text-3xl font-semibold leading-tight text-foreground sm:text-[2.4rem]"
            >
              Starting prices by service
            </TextReveal>
            <FadeUp delay={0.2} y={20}>
              <p className="mt-4 text-[1.02rem] leading-relaxed text-muted-foreground">
                Indicative starting prices and typical timelines. Your quote
                reflects the pages, features and integrations you require.
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
                        {formatINRCompact(serviceStartingPrice(service))}
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
                  Combined services are quoted together in a single proposal.
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
              Standard with every engagement
            </TextReveal>
            <FadeUp delay={0.2} y={20}>
              <p className="mt-4 text-[1.02rem] leading-relaxed text-muted-foreground">
                Every website, store and application includes the following as
                standard, at no additional cost.
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
              Optional services and add-ons
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
                Milestone-based payments
              </TextReveal>
              <FadeUp delay={0.2} y={20}>
                <p className="mt-4 text-[1.02rem] leading-relaxed text-muted-foreground">
                  Payments are linked to delivery milestones, and the estimator
                  shows the schedule for your scope.
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
