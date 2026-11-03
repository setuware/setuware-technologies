import { formatDate } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/section";

export interface LegalSection {
  heading: string;
  paragraphs: readonly string[];
  bullets?: readonly string[];
}

/** Shared shell for privacy and terms, so both stay structurally identical. */
export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: readonly LegalSection[];
}) {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border bg-[linear-gradient(180deg,#f6f9fc_0%,#ffffff_100%)] pb-12 pt-28 dark:bg-[linear-gradient(180deg,#0b0e18_0%,#070910_100%)] md:pb-16 md:pt-36">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-[10%] -top-[30%] h-[80%] w-[55%] rounded-full bg-[#00a1c6]/[0.10] blur-3xl" />
          <div className="absolute -right-[10%] top-0 h-[70%] w-[45%] rounded-full bg-[#3b82f6]/[0.08] blur-3xl" />
        </div>
        <div className="container-page">
          <div className="max-w-3xl">
            <SectionHeading
              as="h1"
              align="left"
              eyebrow="Legal"
              title={title}
              description={intro}
            />
            <p className="mt-6 inline-flex rounded-full border border-border bg-surface/80 px-3.5 py-1.5 text-xs text-muted-foreground backdrop-blur">
              Last updated&nbsp;
              <time dateTime={updated} className="font-medium text-foreground">
                {formatDate(updated)}
              </time>
            </p>
          </div>
        </div>
      </section>

      <div className="container-page py-14 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[16rem_minmax(0,44rem)] lg:gap-16">
          <nav
            aria-label="On this page"
            className="self-start rounded-card border border-border bg-background-subtle p-5 lg:sticky lg:top-24"
          >
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              On this page
            </h2>
            <ol className="mt-3 flex flex-col gap-2">
              {sections.map((section, index) => (
                <li key={section.heading}>
                  <a
                    href={`#section-${index + 1}`}
                    className="flex gap-2 text-sm leading-snug text-muted-foreground transition-colors hover:text-setu"
                  >
                    <span className="w-5 shrink-0 font-mono text-xs leading-5 text-setu/70">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {section.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="flex min-w-0 flex-col divide-y divide-border">
            {sections.map((section, index) => (
              <section
                key={section.heading}
                id={`section-${index + 1}`}
                className="scroll-mt-24 py-8 first:pt-0 last:pb-0"
              >
                <h2 className="flex items-baseline gap-3 font-display text-xl font-semibold text-foreground md:text-[1.4rem]">
                  <span className="font-mono text-sm font-semibold text-setu">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {section.heading}
                </h2>
                <div className="mt-4 flex flex-col gap-4">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-[1rem] leading-[1.8] text-foreground/80">
                      {paragraph}
                    </p>
                  ))}
                </div>
                {section.bullets ? (
                  <ul className="mt-5 flex flex-col gap-2.5">
                    {section.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex gap-3 text-[0.98rem] leading-[1.7] text-foreground/80"
                      >
                        <span
                          className="mt-[0.65rem] size-1.5 shrink-0 rounded-full bg-setu"
                          aria-hidden
                        />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
