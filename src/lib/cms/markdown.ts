import type { Block } from "@/lib/post-bodies";

/**
 * Markdown <-> article blocks.
 *
 * The admin edits Markdown; the site renders the same typed blocks the
 * hand-written articles use, so every post keeps the house design and no
 * HTML from an editor ever reaches the page. Supported:
 *
 *   ## Heading · ### Subheading · paragraphs · - bullets · 1. numbers
 *   > quote (a last line "— Name" becomes the citation)
 *   ```lang code fences · ![alt](src "caption")
 *   > [!NOTE] / > [!WARNING] callouts
 *   Inline: **bold**, *italic*, `code`, [link](url)
 */
export function markdownToBlocks(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  const isBreak = (line: string) =>
    line.trim() === "" ||
    /^#{2,3}\s/.test(line) ||
    /^\s*[-*]\s+/.test(line) ||
    /^\s*\d+[.)]\s+/.test(line) ||
    line.startsWith(">") ||
    line.startsWith("```") ||
    /^!\[/.test(line);

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "") {
      i += 1;
      continue;
    }

    if (trimmed.startsWith("```")) {
      const language = trimmed.slice(3).trim() || "text";
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        code.push(lines[i]);
        i += 1;
      }
      i += 1; // closing fence
      blocks.push({ type: "code", language, code: code.join("\n") });
      continue;
    }

    const heading = trimmed.match(/^(#{2,3})\s+(.*)$/);
    if (heading) {
      blocks.push({ type: heading[1].length === 2 ? "h2" : "h3", text: heading[2].trim() });
      i += 1;
      continue;
    }

    const image = trimmed.match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/);
    if (image) {
      blocks.push({ type: "image", alt: image[1], src: image[2], ...(image[3] ? { caption: image[3] } : {}) });
      i += 1;
      continue;
    }

    if (trimmed.startsWith(">")) {
      const quoted: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        const content = lines[i].trim().replace(/^>\s?/, "");
        // A callout marker or a line after a citation starts a new block.
        if (quoted.length > 0 && (/^\[!\w+\]/.test(content) || /^[—–-]{1,2}\s/.test(quoted[quoted.length - 1]))) break;
        quoted.push(content);
        i += 1;
      }
      const callout = quoted[0]?.match(/^\[!(NOTE|INFO|TIP|WARNING|WARN|CAUTION)\]\s*$/i);
      if (callout) {
        const tone = /^(WARNING|WARN|CAUTION)$/i.test(callout[1]) ? "warn" : "info";
        blocks.push({ type: "callout", tone, text: quoted.slice(1).join(" ").trim() });
        continue;
      }
      const last = quoted[quoted.length - 1] ?? "";
      const cite = last.match(/^[—–-]{1,2}\s*(.+)$/);
      const body = (cite ? quoted.slice(0, -1) : quoted).join(" ").trim();
      blocks.push(cite ? { type: "quote", text: body, cite: cite[1].trim() } : { type: "quote", text: body });
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, "").trim());
        i += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+[.)]\s+/, "").trim());
        i += 1;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    const paragraph: string[] = [trimmed];
    i += 1;
    while (i < lines.length && !isBreak(lines[i])) {
      paragraph.push(lines[i].trim());
      i += 1;
    }
    blocks.push({ type: "p", text: paragraph.join(" ") });
  }

  return blocks;
}

export function blocksToMarkdown(blocks: readonly Block[]): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case "p":
          return block.text;
        case "h2":
          return `## ${block.text}`;
        case "h3":
          return `### ${block.text}`;
        case "ul":
          return block.items.map((item) => `- ${item}`).join("\n");
        case "ol":
          return block.items.map((item, index) => `${index + 1}. ${item}`).join("\n");
        case "quote":
          return `> ${block.text}${block.cite ? `\n> — ${block.cite}` : ""}`;
        case "code":
          return `\`\`\`${block.language}\n${block.code}\n\`\`\``;
        case "callout":
          return `> [!${block.tone === "warn" ? "WARNING" : "NOTE"}]\n> ${block.text}`;
        case "image":
          return `![${block.alt}](${block.src}${block.caption ? ` "${block.caption}"` : ""})`;
        default:
          return "";
      }
    })
    .join("\n\n");
}

/** About 220 words a minute, never less than one. */
export function readingMinutes(markdown: string): number {
  const words = markdown.replace(/```[\s\S]*?```/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
