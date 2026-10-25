"use client";

import { useEffect, useRef, useState } from "react";

import { usePrefersReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import type { VideoSource } from "@/lib/media";
import { TechBackdrop } from "./tech-backdrop";

export interface HeroBackdropProps {
  sources: readonly VideoSource[];
  poster?: string;
  /**
   * `page` fades the backdrop into the page background behind the copy.
   * `dark` is for the full-bleed hero, where the media carries the section and
   * the scrim only needs to guarantee text contrast over it.
   */
  tone?: "page" | "dark";
}

/**
 * Full-bleed moving backdrop behind the hero headline.
 *
 * Plays a real video when one is configured, and otherwise renders the
 * generated `TechBackdrop`. Both sit under a scrim so the headline keeps its
 * contrast ratio either way — a background that makes text harder to read is a
 * net loss however good it looks.
 *
 * The video follows the same discipline as every other media element here:
 * nothing is fetched until it is in view, playback stops when the tab is
 * hidden, a failure falls back to the generated animation, and a visitor who
 * prefers reduced motion gets the poster frame instead of movement.
 */
export function HeroBackdrop({ sources, poster, tone = "page" }: HeroBackdropProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = usePrefersReducedMotion();
  const [failed, setFailed] = useState(false);

  const hasVideo = sources.length > 0 && !failed;

  useEffect(() => {
    if (!hasVideo || reduceMotion) return;
    const video = videoRef.current;
    const wrapper = wrapperRef.current;
    if (!video || !wrapper) return;

    const play = () => {
      void video.play().catch(() => {
        // Autoplay refused (battery saver, browser policy). The poster frame
        // stays, which is a perfectly good background.
      });
    };

    const observer =
      typeof IntersectionObserver === "function"
        ? new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                if (entry.isIntersecting && !document.hidden) play();
                else video.pause();
              }
            },
            { threshold: 0.05 },
          )
        : null;

    observer?.observe(wrapper);
    if (!observer) play();

    const onVisibilityChange = () => {
      if (document.hidden) video.pause();
      else play();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      video.pause();
    };
  }, [hasVideo, reduceMotion]);

  return (
    <div
      ref={wrapperRef}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {hasVideo ? (
        <video
          ref={videoRef}
          className={cn(
            "size-full object-cover",
            tone === "dark" ? "opacity-60" : "opacity-[0.28] dark:opacity-40",
          )}
          poster={poster}
          preload="none"
          muted
          loop
          playsInline
          disablePictureInPicture
          tabIndex={-1}
          onError={() => setFailed(true)}
        >
          {sources.map((source) => (
            <source key={source.src} src={source.src} type={source.type} />
          ))}
        </video>
      ) : (
        <TechBackdrop
          className={cn(
            "size-full",
            tone === "dark" ? "opacity-100" : "opacity-80 dark:opacity-90",
          )}
          forceTone={tone === "dark" ? "dark" : undefined}
        />
      )}

      {/*
        Scrim. Both variants exist for the same reason: a backdrop that makes
        the headline harder to read is a net loss however good it looks.
      */}
      {tone === "dark" ? (
        <>
          <div className="absolute inset-0 bg-[linear-gradient(95deg,rgba(6,9,18,0.94)_0%,rgba(6,9,18,0.78)_45%,rgba(6,9,18,0.5)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(to_top,rgba(6,9,18,0.92),transparent)]" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-[linear-gradient(100deg,var(--background)_8%,color-mix(in_oklab,var(--background)_72%,transparent)_42%,transparent_72%)]" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(to_top,var(--background),transparent)]" />
        </>
      )}
    </div>
  );
}
