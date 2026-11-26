import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Check,
  ChevronRight,
  Clock,
  ListChecks,
  Mail,
  MapPin,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";

import {
  applyHref,
  compensationNote,
  jobMetaTitle,
  jobMetaDescription,
  jobPostingJsonLd,
  whatWeOffer,
} from "@/lib/careers";
import { getOpenJob, getOpenJobs } from "@/lib/cms/public";
import { ApplyForm } from "@/components/interactive/apply-form";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { JsonLd } from "@/components/seo/json-ld";
import { FadeUp, Stagger, StaggerItem } from "@/components/motion/primitives";
import { BLUE_GRADIENT, CircuitLines, Eyebrow } from "@/components/sections/home/shared";
import { RoleRow } from "../role-row";

export async function generateStaticParams() {
  return (await getOpenJobs()).map((job) => ({ slug: job.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await getOpenJob(slug);
  if (!job) {
    return pageMetadata({ title: "Role not found", description: "", path: "/careers", noIndex: true });
  }

  return pageMetadata({
    title: jobMetaTitle(job),
    description: jobMetaDescription(job),
    path: `/careers/${job.slug}`,
  });
}

export default async function Role({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await getOpenJob(slug);
  if (!job) notFound();
  const jobs = await getOpenJobs();

  const others = [
    ...jobs.filter((other) => other.slug !== job.slug && other.team === job.team),
    ...jobs.filter((other) => other.slug !== job.slug && other.team !== job.team),
  ].slice(0, 3);

  const facts = [
    { Icon: Users, label: "Team", value: job.team },
    { Icon: MapPin, label: "Location", value: job.location },
    { Icon: Briefcase, label: "Type", value: job.type },
    { Icon: Clock, label: "Experience", value: job.experience },
  ] as const;

  return (
    <>
      <section className="relative isolate overflow-hidden bg-[#0b0f2a] pb-16 pt-32 text-white md:pb-20 md:pt-40">
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60rem_30rem_at_85%_0%,rgba(47,86,216,0.4),transparent),radial-gradient(40rem_24rem_at_0%_100%,rgba(59,108,246,0.22),transparent)]" />
        <CircuitLines className="absolute -right-10 top-10 -z-10 w-[34rem] text-[#3b6cf6]/30" />

        <div className="container-figma">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-white/60">
              <li>
                <Link href="/" className="transition-colors hover:text-white">Home</Link>
              </li>
              <li aria-hidden><ChevronRight className="size-3.5" /></li>
              <li>
                <Link href="/careers" className="transition-colors hover:text-white">Careers</Link>
              </li>
              <li aria-hidden><ChevronRight className="size-3.5" /></li>
              <li aria-current="page" className="truncate text-white/90">{job.shortTitle ?? job.title}</li>
            </ol>
          </nav>

          <FadeUp immediate y={24} className="mt-8 max-w-3xl">
            <Eyebrow light>
              {job.team} · {job.type}
            </Eyebrow>
            <h1 className="mt-4 text-[2.1rem] font-bold leading-[1.1] tracking-[-0.02em] sm:text-5xl">{job.title}</h1>
            <p className="mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-white/75">{job.summary}</p>
          </FadeUp>

          <FadeUp immediate delay={0.12} y={20}>
            <dl className="mt-10 grid max-w-4xl grid-cols-2 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur sm:grid-cols-4">
              {facts.map(({ Icon, label, value }) => (
                <div key={label} className="flex flex-col-reverse gap-1 border-white/10 p-4 [&:not(:last-child)]:border-r max-sm:[&:nth-child(2)]:border-r-0 max-sm:[&:nth-child(-n+2)]:border-b sm:p-5">
                  <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/55">
                    <Icon className="size-3.5 text-[#9db4ff]" aria-hidden />
                    {label}
                  </dt>
                  <dd className="text-[0.98rem] font-semibold text-white">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="#apply"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[linear-gradient(110deg,#3b6cf6,#1d4ed8)] px-7 text-sm font-semibold text-white transition-[filter] hover:brightness-110"
              >
                Apply for this role
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
              <a
                href={applyHref(job)}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/30 px-7 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-[#0f1330]"
              >
                <Mail className="size-4" aria-hidden />
                Apply by email
              </a>
            </div>
          </FadeUp>
        </div>
      </section>

      <section className="bg-[#f5f7fd] py-16 dark:bg-background md:py-24">
        <div className="container-figma grid gap-10 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:gap-12">
          <div className="flex min-w-0 flex-col gap-6">
            <RoleList title="What you will do" Icon={ListChecks} items={job.responsibilities} marker="number" />
            <RoleList title="What we are looking for" Icon={BadgeCheck} items={job.requirements} marker="check" />
            {job.niceToHaves.length > 0 ? (
              <RoleList title="Good to have" Icon={Sparkles} items={job.niceToHaves} marker="plus" />
            ) : null}

            {job.skills.length > 0 ? (
              <FadeUp y={20}>
                <div className="rounded-2xl border border-[#e3e8f5] bg-white p-6 dark:border-white/10 dark:bg-surface md:p-8">
                  <h2 className="text-xl font-bold text-[#0f1330] dark:text-white">Tools you will use</h2>
                  <ul className="mt-5 flex flex-wrap gap-2" aria-label="Key skills">
                    {job.skills.map((skill) => (
                      <li key={skill} className="rounded-full border border-[#2f56d8]/20 bg-[#2f56d8]/[0.06] px-3.5 py-1.5 text-sm font-medium text-[#1d4ed8] dark:text-[#9db4ff]">
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeUp>
            ) : null}

            <FadeUp y={24}>
              <div className={`relative isolate overflow-hidden rounded-2xl ${BLUE_GRADIENT} p-6 text-white md:p-8`}>
                <CircuitLines className="absolute -right-16 -top-10 -z-10 w-[24rem] text-white/15" />
                <h2 className="text-xl font-bold">What we offer</h2>
                <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                  {whatWeOffer.map((item) => (
                    <li key={item} className="flex gap-3 text-[0.94rem] leading-relaxed text-white/90">
                      <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                        <Check className="size-3" aria-hidden />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 border-t border-white/20 pt-5 text-[0.94rem] font-medium">{compensationNote}</p>
              </div>
            </FadeUp>

            <FadeUp y={24}>
              <div className="rounded-2xl border border-[#e3e8f5] bg-white p-6 dark:border-white/10 dark:bg-surface md:p-8">
                <h2 className="text-xl font-bold text-[#0f1330] dark:text-white">How hiring works</h2>
                <ol className="mt-6 grid gap-5 sm:grid-cols-4">
                  {HIRING_STEPS.map((step, index) => (
                    <li key={step.title} className="relative">
                      <span className="inline-flex size-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#3b6cf6,#1d4ed8)] text-sm font-bold text-white">
                        {index + 1}
                      </span>
                      <p className="mt-3 font-semibold text-[#0f1330] dark:text-white">{step.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-[#5a6180] dark:text-white/65">{step.body}</p>
                    </li>
                  ))}
                </ol>
                <Link href="/careers#hiring-process" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#2f56d8] hover:underline dark:text-[#9db4ff]">
                  Full hiring process
                  <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              </div>
            </FadeUp>
          </div>

          <aside id="apply" className="scroll-mt-24 lg:sticky lg:top-24 lg:self-start" aria-labelledby="apply-heading">
            <div className="relative overflow-hidden rounded-2xl border border-[#e3e8f5] bg-white p-6 shadow-[0_30px_60px_-36px_rgba(15,19,48,0.45)] dark:border-white/10 dark:bg-surface md:p-7">
              <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#3b6cf6,#1d4ed8)]" />
              <h2 id="apply-heading" className="text-xl font-bold text-[#0f1330] dark:text-white">
                Apply for this role
              </h2>
              <p className="mt-2 text-[0.92rem] leading-relaxed text-[#5a6180] dark:text-white/65">
                Takes about two minutes. We reply to every application within five working days.
              </p>

              <ApplyForm jobSlug={job.slug} jobTitle={job.title} />

              <p className="mt-4 text-center text-xs text-[#5a6180] dark:text-white/60">
                Prefer email?{" "}
                <a href={applyHref(job)} className="font-semibold text-[#2f56d8] underline-offset-4 hover:underline dark:text-[#9db4ff]">
                  {site.hrEmail}
                </a>
              </p>

              <dl className="mt-6 flex flex-col gap-2 border-t border-[#e3e8f5] pt-5 text-[0.85rem] dark:border-white/10">
                <div className="flex justify-between gap-4">
                  <dt className="text-[#5a6180] dark:text-white/60">Office</dt>
                  <dd className="text-right font-semibold text-[#0f1330] dark:text-white">
                    {site.address.street}, {site.address.city}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[#5a6180] dark:text-white/60">Office hours</dt>
                  <dd className="text-right font-semibold text-[#0f1330] dark:text-white">{site.hours}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </section>

      {others.length > 0 ? (
        <section className="bg-white py-16 dark:bg-surface md:py-20">
          <div className="container-figma">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <Eyebrow>Keep exploring</Eyebrow>
                <h2 className="mt-3 text-2xl font-bold text-[#0f1330] dark:text-white sm:text-3xl">Other open roles</h2>
              </div>
              <Link href="/careers#open-roles" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#2f56d8] dark:text-[#9db4ff]">
                All open roles
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </div>
            <Stagger as="ul" className="mt-8 flex flex-col gap-3">
              {others.map((other) => (
                <StaggerItem as="li" key={other.slug}>
                  <RoleRow role={other} compact />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      ) : null}

      <JsonLd data={jobPostingJsonLd(job)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Careers", path: "/careers" },
          { name: job.title, path: `/careers/${job.slug}` },
        ])}
      />
    </>
  );
}

const HIRING_STEPS = [
  { title: "Apply", body: "CV and links to your work." },
  { title: "Intro call", body: "20 minutes on the role." },
  { title: "Short task", body: "Longer assignments are paid." },
  { title: "Offer", body: "In writing, with start date." },
] as const;

function RoleList({
  title,
  Icon,
  items,
  marker,
}: {
  title: string;
  Icon: typeof Check;
  items: readonly string[];
  marker: "number" | "check" | "plus";
}) {
  return (
    <FadeUp y={20}>
      <section className="rounded-2xl border border-[#e3e8f5] bg-white p-6 dark:border-white/10 dark:bg-surface md:p-8">
        <h2 className="flex items-center gap-3 text-xl font-bold text-[#0f1330] dark:text-white">
          <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[#2f56d8]/10 text-[#2f56d8] dark:text-[#9db4ff]">
            <Icon className="size-5" aria-hidden />
          </span>
          {title}
        </h2>
        <ul className="mt-6 flex flex-col gap-4">
          {items.map((item, index) => (
            <li key={item} className="flex gap-4">
              <span
                className={
                  marker === "number"
                    ? "inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#3b6cf6,#1d4ed8)] text-xs font-bold text-white"
                    : "inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-[#2f56d8]/10 text-[#2f56d8] dark:text-[#9db4ff]"
                }
                aria-hidden
              >
                {marker === "number" ? index + 1 : marker === "check" ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
              </span>
              <span className="pt-0.5 text-[0.98rem] leading-relaxed text-[#3b4262] dark:text-white/80">{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </FadeUp>
  );
}
