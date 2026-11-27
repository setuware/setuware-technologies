import {
  siFigma,
  siFlutter,
  siGooglecloud,
  siLaravel,
  siNextdotjs,
  siNodedotjs,
  siReact,
  siShopify,
  siWordpress,
  type SimpleIcon,
} from "simple-icons";

import { Marquee } from "@/components/ui/marquee";

const PLATFORMS: readonly { name: string; icon: SimpleIcon }[] = [
  { name: "Next.js", icon: siNextdotjs },
  { name: "React", icon: siReact },
  { name: "Shopify", icon: siShopify },
  { name: "WordPress", icon: siWordpress },
  { name: "Flutter", icon: siFlutter },
  { name: "Node.js", icon: siNodedotjs },
  { name: "Laravel", icon: siLaravel },
  { name: "Google Cloud", icon: siGooglecloud },
  { name: "Figma", icon: siFigma },
];

/** "Platforms we build on" strip under the hero, in place of a client-logo row. */
export function PlatformsStrip() {
  return (
    <section aria-label="Platforms we build on" className="relative border-b border-[#e3e8f5] bg-white dark:border-white/10 dark:bg-surface">
      <div className="container-figma flex flex-col gap-3 py-6 md:flex-row md:items-center md:gap-10 md:py-0">
        <p className="flex shrink-0 items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#5a6180] dark:text-white/60">
          <span aria-hidden className="size-1.5 rounded-full bg-[#22d3ee]" />
          Platforms we build on
        </p>
        <div className="min-w-0 flex-1 md:border-l md:border-[#e3e8f5] md:py-8 md:dark:border-white/10">
          <Marquee durationSeconds={35} className="motion-reduce:overflow-x-auto">
            {PLATFORMS.map(({ name, icon }) => (
              <span
                key={name}
                className="mx-8 inline-flex items-center gap-3 text-[1.05rem] font-semibold text-[#1f2544] dark:text-white/85"
              >
                <svg viewBox="0 0 24 24" className="size-7" aria-hidden fill={`#${icon.hex === "000000" ? "1f2544" : icon.hex}`}>
                  <path d={icon.path} />
                </svg>
                {name}
              </span>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}
