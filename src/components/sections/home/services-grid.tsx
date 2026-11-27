import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Code2,
  Globe,
  Megaphone,
  Palette,
  Server,
  ShoppingCart,
  Smartphone,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import type { IconName } from "@/lib/content";
import { FadeUp, Stagger, StaggerItem } from "@/components/motion/primitives";
import { Eyebrow, SectionTitle } from "./shared";
import { SERVICE_CARDS } from "./copy";

const ICONS: Partial<Record<IconName, LucideIcon>> = {
  globe: Globe,
  cart: ShoppingCart,
  code: Code2,
  smartphone: Smartphone,
  boxes: Boxes,
  sparkles: Sparkles,
  palette: Palette,
  megaphone: Megaphone,
  server: Server,
};

/**
 * Services as one numbered index: a single ruled panel rather than separate
 * cards, with the row marker and arrow lighting up on hover.
 */
export function ServicesGrid() {
  return (
    <section id="services" className="relative overflow-hidden bg-[#f4f6fc] py-20 dark:bg-surface-2 lg:py-28">
      <div className="container-figma relative">
        <FadeUp className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[44rem]">
            <Eyebrow>All services</Eyebrow>
            <SectionTitle>
              Digital services for <span className="text-[#2f56d8] dark:text-[#7c9bff]">every stage of growth</span>
            </SectionTitle>
          </div>
          <Link
            href="/services"
            className="group inline-flex h-12 shrink-0 items-center gap-2 self-start rounded-full border border-[#0f1330] px-6 text-sm font-semibold text-[#0f1330] transition-colors hover:bg-[#0f1330] hover:text-white lg:self-auto dark:border-white/40 dark:text-white dark:hover:bg-white dark:hover:text-[#0f1330]"
          >
            View all services
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </FadeUp>

        <Stagger className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-[#dfe5f4] bg-[#dfe5f4] sm:grid-cols-2 lg:grid-cols-3 dark:border-white/10 dark:bg-white/10">
          {SERVICE_CARDS.map((card, i) => {
            const Icon = ICONS[card.icon] ?? Code2;
            return (
              <StaggerItem key={card.slug} className="flex">
                <Link
                  href={`/services/${card.slug}`}
                  className="group relative flex w-full flex-col bg-white p-7 transition-colors duration-300 hover:bg-[#0b1638] focus-visible:bg-[#0b1638] lg:p-8 dark:bg-surface dark:hover:bg-[#0b1638]"
                >
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-[linear-gradient(90deg,#22d3ee,#2f56d8)] transition-transform duration-500 group-hover:scale-x-100 group-focus-visible:scale-x-100"
                  />
                  <span className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold tracking-[0.14em] text-[#8a92b2] transition-colors group-hover:text-[#67e8f9] group-focus-visible:text-[#67e8f9]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <Icon
                      className="size-6 text-[#2f56d8] transition-colors group-hover:text-[#67e8f9] group-focus-visible:text-[#67e8f9] dark:text-[#7c9bff]"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                  </span>
                  <h3 className="mt-8 text-[1.3rem] font-bold tracking-[-0.015em] text-[#0f1330] transition-colors group-hover:text-white group-focus-visible:text-white dark:text-white">
                    {card.title}
                  </h3>
                  <p className="mt-2.5 flex-1 text-[0.95rem] leading-relaxed text-[#5a6180] transition-colors group-hover:text-white/75 group-focus-visible:text-white/75 dark:text-white/65">
                    {card.body}
                  </p>
                  <span className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0f1330] transition-colors group-hover:text-white group-focus-visible:text-white dark:text-white">
                    Learn more
                    <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
