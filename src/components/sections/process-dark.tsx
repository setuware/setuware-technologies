import { processSteps } from "@/lib/content";
import { Reveal } from "@/components/ui/reveal";
import { DarkSectionBackdrop } from "@/components/sections/services-dark";

/**
 * "A refined process built on clarity".
 *
 * One row per stage: number, name, the deliverables as a pill, and the
 * duration. The deliverable string is pipe-separated in the content layer, so
 * it is split here rather than stored pre-formatted — the data stays usable
 * by anything else that wants the individual items.
 */
export function ProcessDark() {
  return (
    <section
      id="process"
      className="relative overflow-hidden bg-black pb-24 pt-4 md:pb-32"
    >
      {/* Lower end of Figma 24:2647, continuing the services backdrop. */}
      <DarkSectionBackdrop position="bottom" />

      <div className="container-page relative">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold leading-tight text-white sm:text-[2.6rem]">
            A refined process
            <br />
            built on clarity
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[0.92rem] leading-relaxed text-white/60">
            Over time we refined a rigorous, collaborative approach that keeps
            teams aligned and drives measurable results. We aim for lasting
            impact, not just hand-offs.
          </p>
        </div>

        <dl className="mx-auto mt-14 max-w-5xl">
          {processSteps.map((step, index) => (
            <Reveal
              key={step.step}
              delay={index * 50}
              className="grid items-center gap-3 border-t border-white/10 py-5 md:grid-cols-[14rem_1fr_7rem] md:gap-6"
            >
              <dt className="flex items-center gap-4 text-[1rem] font-medium text-white">
                <span className="font-mono text-[0.7rem] text-white/55">{step.step}</span>
                {step.title}
              </dt>

              <dd className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full bg-white/[0.06] px-5 py-2.5">
                {step.deliverable.split("|").map((item, itemIndex) => (
                  <span key={item} className="flex items-center gap-2">
                    {itemIndex > 0 ? (
                      <span className="text-white/20" aria-hidden>
                        |
                      </span>
                    ) : null}
                    <span className="text-[0.78rem] text-white/60">{item.trim()}</span>
                  </span>
                ))}
              </dd>

              <dd className="text-[0.78rem] text-white/50 md:justify-self-end">
                {step.duration}
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
