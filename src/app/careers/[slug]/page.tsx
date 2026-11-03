import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Check,
  Clock,
  FileText,
  FolderGit2,
  Mail,
  MapPin,
  Plus,
  Timer,
  Users,
} from "lucide-react";

import {
  applyHref,
  compensationNote,
  getJob,
  jobMetaTitle,
  jobMetaDescription,
  jobPostingJsonLd,
  jobs,
  whatWeOffer,
  type Job,
} from "@/lib/careers";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { ButtonLink } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { JsonLd } from "@/components/seo/json-ld";
import { HeroBackdrop } from "@/components/interactive/hero-backdrop";
import { heroBackdropPoster, heroBackdropSources } from "@/lib/media";
import { FadeUp, Stagger, StaggerItem } from "@/components/motion/primitives";

export function generateStaticParams() {
  return jobs.map((job) => ({ slug: job.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = getJob(slug);
  if (!job) {
    return pageMetadata({ title: "Role not found", description: "", path: "/careers", noIndex: true });
  }

  return pageMetadata({
    title: jobMetaTitle(job),
    description: jobMetaDescription(job),
    path: `/careers/${job.slug}`,
  });
}

/**
 * `params` is read inside a Suspense boundary so navigations render the shell
 * instantly. Every listed role is prerendered by `generateStaticParams`, and
 * the proxy answers unknown slugs with a real 404.
 */
export default function RolePage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" aria-busy="true" />}>
      <Role params={params} />
    </Suspense>
  );
}

const APPLICATION_CHECKLIST = [
  { Icon: FileText, label: "Your CV", detail: "PDF format preferred, up to two pages." },
  {
    Icon: FolderGit2,
    label: "Portfolio, GitHub or live work",
    detail: "Links to your work, with a note on your contribution.",
  },
  { Icon: Timer, label: "Notice period", detail: "Including your earliest available start date." },
  { Icon: MapPin, label: "Current location", detail: "And whether you would relocate to Gurugram." },
] as const;

async function Role({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = getJob(slug);
  if (!job) notFound();

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
      <section className="relative overflow-hidden border-b border-border pb-14 pt-28 md:pt-36">
        <HeroBackdrop sources={heroBackdropSources()} poster={heroBackdropPoster()} />
        <div className="pointer-events-none absolute inset-0 bg-mesh opacity-50" aria-hidden />

        <div className="container-page relative">
          <Link
            href="/careers#open-roles"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
            All open roles
          </Link>

          <FadeUp immediate y={24} className="mt-6 max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-setu">
              {job.team} · {job.type}
            </span>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.08] text-foreground sm:text-5xl">
              {job.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {job.summary}
            </p>
          </FadeUp>

          <FadeUp immediate delay={0.12} y={20}>
            <dl className="mt-8 flex flex-wrap gap-2.5">
              {facts.map(({ Icon, label, value }) => (
                <div
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/85 px-3.5 py-1.5 text-[0.86rem] backdrop-blur"
                >
                  <Icon className="size-3.5 text-setu" aria-hidden />
                  <dt className="sr-only">{label}</dt>
                  <dd className="font-medium text-foreground">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink
                href={applyHref(job)}
                size="lg"
                variant="ghost"
                className="rounded-full bg-setu font-semibold text-white hover:bg-setu-dark dark:hover:bg-setu-dark"
              >
                Apply for this role
                <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
              <p className="text-sm text-muted-foreground">
                Opens an email to{" "}
                <span className="font-medium text-foreground">{site.hrEmail}</span>
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      <Section className="py-16 md:py-24">
        <div className="container-page grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
          <div className="flex min-w-0 flex-col gap-14">
            <RoleList title="Responsibilities" items={job.responsibilities} marker="number" />
            <RoleList title="Requirements" items={job.requirements} marker="check" />
            <RoleList title="Preferred qualifications" items={job.niceToHaves} marker="plus" />

            <FadeUp y={24}>
              <div className="rounded-card border border-border bg-[linear-gradient(180deg,#f6f9fc_0%,#ffffff_100%)] p-6 dark:bg-[linear-gradient(180deg,#0b0e18_0%,#070910_100%)] md:p-8">
                <h2 className="text-2xl font-semibold text-foreground">What we offer</h2>
                <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                  {whatWeOffer.map((item) => (
                    <li key={item} className="flex gap-3 text-[0.94rem] leading-relaxed text-foreground/85">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-setu" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 border-t border-border pt-5 text-[0.94rem] font-medium text-foreground">
                  {compensationNote}
                </p>
              </div>
            </FadeUp>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start" aria-labelledby="apply-heading">
            <div className="relative overflow-hidden rounded-card border border-border bg-surface p-6 shadow-ambient md:p-7">
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#00a1c6,#3b82f6)]"
              />
              <h2 id="apply-heading" className="text-xl font-semibold text-foreground">
                Apply for this role
              </h2>
              <p className="mt-2 text-[0.92rem] leading-relaxed text-muted-foreground">
                Email{" "}
                <a
                  href={applyHref(job)}
                  className="font-medium text-foreground underline decoration-setu/50 underline-offset-4 hover:text-setu"
                >
                  {site.hrEmail}
                </a>{" "}
                with the role in the subject line. Please include:
              </p>

              <ul className="mt-5 flex flex-col gap-4">
                {APPLICATION_CHECKLIST.map(({ Icon, label, detail }) => (
                  <li key={label} className="flex gap-3">
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-setu/10 text-setu ring-1 ring-inset ring-setu/15">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span className="text-[0.9rem] leading-snug">
                      <span className="block font-medium text-foreground">{label}</span>
                      <span className="text-muted-foreground">{detail}</span>
                    </span>
                  </li>
                ))}
              </ul>

              <ButtonLink
                href={applyHref(job)}
                block
                variant="ghost"
                className="mt-6 rounded-full bg-setu font-semibold text-white hover:bg-setu-dark dark:hover:bg-setu-dark"
              >
                <Mail className="size-4" aria-hidden />
                Apply by email
              </ButtonLink>

              <dl className="mt-6 flex flex-col gap-2 border-t border-border pt-5 text-[0.85rem]">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Office</dt>
                  <dd className="text-right font-medium text-foreground">
                    {site.address.street}, {site.address.city}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Office hours</dt>
                  <dd className="text-right font-medium text-foreground">{site.hours}</dd>
                </div>
              </dl>
            </div>

            <p className="mt-4 px-1 text-[0.85rem] leading-relaxed text-muted-foreground">
              The process includes an introductory call, a short task and a final conversation.{" "}
              <Link href="/careers#hiring-process" className="font-medium text-setu underline-offset-4 hover:underline">
                View the hiring process
              </Link>
              .
            </p>
          </aside>
        </div>
      </Section>

      {others.length > 0 ? (
        <Section surface="tint" className="py-16 md:py-20">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">Other open roles</h2>
              <Link
                href="/careers#open-roles"
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-setu"
              >
                <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden />
                Back to all roles
              </Link>
            </div>
            <Stagger as="ul" className="mt-8 grid gap-4 md:grid-cols-3">
              {others.map((other) => (
                <StaggerItem as="li" key={other.slug} className="h-full">
                  <OtherRole job={other} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </Section>
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

function RoleList({
  title,
  items,
  marker,
}: {
  title: string;
  items: readonly string[];
  marker: "number" | "check" | "plus";
}) {
  return (
    <section>
      <FadeUp y={20}>
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
      </FadeUp>
      <Stagger as="ul" stagger={0.05} className="mt-6 flex flex-col divide-y divide-border border-y border-border">
        {items.map((item, index) => (
          <StaggerItem as="li" key={item} y={16} className="flex gap-4 py-4">
            <span
              className={
                marker === "number"
                  ? "inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-setu/12 font-mono text-xs font-semibold text-setu"
                  : "inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground/[0.05] text-setu"
              }
              aria-hidden
            >
              {marker === "number" ? (
                String(index + 1).padStart(2, "0")
              ) : marker === "check" ? (
                <Check className="size-3.5" />
              ) : (
                <Plus className="size-3.5" />
              )}
            </span>
            <span className="pt-0.5 text-[0.98rem] leading-relaxed text-foreground/85">{item}</span>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

function OtherRole({ job }: { job: Job }) {
  return (
    <Link
      href={`/careers/${job.slug}`}
      className="group flex h-full flex-col rounded-card border border-border bg-surface p-5 transition-[transform,border-color,box-shadow] duration-300 hover:border-setu/50 hover:shadow-glow motion-safe:hover:-translate-y-0.5"
    >
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-setu">{job.team}</span>
      <span className="mt-2 font-semibold leading-snug text-foreground group-hover:text-setu">
        {job.title}
      </span>
      <span className="mt-2 text-[0.84rem] text-muted-foreground">
        {job.location} · {job.type} · {job.experience}
      </span>
      <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-setu">
        View role
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
    </Link>
  );
}
