import Link from "next/link";
import { ArrowRight, Check, Clock, Hand, PackageCheck } from "lucide-react";

import { pageMetadata } from "@/lib/seo";
import { services } from "@/lib/content";
import { projectPackages } from "@/lib/plans";
import { Faq } from "@/components/sections/faq";
import { CtaBand } from "@/components/sections/cta-band";
import { PageHero } from "@/components/layout/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { DeferredSection } from "@/components/ui/deferred-section";
import { Section } from "@/components/ui/section";
import { TextReveal } from "@/components/motion/text-reveal";
import { FadeUp, Stagger, StaggerItem } from "@/components/motion/primitives";

export const metadata = pageMetadata({
  title: "How it works",
  description:
    "How Setuware Technologies delivers a website or app: discovery, fixed quote, design, build, testing and launch, then support. What you get at each step, how long it takes and what we need from you.",
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
      "We learn how your business wins customers, who the site or app is for, and when it has to be live. If we are not the right team, we tell you on the first call.",
    website: "2–5 days",
    app: "1–2 weeks",
    youGet: [
      "A free 30-minute call with the people who would build it",
      "A written summary of goals, audience and constraints",
      "A sitemap for a website, or a feature list for an app",
    ],
    weNeed: [
      "One person who can make decisions",
      "Your current website or tools, if you have them",
      "Two or three competitors or sites you like",
    ],
  },
  {
    step: "02",
    title: "Proposal and fixed quote",
    summary:
      "A written scope that lists what is included and what is not. One fixed price, a timeline and payment milestones tied to each stage.",
    website: "3–5 working days",
    app: "3–5 working days",
    youGet: [
      "Written scope with every page, screen or feature listed",
      "Fixed price and a dated timeline",
      "Payment milestones you can budget against",
    ],
    weNeed: ["Your sign-off on the scope", "The first milestone payment to book the team"],
  },
  {
    step: "03",
    title: "Design",
    summary:
      "Layouts and key pages or screens as a clickable prototype. You approve something you can tap through, not a flat picture.",
    website: "1–2 weeks",
    app: "2–3 weeks",
    youGet: [
      "Wireframes for the main pages or screens",
      "A clickable prototype on desktop and mobile",
      "Final designs, approved before we build",
    ],
    weNeed: [
      "Logo, brand colours and photos, or a go-ahead for us to create them",
      "Feedback within two to three working days",
    ],
  },
  {
    step: "04",
    title: "Build",
    summary:
      "Your website or app on a live staging link from the first week. A short demo every week shows what changed and what is next.",
    website: "1–3 weeks",
    app: "4–10 weeks",
    youGet: [
      "A live staging link you can open on any device",
      "A weekly demo and a plain-language changelog",
      "Direct access to the people building it",
    ],
    weNeed: [
      "Final page content, or a brief if we write it for you",
      "Access to any systems we connect to",
      "Business KYC documents if the build takes payments",
    ],
  },
  {
    step: "05",
    title: "Testing and launch",
    summary:
      "We test on real phones and browsers, check speed and SEO, review security and plan the rollback before anything goes live.",
    website: "2–4 days",
    app: "1–2 weeks",
    youGet: [
      "Real-device testing on Android, iPhone and desktop",
      "Speed, SEO and accessibility checks",
      "Go-live, plus app store submission for mobile apps",
      "Handover notes and a training session for your team",
    ],
    weNeed: ["A final review and your go-ahead to launch", "Domain and app store account access"],
  },
  {
    step: "06",
    title: "Support and growth",
    summary:
      "Every build includes a support window. After that, a monthly care plan covers hosting, updates, backups and fixes, and we can add SEO, marketing or new features.",
    website: "Ongoing",
    app: "Ongoing",
    youGet: [
      "Bug fixes and security updates",
      "Uptime monitoring and backups",
      "A monthly report in plain language",
      "Quotes for new features before any work starts",
    ],
    weNeed: ["A heads-up before big launches or campaigns"],
  },
];

const PROCESS_FAQS = [
  {
    group: "Before you start" as const,
    question: "How long will my project take?",
    answer:
      "It depends on what you need. A business website usually takes 3 to 6 weeks from approved scope to launch. An online store takes 4 to 10 weeks, a web app 8 to 12, and a mobile app 8 to 16. Discovery adds 1 to 2 weeks up front. Your exact dates are written into the proposal.",
  },
  {
    group: "Before you start" as const,
    question: "What do you need from us to start?",
    answer:
      "One decision-maker who can join a short weekly demo. Your logo, brand assets and content, or a decision to have us create them. Access to any systems we need to connect to. If the build takes payments, your business KYC documents for the payment gateway.",
  },
  {
    group: "Before you start" as const,
    question: "What happens if I want to change something mid-project?",
    answer:
      "Small changes inside the agreed scope are part of the work. Anything new is quoted as a separate item before we start it, so the price never moves without your sign-off.",
  },
  {
    group: "Help & support" as const,
    question: "How will I know how the project is going?",
    answer:
      "You get a live staging link from the first week of the build and a short demo every week. Each demo comes with a written note of what is done, what is next and anything we need from you.",
  },
  {
    group: "Help & support" as const,
    question: "What happens after launch?",
    answer:
      "Your build includes a support window for fixes. After that you can move to a monthly care plan for hosting, updates, backups, monitoring and small changes. If you prefer to run it yourself, we hand over everything with documentation.",
  },
  {
    group: "Help & support" as const,
    question: "Can we stop after a stage?",
    answer:
      "Yes. You pay for each stage as it is delivered. If you stop, you keep everything built so far: the designs, the code and the documentation.",
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
        eyebrow="How it works"
        title="From first call to launch, and after"
        description="Six stages. Each one has a clear output, a time frame and a short list of what we need from you. You always know what is being built this week and what it costs."
      >
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ButtonLink
            href="/contact"
            size="lg"
            className="rounded-full bg-setu text-white shadow-none hover:bg-setu-dark"
          >
            Book a free call
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
              What happens, what you get, what we need
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
                        You get
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
                        We need from you
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
              How long it usually takes
            </TextReveal>
            <FadeUp delay={0.2} y={20}>
              <p className="mt-4 text-[1.02rem] leading-relaxed text-muted-foreground">
                Build time from approved scope to launch. Your proposal gives
                exact dates. The instant estimator gives you a figure for your
                scope in about a minute.
              </p>
              <ButtonLink href="/estimate" variant="secondary" className="mt-6 rounded-full">
                Estimate my project
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
                  We do not disappear at handover
                </TextReveal>
                <FadeUp delay={0.2} y={20}>
                  <p className="mt-4 max-w-lg text-[1.02rem] leading-relaxed text-white/70">
                    Every build comes with a support window for fixes. After that,
                    a monthly care plan keeps your site or app fast, secure and
                    backed up, with published response times.
                  </p>
                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <ButtonLink
                      href="/pricing#care"
                      className="rounded-full bg-setu text-white shadow-none hover:bg-setu-dark"
                    >
                      See care plans
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
                      ? `${supportTerm(websitePackage.features)} on Website Build, ${supportTerm(appPackage.features)} on Full Application Build.`
                      : "Every build includes a support window after launch.",
                  },
                  { title: "Updates and fixes", body: "Security patches, plugin and framework updates, and bug fixes." },
                  { title: "Hosting and backups", body: "Managed hosting, SSL, nightly backups and uptime checks." },
                  { title: "Room to grow", body: "SEO, marketing and new features, each quoted before we start." },
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

      <DeferredSection minHeight={380}>
        <CtaBand
          title="Ready for stage one?"
          description="Book a free 30-minute call. You leave with a written summary and a price range, whether or not we work together."
          primaryLabel="Book a free call"
        />
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
