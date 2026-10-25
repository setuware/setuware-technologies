"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

/**
 * Small client hooks shared by the interactive pieces. Hand-rolled on top of
 * platform APIs rather than an animation library, so motion costs kilobytes
 * instead of tens of them.
 */

export interface InViewOptions {
  /** Stop observing after the first intersection. */
  once?: boolean;
  /** Fraction of the element that must be visible. */
  threshold?: number;
  /** Start the animation slightly before the element scrolls in. */
  rootMargin?: string;
}

export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: InViewOptions = {},
): { ref: React.RefObject<T | null>; inView: boolean } {
  const { once = true, threshold = 0.15, rootMargin = "0px 0px -10% 0px" } = options;
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Server-rendered markup is visible by default; if the browser cannot
    // observe, show the content rather than hiding it forever.
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [once, threshold, rootMargin]);

  return { ref, inView };
}

/**
 * Tracks a media query.
 *
 * Built on `useSyncExternalStore` rather than an effect: `matchMedia` is an
 * external store, and this is the API React provides for reading one. It also
 * means the first client render already has the correct value instead of
 * rendering `false` and then correcting itself a frame later.
 *
 * The server snapshot is `false`, so SSR output matches the pre-hydration
 * client render.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === "undefined" || !window.matchMedia) return () => {};
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  }, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/**
 * True once the client has hydrated.
 *
 * For UI that cannot be rendered correctly on the server — a theme toggle
 * whose resolved value is unknown until the browser reports it. Using the
 * external-store API keeps it out of an effect, so there is no extra render
 * pass on mount.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** Window scroll progress from 0 to 1, throttled to animation frames. */
export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      setProgress(scrollable > 0 ? Math.min(1, doc.scrollTop / scrollable) : 0);
    };

    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return progress;
}

/** True once the page has scrolled past `offset` pixels. */
export function useScrolled(offset = 16): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > offset);
    };
    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [offset]);

  return scrolled;
}

/**
 * localStorage-backed state that degrades to in-memory when storage is
 * unavailable (private mode, blocked cookies, quota exceeded).
 */
export function usePersistentState<T>(
  key: string,
  initial: T,
): [T, (value: T | ((previous: T) => T)) => void, { clear: () => void }] {
  const [value, setValue] = useState<T>(initial);
  const hydrated = useRef(false);

  useEffect(() => {
    hydrated.current = true;
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) setValue(JSON.parse(stored) as T);
    } catch {
      // Unreadable or corrupt entry: keep the initial value.
    }
  }, [key]);

  const update = useCallback(
    (next: T | ((previous: T) => T)) => {
      setValue((previous) => {
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(previous) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // Storage full or disabled; state still works for this session.
        }
        return resolved;
      });
    },
    [key],
  );

  const clear = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Nothing to do.
    }
    setValue(initial);
  }, [initial, key]);

  return [value, update, { clear }];
}

/** Locks body scroll while a modal or drawer is open, restoring the exact offset. */
export function useScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;
    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [locked]);
}
