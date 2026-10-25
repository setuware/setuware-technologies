/**
 * Hero media configuration.
 *
 * The site ships with the vector `PipelineAnimation` as its hero visual, which
 * costs a few kilobytes instead of a few megabytes. To use a real video
 * instead, drop the files in `public/media/` and set the env vars below — the
 * player then takes over automatically and keeps the animation as its poster
 * fallback. Both formats are optional; WebM is preferred when present.
 *
 *   NEXT_PUBLIC_HERO_VIDEO_WEBM=/media/hero.webm
 *   NEXT_PUBLIC_HERO_VIDEO_MP4=/media/hero.mp4
 *   NEXT_PUBLIC_HERO_VIDEO_POSTER=/media/hero-poster.jpg
 */

export interface VideoSource {
  src: string;
  type: string;
}

export function heroVideoSources(
  env: Record<string, string | undefined> = process.env as Record<
    string,
    string | undefined
  >,
): VideoSource[] {
  const sources: VideoSource[] = [];
  const webm = env.NEXT_PUBLIC_HERO_VIDEO_WEBM?.trim();
  const mp4 = env.NEXT_PUBLIC_HERO_VIDEO_MP4?.trim();

  // WebM first: browsers pick the first source they can play, and it is the
  // smaller file wherever it is supported.
  if (webm) sources.push({ src: webm, type: "video/webm" });
  if (mp4) sources.push({ src: mp4, type: "video/mp4" });

  return sources;
}

export function heroVideoPoster(
  env: Record<string, string | undefined> = process.env as Record<
    string,
    string | undefined
  >,
): string | undefined {
  const poster = env.NEXT_PUBLIC_HERO_VIDEO_POSTER?.trim();
  return poster ? poster : undefined;
}

/**
 * Full-bleed hero background video.
 *
 * Separate from the inset hero video above: this one sits *behind* the
 * headline. Drop files in `public/media/` and point these at them:
 *
 *   NEXT_PUBLIC_HERO_BG_WEBM=/media/tech-loop.webm
 *   NEXT_PUBLIC_HERO_BG_MP4=/media/tech-loop.mp4
 *   NEXT_PUBLIC_HERO_BG_POSTER=/media/tech-loop.jpg
 *
 * With none set, the hero renders the generated `TechBackdrop` animation
 * instead — which is a few kilobytes rather than a few megabytes, so it is the
 * better default unless you have footage worth the download.
 */
export function heroBackdropSources(
  env: Record<string, string | undefined> = process.env as Record<
    string,
    string | undefined
  >,
): VideoSource[] {
  const sources: VideoSource[] = [];
  const webm = env.NEXT_PUBLIC_HERO_BG_WEBM?.trim();
  const mp4 = env.NEXT_PUBLIC_HERO_BG_MP4?.trim();

  if (webm) sources.push({ src: webm, type: "video/webm" });
  if (mp4) sources.push({ src: mp4, type: "video/mp4" });

  return sources;
}

export function heroBackdropPoster(
  env: Record<string, string | undefined> = process.env as Record<
    string,
    string | undefined
  >,
): string | undefined {
  const poster = env.NEXT_PUBLIC_HERO_BG_POSTER?.trim();
  return poster ? poster : undefined;
}
