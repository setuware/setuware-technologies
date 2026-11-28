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

/**
 * Assistant avatar: the white SW mark on a navy-to-brand-blue tile, so it stays
 * legible from 24px message avatars to the 56px launcher.
 */
export function AssistantAvatar({ className, online }: { className?: string; online?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-flex size-8 shrink-0 items-center justify-center rounded-[30%] text-white",
        "bg-[linear-gradient(135deg,#0b1020_0%,#1c2f78_55%,#2f56d8_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12),0_4px_12px_-4px_rgba(47,86,216,0.55)]",
        className,
      )}
    >
      <AssistantMark className="w-[62%]" />
      {online !== undefined ? (
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 size-[30%] min-h-2 min-w-2 rounded-full ring-2 ring-[#0b1020]",
            online ? "bg-emerald-400" : "bg-amber-400",
          )}
        />
      ) : null}
    </span>
  );
}
