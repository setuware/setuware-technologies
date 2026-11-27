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
import { cn } from "@/lib/utils";
import { CircuitLines, Eyebrow, SectionTitle } from "./shared";
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

/** White service cards with one blue highlighted card, reference-style. */
export function ServicesGrid() {
  return (
    <section id="services" className="relative overflow-hidden bg-[#f4f6fc] py-20 dark:bg-surface-2 lg:py-28">
      <CircuitLines className="absolute -right-10 top-10 hidden w-[26rem] text-[#2f56d8]/10 lg:block" />
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
            className="group inline-flex h-12 shrink-0 items-center gap-2 self-start rounded-full bg-[#2f56d8] px-6 text-sm font-semibold text-white transition-[filter] hover:brightness-110 lg:self-auto"
          >
            View all services
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </FadeUp>

        <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICE_CARDS.map((card, i) => {
            const featured = i === 0;
            const Icon = ICONS[card.icon] ?? Code2;
            return (
              <StaggerItem key={card.slug}>
                <Link
                  href={`/services/${card.slug}`}
                  className={cn(
                    "group relative flex h-full flex-col overflow-hidden rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-1",
                    featured
                      ? "border-transparent bg-[linear-gradient(135deg,#3b6cf6,#1d4ed8_60%,#1e3a8a)] text-white shadow-[0_24px_50px_-24px_rgba(29,78,216,0.8)]"
                      : "border-[#e3e8f5] bg-white text-[#0f1330] shadow-[0_10px_30px_-22px_rgba(15,19,48,0.35)] hover:border-transparent hover:bg-[linear-gradient(135deg,#3b6cf6,#1d4ed8_60%,#1e3a8a)] hover:text-white hover:shadow-[0_24px_50px_-24px_rgba(29,78,216,0.8)] dark:border-white/10 dark:bg-surface dark:text-white",
                  )}
                >
                  <CircuitLines
                    className={cn(
                      "absolute -bottom-4 -right-6 w-48 transition-opacity duration-300",
                      featured ? "text-white/20" : "text-white/20 opacity-0 group-hover:opacity-100",
                    )}
                  />
                  <span
                    className={cn(
                      "inline-flex size-14 items-center justify-center rounded-xl transition-colors duration-300",
                      featured
                        ? "bg-white/15 text-white"
                        : "bg-[#eef2ff] text-[#2f56d8] group-hover:bg-white/15 group-hover:text-white dark:bg-white/10 dark:text-[#7c9bff]",
                    )}
                  >
                    <Icon className="size-7" aria-hidden />
                  </span>
                  <h3 className="mt-6 text-[1.25rem] font-bold tracking-[-0.01em]">{card.title}</h3>
                  <p
                    className={cn(
                      "mt-3 flex-1 text-[0.95rem] leading-relaxed transition-colors duration-300",
                      featured ? "text-white/85" : "text-[#5a6180] group-hover:text-white/85 dark:text-white/65",
                    )}
                  >
                    {card.body}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold">
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
