"use client";

import { Download } from "lucide-react";

import { useInstall } from "./use-install";

/** "Install app" on the sign-in pages, so phones can add the portal before signing in. */
export function InstallButton() {
  const [install, prompt] = useInstall();
  if (!install) return null;
  return (
    <button type="button" onClick={prompt} className="mx-auto mt-5 flex items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-xs font-semibold text-white/80 hover:bg-white/[0.06]">
      <Download className="size-3.5" aria-hidden /> Install app
    </button>
  );
}
