import Link from "next/link";
import { ArrowRight, Calculator, Check, MessageCircle } from "lucide-react";

import { serviceGroups, services } from "@/lib/content";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { PageHero } from "@/components/layout/page-hero";
import { FadeUp, Magnetic, Stagger, StaggerItem } from "@/components/motion/primitives";
import { TextReveal } from "@/components/motion/text-reveal";
import { ServiceCard } from "@/components/services/service-card";
import { ProcessDark } from "@/components/sections/process-dark";
import { DeferredSection } from "@/components/ui/deferred-section";
import { Section, type SectionSurface } from "@/components/ui/section";
import { cn } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Web, App & Software Development Services",
  description:
    "Web and app development services from Gurugram: business websites, e-commerce, mobile apps, branding, SEO, custom ERP and CRM, AI automation and hosting.",
  path: "/services",
});

/** Alternating backgrounds for the group sections, so neighbours never match. */
const GROUP_SURFACES: readonly SectionSurface[] = ["grid", "tint", "default", "dots"];

/** Sentence-initial numbers are written as words. */
const COUNT_WORDS: Record<number, string> = { 1: "One", 2: "Two", 3: "Three", 4: "Four", 5: "Five" };

/** What every engagement includes, whichever services it combines. */
const INCLUDED = [
  "Free 30-minute consultation",
  "Fixed-price written proposal",
  "Dedicated project manager",
  "Three months of post-launch support",
] as const;

export default function ServicesPage() {
  const groups = serviceGroups
    .map((group) => ({
      ...group,
      items: services.filter((service) => (service.group ?? "build") === group.id),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      <PageHero
        video="services"
        eyebrow="Services"
        title="Web, app and software development services"
        description="One team in Gurugram does the strategy, design, build and support — and quotes a fixed price in writing before starting."
      >
        <nav aria-label="Service groups" className="mt-8 flex flex-wrap gap-2">
          {groups.map((group, index) => (
            <a
              key={group.id}
              href={`#${group.id}`}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-4 py-2 text-sm font-medium text-foreground backdrop-blur transition-colors hover:border-setu hover:text-setu"
            >
              <span className="font-mono text-[11px] text-setu">0{index + 1}</span>
              {group.label}
              <span className="hidden text-muted-foreground sm:inline">· {group.title}</span>
            </a>
          ))}
        </nav>
      </PageHero>

      {groups.map((group, index) => {
        const count = group.items.length;
        return (
          <Section
            key={group.id}
            id={group.id}
            surface={GROUP_SURFACES[index % GROUP_SURFACES.length]}
            aria-labelledby={`${group.id}-heading`}
            // `overflow-clip` instead of the decorated surfaces' `overflow-hidden`,
            // so the sticky group intro still sticks to the viewport.
            className="scroll-mt-24 overflow-clip"
          >
            <div className="container-page grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,2fr)] lg:gap-14">
              <FadeUp className="lg:sticky lg:top-28 lg:self-start">
                <span className="inline-flex items-center rounded-full border border-setu/25 bg-setu/[0.08] px-3 py-1 font-mono text-xs font-semibold text-setu">
                  0{index + 1} / {group.label}
                </span>
                <h2
                  id={`${group.id}-heading`}
                  className="mt-4 font-display text-3xl font-semibold leading-tight text-foreground sm:text-[2.2rem]"
                >
                  {group.title}
                </h2>
                <p className="mt-3 max-w-sm text-[0.98rem] leading-relaxed text-muted-foreground">
                  {group.description}
                </p>
                <p className="mt-5 border-t border-border pt-4 text-sm text-muted-foreground lg:max-w-sm">
                  {COUNT_WORDS[count] ?? count} {count === 1 ? "service" : "services"}, delivered by
                  the same team.
                </p>
              </FadeUp>

              <Stagger className="grid gap-5 sm:grid-cols-2">
                {group.items.map((service) => (
                  <StaggerItem key={service.slug} className="h-full">
                    <ServiceCard service={service} />
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </Section>
        );
      })}

      <Section surface="ink" aria-labelledby="not-sure-heading">
        <div className="container-page grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-16">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-setu">
              Expert guidance
            </span>
            <TextReveal
              as="h2"
              id="not-sure-heading"
              className="mt-4 font-display text-3xl font-semibold leading-tight text-foreground sm:text-[2.4rem]"
            >
              {"Not sure which service is right for you?"}
            </TextReveal>
            <p className="mt-4 max-w-lg text-[1rem] leading-relaxed text-muted-foreground">
              Most jobs mix two or three services — a website with bookings, a store
              with GST invoicing. A 30-minute call is the fastest way to pin
              down the right mix and a fixed price.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2" aria-label="Included in every engagement">
              {INCLUDED.map((item) => (
                <li key={item} className="flex gap-3 text-[0.95rem] text-foreground/85">
                  <Check className="mt-0.5 size-4 shrink-0 text-setu" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-3">
            <NotSureLink
              href="/contact"
              icon={<MessageCircle className="size-5" aria-hidden />}
              title="Book a free consultation"
              body="A 30-minute call — we will tell you the price and the timeline on it."
              primary
            />
            <NotSureLink
              href="/estimate"
              icon={<Calculator className="size-5" aria-hidden />}
              title="Get an instant estimate"
              body="Select a service and features to see an indicative price range."
            />
          </div>
        </div>
      </Section>

      <DeferredSection minHeight={820}>
        <ProcessDark />
      </DeferredSection>

      <JsonLd data={breadcrumbJsonLd([{ name: "Services", path: "/services" }])} />
    </>
  );
}

function NotSureLink({
  href,
  icon,
  title,
  body,
  primary = false,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  primary?: boolean;
}) {
  return (
    <Magnetic strength={0.08} className="block">
      <Link
        href={href}
        className={cn(
          "group flex items-center gap-4 rounded-2xl border p-5 transition-colors duration-300",
          primary
            ? "border-setu bg-setu text-white hover:bg-setu-dark"
            : "border-white/15 bg-white/5 text-white backdrop-blur-sm hover:border-setu/70 hover:bg-white/10",
        )}
      >
        <span
          className={cn(
            "inline-flex size-11 shrink-0 items-center justify-center rounded-xl",
            primary ? "bg-white/15" : "bg-setu/20 text-setu",
          )}
        >
          {icon}
        </span>
        <span className="flex-1">
          <span className="block font-semibold">{title}</span>
          <span className={cn("mt-0.5 block text-sm", primary ? "text-white/85" : "text-white/60")}>
            {body}
          </span>
        </span>
        <ArrowRight
          className="size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
          aria-hidden
        />
      </Link>
    </Magnetic>
  );
}
