import { Code2, FileCheck2, Gauge, HeartHandshake, KeyRound, Timer } from "lucide-react";

import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";

const POINTS = [
  {
    Icon: KeyRound,
    title: "You own everything",
    body: "Repositories in your organisation, infrastructure in your accounts, documentation written for a developer who has never met us. Leaving us should be easy — that is the point.",
  },
  {
    Icon: FileCheck2,
    title: "Fixed price, written scope",
    body: "The proposal lists what is included and, more importantly, what is not. Change requests are quoted as small separate items within two working days.",
  },
  {
    Icon: Gauge,
    title: "Performance budgets, enforced",
    body: "Under 120KB of JavaScript before interaction and an LCP budget checked in CI. A regression fails the build instead of quietly shipping.",
  },
  {
    Icon: Timer,
    title: "A staging URL in week one",
    body: "You see something real within days, then a demo every fortnight. No four-week silence followed by a surprise.",
  },
  {
    Icon: Code2,
    title: "Engineers on your calls",
    body: "The person answering your technical question is the person writing the code. No account manager relaying messages.",
  },
  {
    Icon: HeartHandshake,
    title: "We stay after launch",
    body: "Monitoring, patches and a named engineer on call. Most agencies disappear at handover; our hosting and support plans exist precisely so we do not.",
  },
] as const;

export function Differentiators() {
  return (
    <Section id="why-us">
      <div className="container-page">
        <SectionHeading
          eyebrow="Why teams switch to us"
          title="The things that actually go wrong, handled"
          description="None of this is exciting. All of it is what separates a project that ships from one that quietly stalls."
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
