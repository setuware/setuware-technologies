"use client";

import { useEffect, useState } from "react";

import { pwaScope } from "@/lib/portal";

type InstallPrompt = { prompt: () => Promise<void> };

/** Registers the offline worker and returns the browser's "Install app" prompt, when it offers one. */
export function useInstall(): [InstallPrompt | null, () => void] {
  const [install, setInstall] = useState<InstallPrompt | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/admin-sw.js", { scope: pwaScope(window.location.host) }).catch(() => undefined);
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstall(event as unknown as InstallPrompt);
    };
    const onInstalled = () => setInstall(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  return [
    install,
    () => {
      void install?.prompt();
      setInstall(null);
    },
  ];
}
