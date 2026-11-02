import Link from "next/link";
import { ArrowRight, Check, Clock, Hand, PackageCheck } from "lucide-react";

import { pageMetadata } from "@/lib/seo";
import { services } from "@/lib/content";
import { projectPackages } from "@/lib/plans";
import { Faq } from "@/components/sections/faq";
import { PageHero } from "@/components/layout/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { DeferredSection } from "@/components/ui/deferred-section";
import { Section } from "@/components/ui/section";
import { TextReveal } from "@/components/motion/text-reveal";
import { FadeUp, Stagger, StaggerItem } from "@/components/motion/primitives";

export const metadata = pageMetadata({
  title: "Our delivery process",
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
  youGet: readonly string[];
  weNeed: readonly string[];
}

const STAGES: readonly Stage[] = [
  {
    step: "01",
    title: "Discovery",
    summary:
      "We develop a clear understanding of your business, audience and objectives, and confirm the timeline your project must meet.",
    website: "2–5 days",
    app: "1–2 weeks",
    youGet: [
      "A free 30-minute consultation with our team",
      "A written summary of goals, audience and constraints",
      "A sitemap for a website or a feature list for an app",
    ],
    weNeed: [
      "A designated decision-maker",
      "Access to your current website or tools, where available",
      "Two or three reference websites or competitors",
    ],
  },
  {
    step: "02",
    title: "Strategy and proposal",
    summary:
      "A written proposal that defines the scope, exclusions, timeline and fixed price, with payment milestones linked to each stage.",
    website: "3–5 working days",
    app: "3–5 working days",
    youGet: [
      "A written scope listing every page, screen or feature",
      "A fixed price and a dated timeline",
      "Milestone-based payment schedule",
    ],
    weNeed: ["Approval of the scope", "The first milestone payment to schedule the team"],
  },
  {
    step: "03",
    title: "Design",
    summary:
      "Wireframes, visual designs and an interactive prototype of key pages or screens, reviewed and approved before development.",
    website: "1–2 weeks",
    app: "2–3 weeks",
    youGet: [
      "Wireframes for the main pages or screens",
      "An interactive prototype for desktop and mobile",
      "Final designs approved before development",
    ],
    weNeed: [
      "Logo, brand colours and imagery, or approval for us to create them",
      "Feedback within two to three business days",
    ],
  },
  {
    step: "04",
    title: "Development",
    summary:
      "Engineering, integrations and quality assurance, with progress available on a live preview from the first week of development and reviewed in a weekly demonstration.",
    website: "1–3 weeks",
    app: "4–10 weeks",
    youGet: [
      "A live preview available on any device",
      "A weekly demonstration and written progress summary",
      "Direct access to your project team",
    ],
    weNeed: [
      "Final page content or a brief for our copywriters",
      "Access to any systems we integrate with",
      "Business KYC documents for payment integrations",
    ],
  },
  {
    step: "05",
    title: "Launch",
    summary:
      "Comprehensive testing across devices and browsers, performance, SEO and security reviews, and a planned go-live with rollback procedures in place.",
    website: "2–4 days",
    app: "1–2 weeks",
    youGet: [
      "Device testing on Android, iPhone and desktop",
      "Performance, SEO and accessibility checks",
      "Go-live and app store submission for mobile apps",
      "Handover documentation and team training",
    ],
    weNeed: ["Final review and approval to launch", "Access to domain and app store accounts"],
  },
  {
    step: "06",
    title: "Support and growth",
    summary:
      "Every project includes a post-launch support period, followed by optional maintenance plans for hosting, updates, backups and continuous improvement.",
    website: "Ongoing",
    app: "Ongoing",
    youGet: [
      "Bug fixes and security updates",
      "Uptime monitoring and backups",
      "A clear monthly performance report",
      "Quotations for new features before work begins",
    ],
    weNeed: ["Advance notice of major launches or campaigns"],
  },
];

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
    ["business-websites", "ecommerce-stores", "web-development", "app-development", "custom-software"].includes(
      service.slug,
    ),
  );

  return (
    <>
      <PageHero
        video="process"
        eyebrow="Our process"
        title="How we deliver every project"
        description="Six structured stages, each with defined outputs, timelines and responsibilities. You have full visibility of progress and costs throughout."
      >
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
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

      {/* Stage by stage */}
      <Section>
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-setu">
              Stage by stage
            </span>
            <TextReveal
              as="h2"
              className="mt-4 font-display text-3xl font-semibold leading-tight text-foreground sm:text-[2.4rem]"
            >
              Activities, deliverables and requirements
            </TextReveal>
          </div>

          <ol className="relative mx-auto mt-14 flex max-w-5xl flex-col gap-6">
            {STAGES.map((stage) => (
              <li key={stage.step}>
                <FadeUp
                  y={28}
                  blur={false}
                  className="grid gap-6 rounded-card border border-border bg-surface p-6 shadow-ambient md:p-8 lg:grid-cols-[1fr_1.35fr] lg:gap-10"
                >
                  <div className="flex flex-col gap-3">
                    <span className="font-mono text-xs font-semibold text-setu">
                      Stage {stage.step}
                    </span>
                    <h3 className="font-display text-2xl font-semibold text-foreground">
                      {stage.title}
                    </h3>
                    <p className="text-[0.95rem] leading-relaxed text-muted-foreground">
                      {stage.summary}
                    </p>
                    <dl className="mt-2 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-background-subtle px-3.5 py-2.5">
                        <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                          <Clock className="size-3" aria-hidden />
                          Website
                        </dt>
                        <dd className="mt-0.5 text-sm font-semibold text-foreground">
                          {stage.website}
                        </dd>
                      </div>
                      <div className="rounded-xl bg-background-subtle px-3.5 py-2.5">
                        <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                          <Clock className="size-3" aria-hidden />
                          App or software
                        </dt>
                        <dd className="mt-0.5 text-sm font-semibold text-foreground">
                          {stage.app}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <PackageCheck className="size-4 text-setu" aria-hidden />
                        Deliverables
                      </h4>
                      <ul className="mt-3 flex flex-col gap-2.5">
                        {stage.youGet.map((item) => (
                          <li key={item} className="flex gap-2.5 text-[0.9rem] leading-snug text-foreground/85">
                            <Check className="mt-0.5 size-4 shrink-0 text-setu" aria-hidden />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Hand className="size-4 text-setu" aria-hidden />
                        Client requirements
                      </h4>
                      <ul className="mt-3 flex flex-col gap-2.5">
                        {stage.weNeed.map((item) => (
                          <li key={item} className="flex gap-2.5 text-[0.9rem] leading-snug text-muted-foreground">
                            <span className="mt-[0.45rem] size-1.5 shrink-0 rounded-full bg-setu/60" aria-hidden />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </FadeUp>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* Typical timelines */}
      <Section surface="subtle">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-setu">
              Typical timelines
            </span>
            <TextReveal
              as="h2"
              className="mt-4 font-display text-3xl font-semibold leading-tight text-foreground sm:text-[2.4rem]"
            >
              Typical project durations
            </TextReveal>
            <FadeUp delay={0.2} y={20}>
              <p className="mt-4 text-[1.02rem] leading-relaxed text-muted-foreground">
                Durations are measured from approved scope to launch. Exact dates
                are confirmed in your proposal, and the instant estimator provides
                an indicative figure for your scope.
              </p>
              <ButtonLink href="/estimate" variant="secondary" className="mt-6 rounded-full">
                Get an estimate
                <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
            </FadeUp>
          </div>

          <Stagger as="ul" className="divide-y divide-border border-y border-border" stagger={0.06}>
            {timelines.map((service) => (
              <StaggerItem key={service.slug} as="li" y={16}>
                <Link
                  href={`/services/${service.slug}`}
                  className="group flex items-center justify-between gap-4 py-4"
                >
                  <span className="font-medium text-foreground transition-colors group-hover:text-setu">
                    {service.name}
                  </span>
                  <span className="shrink-0 font-display text-sm font-semibold text-foreground sm:text-base">
                    {service.typicalTimeline}
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Section>

      {/* After launch */}
      <Section>
        <div className="container-page">
          <div className="relative overflow-hidden rounded-[1.75rem] bg-black p-7 text-white md:p-12">
            <div
              className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-[radial-gradient(circle,rgba(0,161,198,0.45),transparent_70%)] blur-2xl"
              aria-hidden
            />
            <div className="relative grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-setu">
                  After launch
                </span>
                <TextReveal
                  as="h2"
                  className="mt-4 font-display text-3xl font-semibold leading-tight text-white sm:text-[2.4rem]"
                >
                  Ongoing support after handover
                </TextReveal>
                <FadeUp delay={0.2} y={20}>
                  <p className="mt-4 max-w-lg text-[1.02rem] leading-relaxed text-white/70">
                    Every project includes a post-launch support period. Monthly
                    maintenance plans then keep your platform fast, secure and
                    backed up, with published response times.
                  </p>
                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <ButtonLink
                      href="/pricing#care"
                      className="rounded-full bg-setu text-white shadow-none hover:bg-setu-dark"
                    >
                      View maintenance plans
                    </ButtonLink>
                    <ButtonLink
                      href="/services/support-maintenance"
                      variant="ghost"
                      className="rounded-full border border-white/25 text-white hover:bg-white/10"
                    >
                      Maintenance and support
                    </ButtonLink>
                  </div>
                </FadeUp>
              </div>

              <Stagger as="ul" className="grid gap-3 sm:grid-cols-2" stagger={0.07}>
                {[
                  {
                    title: "Included support",
                    body: websitePackage && appPackage
                      ? `${supportTerm(websitePackage.features)} on Landing Page and Website Build, ${supportTerm(appPackage.features)} on Full Application Build.`
                      : "Every project includes a post-launch support period.",
                  },
                  { title: "Updates and fixes", body: "Security patches, plugin and framework updates, and bug fixes." },
                  { title: "Hosting and backups", body: "Managed hosting, SSL, nightly backups and uptime checks." },
                  { title: "Continuous improvement", body: "SEO, marketing and new features, each quoted before work begins." },
                ].map((item) => (
                  <StaggerItem
                    key={item.title}
                    as="li"
                    y={20}
                    className="rounded-2xl border border-white/12 bg-white/[0.04] p-5"
                  >
                    <h3 className="font-semibold text-white">{item.title}</h3>
                    <p className="mt-1.5 text-[0.88rem] leading-relaxed text-white/65">{item.body}</p>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </div>
        </div>
      </Section>

      <DeferredSection minHeight={720}>
        <Faq items={PROCESS_FAQS} />
      </DeferredSection>
    </>
  );
}

/** Pulls "3 months" out of "3 months of support after launch" so copy follows plan data. */
function supportTerm(features: readonly string[]): string {
  const line = features.find((feature) => /support after launch/i.test(feature));
  const match = line?.match(/^(.*?)\s+of support/i);
  return match ? match[1] : "A support window";
}
