"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { useReducedMotionSafe } from "@/components/motion/primitives";

const SLIDES = [
  {
    eyebrow: "Software development company, Gurugram",
    title: "Websites, apps and software that move your business forward.",
    body: "We design, build and support digital products for growing businesses, with a fixed-price proposal and one accountable team.",
    image: "/images/photos/hero-backdrop.jpg",
    cta: { label: "Start a project", href: "/contact" },
  },
  {
    eyebrow: "Design, engineering and support",
    title: "One team from first brief to launch.",
    body: "Strategy, design, development and post-launch support, managed by a single project lead.",
    image: "/images/team/team-workshop.jpg",
    cta: { label: "Explore services", href: "/services" },
  },
  {
    eyebrow: "Custom software, ERP & CRM",
    title: "Business systems built around how you work.",
    body: "ERP, CRM and automation that connect sales, inventory, finance and reporting in one place.",
    image: "/images/team/team-laptop.jpg",
    cta: { label: "Book a consultation", href: "/book" },
  },
] as const;

const INTERVAL_MS = 6500;

/**
 * Full-width photo slider. The first slide's headline is the page's display
 * heading; the others are decorative paragraphs so the outline stays clean.
 * Every slide is in the HTML for crawlers; only the visible one is shown.
 */
export function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hasRotated, setHasRotated] = useState(false);
  const paused = hovered || focused;
  const reduceMotion = useReducedMotionSafe();

  useEffect(() => {
    if (paused || reduceMotion) return;
    const id = window.setTimeout(() => {
      setHasRotated(true);
      setIndex((i) => (i + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => window.clearTimeout(id);
  }, [index, paused, reduceMotion]);

  const show = (next: number) => {
    setHasRotated(true);
    setIndex(next);
  };
  const go = (step: number) => show((index + step + SLIDES.length) % SLIDES.length);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Highlights"
      className="relative isolate overflow-hidden bg-[#0b0f2a]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      {SLIDES.map((slide, i) => (
        <div
          key={slide.image}
          aria-hidden
          className={cn(
            "absolute inset-0 -z-20 transition-opacity duration-[1200ms]",
            i === index ? "opacity-100" : "opacity-0",
          )}
        >
          <Image
            src={slide.image}
            alt=""
            fill
            preload={i === 0}
            sizes="100vw"
            className={cn(
              "object-cover transition-transform duration-[7000ms] ease-out",
              i === index && !reduceMotion ? "scale-[1.08]" : "scale-100",
            )}
          />
        </div>
      ))}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgba(11,15,42,0.94)_0%,rgba(16,26,78,0.82)_45%,rgba(29,78,216,0.35)_100%)]"
      />
      <svg
        aria-hidden
        viewBox="0 0 400 400"
        className="pointer-events-none absolute -left-24 bottom-0 -z-10 h-[26rem] w-[26rem] text-white/10"
        fill="none"
      >
        {Array.from({ length: 14 }, (_, k) => (
          <path key={k} d={`M0 ${120 + k * 18} C 120 ${40 + k * 22}, 260 ${300 - k * 6}, 400 ${180 + k * 14}`} stroke="currentColor" />
        ))}
      </svg>

      <h1 className="sr-only">
        Setuware Technologies: website, app and custom software development in Gurugram
      </h1>
      <div className="container-figma relative flex min-h-[36rem] flex-col justify-center pb-20 pt-32 lg:min-h-[44rem] lg:pt-36">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={reduceMotion || !hasRotated ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -16 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[46rem] text-white"
            aria-live={paused ? "polite" : "off"}
          >
            <p className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/85 sm:text-sm">
              <span aria-hidden className="relative inline-block h-3.5 w-7 rounded-full bg-white/90">
                <span className="absolute right-0.5 top-0.5 size-2.5 rounded-full bg-[#2f56d8]" />
              </span>
              {SLIDES[index].eyebrow}
            </p>
            {index === 0 ? (
              <h2 className="mt-5 text-[2.5rem] font-extrabold leading-[1.06] tracking-[-0.03em] sm:text-[3.4rem] lg:text-[4.25rem]">
                {SLIDES[index].title}
              </h2>
            ) : (
              <p className="mt-5 font-display text-[2.5rem] font-extrabold leading-[1.06] tracking-[-0.03em] sm:text-[3.4rem] lg:text-[4.25rem]">
                {SLIDES[index].title}
              </p>
            )}
            <p className="mt-6 max-w-[38rem] text-base leading-relaxed text-white/80 sm:text-lg">
              {SLIDES[index].body}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href={SLIDES[index].cta.href}
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-[linear-gradient(110deg,#3b6cf6,#1d4ed8)] px-7 text-[0.95rem] font-semibold text-white shadow-[0_12px_30px_-10px_rgba(59,108,246,0.9)] transition-[filter] hover:brightness-110"
              >
                {SLIDES[index].cta.label}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
              <Link
                href="/work"
                className="inline-flex h-12 items-center rounded-full border border-white/50 px-7 text-[0.95rem] font-semibold text-white transition-colors hover:bg-white hover:text-[#0f1330]"
              >
                View our work
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 flex items-center gap-5">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous slide"
            className="inline-flex size-10 items-center justify-center rounded-full border border-white/40 text-white transition-colors hover:bg-white hover:text-[#0f1330]"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <div className="flex items-center gap-2.5">
            {SLIDES.map((slide, i) => (
              <button
                key={slide.image}
                type="button"
                onClick={() => show(i)}
                aria-label={`Show slide ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  "h-2.5 rounded-full transition-all duration-500",
                  i === index ? "w-8 bg-[#3b6cf6]" : "w-2.5 bg-white/60 hover:bg-white",
                )}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next slide"
            className="inline-flex size-10 items-center justify-center rounded-full border border-white/40 text-white transition-colors hover:bg-white hover:text-[#0f1330]"
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </section>
  );
}
