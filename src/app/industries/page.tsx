import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  FileText,
  LifeBuoy,
  PenLine,
  Plug,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import { industries } from "@/lib/industries";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { JsonLd } from "@/components/seo/json-ld";
import { IndustryIcon } from "@/components/ui/industry-icon";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { DeferredSection } from "@/components/ui/deferred-section";
import { PageHero } from "@/components/layout/page-hero";
import { CtaBand } from "@/components/sections/cta-band";

export const metadata = pageMetadata({
  title: "Industry Websites, Apps & Software Solutions",
  description:
    "Websites, apps and business software for retail, healthcare, education, real estate, manufacturing, logistics, hospitality and professional services.",
  path: "/industries",
});

/** White card with a thin border and a layered, soft shadow. */
const CARD =
  "rounded-2xl border border-border bg-surface shadow-[0_1px_2px_rgb(15_23_42/0.04),0_10px_28px_-14px_rgb(15_23_42/0.14),0_28px_56px_-32px_rgb(15_23_42/0.12)]";

interface Point {
  icon: LucideIcon;
  title: string;
  body: string;
}

const ADAPT: readonly Point[] = [
  {
    icon: SlidersHorizontal,
    title: "Sector-specific features",
    body: "Functionality your sector depends on, from GST invoicing and RERA disclosures to appointment scheduling.",
  },
  {
    icon: Plug,
    title: "Integrations with your tools",
    body: "Connections to Tally, Razorpay, Shiprocket, WhatsApp Business and the software you already use.",
  },
  {
    icon: PenLine,
    title: "Content for your market",
    body: "Page structure and copy written for the customers and buyers you need to reach.",
  },
];

const SAME: readonly Point[] = [
  {
    icon: FileText,
    title: "Fixed-price proposal",
    body: "A free consultation, followed by a written scope, timeline and fixed price.",
  },
  {
    icon: UserRound,
    title: "Dedicated project manager",
    body: "One point of contact and regular progress updates from start to launch.",
  },
  {
    icon: ShieldCheck,
    title: "Performance and security",
    body: "Fast, accessible builds that follow established security practices.",
  },
  {
    icon: LifeBuoy,
    title: "Support after launch",
    body: "Three months of support included, with maintenance plans available.",
  },
];

export default function IndustriesPage() {
  return (
    <>
      <PageHero
        video="industries"
        eyebrow="Industries"
        title="Industries we serve"
        description="We bring domain understanding to every engagement, delivering websites and software tailored to the way each sector operates."
      />

      <Section surface="tint" aria-labelledby="sectors-heading">
        <div className="container-page">
          <SectionHeading
            eyebrow="Sectors"
            title={<span id="sectors-heading">Solutions for your sector</span>}
            description="Each sector page sets out the challenges we address, the solutions we build and the services behind them."
          />
          <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {industries.map((industry, index) => (
              <Reveal as="li" key={industry.slug} delay={(index % 3) * 70}>
                <Link
                  href={`/industries/${industry.slug}`}
                  className={cn(
                    CARD,
                    "group flex h-full flex-col overflow-hidden transition-[transform,border-color] duration-300 hover:border-setu/40 motion-safe:hover:-translate-y-1",
                  )}
                >
                  <span className="relative block aspect-[16/10] overflow-hidden" aria-hidden>
                    <Image
                      src={industry.image.src}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.05] motion-reduce:transition-none"
                    />
                    <span className="absolute inset-0 bg-[linear-gradient(to_top,rgba(11,16,32,0.55)_0%,rgba(11,16,32,0)_55%)]" />
                    <IndustryIcon
                      name={industry.icon}
                      className="absolute bottom-4 left-5 size-11 bg-white/90 text-setu shadow-lg ring-white/40 backdrop-blur"
                      size={20}
                    />
                  </span>
                  <span className="flex flex-1 flex-col p-6">
                    <h2 className="text-lg font-semibold text-foreground">{industry.name}</h2>
                    <span className="mt-2 block text-[0.92rem] leading-relaxed text-muted-foreground">
                      {industry.summary}.
                    </span>
                    <span className="mb-6 mt-4 flex flex-col gap-1.5">
                      {industry.builds.slice(0, 3).map((build) => (
                        <span key={build.title} className="flex gap-2 text-[0.86rem] text-foreground/80">
                          <Check className="mt-0.5 size-3.5 shrink-0 text-setu" aria-hidden />
                          {build.title}
                        </span>
                      ))}
                    </span>
                    <span className="mt-auto inline-flex items-center gap-1.5 border-t border-border pt-4 text-sm font-semibold text-setu">
                      View solutions
                      <ArrowRight
                        className="size-3.5 transition-transform group-hover:translate-x-1"
                        aria-hidden
                      />
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </Section>

      <Section surface="grid" aria-labelledby="approach-heading">
        <div className="container-page">
          <SectionHeading
            eyebrow="Our approach"
            title={<span id="approach-heading">Adapted to your sector, delivered consistently</span>}
            description="What we build changes with your sector. How we deliver it does not."
          />
          <div className="mx-auto mt-14 grid max-w-6xl gap-6 lg:grid-cols-2">
            <PointPanel title="Tailored to your sector" points={ADAPT} />
            <PointPanel title="Consistent on every project" points={SAME} delay={80} />
          </div>
        </div>
      </Section>

      <DeferredSection minHeight={380}>
        <CtaBand
          title="Working in another sector?"
          description="We build websites and business software for organisations across many industries. Book a consultation to discuss your requirements."
          primaryLabel="Discuss your project"
        />
      </DeferredSection>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Industries", path: "/industries" },
        ])}
      />
    </>
  );
}

function PointPanel({
  title,
  points,
  delay = 0,
}: {
  title: string;
  points: readonly Point[];
  delay?: number;
}) {
  return (
    <Reveal delay={delay} className={cn(CARD, "p-7 md:p-8")}>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <ul className="mt-6 flex flex-col gap-5">
        {points.map(({ icon: Icon, title: pointTitle, body }) => (
          <li key={pointTitle} className="flex gap-4">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-setu/10 text-setu ring-1 ring-inset ring-setu/20">
              <Icon className="size-[1.15rem]" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block font-semibold text-foreground">{pointTitle}</span>
              <span className="mt-1 block text-[0.93rem] leading-relaxed text-muted-foreground">
                {body}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
