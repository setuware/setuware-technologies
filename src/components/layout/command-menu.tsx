"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { OPEN_COMMAND_EVENT } from "./command-menu-events";

/**
 * Keyboard shell for the command palette.
 *
 * Only the ~1KB listener below is in the initial bundle; the dialog itself is
 * fetched the first time a visitor actually presses ⌘K or clicks Search.
 */
const CommandMenuDialog = dynamic(
  () => import("./command-menu-dialog").then((mod) => mod.CommandMenuDialog),
  { ssr: false },
);

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  /** Stays true after the first open so the chunk is not re-requested. */
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const openMenu = () => {
      setLoaded(true);
      setOpen(true);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const isShortcut =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (isShortcut) {
        event.preventDefault();
        openMenu();
        return;
      }
      // `/` is a familiar search shortcut, but must not hijack typing.
      if (event.key === "/" && !isEditableTarget(event.target)) {
        event.preventDefault();
        openMenu();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_COMMAND_EVENT, openMenu);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_COMMAND_EVENT, openMenu);
    };
  }, []);

  if (!loaded) return null;
  return <CommandMenuDialog open={open} onOpenChange={setOpen} />;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}
