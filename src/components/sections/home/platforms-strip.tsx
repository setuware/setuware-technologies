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
    <section aria-label="Platforms we build on" className="relative bg-white dark:bg-surface">
      <div className="flex flex-col md:flex-row md:items-stretch">
        <div className="relative z-10 flex shrink-0 items-center bg-[linear-gradient(110deg,#1e3a8a,#2f56d8_60%,#3b6cf6)] px-8 py-6 text-white md:w-[20rem] md:py-9 md:pl-[max(1.25rem,calc((100vw-var(--figma-col))/2))] md:[clip-path:polygon(0_0,100%_0,86%_100%,0_100%)] lg:w-[calc((100vw-var(--figma-col))/2+16rem)]">
          <p className="whitespace-nowrap pr-10 text-[1.35rem] font-semibold leading-tight tracking-[-0.01em] lg:text-[1.6rem]">
            Platforms we build on
          </p>
        </div>
        <div className="min-w-0 flex-1 py-6 md:py-9">
          <Marquee durationSeconds={35}>
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
