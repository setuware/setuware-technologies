import { Marquee } from "@/components/ui/marquee";
import { FadeUp } from "@/components/motion/primitives";
import { TextReveal } from "@/components/motion/text-reveal";

/**
 * The logo row in the design (Figma 24:3093), listing the platforms we build
 * on, from website builders to app frameworks. Rendered as
 * wordmarks: the Figma logo exports could not be fetched, and text keeps the
 * row legible in both themes without third-party mark licensing to clear.
 */
const TOOLS = [
  "WordPress",
  "Shopify",
  "WooCommerce",
  "Next.js",
  "React",
  "React Native",
  "Flutter",
  "Figma",
  "Node.js",
  "Laravel",
  "AWS",
  "Google Analytics",
  "Razorpay",
] as const;

/**
 * "Built with the right tools" (Figma 24:2683, 24:2732, 24:3093).
 *
 * Each name occupies at least the design's 137×61 slot (longer names such as
 * "Google Analytics" widen theirs rather than overlap a neighbour); the row loops
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
              We work with proven, well-supported technologies, chosen for
              performance, security and long-term maintainability.
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
              className="flex h-12 min-w-28 items-center justify-center text-xl font-semibold tracking-[-0.02em] whitespace-nowrap text-foreground/45 transition-[color,scale] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/tools:text-foreground/65 hover:text-foreground! motion-safe:hover:scale-110 mx-5 lg:mx-[calc(var(--s)*29.7)] lg:h-[calc(var(--s)*61)] lg:min-w-[calc(var(--s)*137)] lg:text-[calc(var(--s)*24)]"
            >
              {name}
            </span>
          ))}
        </Marquee>
      </FadeUp>
    </section>
  );
}
