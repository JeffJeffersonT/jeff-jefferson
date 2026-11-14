#!/usr/bin/env bash
# Publish a blog post: optimize images, validate with a local build,
# then commit, push, and wait for GitHub Pages (unless --dry-run).
set -euo pipefail
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "node is required" >&2
  exit 1
fi

if [[ ! -d node_modules/sharp ]]; then
  echo "Installing dependencies first (sharp is required for image optimization)..."
  npm install
fi

exec node scripts/post.mjs "$@"
