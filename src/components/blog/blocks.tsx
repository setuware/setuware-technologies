import { Info, TriangleAlert } from "lucide-react";

import type { Block } from "@/lib/post-bodies";

/**
 * Renders structured post blocks.
 *
 * A switch over a typed union rather than an HTML string: there is no
 * `dangerouslySetInnerHTML` anywhere in the article path, so post content can
 * never inject markup.
 */
export function PostBody({ blocks }: { blocks: readonly Block[] }) {
  return (
    <div className="flex flex-col gap-5">
      {blocks.map((block, index) => (
        <BlockView key={index} block={block} />
      ))}
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "h2":
      return <h2 className="mt-6 text-2xl font-semibold text-foreground">{block.text}</h2>;
    case "h3":
      return <h3 className="mt-4 text-xl font-semibold text-foreground">{block.text}</h3>;
    case "p":
      return (
        <p className="text-[1.02rem] leading-[1.75] text-muted-foreground">{block.text}</p>
      );
    case "ul":
      return (
        <ul className="flex flex-col gap-2.5 pl-1">
          {block.items.map((item) => (
            <li
              key={item}
              className="flex gap-3 text-[1rem] leading-relaxed text-muted-foreground"
            >
              <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="flex flex-col gap-2.5">
          {block.items.map((item, index) => (
            <li
              key={item}
              className="flex gap-3 text-[1rem] leading-relaxed text-muted-foreground"
            >
              <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/12 font-mono text-[11px] font-semibold text-primary">
                {index + 1}
              </span>
              {item}
            </li>
          ))}
        </ol>
      );
    case "quote":
      return (
        <blockquote className="border-l-2 border-primary pl-5 text-[1.08rem] font-medium italic leading-relaxed text-foreground">
          {block.text}
          {block.cite ? (
            <cite className="mt-2 block text-sm not-italic text-muted-foreground">
              — {block.cite}
            </cite>
          ) : null}
        </blockquote>
      );
    case "code":
      return (
        // tabIndex + a label: a scrollable region that cannot be focused is
        // unreachable for anyone navigating by keyboard, which is the common
        // case on a narrow screen where this block scrolls sideways.
        <pre
          tabIndex={0}
          role="region"
          aria-label={`${block.language} code sample`}
          className="overflow-x-auto rounded-card border border-border bg-surface-2 p-4 text-[0.82rem] leading-relaxed"
        >
          <code className="font-mono text-foreground/90">{block.code}</code>
        </pre>
      );
    case "callout": {
      const warn = block.tone === "warn";
      const Icon = warn ? TriangleAlert : Info;
      return (
        <aside
          className={
            warn
              ? "flex gap-3 rounded-card border border-amber-500/30 bg-amber-500/8 p-4"
              : "flex gap-3 rounded-card border border-primary/25 bg-primary/6 p-4"
          }
        >
          <Icon
            className={
              warn
                ? "mt-0.5 size-4 shrink-0 text-amber-500"
                : "mt-0.5 size-4 shrink-0 text-primary"
            }
            aria-hidden
          />
          <p className="text-[0.95rem] leading-relaxed text-foreground/85">{block.text}</p>
        </aside>
      );
    }
    default: {
      // Exhaustiveness guard: adding a block type without a case fails here.
      const exhaustive: never = block;
      return exhaustive;
    }
  }
}
