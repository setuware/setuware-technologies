"use client";

import type { ApiErrorCode } from "./api";

/**
 * Typed fetch wrapper for the public forms.
 *
 * Every failure mode a visitor can hit — offline, timeout, rate limit, server
 * error, validation — comes back in the same shape, so forms render one
 * consistent message instead of a stack trace or a silent nothing.
 */

export interface PostSuccess<T> {
  ok: true;
  data: T;
  message?: string;
}

export interface PostFailure {
  ok: false;
  code: ApiErrorCode | "network" | "timeout";
  message: string;
  fields?: Record<string, string>;
}

export type PostResult<T> = PostSuccess<T> | PostFailure;

const DEFAULT_TIMEOUT_MS = 12_000;

export async function postJson<T>(
  url: string,
  body: unknown,
  options: { timeoutMs?: number } = {},
): Promise<PostResult<T>> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  );

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    // A proxy or error page can return HTML with a non-JSON body.
    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const envelope = payload as
        | { error?: { code?: ApiErrorCode; message?: string; fields?: Record<string, string> } }
        | null;
      return {
        ok: false,
        code: envelope?.error?.code ?? "server_error",
        message:
          envelope?.error?.message ??
          (response.status === 429
            ? "Too many attempts. Please try again in a few minutes."
            : "Something went wrong on our side. Please try again."),
        fields: envelope?.error?.fields,
      };
    }

    const envelope = payload as PostSuccess<T> | null;
    if (!envelope || envelope.ok !== true) {
      return {
        ok: false,
        code: "server_error",
        message: "We got an unexpected response. Please try again.",
      };
    }

    return envelope;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return {
        ok: false,
        code: "timeout",
        message: "That took too long. Check your connection and try again.",
      };
    }
    return {
      ok: false,
      code: "network",
      message:
        typeof navigator !== "undefined" && navigator.onLine === false
          ? "You appear to be offline. We'll wait."
          : "We couldn't reach the server. Please try again.",
    };
  } finally {
    clearTimeout(timeout);
  }
}
