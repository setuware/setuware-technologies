import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { ContactForm } from "@/components/interactive/contact-form";
import { PageHero } from "@/components/layout/page-hero";

export const metadata = pageMetadata({
  title: "Contact us",
  description:
    "Tell us what you are building. An engineer reads every enquiry and replies within one working day.",
  path: "/contact",
});

const CHANNELS = [
  {
    Icon: Mail,
    label: "Email",
    value: site.email,
    href: `mailto:${site.email}`,
    hint: "Replies within one working day",
  },
  {
    Icon: Phone,
    label: "Phone",
    value: site.phone,
    href: site.phoneHref,
    hint: "Mon–Fri, 10:00–19:00 IST",
  },
  {
    Icon: MessageCircle,
    label: "WhatsApp",
    value: "Message us",
    href: site.whatsapp,
    hint: "Fastest for quick questions",
  },
] as const;

export default function ContactPage() {
  return (
    <>
      <PageHero
        align="left"
        eyebrow="Contact"
        title="Tell us what you are trying to ship"
        description="The more context you give, the more useful our first reply will be. An engineer reads this — not a sales inbox."
      />

      <div className="container-page grid gap-12 py-14 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        <ContactForm />

        <aside className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            {CHANNELS.map(({ Icon, label, value, href, hint }) => (
              <a
                key={label}
                href={href}
                {...(href.startsWith("http")
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="flex items-start gap-3.5 rounded-card border border-border bg-surface p-4 transition-colors hover:border-primary/40"
              >
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-[18px]" aria-hidden />
                </span>
                <span>
                  <span className="block text-xs uppercase tracking-wider text-muted-foreground">
                    {label}
                  </span>
                  <span className="block text-sm font-medium text-foreground">
                    {value}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {hint}
                  </span>
                </span>
              </a>
            ))}
          </div>

          <div className="rounded-card border border-border bg-background-subtle p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <MapPin className="size-4 text-primary" aria-hidden />
              Where we are
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {site.address.street}
              <br />
              {site.address.city}, {site.address.region} {site.address.postalCode}
              <br />
              India
            </p>
          </div>

          <div className="rounded-card border border-border bg-background-subtle p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Clock className="size-4 text-primary" aria-hidden />
              What happens next
            </h2>
            <ol className="mt-3 flex flex-col gap-2.5 text-sm text-muted-foreground">
              {[
                "An engineer reads your brief and replies within one working day",
                "A 45-minute discovery call, with a written summary afterwards",
                "A fixed-price proposal within three to five days",
              ].map((step, index) => (
                <li key={step} className="flex gap-2.5">
                  <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/12 font-mono text-[10px] font-semibold text-primary">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <p className="rounded-card border border-border bg-surface p-5 text-xs leading-relaxed text-muted-foreground">
            Need an NDA before you share details? Say so in the brief — or send
            yours to {site.email} and we will sign it before the call.
          </p>
        </aside>
      </div>
    </>
  );
}
