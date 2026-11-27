import { FadeUp, Stagger, StaggerItem } from "@/components/motion/primitives";
import { processSteps } from "@/lib/content";
import { Eyebrow, SectionTitle } from "./shared";

/** Six-step delivery process as a numbered track: typography, no photography. */
export function ProcessSteps() {
  return (
    <section id="process" className="relative overflow-hidden bg-white py-20 dark:bg-surface lg:py-28">
      <div className="container-figma">
        <FadeUp className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-16">
          <div>
            <Eyebrow>A refined process</Eyebrow>
            <SectionTitle>
              How we take your project from idea to <span className="text-[#2f56d8] dark:text-[#7c9bff]">launch</span>
            </SectionTitle>
          </div>
          <p className="text-[1.02rem] leading-relaxed text-[#5a6180] dark:text-white/70">
            A clear, six-step delivery process with a defined output at every stage, so you always
            know what is happening and what comes next.
          </p>
        </FadeUp>

        <Stagger as="ol" className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {processSteps.map((step, i) => (
            <StaggerItem
              as="li"
              key={step.step}
              className="group relative border-t-2 border-[#e3e8f5] pt-6 transition-colors duration-300 hover:border-[#2f56d8] dark:border-white/12 dark:hover:border-[#7c9bff]"
            >
              <span aria-hidden className="absolute -top-[7px] left-0 size-3 rounded-full border-2 border-[#2f56d8] bg-white dark:border-[#7c9bff] dark:bg-surface" />
              <div className="flex items-baseline justify-between gap-4">
                <span
                  aria-hidden
                  className="text-[3.25rem] font-extrabold leading-none tracking-[-0.04em] text-transparent [-webkit-text-stroke:1.5px_#b9c5ee] transition-[color] duration-300 group-hover:text-[#2f56d8] group-hover:[-webkit-text-stroke:1.5px_#2f56d8] dark:[-webkit-text-stroke:1.5px_rgba(255,255,255,0.3)]"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="rounded-full bg-[#eef2ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#2f56d8] dark:bg-white/10 dark:text-[#a9bcff]">
                  {step.duration}
                </span>
              </div>
              <h3 className="mt-5 text-[1.2rem] font-bold tracking-[-0.01em] text-[#0f1330] dark:text-white">{step.title}</h3>
              <p className="mt-2 max-w-[24rem] text-[0.95rem] leading-relaxed text-[#5a6180] dark:text-white/65">{step.description}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
