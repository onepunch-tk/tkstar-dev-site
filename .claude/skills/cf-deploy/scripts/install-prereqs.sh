#!/bin/bash
# install-prereqs.sh — Resolve missing wrangler devDependency and cf:typegen
# script automatically using the project's detected package manager.
#
# Idempotent: re-running after both prereqs exist is a no-op. Reads detector
# output via stdin or by re-invoking detect-project.sh.
#
# Usage:
#   .claude/skills/cf-deploy/scripts/install-prereqs.sh \
#     [--cwd <subdir>] [--dry-run]
#
# What it does (in order):
#   1. Run detect-project.sh
#   2. If has_wrangler_dep == false: install wrangler as devDep via the
#      detected package manager
#   3. If has_cf_typegen == false: add `"cf:typegen": "wrangler types"` to
#      package.json scripts (via jq, preserving formatting)
#
# Exit codes:
#   0 — both prereqs present (or successfully installed)
#   1 — install failed (network, permission, or missing pm binary)
#   2 — package.json missing in target directory

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${CLAUDE_PROJECT_DIR:-$PWD}"
CWD="."
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --cwd) CWD="$2"; shift 2 ;;
    --dry-run) DRY_RUN=true; shift ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

TARGET_DIR="$PROJECT_ROOT"
[[ "$CWD" != "." ]] && TARGET_DIR="$PROJECT_ROOT/$CWD"

if [[ ! -f "$TARGET_DIR/package.json" ]]; then
  echo "[install-prereqs] no package.json at $TARGET_DIR — aborting." >&2
  exit 2
fi

INFO=$("$SCRIPT_DIR/detect-project.sh" --cwd "$CWD" --root "$PROJECT_ROOT")
PM=$(jq -r '.package_manager' <<<"$INFO")
HAS_WRANGLER_DEP=$(jq -r '.has_wrangler_dep' <<<"$INFO")
HAS_CF_TYPEGEN=$(jq -r '.has_cf_typegen' <<<"$INFO")

run() {
  if [[ "$DRY_RUN" == "true" ]]; then
    echo "+ $*"
  else
    echo "+ $*"
    "$@"
  fi
}

# 1) wrangler devDep
if [[ "$HAS_WRANGLER_DEP" == "true" ]]; then
  echo "[install-prereqs] wrangler already in devDependencies — skip"
else
  echo "[install-prereqs] installing wrangler as devDependency via $PM..."
  pushd "$TARGET_DIR" >/dev/null
  case "$PM" in
    bun)  run bun add -d wrangler ;;
    pnpm) run pnpm add -D wrangler ;;
    yarn) run yarn add -D wrangler ;;
    npm)  run npm install -D wrangler ;;
    *)    echo "[install-prereqs] unknown package manager: $PM" >&2; popd >/dev/null; exit 1 ;;
  esac
  status=$?
  popd >/dev/null
  if [[ $status -ne 0 ]]; then
    echo "[install-prereqs] wrangler install failed (exit $status)" >&2
    exit 1
  fi
fi

# 2) cf:typegen script — add via jq so we preserve all other fields and the
# user's formatting choices (we only touch the .scripts object).
if [[ "$HAS_CF_TYPEGEN" == "true" ]]; then
  echo "[install-prereqs] cf:typegen script already present — skip"
else
  echo "[install-prereqs] adding scripts.cf:typegen = 'wrangler types'..."
  PKG="$TARGET_DIR/package.json"
  if [[ "$DRY_RUN" == "true" ]]; then
    echo "+ jq '.scripts[\"cf:typegen\"] = \"wrangler types\"' $PKG"
  else
    TMP=$(mktemp)
    if jq '.scripts["cf:typegen"] = "wrangler types"' "$PKG" > "$TMP"; then
      mv "$TMP" "$PKG"
      echo "[install-prereqs] updated $PKG"
    else
      rm -f "$TMP"
      echo "[install-prereqs] failed to patch package.json" >&2
      exit 1
    fi
  fi
fi

echo "[install-prereqs] done. Re-run detect-project.sh to verify."
