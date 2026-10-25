import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { HeroVideo } from "@/components/interactive/hero-video";

const fallback = <div data-testid="vector-hero">Vector hero</div>;
const sources = [{ src: "/media/hero.webm", type: "video/webm" }];

beforeEach(() => {
  // jsdom has no media pipeline; stub the playback surface.
  Object.defineProperty(HTMLMediaElement.prototype, "play", {
    configurable: true,
    writable: true,
    value: vi.fn().mockResolvedValue(undefined),
  });
  Object.defineProperty(HTMLMediaElement.prototype, "pause", {
    configurable: true,
    writable: true,
    value: vi.fn(),
  });
});

describe("HeroVideo", () => {
  it("renders the vector fallback when no video is configured", () => {
    const { container } = render(<HeroVideo sources={[]} fallback={fallback} />);

    expect(screen.getByTestId("vector-hero")).toBeInTheDocument();
    expect(container.querySelector("video")).toBeNull();
  });

  it("renders a video element when sources are configured", () => {
    const { container } = render(<HeroVideo sources={sources} fallback={fallback} />);
    const video = container.querySelector("video")!;

    expect(video).toBeInTheDocument();
    expect(screen.queryByTestId("vector-hero")).not.toBeInTheDocument();
  });

  it("fetches no bytes until the element is in view", () => {
    const { container } = render(<HeroVideo sources={sources} fallback={fallback} />);
    expect(container.querySelector("video")).toHaveAttribute("preload", "none");
  });

  it("is muted, looping and inline so autoplay is permitted", () => {
    const { container } = render(<HeroVideo sources={sources} fallback={fallback} />);
    const video = container.querySelector("video")!;

    expect(video).toHaveProperty("muted", true);
    expect(video).toHaveAttribute("loop");
    expect(video).toHaveAttribute("playsinline");
  });

  it("offers a pause control so moving content can be stopped", async () => {
    render(<HeroVideo sources={sources} fallback={fallback} />);

    const control = await screen.findByRole("button", {
      name: /pause|play/i,
    });
    expect(control).toBeInTheDocument();
  });

  it("falls back to the vector hero when the video errors", async () => {
    const { container } = render(<HeroVideo sources={sources} fallback={fallback} />);
    const video = container.querySelector("video")!;

    await act(async () => {
      video.dispatchEvent(new Event("error"));
    });

    expect(screen.getByTestId("vector-hero")).toBeInTheDocument();
    expect(container.querySelector("video")).toBeNull();
  });

  it("pauses when the tab is hidden and does not leave it decoding", async () => {
    const { container } = render(<HeroVideo sources={sources} fallback={fallback} />);
    const video = container.querySelector("video")!;

    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(video.pause).toHaveBeenCalled();
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
  });

  it("does not autoplay for visitors who prefer reduced motion", async () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("reduce"),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
        onchange: null,
      })),
    );

    const { container } = render(<HeroVideo sources={sources} fallback={fallback} />);
    const video = container.querySelector("video")!;

    expect(video.play).not.toHaveBeenCalled();
  });

  it("still plays on demand when autoplay was refused", async () => {
    const user = userEvent.setup();
    const play = vi.fn().mockRejectedValueOnce(new Error("NotAllowedError"));
    Object.defineProperty(HTMLMediaElement.prototype, "play", {
      configurable: true,
      writable: true,
      value: play,
    });

    render(<HeroVideo sources={sources} fallback={fallback} />);
    const control = await screen.findByRole("button", { name: /play|pause/i });

    play.mockResolvedValue(undefined);
    await user.click(control);

    expect(play).toHaveBeenCalled();
  });

  it("carries a descriptive label for the decorative video", () => {
    const { container } = render(
      <HeroVideo sources={sources} fallback={fallback} label="Pipeline in motion" />,
    );

    expect(container.querySelector("video")).toHaveAttribute(
      "aria-label",
      "Pipeline in motion",
    );
  });
});
