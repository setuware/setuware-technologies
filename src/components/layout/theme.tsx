"use client";

import { ThemeProvider as NextThemeProvider, useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";

import { useHydrated } from "@/lib/hooks";

import { cn } from "@/lib/utils";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemeProvider>
  );
}

const OPTIONS = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "system", label: "System", Icon: Monitor },
  { value: "dark", label: "Dark", Icon: Moon },
] as const;

/**
 * Three-way theme switch. Rendered as a placeholder until mounted, because the
 * resolved theme is unknown during SSR and guessing causes a visible flip.
 */
export function ThemeToggle({
  className,
  inverted = false,
}: {
  className?: string;
  /** Light treatment, for when the header sits over the dark hero. */
  inverted?: boolean;
}) {
  const { theme, setTheme } = useTheme();
  // The resolved theme is unknown during SSR; keeping the toggle inert until
  // hydration is what prevents a visible flip on load.
  const mounted = useHydrated();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border p-0.5",
        inverted ? "border-white/20 bg-white/10" : "border-border bg-surface",
        className,
      )}
      role="radiogroup"
      aria-label="Colour theme"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = mounted && theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${label} theme`}
            onClick={() => setTheme(value)}
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-full transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : inverted
                  ? "text-white/65 hover:text-white"
                  : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-3.5" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
