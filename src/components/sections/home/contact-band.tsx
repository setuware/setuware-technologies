import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { ContactForm } from "@/components/interactive/contact-form";
import { FadeUp } from "@/components/motion/primitives";
import { site } from "@/lib/site";
import { Eyebrow, SectionTitle } from "./shared";

/** Lead form beside a blue contact panel. */
export function ContactBand() {
  const address = `${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postalCode}`;
  const routes = [
    { icon: Phone, label: "Call sales", value: site.phone, href: site.phoneHref },
    { icon: Mail, label: "Email", value: site.salesEmail, href: `mailto:${site.salesEmail}` },
    { icon: MessageCircle, label: "WhatsApp", value: "Chat with our team", href: site.whatsapp },
    { icon: MapPin, label: "Office", value: address },
    { icon: Clock, label: "Hours", value: site.hours },
  ];

  return (
    <section id="contact" className="relative bg-[#f4f6fc] py-20 dark:bg-surface-2 lg:py-28">
      <div className="container-figma grid gap-8 lg:grid-cols-[1.35fr_1fr]">
        <FadeUp className="rounded-3xl bg-white p-6 shadow-[0_30px_60px_-40px_rgba(15,19,48,0.45)] sm:p-10 dark:bg-surface">
          <Eyebrow>Contact us</Eyebrow>
          <SectionTitle className="!text-[1.8rem] sm:!text-[2.2rem]">Tell us about your project</SectionTitle>
          <p className="mt-3 text-[0.98rem] text-[#5a6180] dark:text-white/70">
            Share a few details and we will reply within one business day with next steps.
          </p>
          <div className="mt-8">
            <ContactForm />
          </div>
        </FadeUp>

        <FadeUp delay={0.1} className="relative overflow-hidden rounded-3xl bg-[linear-gradient(160deg,#3b6cf6,#1d4ed8_55%,#1e3a8a)] p-8 text-white sm:p-10">
          <svg aria-hidden viewBox="0 0 200 200" className="absolute -right-16 -top-16 size-72 text-white/10" fill="none">
            {Array.from({ length: 6 }, (_, k) => (
              <circle key={k} cx="100" cy="100" r={30 + k * 14} stroke="currentColor" />
            ))}
          </svg>
          <p className="relative text-xs font-semibold uppercase tracking-[0.14em] text-white/75">Get in touch</p>
          <p className="relative mt-3 text-[1.7rem] font-bold leading-tight">Speak with our team</p>
          <p className="relative mt-3 text-[0.95rem] leading-relaxed text-white/80">
            A free 30-minute consultation, followed by a written proposal and a fixed quote.
          </p>
          <ul className="relative mt-8 space-y-5">
            {routes.map(({ icon: Icon, label, value, href }) => (
              <li key={label} className="flex items-start gap-4">
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-medium uppercase tracking-[0.08em] text-white/65">{label}</span>
                  {href ? (
                    <a href={href} className="block break-words text-[1rem] font-semibold underline-offset-4 hover:underline" {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                      {value}
                    </a>
                  ) : (
                    <span className="block text-[1rem] font-semibold">{value}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </FadeUp>
      </div>
    </section>
  );
}
