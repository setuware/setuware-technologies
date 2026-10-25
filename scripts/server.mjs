#!/usr/bin/env node
/**
 * Clustered production server.
 *
 * `next start` runs one Node process, and Node is single-threaded — so a
 * single instance tops out around 400–500 requests per second on this
 * hardware regardless of how many connections you throw at it. Beyond that,
 * requests queue and latency climbs until clients time out.
 *
 * This forks one worker per CPU core and lets the OS balance accepted
 * connections between them, which is the single-machine equivalent of running
 * N container replicas behind a load balancer. Workers are restarted if they
 * die, so one crash does not take capacity away permanently.
 *
 *   npm run build && npm run start:cluster
 *   WEB_CONCURRENCY=4 npm run start:cluster   # pin the worker count
 *
 * In front of this you still want a CDN: every marketing page here is
 * prerendered, so a correctly configured edge cache serves almost all traffic
 * without reaching Node at all. The cluster is what absorbs the rest.
 */

import cluster from "node:cluster";
import http from "node:http";
import { availableParallelism } from "node:os";
import next from "next";

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "0.0.0.0";
const WORKERS = Number(process.env.WEB_CONCURRENCY ?? availableParallelism());

/** Restarting faster than this means something is fundamentally broken. */
const RESTART_WINDOW_MS = 10_000;
const MAX_RESTARTS_IN_WINDOW = 8;

if (cluster.isPrimary) {
  process.stdout.write(
    `Setuware · starting ${WORKERS} worker${WORKERS === 1 ? "" : "s"} on http://${HOST}:${PORT}\n`,
  );

  for (let i = 0; i < WORKERS; i += 1) cluster.fork();

  const restarts = [];

  cluster.on("exit", (worker, code, signal) => {
    if (worker.exitedAfterDisconnect) return;

    const now = Date.now();
    restarts.push(now);
    while (restarts.length > 0 && now - restarts[0] > RESTART_WINDOW_MS) {
      restarts.shift();
    }

    if (restarts.length > MAX_RESTARTS_IN_WINDOW) {
      process.stderr.write(
        "Workers are crash-looping; exiting so the supervisor can back off.\n",
      );
      process.exit(1);
    }

    process.stderr.write(
      `Worker ${worker.process.pid} exited (${signal ?? code}); starting a replacement.\n`,
    );
    cluster.fork();
  });

  // Drain rather than drop in-flight requests on a deploy or Ctrl+C.
  const shutdown = () => {
    process.stdout.write("\nShutting down workers…\n");
    for (const worker of Object.values(cluster.workers ?? {})) worker?.disconnect();
    setTimeout(() => process.exit(0), 5_000).unref();
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
} else {
  const app = next({ dev: false, hostname: HOST, port: PORT });
  const handle = app.getRequestHandler();

  await app.prepare();

  const server = http.createServer((req, res) => {
    handle(req, res).catch((error) => {
      process.stderr.write(`Request failed: ${error}\n`);
      res.statusCode = 500;
      res.end("Internal Server Error");
    });
  });

  // Node's default of 5s can close a connection a load balancer is about to
  // reuse, which surfaces as random 502s.
  server.keepAliveTimeout = 65_000;
  server.headersTimeout = 70_000;

  server.listen(PORT, HOST);

  process.on("disconnect", () => server.close(() => process.exit(0)));
}
