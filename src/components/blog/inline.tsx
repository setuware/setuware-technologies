import { Fragment } from "react";

/**
 * Minimal inline Markdown for article text: **bold**, *italic*, `code` and
 * [links](https://…). Produces React elements only (no HTML strings), and
 * only http(s), mailto and site-relative links are allowed.
 */
const TOKEN = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;

function safeHref(href: string): string | null {
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  if (/^(https?:|mailto:)/i.test(href)) return href;
  return null;
}

export function Inline({ text }: { text: string }) {
  const parts = text.split(TOKEN);
  return (
    <>
      {parts.map((part, index) => {
        if (!part) return null;
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          return (
            <strong key={index} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
          return (
            <code key={index} className="rounded bg-foreground/[0.06] px-1.5 py-0.5 font-mono text-[0.88em]">
              {part.slice(1, -1)}
            </code>
          );
        }
        const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
        if (link) {
          const href = safeHref(link[2]);
          if (!href) return <Fragment key={index}>{link[1]}</Fragment>;
          const external = /^https?:/i.test(href);
          return (
            <a
              key={index}
              href={href}
              className="font-medium text-setu-dark underline decoration-setu/40 underline-offset-4 hover:decoration-setu dark:text-[#5fe0f7]"
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {link[1]}
            </a>
          );
        }
        if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
          return <em key={index}>{part.slice(1, -1)}</em>;
        }
        return <Fragment key={index}>{part}</Fragment>;
      })}
    </>
  );
}
