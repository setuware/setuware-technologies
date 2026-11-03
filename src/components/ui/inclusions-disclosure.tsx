"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { EASE_IN_OUT, EASE_OUT } from "@/components/motion/ease";
import { useReducedMotionSafe } from "@/components/motion/primitives";

export interface InclusionsDisclosureProps {
  items: readonly string[];
  /** Button text; the item count is appended as a chip. */
  label?: string;
  defaultOpen?: boolean;
  className?: string;
  /** Classes for the toggle button (colours, type size). */
  buttonClassName?: string;
  /** Classes for each list item. */
  itemClassName?: string;
}

/**
 * A collapsed "What's included" list for plan cards. The toggle is a real
 * button with `aria-expanded`/`aria-controls`; the panel animates its height
 * open and shut, and simply appears for reduced-motion visitors.
 */
export function InclusionsDisclosure({
  items,
  label = "What's included",
  defaultOpen = false,
  className,
  buttonClassName,
  itemClassName,
}: InclusionsDisclosureProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const reduce = useReducedMotionSafe();
  const panelId = React.useId();

  return (
    <div className={className}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "group flex w-full items-center justify-between gap-3 rounded-lg py-2 text-left text-sm font-semibold text-foreground transition-colors hover:text-setu focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-setu",
          buttonClassName,
        )}
      >
        <span className="flex items-center gap-2">
          {label}
          <span className="rounded-full bg-setu/12 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[#00708c] dark:text-setu">
            {items.length}
          </span>
        </span>
        <motion.span
          aria-hidden
          initial={false}
          animate={{ rotate: open ? 180 : 0 }}
          transition={
            reduce ? { duration: 0 } : { duration: 0.3, ease: EASE_IN_OUT }
          }
          className="inline-flex size-6 items-center justify-center rounded-full border border-current/15 text-setu"
        >
          <ChevronDown className="size-3.5" />
        </motion.span>
      </button>

      <div id={panelId}>
        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              key="panel"
              initial={reduce ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={
                reduce
                  ? { opacity: 0, transition: { duration: 0 } }
                  : { height: 0, opacity: 0 }
              }
              transition={{ duration: reduce ? 0 : 0.4, ease: EASE_OUT }}
              className="overflow-hidden"
            >
              <ul className="flex flex-col gap-2 pb-1 pt-2">
                {items.map((item) => (
                  <li
                    key={item}
                    className={cn(
                      "flex gap-2.5 text-[0.88rem] leading-snug text-foreground/85",
                      itemClassName,
                    )}
                  >
                    <span className="mt-px inline-flex size-[18px] shrink-0 items-center justify-center rounded-full bg-setu/12 text-setu">
                      <Check className="size-3" strokeWidth={3} aria-hidden />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
