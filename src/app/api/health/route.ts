import { connection } from "next/server";
import { NextResponse } from "next/server";

/**
 * Liveness probe for uptime monitors and load balancers.
 *
 * `connection()` opts the handler out of prerendering — without it, Cache
 * Components would bake a build-time response into a static file and the probe
 * would report the same uptime forever.
 *
 * By default it does no I/O: a health check that queries a database turns a
 * slow dependency into a failing instance, and a monitor polling it becomes
 * load of its own. Add `?deep=1` to also check the database.
 */
export async function GET(request: Request) {
  await connection();

  // `?deep=1` also checks the admin database (for a less frequent readiness check).
  if (new URL(request.url).searchParams.get("deep") === "1") {
    try {
      const { getDb } = await import("@/lib/cms/db");
      getDb().prepare("SELECT 1").get();
    } catch (error) {
      return NextResponse.json(
        { ok: false, status: "database-unavailable", error: error instanceof Error ? error.message : "unknown" },
        { status: 503, headers: { "cache-control": "no-store, max-age=0" } },
      );
    }
  }

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
