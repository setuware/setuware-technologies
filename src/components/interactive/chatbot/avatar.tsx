import Image from "next/image";

import { MARK_PATHS } from "@/lib/brand-mark";
import { cn } from "@/lib/utils";

/** The SW mark in a single colour, drawn on the brand-mark grid. */
export function AssistantMark({ className }: { className?: string }) {
  return (
    <svg viewBox="8 22 92 54" className={cn("h-auto w-full", className)} aria-hidden focusable="false">
      <path d={MARK_PATHS.s} fill="none" stroke="currentColor" strokeWidth={10} strokeLinecap="round" />
      <path d={MARK_PATHS.w} fill="currentColor" />
    </svg>
  );
}

/** The glossy SW ribbon icon: the same art as the favicon, so the assistant reads as Setuware. */
export const ASSISTANT_ICON = "/images/favicon-v4-512.png";

/** Assistant avatar: the brand icon, with an optional online/away dot. */
export function AssistantAvatar({ className, online }: { className?: string; online?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn("relative inline-flex size-8 shrink-0 rounded-[30%] ring-1 ring-white/10", className)}
    >
      <Image src={ASSISTANT_ICON} alt="" width={96} height={96} className="size-full rounded-[inherit] object-cover" />
      {online !== undefined ? (
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 size-[28%] min-h-2 min-w-2 rounded-full ring-2 ring-[#0b1020]",
            online ? "bg-emerald-400" : "bg-amber-400",
          )}
        />
      ) : null}
    </span>
  );
}
