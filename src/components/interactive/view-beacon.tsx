"use client";

import { useEffect } from "react";

/** Records one anonymous view per page load (bots without JS are ignored). */
export function ViewBeacon({ path }: { path: string }) {
  useEffect(() => {
    const body = JSON.stringify({ path });
    if (!navigator.sendBeacon?.("/api/views", new Blob([body], { type: "application/json" }))) {
      void fetch("/api/views", { method: "POST", body, headers: { "content-type": "application/json" }, keepalive: true }).catch(() => {});
    }
  }, [path]);
  return null;
}
