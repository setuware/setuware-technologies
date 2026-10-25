import { describe, expect, it } from "vitest";

import { RateLimiter } from "@/lib/rate-limit";

/** Controllable clock so window behaviour is tested without waiting. */
function clock(start = 1_000_000) {
  let now = start;
  return {
    now: () => now,
    advance: (ms: number) => {
      now += ms;
    },
  };
}

describe("RateLimiter", () => {
  it("allows requests up to the limit", () => {
    const limiter = new RateLimiter({ limit: 3, windowMs: 60_000 });

    expect(limiter.consume("a").ok).toBe(true);
    expect(limiter.consume("a").ok).toBe(true);
    const third = limiter.consume("a");

    expect(third.ok).toBe(true);
    expect(third.remaining).toBe(0);
  });

  it("rejects the request that exceeds the limit", () => {
    const limiter = new RateLimiter({ limit: 2, windowMs: 60_000 });
    limiter.consume("a");
    limiter.consume("a");

    const blocked = limiter.consume("a");

    expect(blocked.ok).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("keeps separate budgets per key", () => {
    const limiter = new RateLimiter({ limit: 1, windowMs: 60_000 });

    expect(limiter.consume("a").ok).toBe(true);
    expect(limiter.consume("b").ok).toBe(true);
    expect(limiter.consume("a").ok).toBe(false);
  });

  it("resets once the window elapses", () => {
    const time = clock();
    const limiter = new RateLimiter({ limit: 1, windowMs: 60_000, now: time.now });

    expect(limiter.consume("a").ok).toBe(true);
    expect(limiter.consume("a").ok).toBe(false);

    time.advance(60_001);

    expect(limiter.consume("a").ok).toBe(true);
  });

  it("does not extend the cooldown when a blocked client keeps retrying", () => {
    const time = clock();
    const limiter = new RateLimiter({ limit: 1, windowMs: 10_000, now: time.now });

    limiter.consume("a");
    const first = limiter.consume("a");

    time.advance(5_000);
    const second = limiter.consume("a");

    // Same reset instant: hammering the endpoint must not push it further out.
    expect(second.resetAt).toBe(first.resetAt);
    expect(second.retryAfter).toBeLessThan(first.retryAfter);
  });

  it("reports a reset timestamp in the future", () => {
    const time = clock();
    const limiter = new RateLimiter({ limit: 5, windowMs: 30_000, now: time.now });

    expect(limiter.consume("a").resetAt).toBe(time.now() + 30_000);
  });

  it("supports a cost greater than one", () => {
    const limiter = new RateLimiter({ limit: 5, windowMs: 60_000 });

    expect(limiter.consume("a", 4).ok).toBe(true);
    expect(limiter.consume("a", 2).ok).toBe(false);
    // The rejected request must not have been partially charged.
    expect(limiter.consume("a", 1).ok).toBe(true);
  });

  it("sweeps expired windows so memory does not grow unbounded", () => {
    const time = clock();
    const limiter = new RateLimiter({ limit: 1, windowMs: 1_000, now: time.now });

    for (let i = 0; i < 500; i += 1) limiter.consume(`key-${i}`);
    expect(limiter.size).toBe(500);

    time.advance(1_001);
    limiter.consume("fresh");

    expect(limiter.size).toBe(1);
  });

  it("caps tracked keys even when every window is still live", () => {
    const limiter = new RateLimiter({ limit: 1, windowMs: 3_600_000 });

    for (let i = 0; i < 20_100; i += 1) limiter.consume(`key-${i}`);

    expect(limiter.size).toBeLessThanOrEqual(20_001);
  });

  it("clears one key or all keys on reset", () => {
    const limiter = new RateLimiter({ limit: 1, windowMs: 60_000 });
    limiter.consume("a");
    limiter.consume("b");

    limiter.reset("a");
    expect(limiter.consume("a").ok).toBe(true);
    expect(limiter.consume("b").ok).toBe(false);

    limiter.reset();
    expect(limiter.size).toBe(0);
  });
});
