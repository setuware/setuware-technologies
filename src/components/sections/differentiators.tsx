import { Code2, FileCheck2, Gauge, HeartHandshake, KeyRound, Timer } from "lucide-react";

import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";

const POINTS = [
  {
    Icon: KeyRound,
    title: "You own everything",
    body: "The domain, code, repository and hosting accounts are in your name from day one. Handover notes are written for a developer who has never met us. Moving on should be easy.",
  },
  {
    Icon: FileCheck2,
    title: "Fixed price, written scope",
    body: "The proposal lists what is included and what is not. You get one fixed price before work starts. Anything new is quoted separately, and only built once you approve it.",
  },
  {
    Icon: Gauge,
    title: "Speed checked before launch",
    body: "Every build is tested on mid-range Android phones over 4G, with Lighthouse and Core Web Vitals checks before go-live. Slow pages are fixed, not shipped.",
  },
  {
    Icon: Timer,
    title: "A live preview every week",
    body: "From the first week of the build, your site or app sits on a live preview link. A short weekly demo shows what changed and what is next.",
  },
  {
    Icon: Code2,
    title: "Engineers on your calls",
    body: "The person answering your technical question is the person writing the code. Nothing gets lost between an account manager and the developer.",
  },
  {
    Icon: HeartHandshake,
    title: "Support after go-live",
    body: "Every website includes three months of fixes after go-live. Care plans then keep it patched, backed up and monitored by the people who built it.",
  },
] as const;

export function Differentiators() {
  return (
    <Section id="why-us">
      <div className="container-page">
        <SectionHeading
          eyebrow="How we work"
          title="What goes wrong elsewhere, handled here"
          description="Missed deadlines, moving prices and lost logins stall more projects than bad code. These six habits prevent them."
        />

        <div className="mt-14 grid gap-x-10 gap-y-9 md:grid-cols-2 lg:grid-cols-3">
          {POINTS.map(({ Icon, title, body }, index) => (
            <Reveal key={title} delay={index * 60} className="flex gap-4">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/8 text-primary">
                <Icon className="size-[18px]" aria-hidden />
              </span>
              <div>
                <h3 className="text-[1.02rem] font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-[0.92rem] leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
