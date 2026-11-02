import { ArrowRight, Eye, Mail, MessageSquare, Rocket, Wrench } from "lucide-react";

import { applyHref, jobs, jobTeams } from "@/lib/careers";
import { breadcrumbJsonLd, faqJsonLd, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { ButtonLink } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { Section, SectionHeading } from "@/components/ui/section";
import { JsonLd } from "@/components/seo/json-ld";
import { PageHero } from "@/components/layout/page-hero";
import { TextReveal } from "@/components/motion/text-reveal";
import { FadeUp, SpotlightCard, Stagger, StaggerItem } from "@/components/motion/primitives";
import { RoleBoard, type RoleCard } from "./role-board";

export const metadata = pageMetadata({
  title: "Careers",
  description: `Careers at ${site.name}, Gurugram: open roles in engineering, design, marketing and sales, with full role descriptions and details on how to apply.`,
  path: "/careers",
});

const HOW_WE_WORK = [
  {
    Icon: Rocket,
    title: "Meaningful client work",
    body: "Every project is delivered for a client with a defined launch date, so your work reaches real users.",
  },
  {
    Icon: MessageSquare,
    title: "Direct client collaboration",
    body: "Project team members join client discussions and understand requirements first-hand.",
  },
  {
    Icon: Eye,
    title: "Weekly demonstrations",
    body: "Clients review progress on a live preview each week, which keeps feedback early and expectations aligned.",
  },
  {
    Icon: Wrench,
    title: "Quality and documentation",
    body: "Every change is reviewed before release and documented for long-term maintainability.",
  },
] as const;

const PROCESS = [
  {
    title: "Apply",
    body: `Email ${site.hrEmail} with your CV, links to your work and your notice period.`,
  },
  {
    title: "Introductory call",
    body: "A 20-minute conversation about your experience, your goals and the role.",
  },
  {
    title: "Practical task",
    body: "A short task that reflects the work of the role. Longer assignments are paid.",
  },
  {
    title: "Final conversation",
    body: "A discussion with your future colleagues to review your task and answer your questions.",
  },
  {
    title: "Offer",
    body: "A written offer setting out the role, compensation and start date.",
  },
] as const;

const FAQS = [
  {
    question: "Do you hire freshers?",
    answer:
      "Yes, through the Web Development Intern role. Candidates with strong work who are close to the experience listed for other roles are also encouraged to apply.",
  },
  {
    question: "Is the work remote?",
    answer: `Each listing states whether the role is on-site or hybrid. All roles are based at our MG Road office in Gurugram, open ${site.hours}, and hybrid office days are agreed on joining.`,
  },
  {
    question: "How is compensation decided?",
    answer:
      "Compensation is based on your experience and the scope of the role, and is discussed early in the interview process.",
  },
  {
    question: "What is the practical task?",
    answer:
      "A task that reflects the role, such as a small feature, a screen design or a campaign plan. Tasks take a few hours at most, and longer assignments are paid.",
  },
  {
    question: "What should I send with my application?",
    answer:
      "Please include your CV, links to your portfolio, GitHub, live sites or campaign results, your current location and your notice period, with a short note on why the role interests you.",
  },
  {
    question: "Can I apply for more than one role?",
    answer:
      "Yes. Please send a single email that names each role in the subject line and indicates your preference.",
  },
] as const;

export default function CareersPage() {
  const roles: RoleCard[] = jobs.map((job) => ({
    slug: job.slug,
    title: job.title,
    team: job.team,
    location: job.location,
    type: job.type,
    experience: job.experience,
    summary: job.summary,
    skills: job.skills,
  }));

  return (
    <>
      <PageHero
        eyebrow="Careers"
        title="Careers at Setuware Technologies"
        description={`Join a team of designers, developers, marketers and project managers building websites, e-commerce platforms, apps and business software from our office in ${site.address.city}.`}
      >
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ButtonLink
            href="#open-roles"
            size="lg"
            variant="ghost"
            className="rounded-full bg-setu font-semibold text-white hover:bg-setu-dark dark:hover:bg-setu-dark"
          >
            View {jobs.length} open roles
            <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
          <ButtonLink href={applyHref()} size="lg" variant="secondary" className="rounded-full">
            Email your CV
          </ButtonLink>
        </div>
        <dl className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border text-center sm:grid-cols-3">
          {[
            { label: "Open roles", value: String(jobs.length) },
            { label: "Office", value: `${site.address.street}, ${site.address.city}` },
            { label: "Office hours", value: site.hours },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-4 bg-surface/85 px-5 py-3 backdrop-blur sm:flex-col-reverse sm:justify-start sm:gap-1 sm:py-4"
            >
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {item.label}
              </dt>
              <dd className="text-right text-[0.95rem] font-semibold text-foreground sm:text-center sm:text-[0.98rem]">{item.value}</dd>
            </div>
          ))}
        </dl>
      </PageHero>

      <Section>
        <div className="container-page">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-setu">
                How we work
              </span>
              <TextReveal className="mt-4 font-display text-3xl font-semibold leading-[1.15] text-foreground sm:text-4xl">
                {"A collaborative, client-focused environment"}
              </TextReveal>
            </div>
            <FadeUp delay={0.15} y={20}>
              <p className="max-w-xl text-base leading-relaxed text-muted-foreground lg:justify-self-end">
                Every team member gains experience across the full project lifecycle, from scoping
                and delivery to long-term support.
              </p>
            </FadeUp>
          </div>

          <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_WE_WORK.map(({ Icon, title, body }) => (
              <StaggerItem key={title} className="h-full">
                <SpotlightCard
                  tilt={4}
                  className="h-full rounded-card border border-border bg-surface p-6 shadow-ambient"
                >
                  <span className="relative inline-flex size-11 items-center justify-center rounded-xl bg-setu/10 text-setu ring-1 ring-inset ring-setu/15">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="relative mt-5 text-[1.05rem] font-semibold text-foreground">{title}</h3>
                  <p className="relative mt-2 text-[0.92rem] leading-relaxed text-muted-foreground">
                    {body}
                  </p>
                </SpotlightCard>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Section>

      <Section id="open-roles" surface="subtle" className="scroll-mt-20">
        <div className="container-page">
          <SectionHeading
            align="left"
            eyebrow="Open roles"
            title="Current openings"
            description="All roles are based in Gurugram. Filter by team and select a role to view the full description."
          />

          <div className="mt-10">
            <RoleBoard roles={roles} teams={jobTeams} />
          </div>

          <FadeUp y={20} className="mt-8">
            <div className="flex flex-col gap-5 rounded-card border border-dashed border-setu/40 bg-surface p-6 md:flex-row md:items-center md:justify-between md:p-7">
              <div className="flex items-start gap-4">
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-setu/10 text-setu ring-1 ring-inset ring-setu/15">
                  <Mail className="size-5" aria-hidden />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Don&apos;t see your role?</h3>
                  <p className="mt-1 max-w-xl text-[0.94rem] leading-relaxed text-muted-foreground">
                    Send your CV to{" "}
                    <a
                      href={applyHref()}
                      className="font-medium text-foreground underline underline-offset-4 hover:text-setu"
                    >
                      {site.hrEmail}
                    </a>{" "}
                    with a brief introduction. We keep open applications on file and will contact you when
                    a suitable role becomes available.
                  </p>
                </div>
              </div>
              <ButtonLink
                href={applyHref()}
                variant="secondary"
                className="shrink-0 self-start rounded-full md:self-center"
              >
                Send an open application
                <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
            </div>
          </FadeUp>
        </div>
      </Section>

      <Section id="hiring-process" className="scroll-mt-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Hiring process"
            title="Five steps, no surprises"
            description="We tell you at each step what comes next. Nobody is asked to do unpaid work that takes more than a few hours."
          />
          <Stagger as="ol" className="relative mx-auto mt-14 grid max-w-6xl gap-4 md:grid-cols-5">
            <span
              aria-hidden
              className="pointer-events-none absolute left-[10%] right-[10%] top-[1.375rem] hidden h-px bg-gradient-to-r from-setu/0 via-setu/40 to-setu/0 md:block"
            />
            {PROCESS.map((step, index) => (
              <StaggerItem
                as="li"
                key={step.title}
                className="relative flex gap-4 md:flex-col md:items-center md:text-center"
              >
                <span className="relative z-10 inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-setu/30 bg-background font-mono text-sm font-semibold text-setu shadow-ambient">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="md:mt-2">
                  <h3 className="font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-1.5 break-words text-[0.9rem] leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Section>

      <Section surface="subtle">
        <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.4fr] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-setu">FAQs</span>
            <TextReveal className="mt-4 font-display text-3xl font-semibold leading-[1.15] text-foreground sm:text-4xl">
              {"Questions candidates ask"}
            </TextReveal>
            <FadeUp delay={0.2} y={20}>
              <p className="mt-4 max-w-sm text-[0.95rem] leading-relaxed text-muted-foreground">
                Anything else, write to{" "}
                <a
                  href={`mailto:${site.hrEmail}`}
                  className="font-medium text-setu underline-offset-4 hover:underline"
                >
                  {site.hrEmail}
                </a>
                .
              </p>
            </FadeUp>
          </div>
          <FadeUp y={24}>
            <Accordion items={FAQS} />
          </FadeUp>
        </div>
      </Section>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Careers", path: "/careers" },
        ])}
      />
      <JsonLd data={faqJsonLd(FAQS)} />
    </>
  );
}
