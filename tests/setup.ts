import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

/**
 * jsdom implements neither IntersectionObserver nor matchMedia, both of which
 * our motion primitives depend on. These stubs make components render in their
 * "visible, motion allowed" state by default; individual tests override them
 * where the opposite behaviour is what is being asserted.
 */

class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(private readonly callback: IntersectionObserverCallback) {
    observers.add(this);
  }

  observe(target: Element): void {
    // Report an immediate intersection so scroll-triggered UI is testable
    // without simulating a scroll.
    this.callback(
      [{ isIntersecting: true, target } as IntersectionObserverEntry],
      this,
    );
  }

  unobserve(): void {}
  disconnect(): void {
    observers.delete(this);
  }
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

export const observers = new Set<IntersectionObserver>();

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );

  if (!window.requestAnimationFrame) {
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) =>
      setTimeout(() => cb(performance.now()), 0) as unknown as number,
    );
    vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id));
  }

  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
  observers.clear();
  vi.unstubAllGlobals();
});
