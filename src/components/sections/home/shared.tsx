import { cn } from "@/lib/utils";

/** Brand blue used across the corporate homepage. */
export const BLUE_GRADIENT = "bg-[linear-gradient(110deg,#2f56d8,#1d4ed8_55%,#1e3a8a)]";

/** Small pill + label above section headings. */
export function Eyebrow({
  children,
  light = false,
  className,
}: {
  children: React.ReactNode;
  light?: boolean;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 text-[0.8rem] font-semibold uppercase tracking-[0.08em]",
        light ? "text-white" : "text-[#2f56d8] dark:text-[#7c9bff]",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "inline-block h-[2px] w-7 rounded-full",
          light ? "bg-[linear-gradient(90deg,#7dd3fc,#ffffff)]" : "bg-[linear-gradient(90deg,#38bdf8,#2f56d8)]",
        )}
      />
      {children}
    </p>
  );
}

export function SectionTitle({
  children,
  className,
  light = false,
}: {
  children: React.ReactNode;
  className?: string;
  light?: boolean;
}) {
  return (
    <h2
      className={cn(
        "mt-3 text-[1.9rem] font-bold leading-[1.15] tracking-[-0.02em] sm:text-[2.4rem] lg:text-[2.75rem]",
        light ? "text-white" : "text-[#0f1330] dark:text-white",
        className,
      )}
    >
      {children}
    </h2>
  );
}

/** Faint circuit-board lines, used as card and band decoration. */
export function CircuitLines({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 220 120"
      fill="none"
      className={cn("pointer-events-none", className)}
    >
      <g stroke="currentColor" strokeWidth="1">
        <path d="M0 20h70l20 20h60l20-20h50" />
        <path d="M0 45h40l15 15h75l25 25h65" />
        <path d="M30 70h50l20 20h120" />
        <path d="M60 100h40l10-10h110" />
        <path d="M110 0v25l15 15" />
        <path d="M160 0v15l-10 10" />
      </g>
      <g fill="currentColor">
        <circle cx="70" cy="20" r="2.5" />
        <circle cx="150" cy="40" r="2.5" />
        <circle cx="55" cy="60" r="2.5" />
        <circle cx="155" cy="85" r="2.5" />
        <circle cx="100" cy="90" r="2.5" />
        <circle cx="110" cy="100" r="2.5" />
        <circle cx="125" cy="40" r="2.5" />
      </g>
    </svg>
  );
}
