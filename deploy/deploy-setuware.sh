#!/usr/bin/env bash
#
# Zero-downtime deploy for the Setuware Technologies website on an Ubuntu
# server (Oracle Cloud). Run by GitHub Actions (.github/workflows/deploy.yml)
# over SSH as:  bash /home/ubuntu/deploy-setuware.sh
#
# Layout:
#   /home/ubuntu/setuware/repo          git clone of setuware/setuware-technologies
#   /home/ubuntu/setuware/releases/<sha> one built copy per deploy
#   /home/ubuntu/setuware/current        symlink → the live release
#   /etc/setuware.env                    secrets and settings (see setuware.env.example)
#
# Each deploy builds a fresh release next to the live one, switches the
# symlink only after the build succeeds, restarts the service and checks
# /api/health. If the health check fails it switches back automatically.

set -Eeuo pipefail

BASE=/home/ubuntu/setuware
REPO="$BASE/repo"
RELEASES="$BASE/releases"
CURRENT="$BASE/current"
BRANCH=main
SERVICE=setuware
ENV_FILE=/etc/setuware.env
KEEP=3
HEALTH_URL=http://127.0.0.1:3000/api/health

log() { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }

mkdir -p "$RELEASES"

log "Fetching latest $BRANCH"
if [ ! -d "$REPO/.git" ]; then
  git clone --branch "$BRANCH" https://github.com/setuware/setuware-technologies.git "$REPO"
fi
git -C "$REPO" fetch --prune origin "$BRANCH"
git -C "$REPO" reset --hard "origin/$BRANCH"
SHA=$(git -C "$REPO" rev-parse --short HEAD)
RELEASE="$RELEASES/$SHA"

if [ -L "$CURRENT" ] && [ "$(readlink -f "$CURRENT")" = "$(readlink -f "$RELEASE" 2>/dev/null || true)" ]; then
  log "Release $SHA is already live — restarting only"
  sudo systemctl restart "$SERVICE"
  exit 0
fi

log "Preparing release $SHA"
rm -rf "$RELEASE"
git -C "$REPO" worktree prune
git -C "$REPO" archive --format=tar HEAD | (mkdir -p "$RELEASE" && tar -x -C "$RELEASE")

cd "$RELEASE"

# NEXT_PUBLIC_* values are inlined at build time, so load the env file first.
if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$ENV_FILE"
  set +a
fi
export NEXT_PUBLIC_BUILD_ID="$SHA"
export NEXT_TELEMETRY_DISABLED=1

log "Installing dependencies"
npm ci --no-audit --no-fund

log "Building"
NODE_OPTIONS="--max-old-space-size=${BUILD_MEMORY_MB:-1536}" npm run build

PREVIOUS=$(readlink -f "$CURRENT" 2>/dev/null || true)

log "Switching to $SHA"
ln -sfn "$RELEASE" "$CURRENT.tmp"
mv -Tf "$CURRENT.tmp" "$CURRENT"
sudo systemctl restart "$SERVICE"

log "Health check"
for attempt in $(seq 1 30); do
  if curl -fsS --max-time 3 "$HEALTH_URL" >/dev/null; then
    log "Live: $SHA"
    break
  fi
  if [ "$attempt" -eq 30 ]; then
    echo "Health check failed for $SHA" >&2
    sudo journalctl -u "$SERVICE" -n 60 --no-pager >&2 || true
    if [ -n "$PREVIOUS" ] && [ -d "$PREVIOUS" ]; then
      log "Rolling back to $(basename "$PREVIOUS")"
      ln -sfn "$PREVIOUS" "$CURRENT.tmp"
      mv -Tf "$CURRENT.tmp" "$CURRENT"
      sudo systemctl restart "$SERVICE"
    fi
    exit 1
  fi
  sleep 2
done

log "Pruning old releases (keeping $KEEP)"
ls -1dt "$RELEASES"/*/ | tail -n +$((KEEP + 1)) | xargs -r rm -rf

log "Done"
