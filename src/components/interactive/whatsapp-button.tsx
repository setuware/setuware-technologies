"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { EASE_OUT } from "@/components/motion/ease";
import { useReducedMotionSafe } from "@/components/motion/primitives";
import { WhatsAppIcon } from "@/components/ui/social-icons";

import { whatsappHref } from "./chatbot/constants";

const ENTRANCE_DELAY_MS = 2_000;

/**
 * Floating WhatsApp shortcut, bottom-right. The assistant launcher sits to its
 * left and the back-to-top button bottom-left, so the three never overlap.
 * It fades in after a short delay so it never competes with the hero.
 */
export function WhatsAppButton() {
  const reduce = useReducedMotionSafe();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), ENTRANCE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <motion.a
      href={whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Setuware Technologies on WhatsApp (opens in a new tab)"
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: reduce ? 0.2 : 0.6, ease: EASE_OUT }}
      className="group fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-[35] inline-flex size-[52px] items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_28px_-8px_rgba(37,211,102,0.65),0_2px_6px_rgba(15,23,42,0.18)] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-[0_14px_34px_-8px_rgba(37,211,102,0.75),0_2px_6px_rgba(15,23,42,0.2)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#25D366] motion-safe:hover:-translate-y-0.5 sm:bottom-6 sm:right-5 sm:size-14"
    >
      <WhatsAppIcon className="size-[26px] sm:size-7" />
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-full right-0 mb-3 translate-y-1 whitespace-nowrap rounded-lg bg-[#0b1020] px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-[opacity,translate] duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 motion-reduce:translate-y-0"
      >
        Chat on WhatsApp
        <span className="absolute -bottom-1 right-5 size-2 rotate-45 bg-[#0b1020]" />
      </span>
    </motion.a>
  );
}
