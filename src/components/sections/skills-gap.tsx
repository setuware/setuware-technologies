"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";

import { images } from "@/lib/images";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { heroVideoPoster, heroVideoSources } from "@/lib/media";
import { cn } from "@/lib/utils";

/**
 * Skills-gap band (Figma 24:2645 still, 24:2646 veil, 24:2819 play button).
 *
 * In the design this is a full-bleed video still under a dimming veil with a
 * play button in the middle. The still is rebuilt in markup so its copy stays
 * readable to assistive tech and search engines.
 *
 * The play button plays the inset video configured through
 * `NEXT_PUBLIC_HERO_VIDEO_*` (see `src/lib/media.ts`). With no video
 * configured it lifts the veil instead, so the button never promises
 * something that does not happen.
 *
 * The env vars are read as literal `process.env.NEXT_PUBLIC_*` members because
 * that is the only form Next inlines into a client bundle.
 */
const videoSources = heroVideoSources({
  NEXT_PUBLIC_HERO_VIDEO_WEBM: process.env.NEXT_PUBLIC_HERO_VIDEO_WEBM,
  NEXT_PUBLIC_HERO_VIDEO_MP4: process.env.NEXT_PUBLIC_HERO_VIDEO_MP4,
});
const videoPoster = heroVideoPoster({
  NEXT_PUBLIC_HERO_VIDEO_POSTER: process.env.NEXT_PUBLIC_HERO_VIDEO_POSTER,
});

/** Scroll-linked zoom on the still: 1.08 entering the viewport, 1 leaving it. */
function useScrollZoom(enabled: boolean) {
  const bandRef = useRef<HTMLDivElement | null>(null);
  const layerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const band = bandRef.current;
    const layer = layerRef.current;
    if (!enabled || !band || !layer) return;

    let frame = 0;
    let active = false;

    const update = () => {
      frame = 0;
      const rect = band.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      // 0 when the band's top meets the viewport bottom, 1 when its bottom
      // leaves the viewport top.
      const progress = Math.min(
        1,
        Math.max(0, (viewport - rect.top) / (viewport + rect.height)),
      );
      const scale = 1.08 - 0.08 * progress;
      const shift = (progress - 0.5) * -24;
      layer.style.transform = `translate3d(0, ${shift.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
    };

    const onScroll = () => {
      if (active && !frame) frame = requestAnimationFrame(update);
    };

    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver((entries) => {
            for (const entry of entries) active = entry.isIntersecting;
            if (active) onScroll();
          });

    if (observer) observer.observe(band);
    else active = true;

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
      layer.style.transform = "";
    };
  }, [enabled]);

  return { bandRef, layerRef };
}

export function SkillsGap() {
  const reduceMotion = usePrefersReducedMotion();
  const { bandRef, layerRef } = useScrollZoom(!reduceMotion);
  const videoRef = useRef<HTMLVideoElement | null>(null);

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
      <div
        ref={bandRef}
        className="relative isolate overflow-hidden bg-[#75a4b1] lg:h-[calc(var(--s)*805)]"
      >
        {/* The still (Figma 24:2645), rebuilt: tinted margin, blue panel, portrait. */}
        <div
          ref={layerRef}
          className="relative origin-center will-change-transform lg:absolute lg:inset-0"
        >
          <div
            className="absolute inset-y-0 right-0 hidden w-[31.4%] md:block lg:bottom-[calc(var(--s)*24)]"
            aria-hidden
          >
            <Image
              src={images.skillsGap.src}
              alt=""
              fill
              sizes="(min-width: 768px) 32vw, 1px"
              className="object-cover object-right"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(76,52,140,0.55)_0%,rgba(24,22,60,0.35)_45%,rgba(10,90,80,0.55)_100%)] mix-blend-multiply" />
          </div>

          <div className="relative bg-[linear-gradient(200deg,#253c97_0%,#114d93_35%,#0e5895_100%)] px-6 pb-20 pt-14 sm:px-10 md:mr-[31.4%] lg:absolute lg:top-0 lg:left-[20.36%] lg:right-[31.4%] lg:mr-0 lg:bottom-[calc(var(--s)*24)] lg:rounded-bl-[calc(var(--s)*16)] lg:px-[calc(var(--s)*47)] lg:pb-0 lg:pt-[calc(var(--s)*40)]">
            <p className="text-[16px] font-medium leading-[24px] text-white/70 lg:text-[calc(var(--s)*20)] lg:leading-[calc(var(--s)*30)]">
              Enterprise Suite
            </p>
            <h2
              id="skills-gap-title"
              className="mt-3 text-[32px] font-bold leading-[1.15] tracking-[-0.02em] text-[#e0e8ef] sm:text-[52px] lg:mt-[calc(var(--s)*12)] lg:text-[calc(var(--s)*72)] lg:leading-[calc(var(--s)*80)]"
            >
              This is how
              <br />
              <span className="text-[#12a493]">
                we jetpack over the
                <br className="hidden sm:block" />{" "}
                skills gap.
              </span>
            </h2>
            <p className="mt-6 max-w-[760px] text-[16px] font-medium leading-[26px] text-white/80 lg:mt-[calc(var(--s)*40)] lg:max-w-[calc(var(--s)*760)] lg:text-[calc(var(--s)*18)] lg:leading-[calc(var(--s)*30)]">
              Access the top 1% of talent on a full-service enterprise platform,{" "}
              <br className="hidden lg:block" />
              customised to meet your needs. This is how flexibility works now.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-[#dfe7ea] px-8 text-[15px] font-semibold text-black transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:mt-[calc(var(--s)*52)] lg:h-[calc(var(--s)*62)] lg:w-[calc(var(--s)*164)] lg:px-0 lg:text-[calc(var(--s)*18)]"
            >
              Let&apos;s talk
            </Link>
          </div>
        </div>

        {/* The veil (Figma 24:2646): dims the still until the visitor presses play. */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 bg-black/30 transition-opacity duration-500",
            open && "opacity-0",
          )}
        />

        {/* Play button (Figma 24:2819), 41 × 41 at the band's centre. */}
        <div
          className={cn(
            "absolute bottom-8 right-8 z-10 transition-[opacity,scale] md:bottom-auto md:right-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 duration-300",
            open && "pointer-events-none scale-75 opacity-0",
          )}
        >
          <span
            aria-hidden
            className="absolute inset-0 rounded-full bg-white/70 motion-safe:animate-pulse-ring"
          />
          <button
            type="button"
            onClick={() => setOpen(true)}
            tabIndex={open ? -1 : 0}
            aria-hidden={open || undefined}
            aria-label={
              hasVideo
                ? "Play video: this is how we jetpack over the skills gap"
                : "Lift the overlay on this is how we jetpack over the skills gap"
            }
            className="relative flex size-[52px] items-center justify-center rounded-full bg-white text-[#0b2a3a] shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition-transform duration-200 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white lg:size-[calc(var(--s)*41)]"
          >
            <svg
              viewBox="0 0 12 14"
              aria-hidden
              className="ml-[2px] h-[16px] w-[14px] lg:h-[calc(var(--s)*13)] lg:w-[calc(var(--s)*11)]"
            >
              <path d="M1 1.4v11.2a.6.6 0 0 0 .9.5l9.4-5.6a.6.6 0 0 0 0-1L1.9.9A.6.6 0 0 0 1 1.4Z" fill="currentColor" />
            </svg>
          </button>
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
                  <source key={source.src} src={source.src} type={source.type} />
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
      </div>
    </section>
  );
}
