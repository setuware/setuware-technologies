import { Marquee } from "@/components/ui/marquee";
import { FadeUp } from "@/components/motion/primitives";
import { TextReveal } from "@/components/motion/text-reveal";

/**
 * The logo row in the design (Figma 24:3093), left to right. Rendered as
 * wordmarks: the Figma logo exports could not be fetched, and text keeps the
 * row legible in both themes without third-party mark licensing to clear.
 */
const TOOLS = [
  "React",
  "PostgreSQL",
  "Redis",
  "TypeScript",
  "Next.js",
  "AWS",
  "Express",
  "Docker",
  "Node.js",
  "GitHub",
  "Vercel",
] as const;

/**
 * "Built with the right tools" (Figma 24:2683, 24:2732, 24:3093).
 *
 * Each logo occupies the design's 137×61 slot on a 196px pitch; the row loops
 * forever (CSS only) and pauses on hover. Hovering the row lifts every
 * wordmark out of its muted grey a little; the one under the cursor comes up
 * to full strength and grows slightly.
 */
export function ToolsRow() {
  return (
    <section
      aria-labelledby="tools-heading"
      className="pb-4 lg:pb-0"
    >
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
              A small stack we know end to end: TypeScript across the front and
              back, PostgreSQL and Redis for data, Docker on AWS or Vercel for
              deploys. Fewer moving parts means faster fixes.
            </p>
          </FadeUp>
        </div>
      </div>

      <FadeUp delay={0.4} y={24} blur={false}>
        <Marquee
          durationSeconds={40}
          className="group/tools mt-9 lg:mt-[calc(var(--s)*52)]"
        >
          {TOOLS.map((name) => (
            <span
              key={name}
              className="flex h-12 w-28 items-center justify-center text-xl font-semibold tracking-[-0.02em] whitespace-nowrap text-foreground/45 transition-[color,scale] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/tools:text-foreground/65 hover:text-foreground! motion-safe:hover:scale-110 mx-5 lg:mx-[calc(var(--s)*29.7)] lg:h-[calc(var(--s)*61)] lg:w-[calc(var(--s)*137)] lg:text-[calc(var(--s)*24)]"
            >
              {name}
            </span>
          ))}
        </Marquee>
      </FadeUp>
    </section>
  );
}
