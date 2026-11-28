"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarCheck,
  ChevronRight,
  Clock,
  IndianRupee,
  Loader2,
  RotateCcw,
  X,
  type LucideIcon,
} from "lucide-react";

import { EASE_OUT } from "@/components/motion/ease";
import { useReducedMotionSafe } from "@/components/motion/primitives";
import { ServiceIcon } from "@/components/ui/service-icon";
import { postJson } from "@/lib/client-api";
import { useMediaQuery, useScrollLock } from "@/lib/hooks";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

import { AssistantAvatar } from "./avatar";
import {
  ASSISTANT_NAME,
  EMPTY_LEAD,
  GREETING,
  MENU_CHIPS,
  confirmationReply,
  industryReply,
  intentReply,
  leadPayload,
  leadServiceOptions,
  replyTo,
  serviceReply,
  validateLead,
  whatsappHref,
  type BotReply,
  type ChatContext,
  type ChatLink,
  type Chip,
  type IntentId,
  type LeadDraft,
  type LeadErrors,
  type ReplyCard,
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
  cards?: ReplyCard[];
  tone?: "error";
}

interface LeadState {
  draft: LeadDraft;
  startedAt: number;
}

interface Stored {
  v: 2;
  messages: ChatMessage[];
  lead: LeadState | null;
  context: ChatContext;
}

const STORAGE_KEY = "setuware.assistant.v2";

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
    cards: reply.cards,
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
    if (parsed?.v !== 2 || !Array.isArray(parsed.messages) || parsed.messages.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStored(value: Stored) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Storage unavailable: the conversation still works for this page view.
  }
}

/** Long enough to read as considered, short enough never to feel slow. */
function typingDelay(text: string, reduce: boolean): number {
  if (reduce) return 200;
  return Math.min(900, 380 + text.length * 3);
}

const timeFormat = new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit" });

const STARTERS: readonly { icon: LucideIcon; title: string; body: string; intent?: IntentId; ask?: string }[] = [
  { icon: IndianRupee, title: "Pricing", body: "Packages and starting prices", intent: "pricing" },
  { icon: Clock, title: "Timelines", body: "How long each build takes", intent: "timelines" },
  { icon: BriefcaseBusiness, title: "Our work", body: "Projects we have delivered", ask: "Show me your past work" },
  { icon: CalendarCheck, title: "Free call", body: "30 minutes with our team", intent: "book-call" },
];

const POPULAR = ["Do you sign an NDA?", "Who owns the code?", "Payment terms?"];

const AI_CHIPS: readonly Chip[] = [
  { label: "Book a free call", action: { kind: "intent", intent: "book-call" } },
  { label: "Talk on WhatsApp", action: { kind: "intent", intent: "whatsapp" } },
];

/** More than three suggestions reads as a menu, not a conversation. */
const MAX_CHIPS = 3;

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-setu";

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
  const [messages, setMessages] = useState<ChatMessage[]>(() => stored?.messages ?? [botMessage(GREETING)]);
  const [lead, setLead] = useState<LeadState | null>(() => stored?.lead ?? null);
  const [context, setContext] = useState<ChatContext>(() => stored?.context ?? {});
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState("");

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  /** Bumped on restart so a late server answer is not added to a fresh conversation. */
  const generation = useRef(0);

  useScrollLock(open && isMobile);

  const leadOpen = lead !== null;

  useEffect(() => {
    writeStored({ v: 2, messages, lead, context });
  }, [messages, lead, context]);

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

  // Keep the newest message in view. A long answer is scrolled to its first
  // line rather than its last, so the visitor reads it from the top.
  useEffect(() => {
    const list = scrollRef.current;
    if (!list) return;
    const maxScroll = list.scrollHeight - list.clientHeight;
    const latest = list.querySelector<HTMLElement>("[data-message]:last-of-type");
    const top =
      !typing && latest?.dataset.message === "bot" && !leadOpen
        ? Math.min(latest.offsetTop - 12, maxScroll)
        : maxScroll;
    list.scrollTo({ top, behavior: reduce || !open ? "auto" : "smooth" });
  }, [messages, typing, open, reduce, leadOpen]);

  const append = useCallback((message: ChatMessage) => {
    setMessages((current) => [...current, message].slice(-80));
  }, []);

  /** Shows the typing indicator, then posts the reply. */
  const respond = useCallback(
    (reply: BotReply, tone?: "error") => {
      if (reply.service) setContext({ service: reply.service });
      setTyping(true);
      const timer = window.setTimeout(() => {
        append(botMessage(reply, tone));
        setTyping(false);
        if (reply.startLead) {
          setLead((current) => current ?? { draft: { ...EMPTY_LEAD }, startedAt: Date.now() });
        }
      }, typingDelay(reply.text, reduce));
      timers.current.push(timer);
    },
    [append, reduce],
  );

  const ask = (text: string, label = text) => {
    const question = text.trim();
    if (!question || typing) return;
    append(userMessage(label.trim()));
    setDraft("");
    const local = replyTo(question, context);
    if (!local.fallback) {
      respond(local);
      return;
    }
    // Nothing confident in the knowledge base: ask the server, which answers
    // from the same site content, and keep the local reply as the fallback.
    const turn = generation.current;
    const recent = messages.slice(-6);
    const firstUser = recent.findIndex((message) => message.role === "user");
    const history = firstUser < 0 ? [] : recent.slice(firstUser).map((message) => ({ role: message.role, text: message.text.slice(0, 1000) }));
    setTyping(true);
    void postJson<{ answer: string | null }>("/api/assistant", { question, history }, { timeoutMs: 15_000 }).then((result) => {
      if (generation.current !== turn) return;
      setTyping(false);
      const answer = result.ok ? result.data.answer : null;
      append(botMessage(answer ? { text: answer, chips: [...AI_CHIPS] } : local));
    });
  };

  const handleChip = (chip: Chip) => {
    if (typing) return;
    const { action } = chip;
    switch (action.kind) {
      case "ask":
        ask(action.text, chip.label);
        return;
      case "intent":
        append(userMessage(chip.label));
        respond(intentReply(action.intent));
        return;
      case "service":
        append(userMessage(chip.label));
        respond(serviceReply(action.slug));
        return;
      case "industry":
        append(userMessage(chip.label));
        respond(industryReply(action.slug));
        return;
    }
  };

  const startIntent = (intent: IntentId, label: string) => handleChip({ label, action: { kind: "intent", intent } });

  const onLeadSent = (state: LeadState) => {
    setLead(null);
    append(botMessage(confirmationReply(state.draft)));
  };

  const cancelLead = () => {
    setLead(null);
    respond({ text: "Certainly. I have closed the form. How else may I help you?", chips: [...MENU_CHIPS] });
  };

  const restart = () => {
    generation.current += 1;
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
    setTyping(false);
    setLead(null);
    setContext({});
    setDraft("");
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
      'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
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

  const welcome = messages.length === 1 && messages[0].role === "bot" && !lead;
  const last = messages[messages.length - 1];
  const chips = !typing && !lead && !welcome && last?.role === "bot" ? (last.chips ?? []).slice(0, MAX_CHIPS) : [];

  const hidden = reduce
    ? { opacity: 0, transitionEnd: { visibility: "hidden" as const } }
    : { opacity: 0, y: isMobile ? 32 : 18, scale: isMobile ? 1 : 0.96, transitionEnd: { visibility: "hidden" as const } };
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
        "fixed z-[65] flex flex-col overflow-hidden bg-background text-foreground",
        "inset-0 h-[100dvh]",
        "sm:inset-auto sm:bottom-[160px] sm:right-5 sm:h-[640px] sm:max-h-[calc(100dvh-11.5rem)] sm:w-[400px] sm:rounded-[28px] sm:ring-1 sm:ring-black/5 dark:sm:ring-white/10",
        "sm:shadow-[0_32px_80px_-20px_rgba(11,16,32,0.45),0_8px_24px_-8px_rgba(47,86,216,0.25)]",
      )}
    >
      {/* Header */}
      <div className="relative shrink-0 overflow-hidden border-b border-white/10 bg-[#0b1020] px-4 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] text-white sm:pt-4">
        <div className="relative flex items-center gap-3">
          <AssistantAvatar className="size-11 rounded-2xl" online={online} />
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="truncate text-base font-semibold leading-tight tracking-tight">
              Ask Setuware
            </h2>
            <p className="mt-1 truncate text-xs text-white/70">
              {online ? "Online now" : "Away"} · {site.hours}
            </p>
          </div>
          <HeaderButton onClick={restart} label="Start a new conversation">
            <RotateCcw className="size-4" aria-hidden />
          </HeaderButton>
          <HeaderButton onClick={onClose} label={`Close ${ASSISTANT_NAME}`}>
            <X className="size-5" aria-hidden />
          </HeaderButton>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain bg-background px-4 py-5"
      >
        {welcome ? (
          <Welcome
            greeting={messages[0].text}
            onStarter={(starter) =>
              starter.intent ? startIntent(starter.intent, starter.title) : ask(starter.ask ?? starter.title, starter.title)
            }
            onAsk={(question) => ask(question)}
          />
        ) : (
          <div role="log" aria-live="polite" aria-relevant="additions" aria-label="Conversation" className="flex flex-col gap-4">
            {messages.map((message, index) => (
              <Bubble
                key={message.id}
                message={message}
                showAvatar={message.role === "bot" && messages[index - 1]?.role !== "bot"}
                onNavigate={isMobile ? onClose : undefined}
              />
            ))}
          </div>
        )}

        {typing ? <TypingIndicator reduce={reduce} /> : null}

        {lead && !typing ? (
          <LeadForm
            state={lead}
            onChange={setLead}
            onSent={onLeadSent}
            onCancel={cancelLead}
            onNavigate={isMobile ? onClose : undefined}
          />
        ) : null}

        {chips.length > 0 ? (
          <div role="group" aria-label="Suggested replies" className="mt-4 flex flex-wrap gap-2 pl-10">
            {chips.map((chip) => (
              <button
                key={`${last.id}-${chip.label}`}
                type="button"
                onClick={() => handleChip(chip)}
                className={cn(
                  "rounded-full border border-border bg-surface px-3.5 py-1.5 text-[13px] font-medium text-foreground/85 transition-colors hover:border-setu/50 hover:text-setu",
                  chip.action.kind === "ask" && "text-left",
                  focusRing,
                )}
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
          ask(draft);
        }}
        className="shrink-0 border-t border-border bg-surface px-3 pb-[calc(0.625rem+env(safe-area-inset-bottom))] pt-3 sm:pb-3"
      >
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-background py-1.5 pl-4 pr-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[border-color,box-shadow] focus-within:border-setu/50">
          <label htmlFor="setuware-assistant-input" className="sr-only">
            Message {ASSISTANT_NAME}
          </label>
          <input
            ref={inputRef}
            id="setuware-assistant-input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask about services, pricing or our work"
            autoComplete="off"
            maxLength={300}
            enterKeyHint="send"
            className="h-10 min-w-0 flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none sm:text-sm"
          />
          <button
            type="submit"
            disabled={typing || draft.trim().length === 0}
            className={cn(
              "inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-setu text-white transition-[opacity,transform] hover:opacity-90 active:scale-95 disabled:opacity-30",
              focusRing,
            )}
            aria-label="Send message"
          >
            <ArrowUp className="size-[18px]" aria-hidden />
          </button>
        </div>
      </form>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Pieces                                                                      */
/* -------------------------------------------------------------------------- */

function HeaderButton({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex size-9 items-center justify-center rounded-full text-white/75 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white"
    >
      {children}
    </button>
  );
}

function Welcome({
  greeting,
  onStarter,
  onAsk,
}: {
  greeting: string;
  onStarter: (starter: (typeof STARTERS)[number]) => void;
  onAsk: (question: string) => void;
}) {
  return (
    <div data-message="bot" className="flex flex-col gap-5">
      <div>
        <p className="text-[22px] font-semibold leading-tight tracking-tight text-foreground">
          How can we help you today?
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{greeting}</p>
      </div>

      <ul className="overflow-hidden rounded-2xl border border-border bg-surface">
        {STARTERS.map((starter) => (
          <li key={starter.title} className="border-b border-border last:border-b-0">
            <button
              type="button"
              onClick={() => onStarter(starter)}
              className={cn(
                "group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-setu/[0.05]",
                focusRing,
              )}
            >
              <starter.icon className="size-[18px] shrink-0 text-setu" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground">{starter.title}</span>
                <span className="block text-xs text-muted-foreground">{starter.body}</span>
              </span>
              <ChevronRight
                className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-setu"
                aria-hidden
              />
            </button>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2">
        {POPULAR.map((question) => (
          <button
            key={question}
            type="button"
            onClick={() => onAsk(question)}
            className={cn(
              "rounded-full border border-border bg-surface px-3.5 py-1.5 text-[13px] text-foreground/85 transition-colors hover:border-setu/50 hover:text-setu",
              focusRing,
            )}
          >
            {question}
          </button>
        ))}
      </div>

      <p className="text-[13px] text-muted-foreground">
        Prefer a person?{" "}
        <ContactLink href={whatsappHref} label="WhatsApp" newTab /> ·{" "}
        <ContactLink href={site.phoneHref} label="Call" /> ·{" "}
        <ContactLink href={`mailto:${site.salesEmail}`} label="Email" />
      </p>
    </div>
  );
}

function ContactLink({ href, label, newTab }: { href: string; label: string; newTab?: boolean }) {
  return (
    <a
      href={href}
      {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn("font-medium text-setu underline-offset-4 hover:underline", focusRing)}
    >
      {label}
      {newTab ? <span className="sr-only"> (opens in a new tab)</span> : null}
    </a>
  );
}

/** Renders "• " lines as a list and everything else as paragraphs. */
function RichText({ text }: { text: string }) {
  const blocks: { kind: "p" | "ul"; lines: string[] }[] = [];
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    const bullet = line.startsWith("• ");
    const kind = bullet ? "ul" : "p";
    const content = bullet ? line.slice(2) : line;
    const previous = blocks[blocks.length - 1];
    if (kind === "ul" && previous?.kind === "ul") previous.lines.push(content);
    else blocks.push({ kind, lines: [content] });
  }
  return (
    <div className="flex flex-col gap-2">
      {blocks.map((block, index) =>
        block.kind === "ul" ? (
          <ul key={index} className="flex flex-col gap-1.5">
            {block.lines.map((line) => {
              const split = line.indexOf(": ");
              return (
                <li key={line} className="flex gap-2">
                  <span aria-hidden className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-setu" />
                  <span className="break-words">
                    {split > 0 && split < 48 ? (
                      <>
                        <span className="font-semibold text-foreground">{line.slice(0, split)}</span>
                        {line.slice(split)}
                      </>
                    ) : (
                      line
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p key={index} className="break-words">
            {block.lines[0]}
          </p>
        ),
      )}
    </div>
  );
}

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
  // A card already links to its page; a second button to the same page is noise.
  const cardHrefs = new Set(message.cards?.map((card) => card.href));
  const links = (message.links ?? []).filter((link) => !cardHrefs.has(link.href));

  if (!isBot) {
    return (
      <div data-message="user" className="flex flex-col items-end">
        <span className="sr-only">You said:</span>
        <p className="max-w-[85%] whitespace-pre-line break-words rounded-[20px] rounded-br-md bg-setu px-4 py-2.5 text-sm leading-relaxed text-white">
          {message.text}
        </p>
        <time className="mt-1 pr-1 text-[10px] text-muted-foreground" dateTime={new Date(message.at).toISOString()}>
          {time}
        </time>
      </div>
    );
  }

  return (
    <div data-message="bot" className="flex items-start gap-2">
      <span className="w-8 shrink-0" aria-hidden>
        {showAvatar ? <AssistantAvatar className="size-8 rounded-xl" /> : null}
      </span>
      <div className="flex min-w-0 max-w-[calc(100%-2.5rem)] flex-1 flex-col items-start gap-2">
        <span className="sr-only">{ASSISTANT_NAME}:</span>
        <div
          className={cn(
            "rounded-[20px] rounded-tl-md border border-border bg-surface px-4 py-3 text-sm leading-relaxed text-foreground/90 shadow-[0_1px_2px_rgba(15,23,42,0.05)]",
            message.tone === "error" && "border-amber-300/80",
          )}
        >
          <RichText text={message.text} />
          {links.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {links.map((link) => (
                <MessageLink key={link.href} link={link} onNavigate={onNavigate} />
              ))}
            </div>
          ) : null}
        </div>
        {message.cards && message.cards.length > 0 ? (
          <div className="flex w-full flex-col gap-2">
            {message.cards.map((card) => (
              <ReplyCardView key={card.href} card={card} onNavigate={onNavigate} />
            ))}
          </div>
        ) : null}
        <time className="pl-1 text-[10px] text-muted-foreground" dateTime={new Date(message.at).toISOString()}>
          {time}
        </time>
      </div>
    </div>
  );
}

function ReplyCardView({ card, onNavigate }: { card: ReplyCard; onNavigate?: () => void }) {
  const base = cn(
    "group relative block w-full overflow-hidden rounded-2xl border border-border bg-surface p-3.5 transition-[border-color,box-shadow] hover:border-setu/40 hover:shadow-[0_12px_28px_-16px_rgba(47,86,216,0.6)]",
    focusRing,
  );

  if (card.kind === "service") {
    return (
      <Link href={card.href} onClick={onNavigate} className={base}>
        <div className="flex items-start gap-3">
          <ServiceIcon name={card.icon} accent={card.accent} className="size-10 rounded-xl" size={18} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">{card.title}</p>
            <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted-foreground">{card.summary}</p>
          </div>
          <ArrowUpRight
            className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-px group-hover:translate-x-px group-hover:text-setu"
            aria-hidden
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-medium">
          <span className="rounded-full bg-setu/10 px-2.5 py-1 text-setu">{card.price}</span>
          <span className="rounded-full bg-surface-2 px-2.5 py-1 text-foreground/75">{card.timeline}</span>
        </div>
      </Link>
    );
  }

  return (
    <Link href={card.href} onClick={onNavigate} className={base}>
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundImage: `linear-gradient(180deg, ${card.accent[0]}, ${card.accent[1]})` }}
      />
      <p className="pl-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {card.client} · {card.sector}
      </p>
      <p className="mt-1 pl-1.5 text-sm font-semibold leading-snug text-foreground">{card.title}</p>
      <p className="mt-2 inline-flex items-center gap-1 pl-1.5 text-xs font-semibold text-setu">
        Read case study
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </p>
    </Link>
  );
}

function MessageLink({ link, onNavigate }: { link: ChatLink; onNavigate?: () => void }) {
  const className = cn(
    "group inline-flex items-center gap-1 rounded-full bg-surface-2 px-3 py-1.5 text-[12.5px] font-medium text-foreground transition-colors hover:bg-setu/10 hover:text-setu",
    focusRing,
  );
  const icon = (
    <ArrowUpRight
      className="size-3.5 transition-transform duration-200 group-hover:-translate-y-px group-hover:translate-x-px"
      aria-hidden
    />
  );

  if (link.external) {
    const newTab = link.href.startsWith("http");
    return (
      <a href={link.href} className={className} {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
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

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{label}</span>
      {children}
      {error ? <span className="text-xs text-red-600 dark:text-red-400">{error}</span> : null}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-base text-foreground placeholder:text-muted-foreground/80 transition-[border-color,box-shadow] focus:border-setu/60 focus:shadow-[0_0_0_3px_rgba(47,86,216,0.12)] focus:outline-none sm:text-sm";

function LeadForm({
  state,
  onChange,
  onSent,
  onCancel,
  onNavigate,
}: {
  state: LeadState;
  onChange: (next: LeadState) => void;
  onSent: (state: LeadState) => void;
  onCancel: () => void;
  onNavigate?: () => void;
}) {
  const [errors, setErrors] = useState<LeadErrors>({});
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const { draft } = state;

  const set = (patch: Partial<LeadDraft>) => onChange({ ...state, draft: { ...draft, ...patch } });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const found = validateLead(draft);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setSending(true);
    setFailure(null);
    const elapsed = Math.max(Date.now() - state.startedAt, 1_500);
    const result = await postJson<{ reference: string }>("/api/contact", leadPayload(draft, elapsed));
    setSending(false);
    if (result.ok) {
      onSent(state);
      return;
    }
    setFailure(Object.values(result.fields ?? {})[0] ?? result.message);
  };

  return (
    <form
      onSubmit={submit}
      noValidate
      aria-label="Request a call back"
      className="mt-4 ml-10 rounded-2xl border border-setu/25 bg-surface p-4 shadow-[0_16px_36px_-24px_rgba(47,86,216,0.7)]"
    >
      <p className="text-sm font-semibold text-foreground">Request a call back</p>
      <p className="mt-0.5 text-xs text-muted-foreground">Our team replies within one business day.</p>

      <div className="mt-3 flex flex-col gap-2.5">
        <Field label="Name" error={errors.name}>
          <input
            className={inputClass}
            value={draft.name}
            onChange={(event) => set({ name: event.target.value })}
            autoComplete="name"
            maxLength={80}
            placeholder="Your full name"
          />
        </Field>
        <Field label="Email" error={errors.email}>
          <input
            className={inputClass}
            value={draft.email}
            onChange={(event) => set({ email: event.target.value })}
            autoComplete="email"
            inputMode="email"
            maxLength={254}
            placeholder="name@company.com"
          />
        </Field>
        <Field label="Phone (optional)" error={errors.phone}>
          <input
            className={inputClass}
            value={draft.phone}
            onChange={(event) => set({ phone: event.target.value })}
            autoComplete="tel"
            inputMode="tel"
            maxLength={24}
            placeholder="+91 98765 43210"
          />
        </Field>
        <Field label="Service">
          <select
            className={inputClass}
            value={draft.service}
            onChange={(event) => {
              const option = leadServiceOptions().find((entry) => entry.value === event.target.value);
              set({ service: option?.value ?? "", serviceLabel: option?.label ?? "" });
            }}
          >
            <option value="">Choose a service</option>
            {leadServiceOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Project" error={errors.message}>
          <textarea
            className={cn(inputClass, "min-h-20 resize-none")}
            value={draft.message}
            onChange={(event) => set({ message: event.target.value })}
            maxLength={1500}
            placeholder="A sentence or two about what you need"
          />
        </Field>
      </div>

      {failure ? (
        <p role="alert" className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-400/10 dark:text-amber-200">
          I could not send your request. {failure} You may try again or contact us on WhatsApp.
        </p>
      ) : null}

      <p className="mt-3 text-[11px] leading-snug text-muted-foreground">
        By sending, you agree to our{" "}
        <Link href="/privacy" onClick={onNavigate} className="underline underline-offset-2 hover:text-foreground">
          privacy policy
        </Link>
        .
      </p>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="submit"
          disabled={sending}
          className={cn(
            "inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#2f56d8,#1c2f78)] text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(47,86,216,0.8)] transition-opacity hover:opacity-90 disabled:opacity-60",
            focusRing,
          )}
        >
          {sending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {sending ? "Sending" : "Send request"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={sending}
          className={cn(
            "h-10 rounded-xl px-3.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground",
            focusRing,
          )}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function TypingIndicator({ reduce }: { reduce: boolean }) {
  return (
    <div className="mt-4 flex items-start gap-2">
      <span className="w-8 shrink-0" aria-hidden />
      <div className="inline-flex items-center gap-1 rounded-[20px] rounded-tl-md border border-border bg-surface px-4 py-3.5">
        <span className="sr-only">{ASSISTANT_NAME} is typing</span>
        {[0, 1, 2].map((dot) => (
          <motion.span
            key={dot}
            aria-hidden
            className="size-1.5 rounded-full bg-setu/70"
            animate={reduce ? { opacity: 0.7 } : { opacity: [0.35, 1, 0.35], y: [0, -2, 0] }}
            transition={reduce ? { duration: 0 } : { duration: 1, repeat: Infinity, delay: dot * 0.15, ease: "easeInOut" }}
          />
        ))}
      </div>
    </div>
  );
}
