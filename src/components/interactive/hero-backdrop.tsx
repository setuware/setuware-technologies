"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useScroll,
  useTransform,
} from "framer-motion";

import { usePrefersReducedMotion } from "@/lib/hooks";
import { EASE_IN_OUT, EASE_OUT } from "@/components/motion/ease";
import { cn } from "@/lib/utils";
import type { VideoSource } from "@/lib/media";
import { TechBackdrop } from "./tech-backdrop";
import { useReducedMotionSafe } from "@/components/motion/primitives";

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
            tone === "dark" ? "opacity-100" : "opacity-[0.28] dark:opacity-40",
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
          <div className="absolute inset-0 bg-[linear-gradient(95deg,rgba(6,9,18,0.82)_0%,rgba(6,9,18,0.45)_42%,rgba(6,9,18,0)_75%)]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(to_top,rgba(6,9,18,0.7),transparent)]" />
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

/**
 * Motion layer for the hero media (photo or video).
 *
 * Three nested transforms, each owning one property so they never fight:
 *  - outer: scroll parallax — the media sinks at ~30% of scroll speed as the
 *    hero leaves the viewport, which reads as depth rather than movement;
 *  - middle: a one-off settle from 1.12 to 1 on load;
 *  - inner: a slow Ken Burns drift (26s, mirrored) so a still photograph is
 *    never quite static.
 * The scale headroom from the drift covers the parallax offset, and any gap it
 * opens is above the fold by the time it could show. Reduced motion gets the
 * plain media.
 */
export function HeroMedia({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionSafe();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  // Same element tree either way, so server and client markup always match;
  // reduced motion only drops the animations.
  return (
    <motion.div
      ref={ref}
      className="absolute inset-0 will-change-transform"
      style={reduce ? undefined : { y }}
      aria-hidden
    >
      <motion.div
        className="absolute inset-0"
        initial={reduce ? false : { scale: 1.12 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.4, ease: EASE_OUT }}
      >
        <motion.div
          className="absolute inset-0"
          animate={reduce ? undefined : { scale: [1.04, 1.1], x: ["0%", "-1.5%"] }}
          transition={{ duration: 26, ease: EASE_IN_OUT, repeat: Infinity, repeatType: "mirror" }}
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Hero copy that recedes as you scroll past it: drifts down slower than the
 * page, softens and fades, so the next section takes over instead of the
 * headline being cut off by the fold. Purely scroll-linked, so it is fully
 * visible at the top of the page and before hydration.
 */
export function HeroScrollFade({
  children,
  className,
  distance = 700,
}: {
  children: ReactNode;
  className?: string;
  /** Page scroll (px) over which the copy fully recedes. */
  distance?: number;
}) {
  const reduce = useReducedMotionSafe();
  // The hero is always the first thing on the page, so page scroll is the
  // right clock — no measuring, and progress is exactly 0 at the top.
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, distance], [0, 140]);
  const opacity = useTransform(scrollY, [0, distance * 0.8], [1, 0]);
  const filter = useTransform(scrollY, [0, distance * 0.8], ["blur(0px)", "blur(6px)"]);

  return (
    <motion.div className={className} style={reduce ? undefined : { y, opacity, filter }}>
      {children}
    </motion.div>
  );
}
