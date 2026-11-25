import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Phone } from "lucide-react";

import { FadeUp } from "@/components/motion/primitives";
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
        <FadeUp className="relative mx-auto w-full max-w-[36rem] pb-16 pr-10 lg:mx-0">
          <div aria-hidden className="absolute -left-6 -top-6 size-40 rounded-3xl bg-[radial-gradient(#2f56d8_1.5px,transparent_1.5px)] [background-size:14px_14px] opacity-30" />
          <div className="relative aspect-[4/3.4] overflow-hidden rounded-3xl shadow-[0_30px_60px_-30px_rgba(15,19,48,0.5)]">
            <Image src="/images/team/team-group.jpg" alt="The Setuware team in a planning session" fill sizes="(min-width: 1024px) 36rem, 92vw" className="object-cover" />
          </div>
          <div className="absolute bottom-0 right-0 w-[52%] overflow-hidden rounded-2xl border-[6px] border-white shadow-[0_24px_50px_-20px_rgba(15,19,48,0.55)] dark:border-surface">
            <div className="relative aspect-[4/3]">
              <Image src="/images/photos/about-office.jpg" alt="Setuware office workspace" fill sizes="(min-width: 1024px) 18rem, 46vw" className="object-cover" />
            </div>
          </div>
          <div className="absolute bottom-6 left-6 rounded-2xl bg-[linear-gradient(135deg,#3b6cf6,#1d4ed8)] px-6 py-5 text-white shadow-[0_20px_40px_-18px_rgba(29,78,216,0.9)]">
            <p className="text-3xl font-extrabold leading-none">100%</p>
            <p className="mt-1.5 text-xs font-medium text-white/85">Code &amp; account ownership</p>
          </div>
        </FadeUp>

        <FadeUp delay={0.1}>
          <Eyebrow>About Setuware</Eyebrow>
          <SectionTitle>
            The bridge between your business idea and a working digital product
          </SectionTitle>
          <p className="mt-5 text-[1.02rem] leading-relaxed text-[#5a6180] dark:text-white/70">
            Setuware Technologies is a Gurugram-based studio that designs and engineers websites,
            e-commerce platforms, mobile apps and custom software. We work with startups, growing
            businesses and established teams that need one accountable partner from planning to
            launch and beyond.
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
        <dl className="grid gap-px overflow-hidden rounded-3xl border border-[#e3e8f5] bg-[#e3e8f5] sm:grid-cols-2 lg:grid-cols-4 dark:border-white/10 dark:bg-white/10">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-[#f8f9fe] p-8 text-center dark:bg-surface-2">
              <dd className="text-[2.4rem] font-extrabold leading-none tracking-[-0.02em] text-[#2f56d8] dark:text-[#7c9bff]">
                {stat.value}
                <span className="text-[1.4rem]">{stat.suffix}</span>
              </dd>
              <dt className="mt-3 text-[1rem] font-semibold text-[#0f1330] dark:text-white">{stat.label}</dt>
              <p className="mt-1 text-sm text-[#5a6180] dark:text-white/60">{stat.hint}</p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
