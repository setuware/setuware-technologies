import Link from "next/link";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";

import { footerNav, site } from "@/lib/site";
import { currentYear } from "@/lib/time";
import { ButtonLink } from "@/components/ui/button";
import { GitHubIcon, LinkedInIcon, XIcon } from "@/components/ui/social-icons";
import { NewsletterForm } from "@/components/interactive/newsletter-form";

const SOCIALS = [
  { href: site.social.linkedin, label: "LinkedIn", Icon: LinkedInIcon },
  { href: site.social.github, label: "GitHub", Icon: GitHubIcon },
  { href: site.social.x, label: "X", Icon: XIcon },
] as const;

/**
 * Site footer.
 *
 * Dark in both themes, with the wordmark set as oversized type rather than an
 * image — it scales to any viewport, costs nothing to download, and remains
 * selectable text.
 */
export async function Footer() {
  const year = await currentYear();

  return (
    <footer className="relative overflow-hidden bg-[#06080f] text-white">
      <div className="container-page relative py-16 md:py-20">
        {/* Closing call to action */}
        <div className="grid gap-8 border-b border-white/10 pb-14 md:grid-cols-[1.3fr_1fr] md:items-end">
          <div>
            <h2 className="max-w-lg text-3xl font-semibold leading-tight text-white sm:text-[2.3rem]">
              Have a challenge to solve or an idea to explore?
            </h2>
            <p className="mt-4 max-w-md text-[0.9rem] leading-relaxed text-white/60">
              Book a free consultation with our team to discuss your needs and
              discover how the right software can help your business work
              smarter.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
            <ButtonLink href="/contact" variant="gradient" className="rounded-full">
              Start A Project
              <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
            <ButtonLink
              href="/contact?intent=consultation"
              variant="ghost"
              className="rounded-full border border-white/30 text-white hover:bg-white/12"
            >
              Book a Free Consultation
            </ButtonLink>
          </div>
        </div>

        {/* Oversized wordmark */}
        <p
          className="mt-12 select-none font-display font-semibold leading-[0.85] tracking-tight text-white"
          style={{ fontSize: "clamp(3.5rem, 15vw, 11rem)" }}
        >
          {site.shortName}
        </p>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_1.5fr]">
          <div className="flex flex-col gap-4">
            <a
              href={`mailto:${site.salesEmail}`}
              className="inline-flex items-center gap-2.5 text-sm text-white/70 transition-colors hover:text-white"
            >
              <Mail className="size-4 shrink-0 text-sky-400" aria-hidden />
              {site.salesEmail}
            </a>
            <a
              href={site.phoneHref}
              className="inline-flex items-center gap-2.5 text-sm text-white/70 transition-colors hover:text-white"
            >
              <Phone className="size-4 shrink-0 text-sky-400" aria-hidden />
              {site.phone}
            </a>
            <span className="inline-flex items-start gap-2.5 text-sm text-white/70">
              <MapPin className="mt-0.5 size-4 shrink-0 text-sky-400" aria-hidden />
              <span>
                {site.address.street}, {site.address.city},{" "}
                {site.address.region} {site.address.postalCode}
              </span>
            </span>

            <div className="flex items-center gap-2 pt-2">
              {SOCIALS.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex size-9 items-center justify-center rounded-lg border border-white/15 text-white/60 transition-colors hover:border-sky-400/50 hover:text-white"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {footerNav.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white">
                  {group.title}
                </h3>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/60 transition-colors hover:text-sky-300"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-14 rounded-card border border-white/10 bg-white/[0.04] p-6 md:p-7">
          <div className="grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-center">
            <div>
              <h3 className="text-lg font-semibold text-white">
                One useful email a month
              </h3>
              <p className="mt-1.5 text-sm text-white/60">
                What we learned shipping and running production software.
                Unsubscribe in one click.
              </p>
            </div>
            <NewsletterForm source="footer" />
          </div>
        </div>

        <div className="mt-10 flex flex-col-reverse items-start justify-between gap-4 border-t border-white/10 pt-7 text-xs text-white/50 sm:flex-row sm:items-center">
          <p>
            © {year} {site.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/privacy" className="transition-colors hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms
            </Link>
            <Link href="/status" className="transition-colors hover:text-white">
              Status
            </Link>
            <span className="inline-flex items-center gap-1.5">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full rounded-full bg-emerald-400 motion-safe:animate-pulse-ring" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
              </span>
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
