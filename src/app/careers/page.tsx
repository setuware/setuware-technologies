import { ArrowRight, Code2, Eye, Layers, MessageSquare, Palette, Rocket, TrendingUp, Wrench } from "lucide-react";

import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { JsonLd } from "@/components/seo/json-ld";
import { PageHero } from "@/components/layout/page-hero";

export const metadata = pageMetadata({
  title: "Careers",
  description: `Work at ${site.name} in Gurugram: websites, apps and business software for Indian companies. Roles are posted on this page, and open applications are always read.`,
  path: "/careers",
});

const REASONS = [
  {
    Icon: Rocket,
    title: "Your work goes live",
    body: "Everything we build is for a paying client with a launch date. You see it used, and you hear when it breaks.",
  },
  {
    Icon: MessageSquare,
    title: "You talk to the client",
    body: "No account-manager layer. The people building the project join the calls and hear the problem first-hand.",
  },
  {
    Icon: Layers,
    title: "You see the whole project",
    body: "Scope, design, build, deploy and support all happen in one team, so you learn how each part affects the next.",
  },
  {
    Icon: Wrench,
    title: "Time to do it properly",
    body: "Tests, documentation and code review are part of the quoted scope, not something squeezed in at the end.",
  },
] as const;

const PRACTICES = [
  "Every project starts with a written scope that the whole team reads.",
  "Clients get a staging link every week, so feedback arrives early.",
  "Every change goes through code review before it ships.",
  "We document as we go, for whoever maintains the project next.",
  "The team that built a system supports it after launch.",
] as const;

const OPEN_APPLICATIONS = [
  {
    Icon: Code2,
    title: "Full-stack developer",
    stack: ["Next.js", "TypeScript", "Node.js", "PostgreSQL"],
    work: "Build business websites, customer portals and internal tools, from database schema to deployed page.",
    lookFor: "Projects you have shipped and can talk through, including what went wrong.",
  },
  {
    Icon: Palette,
    title: "UI/UX designer",
    stack: ["Figma", "Design systems", "Prototyping"],
    work: "Design websites, app screens and brand identities that developers can build without guessing.",
    lookFor: "A portfolio that shows the problem, the options you tried and why you chose one.",
  },
  {
    Icon: TrendingUp,
    title: "SEO & performance marketer",
    stack: ["Google Ads", "Search Console", "GA4", "Meta Ads"],
    work: "Run search and social campaigns for client businesses, and report on leads and sales.",
    lookFor: "Campaigns you ran, what you changed along the way, and how you measured results.",
  },
] as const;

const STEPS = [
  { title: "Send your CV and work", body: `Email ${site.email} with your CV and links to code, designs or campaigns.` },
  { title: "Intro call", body: "A short call about what you have built and what you want to work on next." },
  { title: "Practical round", body: "A walk-through of your own work, or a small task close to what the role involves." },
  { title: "Meet the team", body: "A conversation with the people you would work with day to day, then a decision." },
] as const;

function mailto(subject: string) {
  return `mailto:${site.email}?subject=${encodeURIComponent(subject)}`;
}

export default function CareersPage() {
  return (
    <>
      <PageHero
        eyebrow="Careers"
        title="Build software that businesses run on"
        description={`${site.name} is a small team in Gurugram building websites, apps and internal tools for Indian businesses. We hire when the work needs it, and we hire carefully.`}
      >
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ButtonLink
            href="#open-roles"
            size="lg"
            variant="ghost"
            className="rounded-full bg-setu font-semibold text-white hover:bg-setu-dark dark:hover:bg-setu-dark"
          >
            See open roles
            <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
          <ButtonLink href={mailto("Open application")} size="lg" variant="secondary" className="rounded-full">
            Email your CV
          </ButtonLink>
        </div>
      </PageHero>

      <Section>
        <div className="container-page">
          <SectionHeading eyebrow="Why work here" title="Small team, real projects" />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {REASONS.map(({ Icon, title, body }, index) => (
              <Reveal
                key={title}
                delay={index * 70}
                className="rounded-card border border-border bg-surface p-6"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-setu/10 text-setu ring-1 ring-inset ring-setu/15">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-5 text-[1.05rem] font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-[0.92rem] leading-relaxed text-muted-foreground">{body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Section surface="subtle">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div>
            <SectionHeading
              align="left"
              eyebrow="How we work"
              title="Habits you would pick up here"
              description="None of this is unusual. We just do it on every project, including the small ones."
            />
          </div>
          <ul className="flex flex-col gap-3">
            {PRACTICES.map((practice, index) => (
              <Reveal
                as="li"
                key={practice}
                delay={index * 60}
                className="flex gap-4 rounded-xl border border-border bg-surface p-4"
              >
                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-setu/12 font-mono text-xs font-semibold text-setu">
                  {index + 1}
                </span>
                <span className="text-[0.96rem] leading-relaxed text-foreground/85">{practice}</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </Section>

      <Section id="open-roles" className="scroll-mt-24">
        <div className="container-page">
          <SectionHeading
            align="left"
            eyebrow="Open roles"
            title="No listed openings right now"
            description={`When we hire for a specific role, it is posted on this page first. Until then, we keep open applications for the profiles below. Send your CV to ${site.email} and we will get in touch when there is a fit.`}
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {OPEN_APPLICATIONS.map(({ Icon, title, stack, work, lookFor }, index) => (
              <Reveal
                as="article"
                key={title}
                delay={index * 70}
                className="flex flex-col rounded-card border border-border bg-surface p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex size-11 items-center justify-center rounded-xl bg-foreground/[0.05] text-foreground/80 ring-1 ring-inset ring-border">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <Badge tone="neutral">Open application</Badge>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-foreground">{title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">Based in Gurugram</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {stack.map((tool) => (
                    <Badge key={tool} tone="brand" className="px-2.5 py-0.5">
                      {tool}
                    </Badge>
                  ))}
                </div>
                <dl className="mt-5 flex flex-col gap-4 text-[0.92rem] leading-relaxed">
                  <div>
                    <dt className="font-semibold text-foreground">What you would do</dt>
                    <dd className="mt-1 text-muted-foreground">{work}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-foreground">What to send</dt>
                    <dd className="mt-1 text-muted-foreground">{lookFor}</dd>
                  </div>
                </dl>
                <a
                  href={mailto(`Open application: ${title}`)}
                  className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-setu transition-colors hover:text-setu-dark"
                >
                  Apply by email
                  <ArrowRight className="size-3.5" aria-hidden />
                </a>
              </Reveal>
            ))}
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-xl border border-dashed border-border p-5 text-[0.93rem] text-muted-foreground">
            <Eye className="mt-0.5 size-4 shrink-0 text-setu" aria-hidden />
            <p>
              Do something else well, like mobile development, content writing or project
              management? Write to{" "}
              <a href={mailto("Open application")} className="font-medium text-foreground underline underline-offset-4">
                {site.email}
              </a>{" "}
              and tell us what you would add to the team.
            </p>
          </div>
        </div>
      </Section>

      <Section surface="subtle">
        <div className="container-page">
          <SectionHeading eyebrow="How to apply" title="Four steps, no surprises" />
          <ol className="mx-auto mt-12 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <Reveal as="li" key={step.title} delay={index * 70} className="rounded-card border border-border bg-surface p-6">
                <span className="font-mono text-xs font-semibold text-setu">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-[0.9rem] leading-relaxed text-muted-foreground break-words">{step.body}</p>
              </Reveal>
            ))}
          </ol>
          <div className="mt-10 flex justify-center">
            <ButtonLink
              href={mailto("Open application")}
              size="lg"
              variant="ghost"
              className="rounded-full bg-setu font-semibold text-white hover:bg-setu-dark dark:hover:bg-setu-dark"
            >
              Email {site.email}
              <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
          </div>
        </div>
      </Section>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Careers", path: "/careers" },
        ])}
      />
    </>
  );
}
