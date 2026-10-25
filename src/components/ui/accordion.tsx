import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";

export interface AccordionItem {
  question: string;
  answer: string;
}

export interface AccordionProps {
  items: readonly AccordionItem[];
  /** Index opened by default; omit to start fully collapsed. */
  defaultOpen?: number;
  /** Shared name makes the group behave as single-open, natively. */
  singleOpen?: boolean;
  className?: string;
}

/**
 * Built on `<details>`/`<summary>`: keyboard and screen-reader behaviour comes
 * from the platform, it works before hydration, and it ships zero JavaScript.
 */
export function Accordion({
  items,
  defaultOpen,
  singleOpen = true,
  className,
}: AccordionProps) {
  return (
    <div className={cn("divide-y divide-border overflow-hidden rounded-card border border-border bg-surface", className)}>
      {items.map((item, index) => (
        <details
          key={item.question}
          name={singleOpen ? "faq" : undefined}
          open={defaultOpen === index}
          className="group px-5 py-1 md:px-7"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-medium text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="text-[1.02rem]">{item.question}</span>
            <Plus
              className="size-5 shrink-0 text-primary transition-transform duration-300 group-open:rotate-45"
              aria-hidden
            />
          </summary>
          <p className="pb-6 pr-8 text-[0.95rem] leading-relaxed text-muted-foreground">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
