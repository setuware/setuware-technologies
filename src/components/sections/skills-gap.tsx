"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Pause, Play } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

import { images } from "@/lib/images";
import { committedVideo, heroVideoPoster, heroVideoSources } from "@/lib/media";
import { TextReveal } from "@/components/motion/text-reveal";
import {
  FadeUp,
  Magnetic,
  ScrollScale,
  useReducedMotionSafe,
} from "@/components/motion/primitives";

const HEADING = "One office in Gurugram. Every skill your project needs.";

/**
 * Skills-gap band: a full-bleed, muted background video of a team working
 * around a laptop, under a dark brand-tinted scrim, with the headline and a
 * call to action on top.
 *
 * Motion: the band grows from an inset rounded card to full-bleed as it
 * scrolls in (`ScrollScale`) and the footage drifts slightly against the
 * scroll. The video autoplays muted and loops; a pause/play control is always
 * available (WCAG 2.2.2), and visitors who prefer reduced motion get the
 * poster frame instead of playback.
 *
 * Sources: `NEXT_PUBLIC_HERO_VIDEO_*` env vars if set, otherwise the clip
 * committed by `npm run media:fetch` (Pexels, free licence).
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
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(false);
  // The clip is requested only once the band is close to the viewport, and
  // plays only while it is on screen.
  const [near, setNear] = useState(false);
  const [onScreen, setOnScreen] = useState(false);

  useEffect(() => {
    const band = bandRef.current;
    if (!band) return;
    if (typeof IntersectionObserver !== "function") {
      setNear(true);
      setOnScreen(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setOnScreen(entry.isIntersecting);
          if (entry.isIntersecting) setNear(true);
        }
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(band);
    return () => observer.disconnect();
  }, []);
  const hasVideo = videoSources.length > 0 && !failed;

  const { scrollYProgress } = useScroll({ target: bandRef, offset: ["start end", "end start"] });
  const mediaY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1.12, 1.04]);

  // Respect reduced motion: hold the poster frame.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // iOS: muted must be set as a property before play() (see hero backdrop).
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("muted", "");
    if (reduce || paused || !onScreen) {
      video.pause();
    } else {
      video.play().catch(() => setPaused(true));
    }
  }, [reduce, paused, onScreen]);

  return (
    <section aria-labelledby="skills-gap-title" className="bg-background py-16 lg:py-[calc(var(--s)*96)]">
      <ScrollScale from={0.9} radius={32} className="relative isolate overflow-hidden bg-[#05070d]">
        <div ref={bandRef} className="relative min-h-[560px] lg:min-h-[calc(var(--s)*760)]">
          {/* Media layer */}
          <motion.div
            aria-hidden
            className="absolute inset-0 -z-20"
            style={reduce ? undefined : { y: mediaY, scale: mediaScale }}
          >
            {hasVideo ? (
              <video
                ref={videoRef}
                className="size-full object-cover"
                poster={near ? videoPoster : undefined}
                muted
                loop
                playsInline
                preload="none"
                disablePictureInPicture
                tabIndex={-1}
                onError={() => setFailed(true)}
              >
                {near ? videoSources.map((source) => <source key={source.src} src={source.src} type={source.type} />) : null}
              </video>
            ) : (
              <Image
                src={images.skillsGap.src}
                alt=""
                fill
                sizes="100vw"
                className="object-cover"
              />
            )}
          </motion.div>

          {/* Scrim: dark on the copy side, brand tint across, fade at the base. */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(5,7,13,0.92)_0%,rgba(5,7,13,0.72)_45%,rgba(5,7,13,0.25)_100%)]"
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[radial-gradient(80%_70%_at_85%_30%,rgba(47,86,216,0.22),transparent_70%)] mix-blend-screen"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-[linear-gradient(to_top,rgba(5,7,13,0.85),transparent)]"
          />

          {/* Copy */}
          <div className="container-figma relative flex min-h-[560px] flex-col justify-center py-16 lg:min-h-[calc(var(--s)*760)] lg:py-[calc(var(--s)*96)]">
            <div className="max-w-[640px] lg:max-w-[calc(var(--s)*760)]">
              <FadeUp y={16}>
                <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[13px] font-semibold tracking-[0.06em] text-white/80 backdrop-blur-sm lg:text-[calc(var(--s)*13)]">
                  <span className="size-1.5 rounded-full bg-setu" aria-hidden />
                  Our team
                </p>
              </FadeUp>

              {/* Two colours in one heading; the h2 carries the sentence for
                  assistive tech and the animated spans are hidden from it. */}
              <h2
                id="skills-gap-title"
                aria-label={HEADING}
                className="mt-6 text-[36px] font-bold leading-[1.1] tracking-[-0.03em] text-white sm:text-[52px] lg:mt-[calc(var(--s)*24)] lg:text-[calc(var(--s)*72)] lg:leading-[calc(var(--s)*80)]"
              >
                <TextReveal as="span" delay={0.1}>
                  One office in Gurugram.
                </TextReveal>
                <br />
                <span className="text-[#3fd0ee]">
                  <TextReveal as="span" delay={0.32}>
                    Every skill your project needs.
                  </TextReveal>
                </span>
              </h2>

              <FadeUp delay={0.45} y={24}>
                <p className="mt-6 max-w-[620px] text-[16px] font-medium leading-[27px] text-white/80 lg:mt-[calc(var(--s)*32)] lg:max-w-[calc(var(--s)*680)] lg:text-[calc(var(--s)*19)] lg:leading-[calc(var(--s)*31)]">
                  Designers, developers and marketers in one office on MG Road,
                  Gurugram, with one project manager per job — call +91 70912
                  98828 and a person answers.
                </p>
              </FadeUp>

              <FadeUp delay={0.6} y={20} blur={false}>
                <div className="mt-8 flex flex-wrap items-center gap-4 lg:mt-[calc(var(--s)*44)]">
                  <Magnetic strength={0.3}>
                    <Link
                      href="/contact"
                      className="group inline-flex h-12 items-center gap-2 rounded-full bg-setu px-7 text-[15px] font-semibold text-white shadow-[0_12px_40px_-12px_rgba(47,86,216,0.8)] transition-colors hover:bg-[#2448c0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:h-[calc(var(--s)*56)] lg:px-[calc(var(--s)*32)] lg:text-[calc(var(--s)*16)]"
                    >
                      Work with us
                      <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </Magnetic>
                  <Link
                    href="/services"
                    className="inline-flex h-12 items-center rounded-full border border-white/30 px-7 text-[15px] font-semibold text-white transition-colors hover:border-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:h-[calc(var(--s)*56)] lg:px-[calc(var(--s)*32)] lg:text-[calc(var(--s)*16)]"
                  >
                    Explore services
                  </Link>
                </div>
              </FadeUp>
            </div>
          </div>

          {hasVideo ? (
            <button
              type="button"
              onClick={() => setPaused((value) => !value)}
              aria-label={paused ? "Play background video" : "Pause background video"}
              aria-pressed={paused}
              className="absolute bottom-5 right-5 z-10 inline-flex size-11 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white backdrop-blur-md transition-colors hover:bg-black/55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:bottom-[calc(var(--s)*32)] lg:right-[calc(var(--s)*32)]"
            >
              {paused ? <Play className="size-4 translate-x-px" /> : <Pause className="size-4" />}
            </button>
          ) : null}
        </div>
      </ScrollScale>
    </section>
  );
}
