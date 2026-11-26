import Image from "next/image";
import { Mail, MapPin, Quote } from "lucide-react";

import type { TeamMember } from "@/lib/team";
import { cn } from "@/lib/utils";
import { LIGHT_CARD_SHADOW } from "@/components/sections/services-dark";
import { ButtonLink } from "@/components/ui/button";
import {
  GitHubIcon,
  LinkedInIcon,
  XIcon,
  type SocialIcon,
} from "@/components/ui/social-icons";

/**
 * Portrait slot: the person's photo when one is set, otherwise their initials
 * on the brand gradient. Both are the same size, so adding a photo later
 * changes nothing else in the layout.
 */
function Portrait({ person }: { person: TeamMember }) {
  return (
    <div className="relative mx-auto size-40 shrink-0 sm:size-48 lg:size-56">
      <div
        aria-hidden
        className="absolute -inset-3 rounded-full bg-[conic-gradient(from_200deg,rgba(47,86,216,0.35),rgba(10,52,166,0.12),rgba(47,86,216,0.35))] opacity-70 blur-xl"
      />
      <div className="relative size-full overflow-hidden rounded-full ring-[6px] ring-white shadow-[0_24px_48px_-20px_rgba(10,52,166,0.55)] dark:ring-surface">
        {person.photo ? (
          <Image
            src={person.photo}
            alt={`Portrait of ${person.name}`}
            fill
            sizes="(min-width: 1024px) 14rem, 12rem"
            className="object-cover"
          />
        ) : (
          <span
            role="img"
            aria-label={`${person.name} (initials)`}
            className="flex size-full items-center justify-center bg-[linear-gradient(135deg,#2f56d8_0%,#0a6fb8_55%,#0a34a6_100%)] font-display text-[3.25rem] font-semibold tracking-[-0.02em] text-white sm:text-[3.75rem] lg:text-[4.25rem]"
          >
            {person.initials}
          </span>
        )}
      </div>
    </div>
  );
}

/** The person's public profiles that are set, in a fixed order. */
function profiles(
  person: TeamMember,
): { href: string; label: string; Icon: SocialIcon }[] {
  const all = [
    { href: person.linkedin, label: "LinkedIn", Icon: LinkedInIcon },
    { href: person.github, label: "GitHub", Icon: GitHubIcon },
    { href: person.x, label: "X", Icon: XIcon },
  ];
  return all.filter(
    (p): p is { href: string; label: string; Icon: SocialIcon } =>
      Boolean(p.href),
  );
}

/** A large, light profile card: portrait, name and role, bio, quote and contact links. */
export function FounderCard({ person }: { person: TeamMember }) {
  return (
    <article
      aria-labelledby="founder-name"
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border border-border bg-surface",
        LIGHT_CARD_SHADOW,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 size-80 rounded-full bg-setu/15 blur-[90px]"
      />
      <div className="relative grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)]">
        {/* Portrait panel */}
        <div className="flex flex-col items-center justify-center gap-5 border-b border-border bg-[linear-gradient(160deg,#effafd,#f6fbfe_60%,#eef6fc)] px-6 py-10 text-center sm:py-12 lg:border-r lg:border-b-0 lg:py-16 dark:bg-[linear-gradient(160deg,#08202a,var(--surface))]">
          <Portrait person={person} />
          <p className="inline-flex items-center gap-1.5 rounded-full border border-setu/20 bg-white/80 px-3 py-1 text-xs font-semibold text-foreground/80 dark:bg-surface/80">
            <MapPin className="size-3.5 text-setu" aria-hidden />
            Based in {person.location}
          </p>
        </div>

        {/* Details */}
        <div className="flex flex-col px-6 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-14">
          <h3
            id="founder-name"
            className="font-display text-[1.9rem] font-semibold leading-tight text-foreground sm:text-[2.2rem]"
          >
            {person.name}
          </h3>
          <p className="mt-1.5 text-[0.95rem] font-semibold text-setu">
            {person.role}
          </p>
          <p className="mt-5 max-w-2xl text-[1.02rem] leading-relaxed text-muted-foreground">
            {person.bio}
          </p>

          <div className="mt-7 max-w-2xl rounded-2xl border border-setu/15 bg-[linear-gradient(120deg,rgba(47,86,216,0.07),rgba(10,52,166,0.03))] p-5 sm:p-6">
            <Quote className="size-5 fill-setu/20 text-setu" aria-hidden />
            <blockquote className="mt-3">
              <p className="font-display text-[1.15rem] font-semibold leading-snug tracking-[-0.01em] text-foreground sm:text-[1.3rem]">
                {person.quote}
              </p>
            </blockquote>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink
              href={`mailto:${person.email}`}
              className="w-full rounded-full bg-setu text-white shadow-[0_10px_24px_-10px_rgba(47,86,216,0.8)] hover:bg-setu-dark sm:w-auto"
            >
              <Mail className="size-4" aria-hidden />
              <span className="sr-only">Email {person.name}: </span>
              {person.email}
            </ButtonLink>
            <div className="flex items-center gap-3">
              {profiles(person).map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${person.name} on ${label}`}
                  title={label}
                  className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-surface text-foreground/75 transition-[border-color,color,transform] duration-200 hover:border-setu/50 hover:text-setu motion-safe:hover:-translate-y-0.5"
                >
                  <Icon className="size-[18px]" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
