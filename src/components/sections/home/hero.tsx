import Link from "next/link";
import { ArrowRight, BadgeCheck, KeyRound, UserRound } from "lucide-react";

import { caseStudyPhotos } from "@/lib/case-study-photos";
import { site } from "@/lib/site";
import { FadeUp } from "@/components/motion/primitives";
import { TextReveal } from "@/components/motion/text-reveal";
import { DeviceShowcase } from "@/components/sections/work/device-showcase";
import { CircuitLines } from "./shared";

const TRUST = [
  { icon: BadgeCheck, label: "Fixed-price proposals" },
  { icon: UserRound, label: "Dedicated project manager" },
  { icon: KeyRound, label: "Complete code ownership" },
] as const;

const SHOWCASE = caseStudyPhotos["sanskar-kabir-couture-ecommerce"];

/**
 * Static home hero: the brand promise and slogan beside a live client build.
 * No rotation, so the message stays put while people read it.
 */
export function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#070b24] text-white">
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-[radial-gradient(55rem_32rem_at_80%_10%,rgba(59,108,246,0.38),transparent_70%),radial-gradient(40rem_28rem_at_0%_100%,rgba(6,182,212,0.18),transparent_70%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.35] [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
      />
      <CircuitLines className="absolute -left-16 bottom-0 -z-10 w-[30rem] text-[#3b6cf6]/25" />

      <div className="container-figma grid items-center gap-14 pb-20 pt-32 lg:grid-cols-[1.02fr_1fr] lg:gap-12 lg:pb-28 lg:pt-40">
        <div>
          <FadeUp immediate y={16}>
            <h1 className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white/85 backdrop-blur sm:text-[0.8rem]">
              <span aria-hidden className="size-1.5 rounded-full bg-[#38bdf8] shadow-[0_0_10px_#38bdf8]" />
              Websites, apps &amp; custom software
            </h1>
          </FadeUp>
          <TextReveal
            as="h2"
            immediate
            delay={0.1}
            stagger={0.06}
            className="mt-6 text-[2.6rem] font-extrabold leading-[1.04] tracking-[-0.035em] sm:text-[3.5rem] lg:text-[4.1rem]"
          >
            From ideas to production-ready software.
          </TextReveal>
          <FadeUp immediate delay={0.55} y={20}>
            <p className="mt-6 max-w-[34rem] text-[1.06rem] leading-relaxed text-white/75 sm:text-lg">
              {site.slogan.replace(/\.$/, "")}, designed, built and supported by one team.
            </p>
          </FadeUp>
          <FadeUp immediate delay={0.7} y={20} className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/contact"
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-[linear-gradient(110deg,#3b6cf6,#1d4ed8)] px-7 text-[0.95rem] font-semibold text-white shadow-[0_14px_34px_-12px_rgba(59,108,246,0.95)] transition-[filter] hover:brightness-110"
            >
              Start a project
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
            <Link
              href="/book"
              className="inline-flex h-12 items-center rounded-full border border-white/35 px-7 text-[0.95rem] font-semibold text-white transition-colors hover:bg-white hover:text-[#0f1330]"
            >
              Book a consultation
            </Link>
          </FadeUp>
          <FadeUp immediate delay={0.85} y={16}>
            <ul className="mt-10 flex flex-wrap gap-x-7 gap-y-3 border-t border-white/10 pt-6 text-sm font-medium text-white/80">
              {TRUST.map(({ icon: Icon, label }) => (
                <li key={label} className="inline-flex items-center gap-2">
                  <Icon className="size-4 text-[#7dd3fc]" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
          </FadeUp>
        </div>

        <FadeUp immediate delay={0.3} y={30} className="relative">
          <div aria-hidden className="absolute -inset-8 -z-10 rounded-[3rem] bg-[radial-gradient(closest-side,rgba(59,108,246,0.45),transparent)] blur-2xl" />
          <DeviceShowcase photo={SHOWCASE} url="https://sanskarandkabir.com/" preload />
          <Link
            href="/work/sanskar-kabir-couture-ecommerce"
            className="absolute -left-2 top-8 hidden rounded-2xl border border-white/15 bg-[#0b1233]/85 px-5 py-4 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur-md transition-colors hover:border-[#3b6cf6] sm:block lg:-left-10"
          >
            <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[#7dd3fc]">Recent launch</span>
            <span className="mt-1 block text-[0.95rem] font-bold">Sanskar &amp; Kabir online store</span>
          </Link>
        </FadeUp>
      </div>
    </section>
  );
}
