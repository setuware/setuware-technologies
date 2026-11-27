import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Phone } from "lucide-react";

import { FadeUp, ImageReveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import { Counter } from "@/components/ui/counter";
import { stats } from "@/lib/content";
import { site } from "@/lib/site";
import { Eyebrow, SectionTitle } from "./shared";

const POINTS = [
  "Strategy, design and engineering in one team",
  "Fixed-price proposals agreed before work begins",
  "Dedicated project manager on every engagement",
  "Three months of post-launch support included",
] as const;

/** Layered team photography beside company copy and commitments. */
export function AboutCorporate() {
  return (
    <section id="about" className="relative overflow-hidden bg-white py-20 dark:bg-surface lg:py-28">
      <div className="container-figma grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
        <FadeUp className="relative mx-auto w-full max-w-[36rem] lg:mx-0">
          <ImageReveal className="relative aspect-[4/3.6] rounded-[2rem] shadow-[0_30px_60px_-30px_rgba(15,19,48,0.5)]">
            <Image src="/images/team/team-group.jpg" alt="The Setuware team in a planning session" fill sizes="(min-width: 1024px) 36rem, 92vw" className="object-cover" />
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_top,rgba(11,22,56,0.9),transparent)]" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-6 text-white sm:p-8">
              <p className="max-w-[14rem] text-sm font-medium leading-snug text-white/85">
                One team in Gurugram, from the first call to launch and support.
              </p>
              <p className="shrink-0 text-right">
                <span className="block text-[2.6rem] font-extrabold leading-none tracking-[-0.03em]">100%</span>
                <span className="mt-1 block text-xs font-medium text-white/80">Code &amp; account ownership</span>
              </p>
            </div>
          </ImageReveal>
        </FadeUp>

        <FadeUp delay={0.1}>
          <Eyebrow>About Setuware</Eyebrow>
          <SectionTitle>
            The bridge between your business idea and a working digital product
          </SectionTitle>
          <p className="mt-5 text-[1.02rem] leading-relaxed text-[#5a6180] dark:text-white/70">
            Setuware Technologies is a software development company in Gurugram. We build websites,
            online stores, mobile apps and business software for companies that want one
            accountable partner from planning to launch.
          </p>
          <ul className="mt-7 grid gap-3 sm:grid-cols-2">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-[0.95rem] font-medium text-[#1f2544] dark:text-white/85">
                <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-[#2f56d8] text-white">
                  <Check className="size-3" strokeWidth={3} aria-hidden />
                </span>
                {point}
              </li>
            ))}
          </ul>
          <div className="mt-9 flex flex-wrap items-center gap-6">
            <Link href="/about" className="group inline-flex h-12 items-center gap-2 rounded-full bg-[#2f56d8] px-7 text-sm font-semibold text-white transition-[filter] hover:brightness-110">
              More about us
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
            <a href={site.phoneHref} className="group inline-flex items-center gap-3">
              <span className="inline-flex size-12 items-center justify-center rounded-full bg-[#eef2ff] text-[#2f56d8] transition-colors group-hover:bg-[#2f56d8] group-hover:text-white dark:bg-white/10 dark:text-white">
                <Phone className="size-5" aria-hidden />
              </span>
              <span>
                <span className="block text-xs font-medium text-[#5a6180] dark:text-white/60">Call us</span>
                <span className="block text-[1.05rem] font-bold text-[#0f1330] dark:text-white">{site.phone}</span>
              </span>
            </a>
          </div>
        </FadeUp>
      </div>

      <div className="container-figma mt-20">
        <Stagger as="div" className="grid gap-px overflow-hidden rounded-3xl border border-[#e3e8f5] bg-[#e3e8f5] sm:grid-cols-2 lg:grid-cols-4 dark:border-white/10 dark:bg-white/10">
          {stats.map((stat) => (
            <StaggerItem key={stat.label} className="bg-[#f8f9fe] p-8 text-center dark:bg-surface-2">
              <p className="text-[2.4rem] font-extrabold leading-none tracking-[-0.02em] text-[#2f56d8] dark:text-[#7c9bff]">
                <Counter to={stat.value} />
                <span className="text-[1.4rem]">{stat.suffix}</span>
              </p>
              <p className="mt-3 text-[1rem] font-semibold text-[#0f1330] dark:text-white">{stat.label}</p>
              <p className="mt-1 text-sm text-[#5a6180] dark:text-white/60">{stat.hint}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
