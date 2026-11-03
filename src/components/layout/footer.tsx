import Link from "next/link";
import { ArrowRight, Check, Clock, Mail, MapPin, Phone, Plus } from "lucide-react";

import { site } from "@/lib/site";
import { services } from "@/lib/content";
import { industries } from "@/lib/industries";
import { currentYear } from "@/lib/time";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/layout/logo";
import {
  GitHubIcon,
  LinkedInIcon,
  WhatsAppIcon,
} from "@/components/ui/social-icons";
import { NewsletterForm } from "@/components/interactive/newsletter-form";
import { FadeUp, Magnetic } from "@/components/motion/primitives";

/**
 * Site footer.
 *
 * Dark in both themes. Reading order: a closing call to action, the brand and
 * newsletter, the sitemap (columns on desktop, accordions below `lg`), then
 * the legal bar. The name closes the page as a large, low-contrast, cropped
 * watermark — decorative, hidden from assistive tech.
 *
 * Server component: only the motion wrappers and the newsletter form are
 * client leaves. The `dark` class switches the design tokens (inputs, rings)
 * to their dark values for everything inside.
 */

const OFFICE_HOURS = site.hours;

/** One address per kind of enquiry, so mail lands with the right person. */
const EMAIL_ROUTES = [
  { label: "Sales and new projects", email: site.salesEmail },
  { label: "Client support", email: site.supportEmail },
  { label: "General enquiries", email: site.generalEmail },
] as const;
const INDUSTRIES_SHOWN = 6;

type FooterLinkItem = { label: string; href: string };
type FooterColumn = { title: string; links: readonly FooterLinkItem[] };

const COLUMNS: readonly FooterColumn[] = [
  {
    title: "Services",
    links: services.map((service) => ({
      label: service.name,
      href: `/services/${service.slug}`,
    })),
  },
  {
    title: "Industries",
    links: [
      ...industries.slice(0, INDUSTRIES_SHOWN).map((industry) => ({
        label: industry.name,
        href: `/industries/${industry.slug}`,
      })),
      { label: "All industries", href: "/industries" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "How we work", href: "/process" },
      { label: "Projects", href: "/work" },
      { label: "Careers", href: "/careers" },
      { label: "Blog & insights", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Pricing", href: "/pricing" },
      { label: "Instant estimate", href: "/estimate" },
      { label: "FAQs", href: "/#faq" },
      { label: "Service status", href: "/status" },
    ],
  },
];

const SOCIALS = [
  { href: site.social.linkedin, label: "LinkedIn", Icon: LinkedInIcon },
  { href: site.social.github, label: "GitHub", Icon: GitHubIcon },
] as const;

const PROMISES = ["Fixed-price proposals", "Complete ownership", "Dedicated support"];

/** Hairline that sweeps in from the left on hover / focus of the parent link. */
const UNDERLINE =
  "relative after:pointer-events-none after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-500 after:ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/link:after:origin-left group-hover/link:after:scale-x-100 group-focus-visible/link:after:origin-left group-focus-visible/link:after:scale-x-100 motion-reduce:after:transition-none";

/** Small column heading. A real h2 for the outline, set like a label. */
const COLUMN_HEADING = "text-[0.8125rem] font-semibold tracking-[-0.005em] text-white";

function FooterLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "group/link inline-flex min-h-11 items-center text-[0.9375rem] text-white/70 transition-colors duration-200 hover:text-white lg:min-h-0 lg:text-sm",
        className,
      )}
    >
      <span className={UNDERLINE}>{children}</span>
    </Link>
  );
}

function ContactList() {
  const row = "group/link inline-flex min-h-11 items-center gap-3 text-[0.9375rem] text-white/70 transition-colors hover:text-white lg:min-h-0 lg:text-sm";
  const icon = "size-4 shrink-0 text-[#22b8db]";

  return (
    <ul className="flex flex-col gap-1 lg:gap-3.5">
      <li>
        <a href={site.phoneHref} className={row}>
          <Phone className={icon} aria-hidden />
          <span className={UNDERLINE}>{site.phone}</span>
        </a>
      </li>
      <li>
        <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className={row}>
          <WhatsAppIcon className={icon} />
          <span className={UNDERLINE}>
            WhatsApp us<span className="sr-only"> (opens in a new tab)</span>
          </span>
        </a>
      </li>
      {EMAIL_ROUTES.map((route) => (
        <li key={route.email}>
          <a href={`mailto:${route.email}`} className={cn(row, "items-start py-1.5 lg:py-0")}>
            <Mail className={cn(icon, "mt-0.5")} aria-hidden />
            <span className="flex min-w-0 flex-col">
              <span className="text-xs text-white/45">{route.label}</span>
              <span className={cn(UNDERLINE, "break-all")}>{route.email}</span>
            </span>
          </a>
        </li>
      ))}
      <li className="flex items-start gap-3 py-2.5 text-[0.9375rem] leading-snug text-white/70 lg:py-0 lg:text-sm">
        <MapPin className={cn(icon, "mt-0.5")} aria-hidden />
        <address className="not-italic">
          {site.address.street}, {site.address.city},
          <br />
          {site.address.region} {site.address.postalCode}
        </address>
      </li>
      <li className="flex items-start gap-3 py-2.5 text-[0.9375rem] leading-snug text-white/70 lg:py-0 lg:text-sm">
        <Clock className={cn(icon, "mt-0.5")} aria-hidden />
        <span>{OFFICE_HOURS}</span>
      </li>
    </ul>
  );
}

export async function Footer() {
  const year = await currentYear();

  return (
    <footer className="dark relative isolate overflow-hidden bg-[#05070d] text-white [--primary:#22b8db] [--ring:#22b8db]">
      {/* Ambient light behind the call to action. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[38rem] bg-[radial-gradient(55%_60%_at_50%_0%,rgba(0,161,198,0.16),transparent_70%)]"
      />

      <div className="container-page pt-16 md:pt-24">
        {/* 1 — Closing call to action */}
        <FadeUp y={24}>
          <section
            aria-labelledby="footer-cta-title"
            className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0b1020] px-6 py-10 sm:px-10 md:py-14 lg:px-14"
          >
            {/* Lit top edge, a faint grid and a corner glow. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-10 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(34,184,219,0.7),transparent)]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(70%_90%_at_100%_0%,black,transparent)]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-32 size-[28rem] rounded-full bg-[#00a1c6]/20 blur-[110px]"
            />

            <div className="relative grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-end lg:gap-12">
              <div>
                <h2
                  id="footer-cta-title"
                  className="text-[2rem] font-semibold leading-[1.08] tracking-[-0.035em] text-white sm:text-[2.5rem] lg:text-[3.25rem]"
                >
                  Ready to start your project?
                </h2>
                <p className="mt-5 max-w-xl text-[0.975rem] leading-relaxed text-white/70">
                  Talk to our team about your goals and we will recommend the right approach with a
                  clear proposal.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                <Magnetic strength={0.2} className="block sm:inline-block">
                  <Link
                    href="/contact"
                    className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-6 text-[0.95rem] font-semibold text-[#05070d] shadow-[0_8px_30px_-8px_rgba(34,184,219,0.55)] transition-[background-color,box-shadow] duration-300 hover:bg-[#e6f8fc] hover:shadow-[0_10px_40px_-6px_rgba(34,184,219,0.7)] sm:w-auto"
                  >
                    Start a project
                    <ArrowRight
                      className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
                      aria-hidden
                    />
                  </Link>
                </Magnetic>
                <Magnetic strength={0.2} className="block sm:inline-block">
                  <Link
                    href="/estimate"
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 text-[0.95rem] font-semibold text-white transition-colors duration-300 hover:border-white/30 hover:bg-white/[0.09] sm:w-auto"
                  >
                    Get an instant estimate
                  </Link>
                </Magnetic>
              </div>
            </div>

            <ul className="relative mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-white/70 sm:flex-row sm:flex-wrap sm:gap-x-8">
              {PROMISES.map((promise) => (
                <li key={promise} className="inline-flex items-center gap-2.5">
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-[#00a1c6]/15 text-[#22b8db]">
                    <Check className="size-3" strokeWidth={3} aria-hidden />
                  </span>
                  {promise}
                </li>
              ))}
            </ul>
          </section>
        </FadeUp>

        {/* 2 — Brand, sitemap and newsletter */}
        <div className="mt-16 grid gap-y-12 md:mt-20 lg:grid-cols-12 lg:gap-x-8">
          <FadeUp y={20} className="lg:col-span-5">
            <Logo inverted />
            <p className="mt-6 max-w-[26rem] text-[1.0625rem] leading-relaxed text-white/70">
              {site.slogan}
            </p>
          </FadeUp>

          <FadeUp y={20} delay={0.08} className="order-last lg:order-none lg:col-span-6 lg:col-start-7">
            <section
              aria-labelledby="footer-newsletter-title"
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"
            >
              <h2 id="footer-newsletter-title" className="text-base font-semibold tracking-[-0.01em] text-white">
                Insights, once a month
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-white/65">
                Practical articles on technology, design and digital growth.
              </p>
              <div className="mt-4">
                <NewsletterForm source="footer" />
              </div>
            </section>
          </FadeUp>

          <nav
            aria-label="Footer"
            className="grid gap-x-8 border-white/10 lg:col-span-12 lg:grid-cols-[1.25fr_1.2fr_0.85fr_0.85fr_1.1fr] lg:border-t lg:pt-14"
          >
            {/* Desktop: open columns */}
            {COLUMNS.map((column, index) => (
              <FadeUp key={column.title} y={20} delay={0.06 * index} className="hidden lg:block">
                <h2 className={COLUMN_HEADING}>{column.title}</h2>
                <ul className="mt-5 flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <FooterLink href={link.href}>{link.label}</FooterLink>
                    </li>
                  ))}
                </ul>
              </FadeUp>
            ))}

            {/* Contact: first on small screens, last column on desktop */}
            <div className="order-first border-b border-white/10 pb-6 lg:order-none lg:border-0 lg:pb-0">
              <h2 className={COLUMN_HEADING}>Talk to us</h2>
              <div className="mt-3 lg:mt-5">
                <ContactList />
              </div>
            </div>

            {/* Below lg: accordions keep the page short and tap targets large */}
            <div className="lg:hidden">
              {COLUMNS.map((column) => (
                <details key={column.title} className="group border-b border-white/10">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-md [&::-webkit-details-marker]:hidden">
                    <h2 className="text-[0.975rem] font-semibold tracking-[-0.01em] text-white">
                      {column.title}
                    </h2>
                    <Plus
                      className="size-4 text-white/60 transition-transform duration-300 group-open:rotate-45"
                      aria-hidden
                    />
                  </summary>
                  <ul className="grid pb-4 sm:grid-cols-2 sm:gap-x-8">
                    {column.links.map((link) => (
                      <li key={link.href}>
                        <FooterLink href={link.href} className="w-full">
                          {link.label}
                        </FooterLink>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          </nav>
        </div>

        {/* 4 — Legal bar */}
        <div className="mt-16 flex flex-col gap-6 border-t border-white/10 py-7 text-[0.8125rem] text-white/60 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6">
            <p>
              © {year} {site.name}. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="group/link inline-flex min-h-11 items-center transition-colors hover:text-white md:min-h-0"
              >
                <span className={UNDERLINE}>Privacy</span>
              </Link>
              <Link
                href="/terms"
                className="group/link inline-flex min-h-11 items-center transition-colors hover:text-white md:min-h-0"
              >
                <span className={UNDERLINE}>Terms</span>
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 md:justify-end">
            <ul className="-mx-2 flex items-center md:mx-0 md:gap-1">
              {SOCIALS.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${label} (opens in a new tab)`}
                    className="inline-flex size-11 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/[0.07] hover:text-white md:size-9"
                  >
                    <Icon className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 5 — Cropped watermark: present, never loud. */}
      <div aria-hidden className="pointer-events-none select-none overflow-hidden">
        <div className="container-page">
          <p className="-mb-[0.36em] whitespace-nowrap text-center font-[family-name:var(--font-brand)] text-[clamp(4rem,19vw,16.5rem)] font-semibold leading-[0.9] tracking-[-0.07em] text-transparent [background-clip:text] [-webkit-background-clip:text] bg-[linear-gradient(180deg,rgba(255,255,255,0.10)_0%,rgba(34,184,219,0.06)_45%,rgba(255,255,255,0)_80%)]">
            Setuware
          </p>
        </div>
      </div>
    </footer>
  );
}
