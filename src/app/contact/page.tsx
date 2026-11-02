import Link from "next/link";
import {
  ArrowUpRight,
  Calculator,
  Clock,
  LifeBuoy,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { ContactForm } from "@/components/interactive/contact-form";
import { PageHero } from "@/components/layout/page-hero";
import { FadeUp, Stagger, StaggerItem } from "@/components/motion/primitives";

export const metadata = pageMetadata({
  title: "Contact us",
  description: `Contact ${site.name} about your website, e-commerce, app or software project. Our team responds within one business day. Call ${site.phone}.`,
  path: "/contact",
});

/** One inbox per kind of enquiry, so each message reaches the right person first time. */
const EMAIL_ROUTES = [
  {
    Icon: Sparkles,
    label: "New projects and proposals",
    email: site.salesEmail,
    body: "Enquiries about new websites, e-commerce stores, applications and software. Messages sent through this form are directed here.",
  },
  {
    Icon: LifeBuoy,
    label: "Client support",
    email: site.supportEmail,
    body: "Technical support, change requests, hosting and maintenance plans for existing clients.",
  },
  {
    Icon: Mail,
    label: "General enquiries",
    email: site.generalEmail,
    body: "Partnerships, media and all other enquiries.",
  },
] as const;

const CHANNELS = [
  {
    Icon: Phone,
    label: "Telephone",
    value: site.phone,
    href: site.phoneHref,
    hint: site.hours,
  },
  {
    Icon: MessageCircle,
    label: "WhatsApp",
    value: site.phone,
    href: site.whatsapp,
    hint: "Recommended for quick questions",
  },
] as const;

const NEXT_STEPS = [
  {
    title: "Response within one business day",
    body: "Our team reviews your enquiry and responds by email or telephone.",
  },
  {
    title: "Free consultation",
    body: "A 30-minute call to discuss your goals, budget and timeline, followed by a written summary.",
  },
  {
    title: "Fixed-price proposal",
    body: "A written scope, timeline and fixed price, typically within three to five business days.",
  },
] as const;

export default function ContactPage() {
  return (
    <>
      <PageHero
        video="contact"
        align="left"
        eyebrow="Contact"
        title="Contact us"
        description="Tell us about your project and our team will respond within one business day."
      />

      <section aria-labelledby="email-routes-title" className="container-page pt-10 md:pt-14">
        <h2
          id="email-routes-title"
          className="text-xs font-semibold uppercase tracking-[0.18em] text-setu"
        >
          Email our team
        </h2>
        <Stagger as="ul" className="mt-4 grid gap-3 md:grid-cols-3" stagger={0.07}>
          {EMAIL_ROUTES.map(({ Icon, label, email, body }) => (
            <StaggerItem key={email} as="li" y={16}>
              <a
                href={`mailto:${email}`}
                className="group flex h-full flex-col gap-3 rounded-card border border-border bg-surface p-5 transition-colors hover:border-setu/50"
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-setu/10 text-setu">
                    <Icon className="size-[18px]" aria-hidden />
                  </span>
                  <ArrowUpRight
                    className="size-4 text-muted-foreground transition-[color,transform] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-setu"
                    aria-hidden
                  />
                </span>
                <span className="font-semibold text-foreground">{label}</span>
                <span className="text-[0.88rem] leading-relaxed text-muted-foreground">{body}</span>
                <span className="mt-auto break-all pt-1 text-sm font-medium text-setu">{email}</span>
              </a>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <div className="container-page grid gap-12 py-14 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        <FadeUp y={24} blur={false} immediate>
          <ContactForm />
        </FadeUp>

        <aside className="flex flex-col gap-6">
          <Stagger className="flex flex-col gap-3" stagger={0.07}>
            {CHANNELS.map(({ Icon, label, value, href, hint }) => (
              <StaggerItem key={label} y={16}>
                <a
                  href={href}
                  {...(href.startsWith("http")
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="flex items-start gap-3.5 rounded-card border border-border bg-surface p-4 transition-colors hover:border-setu/50"
                >
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-setu/10 text-setu">
                    <Icon className="size-[18px]" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs uppercase tracking-wider text-muted-foreground">
                      {label}
                    </span>
                    <span className="block break-words text-sm font-medium text-foreground">
                      {value}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {hint}
                    </span>
                  </span>
                </a>
              </StaggerItem>
            ))}
            <StaggerItem y={16}>
              <div className="flex items-start gap-3.5 rounded-card border border-border bg-surface p-4">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-setu/10 text-setu">
                  <Clock className="size-[18px]" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs uppercase tracking-wider text-muted-foreground">
                    Office hours
                  </span>
                  <span className="block text-sm font-medium text-foreground">{site.hours}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    Emails answered within one business day
                  </span>
                </span>
              </div>
            </StaggerItem>
          </Stagger>

          <FadeUp y={20} className="rounded-card border border-border bg-background-subtle p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Clock className="size-4 text-setu" aria-hidden />
              Next steps
            </h2>
            <ol className="mt-4 flex flex-col gap-4">
              {NEXT_STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-3">
                  <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-setu font-mono text-[11px] font-semibold text-white">
                    {index + 1}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">
                      {step.title}
                    </span>
                    <span className="mt-0.5 block text-[0.85rem] leading-relaxed text-muted-foreground">
                      {step.body}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </FadeUp>

          <FadeUp y={20} className="rounded-card border border-border bg-background-subtle p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <MapPin className="size-4 text-setu" aria-hidden />
              Our office
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {site.name}
              <br />
              {site.address.street}
              <br />
              {site.address.city}, {site.address.region} {site.address.postalCode}
              <br />
              India
            </p>
          </FadeUp>

          <FadeUp y={20} className="flex flex-col gap-3 rounded-card border border-border bg-surface p-5 text-[0.85rem] leading-relaxed text-muted-foreground">
            <p className="flex gap-2.5">
              <Calculator className="mt-0.5 size-4 shrink-0 text-setu" aria-hidden />
              <span>
                For an indicative budget, use our{" "}
                <Link href="/estimate" className="font-medium text-setu underline underline-offset-2">
                  instant estimator
                </Link>{" "}
                or view our{" "}
                <Link href="/pricing" className="font-medium text-setu underline underline-offset-2">
                  pricing
                </Link>
                .
              </span>
            </p>
            <p className="flex gap-2.5">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-setu" aria-hidden />
              <span>
                We are happy to sign a non-disclosure agreement before detailed
                discussions. Please mention this in your message or email{" "}
                {site.salesEmail}.
              </span>
            </p>
          </FadeUp>
        </aside>
      </div>
    </>
  );
}
