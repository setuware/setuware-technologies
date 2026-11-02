"use client";

import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, MessageCircle } from "lucide-react";

import { EASE_OUT } from "@/components/motion/ease";
import { useReducedMotionSafe } from "@/components/motion/primitives";
import { cn } from "@/lib/utils";

import { ASSISTANT_NAME, isWithinHours } from "./constants";
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
  const [online, setOnline] = useState(true);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), ENTRANCE_DELAY_MS);
    const tick = () => setOnline(isWithinHours());
    tick();
    const clock = window.setInterval(tick, 60_000);
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

  const status = `${online ? "Online" : "Away"} · replies in IST hours`;

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
          aria-label={open ? `Close ${ASSISTANT_NAME}` : `Open ${ASSISTANT_NAME}. ${status}`}
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.7, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: reduce ? 0.2 : 0.6, ease: EASE_OUT }}
          className={cn(
            "group fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-[80px] z-[35] inline-flex items-center rounded-full bg-setu text-white",
            "shadow-[0_10px_28px_-8px_rgba(0,161,198,0.7),0_2px_6px_rgba(15,23,42,0.18)] transition-[background-color,box-shadow,translate] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            "hover:bg-setu-dark focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-setu motion-safe:hover:-translate-y-0.5",
            "size-[52px] justify-center sm:bottom-6 sm:right-[88px] sm:h-14 sm:w-auto sm:justify-start sm:gap-3 sm:py-0 sm:pl-2 sm:pr-5",
          )}
        >
          <span className="relative inline-flex size-[52px] shrink-0 items-center justify-center sm:size-10 sm:rounded-full sm:bg-white/15">
            {open ? (
              <ChevronDown className="size-6 sm:size-5" aria-hidden />
            ) : (
              <MessageCircle className="size-6 sm:size-5" aria-hidden />
            )}
            <span
              aria-hidden
              className={cn(
                "absolute right-2.5 top-2.5 size-2.5 rounded-full ring-2 ring-setu sm:right-0 sm:top-0",
                online ? "bg-[#4ade80]" : "bg-amber-300",
              )}
            />
          </span>
          <span className="hidden flex-col items-start text-left leading-tight sm:flex" aria-hidden>
            <span className="text-sm font-semibold">{open ? "Close chat" : "Ask Setuware"}</span>
            <span className="mt-0.5 text-[11px] font-medium text-white/85">{status}</span>
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
