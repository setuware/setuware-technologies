"use client";

import { ThemeProvider as NextThemeProvider, useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import { useHydrated } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/**
 * Light by default for every visitor; a choice made with the toggle is
 * remembered. The storage key is new so earlier "system" choices reset.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="setuware-theme"
      disableTransitionOnChange
    >
      {children}
    </NextThemeProvider>
  );
}

/**
 * One button that switches between light and dark. Both icons are rendered and
 * cross-fade, so nothing jumps while the stored theme is read after hydration.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useHydrated();
  const dark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Light theme" : "Dark theme"}
      className={cn(
        "relative inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-foreground/80 transition-colors hover:border-foreground/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-setu/60",
        className,
      )}
    >
      <Sun
        aria-hidden
        className={cn("absolute size-4 transition-all duration-300", dark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0")}
      />
      <Moon
        aria-hidden
        className={cn("absolute size-4 transition-all duration-300", dark ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100")}
      />
    </button>
  );
}
