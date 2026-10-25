import * as React from "react";

export interface DeferredSectionProps {
  children: React.ReactNode;
  /**
   * Approximate rendered height. The browser uses it to size the placeholder
   * while the content is skipped, which is what keeps the scrollbar stable.
   */
  minHeight?: number;
}

/**
 * Defers *rendering* of off-screen content without hiding it from anyone.
 *
 * `content-visibility: auto` lets the browser skip layout, style and paint for
 * subtrees outside the viewport, then do that work as they approach it. Unlike
 * gating a section behind an IntersectionObserver, the markup is still in the
 * HTML response — so crawlers, Reader modes, in-page search (Ctrl+F) and
 * no-JavaScript visitors all see the full page, and nothing pops in late.
 *
 * `contain-intrinsic-size` supplies the placeholder height so skipping costs no
 * layout shift. Browsers without support simply render normally.
 */
export function DeferredSection({ children, minHeight = 600 }: DeferredSectionProps) {
  return (
    <div
      style={{
        contentVisibility: "auto",
        containIntrinsicSize: `auto ${minHeight}px`,
      }}
    >
      {children}
    </div>
  );
}
