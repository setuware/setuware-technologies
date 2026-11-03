import { Code2, FileCheck2, Gauge, HeartHandshake, KeyRound, Timer } from "lucide-react";

import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading, type SectionSurface } from "@/components/ui/section";
import { CARD } from "@/components/sections/page-blocks";
import { cn } from "@/lib/utils";

const POINTS = [
  {
    Icon: KeyRound,
    title: "Complete ownership",
    body: "Your code, domains and accounts remain yours, with full documentation provided at handover.",
  },
  {
    Icon: FileCheck2,
    title: "Transparent pricing",
    body: "Every engagement begins with a detailed proposal and a fixed quote. Additional requirements are priced and approved before work begins.",
  },
  {
    Icon: Gauge,
    title: "Performance and security",
    body: "Fast, secure builds that follow industry best practices and are tested across devices before go-live.",
  },
  {
    Icon: Timer,
    title: "Regular progress reviews",
    body: "A live preview from the first week of development and a weekly demonstration of progress.",
  },
  {
    Icon: Code2,
    title: "Dedicated project team",
    body: "A dedicated project manager and direct access to the engineers building your product.",
  },
  {
    Icon: HeartHandshake,
    title: "Post-launch support",
    body: "Every website includes three months of support, with optional maintenance plans thereafter.",
  },
] as const;

export function Differentiators({ surface = "subtle" }: { surface?: SectionSurface }) {
  return (
    <Section id="why-us" surface={surface}>
      <div className="container-page">
        <SectionHeading
          eyebrow="Why Setuware Technologies"
          title="A dependable partner for every project"
          description="Six commitments that keep every engagement on time, on budget and fully transparent."
        />

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {POINTS.map(({ Icon, title, body }, index) => (
            <Reveal key={title} delay={index * 60} className={cn(CARD, "flex gap-4 p-6")}>
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-setu/10 text-setu ring-1 ring-inset ring-setu/20">
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
