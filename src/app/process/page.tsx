import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock,
  FileText,
  FileCheck2,
  KeyRound,
  LifeBuoy,
  MessageSquareText,
  Palette,
  RefreshCw,
  Server,
  TrendingUp,
  UserCheck,
} from "lucide-react";

import { breadcrumbJsonLd, faqJsonLd, pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { services } from "@/lib/content";
import { projectPackages } from "@/lib/plans";
import { CARD, CARD_HOVER, FaqCards, IconTile, SectionIntro } from "@/components/sections/page-blocks";
import { PageHero } from "@/components/layout/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { DeferredSection } from "@/components/ui/deferred-section";
import { Section } from "@/components/ui/section";
import { ServiceIcon } from "@/components/ui/service-icon";
import { FadeUp, Stagger, StaggerItem } from "@/components/motion/primitives";
import { cn } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Our Website & App Development Process",
  description:
    "Our six-stage delivery process: discovery, proposal, design, development, launch and support, with clear outputs and timelines at every stage.",
  path: "/process",
});

interface Stage {
  step: string;
  title: string;
  summary: string;
  website: string;
  app: string;
  deliverables: readonly string[];
}

const STAGES: readonly Stage[] = [
  {
    step: "01",
    title: "Discovery",
    summary:
      "We establish a clear understanding of your business, audience and objectives, and confirm the date your project must meet.",
    website: "2–5 working days",
    app: "1–2 weeks",
    deliverables: [
      "A free 30-minute consultation with our team",
      "A written summary of goals, audience and constraints",
      "A sitemap for a website or a feature list for an app",
    ],
  },
  {
    step: "02",
    title: "Strategy and proposal",
    summary:
      "A written proposal that defines the scope, exclusions, timeline and fixed price, with payments linked to each stage.",
    website: "3–5 working days",
    app: "3–5 working days",
    deliverables: [
      "A written scope listing every page, screen or feature",
      "A fixed price and a dated timeline",
      "A milestone-based payment schedule",
    ],
  },
  {
    step: "03",
    title: "Design",
    summary:
      "Wireframes, visual designs and an interactive prototype of the key pages or screens, approved before development begins.",
    website: "1–2 weeks",
    app: "2–3 weeks",
    deliverables: [
      "Wireframes for the main pages or screens",
      "An interactive prototype for desktop and mobile",
      "Final designs, approved before development",
    ],
  },
  {
    step: "04",
    title: "Development",
    summary:
      "Engineering, integrations and quality assurance, with a live preview from the first week and a weekly demonstration of progress.",
    website: "1–3 weeks",
    app: "4–10 weeks",
    deliverables: [
      "A live preview available on any device",
      "A weekly demonstration and written progress summary",
      "Direct access to your project team",
    ],
  },
  {
    step: "05",
    title: "Launch",
    summary:
      "Testing across devices and browsers, performance, SEO and security reviews, and a planned go-live with a rollback plan in place.",
    website: "2–4 working days",
    app: "1–2 weeks",
    deliverables: [
      "Device testing on Android, iPhone and desktop",
      "Performance, SEO and accessibility checks",
      "Go-live, and app store submission for mobile apps",
      "Handover documentation and team training",
    ],
  },
  {
    step: "06",
    title: "Support and growth",
    summary:
      "Every project includes a post-launch support period, followed by optional plans for hosting, updates, backups and improvements.",
    website: "Ongoing",
    app: "Ongoing",
    deliverables: [
      "Bug fixes and security updates",
      "Uptime monitoring and backups",
      "A monthly performance report",
      "Quotations for new features before work begins",
    ],
  },
];

/** What the client provides, consolidated from every stage. */
const CLIENT_INPUTS = [
  {
    Icon: UserCheck,
    title: "A decision-maker",
    body: "One person who can approve the scope, designs and launch, and attend weekly reviews.",
  },
  {
    Icon: Palette,
    title: "Brand assets",
    body: "Your logo, brand colours and imagery, or approval for us to create them.",
  },
  {
    Icon: FileText,
    title: "Content",
    body: "Final page content, or a brief for our copywriters to work from.",
  },
  {
    Icon: KeyRound,
    title: "Access to systems",
    body: "Your current website, domain, app store accounts and any tools we integrate with.",
  },
  {
    Icon: MessageSquareText,
    title: "Timely feedback",
    body: "Feedback on designs and previews within two to three business days.",
  },
  {
    Icon: FileCheck2,
    title: "Business documents",
    body: "KYC documents for payment gateway activation, where payments are in scope.",
  },
] as const;

const PROCESS_FAQS = [
  {
    group: "Before you start" as const,
    question: "How long will my project take?",
    answer:
      "A business website typically takes 3–6 weeks from approved scope to launch, an online store 4–10 weeks, a web application 8–12 weeks and a mobile app 8–16 weeks. Exact dates are confirmed in your proposal.",
  },
  {
    group: "Before you start" as const,
    question: "What do you need from us to start?",
    answer:
      "We need a decision-maker for weekly reviews, your brand assets and content, and access to any systems we integrate with. Payment integrations also require business KYC documents.",
  },
  {
    group: "Before you start" as const,
    question: "Can the scope change during the project?",
    answer:
      "Minor adjustments within the agreed scope are included. New requirements are quoted separately and begin only after your approval.",
  },
  {
    group: "Help & support" as const,
    question: "How will we track progress?",
    answer:
      "You will have access to a live preview from the first week of development and a weekly demonstration, each accompanied by a written progress summary.",
  },
  {
    group: "Help & support" as const,
    question: "What happens after launch?",
    answer:
      "Every project includes a post-launch support period. You can then choose a monthly maintenance plan or manage the platform in-house with our full documentation.",
  },
  {
    group: "Help & support" as const,
    question: "Can we pause the project after a stage?",
    answer:
      "Yes. Each stage is billed on delivery, and all designs, code and documentation completed to that point are handed over to you.",
  },
] as const;

export default function ProcessPage() {
  const websitePackage = projectPackages.find((plan) => plan.id === "website-build");
  const appPackage = projectPackages.find((plan) => plan.id === "full-application-build");
  const timelines = services.filter((service) =>
    ["business-websites", "ecommerce-stores", "web-development", "app-development", "custom-software", "ai-integration"].includes(
      service.slug,
    ),
  );

  const afterLaunch = [
    {
      Icon: LifeBuoy,
      title: "Included support",
      body:
        websitePackage && appPackage
          ? `${supportTerm(websitePackage.features)} on Landing Page and Website Build projects, and ${supportTerm(appPackage.features)} on Full Application Build projects.`
          : "Every project includes a post-launch support period.",
    },
    {
      Icon: RefreshCw,
      title: "Updates and fixes",
      body: "Security patches, plugin and framework updates, and bug fixes.",
    },
    {
      Icon: Server,
      title: "Hosting and backups",
      body: "Managed hosting, SSL, nightly backups and uptime monitoring.",
    },
    {
      Icon: TrendingUp,
      title: "Continuous improvement",
      body: "SEO, marketing and new features, each quoted before work begins.",
    },
  ] as const;

  return (
    <>
      <PageHero
        video="process"
        eyebrow="Our process"
        title="How we deliver every project"
        description="Six stages, each ending with something you can see and approve. You know the price and the dates before we start, and nothing moves without your sign-off."
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
          <ButtonLink href="/estimate" size="lg" variant="secondary" className="rounded-full">
            Get an instant estimate
          </ButtonLink>
        </div>
      </PageHero>

      {/* Timeline */}
      <Section surface="grid">
        <div className="container-page">
          <SectionIntro
            eyebrow="Stage by stage"
            title="Six stages from discovery to growth"
            description="Each stage ends with a defined deliverable and your approval before the next begins."
          />

          <ol className="relative mx-auto mt-16 flex max-w-5xl flex-col gap-8 md:gap-10">
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-8 left-[1.4rem] top-8 w-px bg-gradient-to-b from-setu/70 via-setu/40 to-setu/10 md:left-[1.9rem]"
            />
            {STAGES.map((stage) => (
              <li key={stage.step} className="relative grid grid-cols-[2.8rem_1fr] gap-4 md:grid-cols-[3.8rem_1fr] md:gap-8">
                <span className="relative z-10 inline-flex size-11 items-center justify-center rounded-full bg-setu font-mono text-sm font-semibold text-white shadow-[0_0_0_6px_var(--background),0_8px_20px_-6px_rgb(0_161_198/0.6)] md:size-[3.8rem] md:text-base">
                  {stage.step}
                </span>

                <FadeUp
                  y={28}
                  blur={false}
                  className={cn(CARD, "grid gap-6 p-6 md:p-8 lg:grid-cols-[1.1fr_1fr] lg:gap-10")}
                >
                  <div className="flex flex-col gap-3">
                    <span className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-setu">
                      Stage {stage.step}
                    </span>
                    <h3 className="font-display text-2xl font-semibold text-foreground">
                      {stage.title}
                    </h3>
                    <p className="text-[0.95rem] leading-relaxed text-muted-foreground">
                      {stage.summary}
                    </p>
                    <dl className="mt-2 flex flex-wrap gap-2">
                      <Duration label="Website" value={stage.website} />
                      <Duration label="App or software" value={stage.app} />
                    </dl>
                  </div>

                  <div className="rounded-xl bg-background-subtle p-5 ring-1 ring-inset ring-border">
                    <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Deliverables
                    </h4>
                    <ul className="mt-3.5 flex flex-col gap-2.5">
                      {stage.deliverables.map((item) => (
                        <li key={item} className="flex gap-2.5 text-[0.9rem] leading-snug text-foreground/85">
                          <span className="mt-0.5 inline-flex size-[18px] shrink-0 items-center justify-center rounded-full bg-setu/12 text-setu">
                            <Check className="size-3" strokeWidth={3} aria-hidden />
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </FadeUp>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* What we need from you */}
      <Section surface="subtle">
        <div className="container-page">
          <SectionIntro
            eyebrow="Your role"
            title="What we need from you"
            description="Projects stay on schedule when these inputs are ready at the right stage. We confirm each one in your proposal."
          />

          <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
            {CLIENT_INPUTS.map(({ Icon, title, body }) => (
              <StaggerItem key={title} y={22} className={cn(CARD, "h-full p-6")}>
                <IconTile>
                  <Icon className="size-5" aria-hidden />
                </IconTile>
                <h3 className="mt-5 font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-[0.9rem] leading-relaxed text-muted-foreground">{body}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Section>

      {/* Typical timelines */}
      <Section surface="dots">
        <div className="container-page">
          <SectionIntro
            eyebrow="Typical timelines"
            title="Typical project durations"
            description="Measured from approved scope to launch. Exact dates are confirmed in your proposal."
          />

          <Stagger className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
            {timelines.map((service) => (
              <StaggerItem key={service.slug} y={18} className="h-full">
                <Link
                  href={`/services/${service.slug}`}
                  className={cn(CARD, CARD_HOVER, "group flex h-full items-center gap-4 p-5")}
                >
                  <ServiceIcon name={service.icon} accent={service.accent} size={18} className="size-11" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-muted-foreground transition-colors group-hover:text-setu">
                      {service.name}
                    </span>
                    <span className="mt-0.5 block font-display text-xl font-semibold text-foreground">
                      {service.typicalTimeline}
                    </span>
                  </span>
                  <ArrowUpRight
                    className="size-4 shrink-0 text-muted-foreground transition-[color,transform] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-setu"
                    aria-hidden
                  />
                </Link>
              </StaggerItem>
            ))}
          </Stagger>

          <FadeUp y={16} className="mt-10 flex justify-center">
            <ButtonLink href="/estimate" variant="secondary" className="rounded-full">
              Estimate your timeline
              <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
          </FadeUp>
        </div>
      </Section>

      {/* After launch */}
      <Section surface="ink">
        <div className="container-page grid gap-12 lg:grid-cols-[0.9fr_1.2fr] lg:items-center lg:gap-16">
          <SectionIntro
            align="left"
            eyebrow="After launch"
            title="Ongoing support after handover"
            description="Every project includes a post-launch support period. Monthly maintenance plans then keep your platform fast, secure and backed up, with published response times."
          >
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ButtonLink
                href="/pricing#care"
                className="rounded-full bg-setu text-white shadow-none hover:bg-setu-dark"
              >
                View maintenance plans
                <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
              <ButtonLink
                href="/services/support-maintenance"
                variant="ghost"
                className="rounded-full border border-white/25 text-white hover:bg-white/10"
              >
                Maintenance and support
              </ButtonLink>
            </div>
          </SectionIntro>

          <Stagger as="ul" className="grid gap-4 sm:grid-cols-2" stagger={0.07}>
            {afterLaunch.map(({ Icon, title, body }) => (
              <StaggerItem
                key={title}
                as="li"
                y={20}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-setu/15 text-setu ring-1 ring-inset ring-setu/30">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-5 font-semibold text-white">{title}</h3>
                <p className="mt-1.5 text-[0.9rem] leading-relaxed text-white/65">{body}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Section>

      <DeferredSection minHeight={720}>
        <Section surface="tint" id="faq">
          <FaqCards items={PROCESS_FAQS} />
        </Section>
      </DeferredSection>
      <JsonLd data={breadcrumbJsonLd([{ name: "How it works", path: "/process" }])} />
      <JsonLd data={faqJsonLd(PROCESS_FAQS)} />
    </>
  );
}

function Duration({ label, value }: { label: string; value: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5">
      <Clock className="size-3.5 text-setu" aria-hidden />
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-xs font-semibold text-foreground">{value}</dd>
    </div>
  );
}

/** Pulls "3 months" out of "3 months of support after launch" so copy follows plan data. */
function supportTerm(features: readonly string[]): string {
  const line = features.find((feature) => /support after launch/i.test(feature));
  const match = line?.match(/^(.*?)\s+of support/i);
  return match ? match[1] : "A support window";
}
