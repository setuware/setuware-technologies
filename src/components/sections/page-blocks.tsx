import * as React from "react";

import { type Faq as FaqItem, faqGroups } from "@/lib/content";
import { cn } from "@/lib/utils";
import { AccordionRoot, AccordionRow } from "@/components/ui/accordion";
import { TextReveal } from "@/components/motion/text-reveal";
import { FadeUp } from "@/components/motion/primitives";

/**
 * Shared building blocks for the inner pages (process, pricing, estimate and
 * contact), so their cards, headings and FAQs share one visual language.
 */

/** White card with a hairline border and a layered soft shadow. */
export const CARD =
  "rounded-2xl border border-slate-200/80 bg-surface shadow-[0_1px_2px_rgb(15_23_42/0.04),0_6px_16px_-8px_rgb(15_23_42/0.08),0_24px_48px_-24px_rgb(15_23_42/0.16)] dark:border-border dark:shadow-[0_1px_2px_rgb(0_0_0/0.3),0_24px_48px_-24px_rgb(0_0_0/0.6)]";

/** Hover treatment for cards that are links. */
export const CARD_HOVER =
  "transition-[transform,border-color,box-shadow] duration-300 hover:border-setu/45 hover:shadow-[0_1px_2px_rgb(15_23_42/0.04),0_10px_24px_-10px_rgb(0_161_198/0.25),0_30px_60px_-30px_rgb(15_23_42/0.22)] motion-safe:hover:-translate-y-0.5";

/** Rounded cyan tile that holds a lucide icon. */
export function IconTile({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-setu/15 to-setu/5 text-setu ring-1 ring-inset ring-setu/20",
        className,
      )}
    >
      {children}
    </span>
  );
}

export interface SectionIntroProps {
  eyebrow: string;
  title: string;
  description?: React.ReactNode;
  align?: "left" | "center";
  id?: string;
  className?: string;
  children?: React.ReactNode;
  /** Smaller heading and lead, for dense pages such as pricing. */
  compact?: boolean;
}

/** Eyebrow, animated H2 and an optional lead paragraph. */
export function SectionIntro({
  eyebrow,
  title,
  description,
  align = "center",
  id,
  className,
  children,
  compact = false,
}: SectionIntroProps) {
  return (
    <div
      className={cn(
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-xl",
        className,
      )}
    >
      <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-setu">
        <span className="h-px w-6 bg-setu/60" aria-hidden />
        {eyebrow}
      </span>
      <TextReveal
        as="h2"
        id={id}
        className={cn(
          "font-display font-semibold leading-tight text-foreground",
          compact ? "mt-3 text-[1.7rem] sm:text-[2rem]" : "mt-4 text-3xl sm:text-[2.4rem]",
        )}
      >
        {title}
      </TextReveal>
      {description || children ? (
        <FadeUp delay={0.2} y={20}>
          {description ? (
            <p
              className={cn(
                "leading-relaxed text-muted-foreground",
                compact ? "mt-3 text-[0.95rem]" : "mt-4 text-[1.02rem]",
              )}
            >
              {description}
            </p>
          ) : null}
          {children}
        </FadeUp>
      ) : null}
    </div>
  );
}

/**
 * FAQ block for inner pages: heading on the left, questions as individual
 * cards on the right. Sits inside a `Section`, so the page chooses the surface.
 */
export function FaqCards({
  items,
  description = "Answers to common questions. For anything else, our team responds within one business day.",
  compact = false,
}: {
  items: readonly FaqItem[];
  description?: string;
  compact?: boolean;
}) {
  const grouped = faqGroups
    .map((group) => ({ group, questions: items.filter((item) => item.group === group) }))
    .filter((entry) => entry.questions.length > 0);

  return (
    <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.4fr] lg:gap-16">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <SectionIntro
          compact={compact}
          align="left"
          eyebrow="FAQ"
          title="Frequently asked questions"
          description={description}
        />
      </div>

      <AccordionRoot singleOpen name="faq" className="flex flex-col gap-8">
        {grouped.map(({ group, questions }) => (
          <div key={group}>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {group}
            </h3>
            <div className={cn("mt-3 flex flex-col", compact ? "gap-2" : "gap-3")}>
              {questions.map((item) => (
                <AccordionRow
                  key={item.question}
                  id={item.question}
                  question={item.question}
                  answer={item.answer}
                  className={cn(CARD, "px-5 transition-colors open:border-setu/40 md:px-6")}
                  summaryClassName={cn(
                    "font-medium text-foreground",
                    compact ? "py-3 text-[0.9rem]" : "py-4 text-[0.95rem]",
                  )}
                  iconClassName="size-4 text-setu"
                  answerClassName="pb-5 pr-8 text-[0.9rem] leading-relaxed text-muted-foreground"
                />
              ))}
            </div>
          </div>
        ))}
      </AccordionRoot>
    </div>
  );
}
