/**
 * Fixed-window rate limiter for the public form endpoints.
 *
 * Intentionally dependency-free and process-local: it costs nothing, survives
 * a cold start, and is the right default for a marketing site. Behind more
 * than one instance it limits per instance — set `RATE_LIMIT_REDIS_URL` and
 * swap `consume` for a shared store before relying on it as abuse protection.
 *
 * Memory is bounded two ways: expired windows are swept on write, and the map
 * is hard-capped so a flood of unique keys (spoofed IPs) cannot grow it without
 * limit.
 */

export interface RateLimitResult {
  ok: boolean;
  limit: number;
  remaining: number;
  /** Unix ms when the current window resets. */
  resetAt: number;
  /** Seconds the caller should wait; 0 when allowed. */
  retryAfter: number;
}

export interface RateLimitOptions {
  /** Requests allowed per window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
  /** Injected in tests; defaults to `Date.now`. */
  now?: () => number;
}

interface Window {
  count: number;
  resetAt: number;
}

const MAX_TRACKED_KEYS = 20_000;

export class RateLimiter {
  private windows = new Map<string, Window>();

  constructor(private readonly options: RateLimitOptions) {}

  private now(): number {
    return (this.options.now ?? Date.now)();
  }

  /** Drops expired windows, then trims oldest entries if still over capacity. */
  private sweep(now: number): void {
    for (const [key, window] of this.windows) {
      if (window.resetAt <= now) this.windows.delete(key);
    }
    if (this.windows.size <= MAX_TRACKED_KEYS) return;
    const overflow = this.windows.size - MAX_TRACKED_KEYS;
    let removed = 0;
    for (const key of this.windows.keys()) {
      this.windows.delete(key);
      if (++removed >= overflow) break;
    }
  }

  consume(key: string, cost = 1): RateLimitResult {
    const now = this.now();
    const { limit, windowMs } = this.options;

    this.sweep(now);

    const existing = this.windows.get(key);
    const window: Window =
      existing && existing.resetAt > now
        ? existing
        : { count: 0, resetAt: now + windowMs };

    const wouldBe = window.count + cost;
    const allowed = wouldBe <= limit;

    // A rejected request still refreshes nothing: we keep the window intact so
    // a client cannot extend its own cooldown by hammering the endpoint.
    if (allowed) window.count = wouldBe;
    this.windows.set(key, window);

    return {
      ok: allowed,
      limit,
      remaining: Math.max(0, limit - window.count),
      resetAt: window.resetAt,
      retryAfter: allowed ? 0 : Math.max(1, Math.ceil((window.resetAt - now) / 1000)),
    };
  }

  reset(key?: string): void {
    if (key === undefined) this.windows.clear();
    else this.windows.delete(key);
  }

  get size(): number {
    return this.windows.size;
  }
}

/** Shared limiters, sized for a marketing site's real traffic shape. */
export const contactLimiter = new RateLimiter({ limit: 5, windowMs: 10 * 60_000 });
export const newsletterLimiter = new RateLimiter({ limit: 8, windowMs: 60 * 60_000 });
export const estimateLimiter = new RateLimiter({ limit: 20, windowMs: 10 * 60_000 });
