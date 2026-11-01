"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
} from "framer-motion";

import { images } from "@/lib/images";
import { committedVideo, heroVideoPoster, heroVideoSources } from "@/lib/media";
import { cn } from "@/lib/utils";
import { EASE_OUT } from "@/components/motion/ease";
import { TextReveal } from "@/components/motion/text-reveal";
import {
  FadeUp,
  Magnetic,
  Parallax,
  ScrollScale, useReducedMotionSafe } from "@/components/motion/primitives";

const HEADING = "This is how we jetpack over the skills gap.";

/**
 * Skills-gap band (Figma 24:2645 still, 24:2646 veil, 24:2819 play button).
 *
 * In the design this is a full-bleed video still under a dimming veil with a
 * play button in the middle. The still is rebuilt in markup so its copy stays
 * readable to assistive tech and search engines.
 *
 * Motion: the band grows from an inset rounded card to full-bleed as it
 * scrolls in, the still drifts and settles behind it, the portrait parallaxes
 * on its own layer, and the play button leans toward the cursor while two
 * rings ripple out of it.
 *
 * The play button plays the inset video configured through
 * `NEXT_PUBLIC_HERO_VIDEO_*` (see `src/lib/media.ts`). With no video
 * configured it lifts the veil instead, so the button never promises
 * something that does not happen.
 *
 * The env vars are read as literal `process.env.NEXT_PUBLIC_*` members because
 * that is the only form Next inlines into a client bundle.
 */
const committed = committedVideo("skills-gap");
const envSources = heroVideoSources({
  NEXT_PUBLIC_HERO_VIDEO_WEBM: process.env.NEXT_PUBLIC_HERO_VIDEO_WEBM,
  NEXT_PUBLIC_HERO_VIDEO_MP4: process.env.NEXT_PUBLIC_HERO_VIDEO_MP4,
});
const videoSources = envSources.length > 0 ? envSources : committed.sources;
const videoPoster =
  heroVideoPoster({
    NEXT_PUBLIC_HERO_VIDEO_POSTER: process.env.NEXT_PUBLIC_HERO_VIDEO_POSTER,
  }) ?? committed.poster;

export function SkillsGap() {
  const reduce = useReducedMotionSafe();
  const bandRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Scroll-linked drift on the still: 1.08 entering the viewport, 1 leaving it.
  const { scrollYProgress } = useScroll({
    target: bandRef,
    offset: ["start end", "end start"],
  });
  const layerScale = useTransform(scrollYProgress, [0, 1], [1.08, 1]);
  const layerY = useTransform(scrollYProgress, [0, 1], [12, -12]);

  const [videoFailed, setVideoFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const hasVideo = videoSources.length > 0 && !videoFailed;
  const playing = open && hasVideo;

  const close = useCallback(() => {
    videoRef.current?.pause();
    setOpen(false);
  }, []);

  // A user gesture opened the player, so playback with sound is allowed.
  useEffect(() => {
    if (!playing) return;
    const video = videoRef.current;
    if (!video) return;
    video.focus();
    video.play().catch(() => {
      // Refused or unplayable: the native controls stay available.
    });
  }, [playing]);

  useEffect(() => {
    if (!playing) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close, playing]);

  return (
    <section
      aria-labelledby="skills-gap-title"
      className="bg-background pt-20 md:pt-28 lg:pt-[calc(var(--s)*177)]"
    >
      <div ref={bandRef}>
        <ScrollScale
          from={0.9}
          radius={28}
          className="relative isolate bg-[#75a4b1] lg:h-[calc(var(--s)*805)]"
        >
          {/* The still (Figma 24:2645), rebuilt: tinted margin, blue panel, portrait. */}
          <motion.div
            className="relative origin-center will-change-transform lg:absolute lg:inset-0"
            style={reduce ? undefined : { scale: layerScale, y: layerY }}
          >
            <div
              className="absolute inset-y-0 right-0 hidden w-[31.4%] overflow-hidden md:block lg:bottom-[calc(var(--s)*24)]"
              aria-hidden
            >
              <Parallax
                speed={36}
                scale
                className="absolute -inset-y-[6%] inset-x-0"
              >
                <Image
                  src={images.skillsGap.src}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 32vw, 1px"
                  className="object-cover object-right"
                />
              </Parallax>
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(76,52,140,0.55)_0%,rgba(24,22,60,0.35)_45%,rgba(10,90,80,0.55)_100%)] mix-blend-multiply" />
            </div>

            <div className="relative bg-[linear-gradient(200deg,#253c97_0%,#114d93_35%,#0e5895_100%)] px-6 pb-20 pt-14 sm:px-10 md:mr-[31.4%] lg:absolute lg:top-0 lg:left-[20.36%] lg:right-[31.4%] lg:mr-0 lg:bottom-[calc(var(--s)*24)] lg:rounded-bl-[calc(var(--s)*16)] lg:px-[calc(var(--s)*47)] lg:pb-0 lg:pt-[calc(var(--s)*40)]">
              <FadeUp y={16} blur={false}>
                <p className="text-[16px] font-medium leading-[24px] text-white/70 lg:text-[calc(var(--s)*20)] lg:leading-[calc(var(--s)*30)]">
                  No in-house tech team needed
                </p>
              </FadeUp>
              {/* Two colours in one heading, so the reveal is split into spans;
                  the heading itself carries the sentence for assistive tech. */}
              <h2
                id="skills-gap-title"
                aria-label={HEADING}
                className="mt-3 text-[32px] font-bold leading-[1.15] tracking-[-0.02em] text-[#e0e8ef] sm:text-[52px] lg:mt-[calc(var(--s)*12)] lg:text-[calc(var(--s)*72)] lg:leading-[calc(var(--s)*80)]"
              >
                <TextReveal as="span" delay={0.1}>
                  This is how
                </TextReveal>
                <br />
                <span className="text-[#12a493]">
                  <TextReveal as="span" delay={0.28}>
                    we jetpack over the
                  </TextReveal>
                  <br className="hidden sm:block" />{" "}
                  <TextReveal as="span" delay={0.52}>
                    skills gap.
                  </TextReveal>
                </span>
              </h2>
              <FadeUp delay={0.45} y={24}>
                <p className="mt-6 max-w-[760px] text-[16px] font-medium leading-[26px] text-white/80 lg:mt-[calc(var(--s)*40)] lg:max-w-[calc(var(--s)*760)] lg:text-[calc(var(--s)*18)] lg:leading-[calc(var(--s)*30)]">
                  Designers, developers, SEO and marketing people on one team,
                  so you never hire for a skill you need once.{" "}
                  <br className="hidden lg:block" />
                  Your website, store, app and ads are handled by people who
                  already know your business.
                </p>
              </FadeUp>
              <FadeUp delay={0.6} y={20} blur={false}>
                <Magnetic
                  strength={0.3}
                  className="mt-8 lg:mt-[calc(var(--s)*52)]"
                >
                  <Link
                    href="/contact"
                    className="inline-flex h-12 items-center justify-center rounded-full bg-[#dfe7ea] px-8 text-[15px] font-semibold text-black transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:h-[calc(var(--s)*62)] lg:w-[calc(var(--s)*164)] lg:px-0 lg:text-[calc(var(--s)*18)]"
                  >
                    Let&apos;s talk
                  </Link>
                </Magnetic>
              </FadeUp>
            </div>
          </motion.div>

          {/* The veil (Figma 24:2646): dims the still until the visitor presses play. */}
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 bg-black/30 transition-opacity duration-500",
              open && "opacity-0",
            )}
          />

          {/* Play button (Figma 24:2819), 41 × 41 at the band's centre. The
              Magnetic wrapper is padded so the pull starts before the cursor
              reaches the button itself. */}
          <div
            className={cn(
              "absolute bottom-8 right-8 z-10 transition-[opacity,scale] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:bottom-auto md:right-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2",
              open && "pointer-events-none scale-75 opacity-0",
            )}
          >
            <Magnetic strength={0.4} className="-m-8 p-8">
              <span className="relative block">
                {/* Always rendered (so server and client markup agree) and
                    hidden by CSS when the visitor prefers reduced motion. */}
                {[0, 1].map((ring) => (
                  <motion.span
                    key={ring}
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-white/60 motion-reduce:hidden"
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: 2.1, opacity: 0 }}
                    transition={{
                      duration: 2.4,
                      ease: EASE_OUT,
                      repeat: Infinity,
                      delay: ring * 1.2,
                    }}
                  />
                ))}
                <motion.button
                  type="button"
                  onClick={() => setOpen(true)}
                  tabIndex={open ? -1 : 0}
                  aria-hidden={open || undefined}
                  aria-label={
                    hasVideo
                      ? "Play video: this is how we jetpack over the skills gap"
                      : "Lift the overlay on this is how we jetpack over the skills gap"
                  }
                  whileHover={reduce ? undefined : { scale: 1.12 }}
                  whileTap={reduce ? undefined : { scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 380, damping: 20 }}
                  className="relative flex size-[52px] items-center justify-center rounded-full bg-white text-[#0b2a3a] shadow-[0_8px_24px_rgba(0,0,0,0.25)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white lg:size-[calc(var(--s)*41)]"
                >
                  <svg
                    viewBox="0 0 12 14"
                    aria-hidden
                    className="ml-[2px] h-[16px] w-[14px] lg:h-[calc(var(--s)*13)] lg:w-[calc(var(--s)*11)]"
                  >
                    <path
                      d="M1 1.4v11.2a.6.6 0 0 0 .9.5l9.4-5.6a.6.6 0 0 0 0-1L1.9.9A.6.6 0 0 0 1 1.4Z"
                      fill="currentColor"
                    />
                  </svg>
                </motion.button>
              </span>
            </Magnetic>
          </div>

          {hasVideo ? (
            <div
              className={cn(
                "absolute inset-0 z-20 bg-black transition-opacity duration-500",
                playing ? "opacity-100" : "pointer-events-none opacity-0",
              )}
              aria-hidden={!playing}
            >
              {open ? (
                <video
                  ref={videoRef}
                  className="size-full object-contain"
                  poster={videoPoster}
                  controls
                  playsInline
                  preload="metadata"
                  aria-label="This is how we jetpack over the skills gap"
                  onError={() => setVideoFailed(true)}
                  onEnded={close}
                >
                  {videoSources.map((source) => (
                    <source
                      key={source.src}
                      src={source.src}
                      type={source.type}
                    />
                  ))}
                </video>
              ) : null}
              <button
                type="button"
                onClick={close}
                tabIndex={playing ? 0 : -1}
                aria-label="Close video"
                className="absolute right-4 top-4 inline-flex size-10 items-center justify-center rounded-full bg-white/90 text-black transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
          ) : null}
        </ScrollScale>
      </div>
    </section>
  );
}
