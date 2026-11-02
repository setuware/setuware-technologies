import Link from "next/link";
import { ArrowRight, Calculator, MessageCircle } from "lucide-react";

import { serviceGroups, services } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/layout/page-hero";
import { FadeUp, Magnetic, Stagger, StaggerItem } from "@/components/motion/primitives";
import { TextReveal } from "@/components/motion/text-reveal";
import { ServiceCard } from "@/components/services/service-card";
import { ProcessDark } from "@/components/sections/process-dark";
import { DeferredSection } from "@/components/ui/deferred-section";
import { cn } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Web, App, SEO & Software Services",
  description:
    "Business websites, online stores, web and mobile apps, branding, SEO, custom ERP and CRM, AI automation, hosting and support. One team in Gurugram.",
  path: "/services",
});

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
        eyebrow="Services"
        title="Start with a website. Grow from there."
        description="Most clients start with a website, then come back for a store, an app, marketing or the software that runs the back office. The same team designs it, builds it, hosts it and answers the phone when something breaks."
      >
        <nav aria-label="Service groups" className="mt-8 flex flex-wrap justify-center gap-2">
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

      {groups.map((group, index) => (
        <section
          key={group.id}
          id={group.id}
          aria-labelledby={`${group.id}-heading`}
          className={cn(
            "scroll-mt-24 py-16 md:py-24",
            index % 2 === 1 && "bg-background-subtle",
          )}
        >
          <div className="container-page grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,2fr)] lg:gap-14">
            <FadeUp className="lg:sticky lg:top-28 lg:self-start">
              <span className="font-mono text-sm text-setu">
                0{index + 1} / {group.label}
              </span>
              <h2
                id={`${group.id}-heading`}
                className="mt-3 font-display text-3xl font-semibold leading-tight text-foreground sm:text-[2.2rem]"
              >
                {group.title}
              </h2>
              <p className="mt-3 max-w-sm text-[0.98rem] leading-relaxed text-muted-foreground">
                {group.description}
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
        </section>
      ))}

      <section className="py-16 md:py-24" aria-labelledby="not-sure-heading">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-[1.6rem] bg-black px-6 py-12 text-white sm:px-10 md:px-14 md:py-16">
            <div
              className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-setu/25 blur-3xl"
              aria-hidden
            />
            <div className="relative grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-setu">
                  Not sure what you need?
                </span>
                <TextReveal
                  as="h2"
                  id="not-sure-heading"
                  className="mt-4 font-display text-3xl font-semibold leading-tight sm:text-[2.4rem]"
                >
                  {"Tell us the problem.\nWe'll suggest the fix."}
                </TextReveal>
                <p className="mt-4 max-w-lg text-[1rem] leading-relaxed text-white/70">
                  Clients often ask for an app when a better website would do the job, or
                  for a redesign when the real gap is tracking. A free 30-minute call with an
                  engineer settles it.
                </p>
              </div>

              <div className="grid gap-3">
                <NotSureLink
                  href="/contact"
                  icon={<MessageCircle className="size-5" aria-hidden />}
                  title="Book a free 30-min call"
                  body="Speak to the people who would build it, not a sales team."
                  primary
                />
                <NotSureLink
                  href="/estimate"
                  icon={<Calculator className="size-5" aria-hidden />}
                  title="Get an instant estimate"
                  body="Choose a service and features, and see a price range in about a minute."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <DeferredSection minHeight={820}>
        <ProcessDark />
      </DeferredSection>
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
            : "border-white/15 bg-white/5 text-white hover:border-setu/70 hover:bg-white/10",
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
