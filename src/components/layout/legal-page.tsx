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
      <section className="border-b border-border pb-10 pt-28 md:pt-36">
        <div className="container-page max-w-3xl">
          <SectionHeading as="h1" align="left" title={title} description={intro} />
          <p className="mt-5 text-xs text-muted-foreground">
            Last updated <time dateTime={updated}>{formatDate(updated)}</time>
          </p>
        </div>
      </section>

      <div className="container-page max-w-3xl py-14">
        <nav aria-label="On this page" className="mb-10 rounded-card border border-border bg-background-subtle p-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            On this page
          </h2>
          <ol className="mt-3 flex flex-col gap-1.5">
            {sections.map((section, index) => (
              <li key={section.heading}>
                <a
                  href={`#section-${index + 1}`}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {index + 1}. {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="flex flex-col gap-10">
          {sections.map((section, index) => (
            <section key={section.heading} id={`section-${index + 1}`}>
              <h2 className="text-xl font-semibold text-foreground">
                {index + 1}. {section.heading}
              </h2>
              <div className="mt-3 flex flex-col gap-3">
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-[0.98rem] leading-relaxed text-muted-foreground"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
              {section.bullets ? (
                <ul className="mt-4 flex flex-col gap-2">
                  {section.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex gap-3 text-[0.95rem] leading-relaxed text-muted-foreground"
                    >
                      <span
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
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
    </>
  );
}
