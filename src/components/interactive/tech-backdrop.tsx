"use client";

import { useEffect, useRef } from "react";

/**
 * Animated tech backdrop for the hero.
 *
 * A drifting node network with data packets travelling between nodes — the
 * "connected systems" motif, generated rather than filmed. It is a few
 * kilobytes of code instead of a multi-megabyte video, stays sharp at any
 * resolution, and adapts to the theme.
 *
 * Performance rules it obeys, because a background animation must never be the
 * reason a page feels slow:
 *  - one `requestAnimationFrame` loop, throttled to ~30fps
 *  - device pixel ratio capped at 1.5 (a 3× backing store costs 4× the fill)
 *  - node count scaled to viewport area, hard-capped
 *  - the loop is torn down entirely when scrolled out of view or the tab is
 *    hidden, so it costs nothing when it cannot be seen
 *  - `prefers-reduced-motion` paints a single static frame and stops
 */

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Packet {
  from: number;
  to: number;
  progress: number;
  speed: number;
}

const MAX_DPR = 1.5;
const TARGET_FPS = 30;
const FRAME_MS = 1000 / TARGET_FPS;
const LINK_DISTANCE = 160;
const MAX_NODES = 68;
const MIN_NODES = 22;

export function TechBackdrop({
  className,
  forceTone,
}: {
  className?: string;
  /** Pins the palette for sections that are dark in both themes. */
  forceTone?: "dark" | "light";
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    let packets: Packet[] = [];
    let frame = 0;
    let lastFrameAt = 0;
    let visible = true;

    /** Theme-aware ink, re-read whenever the theme class changes. */
    let accent = "59, 130, 246";
    const readAccent = () => {
      const isDark =
        forceTone === "dark" ||
        (forceTone !== "light" && document.documentElement.classList.contains("dark"));
      accent = isDark ? "125, 211, 252" : "37, 99, 235";
    };

    const seed = () => {
      const area = width * height;
      const count = Math.max(
        MIN_NODES,
        Math.min(MAX_NODES, Math.round(area / 19_000)),
      );

      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
      }));

      packets = Array.from({ length: Math.min(8, Math.floor(count / 5)) }, () => ({
        from: Math.floor(Math.random() * count),
        to: Math.floor(Math.random() * count),
        progress: Math.random(),
        speed: 0.0025 + Math.random() * 0.004,
      }));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (width === 0 || height === 0) return;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);

      // Links first, so nodes sit on top of them.
      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.hypot(dx, dy);
          if (distance > LINK_DISTANCE) continue;

          const alpha = (1 - distance / LINK_DISTANCE) * 0.33;
          context.strokeStyle = `rgba(${accent}, ${alpha.toFixed(3)})`;
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(nodes[i].x, nodes[i].y);
          context.lineTo(nodes[j].x, nodes[j].y);
          context.stroke();
        }
      }

      for (const node of nodes) {
        context.fillStyle = `rgba(${accent}, 0.55)`;
        context.beginPath();
        context.arc(node.x, node.y, 1.7, 0, Math.PI * 2);
        context.fill();
      }

      // Packets: the bit that reads as "traffic moving through a system".
      for (const packet of packets) {
        const from = nodes[packet.from];
        const to = nodes[packet.to];
        if (!from || !to) continue;

        const x = from.x + (to.x - from.x) * packet.progress;
        const y = from.y + (to.y - from.y) * packet.progress;

        const glow = context.createRadialGradient(x, y, 0, x, y, 9);
        glow.addColorStop(0, `rgba(${accent}, 0.85)`);
        glow.addColorStop(1, `rgba(${accent}, 0)`);
        context.fillStyle = glow;
        context.beginPath();
        context.arc(x, y, 9, 0, Math.PI * 2);
        context.fill();
      }
    };

    const step = (now: number) => {
      frame = requestAnimationFrame(step);
      if (now - lastFrameAt < FRAME_MS) return;
      lastFrameAt = now;

      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        // Bounce rather than wrap: a node popping across the canvas is visible.
        if (node.x <= 0 || node.x >= width) node.vx *= -1;
        if (node.y <= 0 || node.y >= height) node.vy *= -1;
      }

      for (const packet of packets) {
        packet.progress += packet.speed;
        if (packet.progress >= 1) {
          // Re-route from where it arrived, so traffic appears to flow onward.
          packet.from = packet.to;
          packet.to = Math.floor(Math.random() * nodes.length);
          packet.progress = 0;
          packet.speed = 0.0025 + Math.random() * 0.004;
        }
      }

      draw();
    };

    const start = () => {
      if (frame !== 0 || reduceMotion) return;
      lastFrameAt = 0;
      frame = requestAnimationFrame(step);
    };

    const stop = () => {
      if (frame === 0) return;
      cancelAnimationFrame(frame);
      frame = 0;
    };

    readAccent();
    resize();
    draw();

    if (reduceMotion) {
      // A single painted frame: the texture without the movement.
      return;
    }

    const observer =
      typeof IntersectionObserver === "function"
        ? new IntersectionObserver(
            (entries) => {
              visible = entries.some((entry) => entry.isIntersecting);
              if (visible && !document.hidden) start();
              else stop();
            },
            { threshold: 0 },
          )
        : null;
    observer?.observe(canvas);
    if (!observer) start();

    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else if (visible) start();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const resizeObserver =
      typeof ResizeObserver === "function"
        ? new ResizeObserver(() => {
            resize();
            draw();
          })
        : null;
    resizeObserver?.observe(canvas);

    // Repaint in the new palette when the theme is toggled.
    const themeObserver = new MutationObserver(() => {
      readAccent();
      draw();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      stop();
      observer?.disconnect();
      resizeObserver?.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [forceTone]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      // Decorative: there is nothing here a screen reader should announce.
      aria-hidden
      role="presentation"
    />
  );
}
