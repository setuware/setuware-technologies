import { Compass, HeartHandshake, Scale, Users } from "lucide-react";

import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { stats } from "@/lib/content";
import { heroVideoPoster, heroVideoSources } from "@/lib/media";
import { Counter } from "@/components/ui/counter";
import { HeroVideo } from "@/components/interactive/hero-video";
import { PipelineAnimation } from "@/components/interactive/pipeline-animation";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { PageHero } from "@/components/layout/page-hero";
import { ProcessDark } from "@/components/sections/process-dark";
import { CtaBand } from "@/components/sections/cta-band";
import { DeferredSection } from "@/components/ui/deferred-section";

export const metadata = pageMetadata({
  title: "About us",
  description: `${site.name} has been building and running production software since ${site.founded}. Small senior team, fixed-price scopes, and we stay on call after launch.`,
  path: "/about",
});

const VALUES = [
  {
    Icon: Scale,
    title: "Say the uncomfortable thing early",
    body: "If a deadline is not achievable or a feature is a bad idea, you hear it on the first call — not in week nine when it has already cost you money.",
  },
  {
    Icon: Users,
    title: "Senior people, small teams",
    body: "No pyramid staffing. The people on your kickoff call are the people writing the code, and there are fewer of them than you expect.",
  },
  {
    Icon: Compass,
    title: "Build for the handover",
    body: "We write documentation and tests for the developer who replaces us. If leaving is painless, staying is a choice you make freely.",
  },
  {
    Icon: HeartHandshake,
    title: "Own the outage",
    body: "When something breaks at 2am on a system we run, we are paged, we fix it, and you get a written account of what happened and what changed.",
  },
] as const;

export default function AboutPage() {
  return (
    <>
      <PageHero
        align="left"
        eyebrow="About us"
        title="A small team that stays after launch"
        description={`Since ${site.founded} we have shipped software for retail, healthcare, fintech, logistics and education — and we still run most of it. That second part changes how you build the first.`}
      >
        {/*
          Same media treatment as the home page: a real video when one is
          configured, and the vector pipeline animation otherwise. Reusing the
          component means the loading, pause-offscreen and reduced-motion
          behaviour is identical here without restating any of it.
        */}
        <div className="mt-10 lg:max-w-2xl">
          <HeroVideo
            sources={heroVideoSources()}
            poster={heroVideoPoster()}
            fallback={<PipelineAnimation />}
            label="Setuware Technologies delivery pipeline in motion"
          />
        </div>

          <dl className="mt-12 grid grid-cols-2 gap-8 border-t border-border pt-9 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dd className="font-display text-3xl font-semibold text-foreground">
                  <Counter to={stat.value} suffix={stat.suffix} />
                </dd>
                <dt className="mt-1">
                  <span className="block text-sm font-medium text-foreground">
                    {stat.label}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {stat.hint}
                  </span>
                </dt>
              </div>
            ))}
          </dl>
      </PageHero>

      <Section>
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-2xl font-semibold text-foreground">Why we started</h2>
            <div className="mt-5 flex flex-col gap-4 text-[1.02rem] leading-relaxed text-muted-foreground">
              <p>
                Everyone here had worked somewhere that treated launch day as the
                finish line. The pattern was always the same: an agency builds
                something, invoices, and disappears — and six months later the
                client is paying someone else to work out why it is slow, why the
                certificate expired, or why nobody can edit the homepage.
              </p>
              <p>
                So we built the company around the part that usually gets dropped.
                We quote hosting and support alongside the build, we write the
                documentation before handover, and we put our own on-call rota
                behind the systems we run.
              </p>
              <p>
                It makes us more careful during the build, because we are the ones
                who will be paged.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {VALUES.map(({ Icon, title, body }, index) => (
              <Reveal
                key={title}
                delay={index * 70}
                className="rounded-card border border-border bg-surface p-6"
              >
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-[18px]" aria-hidden />
                </span>
                <h3 className="mt-4 text-[1.02rem] font-semibold text-foreground">
                  {title}
                </h3>
                <p className="mt-2 text-[0.92rem] leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <DeferredSection minHeight={820}>
        <ProcessDark />
      </DeferredSection>

      <DeferredSection minHeight={380}>
        <CtaBand
          title="Want to see whether we fit?"
          description="Bring us a problem rather than a spec. Forty-five minutes is usually enough for both of us to tell."
        />
      </DeferredSection>
    </>
  );
}
