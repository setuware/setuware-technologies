import Image from "next/image";

import { FadeUp, LineGrow, PopIn, Stagger, StaggerItem } from "@/components/motion/primitives";
import { processSteps } from "@/lib/content";
import { Eyebrow, SectionTitle } from "./shared";
import { PROCESS_PHOTOS } from "./copy";

/** Six-step delivery process with circular photography, reference-style. */
export function ProcessSteps() {
  return (
    <section id="process" className="relative overflow-hidden bg-white py-20 dark:bg-surface lg:py-28">
      <div className="container-figma">
        <FadeUp className="mx-auto max-w-[44rem] text-center">
          <Eyebrow className="justify-center">A refined process</Eyebrow>
          <SectionTitle>
            How we take your project from idea to <span className="text-[#2f56d8] dark:text-[#7c9bff]">launch</span>
          </SectionTitle>
          <p className="mt-4 text-[1.02rem] leading-relaxed text-[#5a6180] dark:text-white/70">
            A clear, six-step delivery process with a defined output at every stage, so you always
            know what is happening and what comes next.
          </p>
        </FadeUp>

        <Stagger className="relative mt-16 grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-8 lg:grid-cols-6">
          <LineGrow delay={0.3} className="absolute left-[8%] right-[8%] top-[4.5rem] hidden border-t-2 border-dashed border-[#c9d4f5] lg:block dark:border-white/15" />
          {processSteps.map((step, i) => (
            <StaggerItem key={step.step} className="relative text-center">
              <div className="relative mx-auto size-28 sm:size-36">
                <div className="relative size-full overflow-hidden rounded-full border-[6px] border-white shadow-[0_20px_40px_-20px_rgba(15,19,48,0.55)] ring-2 ring-[#2f56d8]/25 dark:border-surface">
                  <Image src={PROCESS_PHOTOS[i % PROCESS_PHOTOS.length]} alt="" fill sizes="9rem" className="object-cover" />
                </div>
                <PopIn delay={0.4 + i * 0.12} className="absolute -right-1 top-2">
                <span aria-hidden className="inline-flex size-9 items-center sm:size-11 justify-center rounded-full bg-[linear-gradient(135deg,#3b6cf6,#1d4ed8)] text-sm font-bold text-white shadow-[0_10px_20px_-8px_rgba(29,78,216,0.9)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                </PopIn>
              </div>
              <h3 className="mt-6 text-[1.1rem] font-bold text-[#0f1330] dark:text-white"><span className="sr-only">Step {i + 1}: </span>{step.title}</h3>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#2f56d8] dark:text-[#7c9bff]">{step.duration}</p>
              <p className="mx-auto mt-2 max-w-[15rem] text-sm leading-relaxed text-[#5a6180] dark:text-white/65">{step.description}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
