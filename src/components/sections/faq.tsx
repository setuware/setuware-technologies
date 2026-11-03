import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { faqGroups, faqs, type Faq as FaqItem } from "@/lib/content";
import { cn } from "@/lib/utils";
import { AccordionRoot, AccordionRow } from "@/components/ui/accordion";
import { TextReveal } from "@/components/motion/text-reveal";
import { FadeUp } from "@/components/motion/primitives";

/**
 * Questions in two balanced columns of hairline rows. Rows are
 * `<details>`/`<summary>` underneath (see `AccordionRow`), so they work before
 * hydration and every answer is in the HTML. One row is open at a time.
 */
export function FaqColumns({ items, className }: { items: readonly FaqItem[]; className?: string }) {
  const ordered = faqGroups.flatMap((group) => items.filter((item) => item.group === group));
  const rest = items.filter((item) => !ordered.includes(item));
  const all = [...ordered, ...rest];
  const half = Math.ceil(all.length / 2);
  const columns = [all.slice(0, half), all.slice(half)].filter((column) => column.length > 0);

  return (
    <AccordionRoot singleOpen name="faq" className={cn("grid md:grid-cols-2 md:gap-x-12", className)}>
      {columns.map((column, index) => (
        <div
          key={index}
          className={cn(
            "divide-y divide-border border-b border-border",
            index === 0 ? "border-t" : "md:border-t",
          )}
        >
          {column.map((item) => (
            <AccordionRow
              key={item.question}
              id={item.question}
              question={item.question}
              answer={item.answer}
              summaryClassName="py-3.5 text-[0.9rem] font-medium text-foreground transition-colors hover:text-setu"
              iconClassName="size-4 text-muted-foreground transition-colors duration-300 group-open:text-setu"
              answerClassName="pb-4 pr-8 text-[0.875rem] leading-relaxed text-muted-foreground"
            />
          ))}
        </div>
      ))}
    </AccordionRoot>
  );
}

/** "Ask us" link shown beside every FAQ heading. */
export function FaqContactLink() {
  return (
    <Link
      href="/contact"
      className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-setu"
    >
      Ask us another question
      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
    </Link>
  );
}

export interface FaqProps {
  items?: readonly FaqItem[];
}

/** Homepage FAQ: a short heading row above the two-column list. */
export function Faq({ items = faqs }: FaqProps) {
  return (
    <section id="faq" aria-labelledby="faq-title" className="bg-background py-16 md:py-20">
      <div className="container-page">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-10">
          <div>
            <TextReveal
              id="faq-title"
              className="font-display text-3xl font-semibold leading-tight text-foreground sm:text-[2.2rem]"
            >
              Frequently asked questions
            </TextReveal>
            <FadeUp delay={0.2} y={16}>
              <p className="mt-2 max-w-md text-[0.9rem] leading-relaxed text-muted-foreground">
                Pricing, timelines, ownership and support, answered briefly.
              </p>
            </FadeUp>
          </div>
          <FaqContactLink />
        </div>

        <FadeUp delay={0.1} y={20}>
          <FaqColumns items={items} className="mt-8" />
        </FadeUp>
      </div>
    </section>
  );
}
