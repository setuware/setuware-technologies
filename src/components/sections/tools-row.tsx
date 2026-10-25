import { techStack } from "@/lib/content";
import { Marquee } from "@/components/ui/marquee";

/**
 * "Built With the Right Tools".
 *
 * Wordmarks rather than logo images: no extra requests, no third-party mark
 * licensing to clear, and it stays legible in both themes.
 */
export function ToolsRow() {
  return (
    <section className="bg-background pb-20 md:pb-24">
      <div className="container-page">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-[1.4rem] font-semibold text-foreground">
            Built With the Right Tools
          </h2>
          <p className="mt-3 text-[0.85rem] leading-relaxed text-muted-foreground">
            From robust backend systems to intuitive user interfaces, we bring
            together the technologies needed to create dependable software and
            seamless digital experiences.
          </p>
        </div>
      </div>

      <Marquee durationSeconds={42} className="mt-9">
        {techStack.map((tool) => (
          <span
            key={tool.name}
            className="mx-7 whitespace-nowrap font-display text-xl font-semibold text-foreground/60 transition-colors hover:text-foreground"
          >
            {tool.name}
          </span>
        ))}
      </Marquee>
    </section>
  );
}
