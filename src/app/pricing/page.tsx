import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Calculator,
  CalendarCheck,
  ClipboardList,
  FileSignature,
  Globe,
  Hammer,
  LayoutTemplate,
  PenLine,
  ReceiptIndianRupee,
  Rocket,
  Search,
  Server,
  Wrench,
} from "lucide-react";

import { breadcrumbJsonLd, faqJsonLd, pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { site } from "@/lib/site";
import { getService, serviceStartingPrice, services } from "@/lib/content";
import { carePlans, LANDING_PAGE_FROM, WEBSITE_FROM } from "@/lib/plans";
import { SERVICE_RATES } from "@/lib/pricing";
import { formatINR } from "@/lib/utils";
import { CarePlans, ProjectPackages } from "@/components/sections/pricing-plans";
import { CARD, CARD_HOVER, FaqCards, IconTile, SectionIntro } from "@/components/sections/page-blocks";
import { DeferredSection } from "@/components/ui/deferred-section";
import { PageHero } from "@/components/layout/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { ServiceIcon } from "@/components/ui/service-icon";
import { FadeUp, Stagger, StaggerItem } from "@/components/motion/primitives";
import { cn } from "@/lib/utils";

const carePlanFrom = Math.min(
  ...carePlans.map((plan) => plan.monthly ?? Number.POSITIVE_INFINITY),
);

export const metadata = pageMetadata({
  title: "Website Development Pricing in India",
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

/** Standard inclusions, grouped by the stage of the engagement they belong to. */
const INCLUDED = [
  {
    Icon: ClipboardList,
    title: "Planning and transparency",
    items: [
      "Free consultation and written scope",
      "Fixed price agreed before work begins",
      "Weekly progress reviews on a live preview",
      "GST invoice for every payment",
    ],
  },
  {
    Icon: Hammer,
    title: "Design and build",
    items: [
      "Design approval before development",
      "Responsive design for every screen size",
      "On-page SEO, sitemap and analytics set-up",
      "Testing across devices and browsers",
    ],
  },
  {
    Icon: Rocket,
    title: "Launch and handover",
    items: [
      "SSL certificate and launch on your domain",
      "Handover documentation and training",
      "Three months of post-launch support for websites",
      "Full ownership of code, designs and accounts",
    ],
  },
] as const;

/** The order in which a project is invoiced. */
const PAYMENT_STEPS = [
  {
    Icon: FileSignature,
    title: "Proposal",
    body: "Fees are divided into milestones for discovery, design, development and launch. Each amount and date is set out in your proposal.",
  },
  {
    Icon: CalendarCheck,
    title: "First milestone",
    body: "The first payment confirms your start date and reserves the project team.",
  },
  {
    Icon: BadgeCheck,
    title: "Payment on approval",
    body: "Each subsequent milestone is invoiced once the preceding stage is delivered and approved.",
  },
  {
    Icon: Server,
    title: "Monthly plans",
    body: "After launch, hosting, maintenance and marketing plans are billed monthly and can be adjusted as your needs change.",
  },
] as const;

const PRICING_FAQS = [
  {
    group: "Before you start" as const,
    question: "Why do starting prices differ between services?",
    answer:
      "Each starting price reflects the minimum scope of that service. Landing pages start at ₹5,000 and complete business websites at ₹25,000, while applications involve user accounts, data, administration and more extensive testing.",
  },
  {
    group: "Before you start" as const,
    question: "Will the price change during the project?",
    answer:
      "No. The quote is fixed for the agreed scope. Any new requirements are quoted separately for your approval.",
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
      title: "Hosting and maintenance",
      price: `From ${formatINR(carePlanFrom)} / month`,
      body: "Managed hosting, SSL, backups and uptime monitoring under a monthly plan.",
      href: "#care",
    },
    {
      Icon: Wrench,
      title: "Updates and fixes",
      price: "Included in plans",
      body: "Security patches, framework updates, bug fixes and minor content changes.",
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
      title: "Additional pages",
      price: `${formatINR(extraPageRate)} / page`,
      body: "Service, location or product pages beyond the agreed scope.",
      href: "/estimate",
    },
    {
      Icon: PenLine,
      title: "Content writing",
      price: "Quoted per page",
      body: "Professional website copy, written from a short briefing session.",
      href: "/contact",
    },
  ] as const;

  return (
    <>
      <PageHero
        video="pricing"
        eyebrow="Plans and packages"
        title="Website and app development pricing"
        description="Fixed-price packages for every stage of your business, with a written scope agreed before work begins."
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

      <ProjectPackages surface="grid" />

      {/* Included as standard */}
      <Section surface="tint">
        <div className="container-page">
          <SectionIntro
            eyebrow="Included in every project"
            title="Standard with every engagement"
            description="Every website, store and application includes the following at no additional cost."
          />

          <Stagger className="mt-14 grid gap-5 lg:grid-cols-3" stagger={0.08}>
            {INCLUDED.map(({ Icon, title, items }) => (
              <StaggerItem key={title} y={24} className={cn(CARD, "h-full p-6 md:p-7")}>
                <IconTile>
                  <Icon className="size-5" aria-hidden />
                </IconTile>
                <h3 className="mt-5 text-lg font-semibold text-foreground">{title}</h3>
                <ul className="mt-4 flex flex-col gap-3">
                  {items.map((item) => (
                    <li
                      key={item}
                      className="flex gap-2.5 border-t border-border pt-3 text-[0.92rem] leading-snug text-foreground/85 first:border-t-0 first:pt-0"
                    >
                      <span className="mt-[0.45rem] size-1.5 shrink-0 rounded-full bg-setu" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Section>

      {/* Starting prices by service */}
      <Section>
        <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.5fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionIntro
              align="left"
              eyebrow="By service"
              title="Starting prices by service"
              description="Indicative starting prices and typical timelines. Your quote reflects the pages, features and integrations you require."
            >
              <ButtonLink href="/estimate" variant="secondary" className="mt-6 rounded-full">
                <Calculator className="size-4" aria-hidden />
                Open the estimator
              </ButtonLink>
            </SectionIntro>
          </div>

          <FadeUp y={24} blur={false} className={cn(CARD, "overflow-hidden")}>
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Starting price and typical timeline for each service</caption>
              <thead className="bg-background-subtle text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3.5 font-semibold sm:px-6">
                    Service
                  </th>
                  <th scope="col" className="hidden px-4 py-3.5 font-semibold sm:table-cell">
                    Typical timeline
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-right font-semibold sm:px-6">
                    Starting at
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {buildServices.map((service) => (
                  <tr key={service.slug} className="group transition-colors hover:bg-setu/[0.03]">
                    <th scope="row" className="px-4 py-4 font-normal sm:px-6">
                      <Link
                        href={`/services/${service.slug}`}
                        className="flex items-center gap-3"
                      >
                        <ServiceIcon name={service.icon} accent={service.accent} size={16} className="size-9" />
                        <span className="min-w-0">
                          <span className="flex items-center gap-1 font-medium text-foreground transition-colors group-hover:text-setu">
                            {service.name}
                            <ArrowUpRight className="size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                          </span>
                          <span className="block text-xs text-muted-foreground sm:hidden">
                            {service.typicalTimeline}
                          </span>
                        </span>
                      </Link>
                    </th>
                    <td className="hidden px-4 py-4 text-muted-foreground sm:table-cell">
                      {service.typicalTimeline}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right font-display text-base font-semibold tabular-nums text-foreground sm:px-6">
                      {formatINR(serviceStartingPrice(service))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="border-t border-border bg-setu/[0.05] px-4 py-4 text-[0.85rem] leading-relaxed text-foreground/80 sm:px-6">
              Combined services are quoted together in a single proposal. All
              prices exclude GST.
            </p>
          </FadeUp>
        </div>
      </Section>

      <CarePlans surface="dots" />

      {/* Add-ons */}
      <Section surface="subtle" id="add-ons">
        <div className="container-page">
          <SectionIntro
            eyebrow="Add-ons"
            title="Optional services and add-ons"
            description="Extend any package with the services below. Each is quoted separately and can be added at any stage."
          />

          <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
            {addOns.map(({ Icon, title, price, body, href }) => (
              <StaggerItem key={title} y={24} className="h-full">
                <Link href={href} className={cn(CARD, CARD_HOVER, "group flex h-full flex-col gap-3 p-6")}>
                  <span className="flex items-start justify-between gap-3">
                    <IconTile>
                      <Icon className="size-5" aria-hidden />
                    </IconTile>
                    <span className="rounded-full bg-setu/10 px-3 py-1 text-xs font-semibold text-setu-dark dark:text-setu">
                      {price}
                    </span>
                  </span>
                  <span className="mt-2 flex items-center gap-1 font-semibold text-foreground">
                    {title}
                    <ArrowUpRight
                      className="size-3.5 text-muted-foreground transition-[color,transform] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-setu"
                      aria-hidden
                    />
                  </span>
                  <span className="text-[0.9rem] leading-relaxed text-muted-foreground">{body}</span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Section>

      {/* Payment terms */}
      <Section surface="ink" id="payment-terms">
        <div className="container-page">
          <SectionIntro
            eyebrow="Payment terms"
            title="Milestone-based payments"
            description="Payments follow delivery. The estimator shows the milestone schedule for your scope."
          />

          <Stagger as="ol" className="relative mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
            <span
              aria-hidden
              className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-[2.1rem] hidden h-px bg-gradient-to-r from-setu/0 via-setu/60 to-setu/0 lg:block"
            />
            {PAYMENT_STEPS.map(({ Icon, title, body }, index) => (
              <StaggerItem
                key={title}
                as="li"
                y={22}
                className="relative flex flex-col items-start rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm lg:items-center lg:text-center"
              >
                <span className="relative inline-flex size-11 items-center justify-center rounded-full bg-setu text-white shadow-[0_0_0_6px_rgba(0,161,198,0.15)]">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="mt-5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-setu">
                  Step {index + 1}
                </span>
                <h3 className="mt-1.5 text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-[0.9rem] leading-relaxed text-white/65">{body}</p>
              </StaggerItem>
            ))}
          </Stagger>

          <FadeUp y={16} className="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-center text-[0.85rem] leading-relaxed text-white/70 sm:flex-row sm:text-left">
            <ReceiptIndianRupee className="size-5 shrink-0 text-setu" aria-hidden />
            <span>
              Prices exclude GST, which is added at the prevailing rate. Domains,
              cloud services, payment gateways and licences are billed to your
              accounts at cost.
            </span>
          </FadeUp>
        </div>
      </Section>

      <DeferredSection minHeight={720}>
        <Section surface="tint" id="faq">
          <FaqCards items={PRICING_FAQS} />
        </Section>
      </DeferredSection>
      <JsonLd data={breadcrumbJsonLd([{ name: "Pricing", path: "/pricing" }])} />
      <JsonLd data={faqJsonLd(PRICING_FAQS)} />
    </>
  );
}
