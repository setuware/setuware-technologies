"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, RotateCcw, SendHorizontal, X } from "lucide-react";

import { LogoMark } from "@/components/layout/logo";
import { EASE_OUT } from "@/components/motion/ease";
import { useReducedMotionSafe } from "@/components/motion/primitives";
import { postJson } from "@/lib/client-api";
import { useMediaQuery, useScrollLock } from "@/lib/hooks";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

import {
  ASSISTANT_NAME,
  EMPTY_LEAD,
  GREETING,
  MENU_CHIPS,
  advanceLead,
  confirmationReply,
  intentReply,
  leadPayload,
  leadPrompt,
  normalise,
  replyTo,
  serviceReply,
  type BotReply,
  type Chip,
  type ChatLink,
  type LeadDraft,
  type LeadStep,
} from "./engine";

/* -------------------------------------------------------------------------- */
/* Conversation state                                                          */
/* -------------------------------------------------------------------------- */

interface ChatMessage {
  id: string;
  role: "bot" | "user";
  text: string;
  at: number;
  links?: ChatLink[];
  chips?: Chip[];
  tone?: "error";
}

interface LeadState {
  step: LeadStep;
  draft: LeadDraft;
  startedAt: number;
}

interface Stored {
  v: 1;
  messages: ChatMessage[];
  lead: LeadState | null;
}

const STORAGE_KEY = "setuware.assistant.v1";
const CANCEL_WORDS = new Set(["cancel", "stop", "exit", "quit", "menu", "main menu"]);
const SKIP_WORDS = new Set(["skip", "no", "no thanks", "none", "not now"]);

let counter = 0;
const nextId = () => `m${Date.now().toString(36)}${(counter++).toString(36)}`;

function botMessage(reply: BotReply, tone?: "error"): ChatMessage {
  return {
    id: nextId(),
    role: "bot",
    text: reply.text,
    at: Date.now(),
    links: reply.links,
    chips: reply.chips,
    tone,
  };
}

function userMessage(text: string): ChatMessage {
  return { id: nextId(), role: "user", text, at: Date.now() };
}

function readStored(): Stored | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Stored;
    if (parsed?.v !== 1 || !Array.isArray(parsed.messages) || parsed.messages.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStored(value: Stored): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Storage unavailable: the conversation still works for this page view.
  }
}

/** Long enough to read as considered, short enough never to feel slow. */
function typingDelay(text: string, reduce: boolean): number {
  if (reduce) return 250;
  return Math.min(1_100, 420 + text.length * 4);
}

const timeFormat = new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit" });

const PLACEHOLDERS: Record<LeadStep, string> = {
  name: "Your full name",
  contact: "Email address or phone number",
  email: "Email address",
  phone: "Phone number",
  service: "Choose an option above or type it here",
  message: "Describe your project briefly",
};

/* -------------------------------------------------------------------------- */
/* Panel                                                                       */
/* -------------------------------------------------------------------------- */

export interface ChatPanelProps {
  open: boolean;
  onClose: () => void;
  online: boolean;
}

export default function ChatPanel({ open, onClose, online }: ChatPanelProps) {
  const reduce = useReducedMotionSafe();
  const isMobile = useMediaQuery("(max-width: 639px)");
  const titleId = useId();

  const [stored] = useState(readStored);
  const [messages, setMessages] = useState<ChatMessage[]>(
    () => stored?.messages ?? [botMessage(GREETING)],
  );
  const [lead, setLead] = useState<LeadState | null>(() => stored?.lead ?? null);
  const [typing, setTyping] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [draft, setDraft] = useState("");

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  useScrollLock(open && isMobile);

  useEffect(() => {
    writeStored({ v: 1, messages, lead });
  }, [messages, lead]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => window.clearTimeout(timer));
  }, []);

  // Focus the input on open; the launcher takes focus back on close.
  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  // Keep the newest message in view.
  useEffect(() => {
    const list = scrollRef.current;
    if (!list) return;
    list.scrollTo({ top: list.scrollHeight, behavior: reduce || !open ? "auto" : "smooth" });
  }, [messages, typing, open, reduce]);

  const append = useCallback((message: ChatMessage) => {
    setMessages((current) => [...current, message].slice(-80));
  }, []);

  /** Shows the typing indicator, then posts each reply in turn. */
  const say = useCallback(
    (replies: BotReply[], tone?: "error") => {
      setTyping(true);
      let delay = 0;
      replies.forEach((reply, index) => {
        delay += typingDelay(reply.text, reduce);
        const timer = window.setTimeout(() => {
          append(botMessage(reply, tone));
          if (index === replies.length - 1) setTyping(false);
        }, delay);
        timers.current.push(timer);
      });
    },
    [append, reduce],
  );

  const respond = useCallback(
    (reply: BotReply) => {
      if (reply.startLead) {
        const next: LeadState = { step: "name", draft: EMPTY_LEAD, startedAt: Date.now() };
        setLead(next);
        say([reply, leadPrompt("name", EMPTY_LEAD)]);
        return;
      }
      say([reply]);
    },
    [say],
  );

  const submit = useCallback(
    async (state: LeadState) => {
      setLead(state);
      setSubmitting(true);
      setTyping(true);
      const elapsed = Math.max(Date.now() - state.startedAt, 1_500);
      const result = await postJson<{ reference: string }>("/api/contact", leadPayload(state.draft, elapsed));
      setSubmitting(false);
      setTyping(false);

      if (result.ok) {
        setLead(null);
        append(botMessage(confirmationReply(state.draft)));
        return;
      }

      const detail = Object.values(result.fields ?? {})[0] ?? result.message;
      append(
        botMessage(
          {
            text: `I could not send your request. ${detail} You may try again or contact us on WhatsApp.`,
            chips: [
              { label: "Try again", action: { kind: "lead-retry" } },
              { label: "Talk on WhatsApp", action: { kind: "intent", intent: "whatsapp" } },
              { label: "Cancel", action: { kind: "lead-cancel" } },
            ],
          },
          "error",
        ),
      );
    },
    [append],
  );

  const cancelLead = useCallback(() => {
    setLead(null);
    say([{ text: "Certainly. I have cancelled the request. How else may I help you?", chips: [...MENU_CHIPS] }]);
  }, [say]);

  const busy = typing || submitting;

  const handleText = (raw: string) => {
    const text = raw.trim();
    if (!text || busy) return;
    append(userMessage(text));
    setDraft("");

    if (!lead) {
      respond(replyTo(text));
      return;
    }

    const word = normalise(text);
    if (CANCEL_WORDS.has(word)) {
      cancelLead();
      return;
    }
    if (lead.step === "phone" && SKIP_WORDS.has(word)) {
      setLead({ ...lead, step: "service" });
      say([leadPrompt("service", lead.draft)]);
      return;
    }

    const result = advanceLead(lead.step, text, lead.draft);
    if (result.error) {
      say([{ text: result.error, chips: leadPrompt(lead.step, lead.draft).chips }], "error");
      return;
    }
    if (result.next === "submit") {
      void submit({ ...lead, step: "message", draft: result.draft });
      return;
    }
    setLead({ ...lead, step: result.next, draft: result.draft });
    say([leadPrompt(result.next, result.draft)]);
  };

  const handleChip = (chip: Chip) => {
    if (busy) return;
    const { action } = chip;
    append(userMessage(chip.label));

    switch (action.kind) {
      case "intent":
        if (lead) setLead(null);
        respond(intentReply(action.intent));
        return;
      case "service":
        respond(serviceReply(action.slug));
        return;
      case "lead-service": {
        if (!lead) return respond(intentReply("book-call"));
        const draftWithService: LeadDraft = { ...lead.draft, service: action.slug, serviceLabel: action.label };
        setLead({ ...lead, step: "message", draft: draftWithService });
        say([leadPrompt("message", draftWithService)]);
        return;
      }
      case "lead-skip":
        if (!lead) return;
        setLead({ ...lead, step: "service" });
        say([leadPrompt("service", lead.draft)]);
        return;
      case "lead-retry":
        if (lead) void submit(lead);
        return;
      case "lead-cancel":
        cancelLead();
        return;
    }
  };

  const restart = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
    setTyping(false);
    setLead(null);
    setMessages([botMessage(GREETING)]);
    inputRef.current?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
      return;
    }
    // Full-screen on phones, so keep keyboard focus inside the sheet.
    if (event.key !== "Tab" || !isMobile || !rootRef.current) return;
    const focusable = rootRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const last = messages[messages.length - 1];
  const chips = !busy && last?.role === "bot" ? (last.chips ?? []) : [];
  const status = `${online ? "Online" : "Away"} · replies in IST hours`;

  const hidden = reduce
    ? { opacity: 0, transitionEnd: { visibility: "hidden" as const } }
    : { opacity: 0, y: isMobile ? 32 : 16, scale: isMobile ? 1 : 0.97, transitionEnd: { visibility: "hidden" as const } };
  const shown = { opacity: 1, y: 0, scale: 1, visibility: "visible" as const };

  return (
    <motion.div
      ref={rootRef}
      id="setuware-assistant"
      role="dialog"
      aria-modal={isMobile ? true : undefined}
      aria-labelledby={titleId}
      inert={!open}
      onKeyDown={onKeyDown}
      initial={hidden}
      animate={open ? shown : hidden}
      transition={{ duration: reduce ? 0.15 : 0.42, ease: EASE_OUT }}
      style={{ transformOrigin: "bottom right" }}
      className={cn(
        "fixed z-[65] flex flex-col overflow-hidden bg-surface text-foreground",
        "inset-0 h-[100dvh]",
        "sm:inset-auto sm:bottom-[160px] sm:right-5 sm:h-[560px] sm:max-h-[calc(100dvh-11.5rem)] sm:w-[380px] sm:rounded-2xl sm:border sm:border-border",
        "sm:shadow-[0_24px_64px_-16px_rgba(15,23,42,0.35),0_2px_8px_rgba(15,23,42,0.08)]",
      )}
    >
      {/* Header */}
      <div className="relative flex shrink-0 items-center gap-3 overflow-hidden bg-[#0b1020] px-4 pb-3.5 pt-[calc(0.875rem+env(safe-area-inset-top))] text-white sm:pt-3.5">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-16 size-44 rounded-full bg-[radial-gradient(circle,rgba(0,161,198,0.45),transparent_65%)]"
        />
        <span className="relative shrink-0">
          <LogoMark className="size-10" />
          <span
            aria-hidden
            className={cn(
              "absolute -bottom-0.5 -right-0.5 size-3 rounded-full ring-2 ring-[#0b1020]",
              online ? "bg-[#4ade80]" : "bg-amber-300",
            )}
          />
        </span>
        <div className="relative min-w-0 flex-1">
          <h2 id={titleId} className="truncate text-[15px] font-semibold leading-tight">
            {ASSISTANT_NAME}
          </h2>
          <p className="mt-0.5 truncate text-xs text-white/70">{status}</p>
        </div>
        <button
          type="button"
          onClick={restart}
          className="relative inline-flex size-9 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#5fe0f7]"
          aria-label="Start a new conversation"
          title="Start a new conversation"
        >
          <RotateCcw className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="relative inline-flex size-9 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#5fe0f7]"
          aria-label={`Close ${ASSISTANT_NAME}`}
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-background-subtle px-4 py-4"
      >
        <div role="log" aria-live="polite" aria-relevant="additions" aria-label="Conversation" className="flex flex-col gap-3">
          {messages.map((message, index) => (
            <Bubble
              key={message.id}
              message={message}
              showAvatar={message.role === "bot" && messages[index - 1]?.role !== "bot"}
              onNavigate={isMobile ? onClose : undefined}
            />
          ))}
        </div>

        {typing ? <TypingIndicator reduce={reduce} /> : null}

        {chips.length > 0 ? (
          <div role="group" aria-label="Suggested replies" className="mt-3 flex flex-wrap gap-2 pl-9">
            {chips.map((chip) => (
              <button
                key={`${last.id}-${chip.label}`}
                type="button"
                onClick={() => handleChip(chip)}
                className="rounded-full border border-setu/35 bg-surface px-3 py-1.5 text-[13px] font-medium text-setu-dark transition-colors hover:border-setu hover:bg-setu/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-setu dark:text-[#5fe0f7]"
              >
                {chip.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Composer */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleText(draft);
        }}
        className="shrink-0 border-t border-border bg-surface px-3 pb-[calc(0.625rem+env(safe-area-inset-bottom))] pt-3 sm:pb-2.5"
      >
        <div className="flex items-center gap-2">
          <label htmlFor="setuware-assistant-input" className="sr-only">
            Message {ASSISTANT_NAME}
          </label>
          <input
            ref={inputRef}
            id="setuware-assistant-input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={lead ? PLACEHOLDERS[lead.step] : "Type your question"}
            autoComplete={
              lead?.step === "name" ? "name" : lead?.step === "email" ? "email" : lead?.step === "phone" ? "tel" : "off"
            }
            inputMode={lead?.step === "email" ? "email" : lead?.step === "phone" ? "tel" : "text"}
            maxLength={lead?.step === "message" ? 1500 : 200}
            enterKeyHint="send"
            className="h-11 min-w-0 flex-1 rounded-full border border-border bg-surface-2 px-4 text-base text-foreground placeholder:text-muted-foreground focus:border-setu focus:outline-none focus:ring-2 focus:ring-setu/25 sm:text-sm"
          />
          <button
            type="submit"
            disabled={busy || draft.trim().length === 0}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-setu text-white transition-[background-color,opacity] hover:bg-setu-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-setu disabled:opacity-45"
            aria-label="Send message"
          >
            <SendHorizontal className="size-[18px]" aria-hidden />
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Automated assistant. Our team replies {site.hours}.
        </p>
      </form>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Pieces                                                                      */
/* -------------------------------------------------------------------------- */

function Bubble({
  message,
  showAvatar,
  onNavigate,
}: {
  message: ChatMessage;
  showAvatar: boolean;
  onNavigate?: () => void;
}) {
  const isBot = message.role === "bot";
  const time = timeFormat.format(message.at);

  if (!isBot) {
    return (
      <div className="flex flex-col items-end">
        <span className="sr-only">You said:</span>
        <p className="max-w-[85%] whitespace-pre-line break-words rounded-2xl rounded-br-md bg-setu px-3.5 py-2.5 text-sm leading-relaxed text-white">
          {message.text}
        </p>
        <time className="mt-1 pr-1 text-[10.5px] text-muted-foreground" dateTime={new Date(message.at).toISOString()}>
          {time}
        </time>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2">
      <span className="w-7 shrink-0 self-start" aria-hidden>
        {showAvatar ? <LogoMark className="size-7" /> : null}
      </span>
      <div className="flex min-w-0 max-w-[85%] flex-col items-start">
        <span className="sr-only">{ASSISTANT_NAME}:</span>
        <div
          className={cn(
            "rounded-2xl rounded-tl-md border bg-surface px-3.5 py-2.5 text-sm leading-relaxed text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.05)]",
            message.tone === "error" ? "border-amber-300/70" : "border-border",
          )}
        >
          <p className="whitespace-pre-line break-words">{message.text}</p>
          {message.links && message.links.length > 0 ? (
            <div className="mt-2.5 flex flex-col gap-1.5">
              {message.links.map((link) => (
                <MessageLink key={link.href} link={link} onNavigate={onNavigate} />
              ))}
            </div>
          ) : null}
        </div>
        <time className="mt-1 pl-1 text-[10.5px] text-muted-foreground" dateTime={new Date(message.at).toISOString()}>
          {time}
        </time>
      </div>
    </div>
  );
}

function MessageLink({ link, onNavigate }: { link: ChatLink; onNavigate?: () => void }) {
  const className =
    "group inline-flex items-center gap-1 self-start text-[13px] font-semibold text-setu-dark underline-offset-4 hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-setu dark:text-[#5fe0f7]";
  const icon = (
    <ArrowUpRight
      className="size-3.5 transition-transform duration-200 group-hover:-translate-y-px group-hover:translate-x-px"
      aria-hidden
    />
  );

  if (link.external) {
    const newTab = link.href.startsWith("http");
    return (
      <a
        href={link.href}
        className={className}
        {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {link.label}
        {newTab ? <span className="sr-only"> (opens in a new tab)</span> : null}
        {icon}
      </a>
    );
  }

  return (
    <Link href={link.href} className={className} onClick={onNavigate}>
      {link.label}
      {icon}
    </Link>
  );
}

function TypingIndicator({ reduce }: { reduce: boolean }) {
  return (
    <div className="mt-3 flex items-end gap-2">
      <span className="w-7 shrink-0" aria-hidden />
      <div className="inline-flex items-center gap-1 rounded-2xl rounded-tl-md border border-border bg-surface px-3.5 py-3">
        <span className="sr-only">{ASSISTANT_NAME} is typing</span>
        {[0, 1, 2].map((dot) => (
          <motion.span
            key={dot}
            aria-hidden
            className="size-1.5 rounded-full bg-muted-foreground/70"
            animate={reduce ? { opacity: 0.7 } : { opacity: [0.35, 1, 0.35], y: [0, -2, 0] }}
            transition={reduce ? { duration: 0 } : { duration: 1, repeat: Infinity, delay: dot * 0.15, ease: "easeInOut" }}
          />
        ))}
      </div>
    </div>
  );
}
