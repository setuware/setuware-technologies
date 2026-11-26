import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  ClipboardCheck,
  Code2,
  FileText,
  FolderGit2,
  Handshake,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Presentation,
  Send,
  Timer,
  UserCheck,
  Users,
} from "lucide-react";

import { applyHref, compensationNote, jobTeams, whatWeOffer } from "@/lib/careers";
import { getOpenJobs } from "@/lib/cms/public";
import { breadcrumbJsonLd, faqJsonLd, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { ButtonLink } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { JsonLd } from "@/components/seo/json-ld";
import { PageHero } from "@/components/layout/page-hero";
import { FadeUp, Stagger, StaggerItem } from "@/components/motion/primitives";
import { BLUE_GRADIENT, CircuitLines, Eyebrow, SectionTitle } from "@/components/sections/home/shared";
import { RoleBoard, type RoleCard } from "./role-board";

export const metadata = pageMetadata({
  title: "Careers in Gurugram: Developer & Design Jobs",
  description: `Careers at ${site.name}, Gurugram: open roles in engineering, design, marketing and sales, with full role descriptions and how to apply.`,
  path: "/careers",
});

const LIFE_POINTS = [
  "Client projects with a defined launch date, used by real customers",
  "A seat in client calls, so you hear requirements first-hand",
  "Weekly demos on a live preview, with feedback early",
  "Code review on every change, and documentation that lasts",
] as const;

const OFFER_ICONS = [ClipboardCheck, Presentation, UserCheck, Code2, BookOpen, Handshake] as const;

const APPLICATION_CHECKLIST = [
  { Icon: FileText, label: "Your CV", detail: "PDF preferred, up to two pages." },
  { Icon: FolderGit2, label: "Links to your work", detail: "Portfolio, GitHub, live sites or campaign results." },
  { Icon: Timer, label: "Notice period", detail: "And your earliest start date." },
  { Icon: MapPin, label: "Current location", detail: "And whether you would relocate to Gurugram." },
] as const;

const PROCESS = [
  { Icon: Send, title: "Apply", body: "Send your CV and links to your work from the role page or by email." },
  { Icon: Phone, title: "Introductory call", body: "20 minutes on your experience, your goals and the role." },
  { Icon: Code2, title: "Practical task", body: "A short task based on the role. Longer assignments are paid." },
  { Icon: Users, title: "Team conversation", body: "Review your task with your future colleagues and ask questions." },
  { Icon: MessageSquare, title: "Offer", body: "A written offer with the role, compensation and start date." },
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
  const teamCount = new Set(roles.map((role) => role.team)).size;

  return (
    <>
      <PageHero
        video="careers"
        eyebrow="Careers"
        title="Build products that real businesses use"
        description={`Join our designers, developers, marketers and project managers in ${site.address.city}, working on websites, e-commerce, apps and business software for clients across India.`}
      >
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ButtonLink
            href="#open-roles"
            size="lg"
            variant="ghost"
            className="rounded-full bg-[linear-gradient(110deg,#3b6cf6,#1d4ed8)] font-semibold text-white hover:brightness-110"
          >
            View {roles.length} open {roles.length === 1 ? "role" : "roles"}
            <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
          <ButtonLink href={applyHref()} size="lg" variant="secondary" className="rounded-full">
            Send your CV
          </ButtonLink>
        </div>
        <dl className="mx-auto mt-10 grid max-w-3xl grid-cols-3 divide-x divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] text-center backdrop-blur">
          {[
            { label: "Open roles", value: String(roles.length) },
            { label: teamCount === 1 ? "Team hiring" : "Teams hiring", value: String(teamCount) },
            { label: "Office", value: site.address.city },
          ].map((item) => (
            <div key={item.label} className="flex flex-col-reverse gap-1 px-3 py-4">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/60">{item.label}</dt>
              <dd className="text-lg font-bold text-white sm:text-xl">{item.value}</dd>
            </div>
          ))}
        </dl>
      </PageHero>

      {/* Life at Setuware */}
      <section aria-labelledby="life-heading" className="relative overflow-hidden bg-white py-20 dark:bg-surface lg:py-28">
        <div className="container-figma grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          <FadeUp className="relative mx-auto w-full max-w-[36rem] pb-16 pr-10 lg:mx-0">
            <div aria-hidden className="absolute -left-6 -top-6 size-40 rounded-3xl bg-[radial-gradient(#2f56d8_1.5px,transparent_1.5px)] [background-size:14px_14px] opacity-30" />
            <div className="relative aspect-[4/3.4] overflow-hidden rounded-3xl shadow-[0_30px_60px_-30px_rgba(15,19,48,0.5)]">
              <Image src="/images/team/team-workshop.jpg" alt="Setuware team members reviewing a project together" fill sizes="(min-width: 1024px) 36rem, 92vw" className="object-cover" />
            </div>
            <div className="absolute bottom-0 right-0 w-[52%] overflow-hidden rounded-2xl border-[6px] border-white shadow-[0_24px_50px_-20px_rgba(15,19,48,0.55)] dark:border-surface">
              <div className="relative aspect-[4/3]">
                <Image src="/images/team/team-laptop.jpg" alt="A developer working on a client build" fill sizes="(min-width: 1024px) 18rem, 46vw" className="object-cover" />
              </div>
            </div>
            <div className="absolute bottom-6 left-6 rounded-2xl bg-[linear-gradient(135deg,#3b6cf6,#1d4ed8)] px-6 py-5 text-white shadow-[0_20px_40px_-18px_rgba(29,78,216,0.9)]">
              <p className="text-3xl font-extrabold leading-none">{roles.length}</p>
              <p className="mt-1.5 text-xs font-medium text-white/85">Open {roles.length === 1 ? "role" : "roles"} right now</p>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <Eyebrow>Life at Setuware</Eyebrow>
            <SectionTitle>
              <span id="life-heading">
                Real client work, <span className="text-[#2f56d8] dark:text-[#7c9bff]">from brief to launch</span>
              </span>
            </SectionTitle>
            <p className="mt-5 max-w-[34rem] text-[1.02rem] leading-relaxed text-[#5a6180] dark:text-white/70">
              Everyone here works across the full project, from scoping and design to delivery and
              support, in small teams with a project manager who keeps the plan clear.
            </p>
            <ul className="mt-8 grid gap-3.5">
              {LIFE_POINTS.map((point) => (
                <li key={point} className="flex gap-3 text-[0.98rem] font-medium text-[#0f1330] dark:text-white/90">
                  <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-[#2f56d8]/12 text-[#2f56d8] dark:text-[#9db4ff]">
                    <Check className="size-3.5" aria-hidden />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <Link
              href="#open-roles"
              className="group mt-9 inline-flex h-12 items-center gap-2 rounded-full bg-[linear-gradient(110deg,#3b6cf6,#1d4ed8)] px-7 text-sm font-semibold text-white transition-[filter] hover:brightness-110"
            >
              See current openings
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* Open roles */}
      <section id="open-roles" aria-labelledby="roles-heading" className="scroll-mt-20 bg-[#f5f7fd] py-20 dark:bg-background lg:py-28">
        <div className="container-figma">
          <FadeUp className="max-w-[44rem]">
            <Eyebrow>Open roles</Eyebrow>
            <SectionTitle>
              <span id="roles-heading">Current openings</span>
            </SectionTitle>
            <p className="mt-4 text-[1.02rem] leading-relaxed text-[#5a6180] dark:text-white/70">
              All roles are based at our {site.address.street} office in {site.address.city}. Pick a
              role to read the full description and apply in about two minutes.
            </p>
          </FadeUp>

          <div className="mt-10">
            {roles.length > 0 ? (
              <RoleBoard roles={roles} teams={jobTeams} />
            ) : (
              <p className="rounded-2xl border border-dashed border-[#c9d4f5] bg-white p-8 text-center text-[#5a6180] dark:border-white/15 dark:bg-surface dark:text-white/70">
                There are no open roles right now. Send an open application to{" "}
                <a href={applyHref()} className="font-semibold text-[#2f56d8] underline-offset-4 hover:underline">
                  {site.hrEmail}
                </a>{" "}
                and we will keep it on file.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* What we offer */}
      <section aria-labelledby="offer-heading" className="relative isolate overflow-hidden bg-[#0b0f2a] py-20 text-white lg:py-28">
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60rem_30rem_at_85%_0%,rgba(47,86,216,0.35),transparent),radial-gradient(40rem_24rem_at_0%_100%,rgba(59,108,246,0.22),transparent)]" />
        <CircuitLines className="absolute -left-10 top-8 -z-10 w-[30rem] text-[#3b6cf6]/30" />
        <div className="container-figma grid gap-14 lg:grid-cols-[0.9fr_1.4fr] lg:gap-20">
          <FadeUp>
            <Eyebrow light>What we offer</Eyebrow>
            <SectionTitle light>
              <span id="offer-heading">
                Room to grow, <span className="text-[#7c9bff]">with support around you</span>
              </span>
            </SectionTitle>
            <p className="mt-5 max-w-[30rem] text-[1.02rem] leading-relaxed text-white/70">{compensationNote}</p>
            <a
              href={applyHref()}
              className="group mt-9 inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-[#0f1330] transition-colors hover:bg-[#e8eeff]"
            >
              <Mail className="size-4" aria-hidden />
              Send your CV
            </a>
          </FadeUp>

          <Stagger className="grid gap-4 sm:grid-cols-2">
            {whatWeOffer.map((item, i) => {
              const Icon = OFFER_ICONS[i % OFFER_ICONS.length];
              return (
                <StaggerItem key={item}>
                  <div className="group flex h-full gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm transition-colors duration-300 hover:border-[#3b6cf6]/60 hover:bg-[#2f56d8]/15">
                    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#2f56d8]/20 text-[#9db4ff] transition-colors group-hover:bg-[#2f56d8] group-hover:text-white">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <p className="text-[0.95rem] leading-relaxed text-white/80">{item}</p>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* Hiring process */}
      <section id="hiring-process" aria-labelledby="process-heading" className="scroll-mt-20 bg-white py-20 dark:bg-surface lg:py-28">
        <div className="container-figma">
          <FadeUp className="mx-auto max-w-[44rem] text-center">
            <Eyebrow className="justify-center">Hiring process</Eyebrow>
            <SectionTitle>
              <span id="process-heading">
                Five steps, <span className="text-[#2f56d8] dark:text-[#7c9bff]">no surprises</span>
              </span>
            </SectionTitle>
            <p className="mt-4 text-[1.02rem] leading-relaxed text-[#5a6180] dark:text-white/70">
              We confirm the next step at every stage and reply to every application within five
              working days.
            </p>
          </FadeUp>

          <Stagger as="ol" className="relative mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
            <div aria-hidden className="absolute left-[10%] right-[10%] top-8 hidden border-t-2 border-dashed border-[#c9d4f5] dark:border-white/15 lg:block" />
            {PROCESS.map(({ Icon, title, body }, i) => (
              <StaggerItem as="li" key={title} className="relative text-center">
                <div className="relative mx-auto inline-flex size-16 items-center justify-center rounded-full border-[5px] border-white bg-[linear-gradient(135deg,#3b6cf6,#1d4ed8)] text-white shadow-[0_14px_30px_-12px_rgba(29,78,216,0.8)] dark:border-surface">
                  <Icon className="size-6" aria-hidden />
                  <span className="absolute -right-2 -top-1 inline-flex size-7 items-center justify-center rounded-full bg-white text-xs font-bold text-[#2f56d8] shadow ring-1 ring-[#2f56d8]/20 dark:bg-surface dark:text-[#9db4ff]">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-[1.08rem] font-bold text-[#0f1330] dark:text-white">{title}</h3>
                <p className="mx-auto mt-2 max-w-[15rem] text-sm leading-relaxed text-[#5a6180] dark:text-white/65">{body}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Open application */}
      <section aria-labelledby="apply-heading" className="bg-white pb-20 dark:bg-surface lg:pb-28">
        <div className="container-figma">
          <FadeUp>
            <div className={`relative isolate overflow-hidden rounded-[2rem] ${BLUE_GRADIENT} p-8 text-white sm:p-12 lg:p-14`}>
              <CircuitLines className="absolute -right-10 -top-6 -z-10 w-[30rem] text-white/15" />
              <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-14">
                <div>
                  <Eyebrow light>Open application</Eyebrow>
                  <h2 id="apply-heading" className="mt-3 text-[1.9rem] font-bold leading-[1.15] tracking-[-0.02em] sm:text-[2.4rem]">
                    Don&apos;t see the right role?
                  </h2>
                  <p className="mt-4 max-w-xl text-[1.02rem] leading-relaxed text-white/80">
                    Email{" "}
                    <a href={applyHref()} className="font-semibold text-white underline decoration-white/50 underline-offset-4 hover:decoration-white">
                      {site.hrEmail}
                    </a>{" "}
                    with the kind of work you want to do. We keep every application on file and
                    contact you when a matching role opens.
                  </p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <a
                      href={applyHref()}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-[#1d4ed8] transition-colors hover:bg-[#e8eeff]"
                    >
                      <Mail className="size-4" aria-hidden />
                      Send an open application
                    </a>
                    <Link
                      href="#open-roles"
                      className="inline-flex h-12 items-center justify-center rounded-full border border-white/40 px-7 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                    >
                      View open roles
                    </Link>
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-6 text-[#0f1330] shadow-[0_30px_60px_-30px_rgba(15,19,48,0.6)] sm:p-7">
                  <h3 className="text-lg font-bold">What to include</h3>
                  <ul className="mt-5 grid gap-4">
                    {APPLICATION_CHECKLIST.map(({ Icon, label, detail }) => (
                      <li key={label} className="flex gap-4">
                        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#2f56d8]/10 text-[#2f56d8]">
                          <Icon className="size-4" aria-hidden />
                        </span>
                        <span className="text-[0.93rem] leading-snug">
                          <span className="block font-semibold">{label}</span>
                          <span className="mt-0.5 block text-[#5a6180]">{detail}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-heading" className="bg-[#f5f7fd] py-20 dark:bg-background lg:py-28">
        <div className="container-figma grid gap-10 lg:grid-cols-[0.8fr_1.4fr] lg:gap-16">
          <FadeUp className="lg:sticky lg:top-24 lg:self-start">
            <Eyebrow>FAQs</Eyebrow>
            <SectionTitle>
              <span id="faq-heading">Questions candidates ask</span>
            </SectionTitle>
            <p className="mt-4 max-w-sm text-[0.98rem] leading-relaxed text-[#5a6180] dark:text-white/70">
              Anything else? Email{" "}
              <a href={`mailto:${site.hrEmail}`} className="font-semibold text-[#2f56d8] underline-offset-4 hover:underline dark:text-[#9db4ff]">
                {site.hrEmail}
              </a>
              .
            </p>
          </FadeUp>
          <FadeUp y={24}>
            <Accordion items={FAQS} />
          </FadeUp>
        </div>
      </section>

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
