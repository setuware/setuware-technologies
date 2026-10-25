import { describe, expect, it } from "vitest";

import { heroVideoPoster, heroVideoSources } from "@/lib/media";

describe("heroVideoSources", () => {
  it("returns nothing when no video is configured, so the vector hero is used", () => {
    expect(heroVideoSources({})).toEqual([]);
  });

  it("prefers WebM over MP4 in source order", () => {
    const sources = heroVideoSources({
      NEXT_PUBLIC_HERO_VIDEO_MP4: "/media/hero.mp4",
      NEXT_PUBLIC_HERO_VIDEO_WEBM: "/media/hero.webm",
    });

    expect(sources.map((source) => source.type)).toEqual([
      "video/webm",
      "video/mp4",
    ]);
  });

  it("accepts a single format", () => {
    expect(heroVideoSources({ NEXT_PUBLIC_HERO_VIDEO_MP4: "/media/hero.mp4" })).toEqual([
      { src: "/media/hero.mp4", type: "video/mp4" },
    ]);
  });

  it("treats a blank or whitespace env var as unset", () => {
    expect(
      heroVideoSources({
        NEXT_PUBLIC_HERO_VIDEO_WEBM: "   ",
        NEXT_PUBLIC_HERO_VIDEO_MP4: "",
      }),
    ).toEqual([]);
  });
});

describe("heroVideoPoster", () => {
  it("is undefined when unset", () => {
    expect(heroVideoPoster({})).toBeUndefined();
    expect(heroVideoPoster({ NEXT_PUBLIC_HERO_VIDEO_POSTER: "  " })).toBeUndefined();
  });

  it("returns the configured path", () => {
    expect(
      heroVideoPoster({ NEXT_PUBLIC_HERO_VIDEO_POSTER: "/media/poster.jpg" }),
    ).toBe("/media/poster.jpg");
  });
});
