#!/usr/bin/env bash
# Runs every Playwright e2e target inside the official Playwright image on linux/arm64, the same
# platform CI uses (ubuntu-24.04-arm), so screenshots match pixel for pixel. arm64 rather than
# amd64: under QEMU emulation on Apple silicon, Chromium computes NaN contrast ratios in axe, so
# amd64 baselines cannot be made on the machines most contributors use. Extra arguments go to `playwright test`,
# e.g. `scripts/playwright-docker.sh --update-snapshots`. Baselines (__screenshots__) are copied
# back into this checkout; nothing else is written. A failed run also copies back the image Playwright
# wrote for a test that had no baseline yet, and baselines of removed tests are not deleted: review
# __screenshots__ in `git status` before committing.
set -euo pipefail

IMAGE="mcr.microsoft.com/playwright:v1.64.1-noble"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

docker run --rm --platform linux/arm64 --ipc=host \
  -v "$ROOT":/src -v nib-pnpm-store:/pnpm-store -w /work "$IMAGE" \
  bash -c '
    set -uo pipefail
    # Copy the source without host node_modules (macOS binaries) or build output.
    tar -C /src --exclude="./.git" --exclude="node_modules" --exclude="./.nx/cache" \
      --exclude="./.nx/workspace-data" --exclude="dist" -cf - . | tar -xf -
    corepack enable >/dev/null
    pnpm config set store-dir /pnpm-store >/dev/null
    CI=true pnpm install --frozen-lockfile >/dev/null || exit 1
    NX_DAEMON=false NX_NO_CLOUD=true pnpm nx run-many -t e2e --skip-nx-cache --output-style=static -- "$@"
    status=$?
    find . -name node_modules -prune -o -type d -name __screenshots__ -print | tar -cf - -T - | tar -C /src -xf -
    # The container runs as root; give copied baselines to the checkout owner (matters on Linux hosts).
    find /src -name node_modules -prune -o -type d -name __screenshots__ -exec chown -R --reference=/src {} +
    exit $status
  ' bash "$@"
