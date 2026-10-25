import { NextResponse } from "next/server";
import { z } from "zod";

import { fieldErrors } from "./validation";
import type { RateLimitResult } from "./rate-limit";

/**
 * Helpers that give every route handler the same response envelope, the same
 * error vocabulary, and the same protections against malformed or oversized
 * input.
 */

export interface ApiSuccess<T> {
  ok: true;
  data: T;
  message?: string;
}

export interface ApiFailure {
  ok: false;
  error: {
    code: ApiErrorCode;
    message: string;
    fields?: Record<string, string>;
  };
}

export type ApiErrorCode =
  | "bad_request"
  | "invalid_json"
  | "payload_too_large"
  | "unsupported_media_type"
  | "validation_failed"
  | "rate_limited"
  | "conflict"
  | "spam_detected"
  | "server_error";

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  bad_request: 400,
  invalid_json: 400,
  payload_too_large: 413,
  unsupported_media_type: 415,
  validation_failed: 422,
  rate_limited: 429,
  conflict: 409,
  spam_detected: 422,
  server_error: 500,
};

/** Public endpoints must never be cached by a CDN or the browser. */
const NO_STORE = {
  "cache-control": "no-store, max-age=0",
} as const;

export function ok<T>(
  data: T,
  init?: { status?: number; message?: string; headers?: HeadersInit },
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json(
    { ok: true, data, ...(init?.message ? { message: init.message } : {}) },
    {
      status: init?.status ?? 200,
      headers: { ...NO_STORE, ...(init?.headers ?? {}) },
    },
  );
}

export function fail(
  code: ApiErrorCode,
  message: string,
  init?: { fields?: Record<string, string>; headers?: HeadersInit },
): NextResponse<ApiFailure> {
  return NextResponse.json(
    {
      ok: false,
      error: { code, message, ...(init?.fields ? { fields: init.fields } : {}) },
    },
    {
      status: STATUS_BY_CODE[code],
      headers: { ...NO_STORE, ...(init?.headers ?? {}) },
    },
  );
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    "x-ratelimit-limit": String(result.limit),
    "x-ratelimit-remaining": String(result.remaining),
    "x-ratelimit-reset": String(Math.ceil(result.resetAt / 1000)),
  };
  if (!result.ok) headers["retry-after"] = String(result.retryAfter);
  return headers;
}

/** Default body cap. Every public form here is far smaller than this. */
export const MAX_BODY_BYTES = 32 * 1024;

export type ReadResult<T> =
  | { ok: true; value: T }
  | { ok: false; response: NextResponse<ApiFailure> };

/**
 * Reads and validates a JSON body.
 *
 * Rejects the wrong content type, an oversized or absent body, and malformed
 * JSON with distinct codes, so the client can tell a typo from an outage.
 */
export async function readJson<S extends z.ZodTypeAny>(
  request: Request,
  schema: S,
  options: { maxBytes?: number } = {},
): Promise<ReadResult<z.infer<S>>> {
  const maxBytes = options.maxBytes ?? MAX_BODY_BYTES;

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return {
      ok: false,
      response: fail("unsupported_media_type", "Send this request as JSON."),
    };
  }

  // Trust the declared length only to reject early; the real check is on bytes.
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    return {
      ok: false,
      response: fail("payload_too_large", "That request body is too large."),
    };
  }

  let raw: string;
  try {
    const buffer = await request.arrayBuffer();
    if (buffer.byteLength > maxBytes) {
      return {
        ok: false,
        response: fail("payload_too_large", "That request body is too large."),
      };
    }
    raw = new TextDecoder().decode(buffer);
  } catch {
    return { ok: false, response: fail("bad_request", "Could not read the request body.") };
  }

  if (raw.trim() === "") {
    return { ok: false, response: fail("bad_request", "The request body was empty.") };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, response: fail("invalid_json", "That body is not valid JSON.") };
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    return {
      ok: false,
      response: fail("validation_failed", "Please check the highlighted fields.", {
        fields: fieldErrors(result.error),
      }),
    };
  }

  return { ok: true, value: result.data };
}

/**
 * Best-effort client identity for rate limiting.
 *
 * Proxy headers are client-controlled, so this is a throttling signal only —
 * never an authorisation one.
 */
export function clientKey(request: Request, scope: string): string {
  const headers = request.headers;
  const forwarded = headers.get("x-forwarded-for") ?? "";
  const ip =
    headers.get("cf-connecting-ip") ??
    headers.get("x-real-ip") ??
    forwarded.split(",")[0]?.trim() ??
    "";
  // Fall back to a coarse fingerprint so a missing IP does not create one
  // shared bucket that lets a single abuser lock out everyone else.
  const fingerprint = ip || `ua:${headers.get("user-agent") ?? "unknown"}`;
  return `${scope}:${fingerprint}`;
}

/** Trivially non-human submissions: hidden field filled, or submitted too fast. */
export function looksLikeSpam(payload: {
  honeypot?: string;
  elapsedMs?: number;
}): boolean {
  if (payload.honeypot && payload.honeypot.length > 0) return true;
  if (typeof payload.elapsedMs === "number" && payload.elapsedMs < 1_200) return true;
  return false;
}
