#!/usr/bin/env bash
# Production deploy for the pm2 setup on the Oracle VM. GitHub Actions runs
# this after it has fetched the new commit and the checks (types, lint, tests)
# have passed, so the server only installs what changed, builds and restarts.
#
#   bash deploy/deploy-pm2.sh          (from /home/ubuntu/setuware-technologies)
set -euo pipefail

APP_DIR="${APP_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
PM2_NAME="${PM2_NAME:-setuware}"
PORT="${PORT:-3000}"
cd "$APP_DIR"

# Non-interactive SSH shells may not have nvm's node on PATH.
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
# shellcheck disable=SC1091
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

started=$(date +%s)
commit="$(git log -1 --format='%h %s' | cut -c1-120)"
# Deploy result to the Slack #site-alerts channel (silent when Slack is not set up).
slack() { node scripts/slack.mjs post alerts "$1" >/dev/null 2>&1 || true; }
trap 'status=$?; [ "$status" -ne 0 ] && slack ":x: *Deploy failed* on setuware.in at \`${commit}\` (exit ${status}). Check: pm2 logs ${PM2_NAME}"' EXIT
step() { echo "[$(( $(date +%s) - started ))s] $*"; }

echo "=================================="
echo "Starting Setuware deployment ($(git rev-parse --short HEAD))"
echo "=================================="

# 1. Dependencies: only when package-lock.json changed (saves ~3 minutes).
lock_hash=$(sha256sum package-lock.json | cut -d' ' -f1)
mkdir -p .deploy
if [ ! -d node_modules ] || [ "$(cat .deploy/lock-hash 2>/dev/null || true)" != "$lock_hash" ]; then
  step "Installing dependencies (package-lock.json changed)"
  npm ci --no-audit --no-fund --prefer-offline
  echo "$lock_hash" > .deploy/lock-hash
else
  step "Dependencies unchanged, skipping install"
fi

# 2. Build. Types were already checked in GitHub Actions; .next/cache is kept
#    between builds so unchanged code compiles faster.
step "Building"
SKIP_BUILD_TYPECHECK=1 NODE_OPTIONS="--max-old-space-size=${BUILD_MEMORY_MB:-1536}" npm run build

# 3. Restart (start it the first time) and save the process list.
step "Restarting"
pm2 restart "$PM2_NAME" --update-env || pm2 start npm --name "$PM2_NAME" -- start
pm2 save >/dev/null

# 4. Health check.
for _ in $(seq 1 20); do
  if curl -fsS "http://127.0.0.1:${PORT}/api/health" >/dev/null 2>&1; then
    step "Healthy"
    slack ":rocket: *Deployed* to https://setuware.in in $(( $(date +%s) - started ))s: \`${commit}\`"
    echo "=================================="
    echo "Setuware deployment successful!"
    echo "=================================="
    exit 0
  fi
  sleep 1
done
echo "Site did not answer /api/health after the restart; check: pm2 logs ${PM2_NAME}" >&2
exit 1
