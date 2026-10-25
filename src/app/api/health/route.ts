import { connection } from "next/server";
import { NextResponse } from "next/server";

/**
 * Liveness probe for uptime monitors and load balancers.
 *
 * `connection()` opts the handler out of prerendering — without it, Cache
 * Components would bake a build-time response into a static file and the probe
 * would report the same uptime forever.
 *
 * It deliberately does no I/O: a health check that queries a database turns a
 * slow dependency into a failing instance, and a monitor polling it becomes
 * load of its own.
 */
export async function GET() {
  await connection();

  return NextResponse.json(
    {
      ok: true,
      status: "healthy",
      version: process.env.NEXT_PUBLIC_BUILD_ID ?? "dev",
      uptimeSeconds: Math.round(process.uptime()),
    },
    { headers: { "cache-control": "no-store, max-age=0" } },
  );
}

export async function HEAD() {
  await connection();
  return new Response(null, {
    status: 200,
    headers: { "cache-control": "no-store, max-age=0" },
  });
}
