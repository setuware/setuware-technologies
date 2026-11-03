import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Calculator,
  CalendarClock,
  Clock,
  FileSignature,
  LifeBuoy,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  PhoneCall,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { ContactForm } from "@/components/interactive/contact-form";
import { PageHero } from "@/components/layout/page-hero";
import { CARD, CARD_HOVER, IconTile, SectionIntro } from "@/components/sections/page-blocks";
import { Section } from "@/components/ui/section";
import { FadeUp, Stagger, StaggerItem } from "@/components/motion/primitives";

export const metadata = pageMetadata({
  title: "Contact Our Gurugram Web Development Team",
  description: `Contact ${site.name} about your website, e-commerce, app or software project. Our team responds within one business day. Call ${site.phone}.`,
  path: "/contact",
});

const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=MG+Road+Gurugram";

/** One inbox per kind of enquiry, so each message reaches the right person first time. */
const EMAIL_ROUTES = [
  {
    Icon: Sparkles,
    label: "New projects",
    email: site.salesEmail,
    body: "Websites, e-commerce, applications and software. Briefs sent through this form arrive here.",
  },
  {
    Icon: LifeBuoy,
    label: "Existing clients",
    email: site.supportEmail,
    body: "Technical support, change requests, hosting and maintenance plans.",
  },
  {
    Icon: Mail,
    label: "General enquiries",
    email: site.generalEmail,
    body: "Partnerships, media and all other enquiries.",
  },
] as const;

const NEXT_STEPS = [
  {
    Icon: PhoneCall,
    title: "Response within one business day",
    body: "Our team reviews your brief and responds by email or telephone.",
  },
  {
    Icon: CalendarClock,
    title: "Free consultation",
    body: "A 30-minute call to discuss your goals, budget and timeline, followed by a written summary.",
  },
  {
    Icon: FileSignature,
    title: "Fixed-price proposal",
    body: "A written scope, timeline and fixed price, typically within three to five business days.",
  },
] as const;

export default function ContactPage() {
  const [hoursDays, hoursTime = ""] = site.hours.split(", ");
  return (
    <>
      <PageHero
        video="contact"
        align="left"
        eyebrow="Contact"
        title="Contact us"
        description="Tell us about your project and our team will respond within one business day."
      />

      <Section surface="tint" className="py-14 md:py-20">
        <div className="container-page grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-10">
          {/* Form */}
          <FadeUp
            y={24}
            blur={false}
            immediate
            className={cn(CARD, "p-6 sm:p-8 md:p-10 lg:sticky lg:top-28 lg:self-start")}
          >
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-setu">
              <span className="h-px w-6 bg-setu/60" aria-hidden />
              Project brief
            </span>
            <h2 className="mt-3 font-display text-2xl font-semibold text-foreground sm:text-[1.75rem]">
              Tell us about your project
            </h2>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-muted-foreground">
              Share your requirements and we will recommend an approach with an
              indicative budget. Fields marked * are required.
            </p>
            <div className="mt-7 border-t border-border pt-7">
              <ContactForm />
            </div>
          </FadeUp>

          {/* Contact details */}
          <aside aria-labelledby="contact-details-title" className="flex flex-col gap-4">
            <h2 id="contact-details-title" className="sr-only">
              Contact details
            </h2>

            <Stagger as="ul" className="flex flex-col gap-3" stagger={0.06}>
              {EMAIL_ROUTES.map(({ Icon, label, email, body }) => (
                <StaggerItem key={email} as="li" y={16}>
                  <a
                    href={`mailto:${email}`}
                    className={cn(CARD, CARD_HOVER, "group flex items-start gap-4 p-5")}
                  >
                    <IconTile>
                      <Icon className="size-5" aria-hidden />
                    </IconTile>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-foreground">{label}</span>
                        <ArrowUpRight
                          className="size-4 shrink-0 text-muted-foreground transition-[color,transform] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-setu"
                          aria-hidden
                        />
                      </span>
                      <span className="mt-0.5 block break-all text-sm font-medium text-[#00708c] dark:text-setu">
                        {email}
                      </span>
                      <span className="mt-1.5 block text-[0.85rem] leading-relaxed text-muted-foreground">
                        {body}
                      </span>
                    </span>
                  </a>
                </StaggerItem>
              ))}
            </Stagger>

            <FadeUp y={16} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <a href={site.phoneHref} className={cn(CARD, CARD_HOVER, "flex items-center gap-3.5 p-4")}>
                <IconTile className="size-10">
                  <Phone className="size-[18px]" aria-hidden />
                </IconTile>
                <span className="min-w-0">
                  <span className="block text-xs uppercase tracking-wider text-muted-foreground">
                    Telephone
                  </span>
                  <span className="block text-sm font-semibold text-foreground">{site.phone}</span>
                </span>
              </a>
              <a
                href={site.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(CARD, CARD_HOVER, "flex items-center gap-3.5 p-4")}
              >
                <IconTile className="size-10">
                  <MessageCircle className="size-[18px]" aria-hidden />
                </IconTile>
                <span className="min-w-0">
                  <span className="block text-xs uppercase tracking-wider text-muted-foreground">
                    WhatsApp
                  </span>
                  <span className="block text-sm font-semibold text-foreground">{site.phone}</span>
                </span>
              </a>
            </FadeUp>

            <FadeUp y={16} className={cn(CARD, "overflow-hidden")}>
              <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <div className="flex items-start gap-3.5">
                  <IconTile className="size-10">
                    <MapPin className="size-[18px]" aria-hidden />
                  </IconTile>
                  <address className="text-sm not-italic leading-relaxed text-muted-foreground">
                    <span className="block text-xs uppercase tracking-wider">Office</span>
                    <span className="block font-semibold text-foreground">{site.address.street}</span>
                    {site.address.city}, {site.address.region} {site.address.postalCode}
                    <br />
                    India
                  </address>
                </div>
                <div className="flex items-start gap-3.5">
                  <IconTile className="size-10">
                    <Clock className="size-[18px]" aria-hidden />
                  </IconTile>
                  <span className="text-sm leading-relaxed text-muted-foreground">
                    <span className="block text-xs uppercase tracking-wider">Office hours</span>
                    <span className="block font-semibold text-foreground">{hoursDays}</span>
                    {hoursTime}
                  </span>
                </div>
              </div>
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-3 border-t border-border bg-background-subtle px-5 py-3.5 text-sm font-medium text-foreground transition-colors hover:text-setu"
              >
                <span className="flex items-center gap-2">
                  <MapPin className="size-4 text-setu" aria-hidden />
                  View MG Road, Gurugram on Google Maps
                </span>
                <ArrowUpRight
                  className="size-4 shrink-0 text-muted-foreground transition-[color,transform] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-setu"
                  aria-hidden
                />
              </a>
            </FadeUp>

            <FadeUp y={16} className={cn(CARD, "flex flex-col gap-3.5 p-5 text-[0.85rem] leading-relaxed text-muted-foreground")}>
              <p className="flex gap-3">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-setu" aria-hidden />
                <span>
                  We can sign a non-disclosure agreement before detailed
                  discussions. Please mention this in your brief.
                </span>
              </p>
              <p className="flex gap-3">
                <Calculator className="mt-0.5 size-4 shrink-0 text-setu" aria-hidden />
                <span>
                  For an indicative budget, use the{" "}
                  <Link href="/estimate" className="font-medium text-[#00708c] underline underline-offset-2 dark:text-setu">
                    instant estimator
                  </Link>{" "}
                  or review our{" "}
                  <Link href="/pricing" className="font-medium text-[#00708c] underline underline-offset-2 dark:text-setu">
                    pricing
                  </Link>
                  .
                </span>
              </p>
            </FadeUp>
          </aside>
        </div>
      </Section>

      {/* What happens next */}
      <Section surface="grid">
        <div className="container-page">
          <SectionIntro
            eyebrow="What happens next"
            title="From your brief to a fixed-price proposal"
            description="Three steps from your first message to a written proposal."
          />

          <Stagger as="ol" className="relative mt-14 grid gap-5 md:grid-cols-3" stagger={0.08}>
            <span
              aria-hidden
              className="pointer-events-none absolute left-[16.6%] right-[16.6%] top-[2.9rem] hidden h-px bg-gradient-to-r from-setu/0 via-setu/50 to-setu/0 md:block"
            />
            {NEXT_STEPS.map(({ Icon, title, body }, index) => (
              <StaggerItem
                key={title}
                as="li"
                y={22}
                className={cn(CARD, "relative flex h-full flex-col items-start p-6 md:items-center md:text-center")}
              >
                <span className="relative inline-flex size-11 items-center justify-center rounded-full bg-setu text-white shadow-[0_0_0_6px_rgb(0_161_198/0.12)]">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="mt-5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-setu">
                  Step {index + 1}
                </span>
                <h3 className="mt-1.5 text-lg font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-[0.9rem] leading-relaxed text-muted-foreground">{body}</p>
              </StaggerItem>
            ))}
          </Stagger>

          <FadeUp y={16} className="mt-10 flex justify-center">
            <Link
              href="/process"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00708c] transition-colors hover:text-setu dark:text-setu"
            >
              See our full delivery process
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </FadeUp>
        </div>
      </Section>
      <JsonLd data={breadcrumbJsonLd([{ name: "Contact", path: "/contact" }])} />
    </>
  );
}
