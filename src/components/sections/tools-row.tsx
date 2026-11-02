import type { CSSProperties } from "react";
import {
  siFigma,
  siFlutter,
  siGoogleanalytics,
  siGooglecloud,
  siLaravel,
  siNextdotjs,
  siNodedotjs,
  siPostgresql,
  siRazorpay,
  siReact,
  siShopify,
  siTailwindcss,
  siWoocommerce,
  siWordpress,
  type SimpleIcon,
} from "simple-icons";

import { cn } from "@/lib/utils";
import { Marquee } from "@/components/ui/marquee";
import { FadeUp } from "@/components/motion/primitives";
import { TextReveal } from "@/components/motion/text-reveal";

/**
 * A platform in the row. Marks come from the `simple-icons` package (CC0 SVG
 * paths, published by each brand for this kind of reference use). A platform
 * the package does not carry — AWS was withdrawn at Amazon's request — gets a
 * neutral monogram chip instead of a redrawn logo.
 */
type Tool =
  /**
   * `wide`: a landscape mark (WooCommerce's is about 5:1) that would shrink to
   * a sliver in the square box. Its symbol is cropped to the mark and given a
   * wider box instead.
   */
  | { name: string; icon: SimpleIcon; wide?: boolean }
  | { name: string; monogram: string };

const ROW_ONE: readonly Tool[] = [
  { name: "WordPress", icon: siWordpress },
  { name: "Shopify", icon: siShopify },
  { name: "WooCommerce", icon: siWoocommerce, wide: true },
  { name: "Razorpay", icon: siRazorpay },
  { name: "Next.js", icon: siNextdotjs },
  { name: "React", icon: siReact },
  { name: "Tailwind CSS", icon: siTailwindcss },
  { name: "Figma", icon: siFigma },
];

const ROW_TWO: readonly Tool[] = [
  { name: "React Native", icon: siReact },
  { name: "Flutter", icon: siFlutter },
  { name: "Node.js", icon: siNodedotjs },
  { name: "Laravel", icon: siLaravel },
  { name: "PostgreSQL", icon: siPostgresql },
  { name: "Amazon Web Services", monogram: "AWS" },
  { name: "Google Cloud", icon: siGooglecloud },
  { name: "Google Analytics", icon: siGoogleanalytics },
];

/** Viewboxes cropped to the artwork, for the `wide` marks. */
const CROPPED_VIEWBOX: Record<string, string> = { woocommerce: "0 9.08 24 5.84" };

/** Every distinct icon once, for the sprite. */
const SPRITE_ICONS = [...new Map(
  [...ROW_ONE, ...ROW_TWO].flatMap((tool) =>
    "icon" in tool ? [[tool.icon.slug, tool.icon] as const] : [],
  ),
).values()];

/**
 * Brand colours too dark to read on the dark theme's surface (Next.js black,
 * Razorpay navy) fall back to the foreground colour there.
 */
function isDarkHex(hex: string): boolean {
  const n = Number.parseInt(hex, 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 60;
}

/**
 * Each path is defined once in a hidden sprite and referenced with `<use>`:
 * the marquee renders its row twice for a seamless loop, and the reduced-motion
 * list renders it again, so inlining the paths would ship them several times.
 */
function IconSprite() {
  return (
    <svg aria-hidden focusable="false" className="absolute size-0 overflow-hidden">
      <defs>
        {SPRITE_ICONS.map((icon) => (
          <symbol
            key={icon.slug}
            id={`tool-${icon.slug}`}
            viewBox={CROPPED_VIEWBOX[icon.slug] ?? "0 0 24 24"}
          >
            <path d={icon.path} fill="currentColor" />
          </symbol>
        ))}
      </defs>
    </svg>
  );
}

function ToolPill({ tool }: { tool: Tool }) {
  const hex = "icon" in tool ? tool.icon.hex : null;
  const dark = hex ? isDarkHex(hex) : false;

  return (
    <span
      style={hex ? ({ "--brand": `#${hex}` } as CSSProperties) : undefined}
      className={cn(
        "group/tool flex h-14 shrink-0 items-center gap-3 rounded-2xl border border-border/80 bg-white py-2 pr-5 pl-2.5 whitespace-nowrap dark:bg-surface",
        "shadow-[0_1px_2px_rgb(var(--shadow-color)/0.05),0_10px_24px_-14px_rgb(var(--shadow-color)/0.22)]",
        "transition-[translate,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "hover:shadow-[0_2px_4px_rgb(var(--shadow-color)/0.06),0_18px_36px_-16px_rgb(var(--shadow-color)/0.3)] motion-safe:hover:-translate-y-0.5",
        hex
          ? "hover:border-[color-mix(in_oklab,var(--brand)_35%,var(--border))]"
          : "hover:border-foreground/20",
        "mx-2 lg:mx-2.5 lg:h-16 lg:gap-3.5 lg:pr-6 lg:pl-3",
      )}
    >
      {hex && "icon" in tool ? (
        <span
          aria-hidden
          className={cn(
            "flex h-9 items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--brand)_9%,transparent)] text-[var(--brand)] lg:h-10",
            tool.wide ? "w-16 lg:w-[4.5rem]" : "w-9 lg:w-10",
            dark && "dark:bg-white/10 dark:text-foreground",
          )}
        >
          <svg
            aria-hidden
            focusable="false"
            className={tool.wide ? "h-3 w-12 lg:h-3.5 lg:w-14" : "size-[1.15rem] lg:size-5"}
          >
            <use href={`#tool-${tool.icon.slug}`} />
          </svg>
        </span>
      ) : (
        <span
          aria-hidden
          className="flex size-9 items-center justify-center rounded-xl bg-foreground/[0.06] text-[0.62rem] font-bold tracking-[0.04em] text-foreground/70 lg:size-10 lg:text-[0.68rem]"
        >
          {"monogram" in tool ? tool.monogram : null}
        </span>
      )}
      <span className="text-[0.92rem] font-medium tracking-[-0.01em] text-foreground/80 transition-colors duration-300 group-hover/tool:text-foreground lg:text-[0.98rem]">
        {tool.name}
      </span>
    </span>
  );
}

/**
 * "Built with the right tools" (Figma 24:2683, 24:2732, 24:3093).
 *
 * The platforms we build on, as logo pills in two rows that drift in opposite
 * directions (CSS only, paused under the pointer, faded at the edges). With
 * reduced motion the rows are replaced by one static, wrapped list.
 */
export function ToolsRow() {
  return (
    <section
      aria-labelledby="tools-heading"
      className="relative isolate overflow-hidden border-y border-border bg-[linear-gradient(180deg,#f6f9fc,var(--background)_70%)] py-16 md:py-24 dark:bg-[linear-gradient(180deg,var(--background-subtle),var(--background)_70%)]"
    >
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div
          className="absolute inset-0 dark:opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(40rem 22rem at 50% 0%, rgba(0,161,198,0.12), transparent 70%), radial-gradient(30rem 24rem at 100% 100%, rgba(0,97,168,0.08), transparent 70%), radial-gradient(28rem 22rem at 0% 90%, rgba(0,161,198,0.07), transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(currentColor_1px,transparent_1.2px)] bg-[size:22px_22px] text-[#0b1020]/[0.07] dark:text-white/[0.06]"
          style={{
            maskImage: "radial-gradient(ellipse 70% 70% at 50% 45%, #000 20%, transparent 75%)",
          }}
        />
      </div>

      <IconSprite />

      <div className="container-figma">
        <div className="mx-auto max-w-xl text-center lg:max-w-[calc(var(--s)*807)]">
          <TextReveal
            as="h2"
            id="tools-heading"
            className="text-[1.6rem] leading-[1.366] font-semibold tracking-[-0.01em] text-foreground lg:text-[calc(var(--s)*30)]"
          >
            Built with the right tools
          </TextReveal>
          <FadeUp delay={0.25} y={18}>
            <p className="mt-3 text-[0.95rem] leading-[1.8] text-foreground/70 lg:mt-[calc(var(--s)*21)] lg:text-[calc(var(--s)*16)] lg:leading-[calc(var(--s)*29)]">
              We work with proven, well-supported technologies, chosen for
              performance, security and long-term maintainability.
            </p>
          </FadeUp>
        </div>
      </div>

      <FadeUp delay={0.4} y={24} blur={false}>
        <div className="mx-auto mt-10 flex max-w-[110rem] flex-col gap-4 motion-reduce:hidden lg:mt-[calc(var(--s)*56)] lg:gap-5">
          <Marquee durationSeconds={46} className="py-2">
            {ROW_ONE.map((tool) => (
              <ToolPill key={tool.name} tool={tool} />
            ))}
          </Marquee>
          <Marquee durationSeconds={52} reverse className="py-2">
            {ROW_TWO.map((tool) => (
              <ToolPill key={tool.name} tool={tool} />
            ))}
          </Marquee>
        </div>

        <ul className="container-page mt-10 hidden flex-wrap justify-center gap-y-3 motion-reduce:flex">
          {[...ROW_ONE, ...ROW_TWO].map((tool) => (
            <li key={tool.name}>
              <ToolPill tool={tool} />
            </li>
          ))}
        </ul>
      </FadeUp>
    </section>
  );
}
