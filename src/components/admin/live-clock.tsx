"use client";

import { useEffect, useState } from "react";

/** Ticking duration since `since`, minus `minus` minutes (e.g. breaks). */
export function Elapsed({ since, minus = 0, seconds = true, className }: { since: string; minus?: number; seconds?: boolean; className?: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, []);
  if (now === null) return <span className={className}>{seconds ? "0:00:00" : "0h 00m"}</span>;
  const total = Math.max(0, Math.floor((now - Date.parse(since)) / 1000) - minus * 60);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return (
    <span className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {seconds ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${h}h ${String(m).padStart(2, "0")}m`}
    </span>
  );
}

/** Current time in India, ticking. */
export function Clock({ className }: { className?: string }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, []);
  return (
    <span className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {now ? new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }).format(now) : "--:--:--"}
    </span>
  );
}
