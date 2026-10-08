#!/usr/bin/env bash
# One-off (re-run a few times a year): builds the Malaysia basemap and uploads it with its
# fonts and sprites to R2. Needs the `pmtiles` CLI (github.com/protomaps/go-pmtiles) and git.
set -euo pipefail

BUILD="${PROTOMAPS_BUILD:-$(date -u -v-1d +%Y%m%d 2>/dev/null || date -u -d yesterday +%Y%m%d)}"
WORK="${WORK_DIR:-$(mktemp -d)}"
HERE="$(cd "$(dirname "$0")" && pwd)"

echo "Extracting Malaysia (z0-14) from Protomaps build $BUILD into $WORK"
pmtiles extract "https://build.protomaps.com/$BUILD.pmtiles" "$WORK/malaysia.pmtiles" \
  --bbox=99.6,0.85,119.3,7.4 --maxzoom=14

if [ ! -d "$WORK/basemaps-assets" ]; then
  git clone -q --depth 1 --filter=blob:none --sparse https://github.com/protomaps/basemaps-assets.git "$WORK/basemaps-assets"
  (cd "$WORK/basemaps-assets" && git sparse-checkout set "fonts/Noto Sans Regular" "fonts/Noto Sans Medium" "fonts/Noto Sans Italic" sprites/v4)
fi

ASSETS_DIR="$WORK/basemaps-assets" TILES_FILE="$WORK/malaysia.pmtiles" pnpm tsx "$HERE/upload-tiles.ts"
