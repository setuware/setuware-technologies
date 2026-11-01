import Link from "next/link";
import { Calculator, Clock, Mail, MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react";

import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { ContactForm } from "@/components/interactive/contact-form";
import { PageHero } from "@/components/layout/page-hero";
import { FadeUp, Stagger, StaggerItem } from "@/components/motion/primitives";

export const metadata = pageMetadata({
  title: "Contact us",
  description: `Tell ${site.name} what you need: a website, online store, app, marketing or support. We reply within one working day. Call or WhatsApp ${site.phone}.`,
  path: "/contact",
});

const CHANNELS = [
  {
    Icon: Phone,
    label: "Call us",
    value: site.phone,
    href: site.phoneHref,
    hint: "Mon–Fri, 10:00–19:00 IST",
  },
  {
    Icon: MessageCircle,
    label: "WhatsApp",
    value: site.phone,
    href: site.whatsapp,
    hint: "Fastest for quick questions",
  },
  {
    Icon: Mail,
    label: "Email",
    value: site.email,
    href: `mailto:${site.email}`,
    hint: "Replies within one working day",
  },
] as const;

const NEXT_STEPS = [
  {
    title: "We reply within one working day",
    body: "The people who would build it read your brief and get back to you by email or phone.",
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
        title="Tell us what you need. We reply within one working day."
        description="A new website, an online store, an app, marketing, or help with something already live. Share a few details and we will come back with clear next steps and a price range."
      />

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
                {site.email}. We sign before the call.
              </span>
            </p>
          </FadeUp>
        </aside>
      </div>
    </>
  );
}
