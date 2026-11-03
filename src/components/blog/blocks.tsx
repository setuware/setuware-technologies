import { Info, TriangleAlert } from "lucide-react";

import { Inline } from "@/components/blog/inline";

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
    <div className="flex flex-col gap-6 text-[1.0625rem]">
      {blocks.map((block, index) => (
        <BlockView key={index} block={block} />
      ))}
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "h2":
      return (
        <h2 className="mt-8 scroll-mt-24 font-display text-[1.65rem] font-semibold leading-[1.25] tracking-tight text-foreground first:mt-0">
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3 className="mt-3 font-display text-[1.25rem] font-semibold leading-snug text-foreground">
          {block.text}
        </h3>
      );
    case "p":
      return (
        <p className="leading-[1.8] text-foreground/80">
          <Inline text={block.text} />
        </p>
      );
    case "ul":
      return (
        <ul className="flex flex-col gap-3 pl-1">
          {block.items.map((item) => (
            <li key={item} className="flex gap-3.5 leading-[1.7] text-foreground/80">
              <span className="mt-[0.7rem] size-1.5 shrink-0 rounded-full bg-setu" aria-hidden />
              <span>
                <Inline text={item} />
              </span>
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="flex flex-col gap-3">
          {block.items.map((item, index) => (
            <li key={item} className="flex gap-3.5 leading-[1.7] text-foreground/80">
              <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-setu/12 font-mono text-[11px] font-semibold text-setu">
                {index + 1}
              </span>
              <span>
                <Inline text={item} />
              </span>
            </li>
          ))}
        </ol>
      );
    case "quote":
      return (
        <blockquote className="my-2 rounded-r-card border-l-[3px] border-setu bg-setu/[0.05] py-5 pl-6 pr-5 font-display text-[1.2rem] font-medium leading-relaxed text-foreground">
          {block.text}
          {block.cite ? (
            <cite className="mt-3 block font-sans text-sm font-normal not-italic text-muted-foreground">
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
          className="overflow-x-auto rounded-card border border-white/10 bg-[#0b0f1a] p-5 text-[0.84rem] leading-[1.7] shadow-ambient"
        >
          <code className="font-mono text-slate-200">{block.code}</code>
        </pre>
      );
    case "callout": {
      const warn = block.tone === "warn";
      const Icon = warn ? TriangleAlert : Info;
      return (
        <aside
          className={
            warn
              ? "flex gap-3 rounded-card border border-amber-500/30 bg-amber-500/8 p-5"
              : "flex gap-3 rounded-card border border-setu/25 bg-setu/[0.06] p-5"
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
          <p className="text-[0.98rem] leading-relaxed text-foreground/85">
            <Inline text={block.text} />
          </p>
        </aside>
      );
    }
    case "image":
      return (
        <figure className="my-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- uploaded media, sized by CSS */}
          <img
            src={block.src}
            alt={block.alt}
            loading="lazy"
            decoding="async"
            className="w-full rounded-card border border-border object-cover"
          />
          {block.caption ? (
            <figcaption className="mt-2.5 text-center text-sm text-muted-foreground">{block.caption}</figcaption>
          ) : null}
        </figure>
      );
    default: {
      // Exhaustiveness guard: adding a block type without a case fails here.
      const exhaustive: never = block;
      return exhaustive;
    }
  }
}
