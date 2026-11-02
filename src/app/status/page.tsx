import { Activity, CheckCircle2, Clock, Server } from "lucide-react";

import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { Section } from "@/components/ui/section";
import { PageHero } from "@/components/layout/page-hero";
import { ButtonLink } from "@/components/ui/button";

export const metadata = pageMetadata({
  title: "Service Status",
  description: `Current operational status, uptime and response-time SLA targets for ${site.name} managed hosting, maintenance and support plans.`,
  path: "/status",
  // A thin, operational page: useful to clients, not a search landing page.
  noIndex: true,
});

/**
 * Status page.
 *
 * Static by design: it documents the SLA we commit to and points at the live
 * probe. A status page that itself depends on the infrastructure it reports on
 * is the first thing to go down in an incident, so the live numbers belong in
 * an external monitor, not here.
 */

const COMPONENTS = [
  { name: "Client applications", detail: "Customer-facing web and mobile apps" },
  { name: "Managed hosting platform", detail: "Deploys, CDN, TLS and WAF" },
  { name: "Monitoring & alerting", detail: "Health checks and on-call paging" },
  { name: "Backups", detail: "Nightly snapshots and restore tests" },
] as const;

const TARGETS = [
  { Icon: Activity, label: "Uptime target", value: site.sla.uptime, hint: "Business plan SLA" },
  { Icon: Clock, label: "First response", value: site.sla.firstResponse, hint: "Priority 1 incidents" },
  { Icon: Server, label: "Support cover", value: site.sla.support, hint: "On-call rotation" },
] as const;

export default function StatusPage() {
  return (
    <>
      <PageHero
        eyebrow="Status"
        title="All systems operational"
        description="Service commitments for hosted and supported clients, and how to contact us about an incident."
      />

      <Section className="py-14">
        <div className="container-page">
          <ul className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface">
            {COMPONENTS.map((component) => (
              <li
                key={component.name}
                className="flex items-center justify-between gap-4 p-5"
              >
                <span>
                  <span className="block text-sm font-medium text-foreground">
                    {component.name}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {component.detail}
                  </span>
                </span>
                <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-emerald-600/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="size-3.5" aria-hidden />
                  Operational
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-6 grid gap-4 sm:grid-cols-3">
            {TARGETS.map(({ Icon, label, value, hint }) => (
              <div key={label} className="rounded-card border border-border bg-surface p-5">
                <dd className="font-display text-xl font-semibold text-foreground">
                  <Icon className="mb-3 size-4 text-primary" aria-hidden />
                  {value}
                </dd>
                <dt className="mt-0.5">
                  <span className="block text-sm font-medium text-foreground">
                    {label}
                  </span>
                  <span className="block text-xs text-muted-foreground">{hint}</span>
                </dt>
              </div>
            ))}
          </dl>

          <div className="mt-8 rounded-card border border-border bg-background-subtle p-6">
            <h2 className="text-base font-semibold text-foreground">
              Reporting an incident
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Clients on a Business or Critical plan should use the shared incident
              channel, which alerts the on-call engineer directly. All other clients
              should email {site.supportEmail} with “URGENT” in the subject line or
              call {site.phone}.
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Automated monitors should probe{" "}
              <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono">
                /api/health
              </code>{" "}
              rather than this page.
            </p>
            <ButtonLink href="/contact" variant="secondary" className="mt-5">
              Contact support
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
