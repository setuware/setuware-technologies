"use client";

import { Component, useEffect, useState, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

import { useMediaQuery } from "@/lib/hooks";

/**
 * Custom cursor for mouse and trackpad visitors: a small cyan dot that
 * follows the pointer exactly, and a ring that trails it on a spring. The
 * ring grows over interactive elements and compresses on press.
 *
 * - Only for precise, hovering pointers. Touch devices, reduced motion,
 *   forced colours and high-contrast preferences keep the native cursor.
 * - The native cursor is hidden (via `html.has-custom-cursor`, see
 *   globals.css) only once the custom one has a position, and never over
 *   form fields or editable text, where the custom cursor fades out instead.
 * - Everything is `pointer-events: none` and moves by transform only.
 * - The class is removed on unmount and by the error boundary below, so a
 *   failure can never leave the page without a visible cursor.
 */

const ACTIVE_CLASS = "has-custom-cursor";

const INTERACTIVE =
  'a[href], button:not(:disabled), [role="button"], [data-cursor="hover"], summary, label[for]';

const TEXT_ENTRY =
  'input, textarea, select, [contenteditable]:not([contenteditable="false"]), iframe';

const RING_SPRING = { stiffness: 420, damping: 32, mass: 0.55 };
const STATE_SPRING = { type: "spring", stiffness: 380, damping: 26 } as const;

function setNativeCursorHidden(hidden: boolean) {
  document.documentElement.classList.toggle(ACTIVE_CLASS, hidden);
}

function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, RING_SPRING);
  const ringY = useSpring(y, RING_SPRING);

  const [visible, setVisible] = useState(false);
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [overText, setOverText] = useState(false);

  useEffect(() => {
    let positioned = false;

    const inspect = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return;
      setOverText(Boolean(target.closest(TEXT_ENTRY)));
      setHover(Boolean(target.closest(INTERACTIVE)));
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      x.set(event.clientX);
      y.set(event.clientY);
      if (!positioned) {
        // First position: place the ring without a spring from the corner.
        positioned = true;
        ringX.jump(event.clientX);
        ringY.jump(event.clientY);
        setNativeCursorHidden(true);
      }
      setVisible(true);
    };

    const onOver = (event: PointerEvent) => {
      if (event.pointerType === "mouse") inspect(event.target);
    };
    const onDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse") setPressed(true);
    };
    const onUp = () => setPressed(false);
    const onLeave = () => {
      setVisible(false);
      setPressed(false);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    window.addEventListener("blur", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("blur", onLeave);
      setNativeCursorHidden(false);
    };
  }, [x, y, ringX, ringY]);

  const shown = visible && !overText;
  const ringScale = pressed ? (hover ? 1.3 : 0.78) : hover ? 1.56 : 1;
  const dotScale = pressed ? 0.7 : hover ? 0.5 : 1;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[2147483000]">
      {/* Ring: 36px, trails on a spring. */}
      <motion.div
        className="absolute left-0 top-0 -ml-[18px] -mt-[18px] size-9 will-change-transform"
        style={{ x: ringX, y: ringY }}
      >
        <motion.div
          className="relative size-full rounded-full border-[1.5px] border-[rgba(47,86,216,0.5)] shadow-[0_0_0_1px_rgba(255,255,255,0.35),inset_0_0_0_1px_rgba(255,255,255,0.2)]"
          initial={false}
          animate={{ scale: ringScale, opacity: shown ? 1 : 0 }}
          transition={STATE_SPRING}
        >
          <motion.span
            className="absolute inset-0 rounded-full bg-[rgba(47,86,216,0.1)]"
            initial={false}
            animate={{ opacity: hover ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          />
        </motion.div>
      </motion.div>

      {/* Dot: 8px, follows the pointer exactly. */}
      <motion.div
        className="absolute left-0 top-0 -ml-1 -mt-1 size-2 will-change-transform"
        style={{ x, y }}
      >
        <motion.div
          className="size-full rounded-full bg-[#2f56d8] shadow-[0_0_0_1.5px_rgba(255,255,255,0.85),0_1px_4px_rgba(11,16,32,0.3)]"
          initial={false}
          animate={{ scale: dotScale, opacity: shown ? 1 : 0 }}
          transition={STATE_SPRING}
        />
      </motion.div>
    </div>
  );
}

/** Any error inside the cursor removes it and restores the native cursor. */
class CursorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    setNativeCursorHidden(false);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function CustomCursor() {
  const precise = useMediaQuery("(pointer: fine) and (hover: hover)");
  const optOut = useMediaQuery(
    "(prefers-reduced-motion: reduce), (forced-colors: active), (prefers-contrast: more)",
  );

  if (!precise || optOut) return null;

  return (
    <CursorBoundary>
      <Cursor />
    </CursorBoundary>
  );
}
