import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { featuredCaseStudies } from "@/lib/content";
import { images } from "@/lib/images";
import { Reveal } from "@/components/ui/reveal";

/**
 * The cards fanned out behind the lead project (Figma 24:2617, 24:3152–24:3156),
 * back to front. Offsets are distances from the front card's top edge, in
 * Figma pixels; the coloured band stands in for each card's cover image.
 */
const BACK_CARDS = [
  {
    // 24:2617 / 24:3152 — 926 wide, 131 above the front card.
    className:
      "top-0 inset-x-[11%] h-28 bg-[#f1f1f1] lg:inset-x-[calc(var(--s)*137)] lg:h-[calc(var(--s)*437)]",
    cover: "bg-[#c9d3f1]",
    fan: { base: "36px", lg: "calc(var(--s)*131)" },
  },
  {
    // 24:3153 / 24:3154 — 1010 wide, 89 above.
    className:
      "top-3 inset-x-[7.5%] h-28 bg-[#f9f9f9] lg:top-[calc(var(--s)*42)] lg:inset-x-[calc(var(--s)*95)] lg:h-[calc(var(--s)*477)]",
    cover:
      "bg-[linear-gradient(90deg,#ea6f98_0%,#b56ae2_38%,#00b4de_68%,#08131c_100%)]",
    fan: { base: "24px", lg: "calc(var(--s)*89)" },
  },
  {
    // 24:3155 / 24:3156 — 1124 wide, 47 above.
    className:
      "top-6 inset-x-[3%] h-28 bg-[#f9f9f9] lg:top-[calc(var(--s)*84)] lg:inset-x-[calc(var(--s)*38)] lg:h-[calc(var(--s)*531)]",
    cover: "bg-[linear-gradient(90deg,#e6f6f5_0%,#eef2f8_45%,#f6d4ec_100%)]",
    fan: { base: "12px", lg: "calc(var(--s)*47)" },
  },
] as const;

const CARD_SHADOW =
  "shadow-[0_18px_50px_-18px_rgba(10,20,40,0.18)] lg:shadow-[0_calc(var(--s)*20)_calc(var(--s)*60)_calc(var(--s)*-20)_rgba(10,20,40,0.18)]";

/**
 * "Selected Projects" (Figma 24:2681 → 24:3161, button 24:3105).
 *
 * The lead project sits on a stack of offset cards. The cards behind are
 * decorative and `aria-hidden`, so the stack reads as one item; they start
 * tucked behind the front card and fan upwards when the stack scrolls in.
 */
export function SelectedProjects() {
  const lead = featuredCaseStudies[0];

  return (
    <section
      id="work"
      aria-labelledby="projects-heading"
      className="relative overflow-hidden bg-background py-20 md:py-28 lg:pt-[calc(var(--s)*139)] lg:pb-[calc(var(--s)*124)]"
    >
      <div className="container-figma">
        <h2
          id="projects-heading"
          className="text-center text-3xl leading-tight font-bold tracking-[-0.04em] text-foreground sm:text-[2.6rem] lg:text-[calc(var(--s)*58)] lg:leading-[calc(var(--s)*72)]"
        >
          Selected Projects
        </h2>

        <Reveal
          direction="none"
          className="group relative mx-auto mt-12 max-w-[75rem] lg:mt-[calc(var(--s)*41)] lg:w-[calc(var(--s)*1200)] lg:max-w-none"
        >
          {/* Soft cyan glow behind the stack (24:2609). */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-[calc(var(--s)*362)] left-[calc(var(--s)*252)] hidden h-[calc(var(--s)*715)] w-[calc(var(--s)*1151)] rounded-full bg-[radial-gradient(closest-side,rgba(0,161,198,0.09),transparent)] lg:block"
          />

          {BACK_CARDS.map((card, index) => (
            <div
              key={card.cover}
              aria-hidden
              className={`absolute overflow-hidden rounded-[1.25rem] transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-data-[in-view=false]:translate-y-[var(--fan)] lg:rounded-[calc(var(--s)*20)] lg:group-data-[in-view=false]:translate-y-[var(--fan-lg)] ${CARD_SHADOW} ${card.className}`}
              style={
                {
                  "--fan": card.fan.base,
                  "--fan-lg": card.fan.lg,
                  transitionDelay: `${(BACK_CARDS.length - index) * 90}ms`,
                } as CSSProperties
              }
            >
              <div
                className={`h-full w-[49%] lg:h-[calc(var(--s)*442)] lg:w-[calc(var(--s)*589)] ${card.cover}`}
              />
            </div>
          ))}

          {/* Front card (24:3157 / 24:3158). */}
          <article
            className={`relative mt-9 grid overflow-hidden rounded-[1.25rem] bg-surface md:grid-cols-[49%_1fr] lg:mt-[calc(var(--s)*131)] lg:h-[calc(var(--s)*560)] lg:grid-cols-[calc(var(--s)*589)_1fr] lg:rounded-[calc(var(--s)*20)] ${CARD_SHADOW}`}
          >
            <div className="relative min-h-[18rem] bg-[linear-gradient(150deg,#9fb3b8,#d7dfe0)]">
              <Image
                src={images.projectMedicare.src}
                alt={images.projectMedicare.alt}
                fill
                sizes="(min-width: 1024px) 589px, (min-width: 768px) 50vw, 90vw"
                className="object-cover"
              />
            </div>

            <div className="flex flex-col p-7 md:p-9 lg:pt-[calc(var(--s)*57)] lg:pr-[calc(var(--s)*46)] lg:pb-[calc(var(--s)*73)] lg:pl-[calc(var(--s)*79)]">
              <h3 className="max-w-[24rem] text-[1.6rem] leading-[1.36] font-semibold tracking-normal text-foreground lg:max-w-[calc(var(--s)*426)] lg:text-[calc(var(--s)*33)] lg:leading-[calc(var(--s)*45)]">
                MediCare — Healthcare management app
              </h3>
              <p className="mt-4 max-w-[30rem] text-[0.95rem] leading-[1.9] tracking-[0.02em] text-foreground/70 lg:mt-[calc(var(--s)*17)] lg:max-w-[calc(var(--s)*485)] lg:text-[calc(var(--s)*15)] lg:leading-[calc(var(--s)*29)]">
                A user-friendly mobile app that helps patients manage
                appointments, access medical records, connect with healthcare
                providers, and stay on top of their health—all in one place.
              </p>

              <Link
                href={`/work/${lead.slug}`}
                className="group/btn mt-8 inline-flex h-10 w-fit items-center gap-2.5 rounded-full border-[1.5px] border-foreground px-6 text-[15px] font-semibold text-foreground transition-colors hover:bg-foreground hover:text-background lg:mt-auto lg:h-[calc(var(--s)*40)] lg:gap-[calc(var(--s)*10)] lg:px-[calc(var(--s)*26)] lg:text-[calc(var(--s)*15)]"
              >
                View Project
                <ArrowUpRight
                  className="size-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 lg:size-[calc(var(--s)*18)]"
                  aria-hidden
                />
              </Link>
            </div>
          </article>
        </Reveal>

        {/* "Explore More Projects" pill (24:3105). */}
        <div className="mt-10 flex justify-center lg:mt-[calc(var(--s)*70)]">
          <Link
            href="/work"
            className="inline-flex h-10 min-w-[14.4rem] items-center justify-center rounded-full bg-black px-8 text-[15px] font-semibold text-white transition-colors hover:bg-setu dark:bg-foreground dark:text-background lg:h-[calc(var(--s)*40)] lg:w-[calc(var(--s)*230)] lg:min-w-0 lg:px-0 lg:text-[calc(var(--s)*15)]"
          >
            Explore More Projects
          </Link>
        </div>
      </div>
    </section>
  );
}
