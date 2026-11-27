"use client";

import { useEffect, useSyncExternalStore } from "react";

import { pwaScope } from "@/lib/portal";

type InstallPrompt = { prompt: () => Promise<void> };

// The browser offers the prompt once per page load, so it is kept here and
// survives the move from the sign-in page to the dashboard.
let offered: InstallPrompt | null = null;
let listening = false;
const subscribers = new Set<() => void>();

function setOffered(next: InstallPrompt | null) {
  offered = next;
  subscribers.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  subscribers.add(notify);
  return () => {
    subscribers.delete(notify);
  };
}

/** Registers the offline worker and returns the browser's "Install app" prompt, when it offers one. */
export function useInstall(): [InstallPrompt | null, () => void] {
  const install = useSyncExternalStore(
    subscribe,
    () => offered,
    () => null,
  );

  useEffect(() => {
    if (listening) return;
    listening = true;
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/admin-sw.js", { scope: pwaScope(window.location.host) }).catch(() => undefined);
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      setOffered(event as unknown as InstallPrompt);
    });
    window.addEventListener("appinstalled", () => setOffered(null));
  }, []);

  return [
    install,
    () => {
      void install?.prompt();
      setOffered(null);
    },
  ];
}
