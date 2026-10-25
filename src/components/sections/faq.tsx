import { Plus } from "lucide-react";

import { faqGroups, faqs, type Faq as FaqItem } from "@/lib/content";

export interface FaqProps {
  items?: readonly FaqItem[];
}

/**
 * Frequently asked questions.
 *
 * Heading on the left, questions on the right under their group headings.
 * Built on `<details>`/`<summary>`: keyboard and screen-reader behaviour come
 * from the platform, it works before hydration, and it ships zero JavaScript.
 */
export function Faq({ items = faqs }: FaqProps) {
  const grouped = faqGroups
    .map((group) => ({ group, questions: items.filter((item) => item.group === group) }))
    .filter((entry) => entry.questions.length > 0);

  return (
    <section
      id="faq"
      className="bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-brand-100)_35%,var(--background)),var(--background))] py-20 md:py-28"
    >
      <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.4fr] lg:gap-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="font-display text-3xl font-semibold leading-tight text-foreground sm:text-[2.2rem]">
            Frequently Asked
            <br />
            Questions
          </h2>
          <p className="mt-4 max-w-xs text-[0.85rem] leading-relaxed text-muted-foreground">
            Common questions on timelines, billing, and who you will partner
            with here.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {grouped.map(({ group, questions }) => (
            <div key={group}>
              <h3 className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                {group}
              </h3>

              <div className="mt-3 divide-y divide-border border-y border-border">
                {questions.map((item) => (
                  <details key={item.question} name="faq" className="group py-1">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-3.5 text-left text-[0.88rem] font-medium text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
                      {item.question}
                      <Plus
                        className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-45"
                        aria-hidden
                      />
                    </summary>
                    <p className="pb-4 pr-8 text-[0.85rem] leading-relaxed text-muted-foreground">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
