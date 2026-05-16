#!/usr/bin/env bash
set -euo pipefail

BUILD_DIR=${1:-build}
UI_DIR=${2:-ui}
OUT_DIR=${3:-dist}

echo "Packaging for Unix: build=$BUILD_DIR ui=$UI_DIR out=$OUT_DIR"

mkdir -p "$OUT_DIR"

STAMP=$(date +%Y%m%d%H%M)
PKG_NAME="async-task-scheduler-${STAMP}.tar.gz"

tmpstaging=$(mktemp -d)
trap "rm -rf $tmpstaging" EXIT

# Copy binaries
if [ -d "$BUILD_DIR/Release" ]; then
  cp -r "$BUILD_DIR/Release"/* "$tmpstaging/" || true
else
  cp -r "$BUILD_DIR"/* "$tmpstaging/" || true
fi

# Copy UI
if [ -d "$UI_DIR/client/build" ]; then
  mkdir -p "$tmpstaging/ui"
  cp -r "$UI_DIR/client/build"/* "$tmpstaging/ui/"
fi

tar -czf "$OUT_DIR/$PKG_NAME" -C "$tmpstaging" .

echo "Created: $OUT_DIR/$PKG_NAME"
