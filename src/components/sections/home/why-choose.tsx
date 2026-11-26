import Link from "next/link";
import { ArrowRight, BadgeCheck, FileText, KeyRound, LifeBuoy, Search, ShieldCheck, UserRound } from "lucide-react";

import { HeroBackdrop } from "@/components/interactive/hero-backdrop";
import { FadeUp, Stagger, StaggerItem } from "@/components/motion/primitives";
import { pageVideo } from "@/lib/media";
import { BENEFITS } from "./copy";
import { Eyebrow, SectionTitle } from "./shared";

const ICONS = [FileText, UserRound, KeyRound, ShieldCheck, Search, LifeBuoy] as const;

/** Dark band over muted team-discussion footage, listing why clients choose Setuware. */
export function WhyChoose() {
  const media = pageVideo("about");
  return (
    <section id="why-setuware" className="relative isolate overflow-hidden bg-[#0b0f2a] py-20 text-white lg:py-28">
      <div className="absolute inset-0 -z-10">
        <HeroBackdrop sources={media.sources} poster={media.poster} tone="dark" />
      </div>
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(11,15,42,0.9)_0%,rgba(11,15,42,0.68)_45%,rgba(11,15,42,0.42)_100%)]" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60rem_30rem_at_85%_0%,rgba(47,86,216,0.3),transparent)]" />

      <div className="container-figma grid gap-14 lg:grid-cols-[0.9fr_1.4fr] lg:gap-20">
        <FadeUp>
          <Eyebrow light>Why Setuware</Eyebrow>
          <SectionTitle light>
            A technology partner you can rely on, <span className="text-[#7c9bff]">from day one</span>
          </SectionTitle>
          <p className="mt-5 max-w-[30rem] text-[1.02rem] leading-relaxed text-white/70">
            Clear proposals, one accountable team and software you fully own. That is how we work
            on every project, from a five-page website to a multi-module business platform.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/book" className="group inline-flex h-12 items-center gap-2 rounded-full bg-[linear-gradient(110deg,#3b6cf6,#1d4ed8)] px-7 text-sm font-semibold text-white transition-[filter] hover:brightness-110">
              Book a free consultation
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
            <Link href="/pricing" className="inline-flex h-12 items-center rounded-full border border-white/35 px-7 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-[#0f1330]">
              View pricing
            </Link>
          </div>
          <p className="mt-8 inline-flex items-center gap-2 text-sm text-white/60">
            <BadgeCheck className="size-4 text-[#7c9bff]" aria-hidden />
            Fixed quote before any work begins
          </p>
        </FadeUp>

        <Stagger className="grid gap-4 sm:grid-cols-2">
          {BENEFITS.map((benefit, i) => {
            const Icon = ICONS[i];
            return (
              <StaggerItem key={benefit.title}>
                <div className="group h-full rounded-2xl border border-white/12 bg-[#0b0f2a]/55 p-6 backdrop-blur-md transition-colors duration-300 hover:border-[#3b6cf6]/60 hover:bg-[#2f56d8]/15">
                  <span className="inline-flex size-12 items-center justify-center rounded-xl bg-[#2f56d8]/20 text-[#9db4ff] transition-colors group-hover:bg-[#2f56d8] group-hover:text-white">
                    <Icon className="size-6" aria-hidden />
                  </span>
                  <h3 className="mt-5 text-[1.1rem] font-bold">{benefit.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/65">{benefit.body}</p>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
