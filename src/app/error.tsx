"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

import { site } from "@/lib/site";
import { Button, ButtonLink } from "@/components/ui/button";

/**
 * Route-level error boundary.
 *
 * Shows a recoverable state rather than a blank page, and surfaces the digest
 * so a visitor can quote it to us — the message itself is intentionally not
 * rendered, since it can contain server detail.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[route error]", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="container-page flex min-h-[70vh] max-w-xl flex-col items-center justify-center py-24 text-center">
      <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
        <RefreshCw className="size-6" aria-hidden />
      </span>

      <h1 className="mt-6 text-2xl font-semibold text-foreground sm:text-3xl">
        Something went wrong on our side
      </h1>
      <p className="mt-3 text-[1.02rem] leading-relaxed text-muted-foreground">
        This one is on us, not on you. Try again — and if it keeps happening,
        send us the reference below and we will look at the logs.
      </p>

      {error.digest ? (
        <p className="mt-4 rounded-lg border border-border bg-surface px-3 py-1.5 font-mono text-xs text-muted-foreground">
          {error.digest}
        </p>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button onClick={reset} variant="gradient" size="lg">
          <RefreshCw className="size-4" aria-hidden />
          Try again
        </Button>
        <ButtonLink href={`mailto:${site.email}`} variant="secondary" size="lg">
          Report it
        </ButtonLink>
      </div>
    </div>
  );
}
