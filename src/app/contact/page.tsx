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
  title: "Contact Us: Book a Free Call",
  description: `Tell ${site.name} what you need built: a website, store, app or software. Reply within one working day. Call or WhatsApp ${site.phone}.`,
  path: "/contact",
});

/** One inbox per kind of enquiry, so each message reaches the right person first time. */
const EMAIL_ROUTES = [
  {
    Icon: Sparkles,
    label: "New project",
    email: site.salesEmail,
    body: "Quotes, proposals and new websites, stores, apps or software. The form on this page goes here too.",
  },
  {
    Icon: LifeBuoy,
    label: "Existing client support",
    email: site.supportEmail,
    body: "Bugs, changes, hosting and care plans for a site or app we already look after.",
  },
  {
    Icon: Mail,
    label: "Everything else",
    email: site.generalEmail,
    body: "Partnerships, press and any other question that is not about a project.",
  },
] as const;

const CHANNELS = [
  {
    Icon: Phone,
    label: "Call us",
    value: site.phone,
    href: site.phoneHref,
    hint: site.hours,
  },
  {
    Icon: MessageCircle,
    label: "WhatsApp",
    value: site.phone,
    href: site.whatsapp,
    hint: "Fastest for quick questions",
  },
] as const;

const NEXT_STEPS = [
  {
    title: "A reply within one working day",
    body: "The people who would build it read your brief and reply by email or phone.",
  },
  {
    title: "A free 30-minute call",
    body: "We talk through your goals, budget and deadline. You get a written summary afterwards.",
  },
  {
    title: "A fixed-price proposal",
    body: "Written scope, timeline and one price, usually within three to five working days.",
  },
] as const;

export default function ContactPage() {
  return (
    <>
      <PageHero
        align="left"
        eyebrow="Contact"
        title="Tell us what you need built"
        description="A new website, an online store, an app, marketing, or help with something already live. Share a few details and we will reply within one working day with next steps and a price range."
      />

      <section aria-labelledby="email-routes-title" className="container-page pt-10 md:pt-14">
        <h2
          id="email-routes-title"
          className="text-xs font-semibold uppercase tracking-[0.18em] text-setu"
        >
          Email the right team
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
                    Emails answered within one working day
                  </span>
                </span>
              </div>
            </StaggerItem>
          </Stagger>

          <FadeUp y={20} className="rounded-card border border-border bg-background-subtle p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Clock className="size-4 text-setu" aria-hidden />
              What happens after you submit
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
                Want a number first?{" "}
                <Link href="/estimate" className="font-medium text-setu underline underline-offset-2">
                  Get an instant estimate
                </Link>{" "}
                in about a minute, or see our{" "}
                <Link href="/pricing" className="font-medium text-setu underline underline-offset-2">
                  pricing
                </Link>
                .
              </span>
            </p>
            <p className="flex gap-2.5">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-setu" aria-hidden />
              <span>
                Need an NDA first? Mention it in your message, or email yours to{" "}
                {site.salesEmail}. We sign before the call.
              </span>
            </p>
          </FadeUp>
        </aside>
      </div>
    </>
  );
}
