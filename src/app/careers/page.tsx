import {
  ArrowRight,
  Eye,
  FileText,
  FolderGit2,
  Mail,
  MapPin,
  MessageSquare,
  Rocket,
  Timer,
  Wrench,
} from "lucide-react";

import { applyHref, jobTeams } from "@/lib/careers";
import { getOpenJobs } from "@/lib/cms/public";
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
  title: "Careers in Gurugram: Developer & Design Jobs",
  description: `Careers at ${site.name}, Gurugram: open roles in engineering, design, marketing and sales, with full role descriptions and how to apply.`,
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

const APPLICATION_CHECKLIST = [
  { Icon: FileText, label: "Your CV", detail: "PDF format preferred, up to two pages." },
  {
    Icon: FolderGit2,
    label: "Links to your work",
    detail: "A portfolio, GitHub profile, live sites or campaign results.",
  },
  { Icon: Timer, label: "Notice period", detail: "Including your earliest available start date." },
  {
    Icon: MapPin,
    label: "Current location",
    detail: "And whether you would relocate to Gurugram.",
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

export default async function CareersPage() {
  const jobs = await getOpenJobs();
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
        video="careers"
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

      <Section surface="tint" aria-labelledby="why-heading">
        <div className="container-page">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-setu">
                Why work with us
              </span>
              <TextReveal
                as="h2"
                id="why-heading"
                className="mt-4 font-display text-3xl font-semibold leading-[1.15] text-foreground sm:text-4xl"
              >
                {"A collaborative, client-focused environment"}
              </TextReveal>
            </div>
            <FadeUp delay={0.15} y={20}>
              <p className="max-w-xl text-base leading-relaxed text-muted-foreground lg:justify-self-end">
                Every team member works across the full project lifecycle, from scoping and
                delivery to long-term support, alongside designers, developers and project
                managers.
              </p>
            </FadeUp>
          </div>

          <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_WE_WORK.map(({ Icon, title, body }) => (
              <StaggerItem key={title} className="h-full">
                <SpotlightCard
                  tilt={4}
                  className="h-full rounded-card border border-border bg-surface p-6 shadow-ambient md:p-7"
                >
                  <span className="relative inline-flex size-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(0,161,198,0.16),rgba(59,130,246,0.10))] text-setu ring-1 ring-inset ring-setu/20">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="relative mt-6 text-[1.05rem] font-semibold text-foreground">{title}</h3>
                  <p className="relative mt-2 text-[0.93rem] leading-relaxed text-muted-foreground">
                    {body}
                  </p>
                </SpotlightCard>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Section>

      <Section id="open-roles" className="scroll-mt-20">
        <div className="container-page">
          <SectionHeading
            align="left"
            eyebrow="Open roles"
            title="Current openings"
            description="All roles are based at our Gurugram office. Filter by team and select a role to read the full description."
          />

          <div className="mt-10">
            <RoleBoard roles={roles} teams={jobTeams} />
          </div>
        </div>
      </Section>

      <Section id="hiring-process" surface="dots" className="scroll-mt-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Hiring process"
            title="A clear, five-step process"
            description="We confirm the next step at every stage, and any task that requires more than a few hours is paid."
          />
          <Stagger as="ol" className="relative mx-auto mt-14 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <span
              aria-hidden
              className="pointer-events-none absolute left-[6%] right-[6%] top-[2.6rem] hidden h-px bg-gradient-to-r from-setu/0 via-setu/45 to-setu/0 lg:block"
            />
            {PROCESS.map((step, index) => (
              <StaggerItem
                as="li"
                key={step.title}
                className="relative flex h-full flex-col rounded-card border border-border bg-surface p-5 shadow-ambient md:p-6"
              >
                <span className="relative z-10 inline-flex size-10 items-center justify-center rounded-full bg-setu font-mono text-sm font-semibold text-white shadow-[0_0_0_6px_var(--color-surface)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1.5 break-words text-[0.9rem] leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Section>

      <Section surface="ink" aria-labelledby="apply-heading">
        <div className="container-page grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-16">
          <FadeUp y={20}>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-setu">Apply</span>
            <h2
              id="apply-heading"
              className="mt-4 font-display text-3xl font-semibold leading-[1.15] text-foreground sm:text-4xl"
            >
              Apply to join our team
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Email your application to{" "}
              <a
                href={applyHref()}
                className="font-semibold text-foreground underline decoration-setu/60 underline-offset-4 hover:text-setu"
              >
                {site.hrEmail}
              </a>{" "}
              with the role in the subject line. If no current opening matches your experience,
              send an open application and we will keep it on file for future roles.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink
                href={applyHref()}
                size="lg"
                variant="ghost"
                className="rounded-full bg-setu font-semibold text-white hover:bg-setu-dark dark:hover:bg-setu-dark"
              >
                <Mail className="size-4" aria-hidden />
                Email your CV
              </ButtonLink>
              <ButtonLink href="#open-roles" size="lg" variant="secondary" className="rounded-full">
                View open roles
              </ButtonLink>
            </div>
          </FadeUp>

          <FadeUp y={20} delay={0.1}>
            <div className="rounded-card border border-white/10 bg-white/[0.04] p-6 backdrop-blur md:p-8">
              <h3 className="text-lg font-semibold text-foreground">What to include</h3>
              <ul className="mt-5 flex flex-col gap-4">
                {APPLICATION_CHECKLIST.map(({ Icon, label, detail }) => (
                  <li key={label} className="flex gap-4">
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-setu/15 text-setu ring-1 ring-inset ring-setu/25">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span className="text-[0.93rem] leading-snug">
                      <span className="block font-medium text-foreground">{label}</span>
                      <span className="mt-0.5 block text-muted-foreground">{detail}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeUp>
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
                For any other questions, email{" "}
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
