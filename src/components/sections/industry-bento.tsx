import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  FileCheck2,
  Gauge,
  KeyRound,
  LifeBuoy,
  SearchCheck,
  UserRoundCheck,
  type LucideIcon,
} from "lucide-react";

import { images } from "@/lib/images";
import { cn } from "@/lib/utils";
import {
  FadeUp,
  ImageReveal,
  Parallax,
  SpotlightCard,
  Stagger,
  StaggerItem,
} from "@/components/motion/primitives";
import { TextReveal } from "@/components/motion/text-reveal";

interface Benefit {
  Icon: LucideIcon;
  title: string;
  body: string;
}

/** The reasons a business chooses us; ownership is stated here once on the homepage. */
const BENEFITS: readonly Benefit[] = [
  {
    Icon: FileCheck2,
    title: "Transparent pricing",
    body: "A detailed proposal and a fixed quote before any work begins.",
  },
  {
    Icon: UserRoundCheck,
    title: "Dedicated project manager",
    body: "One point of contact and regular progress updates.",
  },
  {
    Icon: KeyRound,
    title: "Complete ownership",
    body: "Your code, domains and accounts remain yours.",
  },
  {
    Icon: Gauge,
    title: "Performance and security",
    body: "Fast, secure builds that follow industry best practices.",
  },
  {
    Icon: SearchCheck,
    title: "Built for search",
    body: "Technical SEO and analytics configured before launch.",
  },
  {
    Icon: LifeBuoy,
    title: "Support after launch",
    body: "Three months of support included, with maintenance plans available.",
  },
];

const CARD_SHADOW =
  "shadow-[0_1px_2px_rgb(var(--shadow-color)/0.05),0_20px_44px_-26px_rgb(var(--shadow-color)/0.28)]";

/**
 * Industry and "why us" band.
 *
 * The section heading over a two-column layout on the 1400px column: a tall
 * photo card on the left (a client meeting, with a caption and a link to our
 * work) and a 2×3 grid of benefit cards on the right. On narrow screens the
 * photo card leads and the benefits follow in one or two columns.
 *
 * Motion: the photo wipes in and drifts against the scroll; the benefit cards
 * rise in a stagger and follow the cursor with a soft cyan glow.
 */
export function IndustryBento() {
  return (
    <section
      aria-labelledby="industry-heading"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#f5f9fc,#eef6fb_55%,#f7fbfd)] py-20 md:py-28 lg:pt-[calc(var(--s)*134)] lg:pb-[calc(var(--s)*150)] dark:bg-[linear-gradient(180deg,var(--background-subtle),var(--background))]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-24 size-[32rem] rounded-full bg-setu/10 blur-[120px]"
      />
      <div className="container-figma relative">
        <div className="text-center">
          <TextReveal
            as="h2"
            id="industry-heading"
            className="mx-auto max-w-[40rem] text-3xl leading-tight font-bold tracking-[-0.04em] text-foreground sm:text-[2.6rem] lg:max-w-[calc(var(--s)*1033)] lg:text-[calc(var(--s)*58)] lg:leading-[calc(var(--s)*72)]"
          >
            {"Software designed for your industry.\nBuilt for your growth."}
          </TextReveal>
          <FadeUp delay={0.35} y={20}>
            <p className="mx-auto mt-5 max-w-xl text-[0.95rem] leading-relaxed text-foreground/70 lg:mt-[calc(var(--s)*21)] lg:max-w-[calc(var(--s)*889)] lg:text-[calc(var(--s)*16)] lg:leading-[calc(var(--s)*32)]">
              We bring domain understanding to every engagement, across retail,
              healthcare, education, real estate, manufacturing and
              professional services.
            </p>
          </FadeUp>
        </div>

        <div className="mt-12 grid gap-5 lg:mt-[calc(var(--s)*56)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:gap-[calc(var(--s)*28)]">
          {/* Photo card: a project meeting, linking to the portfolio. */}
          <FadeUp y={28} className="h-full">
            <Link
              href="/work"
              className={cn(
                "group relative flex h-full min-h-[26rem] flex-col justify-end overflow-hidden rounded-[1.5rem] bg-[#0b2a3a] p-6 sm:min-h-[30rem] sm:p-8 lg:min-h-0 lg:p-[calc(var(--s)*44)]",
                CARD_SHADOW,
              )}
            >
              <ImageReveal className="absolute inset-0">
                <Parallax speed={22} className="absolute inset-x-0 -inset-y-[7%]">
                  <Image
                    src={images.clientMeeting.src}
                    alt={images.clientMeeting.alt}
                    fill
                    sizes="(min-width: 1024px) 40vw, 92vw"
                    className="object-cover object-[60%_45%] transition-[scale] duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                  />
                </Parallax>
              </ImageReveal>
              <div
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(to_top,rgba(6,22,34,0.9)_0%,rgba(6,22,34,0.55)_32%,rgba(6,22,34,0)_62%)]"
              />
              <div className="relative">
                <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-[#7fdcf0] uppercase">
                  <span aria-hidden className="h-px w-6 bg-[#7fdcf0]" />
                  End-to-end delivery
                </span>
                <p className="mt-3 max-w-[26rem] text-[1.35rem] leading-[1.35] font-semibold tracking-[-0.02em] text-white lg:text-[calc(var(--s)*26)] lg:leading-[calc(var(--s)*36)]">
                  Strategy, design, development and support from a single partner.
                </p>
                <span className="mt-6 inline-flex h-11 w-fit items-center gap-2 rounded-full bg-white px-5 text-[0.92rem] font-semibold text-[#0b1020] transition-[background-color,translate] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5 group-hover:bg-[#e8f8fc]">
                  View our work
                  <ArrowRight
                    className="size-4 text-setu transition-transform duration-300 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </div>
            </Link>
          </FadeUp>

          {/* Benefits, 2 × 3. */}
          <Stagger
            as="ul"
            stagger={0.08}
            className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:gap-[calc(var(--s)*20)]"
          >
            {BENEFITS.map(({ Icon, title, body }) => (
              <StaggerItem key={title} as="li" y={28} className="h-full">
                <SpotlightCard
                  tilt={2}
                  glow="rgba(0,161,198,0.14)"
                  className={cn(
                    "h-full rounded-[1.25rem] border border-border bg-surface p-5 transition-[border-color] duration-300 hover:border-setu/40 sm:p-6 lg:p-[calc(var(--s)*30)]",
                    CARD_SHADOW,
                  )}
                >
                  <div className="relative grid grid-cols-[auto_1fr] items-start gap-x-4 sm:block">
                    <span className="row-span-2 inline-flex size-11 items-center justify-center rounded-xl bg-[linear-gradient(135deg,rgba(0,161,198,0.16),rgba(10,52,166,0.08))] text-setu ring-1 ring-setu/20 ring-inset">
                      <Icon className="size-5" strokeWidth={1.8} aria-hidden />
                    </span>
                    <h3 className="text-[1.08rem] leading-snug font-semibold tracking-[-0.01em] text-foreground sm:mt-5 lg:text-[calc(var(--s)*19)]">
                      {title}
                    </h3>
                    <p className="mt-1.5 text-[0.93rem] leading-relaxed text-foreground/65 sm:mt-2 lg:text-[calc(var(--s)*15.5)] lg:leading-[calc(var(--s)*25)]">
                      {body}
                    </p>
                  </div>
                </SpotlightCard>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
