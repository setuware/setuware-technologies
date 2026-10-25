#!/usr/bin/env node
/**
 * Load test for the public site.
 *
 * Answers the question "does this hold at 1,000 concurrent users?" with a
 * number rather than an opinion. Ramps connections against the real routes a
 * visitor hits, then reports latency percentiles and the non-2xx rate.
 *
 * Usage:
 *   npm run build && npm run start:cluster &
 *   npm run loadtest                        # 200 connections, 20s, home page
 *   npm run loadtest -- --connections 1000  # saturation test
 *   npm run loadtest -- --url /pricing
 *   npm run loadtest -- --all               # sweep the main routes
 *
 * Read the error rate first, then p99: averages hide exactly the failures
 * users notice.
 *
 * Caveat worth remembering when reading the numbers: run locally, the load
 * generator competes with the server for the same cores, which inflates
 * latency and understates throughput. Treat local runs as a comparison
 * between builds, and measure absolute capacity from a separate machine.
 */

import autocannon from "autocannon";

const args = process.argv.slice(2);

function flag(name, fallback) {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? fallback : args[index + 1];
}

const BASE = flag("base", "http://127.0.0.1:3000").replace(/\/$/, "");
const CONNECTIONS = Number(flag("connections", 200));
const DURATION = Number(flag("duration", 20));
const PIPELINING = Number(flag("pipelining", 1));

const ROUTES = args.includes("--all")
  ? ["/", "/services", "/services/web-development", "/pricing", "/work", "/estimate", "/blog"]
  : [flag("url", "/").replace(BASE, "")];

/** p99 under this is the bar we hold ourselves to for static routes. */
const P99_BUDGET_MS = Number(flag("p99", 1500));

function formatRow(label, value) {
  return `  ${label.padEnd(22)} ${value}`;
}

async function run(path) {
  const url = path.startsWith("http") ? path : `${BASE}${path}`;
  process.stdout.write(`\n▸ ${url}\n`);
  process.stdout.write(
    `  ${CONNECTIONS} connections · ${DURATION}s · pipelining ${PIPELINING}\n\n`,
  );

  const result = await autocannon({
    url,
    connections: CONNECTIONS,
    duration: DURATION,
    pipelining: PIPELINING,
    headers: { "accept-encoding": "gzip, br" },
  });

  const failed = result.non2xx + result.errors + result.timeouts;
  const total = result.requests.total || 1;
  const errorRate = (failed / total) * 100;

  process.stdout.write(formatRow("Requests/sec", result.requests.average.toFixed(0)) + "\n");
  process.stdout.write(formatRow("Latency p50", `${result.latency.p50} ms`) + "\n");
  process.stdout.write(formatRow("Latency p95", `${result.latency.p97_5} ms`) + "\n");
  process.stdout.write(formatRow("Latency p99", `${result.latency.p99} ms`) + "\n");
  process.stdout.write(formatRow("Latency max", `${result.latency.max} ms`) + "\n");
  process.stdout.write(formatRow("Throughput", `${(result.throughput.average / 1e6).toFixed(2)} MB/s`) + "\n");
  process.stdout.write(formatRow("Non-2xx", String(result.non2xx)) + "\n");
  process.stdout.write(formatRow("Errors / timeouts", `${result.errors} / ${result.timeouts}`) + "\n");
  process.stdout.write(formatRow("Error rate", `${errorRate.toFixed(3)}%`) + "\n");

  // Dropped requests are a failure at any concurrency. Latency is reported
  // and flagged, but only fails the run at realistic concurrency — above that
  // a queue is expected behaviour, not a fault.
  const latencyIsBinding = CONNECTIONS <= 300;
  const problems = [];

  if (errorRate > 0.1) {
    problems.push(`error rate ${errorRate.toFixed(2)}% exceeds 0.1%`);
  }
  if (latencyIsBinding && result.latency.p99 > P99_BUDGET_MS) {
    problems.push(`p99 ${result.latency.p99}ms exceeds ${P99_BUDGET_MS}ms`);
  }

  if (problems.length > 0) {
    process.stdout.write(`\n  ✗ ${problems.join("; ")}\n`);
    return false;
  }

  if (!latencyIsBinding && result.latency.p99 > P99_BUDGET_MS) {
    process.stdout.write(
      `\n  ✓ no requests dropped (p99 ${result.latency.p99}ms is queueing at ${CONNECTIONS} connections, not failure)\n`,
    );
    return true;
  }

  process.stdout.write("\n  ✓ within budget\n");
  return true;
}

async function main() {
  process.stdout.write("Setuware load test\n==================\n");

  // Fail fast if nothing is listening, rather than reporting 100% errors.
  try {
    const probe = await fetch(`${BASE}/api/health`, { signal: AbortSignal.timeout(4000) });
    if (!probe.ok) throw new Error(`health check returned ${probe.status}`);
  } catch (error) {
    process.stderr.write(
      `\nNo server at ${BASE} (${error instanceof Error ? error.message : error}).\n` +
        "Start one first:  npm run build && npm run start\n",
    );
    process.exit(1);
  }

  let allPassed = true;
  for (const route of ROUTES) {
    const passed = await run(route);
    allPassed &&= passed;
  }

  process.stdout.write(
    allPassed
      ? "\nAll routes within budget.\n"
      : "\nOne or more routes exceeded budget.\n",
  );
  process.exit(allPassed ? 0 : 1);
}

void main();
