"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

import { buttonClass, Card } from "@/components/admin/ui";

/** Admin error boundary: keeps the sidebar, offers a retry and shows a reference for the logs. */
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[admin error]", error.digest ?? error.message);
  }, [error]);

  return (
    <Card className="mx-auto mt-10 max-w-lg p-8 text-center">
      <span className="mx-auto inline-flex size-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
        <RefreshCw className="size-5" aria-hidden />
      </span>
      <h1 className="mt-4 font-display text-xl font-semibold text-foreground">This page couldn’t load</h1>
      <p className="mt-2 text-sm text-muted-foreground">Nothing you saved was lost. Try again; if it keeps happening, send the reference below to whoever runs the server.</p>
      {error.digest ? <p className="mt-3 font-mono text-xs text-muted-foreground">Reference: {error.digest}</p> : null}
      <div className="mt-6 flex justify-center gap-2">
        <button type="button" onClick={reset} className={buttonClass.primary}>
          Try again
        </button>
        <Link href="/admin" className={buttonClass.secondary}>
          Dashboard
        </Link>
      </div>
    </Card>
  );
}
