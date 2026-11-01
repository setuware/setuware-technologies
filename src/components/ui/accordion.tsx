"use client";

import * as React from "react";
import {
  motion,
  type Variants,
} from "framer-motion";

import { cn } from "@/lib/utils";
import { EASE_IN_OUT, EASE_OUT } from "@/components/motion/ease";
import { useReducedMotionSafe } from "@/components/motion/primitives";

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

/*
 * Built on `<details>`/`<summary>`, so it works before hydration, keyboard and
 * screen-reader behaviour come from the platform, and every answer is in the
 * HTML for crawlers.
 *
 * Once hydrated, summary clicks are taken over so the panel can animate: the
 * height springs open with framer-motion and the answer fades up behind it.
 * Closing keeps the `<details>` open until the collapse finishes, and drops its
 * `name` for that window so the browser's single-open rule does not snap it
 * shut mid-animation. A native `toggle` (find-in-page, for instance) is synced
 * back into state.
 */

const subscribe = () => () => {};
/** False on the server and during hydration, true afterwards. */
function useHydrated() {
  return React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

interface AccordionContextValue {
  name?: string;
  open: readonly string[];
  setOpen: (id: string, next: boolean) => void;
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

export interface AccordionRootProps {
  children: React.ReactNode;
  /** Only one row open at a time (and `name`-grouped natively). */
  singleOpen?: boolean;
  /** Row id opened on first render. */
  defaultOpen?: string;
  /** Native `<details name>` group, used when `singleOpen`. */
  name?: string;
  className?: string;
}

/** State holder for a set of `AccordionRow`s, however they are laid out. */
export function AccordionRoot({
  children,
  singleOpen = true,
  defaultOpen,
  name = "faq",
  className,
}: AccordionRootProps) {
  const [open, setOpenIds] = React.useState<readonly string[]>(
    defaultOpen === undefined ? [] : [defaultOpen],
  );

  const setOpen = React.useCallback(
    (id: string, next: boolean) => {
      setOpenIds((current) => {
        if (!next) return current.includes(id) ? current.filter((x) => x !== id) : current;
        if (singleOpen) return [id];
        return current.includes(id) ? current : [...current, id];
      });
    },
    [singleOpen],
  );

  const value = React.useMemo(
    () => ({ name: singleOpen ? name : undefined, open, setOpen }),
    [singleOpen, name, open, setOpen],
  );

  return (
    <AccordionContext.Provider value={value}>
      <div className={className}>{children}</div>
    </AccordionContext.Provider>
  );
}

/** Plus that turns into a minus: the vertical bar folds away as it rotates. */
function PlusMinus({ open, className }: { open: boolean; className?: string }) {
  const reduce = useReducedMotionSafe();
  const spring = reduce
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 260, damping: 22, mass: 0.6 };
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden
      className={cn("shrink-0", className)}
      initial={false}
      animate={{ rotate: open ? 180 : 0 }}
      transition={spring}
    >
      <path d="M5 12h14" />
      <motion.path
        d="M12 5v14"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        initial={false}
        animate={{ scaleY: open ? 0 : 1, opacity: open ? 0 : 1 }}
        transition={spring}
      />
    </motion.svg>
  );
}

const panelVariants: Variants = {
  open: { height: "auto" },
  closed: { height: 0 },
};

const answerVariants: Variants = {
  open: { opacity: 1, y: 0, filter: "blur(0px)" },
  closed: { opacity: 0, y: -8, filter: "blur(4px)" },
};

export interface AccordionRowProps {
  /** Unique within its `AccordionRoot`. */
  id: string;
  question: string;
  answer: string;
  className?: string;
  summaryClassName?: string;
  questionClassName?: string;
  iconClassName?: string;
  answerClassName?: string;
}

export function AccordionRow({
  id,
  question,
  answer,
  className,
  summaryClassName,
  questionClassName,
  iconClassName,
  answerClassName,
}: AccordionRowProps) {
  const ctx = React.useContext(AccordionContext);
  if (!ctx) throw new Error("AccordionRow must be rendered inside AccordionRoot");

  const { name, setOpen } = ctx;
  const open = ctx.open.includes(id);
  const reduce = useReducedMotionSafe();
  const hydrated = useHydrated();
  const animated = hydrated && !reduce;

  // Keep the element open while it collapses (derived from the open prop).
  const [closing, setClosing] = React.useState(false);
  const [prevOpen, setPrevOpen] = React.useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    setClosing(!open && animated);
  }
  const detailsOpen = open || closing;

  const panelId = React.useId();

  return (
    <details
      open={detailsOpen}
      name={closing ? undefined : name}
      onToggle={(event) => {
        const nativeOpen = event.currentTarget.open;
        if (nativeOpen === detailsOpen) return;
        setClosing(false);
        setOpen(id, nativeOpen);
      }}
      className={cn("group", className)}
    >
      <summary
        aria-controls={panelId}
        onClick={(event) => {
          event.preventDefault();
          setOpen(id, !open);
        }}
        className={cn(
          "flex cursor-pointer list-none items-center justify-between gap-4 text-left marker:content-none [&::-webkit-details-marker]:hidden",
          summaryClassName,
        )}
      >
        {questionClassName ? <span className={questionClassName}>{question}</span> : question}
        <PlusMinus open={open} className={iconClassName} />
      </summary>

      <motion.div
        id={panelId}
        initial={false}
        animate={hydrated ? (open ? "open" : "closed") : undefined}
        variants={panelVariants}
        transition={
          animated
            ? { duration: open ? 0.6 : 0.42, ease: open ? EASE_OUT : EASE_IN_OUT }
            : { duration: 0 }
        }
        style={hydrated ? { overflow: "hidden" } : undefined}
        onAnimationComplete={(definition) => {
          if (definition === "closed") setClosing(false);
        }}
      >
        <motion.div
          variants={answerVariants}
          transition={
            animated
              ? open
                ? { duration: 0.55, ease: EASE_OUT, delay: 0.08 }
                : { duration: 0.22, ease: EASE_IN_OUT }
              : { duration: 0 }
          }
        >
          <p className={answerClassName}>{answer}</p>
        </motion.div>
      </motion.div>
    </details>
  );
}

export function Accordion({
  items,
  defaultOpen,
  singleOpen = true,
  className,
}: AccordionProps) {
  return (
    <AccordionRoot
      singleOpen={singleOpen}
      defaultOpen={defaultOpen === undefined ? undefined : String(defaultOpen)}
      className={cn(
        "divide-y divide-border overflow-hidden rounded-card border border-border bg-surface",
        className,
      )}
    >
      {items.map((item, index) => (
        <AccordionRow
          key={item.question}
          id={String(index)}
          question={item.question}
          answer={item.answer}
          className="px-5 py-1 md:px-7"
          summaryClassName="py-5 font-medium text-foreground"
          questionClassName="text-[1.02rem]"
          iconClassName="size-5 text-primary"
          answerClassName="pb-6 pr-8 text-[0.95rem] leading-relaxed text-muted-foreground"
        />
      ))}
    </AccordionRoot>
  );
}
