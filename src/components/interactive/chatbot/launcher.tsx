"use client";

import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X } from "lucide-react";

import { EASE_OUT } from "@/components/motion/ease";
import { useReducedMotionSafe } from "@/components/motion/primitives";
import { cn } from "@/lib/utils";

import { isWithinHours } from "./constants";
import { setChatOpen } from "./state";

const ENTRANCE_DELAY_MS = 2_150;

const loadPanel = () => import("./panel");
const ChatPanel = lazy(loadPanel);

/**
 * Floating launcher for the Setuware Assistant.
 *
 * Only this button ships with the page. The panel, the engine and the site
 * content it answers from are fetched the first time a visitor shows intent
 * (hover, focus or a press), then stay mounted so a conversation survives
 * closing and reopening.
 */
export function ChatLauncher() {
  const reduce = useReducedMotionSafe();
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [requested, setRequested] = useState(false);
  const [online, setOnline] = useState(() => isWithinHours());
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), ENTRANCE_DELAY_MS);
    const clock = window.setInterval(() => setOnline(isWithinHours()), 60_000);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(clock);
    };
  }, []);

  useEffect(() => {
    setChatOpen(open);
  }, [open]);

  useEffect(() => () => setChatOpen(false), []);

  const prefetch = useCallback(() => {
    void loadPanel();
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    // Return focus to where the conversation was opened from.
    window.requestAnimationFrame(() => buttonRef.current?.focus());
  }, []);

  const toggle = () => {
    setRequested(true);
    setOpen((value) => !value);
  };

  return (
    <>
      {visible ? (
        <motion.button
          ref={buttonRef}
          type="button"
          onClick={toggle}
          onPointerEnter={prefetch}
          onFocus={prefetch}
          aria-expanded={open}
          aria-controls={requested ? "setuware-assistant" : undefined}
          aria-haspopup="dialog"
          aria-label={open ? "Close chat assistant" : "Ask Setuware — chat assistant"}
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.7, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: reduce ? 0.2 : 0.6, ease: EASE_OUT }}
          className={cn(
            // Same footprint as the WhatsApp button below it (52px, 56px from
            // `sm`), stacked 12px above it on the same centre line.
            "group fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-[35] inline-flex size-[52px] items-center justify-center rounded-full bg-[#0b1020] text-white ring-1 ring-white/10 sm:bottom-[92px] sm:right-5 sm:size-14",
            "shadow-[0_12px_30px_-10px_rgba(11,16,32,0.55),0_2px_6px_rgba(15,23,42,0.18)] transition-[box-shadow,translate] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            "hover:shadow-[0_16px_36px_-10px_rgba(0,161,198,0.55),0_2px_6px_rgba(15,23,42,0.2)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-setu motion-safe:hover:-translate-y-0.5",
          )}
        >
          <span className="relative inline-flex size-7 items-center justify-center" aria-hidden>
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={open ? "close" : "chat"}
                className="absolute inset-0 inline-flex items-center justify-center"
                initial={reduce ? { opacity: 0 } : { opacity: 0, rotate: open ? -90 : 90, scale: 0.6 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, rotate: open ? 90 : -90, scale: 0.6 }}
                transition={{ duration: reduce ? 0.15 : 0.35, ease: EASE_OUT }}
              >
                {open ? (
                  <X className="size-6" strokeWidth={2.2} />
                ) : (
                  <span className="font-[family-name:var(--font-brand,inherit)] text-[17px] font-extrabold leading-none tracking-[-0.02em] sm:text-lg">
                    <span className="text-[#22c3e6]">S</span>T
                  </span>
                )}
              </motion.span>
            </AnimatePresence>
          </span>

          {open ? null : (
            <span
              aria-hidden
              className="absolute -right-0.5 -top-0.5 inline-flex size-[18px] items-center justify-center rounded-full bg-setu text-white ring-2 ring-background"
            >
              <MessageCircle className="size-2.5" strokeWidth={3} />
            </span>
          )}

          <span
            aria-hidden
            className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 translate-x-1 whitespace-nowrap rounded-lg bg-[#0b1020] px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-[opacity,translate] duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:translate-x-0"
          >
            {open ? "Close chat" : "Ask Setuware"}
            <span className="absolute -right-1 top-1/2 size-2 -translate-y-1/2 rotate-45 bg-[#0b1020]" />
          </span>
        </motion.button>
      ) : null}

      {requested ? (
        <Suspense fallback={null}>
          <ChatPanel open={open} onClose={close} online={online} />
        </Suspense>
      ) : null}
    </>
  );
}
