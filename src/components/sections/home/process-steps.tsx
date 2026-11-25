import Image from "next/image";

import { FadeUp, Stagger, StaggerItem } from "@/components/motion/primitives";
import { processSteps } from "@/lib/content";
import { Eyebrow, SectionTitle } from "./shared";
import { PROCESS_PHOTOS } from "./copy";

/** Six-step delivery process with circular photography, reference-style. */
export function ProcessSteps() {
  return (
    <section id="process" className="relative overflow-hidden bg-white py-20 dark:bg-surface lg:py-28">
      <div className="container-figma">
        <FadeUp className="mx-auto max-w-[44rem] text-center">
          <Eyebrow className="justify-center">How we work</Eyebrow>
          <SectionTitle>
            Six steps, from a 30-minute call to <span className="text-[#2f56d8] dark:text-[#7c9bff]">three months of support</span>
          </SectionTitle>
          <p className="mt-4 text-[1.02rem] leading-relaxed text-[#5a6180] dark:text-white/70">
            Each step ends with something you can see and approve. You know the price and the dates
            before we start, and nothing moves without your sign-off.
          </p>
        </FadeUp>

        <Stagger className="relative mt-16 grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-8 lg:grid-cols-6">
          <div aria-hidden className="absolute left-[8%] right-[8%] top-[4.5rem] hidden border-t-2 border-dashed border-[#c9d4f5] lg:block dark:border-white/15" />
          {processSteps.map((step, i) => (
            <StaggerItem key={step.step} className="relative text-center">
              <div className="relative mx-auto size-28 sm:size-36">
                <div className="relative size-full overflow-hidden rounded-full border-[6px] border-white shadow-[0_20px_40px_-20px_rgba(15,19,48,0.55)] ring-2 ring-[#2f56d8]/25 dark:border-surface">
                  <Image src={PROCESS_PHOTOS[i % PROCESS_PHOTOS.length]} alt="" fill sizes="9rem" className="object-cover" />
                </div>
                <span className="absolute -right-1 top-2 inline-flex size-9 items-center sm:size-11 justify-center rounded-full bg-[linear-gradient(135deg,#3b6cf6,#1d4ed8)] text-sm font-bold text-white shadow-[0_10px_20px_-8px_rgba(29,78,216,0.9)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-6 text-[1.1rem] font-bold text-[#0f1330] dark:text-white">{step.title}</h3>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#2f56d8] dark:text-[#7c9bff]">{step.duration}</p>
              <p className="mx-auto mt-2 max-w-[15rem] text-sm leading-relaxed text-[#5a6180] dark:text-white/65">{step.description}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
