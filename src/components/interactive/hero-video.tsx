"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

import { usePrefersReducedMotion } from "@/lib/hooks";
import type { VideoSource } from "@/lib/media";
import { cn } from "@/lib/utils";

export interface HeroVideoProps {
  sources: readonly VideoSource[];
  poster?: string;
  /** Shown when there is no video configured, or the video cannot play. */
  fallback: React.ReactNode;
  className?: string;
  label?: string;
}

/**
 * Lazily loaded, self-pausing hero video.
 *
 * Performance rules enforced here:
 *  - `preload="none"` so no bytes are fetched until the element is near view
 *  - playback starts only when visible, and stops the moment it is not
 *  - playback pauses when the tab is hidden, so a backgrounded tab is not
 *    decoding frames and draining battery
 *  - any failure (missing file, codec, blocked autoplay) falls back to the
 *    vector animation rather than an empty black box
 *
 * Accessibility: the video is muted and decorative, and a visible pause control
 * is always present so moving content can be stopped (WCAG 2.2.2).
 */
export function HeroVideo({
  sources,
  poster,
  fallback,
  className,
  label = "Setuware delivery pipeline in motion",
}: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = usePrefersReducedMotion();

  const [failed, setFailed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const hasVideo = sources.length > 0 && !failed;

  // Observe visibility to drive both loading and playback.
  useEffect(() => {
    if (!hasVideo) return;
    const element = containerRef.current;
    if (!element || typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.25 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [hasVideo]);

  const play = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      await video.play();
      setIsPlaying(true);
    } catch {
      // Autoplay refused (power-saving mode, browser policy). Leave the poster
      // in place; the manual control still works.
      setIsPlaying(false);
    }
  }, []);

  const pause = useCallback(() => {
    videoRef.current?.pause();
    setIsPlaying(false);
  }, []);

  // Start and stop with visibility, unless the visitor asked for less motion.
  useEffect(() => {
    if (!hasVideo || reduceMotion) return;
    if (isVisible) void play();
    else pause();
  }, [hasVideo, isVisible, pause, play, reduceMotion]);

  // Never decode frames for a tab nobody is looking at.
  useEffect(() => {
    if (!hasVideo) return;
    const onVisibilityChange = () => {
      if (document.hidden) pause();
      else if (isVisible && !reduceMotion) void play();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [hasVideo, isVisible, pause, play, reduceMotion]);

  if (!hasVideo) {
    return <div className={className}>{fallback}</div>;
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <video
        ref={videoRef}
        className="w-full rounded-card border border-border bg-surface object-cover shadow-ambient"
        poster={poster}
        preload="none"
        muted
        loop
        playsInline
        disablePictureInPicture
        aria-label={label}
        onError={() => setFailed(true)}
        onPlaying={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        {sources.map((source) => (
          <source key={source.src} src={source.src} type={source.type} />
        ))}
      </video>

      <button
        type="button"
        onClick={() => (isPlaying ? pause() : void play())}
        className="absolute bottom-3 right-3 inline-flex size-9 items-center justify-center rounded-full border border-border bg-surface/85 text-foreground backdrop-blur transition-colors hover:bg-surface"
        aria-label={isPlaying ? "Pause background animation" : "Play background animation"}
      >
        {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
      </button>
    </div>
  );
}
