import Link from "next/link";

import { faqGroups, faqs, type Faq as FaqItem } from "@/lib/content";
import { AccordionRoot, AccordionRow } from "@/components/ui/accordion";
import { TextReveal } from "@/components/motion/text-reveal";
import { FadeUp, Stagger, StaggerItem } from "@/components/motion/primitives";

export interface FaqProps {
  items?: readonly FaqItem[];
}

/**
 * Frequently asked questions.
 *
 * Heading on the left, questions on the right under their group headings.
 * Rows are `<details>`/`<summary>` underneath (see `AccordionRow`), so they
 * work before hydration and every answer is in the HTML. One row is open at a
 * time across all groups.
 */
export function Faq({ items = faqs }: FaqProps) {
  const grouped = faqGroups
    .map((group) => ({ group, questions: items.filter((item) => item.group === group) }))
    .filter((entry) => entry.questions.length > 0);

  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-brand-100)_35%,var(--background)),var(--background))] py-20 md:py-28"
    >
      <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.4fr] lg:gap-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <TextReveal
            id="faq-title"
            className="font-display text-3xl font-semibold leading-tight text-foreground sm:text-[2.2rem]"
          >
            {"Questions we\nhear most"}
          </TextReveal>
          <FadeUp delay={0.25} y={20}>
            <p className="mt-4 max-w-xs text-[0.85rem] leading-relaxed text-muted-foreground">
              Cost, timelines, payments, ownership and support after launch.
              For anything else,{" "}
              <Link href="/contact" className="font-medium text-primary underline-offset-4 hover:underline">
                ask us directly
              </Link>
              .
            </p>
          </FadeUp>
        </div>

        <AccordionRoot singleOpen name="faq">
          <Stagger className="flex flex-col gap-8" stagger={0.12}>
            {grouped.map(({ group, questions }) => (
              <StaggerItem key={group} y={28}>
                <h3 className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  {group}
                </h3>

                <div className="mt-3 divide-y divide-border border-y border-border">
                  {questions.map((item) => (
                    <AccordionRow
                      key={item.question}
                      id={item.question}
                      question={item.question}
                      answer={item.answer}
                      className="py-1"
                      summaryClassName="py-3.5 text-[0.88rem] font-medium text-foreground"
                      iconClassName="size-4 text-muted-foreground transition-colors duration-300 group-open:text-foreground"
                      answerClassName="pb-4 pr-8 text-[0.85rem] leading-relaxed text-muted-foreground"
                    />
                  ))}
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </AccordionRoot>
      </div>
    </section>
  );
}
